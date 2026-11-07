/* ===== Writing quest screens: Explore → Organise → Write → Review → reward ===== */
const STEPS = [["explore", "Explore"], ["plan", "Organise"], ["write", "Write"], ["review", "Review"]];

function ActivityBar({ attempt, step, setLevel, goStep, changeTopic, save }) {
  const t = TOPIC[attempt.topicId], idx = STEPS.findIndex(s => s[0] === step);
  return html`<div className="actbar frame">
    <div className="row wrap between gap-s">
      <div className="row gap-s wrap"><span className="scroll-ic" aria-hidden="true">✒</span><span className="acttitle">${t.title}</span>
        <span className="pill">Year ${attempt.year}</span><span className="pill">${t.purpose}</span></div>
      <div className="row wrap gap-s"><${SaveStatus} save=${save} /><button className="btn ghost small" onClick=${changeTopic}>Change quest</button></div>
    </div>
    <div className="row wrap between gap-s">
      <ol className="progress" aria-label="Quest steps">
        ${STEPS.map(([id, label], i) => html`<li key=${id}>
          <button className=${"pstep" + (i === idx ? " now" : i < idx ? " done" : "")} aria-current=${i === idx ? "step" : undefined} onClick=${() => goStep(id)}>
            <span className="num" aria-hidden="true">${i < idx ? "✓" : i + 1}</span>${label}${i < idx ? html`<span className="sr"> (visited)</span>` : null}</button></li>`)}
      </ol>
      <div className="levelswitch" role="group" aria-label="Support option">
        ${LEVELS.map(l => html`<button key=${l.id} aria-pressed=${attempt.level === l.id} onClick=${() => setLevel(l.id)}>${attempt.level === l.id ? "✓ " : ""}${l.name}</button>`)}
      </div>
    </div>
  </div>`;
}

function NavRow({ back, backLabel = "Back", next, nextLabel = "Continue", note }) {
  return html`<div className="navrow">
    ${back ? html`<button className="btn secondary" onClick=${back}><${Arrow} left=${true} /> ${backLabel}</button>` : html`<span />`}
    <div className="row wrap end gap-s">${note ? html`<span className="hintnote" role="status">${note}</span>` : null}
      ${next ? html`<button className="btn gold" onClick=${next}>${nextLabel} <${Arrow} /></button>` : null}</div>
  </div>`;
}

function Vocab({ list, open, selectedWord, onSelect }) {
  const [sel, setSel] = useState(null);
  const current = onSelect ? selectedWord : sel;
  const item = list.find(v => v[0] === current);
  return html`<details className="panel frame" open=${open}>
    <summary>Word bank <span className="muted small">(optional · ${list.length} words)</span></summary>
    <p className="small muted">Choose a word to see what it means.</p>
    <div className="chiprow">${list.map(([w]) => html`<button key=${w} className=${"wordchip" + (current === w ? " on" : "")} aria-pressed=${current === w} onClick=${() => onSelect ? onSelect(current === w ? null : w) : setSel(sel === w ? null : w)}>${w}</button>`)}</div>
    <div className="meaning" aria-live="polite">${item ? html`<span><strong>${item[0]}</strong>: ${item[1]}</span>` : html`<span className="muted">No word chosen yet.</span>`}</div>
  </details>`;
}

function IdeaItem({ c, update, remove }) {
  const [edit, setEdit] = useState(false), [val, setVal] = useState(c.text);
  if (edit) return html`<li className="idea editing"><label className="sr" htmlFor=${"ed-" + c.id}>Edit idea</label>
    <input id=${"ed-" + c.id} className="field" value=${val} onChange=${e => setVal(e.target.value)} onKeyDown=${e => { if (e.key === "Enter" && val.trim()) { update(val.trim()); setEdit(false); } if (e.key === "Escape") setEdit(false); }} autoFocus />
    <button className="btn small gold" onClick=${() => { if (val.trim()) { update(val.trim()); setEdit(false); } }}>Save</button>
    <button className="btn small ghost" onClick=${() => { setVal(c.text); setEdit(false); }}>Cancel</button></li>`;
  return html`<li className="idea"><span className="ideatext">${c.text}</span>
    <button className="btn small ghost" onClick=${() => { setVal(c.text); setEdit(true); }} aria-label=${"Edit idea: " + c.text}>Edit</button>
    <button className="btn small ghost danger" onClick=${remove} aria-label=${"Remove idea: " + c.text}>Remove</button></li>`;
}

/* Extra Guide-me support: noticing prompts and picture words beside the picture */
function LookClosely({ t, addIdea, word, setWord }) {
  const [own, setOwn] = useState(""), [msg, setMsg] = useState("");
  const pictured = pictureWords(t);
  const prompts = ["What can you see in the picture?", "Who is in the picture, and what are they doing?", "Which word below matches something in the picture?"];
  const it = pictured.find(v => v[0] === word);
  return html`<section className="frame panel stack-s lookclosely" aria-labelledby="lc-h">
    <h2 id="lc-h" className="h3">Look closely <span className="small muted">(Guide me)</span></h2>
    <ol className="small lc-prompts">${prompts.map(p => html`<li key=${p}>${p}</li>`)}</ol>
    <p className="small"><strong>Picture words:</strong> choose one to see its meaning.</p>
    <div className="chiprow">${pictured.map(([w]) => html`<button key=${w} className=${"wordchip" + (word === w ? " on" : "")} aria-pressed=${word === w} onClick=${() => setWord(word === w ? null : w)}>${w}</button>`)}</div>
    <div className="meaning" aria-live="polite">${it ? html`<span><strong>${it[0]}</strong>: ${it[1]}</span>` : html`<span className="muted">No word chosen yet.</span>`}</div>
    <label htmlFor="lc-own" className="small strong">Write what you notice, in your own words</label>
    <div className="row gap-s addrow"><input id="lc-own" className="field" value=${own} placeholder=${"I can see…"} onChange=${e => { setOwn(e.target.value); setMsg(""); }} onKeyDown=${e => { if (e.key === "Enter" && own.trim()) { addIdea(own.trim()); setOwn(""); setMsg("Added to your ideas."); } }} />
      <button className="btn secondary small" onClick=${() => { if (!own.trim()) { setMsg("Type what you notice first."); return; } addIdea(own.trim()); setOwn(""); setMsg("Added to your ideas."); }}>Add to my ideas</button></div>
    <p className="small hintnote" role="status">${msg}</p>
  </section>`;
}

function Explore({ a, update, next, back }) {
  const t = TOPIC[a.topicId], lv = a.level;
  const [pictureWord, setPictureWord] = useState(null);
  useEffect(() => setPictureWord(null), [a.topicId]);
  const [text, setText] = useState(""), [msg, setMsg] = useState(""), [moreQ, setMoreQ] = useState(lv === "easy");
  const shown = lv === "easy" || moreQ ? t.questions : lv === "medium" ? t.questions.slice(0, 4) : [];
  const answerCard = (i) => a.cards.find(c => c.q === i);
  const setAnswer = (i, v) => update(x => {
    const ex = x.cards.find(c => c.q === i);
    if (!v.trim()) return { ...x, cards: x.cards.filter(c => c.q !== i) };
    if (ex) return { ...x, cards: x.cards.map(c => c.q === i ? { ...c, text: v } : c) };
    return { ...x, cards: [...x.cards, { id: uid("c"), text: v, section: null, q: i }] };
  });
  const add = () => { const v = text.trim(); if (!v) { setMsg("Type a short idea first, then choose Add idea."); return; } update(x => ({ ...x, cards: [...x.cards, { id: uid("c"), text: v, section: null }] })); setText(""); setMsg("Idea added."); };
  const free = a.cards.filter(c => c.q === undefined);
  return html`<div className="stack-l">
    <div className="stack-s"><h1 tabIndex="-1">Explore your ideas</h1><p className="lead">${t.task}</p></div>
    ${a.assignment ? html`<${AssignmentNote} as=${a.assignment} />` : null}
    <div className="explore-grid">
      <div className="stack">
        <figure className="frame panel picture"><figcaption className="tagline">Picture prompt</figcaption><span className="qframe big"><${Scene} id=${t.scene} alt=${t.alt} interactive=${true} selectedWord=${pictureWord} onSelect=${setPictureWord} /></span><p className="small muted">${t.alt}</p><p className="small muted">Hover over an object or action to see its name. On a touch screen, tap it; with a keyboard, Tab to it and press Enter.</p>${lv === "easy" ? html`<${PictureActions} t=${t} selectedWord=${pictureWord} onSelect=${setPictureWord} />` : null}</figure>
        ${lv === "easy" ? html`<${LookClosely} t=${t} word=${pictureWord} setWord=${setPictureWord} addIdea=${v => update(x => ({ ...x, cards: [...x.cards, { id: uid("c"), text: v, section: null }] }))} />` : null}
      </div>
      <div className="stack">
        ${lv === "hard" ? html`<div className="frame panel stack-s"><h2 className="h3">Your writing goal</h2><p>${t.goal}</p><p className="small">Year ${a.year} goal: <strong>${yearOf(a.year).goalText}</strong>.</p>
          ${!moreQ ? html`<button className="btn secondary small align-start" onClick=${() => setMoreQ(true)}>Need a hint? Show guiding questions</button>` : null}</div>` : null}
        ${shown.length ? html`<div className="frame panel stack-s"><h2 className="h3">Think about… <span className="small muted">(your answers become idea cards)</span></h2>
          <ol className="qanswers">${shown.map((q, i) => { const c = answerCard(i); return html`<li key=${q}><label htmlFor=${"qa-" + i}>${q}</label>
            <input id=${"qa-" + i} className="field" value=${c ? c.text : ""} onChange=${e => setAnswer(i, e.target.value)} placeholder="Type your own answer" /></li>`; })}</ol>
          ${lv === "medium" && !moreQ ? html`<button className="linkbtn small align-start" onClick=${() => setMoreQ(true)}>Show more questions</button>` : null}</div>` : null}
        <div className="frame panel stack-s">
          <label htmlFor="idea-input" className="h3">Add another idea</label>
          <div className="row gap-s addrow"><input id="idea-input" className="field" value=${text} placeholder="A few words or a short sentence" onChange=${e => { setText(e.target.value); setMsg(""); }} onKeyDown=${e => { if (e.key === "Enter") add(); }} />
            <button className="btn gold" onClick=${add}>Add idea</button></div>
          <p className="small hintnote" role="status">${msg}</p>
        </div>
        ${lv === "hard" ? html`<details className="panel frame"><summary>Word ideas (optional)</summary><p className="small">${t.vocab.slice(0, 6).map(v => v[0]).join(", ")}</p></details>`
          : html`<${Vocab} list=${lv === "easy" ? t.vocab : t.vocab.slice(0, 6)} open=${lv === "easy"} selectedWord=${pictureWord} onSelect=${lv === "easy" ? setPictureWord : null} />`}
        ${lv !== "hard" ? html`<details className="panel frame" open=${lv === "easy"}><summary>Sentence starters <span className="muted small">(optional, for later)</span></summary>
          <p className="small muted">You can use these when you write. You finish each sentence in your own words.</p><ul className="small">${t.starters.map(s => html`<li key=${s}>${s}</li>`)}</ul></details>` : null}
      </div>
    </div>
    ${free.length ? html`<section className="frame panel stack-s" aria-labelledby="mine"><h2 id="mine" className="h3">My other ideas (${free.length})</h2>
      <ul className="ideas">${free.map(c => html`<${IdeaItem} key=${c.id} c=${c} update=${v => update(x => ({ ...x, cards: x.cards.map(k => k.id === c.id ? { ...k, text: v } : k) }))} remove=${() => update(x => ({ ...x, cards: x.cards.filter(k => k.id !== c.id) }))} />`)}</ul></section>` : null}
    <${NavRow} back=${back} backLabel="Support options" next=${next} nextLabel="Next: Organise" note=${a.cards.length ? a.cards.length + " idea(s) ready to organise" : "Answer a question or add an idea first. It helps your plan."} />
  </div>`;
}

function AssignmentNote({ as }) {
  return html`<div className="parchment-card stack-xs asg-note"><p className="eyebrow ink">Class quest · ${as.className} · ${as.teacherName}${as.due ? " · due " + fmtDS(as.due) : ""}</p>
    ${as.instructions ? html`<p><strong>Teacher's instructions:</strong> ${as.instructions}</p>` : html`<p>Your teacher set this quest for your class.</p>`}
    <p className="small">Your drafts stay private. Your teacher sees your writing only after you submit it.</p></div>`;
}

/* ---- Organise ---- */
function PlanCard({ c, a, moveTo, moveBy, edit, remove, first, last, picked, pick, onDragState }) {
  const [editing, setEditing] = useState(false), [val, setVal] = useState(c.text);
  const opts = [{ id: "", label: "Idea tray" }, ...a.sections.map(s => ({ id: s.id, label: s.label }))];
  return html`<li className=${"pcard" + (picked ? " picked" : "")} draggable=${!editing} onDragStart=${e => { e.dataTransfer.setData("text/plain", c.id); e.dataTransfer.effectAllowed = "move"; onDragState && onDragState(c.id); }} onDragEnd=${() => onDragState && onDragState(null)} data-card=${c.id}>
    ${editing ? html`<div className="row gap-s"><label className="sr" htmlFor=${"pe-" + c.id}>Edit card</label><input id=${"pe-" + c.id} className="field" value=${val} onChange=${e => setVal(e.target.value)} autoFocus onKeyDown=${e => { if (e.key === "Enter" && val.trim()) { edit(val.trim()); setEditing(false); } if (e.key === "Escape") setEditing(false); }} />
      <button className="btn small gold" onClick=${() => { if (val.trim()) { edit(val.trim()); setEditing(false); } }}>Save</button></div>`
    : html`<p className="pctext"><span className="grip" aria-hidden="true">⋮⋮</span>${c.text}</p>`}
    <div className="pcactions">
      <label className="sr" htmlFor=${"mv-" + c.id}>Move “${c.text}” to</label>
      <select id=${"mv-" + c.id} className="mini-select" value=${c.section || ""} onChange=${e => moveTo(e.target.value || null)}>
        ${opts.map(o => html`<option key=${o.id} value=${o.id}>${o.id === (c.section || "") ? "In: " : "Move to: "}${o.label}</option>`)}
      </select>
      <button className="iconbtn" onClick=${pick} aria-pressed=${picked} aria-label=${(picked ? "Put down: " : "Pick up to move: ") + c.text} title=${picked ? "Put down" : "Pick up, then choose Place here"}>${picked ? "✋" : "☝"}</button>
      <button className="iconbtn" onClick=${() => moveBy(-1)} disabled=${first} aria-label=${"Move up: " + c.text} title="Move up">↑</button>
      <button className="iconbtn" onClick=${() => moveBy(1)} disabled=${last} aria-label=${"Move down: " + c.text} title="Move down">↓</button>
      <button className="iconbtn" onClick=${() => { setVal(c.text); setEditing(true); }} aria-label=${"Edit: " + c.text} title="Edit">✎</button>
      <button className="iconbtn danger" onClick=${remove} aria-label=${"Delete: " + c.text} title="Delete">✕</button>
    </div></li>`;
}

function AddCard({ onAdd, label }) {
  const [v, setV] = useState(""); const id = useMemo(() => uid("ac"), []);
  return html`<div className="addcard"><label className="sr" htmlFor=${id}>${label}</label>
    <input id=${id} className="field small" placeholder="Add a detail" value=${v} onChange=${e => setV(e.target.value)} onKeyDown=${e => { if (e.key === "Enter" && v.trim()) { onAdd(v.trim()); setV(""); } }} />
    <button className="btn small secondary" onClick=${() => { if (v.trim()) { onAdd(v.trim()); setV(""); } }}>+ Add</button></div>`;
}

function SectionHead({ s, a, update, level }) {
  const [ren, setRen] = useState(false), [val, setVal] = useState(s.label), [hint, setHint] = useState(false);
  const saveName = () => { if (val.trim()) update(x => ({ ...x, sections: x.sections.map(k => k.id === s.id ? { ...k, label: val.trim() } : k) })); setRen(false); };
  return html`<div className="sechead">
    ${ren ? html`<div className="row gap-s"><label className="sr" htmlFor=${"rn-" + s.id}>Section name</label><input id=${"rn-" + s.id} className="field small" value=${val} onChange=${e => setVal(e.target.value)} autoFocus onKeyDown=${e => { if (e.key === "Enter") saveName(); }} />
      <button className="btn small gold" onClick=${saveName}>Save</button></div>`
      : html`<div className="row between gap-s"><h3>${s.label}</h3><button className="linkbtn small" onClick=${() => { setVal(s.label); setRen(true); }} aria-label=${"Rename section " + s.label}>Rename</button></div>`}
    ${level === "easy" && s.hint ? html`<p className="small muted">${s.hint}</p>` : null}
    ${level !== "easy" && s.hint ? html`<${React.Fragment}><button className="linkbtn small" aria-expanded=${hint} onClick=${() => setHint(!hint)}>${hint ? "Hide hint" : "Need a hint?"}</button>${hint ? html`<p className="small muted">${s.hint}</p>` : null}<//>` : null}
    ${a.year > 4 ? html`<div className="row gap-s small"><label htmlFor=${"pa-" + s.id}>Paragraph</label>
      <select id=${"pa-" + s.id} className="mini-select" value=${s.para} onChange=${e => update(x => ({ ...x, sections: x.sections.map(k => k.id === s.id ? { ...k, para: +e.target.value } : k) }))}>
        ${Array.from({ length: a.maxPara }, (_, i) => html`<option key=${i} value=${i + 1}>${i + 1}</option>`)}</select></div>` : null}
  </div>`;
}

function Plan({ a, update, next, back }) {
  const t = TOPIC[a.topicId];
  const [over, setOver] = useState(null), [live, setLive] = useState(""), [picked, setPicked] = useState(null), [dragging, setDragging] = useState(null);
  /* While a card is dragged, scroll the page when the pointer nears the top or bottom edge */
  useEffect(() => {
    if (!dragging) return;
    let y = null, raf = 0;
    const onOver = (e) => { y = e.clientY; };
    const tick = () => { if (y !== null) { const edge = 110, h = window.innerHeight; if (y < edge) window.scrollBy(0, -Math.ceil((edge - y) / 5)); else if (y > h - edge - 70) window.scrollBy(0, Math.ceil((y - (h - edge - 70)) / 5)); } raf = requestAnimationFrame(tick); };
    document.addEventListener("dragover", onOver); raf = requestAnimationFrame(tick);
    return () => { document.removeEventListener("dragover", onOver); cancelAnimationFrame(raf); };
  }, [dragging]);
  const cardsIn = (sid) => a.cards.filter(c => (c.section || null) === sid);
  const label = (sid) => sid ? (a.sections.find(s => s.id === sid) || {}).label : "Idea tray";
  const moveTo = (id, sid) => { Sfx.play("place"); update(x => { const c = x.cards.find(k => k.id === id); const rest = x.cards.filter(k => k.id !== id); return { ...x, cards: [...rest, { ...c, section: sid }] }; }); setLive("Card moved to " + label(sid) + "."); setPicked(null); };
  const moveBefore = (id, targetId) => update(x => { if (id === targetId) return x; const c = x.cards.find(k => k.id === id); const tgt = x.cards.find(k => k.id === targetId); const rest = x.cards.filter(k => k.id !== id); const i = rest.findIndex(k => k.id === targetId); rest.splice(i, 0, { ...c, section: tgt.section }); return { ...x, cards: rest }; });
  const moveBy = (id, dir) => { update(x => { const c = x.cards.find(k => k.id === id); const same = x.cards.filter(k => (k.section || null) === (c.section || null)); const j = same.findIndex(k => k.id === id) + dir; if (j < 0 || j >= same.length) return x; const other = same[j]; const arr = [...x.cards]; const ia = arr.findIndex(k => k.id === id), ib = arr.findIndex(k => k.id === other.id); [arr[ia], arr[ib]] = [arr[ib], arr[ia]]; return { ...x, cards: arr }; }); setLive("Card moved " + (dir < 0 ? "up." : "down.")); };
  const zone = (sid) => ({
    onDragOver: e => { e.preventDefault(); setOver(sid || "tray"); },
    onDragLeave: () => setOver(null),
    onDrop: e => { e.preventDefault(); setOver(null); setDragging(null); const id = e.dataTransfer.getData("text/plain"); if (!id) return; const tc = e.target.closest && e.target.closest("[data-card]"); if (tc && tc.dataset.card !== id) { moveBefore(id, tc.dataset.card); setLive("Card moved."); } else moveTo(id, sid); }
  });
  const place = (sid) => picked ? html`<button className="btn small gold placebtn" onClick=${() => moveTo(picked, sid)}>Place here</button>` : null;
  const list = (sid) => { const cs = cardsIn(sid); return html`<ul className="pcards">${cs.map((c, i) => html`<${PlanCard} key=${c.id} c=${c} a=${a} first=${i === 0} last=${i === cs.length - 1}
      onDragState=${setDragging} picked=${picked === c.id} pick=${() => { setPicked(picked === c.id ? null : c.id); setLive(picked === c.id ? "Card put down." : "Card picked up. Choose Place here on a section."); }}
      moveTo=${s => moveTo(c.id, s)} moveBy=${d => moveBy(c.id, d)}
      edit=${v => update(x => ({ ...x, cards: x.cards.map(k => k.id === c.id ? { ...k, text: v } : k) }))}
      remove=${() => { update(x => ({ ...x, cards: x.cards.filter(k => k.id !== c.id) })); setLive("Card deleted."); }} />`)}</ul>`; };
  const addSection = (para) => update(x => ({ ...x, sections: [...x.sections, { id: uid("s"), label: "New section", hint: "", para: para || x.maxPara }] }));
  const removeSection = (sid) => update(x => ({ ...x, sections: x.sections.filter(s => s.id !== sid), cards: x.cards.map(c => c.section === sid ? { ...c, section: null } : c) }));
  const missingSuggested = a.level !== "hard" && t.sections.some(([id]) => !a.sections.find(s => s.id === id));
  const groups = Array.from({ length: a.year === 4 ? 1 : a.maxPara }, (_, i) => i + 1);
  return html`<div className="stack-l">
    <div className="stack-s"><h1 tabIndex="-1">Give your ideas a home</h1>
      <p className="lead">Move your idea cards into the planner and put them in order. Drag a card, tap ☝ then “Place here”, or use the Move menu and ↑ ↓.</p></div>
    ${a.level === "easy" ? html`<div className="frame panel guidebox"><span className="qframe mini"><${Scene} id=${t.scene} alt=${t.alt} /></span>
      <div className="stack-xs"><p className="h3">How to organise (Guide me)</p><ol className="small"><li>Read each box's name and hint.</li><li>Move each idea card into the box where it fits best.</li><li>Use ↑ ↓ to put the cards in the order you will write them.</li></ol></div></div>` : null}
    <p className="sr" role="status" aria-live="polite">${live}</p>
    <section className=${"frame panel tray" + (over === "tray" ? " over" : "")} aria-labelledby="tray-h" ...${zone(null)}>
      <div className="row between wrap"><h2 id="tray-h" className="h3">Idea tray (${cardsIn(null).length})</h2>${place(null)}</div>
      ${cardsIn(null).length ? list(null) : html`<p className="muted small">The tray is empty. All your ideas are in the planner.</p>`}
      <${AddCard} label="Add a new idea to the tray" onAdd=${v => update(x => ({ ...x, cards: [...x.cards, { id: uid("c"), text: v, section: null }] }))} />
    </section>
    ${missingSuggested ? html`<div className="note row wrap between"><span>This planner has open sections. You can add the suggested sections for this quest.</span>
      <button className="btn small secondary" onClick=${() => update(x => ({ ...x, sections: [...x.sections, ...t.sections.filter(([id]) => !x.sections.find(s => s.id === id)).map(([id, label, hint, para]) => ({ id, label, hint, para: Math.min(para, x.maxPara) }))] }))}>Add suggested sections</button></div>` : null}
    ${groups.map(g => { const secs = a.sections.filter(s => (a.year === 4 ? true : s.para === g)); return html`<section key=${g} className="pgroup" aria-label=${a.year === 4 ? "Planner" : "Paragraph " + g}>
      ${a.year > 4 ? html`<h2 className="h3 grouph">Paragraph ${g}</h2>` : null}
      <div className="sections">${secs.map(s => html`<div key=${s.id} className=${"section frame c" + (a.sections.indexOf(s) % 4) + (over === s.id ? " over" : "")} ...${zone(s.id)}>
        <${SectionHead} s=${s} a=${a} update=${update} level=${a.level} />
        ${place(s.id)}
        ${cardsIn(s.id).length ? list(s.id) : html`<p className="empty">Drop a card here, or use “Move to”.</p>`}
        <${AddCard} label=${"Add a detail to " + s.label} onAdd=${v => update(x => ({ ...x, cards: [...x.cards, { id: uid("c"), text: v, section: s.id }] }))} />
        ${a.sections.length > 1 ? html`<button className="linkbtn small danger" onClick=${() => removeSection(s.id)} aria-label=${"Remove section " + s.label + " (its cards go back to the tray)"}>Remove section</button>` : null}
      </div>`)}
      ${secs.length === 0 ? html`<p className="empty">No sections in this paragraph yet.</p>` : null}
      </div>
      <button className="btn small ghost" onClick=${() => addSection(a.year === 4 ? 1 : g)}>+ Add a section${a.year > 4 ? " to paragraph " + g : ""}</button>
    </section>`; })}
    ${a.year === 5 && a.maxPara < 2 ? html`<button className="btn secondary" onClick=${() => update(x => ({ ...x, maxPara: 2 }))}>+ Add paragraph 2</button>` : null}
    ${a.year === 5 && a.maxPara === 2 && !a.sections.some(s => s.para === 2) ? html`<button className="btn ghost small" onClick=${() => update(x => ({ ...x, maxPara: 1 }))}>Plan only one paragraph</button>` : null}
    ${a.year === 6 && a.maxPara < 6 ? html`<button className="btn secondary" onClick=${() => update(x => ({ ...x, maxPara: x.maxPara + 1 }))}>+ Add a paragraph group</button>` : null}
    ${a.year === 6 && a.maxPara > 2 && !a.sections.some(s => s.para === a.maxPara) ? html`<button className="btn ghost small" onClick=${() => update(x => ({ ...x, maxPara: x.maxPara - 1 }))}>Remove empty paragraph ${a.maxPara}</button>` : null}
    <${NavRow} back=${back} backLabel="Back to Explore" next=${next} nextLabel="Next: Write" />
    ${dragging ? ReactDOM.createPortal(html`<div className="dropdock" aria-hidden="true">
      <span className="dockhint">Drop on a box below, or keep dragging towards the bottom of the screen to scroll</span>
      <div className="dockzones">${[{ id: null, label: "Idea tray" }, ...a.sections.map(s => ({ id: s.id, label: s.label }))].map(z => html`<div key=${z.id || "tray"} className=${"dockzone" + (over === (z.id || "tray") ? " over" : "")} ...${zone(z.id)}>${z.label}</div>`)}</div>
    </div>`, document.body) : null}
  </div>`;
}

/* ---- Write ---- */
function PlanSummary({ a }) {
  const groups = a.year === 4 ? [1] : Array.from({ length: a.maxPara }, (_, i) => i + 1);
  const any = a.cards.some(c => c.section);
  return html`<div className="plansum">${!any ? html`<p className="small muted">Your plan is empty. You can still write, or go back to organise.</p>` : null}
    ${groups.map(g => { const secs = a.sections.filter(s => a.year === 4 || s.para === g); return html`<div key=${g} className="stack-xs">
      ${a.year > 4 && secs.length ? html`<p className="eyebrow">Paragraph ${g}</p>` : null}
      ${secs.map(s => { const cs = a.cards.filter(c => c.section === s.id); return html`<div key=${s.id} className="psum"><h4>${s.label}</h4>
        ${cs.length ? html`<ul>${cs.map(c => html`<li key=${c.id}>${c.text}</li>`)}</ul>` : html`<p className="small muted">No cards yet.</p>`}</div>`; })}</div>`; })}
  </div>`;
}

const SIZES = [1, 1.15, 1.32, 1.5];
function Write({ a, update, toPlan, toReview, saveNow, save, prefs, setPrefs, setLevel }) {
  const t = TOPIC[a.topicId], y = yearOf(a.year), lv = a.level;
  const ref = useRef(null);
  const wide = useMemo(() => window.matchMedia("(min-width: 1000px)").matches, []);
  const [more, setMore] = useState(false), [hint, setHint] = useState(lv === "easy"), [ins, setIns] = useState("");
  const [focus, setFocus] = useState(false), [speaking, setSpeaking] = useState(false);
  const canSpeak = "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
  const size = prefs.textSize || 0;
  useEffect(() => { if (!focus) return; const k = (e) => { if (e.key === "Escape") setFocus(false); }; document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, [focus]);
  useEffect(() => () => { if (canSpeak) speechSynthesis.cancel(); }, []);
  const speak = () => {
    if (!canSpeak) return;
    if (speaking) { speechSynthesis.cancel(); setSpeaking(false); return; }
    const text = [a.title, a.draft].filter(s => s && s.trim()).join(". ");
    if (!text.trim()) { setIns("There is no writing to read aloud yet."); return; }
    const u = new SpeechSynthesisUtterance(text); u.lang = "en-GB"; u.rate = 0.92;
    const v = speechSynthesis.getVoices().find(v => /en-GB/i.test(v.lang)); if (v) u.voice = v;
    u.onend = () => setSpeaking(false); u.onerror = () => { setSpeaking(false); setIns("Read aloud stopped. Your browser may not support it here."); };
    speechSynthesis.speak(u); setSpeaking(true);
  };
  const insert = (str) => {
    const el = ref.current, v = a.draft, s = el ? el.selectionStart : v.length;
    const before = v.slice(0, s), after = v.slice(s);
    let piece = str.replace(/…$/, "");
    if (before && !/\s$/.test(before)) piece = " " + piece;
    if (!/\s$/.test(piece) && !/^\s/.test(after)) piece = piece + " ";
    update(x => ({ ...x, draft: before + piece + after }));
    setIns(`Added “${str.replace(/…$/, "")}” where your cursor was.`);
    requestAnimationFrame(() => { if (el) { el.focus(); const p = s + piece.length; el.setSelectionRange(p, p); } });
  };
  const wc = words(a.draft), pc = paras(a.draft);
  const showStarters = lv === "easy" || (lv === "medium" && more);
  const chipList = (arr) => html`<div className="chiprow">${arr.map(w => html`<button key=${w} className="wordchip" onClick=${() => insert(w)} aria-label=${"Add " + w + " at the cursor"}>${w}</button>`)}</div>`;
  return html`<div className=${"stack" + (focus ? " focusmode" : "")}>
    ${!focus ? html`<div className="stack-s"><h1 tabIndex="-1">Turn your ideas into writing</h1><p className="task"><strong>Task:</strong> ${t.task}</p></div>` : html`<h1 tabIndex="-1" className="sr">Focus mode: writing</h1>`}
    <div className="write-grid">
      ${!focus ? html`<details className="side frame plan-side" open=${wide}><summary>My plan</summary>
        ${lv === "easy" ? html`<span className="qframe side-pic"><${Scene} id=${t.scene} alt=${t.alt} /></span>` : null}
        <${PlanSummary} a=${a} /></details>` : null}
      <div className="parchment" style=${{ "--fs": SIZES[size] }}>
        <div className="ptools row wrap gap-s end">
          <span className="small strong ink">${wc} word${wc === 1 ? "" : "s"} · ${pc} paragraph${pc === 1 ? "" : "s"} (goal: ${y.goalText}) <span className="sr">(word count is for information only)</span></span>
          <div className="row gap-s" role="group" aria-label="Text size">
            <button className="ptool" onClick=${() => setPrefs({ ...prefs, textSize: Math.max(0, size - 1) })} disabled=${size === 0} aria-label="Smaller text">A−</button>
            <button className="ptool" onClick=${() => setPrefs({ ...prefs, textSize: Math.min(SIZES.length - 1, size + 1) })} disabled=${size === SIZES.length - 1} aria-label="Larger text">A+</button></div>
          ${canSpeak ? html`<button className="ptool" onClick=${speak} aria-pressed=${speaking}>${speaking ? "■ Stop reading" : "🔊 Read aloud"}</button>` : null}
          <button className="ptool" onClick=${() => setFocus(!focus)} aria-pressed=${focus}>${focus ? "Exit focus mode" : "⛶ Focus mode"}</button>
        </div>
        <label htmlFor="title-input" className="sr">Title</label>
        <input id="title-input" className="ptitle-input" value=${a.title} onChange=${e => update(x => ({ ...x, title: e.target.value }))} />
        <label htmlFor="draft" className="small ink strong">My writing <span className="ink-muted">(press Enter to start a new paragraph)</span></label>
        <textarea id="draft" ref=${ref} className="draft" value=${a.draft} spellCheck="true" lang="en-GB" onChange=${e => update(x => ({ ...x, draft: e.target.value }))} placeholder="Start writing in your own words…"></textarea>
        <p className="small ink hintnote" role="status">${ins}</p>
        <div className="hintbar">
          <button className="hinttoggle" aria-expanded=${hint} onClick=${() => setHint(!hint)}>? ${hint ? "Hide hints" : "Need a hint?"} <span aria-hidden="true">${hint ? "▴" : "▾"}</span></button>
          ${hint ? html`<div className="hintbody stack-s">
            ${lv === "hard" ? html`<${React.Fragment}><p className="small"><strong>Goal:</strong> ${t.goal}</p><p className="small"><strong>Challenge (optional):</strong> ${t.challenges.join(" ")}</p>
              <h4>Linking words</h4>${chipList(t.linking)}<h4>Think about</h4><ul className="small">${t.questions.slice(2, 5).map(q => html`<li key=${q}>${q}</li>`)}</ul><//>`
            : html`<${React.Fragment}><h4>Linking words</h4><p className="small">Choose one to add it where your cursor is.</p>${chipList(t.linking)}
              ${showStarters ? html`<${React.Fragment}><h4>Sentence starters (optional)</h4><p className="small">These start a sentence. You finish it in your own words.</p>
                <div className="chiprow">${t.starters.map(s => html`<button key=${s} className="wordchip starter" onClick=${() => insert(s)} aria-label=${"Add starter: " + s}>${s}</button>`)}</div><//>`
                : html`<button className="btn small secondary align-start" onClick=${() => setMore(true)}>Show sentence starters</button>`}
              <p className="small"><strong>Challenge (optional):</strong> ${t.challenges[0]}</p><//>`}
          </div>` : null}
          <div className="supportrow" role="group" aria-label="Support option">${LEVELS.map(l => html`<button key=${l.id} className="supbtn" aria-pressed=${lv === l.id} onClick=${() => setLevel(l.id)}>${lv === l.id ? "✓ " : ""}${l.name}</button>`)}</div>
        </div>
      </div>
    </div>
    <div className="navrow">
      <button className="btn secondary" onClick=${toPlan}><${Arrow} left=${true} /> Back to plan</button>
      <div className="row wrap gap-s end"><${SaveStatus} save=${save} /><button className="btn secondary" onClick=${saveNow}>Save draft</button>
        <button className="btn gold" onClick=${toReview}>Review my writing <${Arrow} /></button></div>
    </div>
  </div>`;
}

/* ---- Review ---- */
function Review({ a, update, toWrite, finish, rewarded, who, notify }) {
  const t = TOPIC[a.topicId];
  const list = checklistFor(t, a.level);
  const qc = useMemo(() => quickChecks(a.draft, a.year, t), [a.draft]);
  const el = eligibility(a);
  const ticked = list.filter(([id]) => a.checks[id]).length;
  const [msg, setMsg] = useState("");
  const base = `idea2write-year${a.year}-${slug(t.title)}`;
  const dl = async () => setMsg((await saveFile(base + ".txt", exportText(a, who))).msg);
  const pr = async () => { if (!IN_FRAME) { window.print(); return; } const r = await saveFile(base + "-print.html", printableHTML(a, who)); setMsg(r.ok ? r.msg + " Open it and choose Print to print or save as PDF." : r.msg); };
  const reqs = [[el.planned, "Organise: at least 2 idea cards placed in your planner"], [el.drafted, "Write: at least 20 words of your own writing"], [el.ticked, "Review: tick at least one checklist item"], [el.reflected, "Review: record one improvement you made"]];
  return html`<div className="stack-l">
    <div className="stack-s"><h1 tabIndex="-1">Look how far you have come!</h1><p className="lead">Read your writing again. Tick each item when you have checked it. You do not need every tick.</p></div>
    <div className="review-grid">
      <section className="parchment small-p stack-s" aria-labelledby="dr-h"><div className="row between wrap"><h2 id="dr-h" className="ink-title">${a.title || t.title}</h2><button className="btn small secondary" onClick=${toWrite}>Edit my writing</button></div>
        <div className="draftview">${a.draft.trim() ? a.draft.split(/\n+/).filter(l => l.trim()).map((p, i) => html`<p key=${i}>${p}</p>`) : html`<p className="ink-muted">You have not written anything yet.</p>`}</div>
        <p className="small ink-muted">${words(a.draft)} words · ${paras(a.draft)} paragraph(s)</p>
        <div className="row wrap gap-s"><button className="btn small secondary" onClick=${dl}>Download (.txt)</button><button className="btn small secondary" onClick=${pr}>${IN_FRAME ? "Print version (.html)" : "Print"}</button></div>
        <p className="small ink hintnote" role="status">${msg}</p>
      </section>
      <div className="stack">
        <fieldset className="frame panel checklist"><legend className="h3">My checklist (${ticked} of ${list.length})</legend>
          ${list.map(([id, label]) => html`<div key=${id} className="checkrow"><input type="checkbox" id=${"ck-" + id} checked=${!!a.checks[id]} onChange=${e => update(x => ({ ...x, checks: { ...x.checks, [id]: e.target.checked } }))} />
            <label htmlFor=${"ck-" + id}>${label}</label></div>`)}
        </fieldset>
        <details className="panel frame"><summary>Quick checks</summary>
          <p className="small muted">These are simple rules, not marking. They can miss mistakes or point to something that is fine.</p>
          <ul className="qc">${qc.map((q, i) => html`<li key=${i} className=${q.ok ? "ok" : "look"}><span aria-hidden="true">${q.ok ? "✓" : "•"}</span><span><span className="sr">${q.ok ? "Looks fine: " : "To check: "}</span>${q.msg}</span></li>`)}</ul>
        </details>
        <div className="frame panel stack-s"><label htmlFor="reflect" className="h3">One improvement I made</label>
          <p className="small muted">For example: “I added a reason” or “I fixed my capital letters.”</p>
          <textarea id="reflect" className="field" rows="3" value=${a.reflection} onChange=${e => update(x => ({ ...x, reflection: e.target.value }))}></textarea></div>
        <div className="frame panel stack-s"><h2 className="h3">To complete this quest</h2>
          <ul className="reqs">${reqs.map(([ok, l]) => html`<li key=${l} className=${ok ? "ok" : ""}><span aria-hidden="true">${ok ? "✓" : "○"}</span> ${l}<span className="sr">${ok ? " (done)" : " (not yet)"}</span></li>`)}</ul>
          ${a.assignmentId ? html`<p className="small">This is a class quest. After you complete it, you can submit it to your teacher.</p>` : null}
          ${rewarded ? html`<p className="small">You already earned the reward for this quest on ${fmtDS(rewarded.date)}. Finishing again saves your changes but gives no new stars.</p>` : html`<p className="small muted">Completing earns 3 stars and 30 XP. This rewards finishing the writing process, not a mark for writing quality.</p>`}
        </div>
      </div>
    </div>
    <div className="navrow"><button className="btn secondary" onClick=${toWrite}><${Arrow} left=${true} /> Keep improving</button>
      <div className="row wrap end gap-s">${!el.ok ? html`<span className="hintnote" role="status">Finish the steps above to complete the quest.</span>` : null}
      <button className="btn gold" onClick=${finish} disabled=${!el.ok}>${rewarded ? "Save and finish" : "Complete the quest"} <${Arrow} /></button></div></div>
  </div>`;
}

function Done({ a, reveal, rewardRec, editAgain, another, go, who, progress, submitPanel }) {
  const t = TOPIC[a.topicId], lv = levelOf(a.level);
  const [msg, setMsg] = useState("");
  const base = `idea2write-year${a.year}-${slug(t.title)}`;
  const dl = async () => setMsg((await saveFile(base + ".txt", exportText(a, who))).msg);
  const pr = async () => { if (!IN_FRAME) { window.print(); return; } const r = await saveFile(base + "-print.html", printableHTML(a, who)); setMsg(r.ok ? r.msg + " Open it and choose Print to print or save as PDF." : r.msg); };
  const r = reveal && reveal.attemptId === a.id ? reveal.result : null;
  const item = r && r.kind === "new" && r.items[r.items.length - 1];
  return html`<div className="done-grid">
    <article className="parchment stack-s printsheet" id="print-area" aria-labelledby="fin-h">
      <p className="ink-muted small noprint">Year ${a.year} · ${t.title} · Support: ${lv.name}</p>
      <h1 id="fin-h" tabIndex="-1" className="ink-title">${a.title || t.title}</h1>
      <p className="printonly">${who} · Year ${a.year} · ${t.title}</p>
      <div className="draftview">${a.draft.split(/\n+/).filter(l => l.trim()).map((p, i) => html`<p key=${i}>${p}</p>`)}</div>
      <div className="improve"><strong>One improvement I made:</strong> ${a.reflection.trim() || "Not recorded."}</div>
      <div className="row wrap gap-s noprint">
        <button className="btn secondary small" onClick=${editAgain}>Edit again</button>
        <button className="btn secondary small" onClick=${dl}>Download writing (.txt)</button>
        <button className="btn secondary small" onClick=${pr}>${IN_FRAME ? "Print version (.html)" : "Print"}</button>
      </div>
      <p className="small ink hintnote noprint" role="status">${msg}</p>
    </article>
    ${submitPanel ? html`<div className="noprint submit-wrap">${submitPanel}</div>` : null}
    <aside className="frame panel reward stack-s noprint" aria-labelledby="qc-h">
      <${Ribbon} id="qc-h">Quest complete<//>
      <p className="center-text bigline">You turned your ideas into writing!</p>
      ${r && r.kind === "new" ? html`<div className="reveal stack-s center-text">
          <${StarBurst} />
          <div className="starburst" aria-hidden="true">★</div>
          <p className="plus">+3 stars</p><p className="countline"><span className="sr">${r.before.stars} to ${r.after.stars} stars</span><span aria-hidden="true">${r.before.stars} → <strong><${CountUp} from=${r.before.stars} to=${r.after.stars} /></strong> stars · +<${CountUp} from=${0} to=${30} /> XP</span></p>
          ${r.after.level > r.before.level ? html`<p className="note">You reached writing level ${r.after.level}: ${levelTitle(r.after.level)}!</p>` : html`<p className="small">Level ${r.after.level}: ${levelInfo(r.after.xp).into} of 100 XP</p>`}
          ${item ? html`<${React.Fragment}><div className="unlock"><${Collectible} c=${item} unlocked=${true} size="l" /><span className="cushion" aria-hidden="true"></span><p className="plate">${item.name} unlocked</p></div>
            <button className="btn gold" onClick=${() => go("collection")}>View in my collection <${Arrow} /></button><//>` : null}
          ${r.ach.length ? html`<p className="small">New achievement: ${r.ach.map(x => x.name).join(", ")}</p>` : null}
        </div>` : r && r.kind === "duplicate" ? html`<p className="note">This writing matches a quest you already completed, so no new stars were given. Write something new to earn stars.</p>`
        : rewardRec ? html`<p className="center-text">★ 3 stars and 30 XP were earned for this quest on ${fmtDS(rewardRec.date)}.</p>` : html`<p className="small center-text">Your writing is saved.</p>`}
      <p className="small muted center-text"><em>Rewards are for completing the writing process, not marks for writing quality.</em></p>
      <button className="btn secondary" onClick=${another}>Choose another quest</button>
      <button className="btn ghost" onClick=${() => go("home")}>Back to the common room</button>
    </aside>
  </div>`;
}
