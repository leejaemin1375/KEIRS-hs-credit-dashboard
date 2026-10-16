// v8 SVG 차트 모음 — E = React.createElement 를 받아 그린다
(function () {
  const MONO = "'JetBrains Mono', monospace";
  const NAVY = '#063a74', GRID = '#e3e6e8', SUB = '#41474d', SOFT = '#5b6167', INK = '#1e2124', ORANGE = '#b5651d', MUTE = '#9aa3ad';
  const fmt = (v, d) => v == null || !isFinite(v) ? '—' : Number(v).toLocaleString('ko-KR', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  const sgn = (v, d) => v == null || !isFinite(v) ? '—' : (v >= 0 ? '+' : '−') + fmt(Math.abs(v), d);
  function ticks(lo, hi, n) {
    const span = (hi - lo) || Math.abs(hi) || 1, raw = span / (n || 4), mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const st = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw * 0.999) || raw;
    const a = Math.floor(lo / st + 1e-9) * st, b = Math.ceil(hi / st - 1e-9) * st, t = [];
    for (let x = a; x <= b + st / 2; x += st) t.push(+x.toFixed(6));
    return { t, d: st >= 1 ? 0 : st >= 0.1 ? 1 : 2 };
  }
  const svg = (E, W, H, kids) => E('svg', { viewBox: '0 0 ' + W + ' ' + H, style: { width: '100%', height: 'auto', display: 'block' } }, kids);
  const tx = (E, key, x, y, s, o) => E('text', Object.assign({ key, x, y, fontSize: 12, fill: SUB }, o || {}), s);
  const cut = (s, n) => s && s.length > n ? s.slice(0, n - 1) + '…' : s;

  function line(E, o) {
    const W = o.W || 680, H = o.H || 250, L = 56, R = 20, T = 42, B = H - 28;
    const pts = o.pts, vals = pts.map(p => p.v).filter(v => v != null && isFinite(v));
    if (!vals.length) return null;
    let lo = Math.min(...vals), hi = Math.max(...vals);
    const pad = (hi - lo) * 0.25 || Math.abs(hi) * 0.1 || 1;
    const tk = ticks(Math.max(0, lo - pad), hi + pad, 4); lo = tk.t[0]; hi = tk.t[tk.t.length - 1];
    const n = pts.length, X = i => n === 1 ? (L + W - R) / 2 : L + 18 + i * ((W - R - L - 36) / (n - 1)), Y = v => B - (v - lo) / ((hi - lo) || 1) * (B - T);
    const col = o.color || NAVY, k = [];
    tk.t.forEach((t, i) => { k.push(E('line', { key: 'g' + i, x1: L, x2: W - R, y1: Y(t), y2: Y(t), stroke: GRID })); k.push(tx(E, 'gt' + i, L - 8, Y(t) + 4, fmt(t, tk.d), { textAnchor: 'end', fontSize: 12, fontFamily: MONO, fill: SOFT })); });
    (o.marks || []).forEach((m, j) => {
      const x = m.i > 0 ? (X(m.i - 1) + X(m.i)) / 2 : X(0) - 10, y0 = 13 + (j % 2) * 14, end = x > W - 180;
      k.push(E('line', { key: 'm' + j, x1: x, x2: x, y1: y0 + 4, y2: B, stroke: m.color || '#3fa654', strokeWidth: 1.4, strokeDasharray: '4 3' }));
      k.push(tx(E, 'mt' + j, end ? x - 4 : x + 4, y0, m.text, { fontSize: 11.5, fontWeight: 700, fill: m.color || '#228738', textAnchor: end ? 'end' : 'start' }));
    });
    let d = '', pen = false;
    pts.forEach((p, i) => { if (p.v == null || !isFinite(p.v)) { pen = false; return; } d += (pen ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p.v).toFixed(1) + ' '; pen = true; });
    k.push(E('path', { key: 'ln', d, fill: 'none', stroke: col, strokeWidth: 2.4 }));
    pts.forEach((p, i) => {
      k.push(tx(E, 'x' + i, X(i), B + 18, p.label, { textAnchor: 'middle', fontSize: 12, fontFamily: MONO, fill: p.hl ? INK : SOFT, fontWeight: p.hl ? 700 : 400 }));
      if (p.v == null || !isFinite(p.v)) return;
      k.push(E('circle', { key: 'c' + i, cx: X(i), cy: Y(p.v), r: p.hl ? 5 : 3.6, fill: '#ffffff', stroke: col, strokeWidth: 2 }));
      if (n <= 12) k.push(tx(E, 'v' + i, X(i), Y(p.v) - 9, fmt(p.v, o.d), { textAnchor: 'middle', fontSize: 12, fontFamily: MONO, fill: INK, fontWeight: 700, stroke: '#ffffff', strokeWidth: 3, paintOrder: 'stroke' }));
    });
    k.push(E('line', { key: 'base', x1: L, x2: W - R, y1: B, y2: B, stroke: MUTE }));
    return svg(E, W, H, k);
  }

  function dumbbell(E, o) {
    const rows = o.rows, W = o.W || 620, L = 92, R = 196, rh = 27, T = 26, H = T + rows.length * rh + 4;
    const max = Math.max(1e-9, ...rows.map(r => Math.max(r.a || 0, r.b || 0))) * 1.06, X = v => L + ((v || 0) / max) * (W - L - R), k = [];
    k.push(E('circle', { key: 'la', cx: L + 5, cy: 9, r: 5, fill: '#b1b8be' }), tx(E, 'lat', L + 14, 13, o.aName, { fontSize: 11.5 }), E('circle', { key: 'lb', cx: L + 90, cy: 9, r: 5, fill: NAVY }), tx(E, 'lbt', L + 99, 13, o.bName, { fontSize: 11.5 }));
    rows.forEach((r, i) => {
      const y = T + i * rh + rh / 2, diff = (r.b || 0) - (r.a || 0), up = diff >= 0;
      k.push(E('g', { key: 'r' + i, onClick: r.onClick, style: { cursor: r.onClick ? 'pointer' : 'default' } },
        E('rect', { x: 0, y: y - rh / 2 + 1, width: W, height: rh - 2, fill: r.hl ? '#eef3f9' : 'transparent' }),
        E('text', { x: L - 10, y: y + 4, textAnchor: 'end', fontSize: 12.5, fontWeight: r.hl ? 700 : 500, fill: INK }, r.label),
        E('line', { x1: L, x2: W - R, y1: y, y2: y, stroke: GRID }),
        E('line', { x1: X(r.a), x2: X(r.b), y1: y, y2: y, stroke: up ? NAVY : ORANGE, strokeWidth: 3 }),
        E('circle', { cx: X(r.a), cy: y, r: 5, fill: '#b1b8be' }),
        E('circle', { cx: X(r.b), cy: y, r: 5.5, fill: NAVY }),
        E('text', { x: W - R + 10, y: y + 4, fontSize: 11.5, fontFamily: MONO, fill: SUB }, fmt(r.a, o.d) + ' → ' + fmt(r.b, o.d)),
        E('text', { x: W - 4, y: y + 4, textAnchor: 'end', fontSize: 11.5, fontFamily: MONO, fontWeight: 700, fill: up ? NAVY : ORANGE }, sgn(diff, o.d))));
    });
    return svg(E, W, H, k);
  }

  function diverging(E, o) {
    const W = o.W || 720, L = 140, R = 250, rh = 23, k = [];
    const all = o.up.concat(o.down), max = Math.max(1, ...all.map(r => Math.abs(r.v)));
    const mid = L + (W - L - R) / 2, half = (W - L - R) / 2 - 4, X = v => mid + v / max * half;
    let y = 2; const y0 = 22;
    const sec = (title, rows, col, key) => {
      k.push(tx(E, 'h' + key, 0, y + 14, title, { fontSize: 12.5, fontWeight: 700, fill: col })); y += 22;
      if (!rows.length) { k.push(tx(E, 'e' + key, L, y + 14, '해당 조건의 과목이 없습니다', { fontSize: 12, fill: SOFT })); y += rh; }
      rows.forEach((r, i) => {
        const cy = y + rh / 2;
        k.push(E('g', { key: key + i, onClick: r.onClick, style: { cursor: 'pointer' } },
          E('rect', { x: 0, y: y + 1, width: W, height: rh - 2, fill: r.hl ? '#eef3f9' : 'transparent' }),
          E('text', { x: L - 10, y: cy + 4, textAnchor: 'end', fontSize: 12, fill: INK, fontWeight: r.hl ? 700 : 400 }, cut(r.label, 12), E('title', null, r.full || r.label)),
          E('rect', { x: Math.min(mid, X(r.v)), y: cy - 6, width: Math.max(1.5, Math.abs(X(r.v) - mid)), height: 12, fill: r.v >= 0 ? NAVY : ORANGE }),
          E('text', { x: W - R + 10, y: cy + 4, fontSize: 11.5, fontFamily: MONO, fill: SUB }, r.txt)));
        y += rh;
      });
      y += 8;
    };
    sec(o.upTitle, o.up, NAVY, 'u'); sec(o.downTitle, o.down, ORANGE, 'd');
    k.unshift(E('line', { key: 'zero', x1: mid, x2: mid, y1: y0, y2: y - 8, stroke: MUTE }));
    return svg(E, W, y, k);
  }

  function stackCols(E, o) {
    const cols = o.cols, W = o.W || 600, H = o.H || 240, L = 44, R = 10, T = 22, B = H - 28, k = [];
    const tot = cols.map(c => c.parts.reduce((a, b) => a + (b || 0), 0));
    const tk = ticks(0, (Math.max(...tot) || 1) * 1.12, 4), hi = tk.t[tk.t.length - 1];
    const Y = v => B - v / hi * (B - T), slot = (W - L - R) / Math.max(1, cols.length), bw = Math.min(64, slot * 0.56);
    tk.t.forEach((t, i) => { k.push(E('line', { key: 'g' + i, x1: L, x2: W - R, y1: Y(t), y2: Y(t), stroke: GRID })); k.push(tx(E, 'gt' + i, L - 8, Y(t) + 4, fmt(t, tk.d), { textAnchor: 'end', fontSize: 12, fontFamily: MONO, fill: SOFT })); });
    cols.forEach((c, i) => {
      const x = L + slot * i + (slot - bw) / 2; let acc = 0;
      c.parts.forEach((p, j) => {
        if (!(p > 0)) return;
        const y1 = Y(acc + p), y0 = Y(acc);
        k.push(E('rect', { key: 's' + i + '-' + j, x, y: y1, width: bw, height: Math.max(0, y0 - y1 - 0.5), fill: o.colors[j] }));
        if (y0 - y1 >= 15) k.push(tx(E, 'sv' + i + '-' + j, x + bw / 2, (y0 + y1) / 2 + 4, fmt(p, o.d), { textAnchor: 'middle', fontSize: 11.5, fontFamily: MONO, fill: (o.textColors || [])[j] || INK }));
        acc += p;
      });
      k.push(tx(E, 'tt' + i, x + bw / 2, Y(acc) - 6, fmt(acc, o.d), { textAnchor: 'middle', fontSize: 12, fontWeight: 700, fontFamily: MONO, fill: INK }));
      k.push(tx(E, 'xl' + i, x + bw / 2, B + 18, c.label, { textAnchor: 'middle', fontSize: 11.5, fill: SUB }));
    });
    k.push(E('line', { key: 'base', x1: L, x2: W - R, y1: B, y2: B, stroke: MUTE }));
    return svg(E, W, H, k);
  }

  function stack100H(E, o) {
    const rows = o.rows, W = o.W || 600, L = 64, R = 8, rh = 28, H = rows.length * rh + 4, k = [];
    rows.forEach((r, i) => {
      const y = i * rh + 4; let acc = 0;
      k.push(tx(E, 'l' + i, L - 8, y + rh / 2 + 2, r.label, { textAnchor: 'end', fontSize: 12, fill: INK }));
      r.parts.forEach((p, j) => {
        p = p || 0; const x = L + acc * (W - L - R), w = p * (W - L - R);
        k.push(E('rect', { key: 'r' + i + '-' + j, x, y, width: Math.max(0, w - 1), height: rh - 8, fill: o.colors[j] }));
        if (p >= 0.07) k.push(tx(E, 't' + i + '-' + j, x + w / 2, y + rh / 2 + 1, Math.round(p * 100) + '%', { textAnchor: 'middle', fontSize: 12, fontFamily: MONO, fill: (o.textColors || [])[j] || INK }));
        acc += p;
      });
    });
    return svg(E, W, H, k);
  }

  function stackH(E, o) {
    const rows = o.rows, W = o.W || 600, L = o.L || 96, R = o.R || 170, rh = o.rh || 24, T = 2, H = rows.length * rh + T + 18, k = [];
    const max = Math.max(1e-9, ...rows.map(r => Math.max(r.parts.reduce((a, b) => a + (b || 0), 0), r.marker || 0))) * 1.04;
    const X = v => L + v / max * (W - L - R), tk = ticks(0, max, 4);
    tk.t.filter(t => t <= max).forEach((t, i) => { k.push(E('line', { key: 'g' + i, x1: X(t), x2: X(t), y1: T, y2: T + rows.length * rh, stroke: GRID })); k.push(tx(E, 'gt' + i, X(t), T + rows.length * rh + 13, fmt(t, tk.d), { textAnchor: 'middle', fontSize: 11.5, fontFamily: MONO, fill: SOFT })); });
    rows.forEach((r, i) => {
      const y = T + i * rh; let acc = 0;
      const kids = [E('rect', { key: 'bg', x: 0, y, width: W, height: rh, fill: r.hl ? '#eef3f9' : 'transparent' }),
        E('text', { key: 'l', x: L - 8, y: y + rh / 2 + 4, textAnchor: 'end', fontSize: o.fs || 12, fill: INK, fontWeight: r.bold || r.hl ? 700 : 400, fontFamily: o.monoLabel ? MONO : undefined }, r.label)];
      r.parts.forEach((p, j) => { if (!(p > 0)) return; kids.push(E('rect', { key: 'p' + j, x: X(acc), y: y + 4, width: Math.max(0, X(acc + p) - X(acc) - 1), height: rh - 8, fill: o.colors[j] })); acc += p; });
      if (r.marker != null && isFinite(r.marker)) kids.push(E('line', { key: 'mk', x1: X(r.marker), x2: X(r.marker), y1: y + 1, y2: y + rh - 1, stroke: INK, strokeWidth: 2 }));
      kids.push(E('text', { key: 't', x: W - R + 8, y: y + rh / 2 + 4, fontSize: 11.5, fontFamily: MONO, fill: SUB }, r.txt));
      k.push(E('g', { key: 'r' + i, onClick: r.onClick, style: { cursor: r.onClick ? 'pointer' : 'default' } }, kids));
    });
    return svg(E, W, H, k);
  }

  function dots(E, o) {
    const g = o.groups, W = o.W || 640, L = 84, R = 236, rh = 36, T = 6, H = T + g.length * rh + 20, k = [];
    const max = Math.max(1, ...g.map(x => Math.max(x.ref || 0, ...x.pts))) * 1.06, tk = ticks(0, max, 5), hi = tk.t[tk.t.length - 1], X = v => L + v / hi * (W - L - R);
    tk.t.forEach((t, i) => { k.push(E('line', { key: 'g' + i, x1: X(t), x2: X(t), y1: T, y2: T + g.length * rh, stroke: GRID })); k.push(tx(E, 'gt' + i, X(t), T + g.length * rh + 14, fmt(t, 0) + (i === tk.t.length - 1 ? 'h' : ''), { textAnchor: 'middle', fontSize: 11.5, fontFamily: MONO, fill: SOFT })); });
    g.forEach((x, i) => {
      const y = T + i * rh + rh / 2;
      k.push(tx(E, 'l' + i, L - 8, y + 4, x.label, { textAnchor: 'end', fontSize: 12.5, fontWeight: 700, fill: INK }));
      k.push(E('line', { key: 'b' + i, x1: L, x2: W - R, y1: y, y2: y, stroke: '#cdd1d5' }));
      x.pts.forEach((v, j) => k.push(E('circle', { key: 'd' + i + '-' + j, cx: X(v), cy: y + ((j * 7919) % 15) - 7, r: 3.6, fill: ORANGE, fillOpacity: 0.5 })));
      if (x.ref != null) k.push(E('line', { key: 'rf' + i, x1: X(x.ref), x2: X(x.ref), y1: y - 14, y2: y + 14, stroke: NAVY, strokeWidth: 2.5 }));
      k.push(tx(E, 's' + i, W - R + 10, y + 4, x.sub, { fontSize: 11.5, fontFamily: MONO }));
    });
    return svg(E, W, H, k);
  }

  function dumbRef(E, o) {
    const rows = o.rows, W = o.W || 620, L = 100, R = 236, rh = 36, H = rows.length * rh + 22, k = [];
    const max = Math.max(1, ...rows.map(r => Math.max(r.v || 0, r.ref || 0))) * 1.12, tk = ticks(0, max, 5), hi = tk.t[tk.t.length - 1], X = v => L + (v || 0) / hi * (W - L - R);
    tk.t.forEach((t, i) => { k.push(E('line', { key: 'g' + i, x1: X(t), x2: X(t), y1: 0, y2: rows.length * rh, stroke: GRID })); k.push(tx(E, 'gt' + i, X(t), rows.length * rh + 14, fmt(t, 0) + (i === tk.t.length - 1 ? 'h' : ''), { textAnchor: 'middle', fontSize: 11.5, fontFamily: MONO, fill: SOFT })); });
    rows.forEach((r, i) => {
      const y = i * rh + rh / 2, over = (r.v || 0) > (r.ref || 0);
      k.push(tx(E, 'l' + i, L - 8, y, r.label, { textAnchor: 'end', fontSize: 12.5, fontWeight: 700, fill: INK }));
      k.push(tx(E, 'ls' + i, L - 8, y + 13, r.sub, { textAnchor: 'end', fontSize: 11.5, fontFamily: MONO, fill: SOFT }));
      k.push(E('line', { key: 'c' + i, x1: X(r.ref), x2: X(r.v), y1: y, y2: y, stroke: over ? ORANGE : NAVY, strokeWidth: 3 }));
      k.push(E('circle', { key: 'r' + i, cx: X(r.ref), cy: y, r: 6, fill: '#ffffff', stroke: NAVY, strokeWidth: 2 }));
      k.push(E('circle', { key: 'v' + i, cx: X(r.v), cy: y, r: 6, fill: ORANGE }));
      k.push(tx(E, 't' + i, W - R + 10, y + 4, r.txt, { fontSize: 11.5, fontFamily: MONO }));
    });
    return svg(E, W, H, k);
  }

  function scatter(E, o) {
    const pts = o.pts, W = o.W || 560, H = o.H || 480, L = 58, R = 14, T = 14, B = H - 46, k = [];
    const xm = Math.max(5, ...pts.map(p => Math.abs(p.x))) * 1.08, ym = Math.max(0.5, ...pts.map(p => Math.abs(p.y))) * 1.12;
    const X = v => L + (v + xm) / (2 * xm) * (W - L - R), Y = v => B - (v + ym) / (2 * ym) * (B - T);
    k.push(E('rect', { key: 'q', x: X(0), y: T, width: W - R - X(0), height: Y(0) - T, fill: '#fbf1e4' }));
    const tx1 = ticks(-xm, xm, 6), ty1 = ticks(-ym, ym, 6);
    tx1.t.filter(t => Math.abs(t) <= xm).forEach((t, i) => { k.push(E('line', { key: 'gx' + i, x1: X(t), x2: X(t), y1: T, y2: B, stroke: GRID })); k.push(tx(E, 'tx' + i, X(t), B + 15, fmt(t, tx1.d), { textAnchor: 'middle', fontSize: 11.5, fontFamily: MONO, fill: SOFT })); });
    ty1.t.filter(t => Math.abs(t) <= ym).forEach((t, i) => { k.push(E('line', { key: 'gy' + i, x1: L, x2: W - R, y1: Y(t), y2: Y(t), stroke: GRID })); k.push(tx(E, 'ty' + i, L - 6, Y(t) + 4, fmt(t, ty1.d), { textAnchor: 'end', fontSize: 11.5, fontFamily: MONO, fill: SOFT })); });
    k.push(E('line', { key: 'zx', x1: X(0), x2: X(0), y1: T, y2: B, stroke: SUB, strokeWidth: 1.2 }), E('line', { key: 'zy', x1: L, x2: W - R, y1: Y(0), y2: Y(0), stroke: SUB, strokeWidth: 1.2 }));
    k.push(tx(E, 'q1', W - R - 6, T + 15, '학급↑ · 시수↑', { textAnchor: 'end', fontSize: 12, fontWeight: 700, fill: ORANGE }), tx(E, 'q2', L + 6, T + 15, '학급↓ · 시수↑', { fontSize: 12, fill: SOFT }),
      tx(E, 'q3', W - R - 6, B - 8, '학급↑ · 시수↓', { textAnchor: 'end', fontSize: 12, fill: SOFT }), tx(E, 'q4', L + 6, B - 8, '학급↓ · 시수↓', { fontSize: 12, fill: SOFT }));
    k.push(tx(E, 'xt', (L + W - R) / 2, H - 8, o.xLabel, { textAnchor: 'middle', fontSize: 12, fill: SUB }));
    k.push(E('text', { key: 'yt', x: 0, y: 0, transform: 'translate(14,' + ((T + B) / 2) + ') rotate(-90)', textAnchor: 'middle', fontSize: 12, fill: SUB }, o.yLabel));
    const anyHl = pts.some(p => p.hl);
    [...pts].sort((a, b) => ((a.hl ? 1 : 0) + (a.sel ? 2 : 0)) - ((b.hl ? 1 : 0) + (b.sel ? 2 : 0))).forEach(p => k.push(E('circle', {
      key: p.key, cx: X(p.x), cy: Y(p.y), r: p.r, fill: p.color, fillOpacity: p.hl || p.sel ? 0.92 : anyHl ? 0.25 : 0.6,
      stroke: p.sel ? INK : p.hl ? '#ffffff' : 'none', strokeWidth: p.sel ? 2.5 : 1, onClick: p.onClick, style: { cursor: 'pointer' } }, E('title', null, p.title))));
    return svg(E, W, H, k);
  }

  function bullet(E, o) {
    const rows = o.rows, W = o.W || 560, L = 168, R = 150, rh = 40, H = rows.length * rh + 2, k = [];
    rows.forEach((r, i) => {
      const y = i * rh + 4, cy = y + rh / 2 - 2, max = Math.max(r.hi || 0, r.v || 0, r.avg || 0) * 1.1 || 1, X = v => L + (v || 0) / max * (W - L - R);
      k.push(tx(E, 'l' + i, L - 10, cy + 4, r.label, { textAnchor: 'end', fontSize: 12.5, fill: INK, fontWeight: 600 }));
      k.push(E('rect', { key: 't' + i, x: L, y: cy - 8, width: W - L - R, height: 16, fill: '#f4f5f6' }));
      if (isFinite(r.lo) && isFinite(r.hi)) k.push(E('rect', { key: 'b' + i, x: X(r.lo), y: cy - 8, width: Math.max(1, X(r.hi) - X(r.lo)), height: 16, fill: '#d6dee8' }));
      if (r.v != null && isFinite(r.v)) k.push(E('rect', { key: 'v' + i, x: L, y: cy - 3, width: X(r.v) - L, height: 6, fill: '#1c589c' }));
      if (r.avg != null && isFinite(r.avg)) k.push(E('line', { key: 'a' + i, x1: X(r.avg), x2: X(r.avg), y1: cy - 12, y2: cy + 12, stroke: INK, strokeWidth: 2 }));
      k.push(tx(E, 'tv' + i, W - R + 10, cy + 1, fmt(r.v, r.d) + r.unit, { fontSize: 13, fontWeight: 700, fontFamily: MONO, fill: NAVY }));
      k.push(tx(E, 'ta' + i, W - R + 10, cy + 15, '평균 ' + fmt(r.avg, r.d) + r.unit, { fontSize: 11.5, fontFamily: MONO, fill: SOFT }));
    });
    return svg(E, W, H, k);
  }

  window.V8C = { line, dumbbell, diverging, stackCols, stack100H, stackH, dots, dumbRef, scatter, bullet, fmt };
})();
