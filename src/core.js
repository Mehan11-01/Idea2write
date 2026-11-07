/* ===== Core helpers: storage, dates, rewards, schedule ===== */
const CAN_STORE = (() => { try { const k = "__i2w_test"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return true; } catch (e) { return false; } })();
function loadJSON(k, fb) { if (!CAN_STORE) return fb; try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (e) { return fb; } }
function saveJSON(k, v) { if (!CAN_STORE) return false; try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
const K = {
  index: "i2w.v2.index", schedule: "i2w.v2.schedule", art: "i2w.v2.art", improve: "i2w.v2.improvements", feedback: "idea2write.v1.feedback", v1: "idea2write.v1.attempts", migrated: "i2w.v2.migrated",
  attempts: (pid) => `i2w.v2.p.${pid}.attempts`, progress: (pid) => `i2w.v2.p.${pid}.progress`, prefs: (pid) => `i2w.v2.p.${pid}.prefs`
};
const uid = (p) => p + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const words = (t) => (t.trim().match(/[A-Za-z0-9À-ɏ'’-]+/g) || []).length;
const paras = (t) => t.split(/\n+/).filter(l => l.trim()).length;
const levelOf = (id) => LEVELS.find(l => l.id === id);
const yearOf = (id) => YEARS.find(y => y.id === id);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
let IN_FRAME = true; try { IN_FRAME = window.self !== window.top; } catch (e) { IN_FRAME = true; }

/* Dates: every calendar date uses Asia/Kuala_Lumpur */
const TZ = "Asia/Kuala_Lumpur";
const klDate = (d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const parseDS = (ds) => { const [y, m, d] = ds.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const toDS = (dt) => dt.toISOString().slice(0, 10);
const addDays = (ds, n) => { const d = parseDS(ds); d.setUTCDate(d.getUTCDate() + n); return toDS(d); };
const weekdayIdx = (ds) => (parseDS(ds).getUTCDay() + 6) % 7; /* Mon = 0 */
const fmtDS = (ds, opts = { weekday: "long", day: "numeric", month: "long" }) => parseDS(ds).toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
const fmtTime = (ts) => new Date(ts).toLocaleString("en-GB", { timeZone: TZ, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function streakInfo(days, today) {
  const set = new Set(days);
  let cur = 0, d = set.has(today) ? today : addDays(today, -1);
  while (set.has(d)) { cur++; d = addDays(d, -1); }
  let longest = 0, run = 0, prev = null;
  [...set].sort().forEach(x => { run = prev && addDays(prev, 1) === x ? run + 1 : 1; longest = Math.max(longest, run); prev = x; });
  return { current: cur, longest, today: set.has(today) };
}
function levelInfo(xp) { return { level: Math.floor(xp / 100) + 1, into: xp % 100, title: levelTitle(Math.floor(xp / 100) + 1) }; }
const emptyProgress = () => ({ xp: 0, stars: 0, ledger: {}, days: [], unlocked: {}, achievements: {}, practice: {} });
function nextCollectible(stars) { return COLLECTIBLES.find(c => c.stars > stars) || null; }
function hashText(t) { const s = t.toLowerCase().replace(/\s+/g, " ").trim(); let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0; return h.toString(36) + ":" + s.length; }

function progressStats(p, year) {
  const ledger = Object.values(p.ledger);
  const done = new Set(ledger.map(l => l.topicId));
  const fullYear = [4, 5, 6].some(y => TOPICS.filter(t => t.year === y).every(t => done.has(t.id)));
  return { quests: ledger.length, longest: streakInfo(p.days, klDate()).longest, fullYear, practice: Object.keys(p.practice).length };
}
function awardAchievements(p, today) {
  const s = progressStats(p), got = [];
  ACHIEVEMENTS.forEach(a => { if (!p.achievements[a.id] && a.test(s)) { p.achievements[a.id] = today; got.push(a); } });
  return got;
}

/* Eligibility for completion rewards */
function eligibility(a) {
  const planned = a.cards.filter(c => c.section).length >= 2;
  const drafted = words(a.draft) >= 20;
  const ticked = Object.values(a.checks).filter(Boolean).length >= 1;
  const reflected = a.reflection.trim().length >= 3;
  return { planned, drafted, ticked, reflected, ok: planned && drafted && ticked && reflected };
}

/* Applies the completion rules. Pure: returns a new progress object plus what changed. */
function applyCompletion(prog, a, today) {
  const p = JSON.parse(JSON.stringify(prog));
  const h = hashText(a.draft);
  if (p.ledger[a.id]) { const l = p.ledger[a.id]; l.hashes = [...new Set([...(l.hashes || [l.hash]), h])]; return { p, result: { kind: "already", date: l.date } }; }
  if (Object.values(p.ledger).some(l => (l.hashes || [l.hash]).includes(h))) return { p, result: { kind: "duplicate" } };
  const before = { stars: p.stars, xp: p.xp, level: levelInfo(p.xp).level };
  p.ledger[a.id] = { topicId: a.topicId, date: today, stars: 3, xp: 30, hash: h, hashes: [h] };
  p.stars += 3; p.xp += 30;
  if (!p.days.includes(today)) p.days.push(today);
  const items = [];
  COLLECTIBLES.forEach(c => { if (p.stars >= c.stars && !p.unlocked[c.id]) { p.unlocked[c.id] = today; items.push(c); } });
  const ach = awardAchievements(p, today);
  return { p, result: { kind: "new", before, after: { stars: p.stars, xp: p.xp, level: levelInfo(p.xp).level }, items, ach } };
}

/* Sample schedule: each school weekday gets the next topic of that year, in order */
const ANCHOR = "2026-01-05"; /* a Monday */
function sampleTopic(year, ds) {
  const w = weekdayIdx(ds); if (w > 4) return null;
  const days = Math.round((parseDS(ds) - parseDS(ANCHOR)) / 86400000);
  const weeks = Math.floor(days / 7), idx = weeks * 5 + w;
  const list = TOPICS.filter(t => t.year === year);
  return list[((idx % list.length) + list.length) % list.length].id;
}
function scheduleFor(sched, year, ds) {
  const o = sched[year] && sched[year][ds];
  if (o === "none") return { topicId: null, source: "teacher" };
  if (o) return { topicId: o, source: "teacher" };
  const s = sampleTopic(year, ds);
  return { topicId: s, source: "sample" };
}

async function saveFile(filename, content) {
  if (window.claude && typeof window.claude.use === "function") {
    try {
      const d = await window.claude.use("downloads");
      if (d) { await d.save({ filename, data: content }); return { ok: true, msg: "Your file was saved to this device." }; }
    } catch (e) {
      if (e && e.code === "declined") return { ok: false, msg: "Download cancelled. Nothing was saved." };
      if (e && e.code === "rate_limited") return { ok: false, msg: "Please wait a moment, then try again." };
    }
  }
  if (IN_FRAME && window.claude) return { ok: false, msg: "Downloading is not available in this view." };
  try {
    const blob = new Blob(["﻿" + content], { type: filename.endsWith(".html") ? "text/html;charset=utf-8" : filename.endsWith(".csv") ? "text/csv;charset=utf-8" : "text/plain;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    return { ok: true, msg: "Your browser should now download the file." };
  } catch (e) { return { ok: false, msg: "This browser could not download the file." }; }
}

function newAttempt(year, topicId, level, scheduledDate) {
  const t = TOPIC[topicId];
  const tpl = level === "hard" ? HARD_SECTIONS[year] : t.sections;
  return { id: uid("att"), year, topicId, level, title: t.title, cards: [], answers: {},
    sections: tpl.map(([id, label, hint, para]) => ({ id, label, hint, para })), maxPara: Math.max(...tpl.map(s => s[3])),
    draft: "", checks: {}, reflection: "", step: "explore", scheduledDate: scheduledDate || null, created: Date.now(), updated: Date.now(), completed: false };
}
const hasContent = (a) => a && (a.cards.length > 0 || a.draft.trim() || a.reflection.trim());

function exportText(a, who) {
  const t = TOPIC[a.topicId], lv = levelOf(a.level);
  return [`Idea2Write Writing Academy`, ``, `Title: ${a.title || t.title}`, who ? `Writer: ${who}` : null, `Year ${a.year} · ${t.title} · Support: ${lv.name}`, `Task: ${t.task}`, `Last updated: ${fmtTime(a.updated)}`, ``, `----------------------------------------`, ``,
    a.draft.split(/\n+/).filter(l => l.trim()).join("\n\n"), ``, `----------------------------------------`,
    `One improvement I made: ${a.reflection.trim() || "(not recorded)"}`, ``].filter(x => x !== null).join("\n");
}
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function printableHTML(a, who) {
  const t = TOPIC[a.topicId], lv = levelOf(a.level);
  const body = a.draft.split(/\n+/).filter(l => l.trim()).map(p => `<p>${esc(p)}</p>`).join("\n");
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>${esc(a.title || t.title)} – Idea2Write</title>
<style>body{font-family:Georgia,'Times New Roman',serif;color:#1d1a16;max-width:700px;margin:40px auto;padding:0 24px;line-height:1.75;font-size:15pt}
h1{font-size:24pt;margin:0 0 4px}.meta{color:#4b4338;font-size:11pt;margin-bottom:24px;border-bottom:1px solid #bba57a;padding-bottom:12px}
.imp{margin-top:28px;border-top:1px solid #bba57a;padding-top:12px;font-size:12pt}.note{font-size:10pt;color:#666;margin-top:32px}@media print{.note{display:none}}</style></head><body>
<h1>${esc(a.title || t.title)}</h1><div class="meta">${who ? esc(who) + " · " : ""}Year ${a.year} · ${esc(t.title)} · Support: ${esc(lv.name)}<br>Task: ${esc(t.task)}</div>
${body}
<div class="imp"><strong>One improvement I made:</strong> ${esc(a.reflection.trim() || "(not recorded)")}</div>
<p class="note">To print or save as PDF, open your browser's Print option (Ctrl+P or Cmd+P).</p></body></html>`;
}

function quickChecks(text, year, topic) {
  const out = [], t = text.trim();
  if (!t) return [{ ok: false, msg: "Your writing area is empty. Have you written your ideas as sentences?" }];
  const y = yearOf(year), p = paras(t);
  const paraOk = p >= y.minPara && (year !== 4 || p === 1) && (year !== 5 || p <= 2);
  out.push({ ok: paraOk, msg: `Paragraphs: you have ${p} (counted by line breaks). The goal for Year ${year} is ${y.goalText}.${paraOk ? "" : " Have you checked where each paragraph starts?"}` });
  const sentences = t.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  const lower = sentences.filter(s => /^[a-z]/.test(s)).length;
  out.push(lower ? { ok: false, msg: `Have you checked capital letters? ${lower} sentence${lower > 1 ? "s" : ""} may start with a small letter.` } : { ok: true, msg: "Each sentence seems to start with a capital letter." });
  if (/(^|[\s"“(])i([\s,.'’!?]|$)/.test(t)) out.push({ ok: false, msg: "Have you checked the word “I”? It is always a capital letter." });
  out.push(/[.!?"”]$/.test(t) ? { ok: true, msg: "Your last sentence ends with punctuation." } : { ok: false, msg: "Have you checked the end of your last sentence? It may need a full stop." });
  const rep = t.match(/\b(\w+)\s+\1\b/i);
  if (rep) out.push({ ok: false, msg: `Have you checked “${rep[0]}”? The same word appears twice in a row.` });
  if (sentences.some(s => words(s) > 35)) out.push({ ok: false, msg: "One sentence is very long. Have you checked whether it could be split into two?" });
  const used = topic.linking.map(l => l.replace(/[,.…]/g, "").trim()).filter(l => l && new RegExp("\\b" + l.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&") + "\\b", "i").test(t));
  out.push(used.length ? { ok: true, msg: `Linking words found: ${used.join(", ")}.` } : { ok: false, msg: `Have you tried a linking word, such as “${topic.linking[0].replace(/,$/, "")}” or “${topic.linking[2].replace(/,$/, "")}”?` });
  return out;
}

/* Optional ambient sound, synthesised in the browser (no audio files, never autoplays) */
const Ambient = (() => {
  let ctx = null, nodes = null, timer = null;
  function start() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = ctx || new AC(); if (ctx.state === "suspended") ctx.resume();
    const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420;
    const g = ctx.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.5);
    src.connect(lp).connect(g).connect(ctx.destination); src.start();
    nodes = { src, g };
    timer = setInterval(() => {
      if (Math.random() > 0.55) return;
      const n = ctx.createBufferSource(), b = ctx.createBuffer(1, 600, ctx.sampleRate), cd = b.getChannelData(0);
      for (let i = 0; i < 600; i++) cd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / 600, 3);
      n.buffer = b; const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1200 + Math.random() * 1800;
      const cg = ctx.createGain(); cg.gain.value = 0.05 + Math.random() * 0.08; n.connect(hp).connect(cg).connect(ctx.destination); n.start();
    }, 140);
    return true;
  }
  function chime(notes, vol = 0.12, gap = 0.09, dur = 0.5) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = ctx || new AC(); if (ctx.state === "suspended") ctx.resume();
    notes.forEach((f, i) => { const t = ctx.currentTime + i * gap, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.05); });
  }
  function stop() { if (timer) clearInterval(timer); timer = null; if (nodes && ctx) { nodes.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4); const s = nodes.src; setTimeout(() => { try { s.stop(); } catch (e) { } }, 500); } nodes = null; }
  return { start, stop, chime, supported: !!(window.AudioContext || window.webkitAudioContext) };
})();

/* Short sound effects, only after the pupil switches sound on */
const Sfx = { on: false, play(kind) { if (!this.on) return; const m = { select: [[1046], 0.07], page: [[660], 0.05], place: [[784, 1046], 0.07], success: [[523, 659, 784, 1046, 1318], 0.11], unlock: [[880, 1108, 1318, 1760], 0.1] }[kind]; if (m) Ambient.chime(m[0], m[1]); } };
const REDUCED = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
