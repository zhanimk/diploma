
import React, { useState, useEffect, useMemo, useRef } from 'react';
import './HomePage.css';

// 1. КОМПОНЕНТ: HERO
const Hero = () => {
  return (
    <section className="jd-hero" id="top">
      <div className="jd-hero__bg">
        <div className="grid-layer" />
        <div className="glow-top" />
        <div className="noise-layer" />
      </div>
      <div className="jd-hero__wrap">
        <div className="jd-hero__left">
          <div className="jd-pill"><span className="pulse" /> <span className="txt uppercase">АШЫҚ РЕЖИМ • LIVE • КӨП ТАТАМИ</span></div>
          <h1 className="jd-hero__title">JUDO ARENA <br /><span className="outline-text">ЭВОЛЮЦИЯСЫ</span></h1>
          <p className="jd-hero__desc">Көрермендерге арналған кәсіби трансляция және ұйымдастыру алқасы үшін жүйені дәл басқару. Жарыс нәтижелері мен хаттамалар лезде жаңартылады.</p>
          <div className="jd-hero__cta">
            <a className="jd-cta jd-cta--primary" href="/viewer">Көрермен экраны <span className="arrow">→</span></a>
            <a className="jd-cta jd-cta--soft" href="/results">Нәтижелерді қарау</a>
          </div>
          <div className="jd-hero__meta">
            <div className="meta-card"><div className="meta-content"><div className="kpi">≤ 1с</div><div className="cap\">жаңарту жылдамдығы</div></div></div>
            <div className="meta-card"><div className="meta-content"><div className="kpi">Multi</div><div className="cap\">татами режимі</div></div></div>
          </div>
        </div>
      </div>
    </section>
  );
};

// 2. КОМПОНЕНТ: ABOUT
const About = () => {
  return (
    <section className="jd-about-platform" id="about">
      <div className="jd-bg-glow" />
      <div className="jd-about-content">
        <header className="section-header">
          <h2 className="jd-about-title">ПЛАТФОРМА ТУРАЛЫ <br /><span className="outline-text">КӘСІБИ ЖҮЙЕ НЕГІЗІ</span></h2>
        </header>
        <p className="jd-about-description">Біздің платформа дзюдо турнирлерін халықаралық стандарттарға сай ұйымдастыруға, бірнеше татамиді орталықтандырылған жүйе арқылы басқаруға және нәтижелерді нақты уақытта бақылауға мүмкіндік береді.</p>
        <div className="jd-about-features">
          <div className="jd-feature-item"><div className="jd-feature-img-wrapper"><img src="https://placehold.co/600x400/2b5ff5/white?text=Тіркеу+Жүйесі" alt="Қатысушыларды тіркеу" className="jd-feature-img" /><div className="jd-card-overlay" /></div><div className="jd-feature-body"><div className="jd-custom-icon icon-reg" /><h3>Тіркеу Жүйесі</h3><p>IJF ережелеріне сәйкес қатысушыларды автоматты түрде салмақ дәрежелеріне бөлу және деректерді валидациялау.</p></div></div>
          <div className="jd-feature-item"><div className="jd-feature-img-wrapper"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6MoIzl-j3JnWskyXp6JsiKO0qNT2_dsGc3g&s" alt="Online Табло" className="jd-feature-img" /><div className="jd-card-overlay" /></div><div className="jd-feature-body"><div className="jd-custom-icon icon-board" /><h3>Online Табло</h3><p>Белдесу барысы мен нәтижелерін кез келген құрылғыдан нақты уақыт режимінде (Real-time) бақылау мүмкіндігі.</p></div></div>
          <div className="jd-feature-item"><div className="jd-feature-img-wrapper"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc0hWfvwGunhkpRtgGRU7jJRa-YBRgLLeoDw&s" alt="Көп татами режимі" className="jd-feature-img" /><div className="jd-card-overlay" /></div><div className="jd-feature-body"><div className="jd-custom-icon icon-tatami" /><h3>Мульти-Татами</h3><p>Ондаған жарыс алаңдарының жұмысын бірыңғай орталықтан қатесіз үйлестіру және басқару.</p></div></div>
        </div>
      </div>
    </section>
  );
};

// 3. КОМПОНЕНТ: SKILL DOJO
const SkillDojo = () => {
  const skills = [
    { id: 1, name: "IPPON SEIO-NAGE", type: "Te-Waza (Қол техникасы)", desc: "Қарсыластың иығынан асыра, бір қолмен ұстап лақтырудың классикалық әдісі." },
    { id: 2, name: "UCHI-MATA", type: "Ashi-Waza (Аяқ техникасы)", desc: "Санмен қағып лақтыру — қазіргі дзюдоның ең тиімді және кең тараған тәсілі." },
    { id: 3, name: "OSOTO-GARI", type: "Ashi-Waza (Аяқ техникасы)", desc: "Сырттан шалып лақтыру. Қарсыластың тепе-теңдігін бұзу арқылы орындалатын күшті әдіс." },
  ];
  const [activeId, setActiveId] = useState(null);

  return (
    <section className="dojo" id="skills">
      <div className="dojo__header">
        <h2 className="dojo__title">ДЗЮДО ӨНЕРІ <br /><span className="outline-text">ТЕХНИКА</span></h2>
        <p className="dojo__subtitle">Әдістің биомеханикасын зерттеу үшін картаға меңзерді апарыңыз</p>
      </div>
      <div className="dojo__grid">
        {skills.map((skill) => (
          <div key={skill.id} className={`skill-card ${activeId === skill.id ? "active" : ""}`} onMouseEnter={() => setActiveId(skill.id)} onMouseLeave={() => setActiveId(null)}>
            <div className="skill-card__glitch" /><div className="skill-card__content">
              <div className="skill-card__tag">{skill.type}</div><h3 className="skill-card__name">{skill.name}</h3>
              <div className="skill-card__visual"><div className="vector-line v1" /><div className="vector-line v2" /><div className="vector-line v3" /><div className="circle-anim" /></div>
              <p className="skill-card__desc">{skill.desc}</p>
              <div className="skill-card__stats\"><span>IMPACT (КҮШІ):</span><div className="power-bar\"><div className="fill\" /></div></div>
            </div><div className="skill-card__blueprint" />
          </div>
        ))}
      </div>
    </section>
  );
};

// 4. КОМПОНЕНТ: ADVANTAGES (С ВЛОЖЕННЫМ METRICCARD)
const MetricCard = ({ val, suffix, label, desc, color, icon, delay }) => {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const currentCard = cardRef.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setVisible(true), delay);
      }
    }, { threshold: 0.1 });

    if (currentCard) {
      observer.observe(currentCard);
    }

    return () => {
      if (currentCard) {
        observer.unobserve(currentCard);
      }
    };
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const end = val;
    const duration = 1500;
    if (start === end) return;
    const timer = setInterval(() => {
      start += Math.ceil(end / 40);
      if (start >= end) { setCount(end); clearInterval(timer); } 
      else { setCount(start); }
    }, duration / 40);
    return () => clearInterval(timer);
  }, [visible, val]);

  return (
    <div className={`adv-v2-card ${visible ? "is-visible" : ""}`} ref={cardRef}>
      <div className="adv-v2-card__ui-corner" />
      <div className="adv-v2-card__visual">
        <svg viewBox="0 0 100 100">
          <circle className="bg" cx="50" cy="50" r="45" />
          <circle className="prog" cx="50" cy="50" r="45" style={{ strokeDashoffset: 283 - (283 * (visible ? (val > 100 ? 100 : val) : 0)) / 100, stroke: color, }} />
        </svg>
        <div className="adv-v2-card__icon">{icon}</div>
      </div>
      <div className="adv-v2-card__info">
        <div className="adv-v2-card__num">{count}<span>{suffix}</span></div>
        <h3 className="adv-v2-card__title" style={{ color }}>{label}</h3>
        <p className="adv-v2-card__desc">{desc}</p>
      </div>
    </div>
  );
};

const Advantages = () => {
  return (
    <section className="adv-v2">
      <div className="adv-v2__grid-bg" />
      <div className="adv-v2__wrap">
        <div className="adv-v2__header">
          <div className="status-bar\"><span className="scanner-line\"></span>ЖҮЙЕЛІК ДИАГНОСТИКА • КӨК БЕЛБЕУ ДЕҢГЕЙІ</div>
          <h2 className="adv-v2__title">ЖҮЙЕ <br /><span className="outline-text">ӨНІМДІЛІГІ</span></h2>
        </div>
        <div className="adv-v2__container">
          <MetricCard val={1} suffix="сек" label="КІДІРІС (LATENCY)" desc="Бүкіл желі бойынша таблоның лезде жауап қатуы (< 1000мс)." color="#2b5ff5" icon="⚡" delay={0} />
          <MetricCard val={32} suffix="+" label="ТАТАМИ САНЫ" desc="Әлем чемпионаты деңгейіне дейін масштабтау мүмкіндігі." color="#2b5ff5" icon="🥋" delay={200} />
          <MetricCard val={100} suffix="%" label="СЕНІМДІЛІК" desc="Деректердің кепілді түрде жеткізілуі және сақталуы." color="#2b5ff5" icon="🛡️" delay={400} />
        </div>
      </div>
    </section>
  );
}

// 5. КОМПОНЕНТ: LIVE SHOWCASE
const TATAMI_DATA = [
  { id: 1, blue: { name: "А. САПАРОВ", club: "Алматы Дзюдо Клубы", score: "1", ippon: 0, wazaari: 1, shido: 1 }, white: { name: "Қ. НҰРҚАН", club: "Астана Дожо", score: "0", ippon: 0, wazaari: 0, shido: 0 }, time: "02:18", category: "Жасөспірімдер (U18) · -66кг · Жартылай финал", queue: [{ k: "ҚАЗІР", v: "U18 · -66кг · 1/2 Финал", p: "Сапаров vs Нұрқан" }, { k: "КЕЛЕСІ", v: "Әйелдер · -52кг · Финал", p: "Иванова vs Ли" }, { k: "КЕЙІН", v: "Ерлер · -73кг · Қола жүлде", p: "Танака vs Силва" }] },
  { id: 2, blue: { name: "Б. ЕРМЕК", club: "Қарағанды Тарлан", score: "0", ippon: 0, wazaari: 0, shido: 2 }, white: { name: "С. ДЖОНСОН", club: "USA Team", score: "1", ippon: 0, wazaari: 1, shido: 1 }, time: "03:45", category: "Ерлер · -81кг · Ширек финал", queue: [{ k: "ҚАЗІР", v: "Ерлер · -81кг · 1/4 Финал", p: "Ермек vs Джонсон" }, { k: "КЕЛЕСІ", v: "Ерлер · -81кг · 1/4 Финал", p: "Ким vs Мюллер" }, { k: "КЕЙІН", v: "Әйелдер · -63кг · Жұбаныш", p: "Смит vs Төлеген" }] },
  { id: 3, blue: { name: "М. ТАКИМОТО", club: "Japan Judo", score: "10", ippon: 1, wazaari: 0, shido: 0 }, white: { name: "Д. СМАҒҰЛОВ", club: "Қазақстан ҰҚ", score: "0", ippon: 0, wazaari: 0, shido: 1 }, time: "01:12", category: "Ерлер · -90кг · Финал", queue: [{ k: "ҚАЗІР", v: "Ерлер · -90кг · Финал", p: "Такимото vs Смағұлов" }, { k: "КЕЛЕСІ", v: "Марапаттау рәсімі", p: "-90кг Салмақ дәрежесі" }, { k: "КЕЙІН", v: "-", p: "-" }] },
];

const LiveShowcase = () => {
  const [tab, setTab] = useState(1);
  const data = useMemo(() => TATAMI_DATA.find((x) => x.id === tab) || TATAMI_DATA[0], [tab]);

  return (
    <section className="jd-live">
      <div className="jd-live__grid-bg" />
      <div className="jd-live__wrap">
        <header className="jd-live__head">
          <div className="jd-live__kicker"><div className="signal-bars"><span className="bar active\"></span><span className="bar active\"></span><span className="bar active\"></span><span className="bar pulse\"></span></div>ТІКЕЛЕЙ ТЕЛЕМЕТРИЯ</div>
          <h2 className="jd-live__title">ТУРНИР АЛАҢЫ <br /><span className="outline-text glow-text">LIVE SHOWCASE</span></h2>
        </header>
        <div className="jd-live__main-layout">
          <div className="jd-showcase">
            <div className="jd-showcase__tabs">{[1, 2, 3].map((n) => (<button key={n} className={`jd-tab-btn ${tab === n ? "is-active" : ""}`} onClick={() => setTab(n)}><span className="tab-id\">0{n}</span><span className="tab-txt\">ТАТАМИ</span></button>))}\
            </div>
            <div className="scoreboard-v3">
              <div className="scoreboard-v3__top"><div className="live-badge\">REC ● ТІКЕЛЕЙ</div><div className="category-badge\">{data.category}</div></div>
              <div className="scoreboard-v3__vs">
                <div className="side blue"><div className="side__score\">{data.blue.score}</div><div className="side__info\"><div className="side__name\">{data.blue.name}</div><div className="side__club\">{data.blue.club}</div><div className="side__stats\"><span>W: {data.blue.wazaari}</span><span className="shido\">S: {data.blue.shido}</span></div></div></div>
                <div className="match-timer"><div className="match-timer__clock\">{data.time}</div><div className="match-timer__label\">GOLDEN SCORE</div></div>
                <div className="side white"><div className="side__info\"><div className="side__name\">{data.white.name}</div><div className="side__club\">{data.white.club}</div><div className="side__stats\"><span>W: {data.white.wazaari}</span><span className="shido\">S: {data.white.shido}</span></div></div><div className="side__score\">{data.white.score}</div></div>
              </div>
            </div>
          </div>
          <aside className="jd-side-panel">
            <h3 className="panel-title\">КЕЗЕКТЕГІ БЕЛДЕСУЛЕР</h3>
            <div className="queue-v3">{data.queue.map((q, i) => (<div key={i} className={`queue-card ${q.k === "ҚАЗІР" ? "active" : ""}`}><div className="queue-card__time\">{q.k}</div><div className="queue-card__content\"><div className="queue-card__cat\">{q.v}</div><div className="queue-card__ppl\">{q.p}</div></div></div>))}\
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

// 6. КОМПОНЕНТ: PARTNERS
const PARTNERS_DATA = [
  { name: "Global Judo", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ24qhKb3mxvX74misOhNpgXR1qeLKtaQZJnQ&s" },
  { name: "Combat Tech", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_SL7lBjK4hurnxZ-wiqMzHYNT3Y4VziFmCA&s" },
  { name: "Elite Sport", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeM9S8nULzD9KMxemShFjsI00lM10LmMZ-sQ&s" },
  { name: "Global Judo", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ24qhKb3mxvX74misOhNpgXR1qeLKtaQZJnQ&s" },
  { name: "Combat Tech", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_SL7lBjK4hurnxZ-wiqMzHYNT3Y4VziFmCA&s" },
  { name: "Elite Sport", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeM9S8nULzD9KMxemShFjsI00lM10LmMZ-sQ&s" },
];

const Partners = () => {
  return (
    <section className="partners-tech">
      <div className="partners-tech__wrap">
        <header className="partners-header">
          <h2 className="partners-v2__title\">OFFICIAL <br /><span className="outline-text">PARTNERS</span></h2>
        </header>
        <div className="partners-tech__slider">
          <div className="partners-tech__track">
            {PARTNERS_DATA.map((p, i) => (
              <div className="tech-card" key={i}>
                <div className="tech-card__inner">
                  <div className="scanner-corner tl\"></div><div className="scanner-corner tr\"></div><div className="scanner-corner bl\"></div><div className="scanner-corner br\"></div>
                  <div className="scan-line\"></div>
                  <div className="logo-box\"><img src={p.img} alt={p.name} /></div>
                  <div className="tech-tag\">{(i + 1).toString().padStart(2, "0")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// 7. КОМПОНЕНТ: BELT DIVIDER
const BeltDivider = ({ color, rank }) => {
  return (
    <div className="belt-divider" style={{ '--belt-color': color }}>
      <div className="belt-divider__strip">
        <div className="belt-divider__text">{rank}</div>
        <div className="belt-divider__patch" />
      </div>
    </div>
  );
};


// ГЛАВНЫЙ КОМПОНЕНТ-СБОРКА
export default function HomePage() {
    return (
        <main>
            <Hero />
            <About />
            <BeltDivider color="#ffea00" rank="Yellow Belt Level" />
            <SkillDojo />
            <BeltDivider color="#2b5ff5" rank="Blue Belt Level" />
            <Advantages />
            <BeltDivider color="#4caf50" rank="Green Belt Level" />
            <LiveShowcase />
            <BeltDivider color="#a67c52" rank="Brown Belt Level" />
            <Partners />
        </main>
    )
}