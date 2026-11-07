/* ================= ORIGINAL ART (all drawn in code for Idea2Write) ================= */
let _uid=0;const uid=p=>p+(++_uid);

/* ---------- night academy scene (title + backdrop) ---------- */
function rng(seed){let s=seed;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
function tower(x,base,w,h,roof,o={}){
  const r=rng(Math.round(x*7+h));const top=base-h;
  let win="";const rows=Math.max(1,Math.floor((h-30)/34)),cols=Math.max(1,Math.floor(w/22));
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){if(r()<.42)continue;const wx=x+ (w/(cols+1))*(j+1)-3,wy=top+22+i*34;
    win+=`<rect x="${wx.toFixed(1)}" y="${wy}" width="6" height="11" rx="3" fill="url(#winG)" opacity="${(.65+r()*.35).toFixed(2)}"/>`}
  const cone=roof?`<path d="M${x-6} ${top+2} L${x+w/2} ${top-roof} L${x+w+6} ${top+2}Z" fill="url(#roofG)"/><path d="M${x+w/2} ${top-roof} L${x+w+6} ${top+2} L${x+w/2+2} ${top+2}Z" fill="#06121c" opacity=".45"/><rect x="${x-7}" y="${top-2}" width="${w+14}" height="6" fill="#2a3a44"/>`
    :`<g fill="url(#stoneG)">${Array.from({length:Math.floor(w/12)},(_,k)=>`<rect x="${x+k*12}" y="${top-9}" width="7" height="10"/>`).join("")}</g>`;
  const spire=roof&&o.flag?`<path d="M${x+w/2} ${top-roof} v-26" stroke="#9a8b6a" stroke-width="2"/><path d="M${x+w/2} ${top-roof-26} l18 5 -18 5z" fill="${o.flag}"/>`:"";
  return `<g><rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#stoneG)"/><rect x="${x+w*.62}" y="${top}" width="${w*.38}" height="${h}" fill="#05101a" opacity=".35"/>${win}${cone}${spire}</g>`;
}
function hall(x,base,w,h,roof){
  let arches="";for(let i=0;i<Math.floor(w/26);i++){const ax=x+10+i*26;arches+=`<path d="M${ax} ${base-14} v-${h*.45} a7 7 0 0 1 14 0 v${h*.45}z" fill="url(#winG)" opacity=".9"/>`}
  return `<g><rect x="${x}" y="${base-h}" width="${w}" height="${h}" fill="url(#stoneG)"/><path d="M${x-6} ${base-h} L${x+16} ${base-h-roof} H${x+w-16} L${x+w+6} ${base-h}Z" fill="url(#roofG)"/>${arches}</g>`;
}
function hornbill(x,y,s,flip){/* original flying hornbill silhouette */
  return `<g transform="translate(${x} ${y}) scale(${flip?-s:s} ${s})" fill="#e9e4d6"><path d="M0 0 C-14 -16 -34 -20 -52 -12 C-36 -10 -22 -4 -12 4Z"/><path d="M0 0 C12 -18 32 -24 50 -18 C34 -12 22 -4 12 4Z"/><ellipse cx="0" cy="4" rx="14" ry="6"/><path d="M12 2 q8 -6 14 -2 q-4 2 -2 4z"/><path d="M24 0 q10 -1 16 4 q-9 0 -15 2z" fill="#f2b33d"/><path d="M-12 4 l-14 6 l4 -8z"/></g>`;
}
function scene(o={}){
  const id=uid("sc");const r=rng(42);
  const stars=Array.from({length:140},()=>{const x=r()*1600,y=r()*420,s=r()*1.6+.3;return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s.toFixed(2)}" fill="#fff8e0" opacity="${(.3+r()*.7).toFixed(2)}"/>`}).join("");
  const sparks=Array.from({length:46},()=>{const x=900+r()*700,y=520+r()*360;return `<circle class="spark" style="animation-delay:-${(r()*6).toFixed(1)}s" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(r()*2+1).toFixed(1)}" fill="#ffd77a"/>`}).join("");
  const castle=[
    hall(560,560,330,90,34),
    tower(470,600,64,190,110,{flag:"#c4672b"}),tower(540,600,40,150,70),
    tower(640,520,96,300,170,{flag:"#2d8a83"}),
    tower(760,520,46,210,96),tower(820,520,58,250,140,{flag:"#7a4a8c"}),
    tower(900,560,44,170,90),tower(950,560,70,230,120),tower(1030,560,40,160,84),
    tower(1080,570,56,120,0),tower(1140,575,36,150,80),
    tower(600,620,30,110,60)
  ].join("");
  const bridge=Array.from({length:6},(_,i)=>`<path d="M${880+i*40} 640 v-30 a16 16 0 0 1 32 0 v30z" fill="url(#winG)" opacity=".75"/>`).join("");
  return `<svg class="scene-bg ${o.cls||""}" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101a44"/><stop offset=".45" stop-color="#34407a"/><stop offset=".75" stop-color="#7a6a9a"/><stop offset="1" stop-color="#3a3a5a"/></linearGradient>
    <radialGradient id="moonG"><stop offset="0" stop-color="#fffbe9"/><stop offset=".22" stop-color="#fbf1cf"/><stop offset=".26" stop-color="#cfe2e6" stop-opacity=".55"/><stop offset="1" stop-color="#cfe2e6" stop-opacity="0"/></radialGradient>
    <linearGradient id="stoneG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#55626a"/><stop offset=".5" stop-color="#3c4a54"/><stop offset="1" stop-color="#26323b"/></linearGradient>
    <linearGradient id="roofG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f6e78"/><stop offset="1" stop-color="#103038"/></linearGradient>
    <radialGradient id="winG"><stop offset="0" stop-color="#fff2b8"/><stop offset=".6" stop-color="#ffc85a"/><stop offset="1" stop-color="#d98a1e"/></radialGradient>
    <linearGradient id="cliffG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3a30"/><stop offset="1" stop-color="#1b1714"/></linearGradient>
    <linearGradient id="lakeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f3c4c"/><stop offset="1" stop-color="#08141d"/></linearGradient>
    <linearGradient id="pathG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a5248"/><stop offset="1" stop-color="#2a2622"/></linearGradient>
    <radialGradient id="glowG"><stop offset="0" stop-color="#ffcf6a" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf6a" stop-opacity="0"/></radialGradient>
    <filter id="blur8" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="blur20" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="20"/></filter>
    <filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>
  <rect width="1600" height="900" fill="url(#skyG)"/>
  <g>${stars}</g>
  <circle cx="330" cy="170" r="190" fill="url(#moonG)"/>
  <g filter="url(#blur20)" opacity=".4"><ellipse cx="300" cy="120" rx="320" ry="44" fill="#0c1c2b"/><ellipse cx="1100" cy="90" rx="420" ry="60" fill="#0d1f2e"/><ellipse cx="760" cy="250" rx="380" ry="40" fill="#1c3646"/><ellipse cx="1380" cy="300" rx="300" ry="50" fill="#16303f"/></g>
  <g class="cloudmove" filter="url(#blur8)" opacity=".55"><ellipse cx="260" cy="210" rx="180" ry="26" fill="#8fa9b4"/><ellipse cx="1250" cy="200" rx="220" ry="22" fill="#6f8c98"/></g>
  <path d="M0 610 L120 560 L240 590 L360 540 L420 600 L0 640Z" fill="#14232d"/>
  <path d="M1250 600 L1380 540 L1500 580 L1600 550 V650 H1250Z" fill="#14232d"/>
  <rect y="600" width="1600" height="300" fill="url(#lakeG)"/>
  <ellipse cx="760" cy="560" rx="330" ry="120" fill="url(#glowG)"/>
  <path d="M380 640 C420 560 470 540 520 590 L560 560 C620 520 700 520 760 540 C800 560 860 600 880 640 L900 700 L360 700Z" fill="url(#cliffG)"/>
  <path d="M1000 620 C1060 560 1160 550 1220 590 C1260 620 1280 660 1270 700 L980 700Z" fill="url(#cliffG)"/>
  ${castle}
  <rect x="880" y="606" width="250" height="14" fill="#3c4a54"/>${bridge}
  <g opacity=".35" transform="translate(0 1290) scale(1 -1)" filter="url(#blur2)">${castle}</g>
  <rect y="690" width="1600" height="210" fill="#0a1822" opacity=".55"/>
  <g fill="#ffd77a" opacity=".5">${Array.from({length:30},()=>`<rect x="${(560+r()*560).toFixed(0)}" y="${(700+r()*120).toFixed(0)}" width="${(10+r()*30).toFixed(0)}" height="1.5"/>`).join("")}</g>
  <g class="mist" filter="url(#blur20)" opacity=".7"><ellipse cx="300" cy="700" rx="420" ry="40" fill="#b7c9cf"/><ellipse cx="900" cy="660" rx="420" ry="34" fill="#a9bec6"/><ellipse cx="1400" cy="720" rx="360" ry="40" fill="#b7c9cf"/></g>
  <path d="M1600 900 L1060 900 C1120 860 1200 800 1300 770 C1380 750 1480 742 1600 740Z" fill="url(#pathG)"/>
  <g stroke="#1d1a17" stroke-width="2" opacity=".55" fill="none">${Array.from({length:9},(_,i)=>`<path d="M${1120+i*55} ${900-i*4} q30 -${30+i*4} 60 -${50+i*3}"/>`).join("")}<path d="M1100 880 C1250 840 1400 810 1600 800"/><path d="M1160 840 C1300 805 1450 785 1600 775"/></g>
  <g transform="translate(1110 640)"><rect x="0" y="0" width="20" height="160" fill="#3a352e"/><rect x="-6" y="-14" width="32" height="16" fill="#4a443b"/><circle cx="10" cy="-24" r="10" fill="#4a443b"/>
    <path d="M24 30 h150 M24 60 h150 M24 90 h150 M24 120 h150" stroke="#2a2622" stroke-width="3"/>${Array.from({length:12},(_,i)=>`<path d="M${36+i*12} 10 v140 M${36+i*12} 10 l-3 -10 l6 0z" stroke="#2a2622" stroke-width="3" fill="#2a2622"/>`).join("")}</g>
  <circle cx="1200" cy="640" r="70" fill="url(#glowG)"/>
  <g transform="translate(980 790)"><ellipse cx="40" cy="44" rx="70" ry="10" fill="#000" opacity=".35"/><path d="M0 34 q40 -14 90 -4 l-6 16 q-40 -8 -80 4z" fill="#e8d9b0"/><circle cx="2" cy="40" r="7" fill="#c9b386"/><rect x="58" y="10" width="22" height="26" rx="5" fill="#16202a" stroke="#c9a24a" stroke-width="2"/><path d="M70 12 C90 -40 120 -70 150 -90 C130 -50 110 -20 76 12Z" fill="#f4efe1"/><path d="M70 12 C95 -36 122 -64 150 -90" stroke="#b9ad92" stroke-width="2" fill="none"/></g>
  <g class="birds">${hornbill(250,330,.9)}${hornbill(1330,250,.7,1)}${hornbill(1450,420,.55,1)}${hornbill(160,460,.5)}</g>
  <g class="sparks">${sparks}</g>
  ${blossom(0,0,1)}${blossom(1600,0,-1)}
  </svg>`;
}

function blossom(x,y,dir){const r=rng(x+77);const pts=[];let s=`<g transform="translate(${x} ${y}) scale(${dir} 1)"><path d="M-20 40 C80 60 160 30 260 90 M60 52 C100 110 150 120 200 170 M140 44 C160 0 200 -10 240 0" stroke="#3a2620" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  for(let i=0;i<70;i++){const t=r(),bx=t*260+r()*40-20,by=40+t*60+(r()-.5)*120;if(by<-10)continue;const c=r()<.5?"#f6b8cc":"#ffd6e2";s+=`<g transform="translate(${bx.toFixed(0)} ${by.toFixed(0)}) scale(${(.6+r()*.8).toFixed(2)})">${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-6" rx="4.5" ry="7" fill="${c}" transform="rotate(${a})"/>`).join("")}<circle r="2.2" fill="#f0a040"/></g>`}
  return s+"</g>"}
/* ---------- glyph icons (gold line runes) ---------- */
const GLYPH={
 time:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
 act:'<path d="M5 19l5-5 3 3 6-9"/><circle cx="19" cy="5" r="1.8"/>',
 food:'<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M9 7c0-2 2-2 2-4M14 7c0-2 2-2 2-4"/>',
 place:'<path d="M12 21s7-6.5 7-11.5a7 7 0 0 0-14 0C5 14.5 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
 nature:'<path d="M12 21V11"/><path d="M12 13c-5 0-7-4-7-8 5 0 7 3 7 8zM12 11c0-5 3-8 8-8 0 5-3 8-8 8z"/>',
 thing:'<path d="M4 8l8-4 8 4-8 4z"/><path d="M4 8v8l8 4 8-4V8M12 12v8"/>',
 feel:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
 person:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/>',
 letter:'<rect x="3.5" y="6" width="17" height="12" rx="1.5"/><path d="M4 7l8 6 8-6"/>',
 health:'<path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5z"/>',
 travel:'<path d="M3 16h18M6 16V9h10l3 3v4"/><circle cx="8" cy="17.5" r="1.8"/><circle cx="16" cy="17.5" r="1.8"/>',
 space:'<circle cx="12" cy="12" r="5"/><ellipse cx="12" cy="12" rx="10" ry="3.2" transform="rotate(-20 12 12)"/>',
 job:'<rect x="3.5" y="8" width="17" height="11" rx="1.5"/><path d="M9 8V5.5h6V8M3.5 13h17"/>',
 eco:'<path d="M5 19c0-8 5-13 14-14 0 9-5 14-14 14z"/><path d="M5 19c3-4 6-7 10-10"/>',
 tool:'<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2z"/>',
 star:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
 book:'<path d="M3 5.5c3-1.5 6-1.5 9 .5 3-2 6-2 9-.5V19c-3-1.5-6-1.5-9 .5-3-2-6-2-9-.5z"/><path d="M12 6v13.5"/>',
 quill:'<path d="M20 3C12 4 7 10 5 19M20 3c-1 6-5 10-11 11"/><path d="M4 21l2-3"/>'
};
const WG={
 tent:'<path d="M2 20L12 4l10 16z"/><path d="M12 4v16M9 20l3-6 3 6"/>',
 torch:'<rect x="9" y="11" width="6" height="10" rx="1.5"/><path d="M8 11h8l-1-3H9z"/><path d="M12 2v3M7 4l1.5 2M17 4l-1.5 2"/>',
 blanket:'<path d="M3 6h18v12H3z"/><path d="M3 10h18M3 14h18M7 6v12M12 6v12M17 6v12"/>',
 cave:'<path d="M2 20c1-8 5-14 10-14s9 6 10 14z"/><path d="M8 20c0-4 2-7 4-7s4 3 4 7"/>',
 storm:'<path d="M6 14a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1 3.5 3.5 0 0 1 1 7z"/><path d="M12 14l-2 4h3l-2 4"/>',
 river:'<path d="M2 8c3-2 5 2 8 0s5-2 8 0 4 0 4 0M2 13c3-2 5 2 8 0s5-2 8 0 4 0 4 0M2 18c3-2 5 2 8 0s5-2 8 0 4 0 4 0"/>',
 bus:'<rect x="4" y="3" width="16" height="15" rx="2"/><path d="M4 11h16M8 3v8M16 3v8"/><circle cx="8" cy="20" r="1.6"/><circle cx="16" cy="20" r="1.6"/>',
 ticket:'<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z"/><path d="M14 7v10" stroke-dasharray="2 2"/>',
 bottle:'<path d="M10 2h4v4l2 3v12H8V9l2-3z"/><path d="M8 13h8"/>',
 cup:'<path d="M4 7h13v6a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 9h2a2 2 0 0 1 0 4h-2"/>',
 plate:'<ellipse cx="12" cy="13" rx="10" ry="6"/><ellipse cx="12" cy="13" rx="6" ry="3.4"/>',
 rocket:'<path d="M12 2c4 3 5 8 4 13H8C7 10 8 5 12 2z"/><circle cx="12" cy="9" r="2"/><path d="M8 15l-3 4h4M16 15l3 4h-4M10 19l2 3 2-3"/>',
 oven:'<rect x="3" y="4" width="18" height="17" rx="2"/><rect x="6" y="10" width="12" height="8" rx="1"/><circle cx="7" cy="7" r="1"/><circle cx="11" cy="7" r="1"/>',
 spoon:'<ellipse cx="12" cy="6" rx="4" ry="4.5"/><path d="M12 10.5V22"/>',
 castle:'<path d="M3 21V9h3V6h3v3h2V4h2v5h2V6h3v3h3v12z"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/>',
 violin:'<path d="M12 7c3 0 4 3 2.5 5 1.5 2 1 6-2.5 6s-4-4-2.5-6C8 10 9 7 12 7z"/><path d="M12 7V2M10 14h4M17 3L7 21"/>',
 chess:'<path d="M8 21h8M9 18h6l-1-5h-4z"/><path d="M10 13c-2-1-2-4 0-5h4c2 1 2 4 0 5"/><circle cx="12" cy="5" r="2"/>',
 wheel:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 3v7M12 14v7M3 12h7M14 12h7"/>',
 music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
 railway:'<path d="M7 2L4 22M17 2l3 20M5 7h14M4.5 12h15M4 17h16"/>',
 sky:'<circle cx="8" cy="8" r="3.5"/><path d="M8 1.5v1.5M2 8h1.5M3.5 3.5l1 1"/><path d="M9 19a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1 3.5 3.5 0 0 1 1 7z"/>',
 dinosaur:'<path d="M3 20c2-1 3-4 3-7 0-4 3-6 7-6 3 0 5-3 7-4l1 3-3 2c0 5-2 9-6 9l1 3M8 20l-1-4"/>',
 screen:'<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M9 20h6M12 16v4"/>',
 park:'<path d="M12 21V11"/><circle cx="12" cy="8" r="5"/><path d="M3 21h18"/>',
 hospital:'<rect x="4" y="4" width="16" height="17" rx="1"/><path d="M12 8v6M9 11h6"/>',
 museum:'<path d="M3 9l9-5 9 5z"/><path d="M5 9v9M9 9v9M15 9v9M19 9v9M3 20h18"/>',
 noodles:'<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M7 11c0-4 2-6 2-8M11 11c0-4 2-6 2-8M15 11c0-4 2-6 2-8"/>',
 pancake:'<ellipse cx="12" cy="15" rx="9" ry="3"/><path d="M3 15v-3c0-2 4-3 9-3s9 1 9 3v3"/><path d="M10 9c1-2 3-2 4 0"/>',
 honey:'<path d="M6 8h12v10a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z"/><path d="M5 8h14M9 4h6v4"/>',
 kite:'<path d="M12 2l6 8-6 8-6-8z"/><path d="M12 18c-2 2 0 3-1 4"/>'
};
function glyph(k,size=24,cls=""){return `<svg class="glyph ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${WG[k]||GLYPH[k]||GLYPH.star}</svg>`}

/* ---------- house crests ---------- */
const EMBLEM={
 kenyalang:`<path d="M30 66 C30 50 40 40 54 38 C62 30 76 28 90 32 C80 34 72 38 68 42 C78 44 86 48 92 54 C80 52 70 52 62 56 C58 66 50 74 40 76 C34 76 30 72 30 66Z" fill="url(#EMB)"/><path d="M60 37 C66 30 78 27 90 31 C84 33 72 34 64 40Z" fill="#f0c25a"/><circle cx="52" cy="48" r="3.2" fill="#0d1a1a"/><path d="M30 66 C24 80 26 96 36 108 C40 92 40 80 38 74Z" fill="url(#EMB)" opacity=".8"/>`,
 harimau:`<path d="M60 30 C80 30 94 44 94 64 C94 84 80 100 60 104 C40 100 26 84 26 64 C26 44 40 30 60 30Z" fill="url(#EMB)"/><path d="M34 36 l10 12 M86 36 l-10 12" stroke="url(#EMB)" stroke-width="9" stroke-linecap="round"/><g stroke="#1a1020" stroke-width="3.2" stroke-linecap="round" fill="none"><path d="M60 34 v14M50 36 q2 8 6 12M70 36 q-2 8 -6 12M30 60 q8 2 14 0M90 60 q-8 2 -14 0M32 72 q8 0 12 -3M88 72 q-8 0 -12 -3"/></g><path d="M44 62 q6 -5 12 0 q-6 3 -12 0zM64 62 q6 -5 12 0 q-6 3 -12 0z" fill="#1a1020"/><path d="M56 78 h8 l-4 5z" fill="#1a1020"/><path d="M60 83 v6 M60 89 q-6 4 -10 2 M60 89 q6 4 10 2" stroke="#1a1020" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
 penyu:`<ellipse cx="60" cy="68" rx="28" ry="34" fill="url(#EMB)"/><path d="M60 40 l12 10 v16 l-12 10 l-12 -10 v-16z M48 66 l-12 8 v12 M72 66 l12 8 v12 M60 76 v24" stroke="#1d1226" stroke-width="2.6" fill="none" stroke-linejoin="round"/><ellipse cx="60" cy="30" rx="9" ry="10" fill="url(#EMB)"/><path d="M34 52 q-16 -8 -22 4 q12 6 22 2zM86 52 q16 -8 22 4 q-12 6 -22 2zM38 92 q-14 4 -16 14 q12 -2 18 -8zM82 92 q14 4 16 14 q-12 -2 -18 -8z" fill="url(#EMB)"/>`
};
function crest(hid,size=120,cls=""){
  const h=HOUSES[hid]||HOUSES.kenyalang;const year=h.id,g=uid("cr"),e=uid("em"),b=uid("bd");
  return `<svg class="crest ${cls}" width="${size}" height="${size*1.17}" viewBox="0 0 120 140" role="img" aria-label="${h.full} crest">
  <defs><linearGradient id="${b}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e3a2"/><stop offset=".45" stop-color="#c9a24a"/><stop offset="1" stop-color="#6e5320"/></linearGradient>
  <linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${h.col}"/><stop offset="1" stop-color="${h.dark}"/></linearGradient>
  <linearGradient id="${e}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6dc"/><stop offset=".6" stop-color="${h.col2}"/><stop offset="1" stop-color="#8a6a2a"/></linearGradient></defs>
  <path d="M60 4 L112 18 V64 C112 98 90 124 60 136 C30 124 8 98 8 64 V18Z" fill="url(#${b})"/>
  <path d="M60 11 L105 23 V64 C105 94 86 116 60 127 C34 116 15 94 15 64 V23Z" fill="url(#${g})"/>
  <path d="M60 11 L105 23 V64 C105 94 86 116 60 127Z" fill="#000" opacity=".16"/>
  ${EMBLEM[year].replace(/url\(#EMB\)/g,`url(#${e})`)}
  </svg>`;
}

/* ---------- apprentice avatars (modular, original stylised characters) ---------- */
const FACEP={round:"M62 96 C62 62 80 46 100 46 C120 46 138 62 138 96 C138 124 122 144 100 146 C78 144 62 124 62 96Z",
  oval:"M64 94 C64 60 82 44 100 44 C118 44 136 60 136 94 C136 126 120 148 100 150 C80 148 64 126 64 94Z",
  heart:"M62 92 C62 60 80 44 100 44 C120 44 138 60 138 92 C138 118 118 140 100 148 C82 140 62 118 62 92Z"};
function avatar(L,year,size=160,cls="",o={}){ /* year param = house id */
  L=Object.assign({},PRESETS[0],L||{});
  const h=HOUSES[year]||{col:"#4a5a8a",dark:"#141c38",col2:"#f0c05a"},k=uid("av");
  const pick=(arr,id)=>arr.find(x=>x.id===id)||arr[0];
  const S=pick(LOOK.skin,L.skin).c,H=pick(LOOK.hairc,L.hairc).c,E=pick(LOOK.eyes,L.eyes).c,rb=pick(LOOK.robe,L.robe).c||[h.col,h.dark];
  const tud=/^tudung/.test(L.head||"");
  const TC={tudung:["#f6eefa","#cbb8dc"],"tudung-navy":["#4a5a8e","#1e2850"],"tudung-rose":["#f7d6dc","#d08a98"],"tudung-cream":["#fbf4e4","#d9c8a2"],"tudung-teal":["#7ec4c0","#2a6e70"]}[L.head]||["#f6eefa","#cbb8dc"];
  const hb={long:`<path d="M58 100 C52 50 78 30 100 30 C124 30 150 50 142 100 L150 196 C130 206 118 190 116 172 L84 172 C82 190 70 206 50 196Z" fill="url(#${k}h)"/>`,
    wavy:`<path d="M60 100 C54 54 78 32 100 32 C124 32 148 52 140 102 C146 128 138 142 128 140 L72 140 C62 142 54 128 60 100Z" fill="url(#${k}h)"/>`,
    pony:`<path d="M132 70 C162 76 166 120 150 160 C146 140 140 122 128 108Z" fill="url(#${k}h)"/>`,
    bun:`<circle cx="100" cy="34" r="17" fill="url(#${k}h)"/><path d="M90 26 q10 -6 20 0" stroke="#fff" stroke-opacity=".25" stroke-width="2" fill="none"/>`,
    curly:`<g fill="url(#${k}h)">${[[64,92,16],[136,92,16],[60,116,12],[140,116,12]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>`}[L.hair]||"";
  const hf={
    short:`<path d="M60 100 C54 58 80 36 104 38 C128 40 146 60 140 102 C136 84 128 74 116 70 C106 78 88 76 76 84 C68 90 63 95 60 100Z" fill="url(#${k}h)"/>`,
    swept:`<path d="M58 104 C50 54 80 32 106 34 C132 36 150 58 142 106 C140 88 134 76 126 70 C120 84 106 88 92 84 C100 78 104 70 102 62 C92 74 78 82 66 92 C62 96 60 100 58 104Z" fill="url(#${k}h)"/><path d="M102 62 C108 54 120 50 130 52" stroke="#fff" stroke-opacity=".22" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    crop:`<path d="M62 94 C60 60 80 42 100 42 C120 42 140 60 138 94 C132 72 118 62 100 60 C82 62 68 72 62 94Z" fill="url(#${k}h)"/>`,
    curly:`<g fill="url(#${k}h)">${[[70,74,16],[84,56,16],[102,48,17],[120,56,16],[132,74,16],[94,64,12],[112,64,12],[64,92,10],[138,92,10]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g><g fill="#fff" opacity=".18">${[[80,52,4],[102,44,4],[122,52,4]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>`,
    long:`<path d="M62 104 C58 58 80 38 100 38 C122 38 144 58 138 104 C134 80 118 64 102 62 C98 74 84 88 62 104Z" fill="url(#${k}h)"/><path d="M104 62 C112 70 124 84 134 100" stroke="#fff" stroke-opacity=".18" stroke-width="3" fill="none"/>`,
    pony:`<path d="M60 100 C56 56 82 38 104 38 C128 38 146 58 140 100 C134 78 120 66 104 64 C96 72 80 84 60 100Z" fill="url(#${k}h)"/><rect x="126" y="66" width="12" height="9" rx="4" fill="${h.col}"/>`,
    bun:`<path d="M62 98 C60 58 80 42 100 42 C120 42 140 58 138 98 C132 74 118 62 100 60 C82 62 68 74 62 98Z" fill="url(#${k}h)"/>`,
    wavy:`<path d="M60 102 C54 56 80 36 102 36 C126 36 146 56 140 102 C134 88 128 78 120 72 C112 82 100 80 92 72 C86 82 74 88 60 102Z" fill="url(#${k}h)"/>`
  }[L.hair];
  const eye=x=>`<g transform="translate(${x} 105) scale(.78 .60) translate(${-x} -105)"><path d="M${x-10} 105 Q${x} 92 ${x+10} 105 Q${x} 114 ${x-10} 105Z" fill="#fff"/><circle cx="${x}" cy="105" r="6.6" fill="url(#${k}i)"/><circle cx="${x}" cy="105" r="6.6" fill="none" stroke="#120a06" stroke-opacity=".55" stroke-width=".9"/><circle cx="${x}" cy="105.5" r="3.1" fill="#120a06"/><circle cx="${x-2.4}" cy="102.4" r="2.3" fill="#fff"/><circle cx="${x+2.6}" cy="108" r="1" fill="#fff" opacity=".85"/><path d="M${x-11} 104 Q${x} 90 ${x+11} 103" stroke="#2a1810" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M${x<100?x-11:x+11} 103.5 l${x<100?-3:3} -2.5" stroke="#2a1810" stroke-width="1.6" stroke-linecap="round"/><path d="M${x-8} 111 Q${x} 114.5 ${x+8} 111" stroke="#7a4a32" stroke-opacity=".35" stroke-width="1" fill="none"/></g>`;
  const headwear={
    tudung:{back:`<path d="M52 108 C48 52 76 32 100 32 C124 32 152 52 148 108 C150 160 130 190 100 198 C70 190 50 160 52 108Z" fill="url(#${k}t)"/>`,
      front:`<path d="M66 90 C70 62 86 50 100 50 C114 50 130 62 134 90 C126 72 114 64 100 64 C86 64 74 72 66 90Z" fill="url(#${k}t)"/><path d="M58 124 C64 154 82 170 100 172 C118 170 136 154 142 124 C140 156 124 184 100 194 C76 184 60 156 58 124Z" fill="#c9b8d8" opacity=".7"/><path d="M70 78 C82 62 118 62 130 78" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/>`},
    kopiah:{front:`<path d="M70 66 Q70 44 100 42 Q130 44 130 66 Q100 58 70 66Z" fill="#f7f4ec"/><path d="M72 62 Q100 54 128 62" stroke="#d9cfb8" stroke-width="2" fill="none"/><g fill="#e6dcc4">${[78,88,100,112,122].map(x=>`<circle cx="${x}" cy="52" r="1.6"/>`).join("")}</g>`},
    turban:{front:`<path d="M62 84 C58 46 82 30 100 30 C120 30 144 46 138 84 C128 70 114 64 100 66 C86 64 72 70 62 84Z" fill="${h.col}"/><path d="M64 76 C80 56 112 50 136 70 M66 66 C84 46 118 44 134 60" stroke="#000" stroke-opacity=".22" stroke-width="3" fill="none"/><path d="M92 40 L100 62 L108 40" stroke="#fff" stroke-opacity=".2" stroke-width="2.4" fill="none"/>`},
    songkok:{front:`<path d="M68 62 L70 36 Q100 28 130 36 L132 62 Q100 54 68 62Z" fill="#141018"/><path d="M70 36 Q100 28 130 36" stroke="#3a3040" stroke-width="3" fill="none"/><path d="M69 58 Q100 50 131 58" stroke="#d6b25e" stroke-width="1.6" fill="none"/>`},
    headband:{front:`<path d="M62 78 C72 56 128 56 138 78 C126 66 74 66 62 78Z" fill="${h.col}"/><circle cx="124" cy="66" r="5" fill="${h.col2}"/>`},
    hat:{front:`<path d="M48 64 Q100 46 152 64 Q100 74 48 64Z" fill="#1a2250"/><path d="M70 60 C84 30 104 6 132 -2 C120 18 122 40 130 58 Q100 50 70 60Z" fill="#232c66"/><path d="M70 60 Q100 52 130 58" stroke="#d6b25e" stroke-width="4" fill="none"/><path d="M104 30 l3 6 6 1 -4 4 1 6 -6 -3 -6 3 1 -6 -4 -4 6 -1z" fill="#f3dc9a"/>`},
    circlet:{front:`<path d="M64 80 C76 62 124 62 136 80" stroke="url(#${k}g)" stroke-width="4" fill="none"/><path d="M100 60 l4 8 8 1 -6 5 2 8 -8 -4 -8 4 2 -8 -6 -5 8 -1z" fill="#bfe6ff" stroke="#d6b25e" stroke-width="1.5"/>`}
  }[tud?"tudung":L.head]||{};
  const acc={
    glasses:`<g stroke="url(#${k}g)" stroke-width="2.4" fill="#bfe0ff" fill-opacity=".12"><circle cx="84" cy="105" r="12"/><circle cx="116" cy="105" r="12"/><path d="M96 104 q4 -4 8 0" fill="none"/></g>`,
    book:`<g transform="translate(118 190) rotate(-8)"><rect width="52" height="40" rx="3" fill="#6a2236"/><rect x="3" y="3" width="46" height="34" fill="none" stroke="url(#${k}g)" stroke-width="2"/><path d="M26 10 l3 6 6 1 -4 4 1 6 -6 -3 -6 3 1 -6 -4 -4 6 -1z" fill="url(#${k}g)"/><rect x="0" y="36" width="52" height="5" fill="#efe1bf"/></g><ellipse cx="128" cy="232" rx="12" ry="8" fill="${S[1]}"/>`,
    quill:`<g><path d="M58 236 C70 200 96 176 132 160 C112 186 90 210 64 238Z" fill="url(#${k}g)"/><path d="M58 236 C76 206 100 182 132 160" stroke="#8a6a2a" stroke-width="1.2" fill="none"/><ellipse cx="66" cy="226" rx="11" ry="8" fill="${S[1]}" transform="rotate(-38 66 226)"/></g>`,
    hornbill:`<g transform="translate(64 186) scale(.42)"><circle cx="20" cy="20" r="22" fill="url(#${k}g)"/><path d="M8 26 C8 14 16 8 24 8 C30 4 38 4 44 8 C38 9 34 12 32 14 C38 16 40 20 42 24 C34 22 28 22 24 26Z" fill="#3a1e0a"/><circle cx="20" cy="18" r="2" fill="#fff"/></g>`
  }[L.acc]||"";
  const WD=LOOK.wand.find(x=>x.id===L.wand);
  const wandG=WD&&WD.c&&L.acc!=="quill"&&L.acc!=="book"?`<g><path d="M52 236 L140 168" stroke="${WD.c[0]}" stroke-width="5" stroke-linecap="round"/><path d="M52 236 L74 219" stroke="${WD.c[1]}" stroke-width="8" stroke-linecap="round"/><ellipse cx="68" cy="226" rx="12" ry="9" fill="${S[1]}" transform="rotate(-38 68 226)"/><circle class="wandtip" cx="141" cy="167" r="14" fill="url(#${k}w)"/><circle cx="141" cy="167" r="4" fill="${WD.tip}"/></g>`:"";
  const petG={
    firefly:`<g class="bob"><circle cx="40" cy="70" r="18" fill="url(#${k}w)"/><ellipse cx="40" cy="70" rx="5" ry="7" fill="#3a3a2a"/><ellipse cx="34" cy="64" rx="6" ry="3" fill="#dff" opacity=".7" transform="rotate(-30 34 64)"/><ellipse cx="46" cy="64" rx="6" ry="3" fill="#dff" opacity=".7" transform="rotate(30 46 64)"/><circle cx="40" cy="75" r="4" fill="#f6ff9a"/></g>`,
    hornbill:`<g transform="translate(150 186)"><ellipse cx="14" cy="18" rx="16" ry="14" fill="#2a2420"/><ellipse cx="12" cy="22" rx="9" ry="7" fill="#f2ecdf"/><circle cx="20" cy="10" r="10" fill="#2a2420"/><path d="M28 6 q16 -2 20 8 q-10 0 -20 2z" fill="#f2b33d"/><path d="M26 2 q10 -6 18 2 q-8 0 -16 2z" fill="#d6512a"/><circle cx="22" cy="8" r="2.4" fill="#fff"/><circle cx="22.6" cy="8" r="1.2" fill="#000"/></g>`,
    tiger:`<g transform="translate(146 186)"><ellipse cx="20" cy="26" rx="18" ry="12" fill="#f08a3a"/><circle cx="20" cy="12" r="13" fill="#f08a3a"/><circle cx="10" cy="2" r="4" fill="#f08a3a"/><circle cx="30" cy="2" r="4" fill="#f08a3a"/><ellipse cx="20" cy="17" rx="7" ry="5" fill="#fff4e0"/><circle cx="15" cy="10" r="2" fill="#1a1020"/><circle cx="25" cy="10" r="2" fill="#1a1020"/><path d="M18 15 h4 l-2 2z" fill="#1a1020"/><path d="M8 8 l5 2 M32 8 l-5 2 M20 0 v5 M8 24 l6 2 M32 24 l-6 2" stroke="#1a1020" stroke-width="2" stroke-linecap="round"/></g>`,
    turtle:`<g transform="translate(144 196)"><ellipse cx="22" cy="18" rx="20" ry="13" fill="#2f8a5a"/><path d="M22 7 l7 6 v8 l-7 5 l-7 -5 v-8z" fill="none" stroke="#cfe9c4" stroke-width="2"/><circle cx="44" cy="16" r="6" fill="#8acf9a"/><circle cx="46" cy="14" r="1.4" fill="#000"/><ellipse cx="8" cy="28" rx="6" ry="3" fill="#8acf9a"/><ellipse cx="34" cy="29" rx="6" ry="3" fill="#8acf9a"/></g>`
  }[L.pet]||"";
  const crestDot=`<g transform="translate(130 196)"><path d="M0 -10 L10 -6 V2 C10 8 6 12 0 14 C-6 12 -10 8 -10 2 V-6Z" fill="${h.col}" stroke="url(#${k}g)" stroke-width="1.6"/></g>`;
  return `<svg class="portrait ${cls}" width="${size}" height="${size*1.2}" viewBox="0 0 200 280" role="img" aria-label="Apprentice character">
  <defs>
   <radialGradient id="${k}bg" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="${h.col}" stop-opacity=".7"/><stop offset=".55" stop-color="${h.dark}"/><stop offset="1" stop-color="#05070d"/></radialGradient>
   <radialGradient id="${k}s" cx=".36" cy=".32" r=".85"><stop offset="0" stop-color="${S[0]}"/><stop offset=".62" stop-color="${S[1]}"/><stop offset="1" stop-color="${S[2]}"/></radialGradient>
   <linearGradient id="${k}h" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="${H[0]}"/><stop offset="1" stop-color="${H[1]}"/></linearGradient>
   <radialGradient id="${k}i" cx=".5" cy=".7"><stop offset="0" stop-color="${E}" stop-opacity=".9"/><stop offset=".7" stop-color="${E}"/><stop offset="1" stop-color="#140a04"/></radialGradient>
   <linearGradient id="${k}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${rb[0]}"/><stop offset="1" stop-color="${rb[1]}"/></linearGradient>
   <linearGradient id="${k}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".5" stop-color="#e2b64a"/><stop offset="1" stop-color="#7a5615"/></linearGradient>
   <linearGradient id="${k}t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${TC[0]}"/><stop offset="1" stop-color="${TC[1]}"/></linearGradient>
   <pattern id="${k}sk" width="10" height="8" patternUnits="userSpaceOnUse"><rect width="10" height="8" fill="#5a1a1a" opacity=".35"/><path d="M5 0.5 L9 4 L5 7.5 L1 4Z" fill="none" stroke="#f0cf6a" stroke-width="1.1"/><circle cx="5" cy="4" r="1" fill="#f0cf6a"/></pattern>
   <radialGradient id="${k}rim" cx=".2" cy=".4" r=".9"><stop offset=".75" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></radialGradient>
   <radialGradient id="${k}w"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#ffe6a0"/><stop offset="1" stop-color="#ffe6a0" stop-opacity="0"/></radialGradient>
  </defs>
  ${o.nobg?"":`<rect width="200" height="240" fill="url(#${k}bg)"/><g fill="#fff" opacity=".5"><circle cx="24" cy="40" r="1.2"/><circle cx="176" cy="30" r="1.4"/><circle cx="160" cy="84" r="1"/><circle cx="34" cy="120" r="1"/></g>`}
  ${headwear.back||""}${tud||L.head==="turban"?"":hb}
  <g transform="translate(0 -22)"><path d="M88 132 h24 v36 q-12 8 -24 0z" fill="${S[1]}"/><path d="M88 142 q12 12 24 0 v8 q-12 8 -24 0z" fill="${S[2]}" opacity=".5"/>
  <path d="M20 240 C24 192 54 168 100 164 C146 168 176 192 180 240Z" fill="url(#${k}r)"/>
  <path d="M80 164 L100 206 L120 164 C112 170 106 172 100 172 C94 172 88 170 80 164Z" fill="#f2ecdf"/><path d="M95 176 h10 l-2 6 4 30 -7 8 -7 -8 4 -30z" fill="${h.col}"/><circle cx="100" cy="190" r="2.2" fill="url(#${k}g)"/>
  <path d="M80 164 C70 190 64 214 60 240 M120 164 C130 190 136 214 140 240" stroke="url(#${k}g)" stroke-width="3.4" fill="none"/><path d="M80 164 C70 190 64 214 60 240 L74 240 C78 214 84 192 90 172Z M120 164 C130 190 136 214 140 240 L126 240 C122 214 116 192 110 172Z" fill="#000" opacity=".18"/>
  <path d="M34 212 q14 -8 26 2 M166 212 q-14 -8 -26 2" stroke="url(#${k}g)" stroke-width="2" fill="none" opacity=".8"/>
  <path d="M22 230 C60 223 140 223 178 230 L179 240 L21 240Z" fill="url(#${k}sk)"/><path d="M22 230 C60 223 140 223 178 230" stroke="url(#${k}g)" stroke-width="1.6" fill="none"/>
  <path d="M20 240 C24 200 44 180 70 170 C52 186 42 210 40 240Z M180 240 C176 200 156 180 130 170 C148 186 158 210 160 240Z" fill="#000" opacity=".16"/>
  ${crestDot}</g><g transform="translate(27 21) scale(.73)">
  <ellipse cx="60" cy="106" rx="7" ry="11" fill="${S[1]}"/><ellipse cx="140" cy="106" rx="7" ry="11" fill="${S[1]}"/>
  <path d="${FACEP[L.face]||FACEP.round}" fill="url(#${k}s)"/>
  <path d="M124 66 C138 82 138 116 122 138 C130 116 130 90 124 66Z" fill="${S[2]}" opacity=".28"/><path d="${FACEP[L.face]||FACEP.round}" fill="url(#${k}rim)"/>
  <ellipse cx="101" cy="122" rx="5" ry="2" fill="${S[2]}" opacity=".25"/>
  <ellipse cx="78" cy="120" rx="7" ry="3" fill="#c77b70" opacity=".10"/><ellipse cx="122" cy="120" rx="7" ry="3" fill="#c77b70" opacity=".10"/>
  ${eye(84)}${eye(116)}
  <path d="M74 90 Q84 85 93 89" stroke="${tud?"#2a1810":H[1]}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M107 89 Q116 85 126 90" stroke="${tud?"#2a1810":H[1]}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M99 114 q-2 5 1 7 q3 0 4 -1" stroke="${S[2]}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"/>
  <path d="M90 128 Q100 138 110 128 Q100 133 90 128Z" fill="#b5544a"/><path d="M92 129 Q100 135 108 129" stroke="#fff" stroke-opacity=".5" stroke-width="1.2" fill="none"/>
  ${tud||L.head==="turban"?"":hf}${tud||L.head==="turban"?"":`<path d="M76 62 Q98 48 124 58" stroke="#fff" stroke-opacity=".16" stroke-width="4" fill="none" stroke-linecap="round"/>`}${headwear.front||""}${acc}</g>${wandG}${petG}<path d="M20 218 L14 280 H186 L180 218" fill="url(#${k}r)"/>
  </svg>`;
}
function portrait(i,year,size=160,cls="",o={}){return avatar(PRESETS[i]||PRESETS[0],year,size,cls,o)}
const AVATARS=PRESETS.map((p,i)=>({title:["The Seeker","The Dreamer","The Guardian","The Scholar","The Explorer","The Storyteller"][i]}));
/* tall house banner */
function banner(year,w=220){const h=HOUSES[year]||HOUSES.kenyalang,g=uid("bn"),b=uid("bb");
  return `<svg class="banner" width="${w}" height="${w*1.45}" viewBox="0 0 220 320" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${h.col}"/><stop offset="1" stop-color="${h.dark}"/></linearGradient><linearGradient id="${b}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".5" stop-color="#d6a843"/><stop offset="1" stop-color="#6e5320"/></linearGradient></defs>
  <rect x="4" y="2" width="212" height="12" rx="6" fill="url(#${b})"/><path d="M14 14 H206 V276 L110 316 L14 276Z" fill="url(#${g})"/><path d="M24 22 H196 V270 L110 306 L24 270Z" fill="none" stroke="url(#${b})" stroke-width="3"/>
  <path d="M14 14 H206 V276 L110 316 L14 276Z" fill="none" stroke="url(#${b})" stroke-width="5"/>
  ${Array.from({length:6},(_,i)=>`<path d="M${40+i*28} 40 q6 -8 12 0" stroke="url(#${b})" stroke-width="1.5" fill="none" opacity=".6"/>`).join("")}
  <g transform="translate(44 38) scale(1.1)">${crest(year,120).replace(/^<svg[^>]*>/,"").replace(/<\/svg>$/,"")}</g></svg>`}
/* ---------- collector's items (trophies) ---------- */
const METAL={gold:["#fff1b8","#e2b64a","#7a5615"],silver:["#ffffff","#b8c2cc","#56606b"],bronze:["#ffd9b0","#c07a3c","#5e3313"],arcane:["#eaf6ff","#7fb8d9","#24475e"]};
function trophyArt(t,size=86,locked){
  const m=METAL[t.metal||({quill:"arcane",candle:"gold",flame:"gold",tome:"bronze",map:"bronze",orb:"arcane",chalice:"gold",potion:"arcane",bookmark:"gold",badge:"gold",moon:"silver",seal:"gold"}[t.icon]||"gold")];
  const g=uid("tg"),gl=uid("tgl");
  const L=`url(#${g})`;
  const art={
   quill:`<path d="M58 8 C38 14 26 34 22 64 C34 46 48 32 58 8Z" fill="${L}"/><path d="M58 8 C44 26 32 44 22 64" stroke="${m[2]}" stroke-width="2" fill="none"/><path d="M22 64 l-4 10" stroke="${m[2]}" stroke-width="3" stroke-linecap="round"/><g stroke="${m[2]}" stroke-width="1" opacity=".6">${[20,28,36,44].map(y=>`<path d="M${60-y*.6} ${y} l-8 4"/>`).join("")}</g>`,
   inkwell:`<path d="M24 40 h32 l4 26 H20z" fill="${L}"/><rect x="30" y="30" width="20" height="12" rx="3" fill="${L}"/><ellipse cx="40" cy="66" rx="22" ry="5" fill="${m[2]}"/><path d="M48 30 C56 12 64 6 72 2 C66 14 58 24 50 32Z" fill="#f4efe1"/>`,
   lantern:`<path d="M30 20 h20 l6 8 v34 l-6 8 h-20 l-6 -8 v-34z" fill="${L}"/><rect x="31" y="30" width="18" height="30" rx="3" fill="#ffd77a" opacity=".85"/><path d="M40 33 c4 6 4 12 0 20 c-4 -8 -4 -14 0 -20z" fill="#fff6d0"/><path d="M34 20 a6 6 0 0 1 12 0 M40 8 v6" stroke="${m[2]}" stroke-width="3" fill="none"/>`,
   scroll:`<rect x="18" y="20" width="44" height="40" fill="${L}"/><rect x="12" y="14" width="56" height="10" rx="5" fill="${m[2]}"/><rect x="12" y="56" width="56" height="10" rx="5" fill="${m[2]}"/><path d="M26 32 h28 M26 40 h28 M26 48 h18" stroke="${m[2]}" stroke-width="2"/><circle cx="52" cy="52" r="5" fill="#a8322a"/>`,
   candle:`<rect x="30" y="34" width="20" height="34" rx="3" fill="#f4ead2"/><path d="M30 40 q4 6 0 12" stroke="#d8c8a2" stroke-width="3" fill="none"/><path d="M40 10 c8 10 8 18 0 24 c-8 -6 -8 -14 0 -24z" fill="#ffb347"/><path d="M40 18 c4 6 4 10 0 14 c-4 -4 -4 -8 0 -14z" fill="#fff2b0"/><ellipse cx="40" cy="70" rx="22" ry="6" fill="${L}"/>`,
   flame:`<path d="M40 6 C56 22 64 36 60 52 C56 66 46 72 40 72 C30 72 18 64 18 50 C18 38 26 30 30 22 C32 32 36 36 40 36 C38 26 38 16 40 6Z" fill="#ff8a3d"/><path d="M40 30 C50 40 52 50 48 58 C46 64 42 66 40 66 C34 66 28 60 30 52 C32 46 36 42 40 30Z" fill="#ffd36a"/><path d="M40 46 c4 6 4 12 0 16 c-4 -4 -4 -10 0 -16z" fill="#fff6d0"/>`,
   tome:`<path d="M16 16 h44 a4 4 0 0 1 4 4 v46 h-44 a4 4 0 0 1 -4 -4z" fill="${L}"/><rect x="20" y="20" width="40" height="42" rx="2" fill="#5a2e1e"/><path d="M40 28 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z" fill="${L}"/><path d="M20 62 h40 v4 H20z" fill="#efe2c4"/>`,
   map:`<path d="M12 18 l18 -6 20 6 18 -6 v50 l-18 6 -20 -6 -18 6z" fill="#e7d6ad"/><path d="M30 12 v50 M50 18 v50" stroke="#b8a173" stroke-width="2"/><path d="M18 46 q10 -16 22 -6 t22 -12" stroke="#a8322a" stroke-width="2.4" stroke-dasharray="4 4" fill="none"/><path d="M58 24 l4 4 m0 -4 l-4 4" stroke="#a8322a" stroke-width="2.4"/><rect x="12" y="12" width="56" height="62" fill="none" stroke="${L}" stroke-width="0"/>`,
   orb:`<rect x="24" y="58" width="32" height="12" rx="3" fill="${METAL.gold[1]}"/><path d="M28 58 l4 -6 h16 l4 6z" fill="${METAL.gold[2]}"/><circle cx="40" cy="32" r="24" fill="${L}"/><circle cx="32" cy="24" r="8" fill="#fff" opacity=".55"/><path d="M28 40 q12 8 24 -4" stroke="#fff" stroke-width="1.5" fill="none" opacity=".5"/>`,
   crown:`<path d="M12 58 L16 26 L28 42 L40 18 L52 42 L64 26 L68 58Z" fill="${L}"/><rect x="12" y="56" width="56" height="10" rx="3" fill="${m[2]}"/><circle cx="40" cy="44" r="5" fill="#c4304a"/><circle cx="24" cy="50" r="3.5" fill="#3a7bd5"/><circle cx="56" cy="50" r="3.5" fill="#2d8a83"/><circle cx="40" cy="16" r="3" fill="#fff6d0"/>`,
   potion:`<path d="M32 10 h16 v14 c10 4 16 14 16 26 a24 24 0 0 1 -48 0 c0 -12 6 -22 16 -26z" fill="#d6ecf3" opacity=".35"/><path d="M18 50 a22 22 0 0 0 44 0 q-10 -6 -22 0 t-22 0z" fill="#9b6bd6"/><circle cx="34" cy="56" r="3" fill="#e9d6ff"/><circle cx="46" cy="48" r="2" fill="#e9d6ff"/><rect x="30" y="4" width="20" height="8" rx="2" fill="#8a5a34"/><path d="M32 10 h16 v14 c10 4 16 14 16 26 a24 24 0 0 1 -48 0 c0 -12 6 -22 16 -26z" fill="none" stroke="#eaf6ff" stroke-width="2"/>`,
   bookmark:`<path d="M26 6 h28 v66 l-14 -12 l-14 12z" fill="#7a2a3a"/><path d="M26 6 h28 v66 l-14 -12 l-14 12z" fill="none" stroke="${L}" stroke-width="3"/><path d="M40 20 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z" fill="${L}"/><path d="M32 46 h16" stroke="${L}" stroke-width="2"/>`,
   badge:`<path d="M40 6 L66 14 V38 C66 56 54 68 40 74 C26 68 14 56 14 38 V14Z" fill="${L}"/><path d="M40 13 L60 19 V38 C60 52 51 62 40 67 C29 62 20 52 20 38 V19Z" fill="var(--hc,#2d8a83)"/><path d="M40 24 l4 9 10 1 -7 7 2 10 -9 -5 -9 5 2 -10 -7 -7 10 -1z" fill="#fff3c2"/>`,
   moon:`<circle cx="40" cy="38" r="26" fill="${L}"/><circle cx="52" cy="30" r="22" fill="#0e1824"/><circle cx="28" cy="44" r="3" fill="${m[2]}" opacity=".5"/><path d="M58 52 l2 5 5 1 -4 3 1 5 -4 -3 -4 3 1 -5 -4 -3 5 -1z" fill="#fff3c2"/><path d="M40 6 v-4" stroke="${L}" stroke-width="3"/>`,
   seal:`<circle cx="40" cy="40" r="26" fill="#a8322a"/><path d="M40 10 l6 6 8-2 2 8 8 2-2 8 6 6-6 6 2 8-8 2-2 8-8-2-6 6-6-6-8 2-2-8-8-2 2-8-6-6 6-6-2-8 8-2 2-8 8 2z" fill="#c4423a"/><circle cx="40" cy="40" r="16" fill="none" stroke="#7a1f1a" stroke-width="2"/><path d="M33 47 C34 36 40 30 48 30 C44 34 40 40 37 47Z" fill="#f3dc9a"/>`,
   chalice:`<path d="M18 10 h44 c0 22 -8 34 -22 36 c-14 -2 -22 -14 -22 -36z" fill="${L}"/><rect x="36" y="46" width="8" height="12" fill="${m[2]}"/><path d="M24 66 h32 l-4 -8 h-24z" fill="${L}"/><path d="M18 14 c-10 0 -12 16 0 18 M62 14 c10 0 12 16 0 18" stroke="${m[1]}" stroke-width="4" fill="none"/><path d="M40 18 l3 6 6 1 -4 4 1 6 -6 -3 -6 3 1 -6 -4 -4 6 -1z" fill="#fff8dc"/>`
  }[t.icon];
  return `<svg class="trophy ${locked?"locked":""}" width="${size}" height="${size}" viewBox="0 0 80 80" aria-hidden="true">
   <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${m[0]}"/><stop offset=".5" stop-color="${m[1]}"/><stop offset="1" stop-color="${m[2]}"/></linearGradient>
   <radialGradient id="${gl}"><stop offset="0" stop-color="${m[1]}" stop-opacity=".45"/><stop offset="1" stop-color="${m[1]}" stop-opacity="0"/></radialGradient></defs>
   ${locked?"":`<circle cx="40" cy="40" r="40" fill="url(#${gl})"/>`}${art}</svg>`;
}
function starIcon(on,size=22){const g=uid("st");return `<svg class="star" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c2"/><stop offset=".5" stop-color="#f0c049"/><stop offset="1" stop-color="#a87412"/></linearGradient></defs><path d="M20 3l5.2 11 12 1.3-9 8.2 2.6 11.8L20 29.3 9.2 35.3l2.6-11.8-9-8.2 12-1.3z" fill="${on?`url(#${g})`:"rgba(255,255,255,.08)"}" stroke="${on?"#7a5615":"rgba(232,220,190,.3)"}" stroke-width="1.5" stroke-linejoin="round"/></svg>`}
function flameIcon(size=22,on=true){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c4 5 7 8 6 13a6 6 0 0 1-12 0c0-3 2-5 3-7 .5 2 1.5 3 3 3-1-3-1-6 0-9z" fill="${on?"#ff8a3d":"#4a4a52"}"/><path d="M12 11c2 2.5 3 4 2.5 6a2.6 2.6 0 0 1-5 0c0-1.5 1-2.6 2.5-6z" fill="${on?"#ffd36a":"#6a6a72"}"/></svg>`}

/* ---------- castle rooms (backdrops + door previews) ---------- */
function torch(x,y){return `<g><rect x="${x-4}" y="${y}" width="8" height="34" fill="#3a2a1a"/><path d="M${x-10} ${y} h20 l-4 10 h-12z" fill="#5a4630"/><path class="flick" d="M${x} ${y-42} c14 14 12 30 0 38 c-12 -8 -14 -24 0 -38z" fill="#ff9a3d"/><path class="flick" d="M${x} ${y-26} c6 8 6 16 0 20 c-6 -4 -6 -12 0 -20z" fill="#ffe08a"/><circle cx="${x}" cy="${y-20}" r="120" fill="url(#rGlow)"/></g>`}
function shelf(x,y,w,h,r){let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#3a2414"/>`;const rows=Math.floor(h/70);const cols=["#6a2230","#21456a","#2f5a3a","#7a5a20","#4a2a5a","#8a4a24","#2a2a2a"];
  for(let i=0;i<rows;i++){const yy=y+i*70;s+=`<rect x="${x}" y="${yy+62}" width="${w}" height="8" fill="#24160c"/>`;let bx=x+6;while(bx<x+w-12){const bw=8+r()*12,bh=40+r()*18;s+=`<rect x="${bx.toFixed(0)}" y="${(yy+62-bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="${cols[Math.floor(r()*cols.length)]}" opacity="${(.75+r()*.25).toFixed(2)}"/><rect x="${bx.toFixed(0)}" y="${(yy+62-bh+6).toFixed(0)}" width="${bw.toFixed(0)}" height="3" fill="#d6b25e" opacity=".55"/>`;bx+=bw+2}}
  return s+`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#rShade)"/>`}
function archWin(x,y,w,h){return `<path d="M${x} ${y+h} V${y+w/2} a${w/2} ${w/2} 0 0 1 ${w} 0 V${y+h}Z" fill="url(#rWin)"/><path d="M${x+w/2} ${y} V${y+h} M${x} ${y+h*.55} H${x+w}" stroke="#1a2230" stroke-width="5"/>`}
function floatCandles(n,r,y0,y1){return Array.from({length:n},()=>{const x=r()*1600,y=y0+r()*(y1-y0),s=.6+r()*.6;return `<g class="bob" style="animation-delay:-${(r()*6).toFixed(1)}s" transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})"><rect x="-5" y="0" width="10" height="34" rx="2" fill="#f4ead2"/><path d="M0 -14 c6 6 6 10 0 14 c-6 -4 -6 -8 0 -14z" fill="#ffcf6a"/><circle cx="0" cy="-6" r="26" fill="url(#rGlow)"/></g>`}).join("")}
function roomScene(kind,o={}){
  const r=rng({library:7,chamber:11,quill:13,vault:17,observatory:19}[kind]||3);
  const defs=`<defs><radialGradient id="rGlow"><stop offset="0" stop-color="#ffcf6a" stop-opacity=".38"/><stop offset="1" stop-color="#ffcf6a" stop-opacity="0"/></radialGradient>
    <linearGradient id="rShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
    <linearGradient id="rWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb0d0"/><stop offset="1" stop-color="#1c3448"/></linearGradient>
    <linearGradient id="rWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a33"/><stop offset="1" stop-color="#121218"/></linearGradient>
    <linearGradient id="rWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2c18"/><stop offset="1" stop-color="#1e120a"/></linearGradient>
    <linearGradient id="rFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a1e"/><stop offset="1" stop-color="#120c08"/></linearGradient>
    <linearGradient id="rGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".5" stop-color="#d6a843"/><stop offset="1" stop-color="#6e5320"/></linearGradient>
    <radialGradient id="rVig" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient></defs>`;
  const bricks=(c)=>{let s="";for(let y=0;y<700;y+=40)for(let x=(y/40%2)*40-40;x<1600;x+=80)s+=`<rect x="${x}" y="${y}" width="76" height="36" rx="3" fill="${c}" opacity="${(.5+r()*.5).toFixed(2)}"/>`;return s};
  let body="";
  if(kind==="library"){
    body=`<rect width="1600" height="900" fill="url(#rWood)"/>${shelf(0,40,500,700,r)}${shelf(1100,40,500,700,r)}
    <rect x="540" y="0" width="520" height="760" fill="#1a1410"/>${archWin(640,80,320,520)}<circle cx="860" cy="200" r="40" fill="#f6f0d8" opacity=".85"/>
    <rect y="740" width="1600" height="160" fill="url(#rFloor)"/>
    <g fill="#5a3a20"><rect x="560" y="640" width="480" height="20"/><rect x="580" y="660" width="20" height="120"/><rect x="1000" y="660" width="20" height="120"/></g>
    <g transform="translate(700 600)"><path d="M0 40 q50 -20 100 0 q50 -20 100 0 v-30 q-50 -20 -100 0 q-50 -20 -100 0z" fill="#efe1bf"/><path d="M100 10 v30" stroke="#b8a173"/></g>
    ${[[480,300,-12],[1150,220,10],[300,560,6],[1300,520,-8]].map(([x,y,rt],i)=>`<g class="bob" style="animation-delay:-${i*1.4}s" transform="translate(${x} ${y}) rotate(${rt})"><path d="M0 0 q30 -14 60 0 q30 -14 60 0 v40 q-30 -14 -60 0 q-30 -14 -60 0z" fill="#efe1bf"/><path d="M0 0 v40 q30 -14 60 0 M120 0 v40" stroke="#7a5a20" fill="none" stroke-width="3"/><circle cx="60" cy="16" r="70" fill="url(#rGlow)"/></g>`).join("")}
    ${floatCandles(14,r,60,360)}`;
  } else if(kind==="chamber"){
    body=`<rect width="1600" height="900" fill="url(#rWall)"/>${bricks("#33333d")}
    <rect x="420" y="120" width="760" height="460" rx="10" fill="#8a6a44"/><rect x="438" y="138" width="724" height="424" fill="#b08a5a"/>
    ${Array.from({length:9},()=>{const x=460+r()*640,y=160+r()*360,rt=(r()-.5)*14;return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${rt.toFixed(1)})"><rect width="70" height="54" fill="#efe1bf"/><path d="M8 14 h50 M8 26 h44 M8 38 h30" stroke="#8a7a5a" stroke-width="3"/><circle cx="35" cy="4" r="6" fill="#c4304a"/></g>`}).join("")}
    <path d="M520 200 L780 330 L1000 210 L1080 440 L700 470 L560 400" stroke="#c4304a" stroke-width="3" fill="none"/>
    ${torch(260,300)}${torch(1340,300)}
    <rect y="700" width="1600" height="200" fill="#16161c"/><rect x="560" y="660" width="480" height="30" fill="#4a2c18"/><rect x="590" y="690" width="24" height="120" fill="#2e1c10"/><rect x="986" y="690" width="24" height="120" fill="#2e1c10"/>
    <g transform="translate(760 620)"><rect width="80" height="40" fill="#efe1bf"/><circle cx="110" cy="24" r="22" fill="none" stroke="#d6a843" stroke-width="5"/><path d="M126 40 l20 20" stroke="#d6a843" stroke-width="7" stroke-linecap="round"/></g>`;
  } else if(kind==="quill"){
    body=`<rect width="1600" height="900" fill="#14141c"/>${bricks("#22222c")}
    ${[120,420,1060,1360].map(x=>archWin(x,60,140,460)).join("")}
    <path d="M0 640 L1600 640 L1600 900 L0 900Z" fill="url(#rFloor)"/>
    ${[0,1,2].map(i=>`<path d="M${300-i*80} ${700+i*60} L${1300+i*80} ${700+i*60} L${1320+i*80} ${730+i*60} L${280-i*80} ${730+i*60}Z" fill="#4a2c18"/>`).join("")}
    <g transform="translate(800 420)"><rect x="-60" y="140" width="120" height="100" fill="#3a2414"/><path d="M-80 140 h160 l-20 -20 h-120z" fill="#5a3a20"/>
      <path class="bob" d="M10 120 C30 40 70 -40 140 -120 C110 -40 70 40 20 124Z" fill="url(#rGold)"/><circle cx="20" cy="120" r="150" fill="url(#rGlow)"/></g>
    ${floatCandles(26,r,40,420)}`;
  } else if(kind==="vault"){
    body=`<rect width="1600" height="900" fill="url(#rWall)"/>${bricks("#2c2a30")}
    <path d="M300 900 V300 a500 500 0 0 1 1000 0 V900Z" fill="#100e12"/>
    ${[220,380,540].map(y=>`<rect x="80" y="${y}" width="320" height="14" fill="#4a2c18"/><rect x="1200" y="${y}" width="320" height="14" fill="#4a2c18"/>${Array.from({length:4},(_,i)=>`<circle cx="${110+i*80}" cy="${y-14}" r="14" fill="url(#rGold)"/><circle cx="${1230+i*80}" cy="${y-14}" r="14" fill="url(#rGold)"/>`).join("")}`).join("")}
    <g transform="translate(680 560)">${chestArt(240,true)}</g><circle cx="800" cy="620" r="260" fill="url(#rGlow)"/>
    ${torch(500,360)}${torch(1100,360)}<rect y="760" width="1600" height="140" fill="#0c0b0e"/>`;
  } else if(kind==="courtyard"){
    const arch=(x,w,h)=>`<path d="M${x} 640 V${640-h+w/2} a${w/2} ${w/2} 0 0 1 ${w} 0 V640Z" fill="#0f1a2e"/><path d="M${x} 640 V${640-h+w/2} a${w/2} ${w/2} 0 0 1 ${w} 0 V640" fill="none" stroke="#c9b48a" stroke-width="10"/><path d="M${x} 640 V${640-h+w/2} a${w/2} ${w/2} 0 0 1 ${w} 0 V640" fill="none" stroke="#8a7a5a" stroke-width="3"/>`;
    const lantern=(x,y)=>`<g><path d="M${x} ${y-60} v60" stroke="#3a2a1a" stroke-width="3"/><path d="M${x-14} ${y} h28 l-4 34 h-20z" fill="#d6a843"/><rect x="${x-9}" y="${y+4}" width="18" height="24" fill="#fff0b0"/><circle cx="${x}" cy="${y+16}" r="70" fill="url(#rGlow)"/></g>`;
    const flowers=(x,y,c)=>Array.from({length:14},()=>`<circle cx="${(x+(r()-.5)*160).toFixed(0)}" cy="${(y+(r()-.5)*50).toFixed(0)}" r="${(4+r()*6).toFixed(1)}" fill="${c}" opacity="${(.6+r()*.4).toFixed(2)}"/>`).join("");
    body=`<defs><linearGradient id="cSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2a5a"/><stop offset=".6" stop-color="#5a5a9a"/><stop offset="1" stop-color="#d8a8b8"/></linearGradient>
      <radialGradient id="fGlow"><stop offset="0" stop-color="#9fe6ff" stop-opacity=".9"/><stop offset=".5" stop-color="#5ab8ff" stop-opacity=".35"/><stop offset="1" stop-color="#5ab8ff" stop-opacity="0"/></radialGradient>
      <linearGradient id="cStone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2d6bc"/><stop offset="1" stop-color="#9a8a6a"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#cSky)"/>
    <g opacity=".7">${tower(700,520,90,260,140,{flag:"#f0c05a"})}${tower(810,520,60,200,110)}${tower(620,520,50,180,90)}</g>
    <rect x="0" y="180" width="1600" height="470" fill="url(#cStone)"/>
    ${[40,250,1200,1410].map(x=>arch(x,150,380)).join("")}${arch(560,480,420)}
    <rect y="640" width="1600" height="260" fill="#6a5a48"/>
    ${Array.from({length:12},(_,i)=>`<path d="M${800+(i-6)*30} 640 L${800+(i-6)*160} 900" stroke="#4a3e30" stroke-width="2"/>`).join("")}${[680,720,780,860].map(y=>`<path d="M0 ${y} H1600" stroke="#4a3e30" stroke-width="2"/>`).join("")}
    ${lantern(420,250)}${lantern(1180,250)}${lantern(200,300)}${lantern(1400,300)}
    ${flowers(300,640,"#b77ad8")}${flowers(1300,640,"#f29ac0")}${flowers(140,700,"#f29ac0")}${flowers(1460,700,"#b77ad8")}
    <g transform="translate(800 690)"><ellipse cx="0" cy="40" rx="260" ry="50" fill="#8a7a5a"/><ellipse cx="0" cy="30" rx="240" ry="40" fill="#2a6a9a"/><ellipse cx="0" cy="30" rx="240" ry="40" fill="url(#fGlow)"/>
      <rect x="-30" y="-120" width="60" height="150" fill="#cdbf9e"/><ellipse cx="0" cy="-120" rx="90" ry="20" fill="#bfae8a"/><ellipse cx="0" cy="-126" rx="80" ry="14" fill="#5ab8ff" opacity=".8"/>
      <circle cx="0" cy="-200" r="150" fill="url(#fGlow)"/><path class="flick" d="M0 -126 C-30 -200 30 -240 0 -330 C40 -250 -20 -210 0 -126Z" fill="#c9f2ff" opacity=".75"/></g>
    ${Array.from({length:40},()=>`<circle class="spark" style="animation-delay:-${(r()*6).toFixed(1)}s" cx="${(620+r()*360).toFixed(0)}" cy="${(300+r()*380).toFixed(0)}" r="${(1+r()*2.4).toFixed(1)}" fill="#d9f6ff"/>`).join("")}`;
  } else {
    body=`<rect width="1600" height="900" fill="#081420"/>${Array.from({length:180},()=>`<circle cx="${(r()*1600).toFixed(0)}" cy="${(r()*600).toFixed(0)}" r="${(r()*1.6+.3).toFixed(1)}" fill="#fff8e0" opacity="${(.3+r()*.7).toFixed(2)}"/>`).join("")}
    <path d="M200 160 L320 120 L420 190 L560 150 M1100 120 L1220 200 L1340 160 L1420 240" stroke="#d6b25e" stroke-width="1.5" opacity=".6" fill="none"/>
    <path d="M0 620 Q800 520 1600 620 V900 H0Z" fill="#141016"/>${[0,1,2,3,4,5,6,7].map(i=>`<rect x="${i*200+20}" y="580" width="20" height="320" fill="#2a2228"/>`).join("")}
    <g transform="translate(1000 520) rotate(-28)"><rect x="0" y="-24" width="360" height="48" rx="20" fill="url(#rGold)"/><rect x="320" y="-34" width="60" height="68" rx="10" fill="#6e5320"/></g><path d="M1080 560 l-60 200 M1080 560 l60 200 M1080 560 v200" stroke="#6e5320" stroke-width="10"/>
    <g transform="translate(320 640)"><rect width="420" height="180" fill="#4a2c18"/><rect x="20" y="-30" width="380" height="60" fill="#efe1bf" transform="skewX(-10)"/></g>`;
  }
  return `<svg class="scene-bg room-${kind}" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${defs}${body}<rect width="1600" height="900" fill="url(#rVig)"/></svg>`;
}
const _roomCache={};function roomCached(k){return _roomCache[k]||(_roomCache[k]=roomScene(k))}
function chestArt(w=200,open=false){
  const g=uid("ch");return `<svg width="${w}" height="${w*.8}" viewBox="0 0 200 160" class="chest ${open?"open":""}" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a34"/><stop offset="1" stop-color="#3a2210"/></linearGradient></defs>
  <g class="glow"><circle cx="100" cy="70" r="70" fill="#ffd77a" opacity=".55"/></g>
  <rect x="20" y="70" width="160" height="80" rx="8" fill="url(#${g})"/><rect x="20" y="70" width="160" height="12" fill="#c9a24a"/><rect x="92" y="70" width="16" height="80" fill="#c9a24a"/><rect x="88" y="92" width="24" height="22" rx="4" fill="#e6c26a"/><circle cx="100" cy="102" r="4" fill="#3a2210"/>
  <g class="lid"><path d="M20 72 V40 a80 32 0 0 1 160 0 V72Z" fill="url(#${g})"/><path d="M20 72 V40 a80 32 0 0 1 160 0 V72" fill="none" stroke="#c9a24a" stroke-width="6"/><rect x="92" y="10" width="16" height="62" fill="#c9a24a"/></g></svg>`;
}
function quillMeter(pct){const g=uid("qm"),f=Math.max(0,Math.min(1,pct));
  return `<svg class="qmeter ${f>=1?"full":""}" width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="Magic quill ${Math.round(f*100)} percent charged"><defs><linearGradient id="${g}" x1="0" y1="1" x2="0" y2="0"><stop offset="${f}" stop-color="#f3dc9a"/><stop offset="${f}" stop-color="#3a3f4a"/></linearGradient></defs>
  <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(214,178,94,.25)" stroke-width="4"/><circle cx="60" cy="60" r="56" fill="none" stroke="#f3dc9a" stroke-width="4" stroke-dasharray="${(f*352).toFixed(0)} 352" transform="rotate(-90 60 60)" stroke-linecap="round"/>
  <path d="M40 96 C48 60 66 34 92 18 C84 44 68 72 46 98Z" fill="url(#${g})" stroke="#d6b25e" stroke-width="1.5"/><path d="M40 96 C52 68 70 42 92 18" stroke="#8a6a2a" stroke-width="1.5" fill="none"/><path d="M40 96 l-6 10" stroke="#d6b25e" stroke-width="3" stroke-linecap="round"/>${f>=1?`<g class="qsp" fill="#fff3c2"><circle cx="30" cy="104" r="3"/><circle cx="22" cy="92" r="2"/><circle cx="36" cy="114" r="2"/></g>`:""}</svg>`}
function doorArt(kind,locked){const g=uid("dr");return `<svg class="door" viewBox="0 0 200 260" aria-hidden="true"><defs><clipPath id="${g}"><path d="M20 260 V100 a80 80 0 0 1 160 0 V260Z"/></clipPath></defs>
  <g clip-path="url(#${g})"><g transform="scale(.27) translate(-1000 -60)">${roomCached(kind).replace(/^<svg[^>]*>/,"").replace(/<\/svg>$/,"")}</g>
  <g class="leaf l"><path d="M20 260 V100 a80 80 0 0 1 80 -80 V260Z" fill="#5a3a20"/><path d="M34 250 V108 a66 66 0 0 1 56 -66 V250Z" fill="none" stroke="#3a2210" stroke-width="4"/><circle cx="86" cy="160" r="5" fill="#d6a843"/></g>
  <g class="leaf r"><path d="M100 20 a80 80 0 0 1 80 80 V260 H100Z" fill="#5a3a20"/><path d="M110 42 a66 66 0 0 1 56 66 V250 H110Z" fill="none" stroke="#3a2210" stroke-width="4"/><circle cx="114" cy="160" r="5" fill="#d6a843"/></g></g>
  <path d="M20 260 V100 a80 80 0 0 1 160 0 V260" fill="none" stroke="#8a8a92" stroke-width="12"/><path d="M20 260 V100 a80 80 0 0 1 160 0 V260" fill="none" stroke="#5a5a62" stroke-width="4"/>
  ${locked?`<g transform="translate(100 150)"><circle r="26" fill="rgba(0,0,0,.6)"/><rect x="-11" y="-4" width="22" height="18" rx="3" fill="#d6b25e"/><path d="M-7 -4 v-6 a7 7 0 0 1 14 0 v6" stroke="#d6b25e" stroke-width="4" fill="none"/></g>`:""}</svg>`}
