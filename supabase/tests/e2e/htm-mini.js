// Test-only tagged template parser compatible with htm's syntax subset used by the app.
export default function htm(h) {
  return function (strings, ...vals) {
    let i = 0, s = 0; // string index, char index
    const FIELD = {};
    // tokenise into a stream of chars and fields
    const toks = [];
    strings.forEach((str, k) => { for (const ch of str) toks.push(ch); if (k < vals.length) toks.push({ f: vals[k] }); });
    let p = 0;
    const peek = () => toks[p], next = () => toks[p++];
    const isWs = (c) => typeof c === "string" && /\s/.test(c);
    function readName() { let n = ""; while (p < toks.length && typeof peek() === "string" && /[^\s/>=]/.test(peek())) n += next(); return n; }
    function skipWs() { while (p < toks.length && isWs(peek())) p++; }
    function parseChildren(closeTag) {
      const kids = []; let text = "";
      const flush = () => { let t = text.replace(/^\s*\n\s*|\s*\n\s*$/g, ""); if (t) kids.push(t); text = ""; };
      while (p < toks.length) {
        const c = peek();
        if (typeof c === "object") { flush(); kids.push(next().f); continue; }
        if (c === "<") {
          if (toks[p + 1] === "/") { flush(); // closing
            p += 2; while (p < toks.length && peek() !== ">") p++; p++; return kids; }
          flush(); kids.push(parseEl()); continue;
        }
        text += next();
      }
      flush(); return kids;
    }
    function parseEl() {
      next(); // <
      let tag; if (typeof peek() === "object") tag = next().f; else tag = readName();
      const props = {};
      while (true) {
        skipWs();
        const c = peek();
        if (c === "/" && toks[p + 1] === ">") { p += 2; return h(tag, Object.keys(props).length ? props : null); }
        if (c === ">") { p++; break; }
        if (c === "." && toks[p + 1] === "." && toks[p + 2] === ".") { p += 3; Object.assign(props, next().f); continue; }
        const name = readName();
        if (peek() === "=") { p++;
          if (typeof peek() === "object") props[name] = next().f;
          else if (peek() === '"' || peek() === "'") { const q = next(); let v = "", parts = []; let hasField = false;
            while (peek() !== q) { const t = next(); if (typeof t === "object") { hasField = true; parts.push(v, t.f); v = ""; } else v += t; }
            p++; props[name] = hasField ? parts.concat(v).join("") : v; }
          else { let v = ""; while (p < toks.length && typeof peek() === "string" && /[^\s>]/.test(peek()) && !(peek() === "/" && toks[p + 1] === ">")) v += next(); props[name] = v; }
        } else props[name] = true;
      }
      const kids = parseChildren(tag);
      return h(tag, Object.keys(props).length ? props : null, ...kids);
    }
    const out = parseChildren(null);
    return out.length === 1 ? out[0] : out;
  };
}
