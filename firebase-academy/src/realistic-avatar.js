/* Realistic portrait textures with independently masked skin, hair and robe materials.
   All existing saved LOOK keys remain the source of truth; no account migration is needed.
   Asset prompts: fictional Malaysian pupil, frontal high-end game portrait, eight hairstyles,
   navy/gold robe, natural skin/hair/cloth detail, slate background; built-in image generation. */
const REAL_AVATAR={
 short:{eye:71,chin:122,neck:146,forehead:47,hair:'M42 25 Q100 -2 160 30 L151 91 Q146 98 140 84 L135 58 Q124 43 110 47 Q104 59 91 66 Q75 66 65 82 L56 89 Q44 78 42 25Z'},
 swept:{eye:72,chin:123,neck:147,forehead:38,hair:'M40 23 Q100 -8 162 20 L157 78 L144 93 L140 72 Q128 47 109 40 Q97 36 87 38 Q66 41 60 69 L52 84 Q43 62 40 23Z'},
 crop:{eye:71,chin:122,neck:146,forehead:34,hair:'M44 24 Q100 -3 153 19 L152 74 L142 83 L136 51 Q112 32 83 37 L67 45 L61 73 L52 84Z'},
 curly:{eye:71,chin:122,neck:146,forehead:54,hair:'M33 18 Q100 -7 168 18 L163 85 L146 96 Q143 67 127 61 Q113 52 94 57 Q74 50 62 72 L53 98 Q35 76 33 18Z'},
 long:{eye:71,chin:121,neck:145,forehead:45,hair:'M39 14 Q100 3 160 19 L167 198 L127 194 L126 144 Q146 115 137 77 Q129 54 100 45 Q78 52 65 79 Q58 110 76 136 L73 195 L35 199Z'},
 pony:{eye:79,chin:127,neck:149,forehead:49,hair:'M35 20 Q75 -12 119 4 Q157 18 155 67 L147 102 L140 110 L137 78 Q128 54 105 49 Q76 50 63 77 L61 104 L72 147 L64 179 L34 183Z'},
 bun:{eye:79,chin:127,neck:149,forehead:50,hair:'M46 25 Q60 15 75 14 Q75 -2 103 0 Q125 0 127 16 Q153 24 155 65 L147 102 L140 109 L138 78 Q130 53 103 50 Q75 51 64 78 L61 104 L52 98 Q43 64 46 25Z'},
 wavy:{eye:73,chin:124,neck:148,forehead:44,hair:'M27 21 Q100 -12 165 19 Q181 68 171 115 L177 181 Q153 195 130 179 L125 143 Q146 116 141 85 Q132 60 104 44 Q82 50 66 76 Q58 110 76 139 L70 176 Q40 183 24 174 L29 115 Q16 64 27 21Z'}
};
// Material masks are extracted once from each local texture. Canvas is used only to
// identify skin/hair pixels; it never changes or saves the source portrait artwork.
const REAL_MATERIAL_MASKS=Object.create(null);
function realMaterialMasks(name,src,geom,face,neck,eyeholes){
 const cached=REAL_MATERIAL_MASKS[name];if(cached&&cached.src===src)return cached;
 const state=REAL_MATERIAL_MASKS[name]={src,skin:'',hair:'',robe:''};
 if(typeof Image==='undefined'||typeof document==='undefined'||typeof Path2D==='undefined')return state;
 const picture=new Image();picture.decoding='async';picture.crossOrigin='anonymous';
 picture.onload=()=>{try{
  const width=400,height=480;
  const make=()=>{const c=document.createElement('canvas');c.width=width;c.height=height;return c};
  const photo=make(),pc=photo.getContext('2d',{willReadFrequently:true});pc.drawImage(picture,0,0,width,height);const pixels=pc.getImageData(0,0,width,height).data;
  const skinGeometry=make(),sg=skinGeometry.getContext('2d',{willReadFrequently:true});sg.scale(2,2);sg.fillStyle='#fff';sg.beginPath();sg.ellipse(100,geom.eye+22,49,64,0,0,Math.PI*2);sg.fill();sg.fill(new Path2D(neck));for(const x of [56,143]){sg.beginPath();sg.ellipse(x,geom.eye+10,9,16,0,0,Math.PI*2);sg.fill()}const skinShape=sg.getImageData(0,0,width,height).data;
  const hairGeometry=make(),hg=hairGeometry.getContext('2d',{willReadFrequently:true});hg.scale(2,2);hg.fillStyle='#fff';hg.fill(new Path2D(geom.hair));const hairShape=hg.getImageData(0,0,width,height).data;
  const robeGeometry=make(),rg=robeGeometry.getContext('2d');rg.scale(2,2);rg.fillStyle='#fff';rg.fill(new Path2D('M0 163L73 125L72 150L99 205L128 150L127 125L200 163V240H0Z'));const robeShape=rg.getImageData(0,0,width,height).data;
  const skinOut=make(),so=skinOut.getContext('2d'),hairOut=make(),ho=hairOut.getContext('2d'),robeOut=make(),ro=robeOut.getContext('2d'),skinPixels=so.createImageData(width,height),hairPixels=ho.createImageData(width,height),robePixels=ro.createImageData(width,height),unit=n=>Math.max(0,Math.min(1,n));
  for(let i=0;i<pixels.length;i+=4){const r=pixels[i],g=pixels[i+1],b=pixels[i+2],light=(r+g+b)/3;
   // Warm skin is distinct from grey shirt fabric, eyes, and the slate background.
   const skinMaterial=unit((r-g-5)/15)*unit((r-b-8)/25)*unit((light-38)/45);
   const skinAlpha=(skinShape[i]/255)*(skinShape[i+3]/255)*skinMaterial;
   // Black/brown hair has warm channels; slate pixels have blue/green dominance.
   // The broad geometric hair region alone is deliberately never used as a mask.
   const warm=(r-g)*.8+(r-b)*.55;
   const hairMaterial=unit((warm-2)/6);
   const hairAlpha=(hairShape[i]/255)*(hairShape[i+3]/255)*hairMaterial;
   skinPixels.data[i]=skinPixels.data[i+1]=skinPixels.data[i+2]=255;skinPixels.data[i+3]=Math.round(skinAlpha*255);
   hairPixels.data[i]=hairPixels.data[i+1]=hairPixels.data[i+2]=255;hairPixels.data[i+3]=Math.round(hairAlpha*255);
   robePixels.data[i]=robePixels.data[i+1]=robePixels.data[i+2]=255;robePixels.data[i+3]=Math.round((robeShape[i]/255)*(robeShape[i+3]/255)*unit((b-r+12)/18)*unit((165-light)/65)*255);
  }
  so.putImageData(skinPixels,0,0);ho.putImageData(hairPixels,0,0);const softened=make(),sc=softened.getContext('2d');sc.filter='blur(1.5px)';sc.drawImage(skinOut,0,0);state.skin=softened.toDataURL('image/png');state.hair=hairOut.toDataURL('image/png');ro.putImageData(robePixels,0,0);state.robe=robeOut.toDataURL('image/png');
  for(const kind of ['skin','hair','robe'])document.querySelectorAll('.real-mask-'+kind+'[data-avatar-material="'+name+'"]').forEach(image=>image.setAttribute('href',state[kind]));
 }catch(error){state.error=true;}};picture.onerror=()=>{state.error=true};picture.src=src;return state;
}
function avatar(L,house,size=160,cls='',opts={}){
 L=Object.assign({},PRESETS[0],L||{});L.head='none';L.acc='none';L.pet=LOOK.pet.some(p=>p.id===L.pet)?L.pet:'none';
 const attr=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
 size=Math.max(16,Math.min(1200,Number(size)||160));
 const validHair=Object.prototype.hasOwnProperty.call(REAL_AVATAR,L.hair),geom=validHair?REAL_AVATAR[L.hair]:REAL_AVATAR.swept,name=validHair?L.hair:'swept',key=uid('realav');
 const pick=(arr,id)=>arr.find(x=>x.id===id)||arr[0],rgb=c=>(c.match(/[a-f\d]{2}/gi)||['ff','ff','ff']).map(x=>parseInt(x,16)/255);
 const skin=rgb(pick(LOOK.skin,L.skin).c[1]),hair=rgb(pick(LOOK.hairc,L.hairc).c[0]),eyeColour=pick(LOOK.eyes,L.eyes).c;
 const h=(Object.prototype.hasOwnProperty.call(HOUSES,house)?HOUSES[house]:null)||{col:'#2747a3',dark:'#101a34',col2:'#d6b36c'},robe=pick(LOOK.robe,L.robe).c||[h.col,h.dark],cloth=rgb(robe[0]);
 const src=window.I2W_ASSETS?.['avatars/illustrated-'+name+'.webp']||'assets/avatars/illustrated-'+name+'.webp';
 const im=(extra='')=>`<image href="${attr(src)}" width="200" height="240" preserveAspectRatio="xMidYMid slice" ${extra}/>`;
 const colour=(id,c,mult,offset=0)=>`<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>${['R','G','B'].map((ch,i)=>`<feFunc${ch} type="linear" slope="${(c[i]*mult).toFixed(4)}" intercept="${(c[i]*offset).toFixed(4)}"/>`).join('')}</feComponentTransfer></filter>`;
 const face=`M64 ${geom.forehead+25} Q70 ${geom.forehead+5} 102 ${geom.forehead} Q129 ${geom.forehead+4} 138 ${geom.forehead+25} L140 ${geom.eye+25} Q132 ${geom.chin-2} 101 ${geom.chin} Q75 ${geom.chin-2} 63 ${geom.eye+26}Z`;
 const neck=`M76 ${geom.chin-5} L125 ${geom.chin-5} L122 ${geom.chin+18} L101 ${geom.neck} L80 ${geom.chin+17}Z`;
 const skinRegion=`<path d="${face}"/><ellipse cx="56" cy="${geom.eye+10}" rx="7.5" ry="14"/><ellipse cx="143" cy="${geom.eye+10}" rx="7.5" ry="14"/><path d="${neck}"/>`;
 const eyeholes=`<ellipse cx="84" cy="${geom.eye}" rx="11.5" ry="5" fill="black"/><ellipse cx="116" cy="${geom.eye}" rx="11.5" ry="5" fill="black"/><ellipse cx="100" cy="${geom.chin-21}" rx="17" ry="6" fill="black"/>`;
 const masks=realMaterialMasks(name,src,geom,face,neck,eyeholes);
 const eyes=`<g style="mix-blend-mode:color" opacity=".65"><ellipse cx="84.7" cy="${geom.eye}" rx="3.2" ry="2.8" fill="${eyeColour}"/><ellipse cx="115.7" cy="${geom.eye}" rx="3.2" ry="2.8" fill="${eyeColour}"/></g>`;
 const scarf=null;
 const hat=L.head==='hat',tud=!!scarf;
 const headwear=tud?`<path d="M43 99 Q32 25 99 15 Q168 25 157 99 L177 189 Q101 218 23 189Z ${face}" fill="url(#${key}fabric)" fill-rule="evenodd" stroke="#ffffff22" stroke-width=".5"/><path d="M48 107 Q45 169 101 196 Q154 171 154 108 M50 129 Q67 179 112 195 M147 134 Q128 174 92 191" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="2"/>`:
 L.head==='songkok'?`<path d="M46 69 L49 32 Q100 20 151 32 L154 69 Q100 54 46 69Z" fill="url(#${key}velvet)" stroke="#aaa" stroke-opacity=".3"/><path d="M50 59 Q100 48 150 59" stroke="#4e4b49" fill="none" stroke-width="1"/>`:
 L.head==='kopiah'?`<path d="M48 53 Q49 13 100 12 Q151 13 152 53 Q100 40 48 53Z" fill="url(#${key}ivory)" stroke="#d3cbb6"/><path d="M54 43 Q100 30 146 43 M56 35 Q100 22 144 35" stroke="#b9ad92" fill="none" stroke-width="1.5" stroke-dasharray="2 2"/>`:
 L.head==='turban'?`<path d="M46 55 Q37 7 96 5 Q158 5 155 55 Q137 36 101 33 Q65 37 46 55Z" fill="url(#${key}ivory)" stroke="#d5c6a2"/><path d="M51 38 Q84 7 147 27 M51 49 Q91 12 151 36 M63 20 Q112 10 150 46" stroke="#968867" stroke-opacity=".5" fill="none" stroke-width="2"/>`:
 hat?`<path d="M43 46 Q68 24 112 2 Q103 26 155 46Z" fill="url(#${key}velvet)" stroke="#a88a4b"/><ellipse cx="100" cy="47" rx="68" ry="9" fill="url(#${key}velvet)" stroke="#b89c5c"/><path d="M59 38 Q102 27 138 38" stroke="url(#${key}gold)" stroke-width="4" fill="none"/>`:
 L.head==='headband'?`<path d="M52 73 Q100 14 148 73" fill="none" stroke="${h.col}" stroke-width="6"/><path d="M52 72 Q100 13 148 72" fill="none" stroke="#f6e1ad" stroke-opacity=".4" stroke-width="1"/>`:
 L.head==='circlet'?`<path d="M60 53 Q100 40 141 53" fill="none" stroke="url(#${key}gold)" stroke-width="2.4"/><path d="M100 40 L104 47 L101 53 L97 47Z" fill="#9cc8e4" stroke="#e9cd83"/>`:'';
 const accessories=L.acc==='glasses'?`<g fill="#b3d6ec" fill-opacity=".05" stroke="#b8a67f" stroke-width="1.1"><rect x="71" y="${geom.eye-6}" width="26" height="16" rx="6"/><rect x="104" y="${geom.eye-6}" width="26" height="16" rx="6"/><path d="M97 ${geom.eye-1}q3.5-3 7 0 M71 ${geom.eye-2}l-12-3 M130 ${geom.eye-2}l12-3" fill="none"/></g>`:
 L.acc==='book'?`<g transform="rotate(-12 43 202)" filter="url(#${key}shadow)"><path d="M23 178 L57 173 L63 223 L29 228Z" fill="url(#${key}book)" stroke="#b99b59"/><path d="M58 176 L63 223 L67 220 L62 174Z" fill="#eadcb7" stroke="#aa9166"/><path d="M28 182 L53 178 L58 219 L33 223Z" fill="none" stroke="#cdb375" stroke-width=".7"/><path d="M41 189v23m-6-18q6-5 12 0m-11 4q6-5 12 0" stroke="#cdb375" stroke-width=".7" fill="none"/></g>`:
 L.acc==='quill'?`<g filter="url(#${key}shadow)"><path d="M147 184 Q149 162 165 158 Q169 176 147 184Z" fill="url(#${key}gold)"/><path d="M145 191 L161 164 M151 181l8-2 M154 176l9-3" fill="none" stroke="#654311" stroke-width=".7"/></g>`:
 L.acc==='hornbill'?`<g transform="translate(146 177) scale(.5)" fill="url(#${key}gold)" stroke="#5f4318" stroke-width=".5"><path d="M0 19Q-3 1 13 0L21 4L39 8L26 15L18 12Q17 27 8 34L3 29Z"/><path d="M17 4Q24 -5 34 4L27 7Z"/><circle cx="17" cy="7" r="1.2" fill="#32200d"/></g>`:'';
 const w=LOOK.wand.find(x=>x.id===L.wand),wand=w?.c?`<g filter="url(#${key}shadow)"><path d="M128 230L180 169" stroke="${w.c[1]}" stroke-width="3" stroke-linecap="round"/><path d="M128 230L141 215" stroke="${w.c[0]}" stroke-width="4.5" stroke-linecap="round"/><path d="M143 211L178 170" stroke="#f2dfb8" stroke-opacity=".5" stroke-width=".6"/><circle cx="180" cy="169" r="9" fill="${w.tip}" opacity=".35" filter="url(#${key}glow)"/><circle cx="180" cy="169" r="1.8" fill="#fff0b5"/></g>`:'';
 const petShapes={hornbill:'M2 25Q-1 7 11 8L19 2L26 7L38 10L26 16L20 14Q18 29 11 34L7 28Z',tiger:'M5 13L2 2L13 7Q20 3 27 7L38 2L35 14Q38 35 20 38Q2 35 5 13ZM12 17L16 19M24 19L28 17M16 27L20 30L24 27M19 9V15',turtle:'M3 21Q1 6 19 6Q36 6 35 21L41 17L45 20L41 25L35 23L35 29L29 26Q20 33 10 26L4 30L4 24Z'};
 const pet=L.pet!=='none'?`<image class="avatar-pet" data-pet="${attr(L.pet)}" href="assets/avatar-pets/${attr(L.pet)}.webp" x="135" y="170" width="63" height="68" preserveAspectRatio="xMidYMax meet" filter="url(#${key}shadow)"/>`:'';
 const sx=1;
 return `<svg class="portrait realistic-avatar ${attr(cls)}" width="${size}" height="${size*1.2}" viewBox="0 0 200 240" role="img" aria-label="Illustrated fantasy apprentice character${L.pet!=='none'?' with '+attr(pick(LOOK.pet,L.pet).name):''}" data-hair="${name}" data-hair-colour="${attr(L.hairc)}" data-skin-tone="${attr(L.skin)}" data-robe="${attr(L.robe)}" data-headwear="${attr(L.head)}" data-pet="${attr(L.pet)}"><defs>
 <filter id="${key}skin" color-interpolation-filters="sRGB"><feComponentTransfer>${['R','G','B'].map((ch,i)=>`<feFunc${ch} type="linear" slope="${(skin[i]/([195,140,112][i]/255)).toFixed(4)}"/>`).join('')}</feComponentTransfer></filter>${colour(key+'hair',hair,3.5,.03)}${colour(key+'robe',cloth,4.8,.02)}
 <filter id="${key}skinselect" color-interpolation-filters="sRGB"><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 6 -5.5 0 0 -.25"/><feGaussianBlur stdDeviation=".35"/></filter>
 <filter id="${key}soft"><feGaussianBlur stdDeviation=".55"/></filter><filter id="${key}glow"><feGaussianBlur stdDeviation="3"/></filter><filter id="${key}shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx=".5" dy="1.4" stdDeviation="1.1" flood-opacity=".65"/></filter>
 <mask id="${key}skinmask" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="240"><image class="real-mask-skin" data-avatar-material="${name}" href="${masks.skin||'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E'}" width="200" height="240" preserveAspectRatio="none"/></mask>
 <mask id="${key}hairmask" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="240"><image class="real-mask-hair" data-avatar-material="${name}" href="${masks.hair||'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E'}" width="200" height="240" preserveAspectRatio="none"/></mask>
 <mask id="${key}robemask" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="240"><image class="real-mask-robe" data-avatar-material="${name}" href="${masks.robe||'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E'}" width="200" height="240" preserveAspectRatio="none"/></mask>
 <linearGradient id="${key}gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f1dca2"/><stop offset=".3" stop-color="#ae8440"/><stop offset=".5" stop-color="#f8e8b5"/><stop offset="1" stop-color="#76501e"/></linearGradient><linearGradient id="${key}fabric"><stop stop-color="${scarf||h.col}"/><stop offset=".45" stop-color="${scarf||h.col}"/><stop offset=".7" stop-color="#484454"/><stop offset="1" stop-color="${scarf||h.dark}"/></linearGradient><linearGradient id="${key}velvet"><stop stop-color="#16171b"/><stop offset=".4" stop-color="#333238"/><stop offset=".8" stop-color="#0b0b10"/><stop offset="1" stop-color="#2a2930"/></linearGradient><linearGradient id="${key}ivory"><stop stop-color="#fff8df"/><stop offset=".6" stop-color="#b9af93"/><stop offset="1" stop-color="#f1e7cc"/></linearGradient><linearGradient id="${key}book"><stop stop-color="#682d35"/><stop offset="1" stop-color="#26121e"/></linearGradient>
 </defs><g transform="translate(${100-100*sx} 0) scale(${sx} 1)">${im()}${im(`filter="url(#${key}robe)" opacity=".75" mask="url(#${key}robemask)"`)}${im(`filter="url(#${key}hair)" mask="url(#${key}hairmask)"`)}${im(`filter="url(#${key}skin)" opacity="1" mask="url(#${key}skinmask)"`)}${eyes}${headwear}${accessories}${wand}${pet}</g></svg>`;
}
