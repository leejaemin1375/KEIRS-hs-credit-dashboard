// 경기도 시군구 단계구분도 (d3-geo + kostat 2013 TopoJSON)
// data-values: JSON  { "수원시": {"color":"#e8b0a4","label":"31.2%"} , ... }
// data-selected: 시군구명.  클릭 시 'sigungu-select' CustomEvent(detail:{name}) 를 버블링.
(function () {
  const TOPO = 'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_municipalities_topo_simple.json';

  function waitFor(test, ms) {
    return new Promise((res, rej) => {
      const t0 = Date.now();
      (function loop() {
        if (test()) return res();
        if (Date.now() - t0 > (ms || 15000)) return rej(new Error('timeout'));
        setTimeout(loop, 60);
      })();
    });
  }

  function loadFeatures() {
    if (window.__ggFeatures) return window.__ggFeatures;
    window.__ggFeatures = (async () => {
      await waitFor(() => window.d3 && window.topojson);
      const topo = await (await fetch(TOPO)).json();
      const key = Object.keys(topo.objects)[0];
      const fc = topojson.feature(topo, topo.objects[key]);
      const feats = fc.features.filter(f => String((f.properties || {}).code || '').startsWith('31'));
      feats.forEach(f => {
        const n = f.properties.name || '';
        const m = n.match(/^(.+?[시군])/);
        f.properties.parent = m ? m[1] : n;
      });
      return feats;
    })();
    return window.__ggFeatures;
  }

  class GgMap extends HTMLElement {
    static get observedAttributes() { return ['data-values', 'data-groups', 'data-selected']; }

    connectedCallback() {
      if (this._init) return;
      this._init = true;
      this.style.display = 'block';
      this.style.width = '100%';
      this.innerHTML = '<div style="padding:24px; font-size:15px; color:#5b6167">지도 데이터를 불러오는 중…</div>';
      this.build();
    }

    attributeChangedCallback(name) {
      if (name === 'data-groups') { this._groups = null; if (this._ready) this.build(); return; }
      this.paint();
    }

    groups() {
      if (!this._groups) {
        try { this._groups = JSON.parse(this.getAttribute('data-groups') || '{}'); }
        catch (e) { this._groups = {}; }
      }
      return this._groups;
    }
    groupOf(f) {
      const p = f.properties.parent;
      return this.groups()[p] || p;
    }

    async build() {
      let feats;
      try { feats = await loadFeatures(); }
      catch (e) {
        this.innerHTML = '<div style="padding:24px; font-size:15px; color:#de3412; border:1px solid #cdd1d5">지도 경계 데이터를 불러올 수 없습니다. (내부망에서는 경계 파일을 서버에 배치해 사용하십시오.)</div>';
        return;
      }
      const W = 660, H = 700;
      const fc = { type: 'FeatureCollection', features: feats };
      const proj = d3.geoMercator().fitExtent([[14, 14], [W - 14, H - 14]], fc);
      const path = d3.geoPath(proj);

      const svg = d3.select(this).html('').append('svg')
        .attr('viewBox', '0 0 ' + W + ' ' + H)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%').style('height', 'auto').style('display', 'block')
        .style('background', '#ffffff');

      this._paths = svg.append('g').selectAll('path').data(feats).join('path')
        .attr('d', path)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 0.8)
        .style('cursor', 'pointer')
        .on('click', (ev, d) => {
          this.dispatchEvent(new CustomEvent('sigungu-select', {
            detail: { name: this.groupOf(d) }, bubbles: true, composed: true
          }));
        });
      this._paths.append('title');

      // 시군구(부모) 단위 경계선 + 라벨
      const byParent = new Map();
      feats.forEach(f => {
        const p = this.groupOf(f);
        const area = path.area(f);
        if (!byParent.has(p) || byParent.get(p).area < area) byParent.set(p, { f, area });
      });
      this._outline = svg.append('g').selectAll('path').data(feats).join('path')
        .attr('d', path).attr('fill', 'none').attr('stroke', 'none').style('pointer-events', 'none');

      const labels = [...byParent.entries()].map(([name, o]) => ({ name, c: path.centroid(o.f), area: o.area }));
      const g = svg.append('g').style('pointer-events', 'none');
      this._labels = g.selectAll('text').data(labels).join('text')
        .attr('x', d => d.c[0]).attr('y', d => d.c[1])
        .attr('text-anchor', 'middle')
        .attr('font-size', d => (d.area > 2600 ? 14 : 12.5))
        .attr('font-family', '"Pretendard Variable", Pretendard, system-ui, sans-serif')
        .attr('stroke', '#ffffff').attr('stroke-width', 3).attr('paint-order', 'stroke')
        .attr('fill', '#1e2124')
        .text(d => d.name.replace(/교육지원청$/, '').replace(/[시군]$/, ''));

      this._ready = true;
      this.paint();
    }

    paint() {
      if (!this._ready) return;
      let vals = {};
      try { vals = JSON.parse(this.getAttribute('data-values') || '{}'); } catch (e) {}
      const sel = this.getAttribute('data-selected') || '';
      this._paths
        .attr('fill', d => (vals[this.groupOf(d)] || {}).color || '#eceef0')
        .attr('stroke', d => (this.groupOf(d) === sel ? '#063a74' : '#ffffff'))
        .attr('stroke-width', d => (this.groupOf(d) === sel ? 2.6 : 0.8))
        .select('title')
        .text(d => {
          const g = this.groupOf(d);
          const v = vals[g] || {};
          return g + ' (' + d.properties.parent + ')' + (v.label ? ' · ' + v.label : '');
        });
      this._paths.filter(d => this.groupOf(d) === sel).raise();
      this._labels.attr('font-weight', d => (d.name === sel ? 700 : 400));
    }
  }

  if (!customElements.get('gg-map')) customElements.define('gg-map', GgMap);
})();
