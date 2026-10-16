// v8 가상 데이터 · 집계 모듈 (실제 NEIS 연계 시 schools() / offersFor() / assign() 만 교체)
(function () {
  const H = s => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0) / 4294967296; };
  const R = (...p) => H(p.join('|'));
  const SG = ['수원시','성남시','고양시','용인시','부천시','안산시','안양시','남양주시','화성시','평택시','의정부시','시흥시','파주시','광명시','김포시','군포시','광주시','이천시','양주시','오산시','구리시','안성시','포천시','의왕시','하남시','여주시','양평군','동두천시','과천시','가평군','연천군'];
  const OFFICE_OF = { '수원시':'수원교육지원청','성남시':'성남교육지원청','고양시':'고양교육지원청','용인시':'용인교육지원청','부천시':'부천교육지원청','안산시':'안산교육지원청','안양시':'안양과천교육지원청','과천시':'안양과천교육지원청','남양주시':'구리남양주교육지원청','구리시':'구리남양주교육지원청','화성시':'화성오산교육지원청','오산시':'화성오산교육지원청','평택시':'평택교육지원청','의정부시':'의정부교육지원청','시흥시':'시흥교육지원청','파주시':'파주교육지원청','광명시':'광명교육지원청','김포시':'김포교육지원청','군포시':'군포의왕교육지원청','의왕시':'군포의왕교육지원청','광주시':'광주하남교육지원청','하남시':'광주하남교육지원청','이천시':'이천교육지원청','안성시':'안성교육지원청','양주시':'동두천양주교육지원청','동두천시':'동두천양주교육지원청','포천시':'포천교육지원청','여주시':'여주교육지원청','양평군':'양평교육지원청','가평군':'가평교육지원청','연천군':'연천교육지원청' };
  const URBAN_OF = { '수원시':'대도시','성남시':'대도시','고양시':'대도시','용인시':'대도시','부천시':'대도시','안산시':'대도시','안양시':'대도시','남양주시':'대도시','화성시':'대도시','평택시':'대도시','시흥시':'대도시','파주시':'대도시','김포시':'대도시','의정부시':'대도시','광명시':'중소도시','군포시':'중소도시','광주시':'중소도시','양주시':'중소도시','오산시':'중소도시','구리시':'중소도시','의왕시':'중소도시','하남시':'중소도시','과천시':'중소도시','동두천시':'중소도시','이천시':'중소도시','안성시':'읍면','포천시':'읍면','여주시':'읍면','양평군':'읍면','가평군':'읍면','연천군':'읍면' };
  const OFFICES = [...new Set(SG.map(s => OFFICE_OF[s]))];
  const DEPT_AREA = { '국어':'국어','수학':'수학','영어':'영어','사회':'사회','과학':'과학','체육':'체육','예술':'예술','기술·가정':'기술·가정','정보':'정보','제2외국어':'제2외국어','한문':'한문','교양':'교양' };
  const DEPTS = Object.keys(DEPT_AREA);
  const AREAS = ['국어','수학','영어','사회','과학','체육','예술','기술·가정','정보','제2외국어','한문','교양'];
  // 2015 개정 원래 교과영역(보존용)
  const AREA15 = { '국어':'기초','수학':'기초','영어':'기초','사회':'탐구','과학':'탐구','체육':'체육·예술','예술':'체육·예술','기술·가정':'생활·교양','정보':'생활·교양','제2외국어':'생활·교양','한문':'생활·교양','교양':'생활·교양' };
  const RELATED = { '한문':'국어', '정보':'수학','교양':'국어','기술·가정':'과학','제2외국어':'영어','예술':'국어','체육':'과학','국어':'사회','수학':'과학','영어':'국어','사회':'국어','과학':'수학' };
  // 출처: 경기도교육청 「2022 개정 고등학교 교육과정 Q&A 도움 자료집」(2024.10) 14~15쪽 선택과목 비교표 · 66~67쪽 부록2
  // 관계: same = 두 교육과정 목록에 동일 과목명 / est = 명칭 변경 추정(PDF에 대응 관계 미기재) / only15 / only22
  const RAW = [];
  const A = (d, n15, t15, n22, t22, rel, gr, pop, tr, note) => RAW.push([d, n15, t15, n22, t22, rel, gr, pop, tr || 0, note || '']);
  // 공통과목 (선택과목 집계 제외)
  A('국어','국어','공통','공통국어1·2','공통','est','1',1); A('수학','수학','공통','공통수학1·2','공통','est','1',1); A('영어','영어','공통','공통영어1·2','공통','est','1',1);
  A('사회','통합사회','공통','통합사회1·2','공통','est','1',1); A('사회','한국사','공통','한국사1·2','공통','est','1',1,0,'2015 한국사 교과 → 2022 사회(역사/도덕 포함) 교과(군)');
  A('과학','통합과학','공통','통합과학1·2','공통','est','1',1); A('과학','과학탐구실험','공통','과학탐구실험1·2','공통','est','1',1);
  // 국어
  A('국어','문학','일반','문학','일반','same','2',1);
  A('국어','화법과 작문','일반',null,null,'only15','23',0.85,0,'재구성 추정 → 화법과 언어 · 독서와 작문'); A('국어','언어와 매체','일반',null,null,'only15','23',0.85,0,'재구성 추정 → 화법과 언어'); A('국어','독서','일반',null,null,'only15','2',0.95,0,'재구성 추정 → 독서와 작문');
  A('국어',null,null,'화법과 언어','일반','only22','2',0.95,0,'재구성 추정 ← 화법과 작문 · 언어와 매체'); A('국어',null,null,'독서와 작문','일반','only22','2',0.95,0,'재구성 추정 ← 독서 · 화법과 작문');
  A('국어','실용 국어','진로',null,null,'only15','3',0.3); A('국어','심화 국어','진로',null,null,'only15','3',0.4); A('국어','고전 읽기','진로',null,null,'only15','3',0.45);
  A('국어',null,null,'주제 탐구 독서','진로','only22','23',0.6); A('국어',null,null,'문학과 영상','진로','only22','3',0.45); A('국어',null,null,'직무 의사소통','진로','only22','3',0.25);
  A('국어',null,null,'독서 토론과 글쓰기','융합','only22','3',0.3); A('국어',null,null,'매체 의사소통','융합','only22','3',0.35); A('국어',null,null,'언어생활 탐구','융합','only22','3',0.2);
  // 수학
  A('수학','수학Ⅰ','일반',null,null,'only15','2',1,0,'대응 미기재 (대수와 내용 유사 추정)'); A('수학','수학Ⅱ','일반',null,null,'only15','2',0.95,0,'대응 미기재 (미적분Ⅰ과 내용 유사 추정)'); A('수학','미적분','일반',null,null,'only15','3',0.85,-0.03,'대응 미기재 (미적분Ⅱ 진로로 이동 추정)');
  A('수학',null,null,'대수','일반','only22','2',1); A('수학',null,null,'미적분Ⅰ','일반','only22','2',0.95); A('수학',null,null,'미적분Ⅱ','진로','only22','3',0.8);
  A('수학','확률과 통계','일반','확률과 통계','일반','same','23',0.95,0.05); A('수학','기하','진로','기하','진로','same','3',0.6,-0.1);
  A('수학','경제 수학','진로','경제 수학','진로','same','3',0.4,0.04); A('수학','인공지능 수학','진로','인공지능 수학','진로','same','3',0.35,0.08);
  A('수학','수학과제 탐구','진로','수학과제 탐구','융합','same','3',0.3); A('수학','실용 수학','진로',null,null,'only15','3',0.15);
  A('수학',null,null,'직무 수학','진로','only22','3',0.2); A('수학',null,null,'수학과 문화','융합','only22','3',0.2); A('수학',null,null,'실용 통계','융합','only22','3',0.3);
  // 영어
  A('영어','영어Ⅰ','일반','영어Ⅰ','일반','same','2',1); A('영어','영어Ⅱ','일반','영어Ⅱ','일반','same','2',0.95); A('영어','영어 독해와 작문','일반','영어 독해와 작문','일반','same','3',0.9);
  A('영어','영미 문학 읽기','진로','영미 문학 읽기','진로','same','3',0.5);
  A('영어','영어 회화','일반',null,null,'only15','23',0.55,-0.02,'대응 미기재 (실생활 영어 회화 추정)'); A('영어','영어권 문화','진로',null,null,'only15','3',0.45,0,'대응 미기재 (세계 문화와 영어 추정)'); A('영어','진로 영어','진로',null,null,'only15','3',0.35); A('영어','실용 영어','진로',null,null,'only15','3',0.2);
  A('영어',null,null,'직무 영어','진로','only22','3',0.3); A('영어',null,null,'영어 발표와 토론','진로','only22','3',0.35); A('영어',null,null,'심화 영어','진로','only22','3',0.3); A('영어',null,null,'심화 영어 독해와 작문','진로','only22','3',0.2);
  A('영어',null,null,'실생활 영어 회화','융합','only22','23',0.5); A('영어',null,null,'미디어 영어','융합','only22','3',0.25); A('영어',null,null,'세계 문화와 영어','융합','only22','3',0.4);
  // 사회(역사/도덕 포함)
  A('사회','세계사','일반','세계사','일반','same','23',0.65,-0.09); A('사회','경제','일반','경제','진로','same','3',0.55,-0.08); A('사회','윤리와 사상','일반','윤리와 사상','진로','same','3',0.55,-0.03);
  A('사회','여행지리','진로','여행지리','융합','same','3',0.45,0.06); A('사회','사회문제 탐구','진로','사회문제 탐구','융합','same','3',0.4,0.08);
  A('사회','사회·문화','일반','사회와 문화','일반','est','23',0.95,0.08); A('사회','생활과 윤리','일반',null,null,'only15','23',0.95,0.08,'대응 미기재 (현대사회와 윤리 추정)');
  A('사회','한국지리','일반',null,null,'only15','23',0.7,-0.08,'대응 미기재 (한국지리 탐구 추정)'); A('사회','세계지리','일반',null,null,'only15','23',0.55,0,'대응 미기재 (세계시민과 지리 추정)');
  A('사회','동아시아사','일반',null,null,'only15','3',0.45,0,'대응 미기재 (동아시아 역사 기행 추정)'); A('사회','정치와 법','일반',null,null,'only15','3',0.7,0,'분리 추정 → 정치 · 법과 사회'); A('사회','고전과 윤리','진로',null,null,'only15','3',0.2);
  A('사회',null,null,'세계시민과 지리','일반','only22','23',0.55); A('사회',null,null,'현대사회와 윤리','일반','only22','23',0.95); A('사회',null,null,'한국지리 탐구','진로','only22','3',0.55);
  A('사회',null,null,'도시의 미래 탐구','진로','only22','3',0.2); A('사회',null,null,'동아시아 역사 기행','진로','only22','3',0.35); A('사회',null,null,'정치','진로','only22','3',0.5); A('사회',null,null,'법과 사회','진로','only22','3',0.5);
  A('사회',null,null,'인문학과 윤리','진로','only22','3',0.25); A('사회',null,null,'국제 관계의 이해','진로','only22','3',0.2);
  A('사회',null,null,'역사로 탐구하는 현대 세계','융합','only22','3',0.2); A('사회',null,null,'금융과 경제생활','융합','only22','3',0.4); A('사회',null,null,'윤리문제 탐구','융합','only22','3',0.25); A('사회',null,null,'기후변화와 지속가능한 세계','융합','only22','3',0.2);
  // 과학
  A('과학','물리학Ⅰ','일반','물리학','일반','est','23',0.85,-0.1); A('과학','화학Ⅰ','일반','화학','일반','est','23',0.9,-0.05); A('과학','생명과학Ⅰ','일반','생명과학','일반','est','23',0.95,0.07); A('과학','지구과학Ⅰ','일반','지구과학','일반','est','23',0.9,0.06);
  A('과학','물리학Ⅱ','진로',null,null,'only15','3',0.4,0,'분리 추정 → 역학과 에너지 · 전자기와 양자'); A('과학','화학Ⅱ','진로',null,null,'only15','3',0.45,0,'분리 추정 → 물질과 에너지 · 화학 반응의 세계');
  A('과학','생명과학Ⅱ','진로',null,null,'only15','3',0.5,0,'분리 추정 → 세포와 물질대사 · 생물의 유전'); A('과학','지구과학Ⅱ','진로',null,null,'only15','3',0.35,0,'분리 추정 → 지구시스템과학 · 행성우주과학');
  A('과학','과학사','진로',null,null,'only15','3',0.3,0,'대응 미기재 (과학의 역사와 문화 추정)'); A('과학','생활과 과학','진로',null,null,'only15','3',0.45); A('과학','융합과학','진로',null,null,'only15','3',0.2);
  A('과학',null,null,'역학과 에너지','진로','only22','3',0.4); A('과학',null,null,'전자기와 양자','진로','only22','3',0.3); A('과학',null,null,'물질과 에너지','진로','only22','3',0.4); A('과학',null,null,'화학 반응의 세계','진로','only22','3',0.35);
  A('과학',null,null,'세포와 물질대사','진로','only22','3',0.45); A('과학',null,null,'생물의 유전','진로','only22','3',0.4); A('과학',null,null,'지구시스템과학','진로','only22','3',0.3); A('과학',null,null,'행성우주과학','진로','only22','3',0.3);
  A('과학',null,null,'과학의 역사와 문화','융합','only22','3',0.3); A('과학',null,null,'기후변화와 환경생태','융합','only22','3',0.4); A('과학',null,null,'융합과학 탐구','융합','only22','3',0.25);
  // 체육
  A('체육','체육','일반','체육1·2','일반','est','12',1); A('체육','운동과 건강','일반','운동과 건강','진로','same','23',0.7);
  A('체육','스포츠 생활','진로',null,null,'only15','23',0.85,0,'분리 추정 → 스포츠 생활1 · 스포츠 생활2'); A('체육','체육 탐구','진로',null,null,'only15','3',0.3);
  A('체육',null,null,'스포츠 문화','진로','only22','3',0.3); A('체육',null,null,'스포츠 과학','진로','only22','3',0.3); A('체육',null,null,'스포츠 생활1','융합','only22','2',0.85); A('체육',null,null,'스포츠 생활2','융합','only22','3',0.8);
  // 예술
  A('예술','음악','일반','음악','일반','same','1',0.9); A('예술','미술','일반','미술','일반','same','1',0.9); A('예술','음악 감상과 비평','진로','음악 감상과 비평','진로','same','3',0.45,0.04);
  A('예술','미술 감상과 비평','진로','미술 감상과 비평','진로','same','3',0.45,0.04); A('예술','미술 창작','진로','미술 창작','진로','same','3',0.25);
  A('예술','음악 연주','진로',null,null,'only15','3',0.2,0,'대응 미기재 (음악 연주와 창작 추정)'); A('예술',null,null,'음악 연주와 창작','진로','only22','3',0.2); A('예술',null,null,'음악과 미디어','융합','only22','3',0.2); A('예술',null,null,'미술과 매체','융합','only22','3',0.2);
  // 기술·가정
  A('기술·가정','기술·가정','일반','기술·가정','일반','same','1',0.95); A('기술·가정','지식 재산 일반','진로','지식 재산 일반','융합','same','3',0.15); A('기술·가정','가정과학','진로',null,null,'only15','3',0.25);
  A('기술·가정',null,null,'로봇과 공학세계','진로','only22','3',0.2); A('기술·가정',null,null,'생활과학 탐구','진로','only22','3',0.25); A('기술·가정',null,null,'아동발달과 부모','융합','only22','3',0.2); A('기술·가정',null,null,'생애 설계와 자립','융합','only22','3',0.25);
  // 정보 (2015 기술·가정/정보 → 2022 정보 별도 교과)
  A('정보','정보','일반','정보','일반','same','1',0.8,0.1); A('정보','인공지능 기초','진로','인공지능 기초','진로','same','23',0.45,0.14);
  A('정보',null,null,'데이터 과학','진로','only22','3',0.3); A('정보',null,null,'소프트웨어와 생활','융합','only22','3',0.25);
  // 제2외국어
  A('제2외국어','중국어Ⅰ','일반','중국어','일반','est','23',0.6,-0.04); A('제2외국어','일본어Ⅰ','일반','일본어','일반','est','23',0.6,-0.03); A('제2외국어','프랑스어Ⅰ','일반','프랑스어','일반','est','23',0.15,-0.06);
  A('제2외국어','중국어Ⅱ','진로',null,null,'only15','3',0.15); A('제2외국어',null,null,'중국어 회화','진로','only22','3',0.2); A('제2외국어',null,null,'일본어 회화','진로','only22','3',0.2); A('제2외국어',null,null,'중국 문화','융합','only22','3',0.15);
  // 교양 (2015 교양 = 일반선택만, 2022 일반·진로·융합)
  A('교양','진로와 직업','일반','진로와 직업','일반','same','3',0.3); A('교양','보건','일반','보건','진로','same','23',0.4,0.04); A('교양','논술','일반','논술','융합','same','3',0.4,0.04);
  A('교양','심리학','일반',null,null,'only15','3',0.5,0,'대응 미기재 (인간과 심리 추정)'); A('교양','환경','일반',null,null,'only15','3',0.35,0,'대응 미기재 (생태와 환경 추정)'); A('교양','철학','일반',null,null,'only15','3',0.2);
  A('교양',null,null,'생태와 환경','일반','only22','3',0.35); A('교양',null,null,'인간과 심리','진로','only22','3',0.5); A('교양',null,null,'인간과 철학','진로','only22','3',0.2);

  // 자료집 비교표(14~15쪽) 나머지 과목 — 개설 확률 낮게
  A('수학','기본 수학','진로',null,null,'only15','3',0.08); A('영어','기본 영어','진로',null,null,'only15','3',0.08);
  A('예술','연극','일반','연극','일반','same','1',0.12);
  A('기술·가정','농업 생명 과학','진로',null,null,'only15','3',0.05); A('기술·가정','공학 일반','진로',null,null,'only15','3',0.1); A('기술·가정','창의 경영','진로',null,null,'only15','3',0.06); A('기술·가정','해양 문화와 기술','진로',null,null,'only15','3',0.03);
  A('기술·가정',null,null,'창의 공학 설계','융합','only22','3',0.12);
  ['스페인어Ⅰ','러시아어Ⅰ','아랍어Ⅰ','베트남어Ⅰ'].forEach((n, i) => A('제2외국어', n, '일반', null, null, 'only15', '23', [0.1, 0.04, 0.03, 0.04][i]));
  ['독일어Ⅱ','프랑스어Ⅱ','스페인어Ⅱ','일본어Ⅱ','러시아어Ⅱ','아랍어Ⅱ','베트남어Ⅱ'].forEach(n => A('제2외국어', n, '진로', null, null, 'only15', '3', 0.04));
  ['스페인어','러시아어','아랍어','베트남어'].forEach(n => A('제2외국어', null, null, n, '일반', 'only22', '23', 0.05));
  A('제2외국어','독일어','일반','독일어','일반','same','23',0.08);
  ['독일어 회화','프랑스어 회화','스페인어 회화','러시아어 회화','아랍어 회화','베트남어 회화','심화 독일어','심화 프랑스어','심화 스페인어','심화 중국어','심화 일본어','심화 러시아어','심화 아랍어','심화 베트남어'].forEach(n => A('제2외국어', null, null, n, '진로', 'only22', '3', 0.03));
  ['독일어권 문화','프랑스어권 문화','스페인어권 문화','일본 문화','러시아 문화','아랍 문화','베트남 문화'].forEach(n => A('제2외국어', null, null, n, '융합', 'only22', '3', 0.04));
  A('한문','한문Ⅰ','일반',null,null,'only15','23',0.3); A('한문','한문Ⅱ','진로',null,null,'only15','3',0.08);
  A('한문',null,null,'한문','일반','only22','23',0.3); A('한문',null,null,'한문 고전 읽기','진로','only22','3',0.08); A('한문',null,null,'언어생활과 한자','융합','only22','3',0.1);
  ['논리학','교육학','종교학','실용 경제'].forEach(n => A('교양', n, '일반', null, null, 'only15', '3', 0.12));
  ['논리와 사고','교육의 이해','삶과 종교'].forEach(n => A('교양', null, null, n, '진로', 'only22', '3', 0.12));
  A('교양',null,null,'인간과 경제활동','융합','only22','3',0.12);
  const MAP_LABEL = { same: '동일 과목명', est: '명칭 변경 추정', only15: '2015에만 편성', only22: '2022 신설·재구성' };
  function range22(e) {
    if (!e.n22) return null;
    if (e.common) return e.n22.indexOf('한국사') === 0 ? '3' : e.n22.indexOf('과학탐구실험') === 0 ? '1' : '3∼4';
    if (['스포츠 문화', '스포츠 과학', '생애 설계와 자립'].indexOf(e.n22) >= 0) return '1∼2';
    if (e.dept === '체육' || e.dept === '예술' || e.dept === '교양') return '2∼4';
    return '3∼5';
  }
  // v9: 추정 대응 사용 안 함 — 공통과목 외 명칭이 다른 과목은 별개 과목으로 집계
  const RAWS = [];
  RAW.forEach(r => { if (r[5] === 'est' && r[2] !== '공통') { RAWS.push([r[0], r[1], r[2], null, null, 'only15', r[6], r[7], r[8], '']); RAWS.push([r[0], null, null, r[3], r[4], 'only22', r[6], r[7], r[8], '']); } else RAWS.push(r[9] && r[9].indexOf('추정') >= 0 ? r.slice(0, 9).concat(['']) : r); });
  const CAT = RAWS.map((r, i) => {
    const e = { id: i, dept: r[0], area: DEPT_AREA[r[0]], n15: r[1], t15: r[2], n22: r[3], t22: r[4], map: r[5], gr: r[6], pop: r[7], tr: r[8], note: r[9] };
    e.area15 = e.n15 === '한국사' ? '기초(한국사)' : AREA15[e.dept];
    e.cmp = e.map === 'same'; e.est = e.map === 'est';
    e.common = (e.t15 || e.t22) === '공통';
    if (!e.note) e.note = e.map === 'only22' ? '2015 개정 목록에 없음' : e.map === 'only15' ? '2022 개정 목록에 없음' : '';
    e.label = e.n15 && e.n22 && e.n15 !== e.n22 ? e.n15 + ' → ' + e.n22 : (e.n22 || e.n15);
    e.short = e.n22 || e.n15;
    e.r22 = range22(e);
    e.semOnly = e.common ? 0 : i % 10 === 3 ? 1 : i % 10 === 8 ? 2 : 0;
    return e;
  });
  const cur = (y, g) => (y >= 2025 && g <= y - 2024) ? '2022' : '2015';
  // 성적처리: 성취도 단계와 석차등급은 별도 차원 (2022: 부록2 / 2015: PDF 미수록 → 학업성적관리 기준 확인 필요)
  const ACH = ['A5', 'A3', 'P'], ACH_NAMES = { A5: '성취도 5단계(A~E)', A3: '성취도 3단계(A·B·C)', P: '이수(P)' };
  const RANK = ['G9', 'G5', 'N'], RANK_NAMES = { G9: '석차 9등급', G5: '석차 5등급', N: '석차등급 미산출' };
  const isTam = e => e.n15 === '과학탐구실험';
  function achOf(e, cu, t) {
    if (e.dept === '교양') return 'P';
    if (isTam(e)) return cu === '2015' ? 'P' : 'A3';
    if (e.dept === '체육' || e.dept === '예술') return 'A3';
    if (cu === '2015' && t === '진로') return 'A3';
    return 'A5';
  }
  function rankOf(e, cu, t) {
    if (e.dept === '교양' || e.dept === '체육' || e.dept === '예술' || isTam(e)) return 'N';
    if (cu === '2015') return t === '진로' ? 'N' : 'G9';
    if (t === '융합' && (e.dept === '사회' || e.dept === '과학')) return 'N';
    return 'G5';
  }
  function credits(e, cu, s) {
    const r = R(s.code, e.id, 'cr');
    if (e.common) return e.n15 === '한국사' ? 3 : isTam(e) ? 1 : 4;
    if (cu === '2022') { const rg = e.r22; if (rg === '1∼2') return r < 0.5 ? 1 : 2; if (rg === '2∼4') return r < 0.6 ? 2 : r < 0.9 ? 3 : 4; return r < 0.2 ? 3 : r < 0.85 ? 4 : 5; }
    if (e.dept === '체육' || e.dept === '예술' || e.dept === '교양') return 2;
    return e.t15 === '진로' ? 3 : 4;
  }
  const NB = ['제일','중앙','동','서','남','북','신','한빛','미래','예성','학현','솔빛','청람','다산','새솔','푸른','하늘','백석','늘푸른','서림'];
  let _sc = null;
  function schools() {
    if (_sc) return _sc;
    const BIG = { '수원시': 1, '성남시': 1, '고양시': 1, '용인시': 1, '부천시': 1, '화성시': 1 };
    const out = [], used = {};
    SG.forEach((sg, si) => {
      const n = 4 + Math.floor(R(sg, 'n') * 5) + (BIG[sg] ? 4 : 0);
      for (let i = 0; i < n; i++) {
        const seed = sg + '#' + i, tr = R(seed, 'type');
        const type = tr > 0.93 ? '특목고' : tr > 0.81 ? '특성화고' : tr > 0.67 ? '자율고' : '일반고';
        const urban = URBAN_OF[sg];
        const sr = R(seed, 'size') * (urban === '대도시' ? 1.15 : urban === '읍면' ? 0.7 : 1);
        const students = sr > 0.66 ? 900 + Math.round(R(seed, 'st') * 600) : sr > 0.3 ? 480 + Math.round(R(seed, 'st') * 400) : 120 + Math.round(R(seed, 'st') * 340);
        const suffix = type === '특성화고' ? '정보고등학교' : type === '특목고' ? '외국어고등학교' : '고등학교';
        const stem = sg.replace(/[시군]$/, '');
        let k = Math.floor(R(seed, 'nm') * NB.length), name;
        do { name = stem + NB[k % NB.length] + suffix; k++; } while (used[name]);
        used[name] = 1;
        const cd = R(seed, 'cd');
        out.push({ code: 'S' + String(si * 100 + i).padStart(4, '0'), name, sigungu: sg, office: OFFICE_OF[sg], urban, type, students,
          cpg: Math.max(2, Math.round(students / 3 / 26)), found: R(seed, 'fd') < 0.32 ? '사립' : '공립', coed: cd < 0.62 ? '남녀공학' : cd < 0.82 ? '여고' : '남고' });
      }
    });
    return (_sc = out);
  }
  const k = y => Math.min(1, Math.max(0, (y - 2021) / 5));
  function offersFor(s, y, sem) {
    const kk = k(y), out = [];
    const gen = s.cpg <= 6 ? 0 : s.cpg <= 9 ? 1 : 2;
    const sizeF = [0.55, 0.8, 0.97][gen];
    const typeF = s.type === '특목고' ? 1.1 : s.type === '특성화고' ? 0.6 : 1;
    const urbF = s.urban === '읍면' ? 0.82 : s.urban === '중소도시' ? 0.93 : 1;
    const cohort = s.students * (1 - 0.012 * (y - 2022)) / 3;
    for (const e of CAT) for (let g = 1; g <= 3; g++) {
      if (e.gr.indexOf(String(g)) < 0) continue;
      const cu = cur(y, g), name = cu === '2022' ? e.n22 : e.n15;
      if (!name) continue;
      if (e.semOnly && e.semOnly !== sem) continue;
      const t = cu === '2022' ? e.t22 : e.t15;
      let students, classes;
      if (e.common) { students = Math.round(cohort); classes = Math.max(1, Math.round(cohort / 27)); }
      else {
        const trF = Math.max(0.3, 1 + e.tr * (y - 2022));
        const openP = Math.min(0.98, e.pop * (e.pop >= 0.95 ? 1 : sizeF * typeF * urbF * (0.82 + 0.3 * kk)) * Math.min(1.25, trF));
        if (R(s.code, e.id, g, y, 'o') > openP) continue;
        const share = Math.min(0.95, (e.pop >= 0.95 ? 0.85 : 0.1 + 0.4 * e.pop) * (0.6 + 0.8 * R(s.code, e.id, g, y, sem, 'sh')) * trF * (e.gr.length > 1 ? 0.7 : 1));
        students = Math.max(4, Math.round(cohort * share));
        classes = Math.max(1, Math.round(students / (25 - 3 * kk)));
      }
      const cr = credits(e, cu, s);
      out.push({ e, eid: e.id, g, cu, name, type: t, students, classes, credits: cr, hours: classes * cr, ach: achOf(e, cu, t), rank: rankOf(e, cu, t), dept: e.dept, area: e.area, selective: !e.common });
    }
    return out;
  }
  function assign(s, y, sem, offers, staff) {
    const T = [], byDept = {};
    DEPTS.forEach(d => { byDept[d] = []; for (let i = 0; i < staff[d]; i++) { const t = { id: 'T' + (1000 + Math.floor(H(s.code + d + i) * 9000)), dept: d, area: DEPT_AREA[d], hours: 0, major: 0, non: 0, subj: {} }; byDept[d].push(t); T.push(t); } });
    const add = (t, rec, cls, hrs) => {
      t.hours += hrs; if (rec.dept === t.dept) t.major += hrs; else t.non += hrs;
      const q = t.subj[rec.name] || (t.subj[rec.name] = { name: rec.name, ach: rec.ach, rank: rec.rank, dept: rec.dept, area: rec.area, eid: rec.eid, hours: 0, classes: 0 });
      q.hours += hrs; q.classes += cls;
    };
    const pool = d => { if (byDept[d].length) return byDept[d]; let r = RELATED[d]; for (let i = 0; i < 4 && !(byDept[r] && byDept[r].length); i++) r = RELATED[r]; return (byDept[r] && byDept[r].length) ? byDept[r] : T; };
    [...offers].sort((a, b) => b.hours - a.hours).forEach(x => {
      const list = pool(x.dept); if (!list.length) return;
      const by = [...list].sort((a, b) => a.hours - b.hours);
      const n = Math.min(by.length, Math.max(1, Math.ceil(x.hours / 12)), x.classes);
      for (let i = 0; i < n; i++) { const c = Math.floor(x.classes / n) + (i < x.classes % n ? 1 : 0); if (c) add(by[i], x, c, c * x.credits); }
    });
    for (let it = 0; it < 14 && T.length > 1; it++) {
      let hi = T[0], lo = T[0]; T.forEach(t => { if (t.hours > hi.hours) hi = t; if (t.hours < lo.hours) lo = t; });
      if (hi.hours <= 20 || lo.hours >= 15 || hi === lo) break;
      const sj = Object.values(hi.subj).sort((a, b) => a.hours - b.hours)[0];
      if (!sj || hi.hours - sj.hours < 10) break;
      hi.hours -= sj.hours; if (sj.dept === hi.dept) hi.major -= sj.hours; else hi.non -= sj.hours; delete hi.subj[sj.name];
      add(lo, sj, sj.classes, sj.hours);
    }
    const live = T.filter(t => t.hours > 0);
    const cnt = {}; live.forEach(t => { cnt[t.dept] = (cnt[t.dept] || 0) + 1; });
    live.forEach(t => { t.nSubj = Object.keys(t.subj).length; t.multi = t.non > 0; t.solo = cnt[t.dept] === 1 && t.major > 0; });
    return { offers, teachers: live };
  }
  const _sy = {};
  function schoolYear(s, y) {
    const key = s.code + y; if (_sy[key]) return _sy[key];
    const kk = k(y), offs = [offersFor(s, y, 1), offersFor(s, y, 2)], dh = {};
    DEPTS.forEach(d => { dh[d] = 0; });
    offs.forEach(o => o.forEach(x => { dh[x.dept] += x.hours / 2; }));
    const staff = {};
    DEPTS.forEach(d => { const h = dh[d]; staff[d] = h < 8 + 2 * kk ? 0 : Math.max(1, Math.round(h / (16 + 2 * R(s.code, d, y, 'ld') + 2.5 * kk))); });
    return (_sy[key] = { sems: offs.map((o, i) => assign(s, y, i + 1, o, staff)) });
  }
  const ss = (s, y, sem) => schoolYear(s, y).sems[sem - 1];
  const lk = list => list.length + ':' + (list[0] ? list[0].code : '') + ':' + (list.length ? list[list.length - 1].code : '') + ':' + (list.length > 2 ? list[list.length >> 1].code : '');
  const pk = periods => periods.map(p => p.y + '-' + p.sem).join(',');
  const fk = f => [f.grade || 0, f.area || '', f.stype || '', f.cur || 'auto', f.gs ? f.gs.join('') : ''].join(',');
  const okO = (o, f) => o.selective && !(f.gs && f.gs.indexOf(o.g) < 0) && !(f.grade && o.g !== f.grade) && !(f.area && o.area !== f.area) && !(f.stype && o.type !== f.stype) && !(f.cur && f.cur !== 'auto' && o.cu !== f.cur);
  const _ag = {};
  function agg(list, periods, f) {
    f = f || {};
    const key = lk(list) + '|' + pk(periods) + '|' + fk(f);
    if (_ag[key]) return _ag[key];
    let nS = 0, subj = 0, cls = 0, stu = 0, tch = 0, nsub = 0, multi = 0, hours = 0, major = 0, non = 0, solo = 0;
    const dist = [0, 0, 0, 0], ach = { A5: 0, A3: 0, P: 0 }, rank = { G9: 0, G5: 0, N: 0 };
    for (const p of periods) for (const s of list) {
      const x = ss(s, p.y, p.sem); nS++;
      const names = new Set();
      for (const o of x.offers) { if (!okO(o, f)) continue; names.add(o.name); cls += o.classes; stu += o.students; }
      subj += names.size;
      for (const t of x.teachers) {
        if (f.area && t.area !== f.area) continue;
        tch++; nsub += t.nSubj; if (t.multi) multi++; hours += t.hours; major += t.major; non += t.non; if (t.solo) solo++;
        dist[Math.min(3, Math.max(0, t.nSubj - 1))]++;
        for (const q in t.subj) { ach[t.subj[q].ach]++; rank[t.subj[q].rank]++; }
      }
    }
    const n = Math.max(1, nS), tn = tch || NaN, np = Math.max(1, periods.length);
    const r = { empty: nS === 0, noTeacher: tch === 0, schools: list.length, subj: subj / n, cls: cls / n, stu: stu / n, stuTot: stu / np, teachers: tch / n, tchTot: tch / np,
      avgSubj: nsub / tn, multi: multi / tn, hours: hours / tn, major: major / tn, non: non / tn, solo: solo / n, soloTot: solo / np, soloRatio: solo / tn, dist: dist.map(v => v / tn), ach: {}, rank: {} };
    for (const c in ach) r.ach[c] = ach[c] / tn;
    for (const c in rank) r.rank[c] = rank[c] / tn;
    return (_ag[key] = r);
  }
  const _sa = {};
  function subjAgg(list, periods, f) {
    f = f || {};
    const key = lk(list) + '|' + pk(periods) + '|' + fk(f);
    if (_sa[key]) return _sa[key];
    const out = {};
    for (const p of periods) for (const s of list) {
      const seen = {};
      for (const o of ss(s, p.y, p.sem).offers) {
        if (!okO(o, f)) continue;
        const r = out[o.eid] || (out[o.eid] = { stu: 0, cls: 0, open: 0 });
        r.stu += o.students; r.cls += o.classes; if (!seen[o.eid]) { seen[o.eid] = 1; r.open++; }
      }
    }
    const np = Math.max(1, periods.length);
    Object.values(out).forEach(r => { r.stu /= np; r.cls /= np; r.open /= np; });
    return (_sa[key] = out);
  }
  const _da = {};
  function deptAvg(periods) {
    const key = pk(periods); if (_da[key]) return _da[key];
    const sum = {}, n = {};
    for (const p of periods) for (const s of schools()) for (const t of ss(s, p.y, p.sem).teachers) { sum[t.dept] = (sum[t.dept] || 0) + t.hours; n[t.dept] = (n[t.dept] || 0) + 1; }
    const out = {}; DEPTS.forEach(d => { out[d] = n[d] ? sum[d] / n[d] : null; });
    return (_da[key] = out);
  }
  window.V9D = { SG, OFFICES, OFFICE_OF, URBAN_OF, DEPTS, DEPT_AREA, AREAS, CAT, MAP_LABEL, ACH, ACH_NAMES, RANK, RANK_NAMES, AREA15, cur, schools, ss, agg, subjAgg, deptAvg };
})();
