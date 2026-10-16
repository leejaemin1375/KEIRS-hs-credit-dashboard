// 차트 모음 — window.V7C(React) 로 생성
window.V7C = function (React) {
  const E = React.createElement, SV = { width: '100%', height: 'auto', display: 'block' }, BG = '#f2f2f3';
  const num = v => Math.round(v).toLocaleString('ko-KR');
  const fmt = (v, d) => d === 0 ? num(v) : Number(v).toFixed(d == null ? 1 : d);
  const sgn = (v, d, u) => (v >= 0 ? '+' : '−') + fmt(Math.abs(v), d) + (u || '');
  const svg = (W, H, kids) => E('svg', { viewBox: '0 0 ' + W + ' ' + H, style: SV }, kids);
  const T = (k, x, y, s, o) => E('text', Object.assign({ key: k, x, y, fontSize: 12, fill: '#1d1f20' }, o || {}), s);
  const empty = msg => E('div', { style: { padding: '30px 10px', textAlign: 'center', color: '#5b6167', fontSize: 13, border: '1px dashed #c9ced4' } }, msg || '해당 조건의 데이터가 없습니다');
  const GCOL = { '국어': '#2f5378', '수학': '#6f9ac4', '영어': '#b88a3e', '사회': '#6b8e5a', '과학': '#a0524b', '기타': '#8a8f96' };
  const grp = a => GCOL[a] ? a : '기타';

  function line(labels, vals, o) {
    const ok = vals.filter(x => x != null); if (!ok.length) return empty();
    const W = 640, H = 236, L = 56, R = 624, TP = 44, B = 184;
    const mn = Math.min(...ok), mx = Math.max(...ok), pad = (mx - mn) * 0.25 || Math.abs(mx) * 0.1 || 1, lo = Math.max(0, mn - pad), hi = mx + pad;
    const n = labels.length, X = i => n === 1 ? (L + R) / 2 : L + 24 + i * (R - L - 48) / (n - 1), Y = x => B - (x - lo) / (hi - lo) * (B - TP);
    const k = [];
    [0, 0.5, 1].forEach((t, i) => { const x = lo + (hi - lo) * t; k.push(E('line', { key: 'g' + i, x1: L, x2: R, y1: Y(x), y2: Y(x), stroke: '#dde1e5' }), T('gt' + i, L - 8, Y(x) + 4, fmt(x, o.d), { textAnchor: 'end', fontSize: 11, fill: '#8a8f96' })); });
    (o.notes || []).forEach((nt, i) => { const x = X(nt.idx); k.push(E('line', { key: 'nl' + i, x1: x, x2: x, y1: 8 + i * 15, y2: B, stroke: '#9aa3ad', strokeDasharray: '3 3' }), T('nt' + i, x - 5, 17 + i * 15, nt.text, { textAnchor: 'end', fontSize: 11, fill: '#5b6167' })); });
    let d = '', pen = false; vals.forEach((x, i) => { if (x == null) { pen = false; return; } d += (pen ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(x).toFixed(1); pen = true; });
    k.push(E('path', { key: 'ln', d, fill: 'none', stroke: '#2f5378', strokeWidth: 2.6 }));
    vals.forEach((x, i) => {
      k.push(T('xl' + i, X(i), B + 20, labels[i], { textAnchor: 'middle', fontWeight: 600 }));
      if (o.yoy && o.yoy[i]) k.push(T('yy' + i, X(i), B + 36, o.yoy[i], { textAnchor: 'middle', fontSize: 11, fill: o.yoy[i][0] === '−' ? '#8a5a1f' : '#2f5378' }));
      if (x == null) { k.push(T('na' + i, X(i), B - 8, '자료 없음', { textAnchor: 'middle', fontSize: 11, fill: '#8a8f96' })); return; }
      k.push(E('circle', { key: 'c' + i, cx: X(i), cy: Y(x), r: 4, fill: '#2f5378', stroke: BG, strokeWidth: 1.5 }));
      k.push(T('v' + i, X(i), Y(x) - 10, fmt(x, o.d), { textAnchor: 'middle', fontWeight: 700, stroke: BG, strokeWidth: 3, paintOrder: 'stroke' }));
    });
    return svg(W, H, k);
  }

  function diverge(up, dn) {
    const rows = up.concat(dn); if (!rows.length) return empty();
    const W = 680, L = 150, R = 520, rh = 21, TP = 24, mx = Math.max(...rows.map(r => Math.abs(r.d))), mid = (L + R) / 2, sc = (R - L) / 2 / mx;
    const k = [T('h1', mid + 4, 14, '증가 →', { fontSize: 11.5, fill: '#2f5378', fontWeight: 700 }), T('h2', mid - 4, 14, '← 감소', { textAnchor: 'end', fontSize: 11.5, fill: '#8a5a1f', fontWeight: 700 })];
    let yy = TP;
    rows.forEach((r, i) => {
      if (i === up.length && up.length) { k.push(E('line', { key: 'sp', x1: 8, x2: W - 8, y1: yy + 6, y2: yy + 6, stroke: '#c9ced4', strokeDasharray: '2 3' })); yy += 14; }
      const cy = yy + rh / 2, w = Math.abs(r.d) * sc, pos = r.d >= 0;
      k.push(T('n' + i, L - 8, cy + 4, r.name + (r.old ? ' *' : ''), { textAnchor: 'end' }));
      k.push(E('rect', { key: 'b' + i, x: pos ? mid : mid - w, y: cy - 6, width: Math.max(1, w), height: 12, fill: pos ? '#2f5378' : '#b88a3e' }));
      k.push(T('v' + i, W - 4, cy + 4, sgn(r.d, 0, '명') + ' (' + sgn(r.rate, 1, '%') + ')', { textAnchor: 'end', fontSize: 11.5, fontWeight: 700, fill: pos ? '#2f5378' : '#8a5a1f' }));
      yy += rh;
    });
    k.push(E('line', { key: 'ax', x1: mid, x2: mid, y1: TP - 4, y2: yy, stroke: '#5b6167' }));
    return svg(W, yy + 6, k);
  }

  function cols(labels, a, b) {
    const tot = a.map((x, i) => x == null ? null : x + b[i]); if (!tot.some(x => x != null)) return empty();
    const W = 560, H = 210, L = 20, R = 550, TP = 20, B = 178, mx = Math.max(...tot.filter(x => x != null)) * 1.15, n = labels.length;
    const cw = (R - L) / n, bw = Math.min(64, cw * 0.56), X = i => L + (i + 0.5) * cw, Y = v => B - v / mx * (B - TP);
    const k = [E('line', { key: 'b', x1: L, x2: R, y1: B, y2: B, stroke: '#5b6167' })];
    labels.forEach((l, i) => {
      k.push(T('l' + i, X(i), B + 18, l, { textAnchor: 'middle', fontWeight: 600 }));
      if (tot[i] == null) return;
      const ya = Y(a[i]), yt = Y(tot[i]);
      k.push(E('rect', { key: 'a' + i, x: X(i) - bw / 2, y: ya, width: bw, height: B - ya, fill: '#2f5378' }, E('title', null, '전공 ' + fmt(a[i]) + '시간')));
      k.push(E('rect', { key: 'n' + i, x: X(i) - bw / 2, y: yt, width: bw, height: Math.max(0, ya - yt), fill: '#b88a3e' }, E('title', null, '비전공 ' + fmt(b[i]) + '시간')));
      k.push(T('at' + i, X(i), ya + 16, fmt(a[i]), { textAnchor: 'middle', fontSize: 11.5, fontWeight: 700, fill: '#ffffff' }));
      if (ya - yt >= 14) k.push(T('nt' + i, X(i), (ya + yt) / 2 + 4, fmt(b[i]), { textAnchor: 'middle', fontSize: 11, fontWeight: 700, fill: '#ffffff' }));
      k.push(T('tt' + i, X(i), yt - 6, fmt(tot[i]), { textAnchor: 'middle', fontWeight: 700 }));
    });
    return svg(W, H, k);
  }

  function strip(items, avg, md, sel) {
    if (!items.length) return empty();
    const W = 460, H = 128, L = 18, R = 442, y0 = 64, xs = items.map(i => i.v).concat([avg]), mn = Math.min(...xs), mx = Math.max(...xs), pd = (mx - mn) * 0.05 || 1;
    const X = v => L + (v - mn + pd) / (mx - mn + 2 * pd) * (R - L);
    const k = [E('line', { key: 'ax', x1: L, x2: R, y1: y0, y2: y0, stroke: '#c9ced4' }), E('line', { key: 'av', x1: X(avg), x2: X(avg), y1: y0 - 28, y2: y0 + 28, stroke: '#1d1f20', strokeDasharray: '3 2' }),
      T('avt', X(avg), y0 - 34, '도 평균 ' + fmt(avg, md.d) + md.unit, { textAnchor: 'middle', fontSize: 11.5, fontWeight: 700 })];
    const s = [...items].sort((a, b) => a.v - b.v);
    s.forEach((it, i) => { const on = it.name === sel; k.push(E('circle', { key: 'd' + i, cx: X(it.v), cy: y0 + (window.V7D.r(it.name, 'jit') - 0.5) * 30, r: on ? 7 : 5, fill: on ? '#2f5378' : '#8eaac7', stroke: BG, strokeWidth: 1.2 }, E('title', null, it.name + ' ' + fmt(it.v, md.d) + md.unit))); });
    k.push(T('lo', X(s[0].v), y0 + 36, s[0].name + ' ' + fmt(s[0].v, md.d), { fontSize: 11, fill: '#41474d' }));
    k.push(T('hi', X(s[s.length - 1].v), y0 + 36, s[s.length - 1].name + ' ' + fmt(s[s.length - 1].v, md.d), { textAnchor: 'end', fontSize: 11, fill: '#41474d' }));
    k.push(T('l1', L, H - 4, '← ' + md.lo, { fontSize: 11, fill: '#8a8f96' }), T('l2', R, H - 4, md.hi + ' →', { textAnchor: 'end', fontSize: 11, fill: '#8a8f96' }));
    return svg(W, H, k);
  }

  function dots(rows) {
    if (!rows.length) return empty();
    const W = 600, rh = 58, L = 118, R = 584, TP = 6, k = [];
    rows.forEach((r, i) => {
      const ms = r.marks.filter(m => m.v != null).sort((a, b) => a.v - b.v);
      const vs = [r.min, r.max, r.avg].concat(ms.map(m => m.v)), lo = Math.min(...vs), hi = Math.max(...vs), pd = (hi - lo) * 0.06 || 1;
      const X = v => L + (v - lo + pd) / (hi - lo + 2 * pd) * (R - L), cy = TP + i * rh + 28;
      k.push(T('n' + i, L - 10, cy + 2, r.label, { textAnchor: 'end', fontSize: 12.5, fontWeight: 700 }), T('u' + i, L - 10, cy + 16, '(' + r.unit + ')', { textAnchor: 'end', fontSize: 10.5, fill: '#8a8f96' }));
      k.push(E('line', { key: 'rg' + i, x1: X(r.min), x2: X(r.max), y1: cy, y2: cy, stroke: '#d5dae0', strokeWidth: 8 }));
      k.push(E('line', { key: 'av' + i, x1: X(r.avg), x2: X(r.avg), y1: cy - 12, y2: cy + 12, stroke: '#1d1f20', strokeWidth: 2 }), T('at' + i, X(r.avg), cy - 16, '평균 ' + fmt(r.avg, r.d), { textAnchor: 'middle', fontSize: 11 }));
      ms.forEach((m, j) => { k.push(E('circle', { key: 'm' + i + j, cx: X(m.v), cy, r: 6, fill: m.color, stroke: BG, strokeWidth: 1.5 }, E('title', null, m.label + ' ' + fmt(m.v, r.d) + r.unit)), T('mt' + i + j, X(m.v), cy + 20 + (j % 2) * 11, fmt(m.v, r.d), { textAnchor: 'middle', fontSize: 10.5, fontWeight: 700, fill: m.color })); });
    });
    return svg(W, TP + rows.length * rh, k);
  }

  function teachers(ts, ref) {
    if (!ts.length) return empty();
    const W = 600, rh = 18, L = 50, R = 440, TP = 22, H = TP + ts.length * rh + 6, mx = Math.max(ref, ...ts.map(t => t.total)) * 1.06, X = v => L + v / mx * (R - L);
    const k = [E('line', { key: 'rf', x1: X(ref), x2: X(ref), y1: 14, y2: H - 2, stroke: '#1d1f20', strokeDasharray: '4 3' }), T('rft', X(ref) + 4, 12, '유사규모 학교 평균 ' + fmt(ref) + '시간', { fontSize: 11, fontWeight: 700 })];
    ts.forEach((t, i) => {
      const y = TP + i * rh;
      k.push(T('i' + i, L - 6, y + 12, t.id, { textAnchor: 'end', fontSize: 11, fill: '#41474d' }));
      k.push(E('rect', { key: 'a' + i, x: L, y: y + 3, width: Math.max(0, X(t.majorH) - L), height: 12, fill: '#2f5378' }));
      k.push(E('rect', { key: 'b' + i, x: X(t.majorH), y: y + 3, width: Math.max(0, X(t.total) - X(t.majorH)), height: 12, fill: '#b88a3e' }));
      k.push(T('t' + i, X(t.total) + 5, y + 12, fmt(t.total) + '시간 · ' + t.nSubj + '과목 · ' + t.major + ' 전공', { fontSize: 11, stroke: BG, strokeWidth: 3, paintOrder: 'stroke' }));
    });
    return svg(W, H, k);
  }

  function solo(rows) {
    const W = 660, rh = 36, L = 120, R = 440, TP = 26, mx = Math.max(...rows.map(r => Math.max(r.v, r.avg))) * 1.12, X = v => L + v / mx * (R - L);
    const k = [E('circle', { key: 'lg1', cx: L + 6, cy: 10, r: 5, fill: BG, stroke: '#1d1f20', strokeWidth: 1.5 }), T('lg1t', L + 16, 14, '동일 교과 1인 교사 경기 평균', { fontSize: 11 }),
      E('circle', { key: 'lg2', cx: L + 200, cy: 10, r: 5, fill: '#2f5378' }), T('lg2t', L + 210, 14, '이 학교 담당교사', { fontSize: 11 })];
    rows.forEach((r, i) => {
      const cy = TP + i * rh + rh / 2;
      k.push(T('n' + i, L - 10, cy, r.area, { textAnchor: 'end', fontWeight: 700 }), T('id' + i, L - 10, cy + 13, r.id, { textAnchor: 'end', fontSize: 10.5, fill: '#5b6167' }));
      k.push(E('line', { key: 'b' + i, x1: L, x2: R, y1: cy, y2: cy, stroke: '#dde1e5' }), E('line', { key: 'l' + i, x1: X(r.avg), x2: X(r.v), y1: cy, y2: cy, stroke: '#9aa3ad', strokeWidth: 3 }));
      k.push(E('circle', { key: 'a' + i, cx: X(r.avg), cy, r: 6, fill: BG, stroke: '#1d1f20', strokeWidth: 1.5 }), E('circle', { key: 'v' + i, cx: X(r.v), cy, r: 6, fill: '#2f5378' }));
      k.push(T('t' + i, R + 12, cy + 4, fmt(r.v) + '시간 · 평균 대비 ' + sgn(r.v - r.avg, 1) + ' · ' + r.n + '과목', { fontSize: 11.5 }));
    });
    return svg(W, TP + rows.length * rh + 4, k);
  }

  function scatter(pts, pop, onPick) {
    if (!pts.length) return empty();
    const W = 540, H = 480, L = 56, R = 524, TP = 18, B = 428;
    const q = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s[Math.floor(p * (s.length - 1))]; };
    const xl = Math.max(20, Math.ceil(q(pts.map(p => Math.abs(p.x)), 0.95) / 10) * 10), yl = Math.max(1, Math.ceil(q(pts.map(p => Math.abs(p.y)), 0.95)));
    const cl = (v, l) => Math.max(-l, Math.min(l, v)), X = x => L + (cl(x, xl) + xl) / (2 * xl) * (R - L), Y = y => B - (cl(y, yl) + yl) / (2 * yl) * (B - TP);
    const k = [E('rect', { key: 'q1', x: X(0), y: TP, width: R - X(0), height: Y(0) - TP, fill: '#efe6d4' })];
    [-1, -0.5, 0, 0.5, 1].forEach((t, i) => {
      k.push(E('line', { key: 'gx' + i, x1: X(t * xl), x2: X(t * xl), y1: TP, y2: B, stroke: t ? '#dde1e5' : '#5b6167' }), T('tx' + i, X(t * xl), B + 16, sgn(t * xl, 0, '%'), { textAnchor: 'middle', fontSize: 11, fill: '#5b6167' }));
      k.push(E('line', { key: 'gy' + i, x1: L, x2: R, y1: Y(t * yl), y2: Y(t * yl), stroke: t ? '#dde1e5' : '#5b6167' }), T('ty' + i, L - 6, Y(t * yl) + 4, sgn(t * yl, 1), { textAnchor: 'end', fontSize: 11, fill: '#5b6167' }));
    });
    k.push(T('qa', R - 6, TP + 16, '학급 증가 · 시수 증가', { textAnchor: 'end', fontSize: 12, fontWeight: 700, fill: '#8a5a1f' }), T('qb', L + 6, TP + 16, '학급 감소 · 시수 증가', { fontSize: 12, fontWeight: 700, fill: '#5b6167' }),
      T('qc', R - 6, B - 8, '학급 증가 · 시수 감소', { textAnchor: 'end', fontSize: 12, fontWeight: 700, fill: '#5b6167' }), T('qd', L + 6, B - 8, '학급 감소 · 시수 감소', { fontSize: 12, fontWeight: 700, fill: '#5b6167' }));
    k.push(T('ax', (L + R) / 2, H - 14, '개설 학급 수 증감률 (전년 대비, %)', { textAnchor: 'middle', fontSize: 12, fontWeight: 600 }));
    k.push(E('text', { key: 'ay', x: 14, y: (TP + B) / 2, fontSize: 12, fontWeight: 600, fill: '#1d1f20', textAnchor: 'middle', transform: 'rotate(-90 14 ' + (TP + B) / 2 + ')' }, '담당교사 평균 수업시수 변화 (시간)'));
    [...pts].sort((a, b) => (a.sel ? 1 : 0) - (b.sel ? 1 : 0)).forEach((p, i) => {
      const on = pop && pop.code === p.code && pop.area === p.area;
      k.push(E('circle', { key: 'p' + i, cx: X(p.x), cy: Y(p.y), r: 3 + Math.min(10, Math.sqrt(p.st) / 2.2), fill: GCOL[grp(p.area)], opacity: p.sel || on ? 0.95 : 0.6, stroke: on ? '#b88a3e' : p.sel ? '#1d1f20' : '#ffffff', strokeWidth: on ? 3 : p.sel ? 2 : 0.8, style: { cursor: 'pointer' }, onClick: () => onPick(p) },
        E('title', null, p.school + ' · ' + p.area + ' / 학급 ' + sgn(p.x, 1, '%') + ' · 시수 ' + sgn(p.y, 1, '시간'))));
    });
    return svg(W, H, k);
  }

  function pairs(rows) {
    if (!rows.length) return empty();
    const W = 660, rh = 36, L = 92, R = 452, TP = 8, mx = Math.max(10, ...rows.map(r => Math.max(Math.abs(r.a), Math.abs(r.b)))), mid = (L + R) / 2, sc = (R - L) / 2 / mx, k = [];
    rows.forEach((r, i) => {
      const cy = TP + i * rh + rh / 2, wa = Math.abs(r.a) * sc, wb = Math.abs(r.b) * sc;
      k.push(T('n' + i, L - 8, cy + 4, r.name, { textAnchor: 'end', fontWeight: 700 }));
      k.push(E('rect', { key: 'a' + i, x: r.a >= 0 ? mid : mid - wa, y: cy - 11, width: Math.max(1, wa), height: 9, fill: '#2f5378' }), E('rect', { key: 'b' + i, x: r.b >= 0 ? mid : mid - wb, y: cy + 2, width: Math.max(1, wb), height: 9, fill: '#b88a3e' }));
      k.push(T('ta' + i, R + 12, cy - 3, '학급 ' + sgn(r.a, 1, '%') + ' (' + sgn(r.an, 0) + ')', { fontSize: 11, fill: '#2f5378', fontWeight: 700 }), T('tb' + i, R + 12, cy + 11, '전공교원 ' + sgn(r.b, 1, '%') + ' (' + sgn(r.bn, 0) + ')', { fontSize: 11, fill: '#8a5a1f', fontWeight: 700 }));
    });
    k.push(E('line', { key: 'ax', x1: mid, x2: mid, y1: 4, y2: TP + rows.length * rh, stroke: '#5b6167' }));
    return svg(W, TP + rows.length * rh + 4, k);
  }

  function devs(groups, thr) {
    if (!groups.length) return empty();
    const W = 660, rh = 34, L = 100, R = 640, TP = 24, all = [].concat(...groups.map(g => g.vals)), lo = Math.min(-4, ...all) - 0.5, hi = Math.max(thr + 2, ...all) + 0.5, X = v => L + (v - lo) / (hi - lo) * (R - L), H = TP + groups.length * rh + 18;
    const k = [E('line', { key: 'z', x1: X(0), x2: X(0), y1: TP - 6, y2: H - 18, stroke: '#5b6167' }), E('line', { key: 't', x1: X(thr), x2: X(thr), y1: TP - 12, y2: H - 18, stroke: '#b88a3e', strokeDasharray: '4 3', strokeWidth: 1.5 }),
      T('tt', X(thr) + 4, 14, '검토 기준 +' + thr + '시간', { fontSize: 11, fontWeight: 700, fill: '#8a5a1f' }), T('zt', X(0) - 4, 14, '평균', { textAnchor: 'end', fontSize: 11, fill: '#5b6167' }), T('ax', (L + R) / 2, H - 2, '동일 교과 1인 교사 평균 대비 수업시수 차이 (시간)', { textAnchor: 'middle', fontSize: 11, fill: '#5b6167' })];
    groups.forEach((g, i) => {
      const cy = TP + i * rh + rh / 2;
      k.push(T('n' + i, L - 10, cy, g.name, { textAnchor: 'end', fontWeight: 700 }), T('c' + i, L - 10, cy + 12, g.vals.length + '명', { textAnchor: 'end', fontSize: 10.5, fill: '#5b6167' }), E('line', { key: 'b' + i, x1: L, x2: R, y1: cy, y2: cy, stroke: '#e3e6e8' }));
      g.vals.forEach((v, j) => k.push(E('circle', { key: 'd' + i + '-' + j, cx: X(v), cy: cy + (window.V7D.r(g.name, j) - 0.5) * 16, r: 4.5, fill: v >= thr ? '#2f5378' : '#bccce0', opacity: 0.85 })));
    });
    return svg(W, H, k);
  }

  function subjects(rows, thr) {
    if (!rows.length) return empty();
    const W = 660, rh = 26, L = 150, R = 560, TP = 24, xmax = Math.max(thr * 3, Math.min(90, Math.max(...[].concat(...rows.map(r => r.vals))))), X = v => L + Math.min(v, xmax) / xmax * (R - L), H = TP + rows.length * rh + 18;
    const k = [E('line', { key: 't', x1: X(thr), x2: X(thr), y1: TP - 12, y2: H - 18, stroke: '#b88a3e', strokeDasharray: '4 3', strokeWidth: 1.5 }), T('tt', X(thr) + 4, 14, thr + '명 이하 = 소규모', { fontSize: 11, fontWeight: 700, fill: '#8a5a1f' }), T('ax', (L + R) / 2, H - 2, '학교별 수강학생 수 (명, 점 1개 = 학교)', { textAnchor: 'middle', fontSize: 11, fill: '#5b6167' })];
    rows.forEach((r, i) => {
      const cy = TP + i * rh + rh / 2;
      k.push(T('n' + i, L - 8, cy + 4, r.name, { textAnchor: 'end' }), E('line', { key: 'b' + i, x1: L, x2: R, y1: cy, y2: cy, stroke: '#e3e6e8' }));
      r.vals.forEach((v, j) => k.push(E('circle', { key: 'd' + i + '-' + j, cx: X(v), cy: cy + (window.V7D.r(r.name, j) - 0.5) * 10, r: 3.6, fill: v <= thr ? '#2f5378' : '#bccce0', opacity: 0.85 })));
      k.push(T('s' + i, W - 4, cy + 4, '소규모 ' + r.small + '교', { textAnchor: 'end', fontSize: 11.5, fontWeight: 700, fill: '#2f5378' }));
    });
    return svg(W, H, k);
  }

  return { empty, line, diverge, cols, strip, dots, teachers, solo, scatter, pairs, devs, subjects, GCOL, grp, fmt, num, sgn };
};
