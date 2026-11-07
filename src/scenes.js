/* ===== Inline illustrations (original, drawn in code) ===== */
const SKIN = ["#F3CDA6", "#DDA877", "#B07A50", "#7E5236"];
const HAIR = "#2B2320";
const NAVY = "#172B4D";

function Kid({ x, y, s = 1, skin = 0, shirt = "#FFFFFF", pants = "#2C4A7C", hair = "short", scarf = "#7FB7B0", bag, glasses, arm }) {
  const sk = SKIN[skin];
  const hairCol = hair === "grey" ? "#CFCBC4" : HAIR;
  const kids = [];
  if (bag) kids.push(html`<rect key="bag" x="-19" y="-62" width="38" height="32" rx="8" fill=${bag} />`);
  kids.push(html`<rect key="l1" x="-10" y="-30" width="8" height="30" rx="3" fill=${pants} />`);
  kids.push(html`<rect key="l2" x="2" y="-30" width="8" height="30" rx="3" fill=${pants} />`);
  kids.push(html`<rect key="ar1" x="-21" y="-60" width="8" height="27" rx="4" fill=${shirt} stroke="#00000018" />`);
  kids.push(arm === "up"
    ? html`<rect key="ar2" x="13" y="-84" width="8" height="27" rx="4" fill=${shirt} stroke="#00000018" />`
    : html`<rect key="ar2" x="13" y="-60" width="8" height="27" rx="4" fill=${shirt} stroke="#00000018" />`);
  kids.push(html`<rect key="body" x="-15" y="-63" width="30" height="37" rx="11" fill=${shirt} stroke="#00000018" />`);
  if (hair === "tudung") {
    kids.push(html`<path key="tud" d="M-18,-72 a18,19 0 0 1 36,0 l4,14 q-22,10 -44,0 z" fill=${scarf} />`);
    kids.push(html`<circle key="face" cx="0" cy="-76" r="11" fill=${sk} />`);
  } else {
    kids.push(html`<circle key="face" cx="0" cy="-76" r="14" fill=${sk} />`);
    if (hair === "short" || hair === "grey" || hair === "songkok") kids.push(html`<path key="h" d="M-14,-78 a14,14 0 0 1 28,0 q-14,-9 -28,0 z" fill=${hairCol} />`);
    if (hair === "pony") { kids.push(html`<path key="h" d="M-14,-78 a14,14 0 0 1 28,0 q-14,-9 -28,0 z" fill=${HAIR} />`); kids.push(html`<circle key="p" cx="15" cy="-82" r="6" fill=${HAIR} />`); }
    if (hair === "curly") [[-11, -84], [-4, -90], [4, -90], [11, -84], [0, -87]].forEach(([cx, cy], i) => kids.push(html`<circle key=${"c" + i} cx=${cx} cy=${cy} r="7" fill=${HAIR} />`));
    if (hair === "songkok") kids.push(html`<rect key="sk" x="-12" y="-97" width="24" height="11" rx="2" fill="#1F1F28" />`);
  }
  kids.push(html`<circle key="e1" cx="-4.5" cy="-77" r="1.7" fill=${NAVY} />`);
  kids.push(html`<circle key="e2" cx="4.5" cy="-77" r="1.7" fill=${NAVY} />`);
  kids.push(html`<path key="m" d="M-4,-70 q4,3.5 8,0" stroke=${NAVY} strokeWidth="1.6" fill="none" strokeLinecap="round" />`);
  if (glasses) kids.push(html`<g key="gl" stroke=${NAVY} strokeWidth="1.3" fill="none"><circle cx="-4.5" cy="-77" r="3.6" /><circle cx="4.5" cy="-77" r="3.6" /><path d="M-1,-77 h2" /></g>`);
  return html`<g transform=${`translate(${x},${y}) scale(${s})`}>${kids}</g>`;
}

const P = {
  sky: () => html`<rect width="360" height="220" fill="#E3F0EE" />`,
  indoor: () => html`<g><rect width="360" height="220" fill="#F7EEE3" /><rect y="170" width="360" height="50" fill="#EADBC6" /></g>`,
  ground: (c = "#CFE3D0") => html`<path d="M0,165 Q180,145 360,165 L360,220 L0,220 Z" fill=${c} />`,
  sun: (x, y) => html`<circle cx=${x} cy=${y} r="18" fill="#F6D77A" />`,
  cloud: (x, y) => html`<g fill="#FFFFFF"><ellipse cx=${x} cy=${y} rx="24" ry="9" /><ellipse cx=${x + 14} cy=${y - 6} rx="14" ry="9" /></g>`,
  tree: (x, y, s = 1) => html`<g transform=${`translate(${x},${y}) scale(${s})`}><rect x="-6" y="-50" width="12" height="50" rx="3" fill="#A97C55" /><circle cx="0" cy="-66" r="30" fill="#8FBF9A" /><circle cx="-18" cy="-52" r="18" fill="#9CC9A6" /><circle cx="18" cy="-52" r="18" fill="#86B792" /></g>`,
  palm: (x, y) => html`<g transform=${`translate(${x},${y})`}><path d="M0,0 q-4,-40 6,-80" stroke="#A97C55" strokeWidth="7" fill="none" strokeLinecap="round" /><g fill="#79AE86"><path d="M6,-80 q-30,-10 -44,8 q22,-8 44,-8z" /><path d="M6,-80 q30,-12 44,6 q-22,-6 -44,-6z" /><path d="M6,-80 q-10,-26 -32,-28 q20,8 32,28z" /><path d="M6,-80 q14,-26 34,-24 q-20,6 -34,24z" /></g></g>`,
  flowers: (x, y) => html`<g transform=${`translate(${x},${y})`}>${[0, 16, 32].map((d, i) => html`<g key=${i}><path d=${`M${d},0 v-14`} stroke="#6E9E78" strokeWidth="2" /><circle cx=${d} cy="-16" r="5" fill=${["#F2B8A0", "#F4DB8A", "#C9B5E4"][i]} /></g>`)}</g>`,
  bus: (x, y) => html`<g transform=${`translate(${x},${y})`}><rect x="0" y="-46" width="110" height="40" rx="8" fill="#F4C84B" /><rect x="8" y="-40" width="18" height="14" rx="2" fill="#EAF4F6" /><rect x="32" y="-40" width="18" height="14" rx="2" fill="#EAF4F6" /><rect x="56" y="-40" width="18" height="14" rx="2" fill="#EAF4F6" /><rect x="82" y="-40" width="20" height="24" rx="2" fill="#EAF4F6" /><rect x="0" y="-22" width="110" height="5" fill="#E1A93A" /><circle cx="24" cy="-6" r="8" fill="#3A3F4A" /><circle cx="86" cy="-6" r="8" fill="#3A3F4A" /></g>`,
  clock: (x, y) => html`<g transform=${`translate(${x},${y})`}><circle r="22" fill="#FFFFFF" stroke=${NAVY} strokeWidth="3" /><path d="M0,0 v-13 M0,0 h-10" stroke=${NAVY} strokeWidth="3" strokeLinecap="round" /><circle r="2.5" fill=${NAVY} /></g>`,
  table: (x, y, w = 140) => html`<g transform=${`translate(${x},${y})`}><rect x="0" y="0" width=${w} height="10" rx="3" fill="#B98A5E" /><rect x="8" y="10" width="7" height="40" fill="#A47750" /><rect x=${w - 15} y="10" width="7" height="40" fill="#A47750" /></g>`,
  cake: (x, y) => html`<g transform=${`translate(${x},${y})`}><rect x="-26" y="-30" width="52" height="30" rx="5" fill="#F6D2BF" /><rect x="-26" y="-30" width="52" height="9" rx="4" fill="#FFFFFF" /><rect x="-2" y="-44" width="4" height="14" fill="#9FC7E8" /><path d="M0,-52 q4,5 0,8 q-4,-3 0,-8z" fill="#F6B44B" /></g>`,
  gift: (x, y) => html`<g transform=${`translate(${x},${y})`}><rect x="-16" y="-28" width="32" height="28" rx="3" fill="#9FC7B7" /><rect x="-3" y="-28" width="6" height="28" fill="#F4DB8A" /><path d="M0,-28 q-12,-12 -12,0 M0,-28 q12,-12 12,0" stroke="#F4DB8A" strokeWidth="4" fill="none" /></g>`,
  kuih: (x, y) => html`<g transform=${`translate(${x},${y})`}><ellipse cx="0" cy="0" rx="22" ry="5" fill="#FFFFFF" stroke="#E2D5C2" /><rect x="-14" y="-9" width="10" height="8" rx="2" fill="#7FBF8E" /><rect x="-2" y="-9" width="10" height="8" rx="2" fill="#F2B8A0" /><rect x="6" y="-15" width="10" height="8" rx="2" fill="#F4DB8A" /></g>`,
  bunting: () => html`<g><path d="M0,22 Q180,60 360,22" stroke="#B9A88F" strokeWidth="2" fill="none" />${[20, 60, 100, 140, 180, 220, 260, 300, 340].map((bx, i) => { const by = 22 + 38 * Math.sin(Math.PI * bx / 360) * 0.95; return html`<path key=${i} d=${`M${bx - 11},${by} L${bx + 11},${by} L${bx},${by + 20} Z`} fill=${["#F2B8A0", "#9FC7B7", "#F4DB8A", "#BFD7EA"][i % 4]} />`; })}</g>`,
  net: (x, y) => html`<g transform=${`translate(${x},${y})`}><rect x="-2" y="-70" width="4" height="70" fill="#7A7F88" /><rect x="-2" y="-70" width="4" height="0" /><path d="M0,-66 v34" stroke="#FFFFFF" strokeWidth="10" strokeDasharray="2 3" opacity="0.9" /></g>`,
  shuttle: (x, y) => html`<g transform=${`translate(${x},${y}) rotate(-30)`}><circle r="4" fill="#F6D2BF" /><path d="M-4,0 L-8,-14 L8,-14 L4,0 Z" fill="#FFFFFF" stroke="#C9C2B6" /></g>`,
  racket: (x, y) => html`<g transform=${`translate(${x},${y}) rotate(20)`}><ellipse cx="0" cy="-16" rx="8" ry="11" fill="none" stroke="#2E7D73" strokeWidth="2.5" /><rect x="-1.5" y="-5" width="3" height="16" fill="#2E7D73" /></g>`,
  cat: (x, y) => html`<g transform=${`translate(${x},${y})`}><ellipse cx="0" cy="-16" rx="26" ry="16" fill="#E9A15B" /><path d="M24,-18 q22,-6 16,-28" stroke="#E9A15B" strokeWidth="7" fill="none" strokeLinecap="round" /><circle cx="-24" cy="-32" r="14" fill="#E9A15B" /><path d="M-35,-40 l3,-14 l8,9 z M-21,-44 l8,-10 l2,14 z" fill="#E9A15B" /><path d="M-6,-28 v22 M4,-30 v24" stroke="#C97F3D" strokeWidth="3" /><circle cx="-29" cy="-33" r="1.8" fill=${NAVY} /><circle cx="-19" cy="-33" r="1.8" fill=${NAVY} /><path d="M-26,-27 q2,2 4,0" stroke=${NAVY} strokeWidth="1.4" fill="none" /><path d="M-40,-28 h8 M-40,-25 h8 M-16,-28 h8 M-16,-25 h8" stroke="#8A6A4A" strokeWidth="0.8" /></g>`,
  bowl: (x, y) => html`<g transform=${`translate(${x},${y})`}><path d="M-14,-10 h28 q-2,10 -14,10 q-12,0 -14,-10z" fill="#9FC7B7" /><ellipse cx="0" cy="-10" rx="14" ry="3" fill="#B98A5E" /></g>`,
  book: (x, y, c = "#9FC7B7") => html`<g transform=${`translate(${x},${y})`}><path d="M-30,0 L0,6 L30,0 L30,-30 L0,-24 L-30,-30 Z" fill="#FFFFFF" stroke="#D9CDBB" /><path d="M0,6 V-24" stroke="#D9CDBB" /><path d="M-24,-20 h16 M-24,-14 h18 M6,-14 h18 M6,-20 h16" stroke="#C9D6E0" strokeWidth="2" /><rect x="-32" y="0" width="64" height="4" rx="2" fill=${c} /></g>`,
  pencilcase: (x, y) => html`<g transform=${`translate(${x},${y})`}><rect x="-40" y="-22" width="80" height="22" rx="10" fill="#7EA9D8" /><path d="M-34,-17 h68" stroke="#E9EEF5" strokeWidth="2" strokeDasharray="3 2" /><circle cx="36" cy="-17" r="3" fill="#E9EEF5" /></g>`,
  pencils: (x, y) => html`<g transform=${`translate(${x},${y})`}>${["#E98B7B", "#F4C84B", "#7FBF8E", "#7EA9D8", "#B79BD9"].map((c, i) => html`<g key=${i} transform=${`translate(${i * 9},0)`}><rect x="0" y="-40" width="6" height="34" fill=${c} /><path d="M0,-6 L3,2 L6,-6 Z" fill="#F3D9B1" /></g>`)}</g>`,
  bottle: (x, y) => html`<g transform=${`translate(${x},${y})`}><rect x="-10" y="-46" width="20" height="46" rx="6" fill="#86C2A0" /><rect x="-6" y="-54" width="12" height="9" rx="2" fill="#2E7D73" /></g>`,
  bubble: (x, y, inner, w = 56) => html`<g transform=${`translate(${x},${y})`}><rect x=${-w / 2} y="-24" width=${w} height="40" rx="18" fill="#FFFFFF" stroke="#E2D5C2" /><path d="M-6,16 l-6,10 l14,-10z" fill="#FFFFFF" stroke="#E2D5C2" />${inner}</g>`,
  ball: (x, y, r = 9) => html`<g transform=${`translate(${x},${y})`}><circle r=${r} fill="#FFFFFF" stroke=${NAVY} strokeWidth="1.6" /><path d=${`M0,${-r / 2.2} l${r / 2.2},${r / 3} l-${r / 3.6},${r / 2.2} h-${r / 2} l-${r / 3.6},-${r / 2.2} z`} fill=${NAVY} /></g>`,
  note: (x, y) => html`<g transform=${`translate(${x},${y})`} fill="#5F8FC4"><circle cx="-4" cy="6" r="5" /><rect x="0" y="-12" width="2.6" height="18" /><path d="M2.6,-12 q8,2 8,9 q-3,-4 -8,-4z" /></g>`,
  palette: (x, y) => html`<g transform=${`translate(${x},${y})`}><ellipse rx="13" ry="10" fill="#F3D9B1" /><circle cx="-5" cy="-3" r="2.6" fill="#E98B7B" /><circle cx="2" cy="-5" r="2.6" fill="#7EA9D8" /><circle cx="6" cy="1" r="2.6" fill="#7FBF8E" /></g>`,
  kampung: (x, y) => html`<g transform=${`translate(${x},${y})`}><rect x="-4" y="-22" width="5" height="22" fill="#8B6A4A" /><rect x="70" y="-22" width="5" height="22" fill="#8B6A4A" /><rect x="-10" y="-66" width="92" height="44" fill="#C89A6A" /><path d="M-22,-64 L36,-104 L94,-64 Z" fill="#9C5B3B" /><rect x="22" y="-56" width="20" height="34" fill="#7E5236" /><rect x="52" y="-56" width="20" height="14" fill="#F1E2C6" /><rect x="-2" y="-56" width="16" height="14" fill="#F1E2C6" /><path d="M22,-22 l-8,22 M42,-22 l8,22" stroke="#8B6A4A" strokeWidth="3" /></g>`,
  paddy: () => html`<g><rect x="0" y="178" width="360" height="42" fill="#B9DBA8" />${Array.from({ length: 24 }, (_, i) => html`<path key=${i} d=${`M${8 + i * 15},200 q2,-12 0,-18 M${8 + i * 15},200 q6,-10 8,-14`} stroke="#6E9E5A" strokeWidth="1.6" fill="none" />`)}</g>`,
  sea: () => html`<g><rect x="0" y="120" width="360" height="40" fill="#A9D7DC" /><path d="M0,128 q15,-5 30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.8" /><rect x="0" y="158" width="360" height="62" fill="#F1E1BE" /></g>`,
  castle: (x, y) => html`<g transform=${`translate(${x},${y})`} fill="#D9BE8C"><rect x="-22" y="-20" width="44" height="20" /><rect x="-26" y="-34" width="14" height="16" /><rect x="12" y="-34" width="14" height="16" /><rect x="-7" y="-40" width="14" height="22" /><path d="M0,-40 v-10 l8,4 l-8,3" stroke="#E98B7B" strokeWidth="1.5" /></g>`,
  desk: (x, y) => html`<g transform=${`translate(${x},${y})`}><rect x="0" y="0" width="170" height="10" rx="3" fill="#B98A5E" /><rect x="10" y="10" width="8" height="40" fill="#A47750" /><rect x="152" y="10" width="8" height="40" fill="#A47750" /><g transform="rotate(-12 40 -6)"><rect x="20" y="-10" width="40" height="8" fill="#7EA9D8" /></g><rect x="60" y="-14" width="34" height="14" fill="#E98B7B" /><g transform="rotate(14 120 -6)"><rect x="100" y="-6" width="36" height="5" fill="#FFFFFF" stroke="#D9CDBB" /></g><g transform="rotate(-20 140 -4)"><rect x="128" y="-4" width="30" height="4" fill="#FFFFFF" stroke="#D9CDBB" /></g><rect x="96" y="-24" width="22" height="24" fill="#F4C84B" /></g>`,
  question: (x, y) => html`<g transform=${`translate(${x},${y})`}><circle r="16" fill="#FFFFFF" stroke="#E2D5C2" /><text x="0" y="7" textAnchor="middle" fontSize="20" fontWeight="700" fill="#087F78" fontFamily="Fredoka, sans-serif">?</text></g>`,
  wau: (x, y) => html`<g transform=${`translate(${x},${y})`}><path d="M0,-40 C-30,-34 -44,-14 -40,0 C-28,-8 -14,-6 0,6 C14,-6 28,-8 40,0 C44,-14 30,-34 0,-40 Z" fill="#E98B7B" /><path d="M0,6 C-12,16 -26,22 -30,36 C-14,32 -6,30 0,26 C6,30 14,32 30,36 C26,22 12,16 0,6 Z" fill="#F4C84B" /><path d="M0,-40 V30" stroke="#7E5236" strokeWidth="2" /><circle cx="0" cy="-16" r="7" fill="#7FBF8E" /><path d="M-24,-14 q24,-14 48,0" stroke="#FFFFFF" strokeWidth="2" fill="none" /></g>`,
  pot: (x, y, c = "#E3A27F") => html`<g transform=${`translate(${x},${y})`}><path d="M-14,-20 h28 l-4,20 h-20z" fill=${c} /><path d="M0,-20 q-12,-16 -4,-26 M0,-20 q10,-14 4,-28" stroke="#6E9E78" strokeWidth="3" fill="none" /><circle cx="-4" cy="-46" r="5" fill="#F4DB8A" /><circle cx="4" cy="-48" r="5" fill="#F2B8A0" /></g>`,
  can: (x, y) => html`<g transform=${`translate(${x},${y})`}><rect x="-14" y="-22" width="28" height="22" rx="4" fill="#7EA9D8" /><path d="M14,-18 l16,-10" stroke="#7EA9D8" strokeWidth="5" strokeLinecap="round" /><path d="M-14,-16 q-12,-6 -6,-16" stroke="#7EA9D8" strokeWidth="3" fill="none" /></g>`,
  hills: () => html`<g><path d="M0,150 Q60,90 130,140 Q200,80 280,135 Q320,110 360,130 L360,220 L0,220 Z" fill="#B9D8B5" /><path d="M0,170 Q90,140 180,168 T360,160 L360,220 L0,220 Z" fill="#9CC79E" />${[40, 70, 100, 230, 260, 290].map((tx, i) => html`<path key=${i} d=${`M${tx},${168 - (i % 3) * 4} q10,-6 20,0`} stroke="#7FB083" strokeWidth="3" fill="none" />`)}</g>`,
  suitcase: (x, y) => html`<g transform=${`translate(${x},${y})`}><rect x="-26" y="-50" width="52" height="50" rx="7" fill="#E98B7B" /><path d="M-10,-50 v-8 h20 v8" stroke="#7E5236" strokeWidth="3" fill="none" /><path d="M-26,-30 h52" stroke="#D07565" strokeWidth="3" /><circle cx="-16" cy="2" r="3" fill="#3A3F4A" /><circle cx="16" cy="2" r="3" fill="#3A3F4A" /></g>`,
  map: (x, y) => html`<g transform=${`translate(${x},${y})`}><path d="M-30,-30 l20,6 l20,-6 l20,6 v34 l-20,-6 l-20,6 l-20,-6 z" fill="#F7EBC8" stroke="#D9CDBB" /><path d="M-24,-18 q14,10 20,0 t22,6" stroke="#E98B7B" strokeWidth="2" strokeDasharray="3 3" fill="none" /><circle cx="18" cy="-12" r="3" fill="#E98B7B" /></g>`,
  cave: () => html`<g><rect width="360" height="220" fill="#DCE7E2" /><path d="M20,220 Q40,30 180,26 Q320,30 340,220 Z" fill="#8E9A98" /><path d="M70,220 Q90,80 180,74 Q270,80 290,220 Z" fill="#3E4651" /><path d="M200,150 L330,90 L340,140 Z" fill="#F6E7A8" opacity="0.55" /><g fill="#76817F"><circle cx="40" cy="200" r="10" /><circle cx="320" cy="205" r="12" /></g></g>`,
  torch: (x, y) => html`<g transform=${`translate(${x},${y}) rotate(-25)`}><rect x="0" y="-5" width="22" height="10" rx="3" fill="#3A3F4A" /><rect x="20" y="-7" width="7" height="14" rx="2" fill="#F4C84B" /></g>`,
  board: (x, y) => html`<g transform=${`translate(${x},${y})`}><rect x="0" y="0" width="160" height="90" rx="4" fill="#FFFFFF" stroke="#B9A88F" strokeWidth="4" /><path d="M16,24 h70 M16,42 h100 M16,60 h56" stroke="#7EA9D8" strokeWidth="4" strokeLinecap="round" /><path d="M120,62 l8,8 l16,-18" stroke="#7FBF8E" strokeWidth="4" fill="none" strokeLinecap="round" /></g>`,
  track: () => html`<g><rect x="0" y="150" width="360" height="70" fill="#D98F75" /><path d="M0,168 H360 M0,186 H360 M0,204 H360" stroke="#FFFFFF" strokeWidth="2" /><rect x="280" y="150" width="6" height="70" fill="#FFFFFF" /></g>`,
  flagline: () => html`<g><path d="M0,30 L360,30" stroke="#B9A88F" strokeWidth="2" />${Array.from({ length: 12 }, (_, i) => html`<path key=${i} d=${`M${10 + i * 30},30 l20,0 l-10,18 z`} fill=${["#E98B7B", "#F4C84B", "#7FBF8E", "#7EA9D8"][i % 4]} />`)}</g>`,
  shelf: (x, y) => html`<g transform=${`translate(${x},${y})`}><rect x="0" y="-100" width="100" height="100" rx="3" fill="#C89A6A" /><rect x="6" y="-94" width="88" height="40" fill="#F1E2C6" /><rect x="6" y="-48" width="88" height="42" fill="#F1E2C6" />${[["#E98B7B", 8, -92], ["#7EA9D8", 20, -88], ["#7FBF8E", 32, -92], ["#F4C84B", 44, -86], ["#B79BD9", 56, -92], ["#7FBF8E", 10, -46], ["#E98B7B", 22, -42], ["#7EA9D8", 34, -46], ["#F4C84B", 46, -40]].map(([c, bx, by], i) => html`<rect key=${i} x=${bx} y=${by} width="10" height=${-by - (by < -60 ? 54 : 8)} fill=${c} />`)}</g>`,
  cushion: (x, y, c) => html`<ellipse cx=${x} cy=${y} rx="22" ry="9" fill=${c} />`,
  bins: (x, y) => html`<g transform=${`translate(${x},${y})`}>${[["#7EA9D8", "Paper"], ["#F4C84B", "Plastic"], ["#E98B7B", "Cans"]].map(([c, t], i) => html`<g key=${i} transform=${`translate(${i * 34},0)`}><rect x="0" y="-44" width="30" height="44" rx="3" fill=${c} /><rect x="-2" y="-50" width="34" height="7" rx="2" fill=${c} stroke="#00000020" /><path d="M9,-26 l6,-8 l6,8 M15,-34 v14" stroke="#FFFFFF" strokeWidth="2" fill="none" /></g>`)}</g>`,
  box: (x, y) => html`<g transform=${`translate(${x},${y})`}><rect x="-20" y="-20" width="40" height="20" fill="#C89A6A" /><rect x="-14" y="-28" width="8" height="10" fill="#E98B7B" /><rect x="-4" y="-30" width="8" height="12" fill="#7FBF8E" /><rect x="6" y="-27" width="8" height="9" fill="#7EA9D8" /></g>`
};

const SCENES = {
  routine: () => [P.sky(), P.sun(60, 60), P.cloud(250, 40), P.ground(), P.bus(20, 186), P.clock(300, 80),
    html`<${Kid} key="k" x=${220} y=${196} skin=${1} hair="short" bag="#E98B7B" />`],
  someone: () => [P.sky(), P.cloud(80, 34), P.ground(), P.tree(300, 172, 1), P.flowers(30, 190), P.flowers(250, 196),
    html`<${Kid} key="g" x=${150} y=${194} s=${1.12} skin=${1} hair="tudung" scarf="#C9B5E4" shirt="#E9DDF3" pants="#8A7FA6" glasses=${true} />`,
    html`<${Kid} key="c" x=${210} y=${196} s=${0.85} skin=${1} hair="short" shirt="#BFD7EA" />`],
  object: () => [P.indoor(), P.table(40, 150, 280), P.book(110, 148), P.pencilcase(210, 150), P.pencils(255, 150), P.bottle(80, 150)],
  celebration: () => [P.indoor(), P.bunting(), P.table(90, 150, 180), P.cake(150, 150), P.gift(215, 150), P.kuih(250, 150),
    html`<${Kid} key="a" x=${50} y=${200} skin=${3} hair="curly" shirt="#F4DB8A" />`,
    html`<${Kid} key="b" x=${315} y=${200} skin=${0} hair="pony" shirt="#F2B8A0" pants="#7A6A9A" />`],
  activity: () => [P.sky(), P.sun(310, 40), P.ground("#BFDDB6"), P.net(180, 190),
    html`<${Kid} key="a" x=${100} y=${196} skin=${1} hair="tudung" scarf="#2E7D73" shirt="#FFFFFF" arm="up" />`, P.racket(118, 106),
    html`<${Kid} key="b" x=${260} y=${196} skin=${2} hair="short" shirt="#BFD7EA" arm="up" />`, P.racket(278, 106), P.shuttle(205, 70)],
  animal: () => [P.sky(), P.cloud(70, 40), P.ground(), P.tree(60, 175, 0.9), P.cat(200, 196), P.bowl(290, 198),
    html`<${Kid} key="k" x=${260} y=${196} s=${0.9} skin=${2} hair="pony" shirt="#F4DB8A" />`],
  aboutme: () => [P.indoor(), html`<${Kid} key="k" x=${180} y=${205} s=${1.15} skin=${1} hair="short" shirt="#9FC7B7" />`,
    P.bubble(80, 70, P.ball(0, -4, 11)), P.bubble(180, 40, P.book(0, 6)), P.bubble(280, 70, P.note(0, -4))],
  place: () => [P.sky(), P.sun(300, 44), P.cloud(90, 36), P.paddy(), P.palm(40, 180), P.palm(320, 182), P.kampung(140, 178)],
  memorable: () => [P.sky(), P.sun(290, 50), P.sea(), P.palm(330, 186), P.castle(170, 190),
    html`<${Kid} key="a" x=${100} y=${200} s=${0.9} skin=${2} hair="short" shirt="#F2B8A0" />`,
    html`<${Kid} key="b" x=${240} y=${204} s=${0.9} skin=${0} hair="pony" shirt="#BFD7EA" />`],
  advice: () => [P.indoor(), P.clock(310, 50), P.desk(60, 150), P.question(220, 50),
    html`<${Kid} key="k" x=${190} y=${206} s=${1} skin=${0} hair="pony" shirt="#FFFFFF" pants="#2C4A7C" />`],
  wau: () => [P.sky(), P.cloud(60, 50), P.cloud(300, 120), P.ground("#BFDDB6"), P.wau(250, 70),
    html`<path key="str" d="M250,100 Q200,150 132,118" stroke="#7E5236" strokeWidth="1.2" fill="none" />`,
    html`<${Kid} key="k" x=${120} y=${200} skin=${1} hair="songkok" shirt="#F4DB8A" arm="up" />`],
  person: () => [P.sky(), P.ground(), P.pot(240, 196), P.pot(280, 196, "#9FC7B7"), P.can(200, 196), P.flowers(20, 194),
    html`<${Kid} key="u" x=${110} y=${196} s=${1.12} skin=${1} hair="songkok" shirt="#9FC7B7" pants="#5A5F6B" />`,
    html`<${Kid} key="c" x=${170} y=${198} s=${0.82} skin=${1} hair="tudung" scarf="#F2B8A0" shirt="#FFFFFF" />`],
  holiday: () => [P.sky(), P.sun(60, 50), P.cloud(250, 40), P.hills(), P.suitcase(250, 200), P.map(310, 186),
    html`<${Kid} key="k" x=${180} y=${204} skin=${2} hair="curly" shirt="#F2B8A0" />`],
  adventure: () => [P.cave(), html`<${Kid} key="a" x=${160} y=${205} s=${0.95} skin=${1} hair="short" shirt="#F4DB8A" />`, P.torch(178, 140),
    html`<${Kid} key="b" x=${110} y=${205} s=${0.95} skin=${3} hair="tudung" scarf="#9FC7B7" shirt="#F2B8A0" />`, P.map(70, 150)],
  admire: () => [P.indoor(), P.board(150, 40),
    html`<${Kid} key="t" x=${110} y=${205} s=${1.2} skin=${1} hair="tudung" scarf="#7EA9D8" shirt="#E8F0F8" pants="#2C4A7C" arm="up" />`,
    html`<${Kid} key="p" x=${250} y=${205} s=${0.9} skin=${2} hair="short" shirt="#FFFFFF" />`],
  event: () => [P.sky(), P.flagline(), P.ground("#BFDDB6"), P.track(),
    html`<${Kid} key="a" x=${120} y=${190} s=${0.8} skin=${3} hair="short" shirt="#F4DB8A" />`,
    html`<${Kid} key="b" x=${200} y=${208} s=${0.8} skin=${0} hair="tudung" scarf="#E98B7B" shirt="#FFFFFF" />`,
    html`<${Kid} key="c" x=${40} y=${150} s=${0.7} skin=${1} hair="pony" shirt="#BFD7EA" arm="up" />`,
    html`<${Kid} key="d" x=${330} y=${150} s=${0.7} skin=${2} hair="curly" shirt="#9FC7B7" arm="up" />`],
  getting: () => [P.indoor(), P.bubble(110, 60, P.palette(0, -4)), P.bubble(250, 60, P.ball(0, -4, 11)),
    html`<${Kid} key="a" x=${130} y=${205} skin=${0} hair="tudung" scarf="#9FC7B7" shirt="#F2B8A0" />`,
    html`<${Kid} key="b" x=${230} y=${205} skin=${3} hair="short" shirt="#F4DB8A" />`],
  project: () => [P.indoor(), P.shelf(30, 175), P.cushion(70, 190, "#F2B8A0"), P.cushion(120, 194, "#9FC7B7"), P.bins(250, 178),
    html`<${Kid} key="a" x=${190} y=${208} s=${0.85} skin=${2} hair="pony" shirt="#FFFFFF" />`, P.box(210, 150)]
};

// Picture-specific vocabulary: every label is anchored to the visible illustration.
const PICTURE_WORDS = {
  "routine": [
    {
      "word": "school bus",
      "meaning": "a bus that takes children to school",
      "x": 18,
      "y": 136,
      "w": 114,
      "h": 50
    },
    {
      "word": "clock",
      "meaning": "a clock tells the time",
      "x": 276,
      "y": 56,
      "w": 48,
      "h": 48
    },
    {
      "word": "schoolbag",
      "meaning": "a bag for school books",
      "x": 198,
      "y": 130,
      "w": 44,
      "h": 34
    },
    {
      "word": "uniform",
      "meaning": "clothes worn to school",
      "x": 203,
      "y": 132,
      "w": 34,
      "h": 37
    },
    {
      "word": "sun",
      "meaning": "the sun gives light",
      "x": 40,
      "y": 40,
      "w": 40,
      "h": 40
    },
    {
      "word": "smile",
      "meaning": "make a happy face",
      "x": 211,
      "y": 120,
      "w": 20,
      "h": 16
    }
  ],
  "someone": [
    {
      "word": "grandmother",
      "meaning": "the older woman beside the child",
      "x": 125,
      "y": 83,
      "w": 49,
      "h": 113
    },
    {
      "word": "spectacles",
      "meaning": "glasses that help someone see",
      "x": 137,
      "y": 103,
      "w": 26,
      "h": 14
    },
    {
      "word": "grandchild",
      "meaning": "the child beside the grandmother",
      "x": 191,
      "y": 119,
      "w": 38,
      "h": 78
    },
    {
      "word": "tree",
      "meaning": "a plant with a trunk and leaves",
      "x": 255,
      "y": 76,
      "w": 90,
      "h": 98
    },
    {
      "word": "flowers",
      "meaning": "colourful flowers growing in the garden",
      "x": 25,
      "y": 166,
      "w": 45,
      "h": 27
    },
    {
      "word": "smile",
      "meaning": "make a happy face",
      "x": 201,
      "y": 132,
      "w": 18,
      "h": 16
    }
  ],
  "object": [
    {
      "word": "pencil case",
      "meaning": "a case for keeping pencils",
      "x": 170,
      "y": 125,
      "w": 80,
      "h": 26
    },
    {
      "word": "zip",
      "meaning": "the fastener along the pencil case",
      "x": 174,
      "y": 129,
      "w": 70,
      "h": 11
    },
    {
      "word": "colour pencils",
      "meaning": "pencils used for colouring",
      "x": 253,
      "y": 108,
      "w": 45,
      "h": 43
    },
    {
      "word": "book",
      "meaning": "an open book with pages",
      "x": 81,
      "y": 116,
      "w": 61,
      "h": 38
    },
    {
      "word": "water bottle",
      "meaning": "a bottle for drinking water",
      "x": 67,
      "y": 94,
      "w": 27,
      "h": 58
    },
    {
      "word": "table",
      "meaning": "furniture with a flat top and legs",
      "x": 40,
      "y": 153,
      "w": 280,
      "h": 39
    }
  ],
  "celebration": [
    {
      "word": "cake",
      "meaning": "a birthday cake with a candle",
      "x": 122,
      "y": 117,
      "w": 56,
      "h": 36
    },
    {
      "word": "gift",
      "meaning": "a wrapped present",
      "x": 196,
      "y": 115,
      "w": 39,
      "h": 38
    },
    {
      "word": "kuih",
      "meaning": "small Malaysian cakes and snacks",
      "x": 233,
      "y": 129,
      "w": 38,
      "h": 24
    },
    {
      "word": "candle",
      "meaning": "a candle on top of the cake",
      "x": 142,
      "y": 96,
      "w": 16,
      "h": 24
    },
    {
      "word": "bunting",
      "meaning": "colourful flags hanging above the party",
      "x": 10,
      "y": 22,
      "w": 340,
      "h": 44
    },
    {
      "word": "guest",
      "meaning": "a person at the celebration",
      "x": 28,
      "y": 103,
      "w": 44,
      "h": 98
    },
    {
      "word": "smile",
      "meaning": "make a happy face",
      "x": 305,
      "y": 120,
      "w": 20,
      "h": 15
    }
  ],
  "activity": [
    {
      "word": "play badminton",
      "meaning": "use rackets to play badminton",
      "x": 73,
      "y": 105,
      "w": 52,
      "h": 92
    },
    {
      "word": "racket",
      "meaning": "a bat with strings for badminton",
      "x": 264,
      "y": 78,
      "w": 34,
      "h": 44
    },
    {
      "word": "shuttlecock",
      "meaning": "the feathered object hit with a racket",
      "x": 192,
      "y": 50,
      "w": 27,
      "h": 26
    },
    {
      "word": "net",
      "meaning": "a net between the two players",
      "x": 169,
      "y": 116,
      "w": 22,
      "h": 75
    },
    {
      "word": "field",
      "meaning": "an open area of grass",
      "x": 135,
      "y": 194,
      "w": 85,
      "h": 22
    },
    {
      "word": "hold a racket",
      "meaning": "keep a racket in your hand",
      "x": 105,
      "y": 92,
      "w": 28,
      "h": 29
    }
  ],
  "animal": [
    {
      "word": "cat",
      "meaning": "a small animal with fur",
      "x": 157,
      "y": 142,
      "w": 86,
      "h": 56
    },
    {
      "word": "fur",
      "meaning": "the soft hair covering the cat",
      "x": 184,
      "y": 169,
      "w": 25,
      "h": 19
    },
    {
      "word": "tail",
      "meaning": "the curved part at the back of the cat",
      "x": 222,
      "y": 143,
      "w": 25,
      "h": 35
    },
    {
      "word": "paws",
      "meaning": "the feet of a cat",
      "x": 191,
      "y": 184,
      "w": 21,
      "h": 15
    },
    {
      "word": "bowl",
      "meaning": "a bowl holding cat food",
      "x": 275,
      "y": 183,
      "w": 30,
      "h": 18
    },
    {
      "word": "tree",
      "meaning": "a plant with a trunk and leaves",
      "x": 20,
      "y": 89,
      "w": 80,
      "h": 87
    },
    {
      "word": "child",
      "meaning": "a child beside the cat",
      "x": 244,
      "y": 113,
      "w": 32,
      "h": 86
    }
  ],
  "aboutme": [
    {
      "word": "football",
      "meaning": "a ball used in football",
      "x": 66,
      "y": 53,
      "w": 28,
      "h": 27
    },
    {
      "word": "book",
      "meaning": "an open book in the thought bubble",
      "x": 148,
      "y": 15,
      "w": 65,
      "h": 36
    },
    {
      "word": "music",
      "meaning": "a musical note representing music",
      "x": 266,
      "y": 45,
      "w": 27,
      "h": 30
    },
    {
      "word": "pupil",
      "meaning": "a child who goes to school",
      "x": 155,
      "y": 100,
      "w": 50,
      "h": 106
    },
    {
      "word": "smile",
      "meaning": "make a happy face",
      "x": 168,
      "y": 120,
      "w": 24,
      "h": 17
    }
  ],
  "place": [
    {
      "word": "house",
      "meaning": "a kampung house raised on stilts",
      "x": 119,
      "y": 74,
      "w": 119,
      "h": 106
    },
    {
      "word": "paddy field",
      "meaning": "a field where rice grows",
      "x": 70,
      "y": 183,
      "w": 220,
      "h": 32
    },
    {
      "word": "palm tree",
      "meaning": "a tall tree with long leaves",
      "x": 0,
      "y": 66,
      "w": 83,
      "h": 116
    },
    {
      "word": "sun",
      "meaning": "the sun gives light",
      "x": 280,
      "y": 24,
      "w": 40,
      "h": 40
    },
    {
      "word": "cloud",
      "meaning": "a white cloud in the sky",
      "x": 63,
      "y": 19,
      "w": 61,
      "h": 29
    }
  ],
  "memorable": [
    {
      "word": "beach",
      "meaning": "sand beside the sea",
      "x": 15,
      "y": 203,
      "w": 180,
      "h": 14
    },
    {
      "word": "sea",
      "meaning": "a large area of salt water",
      "x": 0,
      "y": 120,
      "w": 290,
      "h": 37
    },
    {
      "word": "sandcastle",
      "meaning": "a castle made from sand",
      "x": 142,
      "y": 143,
      "w": 57,
      "h": 50
    },
    {
      "word": "palm tree",
      "meaning": "a tree beside the beach",
      "x": 284,
      "y": 71,
      "w": 73,
      "h": 116
    },
    {
      "word": "children",
      "meaning": "two children at the beach",
      "x": 81,
      "y": 120,
      "w": 39,
      "h": 82
    },
    {
      "word": "smile",
      "meaning": "make a happy face",
      "x": 232,
      "y": 136,
      "w": 18,
      "h": 15
    }
  ],
  "advice": [
    {
      "word": "clock",
      "meaning": "a clock tells the time",
      "x": 286,
      "y": 25,
      "w": 49,
      "h": 50
    },
    {
      "word": "desk",
      "meaning": "a table used for schoolwork",
      "x": 58,
      "y": 150,
      "w": 173,
      "h": 44
    },
    {
      "word": "books",
      "meaning": "books on the desk",
      "x": 79,
      "y": 127,
      "w": 75,
      "h": 25
    },
    {
      "word": "paper",
      "meaning": "paper lying on the desk",
      "x": 152,
      "y": 137,
      "w": 58,
      "h": 16
    },
    {
      "word": "pencil pot",
      "meaning": "a pot for keeping pencils",
      "x": 153,
      "y": 122,
      "w": 27,
      "h": 27
    },
    {
      "word": "question mark",
      "meaning": "a sign used with a question",
      "x": 202,
      "y": 31,
      "w": 37,
      "h": 37
    },
    {
      "word": "pupil",
      "meaning": "a child beside the desk",
      "x": 174,
      "y": 115,
      "w": 35,
      "h": 94
    }
  ],
  "wau": [
    {
      "word": "fly a kite",
      "meaning": "hold the string while a kite flies",
      "x": 99,
      "y": 111,
      "w": 43,
      "h": 92
    },
    {
      "word": "wau",
      "meaning": "a traditional Malaysian kite",
      "x": 207,
      "y": 27,
      "w": 85,
      "h": 82
    },
    {
      "word": "string",
      "meaning": "the line joining the kite to the child",
      "x": 147,
      "y": 112,
      "w": 55,
      "h": 34
    },
    {
      "word": "cloud",
      "meaning": "a white cloud in the sky",
      "x": 33,
      "y": 34,
      "w": 58,
      "h": 28
    },
    {
      "word": "songkok",
      "meaning": "a dark cap worn on the head",
      "x": 106,
      "y": 100,
      "w": 27,
      "h": 17
    },
    {
      "word": "hold",
      "meaning": "keep the kite string in your hand",
      "x": 128,
      "y": 111,
      "w": 15,
      "h": 25
    }
  ],
  "person": [
    {
      "word": "plant",
      "meaning": "a plant growing in a pot",
      "x": 224,
      "y": 141,
      "w": 34,
      "h": 56
    },
    {
      "word": "flowerpot",
      "meaning": "a container for a plant",
      "x": 264,
      "y": 162,
      "w": 33,
      "h": 36
    },
    {
      "word": "watering can",
      "meaning": "a container used to water plants",
      "x": 181,
      "y": 165,
      "w": 39,
      "h": 33
    },
    {
      "word": "flowers",
      "meaning": "colourful flowers in the garden",
      "x": 17,
      "y": 167,
      "w": 41,
      "h": 29
    },
    {
      "word": "uncle",
      "meaning": "the adult wearing a songkok",
      "x": 85,
      "y": 87,
      "w": 48,
      "h": 111
    },
    {
      "word": "child",
      "meaning": "the child beside the adult",
      "x": 153,
      "y": 122,
      "w": 34,
      "h": 77
    },
    {
      "word": "smile",
      "meaning": "make a happy face",
      "x": 161,
      "y": 135,
      "w": 18,
      "h": 16
    }
  ],
  "holiday": [
    {
      "word": "suitcase",
      "meaning": "a case for clothes when travelling",
      "x": 226,
      "y": 149,
      "w": 51,
      "h": 53
    },
    {
      "word": "map",
      "meaning": "a drawing that shows places",
      "x": 279,
      "y": 151,
      "w": 62,
      "h": 38
    },
    {
      "word": "hills",
      "meaning": "raised areas of land",
      "x": 65,
      "y": 90,
      "w": 245,
      "h": 66
    },
    {
      "word": "sun",
      "meaning": "the sun gives light",
      "x": 40,
      "y": 30,
      "w": 40,
      "h": 40
    },
    {
      "word": "cloud",
      "meaning": "a white cloud in the sky",
      "x": 225,
      "y": 24,
      "w": 58,
      "h": 27
    },
    {
      "word": "traveller",
      "meaning": "a person ready for a journey",
      "x": 159,
      "y": 113,
      "w": 43,
      "h": 94
    }
  ],
  "adventure": [
    {
      "word": "cave",
      "meaning": "a dark opening in rock",
      "x": 180,
      "y": 10,
      "w": 170,
      "h": 128
    },
    {
      "word": "torch",
      "meaning": "a light held in the hand",
      "x": 169,
      "y": 108,
      "w": 24,
      "h": 47
    },
    {
      "word": "map",
      "meaning": "a drawing that shows the way",
      "x": 39,
      "y": 112,
      "w": 63,
      "h": 42
    },
    {
      "word": "explorers",
      "meaning": "children exploring a cave",
      "x": 89,
      "y": 115,
      "w": 41,
      "h": 91
    },
    {
      "word": "hold a torch",
      "meaning": "keep a torch in your hand",
      "x": 154,
      "y": 133,
      "w": 33,
      "h": 30
    }
  ],
  "admire": [
    {
      "word": "teacher",
      "meaning": "an adult helping a pupil learn",
      "x": 82,
      "y": 94,
      "w": 54,
      "h": 111
    },
    {
      "word": "pupil",
      "meaning": "a child learning with the teacher",
      "x": 231,
      "y": 122,
      "w": 37,
      "h": 85
    },
    {
      "word": "whiteboard",
      "meaning": "a board used for lessons",
      "x": 147,
      "y": 36,
      "w": 166,
      "h": 97
    },
    {
      "word": "teach",
      "meaning": "help someone learn at the whiteboard",
      "x": 119,
      "y": 97,
      "w": 21,
      "h": 50
    },
    {
      "word": "tudung",
      "meaning": "a head covering worn by the teacher",
      "x": 83,
      "y": 95,
      "w": 50,
      "h": 44
    },
    {
      "word": "smile",
      "meaning": "make a happy face",
      "x": 242,
      "y": 140,
      "w": 18,
      "h": 14
    }
  ],
  "event": [
    {
      "word": "running track",
      "meaning": "marked lanes used for a race",
      "x": 3,
      "y": 201,
      "w": 163,
      "h": 16
    },
    {
      "word": "finish line",
      "meaning": "the white line across the lanes",
      "x": 276,
      "y": 150,
      "w": 14,
      "h": 70
    },
    {
      "word": "flags",
      "meaning": "colourful flags above the sports event",
      "x": 5,
      "y": 27,
      "w": 349,
      "h": 25
    },
    {
      "word": "pupils",
      "meaning": "children taking part in sports day",
      "x": 103,
      "y": 115,
      "w": 33,
      "h": 76
    },
    {
      "word": "cheer",
      "meaning": "raise a hand to support the participants",
      "x": 25,
      "y": 80,
      "w": 32,
      "h": 72
    },
    {
      "word": "tudung",
      "meaning": "a head covering worn by a pupil",
      "x": 183,
      "y": 131,
      "w": 32,
      "h": 35
    }
  ],
  "getting": [
    {
      "word": "friends",
      "meaning": "two children getting to know each other",
      "x": 111,
      "y": 115,
      "w": 39,
      "h": 92
    },
    {
      "word": "painting",
      "meaning": "an interest shown by a paint palette",
      "x": 95,
      "y": 39,
      "w": 31,
      "h": 26
    },
    {
      "word": "football",
      "meaning": "a ball showing an interest in football",
      "x": 235,
      "y": 41,
      "w": 30,
      "h": 28
    },
    {
      "word": "tudung",
      "meaning": "a head covering worn by one child",
      "x": 110,
      "y": 116,
      "w": 40,
      "h": 35
    },
    {
      "word": "smile",
      "meaning": "make a happy face",
      "x": 221,
      "y": 135,
      "w": 18,
      "h": 15
    }
  ],
  "project": [
    {
      "word": "bookshelf",
      "meaning": "a shelf holding books",
      "x": 26,
      "y": 72,
      "w": 109,
      "h": 106
    },
    {
      "word": "books",
      "meaning": "books arranged on the shelf",
      "x": 37,
      "y": 84,
      "w": 59,
      "h": 34
    },
    {
      "word": "cushion",
      "meaning": "a soft cushion for sitting",
      "x": 46,
      "y": 179,
      "w": 49,
      "h": 23
    },
    {
      "word": "recycling bins",
      "meaning": "containers for sorting materials",
      "x": 246,
      "y": 126,
      "w": 109,
      "h": 56
    },
    {
      "word": "box",
      "meaning": "a box holding materials",
      "x": 187,
      "y": 119,
      "w": 46,
      "h": 34
    },
    {
      "word": "pupil",
      "meaning": "a pupil beside the reading corner",
      "x": 175,
      "y": 132,
      "w": 32,
      "h": 78
    }
  ]
};
function pictureWords(t) { const main = (PICTURE_WORDS[t.scene] || []).map(p => [p.word, p.meaning]); const extra = (PICTURE_ACTIONS[t.scene] || []).map(([word, kind]) => { const p = PICTURE_WORDS["action-" + t.scene + "-" + word.replace(/\W+/g, "-")][0]; return [word, p.meaning]; }); return [...new Map([...main, ...extra].map(v => [v[0],v])).values()]; }
function Scene({ id, alt, className = "", interactive = false, selectedWord = null, onSelect }) {
  const [tip, setTip] = useState(null);
  const labels = interactive ? (PICTURE_WORDS[id] || []) : [];
  const tipId = React.useId();
  useEffect(() => { setTip(null); }, [id, interactive]);
  useEffect(() => {
    if (!interactive) return;
    const hide = () => setTip(null);
    addEventListener("scroll", hide, true); addEventListener("resize", hide);
    return () => { removeEventListener("scroll", hide, true); removeEventListener("resize", hide); };
  }, [interactive]);
  const show = (e, item, focused = false) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ item, x: focused ? r.left + r.width / 2 : e.clientX, y: focused ? r.top + r.height : e.clientY });
  };
  const choose = (item) => { if (onSelect) onSelect(item.word); };
  const parts = (SCENES[id] || (() => [P.sky()]))();
  const tooltip = tip ? html`<div id=${tipId} className="picture-word-tooltip" role="tooltip" style=${{
    left: Math.max(8, Math.min(tip.x + 14, innerWidth - 212)) + "px",
    top: Math.max(8, Math.min(tip.y + 18, innerHeight - 78)) + "px"
  }}><strong>${tip.item.word}</strong><span>${tip.item.meaning}</span></div>` : null;
  return html`<${React.Fragment}><svg className=${"scene " + className} viewBox="0 0 360 220" role=${interactive ? "group" : "img"} aria-label=${alt || (interactive ? "Explore the picture words" : undefined)} preserveAspectRatio="xMidYMid slice">
    ${parts.map((p, i) => React.cloneElement(p, { key: p.key || "p" + i }))}
    ${labels.map(item => html`<rect key=${item.word} className=${"picture-word-target" + (selectedWord === item.word ? " selected" : "")} x=${item.x} y=${item.y} width=${item.w} height=${item.h} rx="4" fill="transparent" tabIndex="0" role="button" aria-label=${item.word + ": " + item.meaning} aria-pressed=${selectedWord === item.word} aria-describedby=${tip && tip.item.word === item.word ? tipId : undefined}
      onPointerEnter=${e => show(e, item)} onPointerMove=${e => show(e, item)} onPointerLeave=${() => setTip(null)}
      onFocus=${e => show(e, item, true)} onBlur=${() => setTip(null)} onClick=${e => { choose(item); show(e, item, e.detail === 0); }}
      onKeyDown=${e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(item); show(e, item, true); } if (e.key === "Escape") { e.preventDefault(); setTip(null); } }} />`)}
  </svg>${tooltip ? ReactDOM.createPortal(tooltip, document.body) : null}<//>`;
}

/* Extra action pictures keep the original topic word banks intact. */
const PICTURE_ACTIONS = {
 routine:[['wake up','waking'],['brush','brushing'],['bathe','bathing']],
 celebration:[['invite','inviting'],['join','joining'],['reply','replying']],
 activity:[['practise','badminton'],['enjoy','badminton']], animal:[['crawl','crawling'],['hop','hopping']],
 aboutme:[['prefer','choosing']], memorable:[['arrived','arriving']],
 advice:[['organise','sorting'],['label','labelling'],['remind','reminding'],['encourage','encouraging']],
 person:[['share','sharing'],['encourage','encouraging'],['spend time','together']],
 holiday:[['pack','packing'],['book','booking'],['looking forward to','anticipating'],['explore','exploring']],
 adventure:[['rescue','rescuing'],['discover','discovering']], admire:[['inspire','encouraging']],
 event:[['held','event'],['rehearse','rehearsing'],['participate','joining'],['cheer','cheering']],
 getting:[['cooperate','cooperating']], project:[['recycle','recycling'],['arrange','sorting'],['collect','collecting'],['decorate','decorating']]
};
function ActionArt({ kind }) {
 const child=(x=110,y=205,arm)=>html`<${Kid} x=${x} y=${y} skin=${1} hair="short" shirt="#7EA9D8" arm=${arm} />`;
 const friend=(x=250,y=205,arm)=>html`<${Kid} x=${x} y=${y} skin=${3} hair="tudung" scarf="#C9B5E4" shirt="#E98B7B" arm=${arm} />`;
 const arrow=(x,y)=>html`<path d=${`M${x},${y} h44 m-12,-10 l12,10 l-12,10`} fill="none" stroke="#2E7D73" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />`;
 const message=(text)=>html`<g><rect x="70" y="18" width="220" height="42" rx="16" fill="#fff" stroke="#B9A88F"/><path d="M190,60 l15,15 l-3,-15" fill="#fff"/><text x="180" y="44" textAnchor="middle" fontSize="17" fill="#172B4D" fontFamily="sans-serif">${text}</text></g>`;
 switch(kind){
 case 'waking': return html`<g>${P.indoor()}${P.sun(290,44)}${P.clock(52,48)}<rect x="60" y="151" width="225" height="42" rx="8" fill="#7EA9D8"/><path d="M63,132 v75 M283,155 v52" stroke="#A47750" strokeWidth="9"/><ellipse cx="100" cy="150" rx="32" ry="9" fill="#fff"/>${child(165,185,'up')}<path d="M173,93 l17,-20 M144,98 l-16,-22" stroke="#F4C84B" strokeWidth="3"/></g>`;
 case 'brushing': return html`<g>${P.indoor()}${child(165,198)}<path d="M160,127 l46,-12" stroke="#E98B7B" strokeWidth="5"/><path d="M200,112 l10,-3" stroke="#fff" strokeWidth="9"/><path d="M210,112 v-12" stroke="#7EA9D8" strokeWidth="4"/><path d="M210,166 h90 q-3,30 -45,30 q-41,0 -45,-30" fill="#fff" stroke="#B9A88F" strokeWidth="3"/><path d="M265,164 v-26 q0,-18 20,-18" stroke="#899AAB" strokeWidth="6" fill="none"/><path d="M285,128 v27" stroke="#7EA9D8" strokeWidth="3" strokeDasharray="3 4"/></g>`;
 case 'bathing':return html`<g>${P.indoor()}${child(175,206)}<path d="M80,148 h200 l-15,51 H95z" fill="#fff" stroke="#7EA9D8" strokeWidth="4"/><path d="M85,150 H280" stroke="#9FC7B7" strokeWidth="8"/><path d="M265,70 v-35 h-50" fill="none" stroke="#899AAB" strokeWidth="7"/><path d="M210,45 h35" stroke="#899AAB" strokeWidth="9"/><path d="M210,57 v68 M225,57 v68 M240,57 v68" stroke="#7EA9D8" strokeWidth="3" strokeDasharray="5 6"/><g fill="#fff" stroke="#BDD7E8"><circle cx="125" cy="147" r="12"/><circle cx="145" cy="145" r="10"/><circle cx="230" cy="145" r="15"/></g></g>`;
 case 'inviting':return html`<g>${P.indoor()}${child(80,202)}${friend(285,202)}<rect x="141" y="82" width="78" height="91" rx="4" fill="#fff" stroke="#D9B15F" strokeWidth="3"/><text x="180" y="111" textAnchor="middle" fontSize="14" fill="#172B4D">YOU ARE</text><text x="180" y="134" textAnchor="middle" fontSize="14" fill="#172B4D">INVITED</text>${arrow(95,67)}${P.cake(180,166)}</g>`;
 case 'replying':return html`<g>${P.indoor()}${child(90,205)}<rect x="156" y="75" width="115" height="91" rx="5" fill="#fff" stroke="#7EA9D8"/><path d="M169,91 h80 M169,108 h60" stroke="#B9A88F" strokeWidth="3"/><text x="212" y="145" textAnchor="middle" fontSize="16" fill="#172B4D">YES, THANK YOU!</text><path d="M252,185 h-95 m12,-9 l-12,9 l12,9" stroke="#2E7D73" strokeWidth="4" fill="none"/></g>`;
 case 'joining':return html`<g>${P.sky()}${P.ground()}${child(60,202)}${friend(220,202)}${child(285,202,'up')}${arrow(105,126)}${P.ball(252,195,12)}</g>`;
 case 'badminton':return html`<g>${SCENES.activity()}</g>`;
 case 'crawling':return html`<g>${P.sky()}${P.ground()}<path d="M50,192 h230" stroke="#8FBF9A" strokeWidth="4"/>${[80,110,140,170,200].map((x,i)=>html`<g key=${x}><circle cx=${x} cy="154" r="20" fill=${i%2?'#8FBF9A':'#7FBF8E'}/><path d=${`M${x-7},171 l-6,10 M${x+7},171 l6,10`} stroke="#5B805B" strokeWidth="3"/></g>`)}<circle cx="218" cy="140" r="22" fill="#9CC9A6"/><circle cx="226" cy="136" r="3" fill="#172B4D"/><path d="M218,121 l-4,-14 M230,123 l6,-14" stroke="#5B805B" strokeWidth="3"/>${arrow(140,84)}</g>`;
 case 'hopping':return html`<g>${P.sky()}${P.ground()}<ellipse cx="200" cy="130" rx="39" ry="25" fill="#fff" stroke="#AAB6C0" strokeWidth="2"/><circle cx="233" cy="106" r="23" fill="#fff" stroke="#AAB6C0" strokeWidth="2"/><ellipse cx="226" cy="67" rx="8" ry="29" fill="#fff" stroke="#AAB6C0" strokeWidth="2"/><ellipse cx="245" cy="68" rx="7" ry="28" fill="#fff" stroke="#AAB6C0" strokeWidth="2"/><circle cx="241" cy="104" r="3" fill="#172B4D"/><ellipse cx="182" cy="155" rx="24" ry="8" fill="#fff"/><path d="M79,182 Q114,83 164,121" stroke="#2E7D73" strokeWidth="3" fill="none" strokeDasharray="6 5"/><path d="M151,118 l16,5 l-6,-16" fill="none" stroke="#2E7D73" strokeWidth="3"/></g>`;
 case 'choosing':return html`<g>${P.indoor()}${child(180,205)}${P.bubble(80,75,P.ball(0,-4,18),90)}${P.bubble(275,75,P.book(0,6),90)}<path d="M67,111 l10,10 l22,-25" stroke="#2E7D73" strokeWidth="5" fill="none"/>${message('I prefer football.')}</g>`;
 case 'arriving':return html`<g>${P.sky()}${P.ground()}${P.kampung(232,181)}${child(130,204)}${P.suitcase(175,202)}${arrow(163,70)}<path d="M98,208 L260,208" stroke="#B9A88F" strokeWidth="4"/></g>`;
 case 'sorting':return html`<g>${P.indoor()}${P.shelf(230,180)}${child(100,205)}${P.box(160,177)}${arrow(157,105)}</g>`;
 case 'labelling':return html`<g>${P.indoor()}<rect x="100" y="80" width="150" height="106" rx="5" fill="#C89A6A"/><rect x="128" y="109" width="94" height="45" rx="5" fill="#fff" stroke="#7EA9D8"/><text x="175" y="138" textAnchor="middle" fontSize="20" fill="#172B4D">BOOKS</text><path d="M242,105 l40,-45 l10,10 l-40,45z" fill="#F4C84B" stroke="#172B4D"/><path d="M242,105 l-5,15 l15,-5" fill="#F3CDA6"/></g>`;
 case 'reminding':return html`<g>${P.indoor()}${child(85,205)}${friend(280,205)}${P.clock(180,107)}${message('Remember your homework.')}<rect x="154" y="148" width="54" height="40" fill="#F4DB8A"/><path d="M164,159 h33 M164,170 h25" stroke="#7EA9D8" strokeWidth="3"/></g>`;
 case 'encouraging':return html`<g>${P.indoor()}${child(110,205,'up')}${friend(255,205)}${P.book(253,159)}${message('You can do it!')}</g>`;
 case 'sharing':return html`<g>${P.indoor()}${child(80,205)}${friend(280,205)}${P.table(120,169,120)}${P.kuih(178,169)}<path d="M99,152 h45 M263,152 h-44" stroke="#DDA877" strokeWidth="8" strokeLinecap="round"/>${arrow(143,87)}</g>`;
 case 'together':return html`<g>${P.sky()}${P.ground()}${child(125,205)}${friend(235,205)}${P.book(180,158)}${P.tree(40,165,.65)}</g>`;
 case 'packing':return html`<g>${P.indoor()}${child(75,205)}${P.suitcase(253,203)}<path d="M134,82 l-28,14 l15,24 l17,-8 v45 h57 v-45 l17,8 l15,-24 l-28,-14" fill="#9FC7B7" stroke="#2E7D73" strokeWidth="2"/>${arrow(176,178)}</g>`;
 case 'booking':return html`<g>${P.indoor()}<rect x="31" y="55" width="116" height="144" fill="#C89A6A"/><text x="89" y="80" textAnchor="middle" fontSize="18" fill="#172B4D">HOTEL</text>${[0,1,2].map(i=>html`<g key=${i}><rect x="45" y=${95+i*28} width="30" height="18" fill="#E3F0EE"/><rect x="98" y=${95+i*28} width="30" height="18" fill="#E3F0EE"/></g>`)}<rect x="190" y="71" width="129" height="117" rx="6" fill="#fff" stroke="#7EA9D8"/><text x="254" y="101" textAnchor="middle" fontSize="15" fill="#172B4D">ROOM BOOKING</text><path d="M213,126 h85 M213,145 h57 M228,169 l10,9 l23,-26" stroke="#2E7D73" strokeWidth="4" fill="none"/></g>`;
 case 'anticipating':return html`<g>${P.indoor()}${child(105,204)}${P.suitcase(162,203)}<rect x="218" y="63" width="109" height="116" rx="5" fill="#fff" stroke="#7EA9D8"/><text x="272" y="92" textAnchor="middle" fontSize="15" fill="#172B4D">HOLIDAY</text>${P.sun(272,126)}${message('I cannot wait!')}</g>`;
 case 'exploring':return html`<g>${SCENES.adventure()}</g>`;
 case 'discovering':return html`<g>${P.cave()}${child(100,205)}${P.torch(119,145)}<rect x="230" y="147" width="75" height="46" fill="#A47750" stroke="#D9B15F" strokeWidth="3"/><path d="M230,145 q37,-38 75,0" fill="#B98A5E"/><circle cx="253" cy="154" r="8" fill="#F4C84B"/><circle cx="273" cy="154" r="8" fill="#F4C84B"/><path d="M255,94 v22 M244,105 h22 M291,113 v18 M283,122 h17" stroke="#F4C84B" strokeWidth="3"/></g>`;
 case 'rescuing':return html`<g>${P.sky()}<path d="M0,172 h155 v48 H0 M240,172 h120 v48 H240" fill="#9CC9A6"/>${child(115,169)}${friend(213,217,'up')}<path d="M131,115 Q167,103 224,139" stroke="#B98A5E" strokeWidth="5" fill="none"/><path d="M152,179 v41 M240,179 v41" stroke="#A47750" strokeWidth="7"/>${message('Hold the rope!')}</g>`;
 case 'event':return html`<g>${SCENES.event()}<rect x="135" y="65" width="90" height="47" rx="4" fill="#fff"/><text x="180" y="85" textAnchor="middle" fontSize="14" fill="#172B4D">SPORTS DAY</text><text x="180" y="104" textAnchor="middle" fontSize="14" fill="#172B4D">TODAY</text></g>`;
 case 'rehearsing':return html`<g>${P.indoor()}<path d="M20,20 h75 l-12,155 H20 M265,20 h75 v155 h-63" fill="#A45C6A"/><rect x="20" y="181" width="320" height="20" fill="#A47750"/>${child(180,183)}<rect x="164" y="118" width="47" height="40" fill="#fff"/><path d="M171,128 h29 M171,139 h23" stroke="#7EA9D8" strokeWidth="3"/>${P.note(245,74)}</g>`;
 case 'cheering':return html`<g>${P.sky()}${P.ground()}${child(110,205,'up')}${friend(250,205,'up')}<path d="M126,104 v-47 l50,10 l-50,17" fill="#F4C84B" stroke="#A47750" strokeWidth="3"/>${message('Well done!')}</g>`;
 case 'cooperating':return html`<g>${P.indoor()}${child(82,205)}${friend(280,205)}${P.table(117,168,125)}<rect x="128" y="130" width="100" height="35" fill="#fff"/><path d="M144,143 h37 M144,152 h67" stroke="#7EA9D8" strokeWidth="3"/><path d="M104,151 h30 M259,151 h-30" stroke="#DDA877" strokeWidth="8"/>${message('Let us work together.')}</g>`;
 case 'recycling':return html`<g>${P.sky()}${P.ground()}${child(85,205)}${P.bins(202,199)}${P.bottle(165,135)}<path d="M173,143 l35,27 m-4,-16 l5,17 l-17,-2" stroke="#2E7D73" strokeWidth="4" fill="none"/></g>`;
 case 'collecting':return html`<g>${P.sky()}${P.ground()}${child(104,205)}${P.box(252,201)}${P.bottle(179,183)}${P.bottle(204,177)}${arrow(166,110)}</g>`;
 case 'decorating':return html`<g>${P.indoor()}${P.bunting()}${child(100,205,'up')}${friend(267,205,'up')}<path d="M117,121 l25,-20 l21,12 l-18,21z" fill="#F4DB8A" stroke="#B9A88F"/>${P.flowers(177,191)}</g>`;
 default:return html`<g>${P.indoor()}${child()}${P.book(230,162)}</g>`;
 }
}
Object.entries(PICTURE_ACTIONS).forEach(([scene, actions]) => actions.forEach(([word, kind]) => {
 const id = 'action-' + scene + '-' + word.replace(/\W+/g, '-');
 SCENES[id] = () => [html`<${ActionArt} kind=${kind} />`];
 const topic = TOPICS.find(t => t.scene === scene);
 const entry = topic && topic.vocab.find(v => v[0] === word);
 PICTURE_WORDS[id] = [{ word, meaning: entry ? entry[1] : word, x:8,y:8,w:344,h:204 }];
}));
function PictureActions({ t, selectedWord, onSelect }) {
 const actions=PICTURE_ACTIONS[t.scene] || [];
 if (!actions.length) return null;
 return html`<div className="picture-actions"><p className="small strong">Action pictures</p><p className="small muted">These extra pictures show the action words in your word bank. Hover, tap or focus a picture to explore it.</p><div className="picture-action-grid">${actions.map(([word,kind])=>html`<figure key=${word}><span className="qframe"><${Scene} id=${'action-'+t.scene+'-'+word.replace(/\W+/g, '-')} alt=${'Picture example: '+word} interactive=${true} selectedWord=${selectedWord} onSelect=${onSelect} /></span><figcaption>${word}</figcaption></figure>`)}</div></div>`;
}

/* Small UI illustrations */
function BookArt({ color }) {
  return html`<svg viewBox="0 0 80 60" width="80" height="60" aria-hidden="true">
    <path d="M6,14 Q24,6 40,14 L40,54 Q24,46 6,54 Z" fill=${color} stroke="#172B4D" strokeWidth="2" strokeLinejoin="round" />
    <path d="M74,14 Q56,6 40,14 L40,54 Q56,46 74,54 Z" fill="#FFFFFF" stroke="#172B4D" strokeWidth="2" strokeLinejoin="round" />
    <path d="M48,24 h18 M48,32 h16 M48,40 h12" stroke="#9AA5B8" strokeWidth="2" strokeLinecap="round" />
  </svg>`;
}
function PencilArt({ size = 90 }) {
  return html`<svg viewBox="0 0 90 120" width=${size} height=${size * 4 / 3} aria-hidden="true">
    <g transform="rotate(18 45 60)">
      <rect x="28" y="10" width="34" height="16" rx="6" fill="#F2A9A0" />
      <rect x="28" y="24" width="34" height="8" fill="#C9CFD8" />
      <rect x="28" y="32" width="34" height="56" fill="#F6CF5B" />
      <path d="M28,88 L45,114 L62,88 Z" fill="#F3D9B1" /><path d="M40,106 L45,114 L50,106 Z" fill="#172B4D" />
      <circle cx="39" cy="54" r="3" fill="#172B4D" /><circle cx="52" cy="54" r="3" fill="#172B4D" />
      <path d="M39,64 q6,6 13,0" stroke="#172B4D" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g></svg>`;
}
const STEP_ICONS = {
  explore: html`<svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><path d="M24,6 a13,13 0 0 1 8,23 v5 h-16 v-5 a13,13 0 0 1 8,-23z" fill="#F6D77A" stroke="#172B4D" strokeWidth="2" /><path d="M18,38 h12 M20,42 h8" stroke="#172B4D" strokeWidth="2.4" strokeLinecap="round" /></svg>`,
  plan: html`<svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><rect x="6" y="8" width="16" height="14" rx="3" fill="#CFE3D4" stroke="#172B4D" strokeWidth="2" /><rect x="26" y="8" width="16" height="14" rx="3" fill="#F6D2BF" stroke="#172B4D" strokeWidth="2" /><rect x="6" y="26" width="36" height="14" rx="3" fill="#FFFFFF" stroke="#172B4D" strokeWidth="2" /></svg>`,
  write: html`<svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><path d="M10,38 l4,-12 l20,-20 l8,8 l-20,20 z" fill="#F6CF5B" stroke="#172B4D" strokeWidth="2" strokeLinejoin="round" /><path d="M10,38 l12,-4" stroke="#172B4D" strokeWidth="2" /></svg>`,
  review: html`<svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><rect x="8" y="6" width="32" height="36" rx="4" fill="#FFFFFF" stroke="#172B4D" strokeWidth="2" /><path d="M14,18 l4,4 l8,-8 M14,32 l4,4 l8,-8" stroke="#087F78" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>`
};
