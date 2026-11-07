/* ===== Shared UI pieces ===== */
function Check({ s = 18 }) { return html`<svg viewBox="0 0 20 20" width=${s} height=${s} aria-hidden="true"><circle cx="10" cy="10" r="9.5" fill="#2F7D5B" stroke="#BFE3C9" /><path d="M5.5,10.5 l3,3 l6,-7" stroke="#FFFFFF" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>`; }
function Arrow({ left }) { return html`<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" style=${{ transform: left ? "scaleX(-1)" : "none" }}><path d="M4,10 h12 M11,5 l5,5 l-5,5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>`; }

const EMBLEM = {
  flame: html`<path d="M50,26 C64,42 70,54 62,70 C60,62 56,58 53,55 C54,64 47,69 47,78 C39,72 35,62 40,52 C42,46 47,40 50,26Z" />`,
  leaf: html`<g><path d="M50,26 C70,38 72,58 50,82 C28,58 30,38 50,26Z" /><path d="M50,34 V86 M50,50 l-9,-6 M50,58 l10,-7 M50,66 l-9,-6" stroke="rgba(0,0,0,.35)" strokeWidth="2" fill="none" /></g>`,
  star: html`<path d="M50,24 L57,44 L78,44 L61,56 L68,76 L50,64 L32,76 L39,56 L22,44 L43,44 Z" />`,
  book: html`<g><path d="M22,40 Q36,34 49,40 V76 Q36,70 22,76 Z" /><path d="M78,40 Q64,34 51,40 V76 Q64,70 78,76 Z" /><path d="M50,30 l4,8 h-8 z" /></g>`
};
function Crest({ house, size = 64, title }) {
  const h = HOUSE[house] || HOUSES[0], gid = "cg-" + h.id + size;
  const metal = h.id === "honeystone" ? "#E9C46A" : h.metal;
  return html`<svg viewBox="0 0 100 120" width=${size} height=${size * 1.2} role=${title ? "img" : undefined} aria-label=${title} aria-hidden=${title ? undefined : "true"} className="crest">
    <defs><linearGradient id=${gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F7E3A6" /><stop offset=".45" stopColor="#C9973F" /><stop offset="1" stopColor="#7A5420" /></linearGradient>
      <linearGradient id=${gid + "f"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor=${h.colour} /><stop offset="1" stopColor=${h.deep} /></linearGradient></defs>
    <path d="M8,8 H92 V60 C92,90 70,106 50,116 C30,106 8,90 8,60 Z" fill=${`url(#${gid})`} />
    <path d="M15,15 H85 V60 C85,85 67,99 50,108 C33,99 15,85 15,60 Z" fill=${`url(#${gid + "f"})`} />
    <g fill=${metal} stroke="rgba(0,0,0,.25)" strokeWidth="1">${EMBLEM[h.emblem]}</g>
  </svg>`;
}
function Pennant({ house, selected }) {
  const h = HOUSE[house];
  const metal = h.id === "honeystone" ? "#E9C46A" : h.metal;
  return html`<svg viewBox="0 0 100 130" className="pennant" aria-hidden="true">
    <defs><linearGradient id=${"pf" + h.id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor=${h.colour} /><stop offset="1" stopColor=${h.deep} /></linearGradient></defs>
    <rect x="4" y="2" width="92" height="7" rx="3" fill="#B58A3C" />
    <path d="M10,9 H90 V104 L50,124 L10,104 Z" fill=${`url(#pf${h.id})`} stroke=${selected ? "#F3D58A" : "#9B7838"} strokeWidth=${selected ? 3 : 1.5} />
    <path d="M16,15 H84 V100 L50,117 L16,100 Z" fill="none" stroke="rgba(243,213,138,.45)" strokeWidth="1" />
    <g transform="translate(18,6) scale(.64)" fill=${metal} stroke="rgba(0,0,0,.3)" strokeWidth="1">${EMBLEM[h.emblem]}</g>
  </svg>`;
}
function Portrait({ id, size = "m", house, alt }) {
  const p = PORTRAITS.find(x => x.id === id) || PORTRAITS[0];
  return html`<span className=${"portrait " + size} style=${house ? { "--ring": HOUSE[house].colour } : null}><img src=${IMG[p.id]} alt=${alt === undefined ? p.alt : alt} /></span>`;
}
function Collectible({ c, unlocked, size = "m" }) {
  return html`<span className=${"relic " + size + (unlocked ? "" : " locked")}><img src=${IMG[c.img]} alt=${unlocked ? c.name : "Locked: " + c.name + " silhouette"} /></span>`;
}
function Bar({ value, max, label, sub }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return html`<div className="bar">
    <div className="row between"><span className="barlabel">${label}</span><span className="small">${sub || `${value} of ${max}`}</span></div>
    <div className="track" role="progressbar" aria-label=${label} aria-valuemin="0" aria-valuemax=${max} aria-valuenow=${value} aria-valuetext=${sub || `${value} of ${max}`}><i style=${{ width: pct + "%" }}></i></div>
  </div>`;
}
function Ribbon({ children, as = "h2", id }) { return html`<div className="ribbon"><${as} id=${id}>${children}<//></div>`; }

function Dialog({ d, close }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    const f = ref.current && ref.current.querySelector("button"); f && f.focus();
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev && prev.focus && prev.focus(); };
  }, []);
  return html`<div className="overlay" onClick=${(e) => { if (e.target === e.currentTarget) close(); }}>
    <div className="dialog frame" role="dialog" aria-modal="true" aria-labelledby="dlg-title" ref=${ref}>
      ${d.media || null}
      <h2 id="dlg-title">${d.title}</h2>
      ${d.body.map((p, i) => html`<p key=${i}>${p}</p>`)}
      <div className="row wrap end">${d.actions.map((a, i) => html`<button key=${i} className=${"btn " + (a.kind || "secondary")} onClick=${() => { close(); a.run && a.run(); }}>${a.label}</button>`)}</div>
    </div></div>`;
}

function SaveStatus({ save }) {
  const m = { off: "Saving unavailable", saving: "Saving…", saved: "Saved on this device", error: "Could not save. Storage may be full.", idle: "Not changed yet",
    online: "Saved online", local: "Saved on this device · waiting to sync", failed: "Save failed · your work is still on screen", conflict: "Changed on another tab or device" }[save.state];
  return html`<span className=${"save " + save.state} role="status" aria-live="polite">${save.state === "saved" || save.state === "online" ? html`<${Check} s=${16} />` : null}${m}</span>`;
}

const NAV = [["home", "Common room"], ["quests", "Quests"], ["calendar", "Calendar"], ["practice", "Practice"], ["collection", "Collection"]];
function Header({ route, go, prof, sound, toggleSound, progress, online }) {
  const NAVX = online ? [...NAV.slice(0, 2), ["classes", "My classes"], ...NAV.slice(2)] : NAV;
  return html`<header className="topbar frame">
    <button className="brand" onClick=${() => go(prof ? "home" : "who")} aria-label="Idea2Write Writing Academy, common room">
      <svg viewBox="0 0 40 40" width="38" height="38" aria-hidden="true"><path d="M8,34 L30,6 C33,4 36,7 34,10 L12,36 Z" fill="#D9B15F" /><path d="M12,36 L8,34 L6,39 Z" fill="#F3E0A8" /><path d="M14,28 C20,22 26,14 30,8" stroke="#7A5420" strokeWidth="1.2" fill="none" /></svg>
      <span className="brandtext"><b>Idea2Write</b><small>Writing Academy</small></span>
    </button>
    ${prof ? html`<nav aria-label="Main"><ul>${NAVX.map(([r, l]) => html`<li key=${r}><button className=${"navlink" + (route === r ? " on" : "")} aria-current=${route === r ? "page" : undefined} onClick=${() => go(r)}>${NAV_ICON[r]}<span>${l}</span></button></li>`)}</ul></nav>` : null}
    <div className="row gap-s hdr-right">
      ${Ambient.supported ? html`<button className="iconpill" aria-pressed=${sound} onClick=${toggleSound} title="Fireside ambience and sound effects">${sound ? "♪ Sound on" : "♪ Sound off"}</button>` : null}
      ${prof ? html`<${React.Fragment}><span className="pill stars" title="Stars earned"><span aria-hidden="true">★</span> ${progress.stars}<span className="sr"> stars</span></span>
        <button className=${"profilebtn" + (route === "profile" ? " on" : "")} onClick=${() => go("profile")} aria-current=${route === "profile" ? "page" : undefined}>
          <${Portrait} id=${prof.portrait} size="xs" house=${prof.house} alt="" /><span>My profile</span></button><//>` : null}
    </div>
  </header>`;
}

function Footer({ go, prof, online }) {
  return html`<footer className="foot"><span>Idea2Write Writing Academy · From ideas to confident writing.</span>
    <nav aria-label="More pages" className="row wrap gap-s">
      ${prof ? html`<button className="linkbtn" onClick=${() => go("journal")}>My quest journal</button>` : null}
      <button className="linkbtn" onClick=${() => go("guide")}>User Guide</button>
      <button className="linkbtn" onClick=${() => go("teacher")}>For Teachers</button>
      <button className="linkbtn" onClick=${() => go("credits")}>Credits</button>
      <button className="linkbtn" onClick=${() => go("feedback")}>Feedback</button>
      ${online ? null : html`<button className="linkbtn" onClick=${() => go("who")}>Switch pupil</button>`}
    </nav></footer>`;
}

function Backdrop({ scene, house, art }) {
  const h = HOUSE[house] || HOUSES[0];
  useEffect(() => { if (REDUCED()) return; let raf = 0; const mv = (e) => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; document.documentElement.style.setProperty("--px", ((e.clientX / innerWidth) - 0.5).toFixed(3)); document.documentElement.style.setProperty("--py", ((e.clientY / innerHeight) - 0.5).toFixed(3)); }); };
    addEventListener("pointermove", mv); return () => removeEventListener("pointermove", mv); }, []);
  return html`<div className=${"backdrop scene-" + scene} aria-hidden="true" style=${{ "--house": h.colour, "--house-deep": h.deep }}>
    <div className="bd-sky" style=${{ backgroundImage: `url(${art || IMG.castle})` }}></div>
    <div className="bd-left" style=${{ backgroundImage: `url(${scene === "room" ? IMG.fireplace : IMG.candles})` }}></div>
    <div className="bd-right" style=${{ backgroundImage: `url(${IMG.windows})` }}></div>
    <div className="bd-glow"></div><${Particles} scene=${scene} /><div className="bd-vignette"></div>
  </div>`;
}

/* ===== Interaction & atmosphere ===== */
const tilt = {
  onPointerMove: (e) => { if (REDUCED() || e.pointerType === "touch") return; const el = e.currentTarget, r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", ((x - 0.5) * 10).toFixed(2) + "deg"); el.style.setProperty("--rx", ((0.5 - y) * 8).toFixed(2) + "deg"); el.style.setProperty("--mx", (x * 100) + "%"); el.style.setProperty("--my", (y * 100) + "%"); },
  onPointerLeave: (e) => { const el = e.currentTarget; el.style.setProperty("--ry", "0deg"); el.style.setProperty("--rx", "0deg"); }
};

function Particles({ scene }) {
  const ref = useRef(null);
  useEffect(() => {
    if (REDUCED()) return;
    const c = ref.current, x = c.getContext("2d"); let raf, w, h, dpr = Math.min(2, window.devicePixelRatio || 1), parts = [];
    const kind = scene === "room" ? "ember" : scene === "library" ? "dust" : "star";
    const N = kind === "star" ? 70 : 46;
    const resize = () => { w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr; c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px"; };
    const spawn = (init) => kind === "star" ? { x: Math.random() * w, y: Math.random() * h * 0.45, r: (Math.random() * 1.2 + 0.4) * dpr, p: Math.random() * 6.28, s: 0.01 + Math.random() * 0.03 }
      : { x: Math.random() * w, y: init ? Math.random() * h : h + 10, r: (kind === "ember" ? Math.random() * 1.8 + 0.8 : Math.random() * 1.4 + 0.5) * dpr, vy: (kind === "ember" ? 0.35 + Math.random() * 0.8 : 0.08 + Math.random() * 0.2) * dpr, p: Math.random() * 6.28, life: 1 };
    resize(); for (let i = 0; i < N; i++) parts.push(spawn(true));
    const col = kind === "ember" ? "255,170,80" : kind === "dust" ? "243,220,154" : "235,240,255";
    const loop = () => {
      x.clearRect(0, 0, w, h);
      parts.forEach((q, i) => {
        q.p += kind === "star" ? q.s : 0.02;
        let a;
        if (kind === "star") a = 0.35 + 0.45 * Math.sin(q.p);
        else { q.y -= q.vy; q.x += Math.sin(q.p) * 0.4 * dpr; a = Math.max(0, Math.min(1, q.y / h)) * (kind === "ember" ? 0.9 : 0.5); if (q.y < -10) parts[i] = spawn(false); }
        const g = x.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r * 4); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
        x.fillStyle = g; x.beginPath(); x.arc(q.x, q.y, q.r * 4, 0, 6.28); x.fill();
      });
      raf = requestAnimationFrame(loop);
    };
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden) loop(); };
    loop(); addEventListener("resize", resize); document.addEventListener("visibilitychange", vis);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); document.removeEventListener("visibilitychange", vis); };
  }, [scene]);
  return html`<canvas className="bd-canvas" ref=${ref} aria-hidden="true"></canvas>`;
}

function DoorTransition({ info, done }) {
  useEffect(() => { if (REDUCED()) { done(); return; } const id = setTimeout(done, 2600); return () => clearTimeout(id); }, []);
  const h = HOUSE[info.house];
  return html`<div className="doors" style=${{ "--house": h.colour }} onClick=${done} role="status" aria-live="polite">
    <div className="door left" aria-hidden="true"></div><div className="door right" aria-hidden="true"></div>
    <div className="doorlight" aria-hidden="true"></div>
    <div className="doortext"><${Crest} house=${h.id} size=${80} /><p className="eyebrow">Welcome to the ${h.name} common room</p><p className="doorname">${info.name}</p></div>
  </div>`;
}

function StarBurst() {
  const ref = useRef(null);
  useEffect(() => {
    if (REDUCED()) return;
    const c = ref.current, x = c.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = c.width = c.offsetWidth * dpr, H = c.height = c.offsetHeight * dpr;
    const ps = Array.from({ length: 60 }, () => { const a = Math.random() * 6.28, v = (2 + Math.random() * 5) * dpr; return { x: W / 2, y: H * 0.3, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2 * dpr, r: (2 + Math.random() * 3) * dpr, life: 1 }; });
    let raf, t = 0;
    const star = (cx, cy, r) => { x.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); };
    const loop = () => { x.clearRect(0, 0, W, H); t++;
      ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.12 * dpr; p.vx *= 0.985; p.life -= 0.012; if (p.life > 0) { x.fillStyle = `rgba(255,${200 + Math.random() * 40 | 0},110,${p.life})`; star(p.x, p.y, p.r); } });
      if (t < 110) raf = requestAnimationFrame(loop); else x.clearRect(0, 0, W, H); };
    loop(); return () => cancelAnimationFrame(raf);
  }, []);
  return html`<canvas className="burst" ref=${ref} aria-hidden="true"></canvas>`;
}

function CountUp({ from, to, ms = 1200 }) {
  const [v, setV] = useState(REDUCED() ? to : from);
  useEffect(() => { if (REDUCED()) return; let raf; const t0 = performance.now(); const step = (t) => { const k = Math.min(1, (t - t0) / ms); setV(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf); }, [from, to]);
  return html`<span>${v}</span>`;
}

class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    return html`<div className="frame panel stack-s" role="alert" style=${{ maxWidth: "640px", margin: "40px auto" }}><h1>Something went wrong</h1>
      <p>The academy hit a problem and stopped this screen. Your saved writing is still on this device.</p>
      <p className="small muted">Details: ${String(this.state.err && this.state.err.message || this.state.err)}</p>
      <div className="row gap-s"><button className="btn gold" onClick=${() => this.setState({ err: null })}>Try again</button><button className="btn secondary" onClick=${() => location.reload()}>Reload the page</button></div></div>`;
  }
}

const NAV_ICON = {
  home: html`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3,11 L12,4 L21,11 V20 H15 V14 H9 V20 H3 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>`,
  quests: html`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5,20 L18,5 C19,4 21,6 20,7 L7,21 Z M5,20 L4,22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>`,
  calendar: html`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M3.5,10 H20.5 M8,3 V7 M16,3 V7" stroke="currentColor" strokeWidth="1.6" /></svg>`,
  classes: html`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3,9 L12,4 L21,9 L12,14 Z M7,11.5 V16 C9,18 15,18 17,16 V11.5 M21,9 V14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>`,
  practice: html`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4,5 Q8,3.5 12,5.5 Q16,3.5 20,5 V19 Q16,17.5 12,19.5 Q8,17.5 4,19 Z M12,5.5 V19.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>`,
  collection: html`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7,4 H17 V8 C17,11 15,13 12,13 C9,13 7,11 7,8 Z M7,6 H4 C4,9 5.5,10 7.5,10 M17,6 H20 C20,9 18.5,10 16.5,10 M12,13 V17 M8,20 H16 M9,17 H15 V20 H9 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>`
};
