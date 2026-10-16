// 가상 데이터 엔진 — 실제 NEIS 카드로 교체 시 gen(school, year)만 실제 데이터로 바꾸면 됩니다.
(function () {
  const SG = ['수원시','성남시','고양시','용인시','부천시','안산시','안양시','남양주시','화성시','평택시','의정부시','시흥시','파주시','광명시','김포시','군포시','광주시','이천시','양주시','오산시','구리시','안성시','포천시','의왕시','하남시','여주시','양평군','동두천시','과천시','가평군','연천군'];
  const OFCB = { '수원시':'수원','성남시':'성남','고양시':'고양','용인시':'용인','부천시':'부천','안산시':'안산','안양시':'안양과천','과천시':'안양과천','남양주시':'구리남양주','구리시':'구리남양주','화성시':'화성오산','오산시':'화성오산','평택시':'평택','의정부시':'의정부','시흥시':'시흥','파주시':'파주','광명시':'광명','김포시':'김포','군포시':'군포의왕','의왕시':'군포의왕','광주시':'광주하남','하남시':'광주하남','이천시':'이천','안성시':'안성','양주시':'동두천양주','동두천시':'동두천양주','포천시':'포천','여주시':'여주','양평군':'양평','가평군':'가평','연천군':'연천' };
  const OFC = {}; Object.keys(OFCB).forEach(k => OFC[k] = OFCB[k] + '교육지원청');
  const URB = {}; ['수원시','성남시','고양시','용인시','부천시','안산시','안양시','남양주시','화성시','평택시','시흥시','파주시','김포시','의정부시'].forEach(k => URB[k] = '대도시');
  ['광명시','군포시','광주시','양주시','오산시','구리시','의왕시','하남시','과천시','동두천시','이천시'].forEach(k => URB[k] = '중소도시');
  ['안성시','포천시','여주시','양평군','가평군','연천군'].forEach(k => URB[k] = '읍면');
  const AREAS = ['국어','수학','영어','사회','과학','정보','제2외국어','예술·체육','교양'];
  const YEARS = [2022, 2023, 2024, 2025, 2026];
  // [과목명, 교과영역, 교육과정(15|22|both), 2015 성적처리, 2022 성적처리, 인기도, 추세]
  const SUBJ = [
    ['언어와 매체','국어','15','rel',null,0.95,0.9],['화법과 작문','국어','15','rel',null,0.8,0.8],['심화 국어','국어','15','abs',null,0.25,0.9],
    ['독서와 작문','국어','22',null,'rel',0.9,1],['문학과 영상','국어','22',null,'abs',0.35,1.2],
    ['미적분','수학','both','rel','rel',0.92,1],['확률과 통계','수학','both','rel','rel',0.95,1.15],['기하','수학','both','abs','rel',0.5,0.75],['경제 수학','수학','both','abs','rel',0.3,0.9],['대수','수학','22',null,'rel',0.9,1],
    ['영어Ⅱ','영어','both','rel','rel',0.8,0.95],['영어 독해와 작문','영어','both','rel','rel',0.85,1],['영어권 문화','영어','both','abs','abs',0.3,1.1],['심화 영어','영어','15','abs',null,0.3,0.9],
    ['사회·문화','사회','both','rel','rel',0.9,1.15],['생활과 윤리','사회','both','rel','rel',0.9,1.15],['한국지리','사회','both','rel','rel',0.6,0.85],['세계사','사회','both','rel','rel',0.5,0.8],['정치와 법','사회','both','rel','rel',0.55,0.8],['경제','사회','both','rel','rel',0.45,0.8],['사회문제 탐구','사회','both','abs','abs',0.3,1.2],
    ['물리학Ⅰ','과학','both','rel','rel',0.7,0.75],['화학Ⅰ','과학','both','rel','rel',0.8,0.9],['생명과학Ⅰ','과학','both','rel','rel',0.9,1.1],['지구과학Ⅰ','과학','both','rel','rel',0.85,1.1],['생활과 과학','과학','15','abs',null,0.3,1],['기후변화와 환경생태','과학','22',null,'abs',0.35,1.2],
    ['정보','정보','both','rel','rel',0.7,1.3],['인공지능 기초','정보','both','abs','rel',0.3,1.5],
    ['중국어Ⅰ','제2외국어','both','rel','rel',0.45,0.7],['일본어Ⅰ','제2외국어','both','rel','rel',0.5,0.8],
    ['음악 감상과 비평','예술·체육','both','abs','abs',0.4,1.1],['미술 창작','예술·체육','both','abs','abs',0.4,1.05],['스포츠 생활','예술·체육','both','abs','abs',0.7,1.15],
    ['논술','교양','both','pf','pf',0.35,1.2],['심리학','교양','both','pf','pf',0.3,1.3],['보건','교양','both','pf','pf',0.3,1.1],['진로와 직업','교양','both','pf','pf',0.5,1]
  ].map(a => ({ name: a[0], area: a[1], cur: a[2], t15: a[3], t22: a[4], pop: a[5], tr: a[6] }));
  const META = {}; SUBJ.forEach(s => META[s.name] = s);
  const COMMON = { '국어':['공통국어',4,'rel'], '수학':['공통수학',4,'rel'], '영어':['공통영어',4,'rel'], '사회':['통합사회',4,'rel'], '과학':['통합과학',4,'rel'], '예술·체육':['체육',4,'abs'] };
  const HOST = { '교양':['국어','사회','과학'], '정보':['수학','과학'], '제2외국어':['영어','국어'] };

  function h(s) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0) / 4294967296; }
  const r = (...p) => h(p.join('|'));
  function rng(seed) { let a = Math.floor(h(seed) * 4294967296) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const mean = a => a.length ? a.reduce((t, x) => t + x, 0) / a.length : 0;
  const ko = (a, b) => a.localeCompare(b, 'ko');

  let _sc = null;
  function schools() {
    if (_sc) return _sc;
    const out = [], BITS = ['제일','중앙','동','서','남','북','신','한빛','미래','예성','학현','솔빛','청람','다산','새솔','푸른'];
    SG.forEach((sg, si) => {
      const urban = URB[sg], n = 4 + Math.floor(r(sg, 'n') * 5) + (urban === '대도시' ? 3 : 0);
      for (let i = 0; i < n; i++) {
        const sd = sg + i, tr = r(sd, 'type');
        const stype = tr > 0.92 ? '특목고' : tr > 0.8 ? '특성화고' : tr > 0.66 ? '자율고' : '일반고';
        const sr = r(sd, 'size') * (urban === '대도시' ? 1.15 : urban === '읍면' ? 0.62 : 0.95);
        const students = sr > 0.66 ? 950 + Math.round(r(sd, 'st') * 600) : sr > 0.3 ? 520 + Math.round(r(sd, 'st') * 380) : 120 + Math.round(r(sd, 'st') * 360);
        const cd = r(sd, 'cd');
        out.push({ code: 'S' + String(si * 100 + i).padStart(4, '0'), name: sg.replace(/[시군]$/, '') + BITS[Math.floor(r(sd, 'nm') * BITS.length)] + (stype === '특성화고' ? '정보고' : '고'),
          sg, office: OFC[sg], urban, stype, students, cpg: Math.max(2, Math.round(students / 3 / 26)), found: r(sd, 'fd') < 0.32 ? '사립' : '공립', coed: cd < 0.62 ? '남녀공학' : cd < 0.82 ? '여고' : '남고' });
      }
    });
    const seen = {};
    out.forEach(s => { seen[s.name] = (seen[s.name] || 0) + 1; const k = seen[s.name]; if (k > 1) s.name = s.name.replace(/(정보)?고$/, m => k + m); });
    return (_sc = out);
  }
  const curOf = (y, g) => (y >= 2025 && g <= y - 2024) ? '22' : '15';

  const _g = {};
  function gen(s, y) {
    const key = s.code + y; if (_g[key]) return _g[key];
    const k = (y - 2021) / 5, rnd = rng(s.code + '|' + y);
    const sizeF = s.cpg >= 10 ? 0.95 : s.cpg >= 7 ? 0.8 : 0.55, urbF = s.urban === '읍면' ? 0.82 : s.urban === '중소도시' ? 0.93 : 1, typF = s.stype === '특목고' ? 1.1 : s.stype === '특성화고' ? 0.6 : 1;
    const gsz = s.students / 3, offers = [];
    [2, 3].forEach(g => {
      const cur = curOf(y, g);
      SUBJ.forEach(sb => {
        if (sb.cur !== 'both' && sb.cur !== cur) return;
        const tf = 1 + (sb.tr - 1) * (y - 2022) / 4;
        const p = Math.min(0.97, sb.pop * sizeF * urbF * typF * (0.8 + 0.3 * k) * tf);
        if (r(s.code, sb.name, g, 'o') > p) return;
        const share = sb.pop * 0.32 * (0.55 + r(s.code, sb.name, g, 's') * 0.9) * tf * (sb.area === '교양' ? 0.6 : 1) * (0.92 + 0.16 * rnd());
        const students = Math.max(4, Math.round(gsz * share));
        const classes = Math.max(1, Math.round(students / (25 - 4 * k)));
        const so = r(sb.name, 'sem');
        const sems = cur === '22' ? [so < 0.5 ? 1 : 2] : so < 0.15 ? [1] : so < 0.3 ? [2] : [1, 2];
        const hpw = sems.length === 1 ? 4 : 2;
        offers.push({ name: sb.name, area: sb.area, cur, type: cur === '22' ? sb.t22 : sb.t15, g, students, classes, sems, hpw, credits: 4, h: classes * hpw * sems.length / 2 });
      });
    });
    const items = {}; AREAS.forEach(a => items[a] = []);
    Object.keys(COMMON).forEach(a => { const c = COMMON[a]; items[a].push({ name: c[0], area: a, type: c[2], classes: s.cpg, hpw: c[1], sems: [1, 2], h: s.cpg * c[1], common: true }); });
    offers.forEach(o => items[o.area].push(o));
    const hrs = a => items[a].reduce((t, o) => t + o.h, 0), host = {};
    Object.keys(HOST).forEach(a => { const H = hrs(a); if (H > 0 && H < 10 && r(s.code, y, a, 'host') < (s.cpg <= 6 ? 0.85 : 0.35) + 0.1 * k) { const hs = HOST[a]; host[a] = hs[Math.floor(r(s.code, a, 'hs') * hs.length)]; } });
    const teachers = []; let tid = 0;
    AREAS.forEach(a => {
      if (host[a]) return;
      const own = hrs(a); if (!own) return;
      const its = items[a].concat(...Object.keys(host).filter(x => host[x] === a).map(x => items[x]));
      const n = Math.max(1, Math.round(own / (15.5 + r(s.code, y, a, 'tg') * 2.5)));
      const T = Array.from({ length: n }, () => ({ major: a, map: {}, total: 0 }));
      const target = its.reduce((t, o) => t + o.h, 0) / n;
      its.forEach(o => {
        const uh = o.hpw * o.sems.length / 2;
        for (let c = 0; c < o.classes; c++) {
          let best = null;
          T.forEach(t => { if (t.map[o.name] && t.total + uh <= target + 1.5 && (!best || t.total < best.total)) best = t; });
          if (!best) { let bs = 1e9; T.forEach(t => { const sc = t.total + rnd() * 1.5; if (sc < bs) { bs = sc; best = t; } }); }
          const m = best.map[o.name] || (best.map[o.name] = { name: o.name, area: o.area, type: o.type, common: !!o.common, classes: 0, h: 0 });
          m.classes++; m.h += uh; best.total += uh;
        }
      });
      T.forEach(t => {
        t.id = 'T-' + String(++tid).padStart(2, '0');
        t.items = Object.values(t.map); delete t.map;
        t.majorH = t.items.filter(i => i.area === t.major).reduce((x, i) => x + i.h, 0); t.nonH = t.total - t.majorH; t.nSubj = t.items.length;
        t.tc = { rel: 0, abs: 0, pf: 0 }; t.items.forEach(i => t.tc[i.type]++);
        teachers.push(t);
      });
    });
    const solo = [];
    AREAS.forEach(a => {
      if (!offers.some(o => o.area === a)) return;
      const ts = teachers.filter(t => t.items.some(i => i.area === a));
      if (ts.length === 1) solo.push({ area: a, t: ts[0], hours: ts[0].total });
    });
    return (_g[key] = { offers, teachers, solo });
  }

  function offersOf(s, y, f) {
    const o = gen(s, y).offers; if (!f) return o;
    return o.filter(x => (!f.area || x.area === f.area) && (!f.cur || x.cur === f.cur) && (!f.grade || x.g === f.grade) && (!f.sem || x.sems.indexOf(f.sem) >= 0) && (!f.gtype || x.type === f.gtype) && (!f.subj || x.name === f.subj));
  }
  const lk = l => l.length + ':' + (l[0] ? l[0].code + l[l.length - 1].code + l[l.length >> 1].code : '');
  const _oa = {};
  function offerAgg(list, y, f) {
    const key = lk(list) + y + JSON.stringify(f || {}); if (_oa[key]) return _oa[key];
    const a = { n: list.length, subjSum: 0, students: 0, classes: 0, bySubj: {}, byArea: {} };
    list.forEach(s => {
      const names = new Set(), an = {};
      offersOf(s, y, f).forEach(o => {
        names.add(o.name); a.students += o.students; a.classes += o.classes;
        const b = a.bySubj[o.name] || (a.bySubj[o.name] = { students: 0, classes: 0, schools: new Set() }); b.students += o.students; b.classes += o.classes; b.schools.add(s.code);
        const ar = a.byArea[o.area] || (a.byArea[o.area] = { students: 0, classes: 0, subj: 0 }); ar.students += o.students; ar.classes += o.classes;
        (an[o.area] = an[o.area] || new Set()).add(o.name);
      });
      a.subjSum += names.size; Object.keys(an).forEach(x => a.byArea[x].subj += an[x].size);
    });
    a.subjPer = a.n ? a.subjSum / a.n : 0; a.classPer = a.n ? a.classes / a.n : 0;
    Object.values(a.byArea).forEach(x => x.subjPer = a.n ? x.subj / a.n : 0);
    return (_oa[key] = a);
  }
  function tMatch(t, f) {
    if (f.area && (f.areaMode === 'teach' ? !t.items.some(i => i.area === f.area) : t.major !== f.area)) return false;
    if (f.subj && !t.items.some(i => i.name === f.subj)) return false;
    return true;
  }
  const _ta = {};
  function teacherAgg(list, y, f) {
    f = f || {}; const key = lk(list) + y + JSON.stringify(f); if (_ta[key]) return _ta[key];
    const a = { n: 0, nSubj: 0, major: 0, non: 0, total: 0, multi: 0, dist: [0, 0, 0, 0], tc: { rel: 0, abs: 0, pf: 0 }, solo: 0 };
    list.forEach(s => {
      const G = gen(s, y);
      G.teachers.forEach(t => {
        if (!tMatch(t, f)) return;
        a.n++; a.nSubj += f.gtype ? t.tc[f.gtype] : t.nSubj; a.major += t.majorH; a.non += t.nonH; a.total += t.total; if (t.nonH > 0) a.multi++;
        a.dist[Math.min(3, Math.max(1, t.nSubj) - 1)]++; a.tc.rel += t.tc.rel; a.tc.abs += t.tc.abs; a.tc.pf += t.tc.pf;
      });
      a.solo += G.solo.filter(x => !f.area || x.area === f.area).length;
    });
    const n = Math.max(1, a.n);
    a.nSubjAvg = a.nSubj / n; a.majorAvg = a.major / n; a.nonAvg = a.non / n; a.totalAvg = a.total / n; a.multiR = a.multi / n * 100;
    a.distP = a.dist.map(x => x / n * 100); a.tcAvg = { rel: a.tc.rel / n, abs: a.tc.abs / n, pf: a.tc.pf / n };
    return (_ta[key] = a);
  }
  const _as = {};
  function areaStat(s, y, a) {
    const key = s.code + y + a; if (_as[key]) return _as[key];
    const G = gen(s, y); let classes = 0, students = 0; const subs = new Set();
    G.offers.forEach(o => { if (o.area === a) { classes += o.classes; students += o.students; subs.add(o.name); } });
    const ts = G.teachers.filter(t => t.items.some(i => i.area === a));
    return (_as[key] = { classes, students, subs: [...subs].sort(ko), tMajor: G.teachers.filter(t => t.major === a).length, tN: ts.length, avgN: mean(ts.map(t => t.nSubj)), avgH: mean(ts.map(t => t.total)), solo: G.solo.some(x => x.area === a) });
  }
  const _so = {};
  function soloAvg(y) {
    if (_so[y]) return _so[y];
    const acc = {}; schools().forEach(s => gen(s, y).solo.forEach(x => (acc[x.area] = acc[x.area] || []).push(x.hours)));
    const out = {}; Object.keys(acc).forEach(a => out[a] = mean(acc[a]));
    return (_so[y] = out);
  }

  window.V7D = { SG, OFC, URB, AREAS, YEARS, SUBJ, META, schools, gen, offersOf, offerAgg, teacherAgg, tMatch, areaStat, soloAvg, r, mean, ko };
})();
