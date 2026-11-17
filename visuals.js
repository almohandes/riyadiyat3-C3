// ===== الرسوم التوضيحية =====
'use strict';
const V={};
function vis(v){if(!v)return '';const f=V[v.t];if(!f){console.warn('no visual',v.t);return ''}try{return f(v)}catch(e){console.error(e);return ''}}
const svg=(w,h,body,extra)=>`<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" font-family="Baloo, sans-serif" ${extra||''}>${body}</svg>`;
const T=(x,y,s,o)=>`<text x="${x}" y="${y}" text-anchor="${(o&&o.a)||'middle'}" font-size="${(o&&o.fs)||16}" font-weight="${(o&&o.fw)||800}" fill="${(o&&o.fill)||'#1D2B53'}" ${o&&o.extra||''}>${s}</text>`;
const COLD=()=>getComputedStyle(document.documentElement).getPropertyValue('--c').trim()||'#3D8BFD';
const PV_NAMES=['آحاد','عشرات','مئات','ألوف'];

// ---- مكعبات العدّ (ألوف، مئات، عشرات، آحاد) ----
function cube(x,y,s,fill){const d=s*.35;return `<g stroke="#1D2B53" stroke-width="1" stroke-linejoin="round"><path d="M${x} ${y+d}h${s}v${s}h${-s}z" fill="${fill}"/><path d="M${x} ${y+d}l${d} ${-d}h${s}l${-d} ${d}z" fill="#fff" fill-opacity=".55"/><path d="M${x+s} ${y+d}l${d} ${-d}v${s}l${-d} ${d}z" fill="#000" fill-opacity=".15"/></g>`}
V.blocks=v=>{const n=v.n,th=Math.floor(n/1000),h=Math.floor(n/100)%10,t=Math.floor(n/10)%10,o=n%10;let x=6,parts=[];const H=74;
 const col='#7DB3FF';
 // الألوف
 for(let i=0;i<th;i++){parts.push(cube(x,6+(i%2)*4,46,'#9EC5FF'));x+=i%2?30:20}
 if(th)x+=44;
 for(let i=0;i<h;i++){parts.push(`<rect x="${x}" y="14" width="44" height="44" rx="2" fill="#FFD27A" stroke="#1D2B53" stroke-width="1"/><path d="M${x} 36h44M${x+22} 14v44" stroke="#1D2B5340"/>`);x+=h>5?12:16}
 if(h)x+=42;
 for(let i=0;i<t;i++){parts.push(`<rect x="${x}" y="14" width="9" height="44" rx="2" fill="#8EE3C8" stroke="#1D2B53" stroke-width="1"/>`);x+=13}
 if(t)x+=8;
 for(let i=0;i<o;i++){parts.push(`<rect x="${x+(i%3)*12}" y="${16+Math.floor(i/3)*13}" width="9" height="9" rx="2" fill="#FF9BAA" stroke="#1D2B53" stroke-width="1"/>`)}
 if(o)x+=40;
 return svg(Math.max(x,60),H,parts.join(''),'class="ltr"')};
V.blocks2=v=>`<div><div class="muted" style="text-align:center">${AR(v.a)}</div>${V.blocks({n:v.a})}<div class="muted" style="text-align:center">${AR(v.b)}</div>${V.blocks({n:v.b})}</div>`;
V.eq=v=>`<div class="ansrow">${v.items.map(s=>`<span class="pill">${s}</span>`).join('<span>=</span>')}</div>`;
// ---- جدول القيمة المكانية ----
function pvRow(n,hl){const s=String(n).padStart(4,' ');return [...s].map((d,i)=>`<td class="${hl===3-i?'hl':''}">${d===' '?'':AR(d)}</td>`).join('')}
V.pvt=v=>`<table class="t pv"><tr><th>ألوف</th><th>مئات</th><th>عشرات</th><th>آحاد</th></tr><tr>${pvRow(v.n,v.hl)}</tr></table>`;
V.pvt2=v=>`<table class="t pv"><tr><th>ألوف</th><th>مئات</th><th>عشرات</th><th>آحاد</th></tr><tr>${pvRow(v.a)}</tr><tr>${pvRow(v.b)}</tr></table>`;
V.pvt3=v=>`<table class="t pv"><tr><th>ألوف</th><th>مئات</th><th>عشرات</th><th>آحاد</th></tr>${v.nums.map(n=>`<tr>${pvRow(n)}</tr>`).join('')}</table>`;
V.money=v=>{const k=Math.floor(v.n/1000),h=Math.floor(v.n%1000/100);let o='';
 for(let i=0;i<k;i++)o+=`<span style="display:inline-block;background:#B7E4C7;border:2px solid #2D6A4F;border-radius:6px;padding:2px 8px;margin:3px;font-weight:800">${AR(1000)}</span>`;
 for(let i=0;i<h;i++)o+=`<span style="display:inline-block;background:#FFE5A3;border:2px solid #B07D00;border-radius:6px;padding:2px 8px;margin:3px;font-weight:800">${AR(100)}</span>`;
 return `<div style="text-align:center;max-width:420px">${o}</div>`};
V.symbols=()=>`<div class="sym" dir="rtl"><span class="pill" style="font-size:24px">&gt; أكبر من</span><span class="pill" style="font-size:24px">&lt; أصغر من</span><span class="pill" style="font-size:24px">= يساوي</span></div>`;
// ---- مستقيم الأعداد (يزداد نحو اليمين كما في الكتاب) ----
V.nline=v=>{const W=560,pad=30,n=(v.to-v.from)/v.step,dx=(W-2*pad)/n;let b=`<line x1="${pad-14}" y1="50" x2="${W-pad+14}" y2="50" stroke="#1D2B53" stroke-width="3"/>`;
 const lblEvery=n>12?Math.ceil(n/10):1;
 for(let i=0;i<=n;i++){const x=pad+i*dx,val=v.from+i*v.step;b+=`<line x1="${x}" y1="42" x2="${x}" y2="58" stroke="#1D2B53" stroke-width="2"/>`;if(i%lblEvery===0||i===n)b+=T(x,80,AR(val),{fs:n>10?12:14,fw:500})}
 (v.marks||[]).forEach(m=>{const x=pad+(m-v.from)/v.step*dx;b+=`<circle cx="${x}" cy="50" r="8" fill="#FF5D73"/>`+T(x,28,AR(m),{fs:16,fill:'#FF5D73'})});
 return svg(W,92,b,'class="ltr"')};
V.nlinejump=v=>{const W=560,pad=30,n=v.n,dx=(W-2*pad)/n;let b=`<line x1="${pad-12}" y1="70" x2="${W-pad+12}" y2="70" stroke="#1D2B53" stroke-width="3"/>`;
 for(let i=0;i<=n;i++){const x=pad+i*dx;b+=`<line x1="${x}" y1="62" x2="${x}" y2="78" stroke="#1D2B53" stroke-width="2"/>`+T(x,98,AR(i*v.step),{fs:15});if(i<n)b+=`<path d="M${x} 60 Q${x+dx/2} 15 ${x+dx} 60" fill="none" stroke="${COLD()}" stroke-width="3"/>`}
 return svg(W,108,b,'class="ltr"')};
// ---- عملية عمودية ثابتة (للشرح) ----
V.col=v=>{const op=v.op||'+';const r=op==='+'?computeAdd(v.n):computeSub(v.n);const cols=r.cols,upto=v.upto===undefined?cols:v.upto;
 const g=`grid-template-columns:repeat(${cols},52px) 40px`;let h='';
 for(let c=cols-1;c>=0;c--)h+=`<div class="c h">${PV_NAMES[c]||''}</div>`;h+='<div></div>';
 for(let c=cols-1;c>=0;c--){let top='';if(op==='+'){const cc=r.carryInto[c];if(cc&&c<=upto)top=AR(cc)}else{const w=r.work[c];if(w!==null&&c<=upto+1&&(r.borrowed[c]||r.lent[c]))top=AR(w)}h+=`<div class="c carry">${top}</div>`}h+='<div></div>';
 v.n.forEach((num,ri)=>{const s=String(num);for(let c=cols-1;c>=0;c--){const d=c<s.length?s[s.length-1-c]:'';const lent=op==='-'&&ri===0&&r.lent[c]&&c<=upto+1;h+=`<div class="c ${lent?'x':''}">${d?AR(d):''}</div>`}h+=`<div class="c op">${ri===v.n.length-1?(op==='-'?'−':'+'):''}</div>`});
 h+=`<div class="line" style="grid-column:1/${cols+1}"></div><div></div>`;
 const ans=String(r.ans);for(let c=cols-1;c>=0;c--){const d=c<ans.length?ans[ans.length-1-c]:'';h+=`<div class="c a ${c<=upto&&d!==''?'ok':''}">${c<=upto&&d!==''?AR(d):''}</div>`}h+='<div></div>';
 return `<div class="colop" style="${g}">${h}</div>`};
V.mulcol=v=>{const [a,b]=v.n,ans=a*b,cols=Math.max(String(a).length,String(ans).length),upto=v.upto;let h='';const g=`grid-template-columns:repeat(${cols},52px) 40px`;
 const row=(s,cls)=>{let o='';for(let c=cols-1;c>=0;c--){const d=c<s.length?s[s.length-1-c]:'';o+=`<div class="c ${cls||''}">${d?AR(d):''}</div>`}return o};
 h+=row(String(a))+'<div></div>'+row(String(b))+'<div class="c op">×</div>'+`<div class="line" style="grid-column:1/${cols+1}"></div><div></div>`;
 const as=String(ans);let o='';for(let c=cols-1;c>=0;c--){const show=upto>=c||(upto>=String(a).length-1);const d=c<as.length?as[as.length-1-c]:'';o+=`<div class="c a ${show&&d?'ok':''}">${show&&d?AR(d):''}</div>`}
 return `<div class="colop" style="${g}">${h}${o}<div></div></div>`};
// ---- كرات/نقاط ----
V.dots=v=>{if(v.pts)return V.gdots(v);const r=14;let b='',x=20;for(let i=0;i<v.a;i++){b+=`<circle cx="${x}" cy="24" r="${r}" fill="#FF8FA3" stroke="#1D2B53"/>`;x+=32}x+=16;for(let i=0;i<v.b;i++){b+=`<circle cx="${x}" cy="24" r="${r}" fill="#fff" stroke="#1D2B53"/>`;x+=32}return svg(x,50,b)};
V.table=v=>`<table class="t"><tr>${v.head.map(h=>`<th>${h}</th>`).join('')}</tr>${v.rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
// ---- التمثيل بالأعمدة ----
V.bar=v=>{const c=COLD(),n=v.cats.length,max=v.max||Math.max(...v.vals);
 if(v.horiz){const W=420,lab=130,H=40+n*46,cw=(W-lab-20)/max;let b='';
  for(let i=0;i<=max;i++){const x=W-lab-i*cw;b+=`<line x1="${x}" y1="20" x2="${x}" y2="${H-24}" stroke="#E2EDF7"/>`+T(x,H-6,AR(i),{fs:13,fw:500})}
  v.cats.forEach((cat,i)=>{const y=26+i*46,w=v.vals[i]*cw;b+=`<rect x="${W-lab-w}" y="${y}" width="${w}" height="30" rx="5" fill="${c}"/>`+T(W-lab+8,y+21,cat,{a:'start',fs:15})});
  return `<div><div style="text-align:center;font-weight:800">${v.title||''}</div>${svg(W,H,b,'direction="rtl"')}</div>`}
 const W=Math.max(300,90+n*90),H=260,top=16,bot=50,ch=(H-top-bot)/max,left=40;let b='';
 for(let i=0;i<=max;i++){const y=H-bot-i*ch;b+=`<line x1="${left}" y1="${y}" x2="${W-6}" y2="${y}" stroke="#E2EDF7"/>`+T(left-10,y+5,AR(i),{fs:13,fw:500})}
 const bw=(W-left-10)/n;
 v.cats.forEach((cat,i)=>{const x=W-10-(i+1)*bw+bw*.22,h=v.vals[i]*ch;b+=`<rect x="${x}" y="${H-bot-h}" width="${bw*.56}" height="${h}" rx="5" fill="${c}"/>`+T(x+bw*.28,H-bot+22,cat,{fs:14})});
 if(v.yl)b+=T(12,(H-bot)/2,v.yl,{fs:12,fw:500,extra:`transform="rotate(-90 12 ${(H-bot)/2})"`});
 return `<div><div style="text-align:center;font-weight:800">${v.title||''}</div>${svg(W,H,b)}</div>`};
V.perm=v=>{const ps=perms(v.items);return `<div style="display:grid;grid-template-columns:repeat(3,auto);gap:6px 18px;font-size:28px;justify-content:center">${ps.map((p,i)=>`<div class="pill">${AR(i+1)}) ${p.join('')}</div>`).join('')}</div>`};
function perms(a){if(a.length<=1)return [a];const r=[];a.forEach((x,i)=>perms(a.slice(0,i).concat(a.slice(i+1))).forEach(p=>r.push([x].concat(p))));return r}
V.units=v=>`<div class="row" style="margin:0">${v.items.map(([ic,u,d])=>`<div class="sheet nomargin" style="text-align:center;min-width:120px;padding:10px"><div style="font-size:36px">${ic}</div><div style="font-size:24px;font-weight:800">${u}</div><div class="muted">${d}</div></div>`).join('')}</div>`;
// ---- الساعة ----
V.clock=v=>{const S=240,c=S/2,R=106;let b=`<circle cx="${c}" cy="${c}" r="${R}" fill="#fff" stroke="#1D2B53" stroke-width="5"/>`;
 for(let i=0;i<60;i++){const a=i*6*Math.PI/180,l=i%5?6:12;b+=`<line x1="${c+Math.sin(a)*(R-4)}" y1="${c-Math.cos(a)*(R-4)}" x2="${c+Math.sin(a)*(R-4-l)}" y2="${c-Math.cos(a)*(R-4-l)}" stroke="#1D2B53" stroke-width="${i%5?1.5:3}"/>`}
 for(let i=1;i<=12;i++){const a=i*30*Math.PI/180;b+=T(c+Math.sin(a)*(R-28),c-Math.cos(a)*(R-28)+7,AR(i),{fs:20})}
 if(v.count){for(let k=1;k<=Math.floor(v.m/5);k++){const a=k*30*Math.PI/180;b+=T(c+Math.sin(a)*(R+16),c-Math.cos(a)*(R+16)+6,AR(k*5),{fs:16,fill:'#FF5D73'})}}
 const ma=v.m*6*Math.PI/180,ha=((v.h%12)+v.m/60)*30*Math.PI/180;
 b+=`<line x1="${c}" y1="${c}" x2="${c+Math.sin(ha)*52}" y2="${c-Math.cos(ha)*52}" stroke="#1D2B53" stroke-width="8" stroke-linecap="round"/>`;
 b+=`<line x1="${c}" y1="${c}" x2="${c+Math.sin(ma)*80}" y2="${c-Math.cos(ma)*80}" stroke="${COLD()}" stroke-width="5" stroke-linecap="round"/><circle cx="${c}" cy="${c}" r="7" fill="#1D2B53"/>`;
 return svg(S+(v.count?36:0),S+(v.count?36:0),`<g transform="translate(${v.count?18:0},${v.count?18:0})">${b}</g>`,'class="clk"')};
V.months=v=>`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:460px">${v.items.map((m,i)=>`<div class="pill" style="text-align:center">${AR(i+1)}. ${m}</div>`).join('')}</div>`;
V.cups=v=>`<div style="font-size:40px;text-align:center">🫖 = ${'☕'.repeat(v.n)}</div>`;
V.emoji=v=>`<div style="font-size:36px;text-align:center;letter-spacing:2px;line-height:1.3">${v.s}</div>`;
// ---- الهندسة ----
V.angle=v=>{const W=220,H=150,ox=40,oy=125,L=150,a=v.deg*Math.PI/180;let b=`<line x1="${ox}" y1="${oy}" x2="${ox+L}" y2="${oy}" stroke="#1D2B53" stroke-width="5" stroke-linecap="round"/>`;
 const ex=ox+Math.cos(a)*L*.85,ey=oy-Math.sin(a)*L*.85;b+=`<line x1="${ox}" y1="${oy}" x2="${ex}" y2="${ey}" stroke="#1D2B53" stroke-width="5" stroke-linecap="round"/>`;
 if(v.deg===90)b+=`<path d="M${ox} ${oy-24}h24v24" fill="none" stroke="${COLD()}" stroke-width="3"/>`;
 else b+=`<path d="M${ox+30} ${oy} A30 30 0 0 0 ${ox+Math.cos(a)*30} ${oy-Math.sin(a)*30}" fill="none" stroke="${COLD()}" stroke-width="3"/>`;
 const minx=Math.min(0,ex-10);return svg(W-minx,H,`<g transform="translate(${-minx},0)">${b}</g>`)};
V.angles3=()=>`<div class="row" style="margin:0">${[[45,'أصغر من القائمة'],[90,'زاوية قائمة'],[135,'أكبر من القائمة']].map(([d,t])=>`<div style="text-align:center">${V.angle({deg:d}).replace('width="220"','width="140"')}<div class="muted">${t}</div></div>`).join('')}</div>`;
const SHAPES={triangle:'M50 10 L90 85 L10 85Z',righttri:'M15 15 L15 85 L85 85Z',square:'M15 15h70v70h-70z',rect:'M5 25h90v50h-90z',circle:'',pentagon:'M50 8 L92 40 L76 88 L24 88 L8 40Z',hexagon:'M28 10h44l22 40-22 40h-44l-22-40z',trapezoid:'M28 20h44l20 60h-84z',parallelogram:'M30 20h65l-25 60h-65z'};
V.shape=v=>svg(100,100,v.name==='circle'?`<circle cx="50" cy="50" r="40" fill="#CFE3FF" stroke="#1D2B53" stroke-width="3"/>`:`<path d="${SHAPES[v.name]}" fill="#CFE3FF" stroke="#1D2B53" stroke-width="3"/>`+(v.name==='square'||v.name==='rect'||v.name==='righttri'?`<path d="M${v.name==='rect'?5:15} ${v.name==='rect'?63:73}h12v12" fill="none" stroke="#FF5D73" stroke-width="2"/>`:''));
function triPath(x,y,s,up){const h=s*.866;return up?`M${x} ${y+h}L${x+s/2} ${y}L${x+s} ${y+h}Z`:`M${x} ${y}L${x+s} ${y}L${x+s/2} ${y+h}Z`}
V.compose=v=>{const s=60,h=s*.866,cols=['#FFB4A2','#A2D2FF','#B9FBC0','#FFE66D','#CDB4DB','#FFC6FF'];let p=[],W=200,H=120;
 const st=(d,i)=>`<path d="${d}" fill="${cols[i%6]}" stroke="#1D2B53" stroke-width="2"/>`;
 if(v.name==='bigtri'){p=[triPath(10,h,s,1),triPath(10+s,h,s,1),triPath(10+s/2,0,s,1),triPath(10+s/2,h,s,0)];W=2*s+20;H=2*h+10}
 else if(v.name==='trap3'){p=[triPath(10,0,s,1),triPath(10+s/2,0,s,0),triPath(10+s,0,s,1)];W=2*s+20;H=h+10}
 else if(v.name==='para2'){p=[triPath(10,0,s,1),triPath(10+s/2,0,s,0)];W=1.5*s+20;H=h+10}
 else if(v.name==='trap8'){p=[];for(let i=0;i<5;i++)p.push(triPath(10+i*s/2,h,s,i%2===0));for(let i=0;i<3;i++)p.push(triPath(10+s/2+i*s/2,0,s,i%2===0));W=3*s+20;H=2*h+10}
 else if(v.name==='hex6'){const cx=10+s,cy=h;p=[];for(let i=0;i<6;i++){const a1=i*Math.PI/3,a2=(i+1)*Math.PI/3;p.push(`M${cx} ${cy}L${cx+s*Math.cos(a1)} ${cy+s*Math.sin(a1)}L${cx+s*Math.cos(a2)} ${cy+s*Math.sin(a2)}Z`)}W=2*s+20;H=2*h+10}
 else if(v.name==='house'){p=[`M10 ${s}h${s}v${s}h${-s}z`,`M10 ${s}L${10+s/2} 6L${10+s} ${s}Z`];W=s+20;H=2*s+10}
 else if(v.name==='sq2'){p=['M10 10L90 10L10 90Z','M90 10L90 90L10 90Z'];W=100;H=100}
 return svg(W,H,p.map(st).join(''))};
V.tri3=v=>{const s=90,h=s*.866,cx=s/2,cy=h*2/3;const P=[[0,h],[s/2,0],[s,h]];const parts=[[P[0],P[1]],[P[1],P[2]],[P[2],P[0]]];
 return svg(s+6,h+6,`<g transform="translate(3,3)">${parts.map(([a,b],i)=>`<path d="M${cx} ${cy}L${a[0]} ${a[1]}L${b[0]} ${b[1]}Z" fill="${i===v.s?COLD():'#fff'}" stroke="#1D2B53" stroke-width="2"/>`).join('')}</g>`)};
V.tripat=v=>`<div class="ltr" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;direction:rtl">${v.seq.map(s=>V.tri3({s}).replace(/width="96"/,'width="64"').replace(/height="[\d.]+"/,'height="58"')).join('')}<div style="font-size:40px;align-self:center">❓</div></div>`;
V.gdots=v=>{const s=34,W=v.w*s+10,H=v.h*s+10;let b='';for(let i=0;i<=v.w;i++)b+=`<line x1="${5+i*s}" y1="5" x2="${5+i*s}" y2="${H-5}" stroke="#D6E3F1"/>`;for(let j=0;j<=v.h;j++)b+=`<line x1="5" y1="${5+j*s}" x2="${W-5}" y2="${5+j*s}" stroke="#D6E3F1"/>`;
 if(v.draw)b+=`<polygon points="${v.pts.map(p=>`${5+p[0]*s},${5+p[1]*s}`).join(' ')}" fill="${COLD()}22" stroke="${COLD()}" stroke-width="3" stroke-dasharray="8 6"/>`;
 v.pts.forEach(p=>b+=`<circle cx="${5+p[0]*s}" cy="${5+p[1]*s}" r="7" fill="#FF5D73"/>`);return svg(W,H,b)};
V.rectlab=v=>{const k=Math.min(40,220/Math.max(v.w,v.h)),w=v.w*k,h=v.h*k,W=w+150,H=h+70,x=75,y=30;
 return svg(W,H,`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${COLD()}22" stroke="#1D2B53" stroke-width="3"/>`+T(x+w/2,y-8,AR(v.w)+' '+v.u,{fs:15})+T(x+w/2,y+h+24,AR(v.w)+' '+v.u,{fs:15})+T(x-8,y+h/2+5,AR(v.h)+' '+v.u,{fs:15,a:'end'})+T(x+w+8,y+h/2+5,AR(v.h)+' '+v.u,{fs:15,a:'start'}))};
V.grid=v=>{const s=30,W=v.w*s+4,H=v.h*s+4,c=COLD();let b='';
 (v.cells||[]).forEach(([x,y])=>b+=`<rect x="${2+x*s}" y="${2+y*s}" width="${s}" height="${s}" fill="${c}"/>`);
 (v.halves||[]).forEach(([x,y,k])=>{const X=2+x*s,Y=2+y*s;const pts={tl:[[X,Y],[X+s,Y],[X,Y+s]],tr:[[X,Y],[X+s,Y],[X+s,Y+s]],bl:[[X,Y],[X,Y+s],[X+s,Y+s]],br:[[X+s,Y],[X+s,Y+s],[X,Y+s]]}[k];b+=`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="${c}"/>`});
 for(let i=0;i<=v.w;i++)b+=`<line x1="${2+i*s}" y1="2" x2="${2+i*s}" y2="${H-2}" stroke="#1D2B53" stroke-opacity=".35"/>`;for(let j=0;j<=v.h;j++)b+=`<line x1="2" y1="${2+j*s}" x2="${W-2}" y2="${2+j*s}" stroke="#1D2B53" stroke-opacity=".35"/>`;
 return svg(W,H,b)};
V.pool=()=>{const s=28,W=10*s+4,H=7*s+4;let b='';for(let x=1;x<9;x++)for(let y=1;y<6;y++){const inner=x>=2&&x<8&&y>=2&&y<5;b+=`<rect x="${2+x*s}" y="${2+y*s}" width="${s}" height="${s}" fill="${inner?'#5DADEC':'#B8C2D1'}"/>`}
 for(let i=0;i<=10;i++)b+=`<line x1="${2+i*s}" y1="2" x2="${2+i*s}" y2="${H-2}" stroke="#1D2B53" stroke-opacity=".3"/>`;for(let j=0;j<=7;j++)b+=`<line x1="2" y1="${2+j*s}" x2="${W-2}" y2="${2+j*s}" stroke="#1D2B53" stroke-opacity=".3"/>`;return svg(W,H,b)};
V.twoRects=()=>{const s=30,c=COLD();return svg(320,110,`<rect x="10" y="40" width="${4*s}" height="${s}" fill="${c}55" stroke="#1D2B53" stroke-width="2"/>`+T(70,30,'١ × ٤',{fs:15})+`<rect x="200" y="20" width="${2*s}" height="${2*s}" fill="${c}55" stroke="#1D2B53" stroke-width="2"/>`+T(230,100,'٢ × ٢',{fs:15}))};
// ---- مجسّمات المكعّبات ----
V.iso=v=>{const s=34,dx=s*.6,dy=s*.5,hm=v.hm,rows=hm.length,cols=hm[0].length,maxz=Math.max(...hm.flat());
 const W=cols*s+rows*dx+10,H=maxz*s+rows*dy+10;let b='';const c=COLD();
 for(let r=rows-1;r>=0;r--)for(let col=0;col<cols;col++)for(let z=0;z<hm[r][col];z++){
  const x=5+col*s+r*dx,y=H-5-s-z*s-r*dy;
  b+=`<g stroke="#1D2B53" stroke-width="1.3" stroke-linejoin="round"><path d="M${x} ${y}h${s}v${s}h${-s}z" fill="${c}"/><path d="M${x} ${y}l${dx} ${-dy}h${s}l${-dx} ${dy}z" fill="#fff" fill-opacity=".6"/><path d="M${x+s} ${y}l${dx} ${-dy}v${s}l${-dx} ${dy}z" fill="#000" fill-opacity=".22"/></g>`}
 // ملاحظة: الصف 0 هو الأمامي
 return svg(W,H,b)};
V.stairs=v=>`<div class="ltr" style="display:flex;gap:22px;align-items:flex-end;justify-content:center;direction:rtl">${v.n.map(n=>{const bot=(n+1)/2,top=(n-1)/2;return `<div style="display:flex;flex-direction:column;align-items:flex-start">${top?`<div style="display:flex">${'<i style="width:18px;height:18px;background:'+COLD()+';border:1px solid #1D2B53;display:block"></i>'.repeat(top)}</div>`:''}<div style="display:flex">${'<i style="width:18px;height:18px;background:'+COLD()+';border:1px solid #1D2B53;display:block"></i>'.repeat(bot)}</div></div>`}).join('')}<div style="font-size:30px">❓</div></div>`;
// ---- الكسور ----
V.fbar=v=>{const W=Math.min(360,v.d*48),cw=W/v.d,c=v.color||COLD();let b='';for(let i=0;i<v.d;i++)b+=`<rect x="${2+W-(i+1)*cw}" y="2" width="${cw}" height="44" fill="${i<v.s?c:'#fff'}" stroke="#1D2B53" stroke-width="2"/>`;return svg(W+4,48,b)};
V.fcircle=v=>{const R=70,c=COLD();let b='';for(let i=0;i<v.d;i++){const a1=-Math.PI/2+i*2*Math.PI/v.d,a2=a1+2*Math.PI/v.d;b+=v.d===1?`<circle cx="75" cy="75" r="${R}" fill="${v.s?c:'#fff'}" stroke="#1D2B53" stroke-width="2"/>`:`<path d="M75 75L${75+R*Math.cos(a1)} ${75+R*Math.sin(a1)}A${R} ${R} 0 0 1 ${75+R*Math.cos(a2)} ${75+R*Math.sin(a2)}Z" fill="${i<v.s?c:'#fff'}" stroke="#1D2B53" stroke-width="2"/>`}return svg(150,150,b)};
V.fset=v=>{const ic=v.ic||'⚫';return `<div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;max-width:330px;font-size:34px;direction:rtl">${Array.from({length:v.d},(_,i)=>`<span style="${i<v.s?'':'opacity:.25;filter:grayscale(1)'}">${ic}</span>`).join('')}</div>`};
V.fbig=v=>`<div style="display:flex;align-items:center;gap:16px">${V.fcircle({d:v.d,s:v.n})}<span style="font-size:46px">${fr(v.n,v.d)}</span></div>`;
V.flabel=v=>`<div style="display:grid;grid-template-columns:auto auto;gap:4px 14px;align-items:center;font-size:44px"><span>${fr(v.n,v.d)}</span><span style="font-size:18px;line-height:2.6">← البسط<br>← المقام</span></div>`;
V.fpair=v=>`<div style="display:flex;flex-direction:column;gap:8px;align-items:center">${[v.a,v.b].map(([d,s])=>`<div style="display:flex;align-items:center;gap:10px">${V.fbar({d,s}).replace(/width="\d+(\.\d+)?" height="48"/,'width="300" height="44" preserveAspectRatio="none"')}<span style="font-size:24px">${fr(s,d)}</span></div>`).join('')}</div>`;
V.fstack=v=>`<div style="display:flex;flex-direction:column;gap:8px">${v.items.map(([d,s])=>`<div style="display:flex;align-items:center;gap:10px">${V.fbar({d,s}).replace(/width="\d+(\.\d+)?" height="48"/,'width="280" height="40" preserveAspectRatio="none"')}<span style="font-size:22px">${fr(s,d)}</span></div>`).join('')}</div>`;
V.faddbar=v=>{const W=Math.min(380,v.d*46),cw=W/v.d,c=COLD();let b='';for(let i=0;i<v.d;i++){const f=i<v.a?c:i<v.a+v.b?'#FFC83D':'#fff';b+=`<rect x="${2+W-(i+1)*cw}" y="2" width="${cw}" height="44" fill="${f}" stroke="#1D2B53" stroke-width="2"/>`}return svg(W+4,48,b)};
V.fsubbar=v=>{const W=Math.min(380,v.d*46),cw=W/v.d,c=COLD();let b='';for(let i=0;i<v.d;i++){const x=2+W-(i+1)*cw;b+=`<rect x="${x}" y="2" width="${cw}" height="44" fill="${i<v.a?c:'#fff'}" stroke="#1D2B53" stroke-width="2"/>`;if(i>=v.a-v.b&&i<v.a)b+=`<path d="M${x+6} 8L${x+cw-6} 40M${x+cw-6} 8L${x+6} 40" stroke="#FF5D73" stroke-width="4"/>`}return svg(W+4,48,b)};
V.fparts=v=>{const W=Math.min(380,v.d*42),cw=W/v.d;let b='',k=0;const col=[];v.parts.forEach(([n,c])=>{for(let i=0;i<n;i++)col.push(c)});for(let i=0;i<v.d;i++)b+=`<rect x="${2+W-(i+1)*cw}" y="2" width="${cw}" height="44" fill="${col[i]||'#fff'}" stroke="#1D2B53" stroke-width="2"/>`;return svg(W+4,48,b)};
// ---- الضرب والقسمة ----
V.groups=v=>{const ic=v.ic||'';return `<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;direction:rtl;max-width:520px">${Array.from({length:v.g},()=>`<div style="border:3px solid #1D2B53;border-radius:12px;padding:4px;min-width:44px;min-height:44px;display:flex;flex-wrap:wrap;gap:3px;justify-content:center;align-content:center;max-width:${v.n>4?100:70}px;background:#fff">${Array.from({length:v.n},()=>ic?`<span style="font-size:18px">${ic}</span>`:`<i style="width:13px;height:13px;border-radius:50%;background:${COLD()};display:block"></i>`).join('')}</div>`).join('')}</div>`};
V.mtable=v=>`<div style="display:grid;grid-template-columns:repeat(2,auto);gap:4px 18px;justify-content:center;font-size:20px">${Array.from({length:10},(_,i)=>`<div class="pill">${AR(v.n)} × ${AR(i+1)} = ${AR(v.n*(i+1))}</div>`).join('')}</div>`;
V.share=v=>{const per=v.g?v.n/v.g:0;return `<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;direction:rtl">${Array.from({length:v.g},()=>`<div style="border-radius:50%;width:96px;height:96px;background:#fff;border:3px solid #1D2B53;display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:2px;font-size:${per>6?14:20}px">${'🍪'.repeat(per)}</div>`).join('')}</div>`};
V.repsub=v=>{let s=v.a,o=[];while(s>0){o.push(`${AR(s)} − ${AR(v.b)} = ${AR(s-v.b)}`);s-=v.b}return `<div style="display:flex;flex-direction:column;gap:4px;align-items:center;font-size:19px">${o.map((t,i)=>`<div class="pill">${t} <span class="muted">(${AR(i+1)})</span></div>`).join('')}</div>`};
V.array=v=>`<div style="display:grid;grid-template-columns:repeat(${v.c},auto);gap:4px;justify-content:center;font-size:26px;direction:rtl">${Array.from({length:v.r*v.c},()=>`<span>${v.ic}</span>`).join('')}</div>`;
V.ldiv=v=>`<div class="ltr" style="display:inline-grid;grid-template-columns:auto auto;font-size:36px;font-weight:800;line-height:1.2;direction:ltr"><div style="text-align:center;color:var(--coral);padding:0 10px">${v.show?AR(v.a/v.b):'؟'}</div><div></div><div style="border-top:4px solid #1D2B53;border-right:4px solid #1D2B53;padding:0 12px;border-top-right-radius:10px">${AR(v.a)}</div><div style="padding:0 8px">${AR(v.b)}</div></div>`;
V.seq=v=>`<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;direction:rtl">${v.n.map(n=>`<span class="box small" style="min-width:70px">${AR(n)}</span>`).join('')}</div>`;

// ===== حسابات العمليات العمودية =====
function computeAdd(nums){const ans=nums.reduce((a,b)=>a+b,0),cols=String(ans).length;const dig=(n,c)=>Math.floor(n/10**c)%10;const steps=[],carryInto={};let carry=0;
 for(let c=0;c<cols;c++){const parts=nums.map(n=>dig(n,c)),s=parts.reduce((a,b)=>a+b,0)+carry;steps.push({t:'d',c,v:s%10,s,parts,carryIn:carry});carry=Math.floor(s/10);if(carry&&c+1<cols){carryInto[c+1]=carry;steps.push({t:'c',c:c+1,v:carry,s})}}
 return {ans,cols,steps,carryInto}}
function computeSub([a,b]){const ans=a-b,cols=String(a).length;const dig=(n,c)=>Math.floor(n/10**c)%10;const steps=[],work={},borrowed={},lent={};let bin=0;
 for(let c=0;c<cols;c++){let t=dig(a,c)-bin;const bb=dig(b,c);let bout=0;if(bin)lent[c]=true;if(t<bb){t+=10;bout=1;borrowed[c]=true;steps.push({t:'b',c,top:dig(a,c)-bin,bot:bb})}work[c]=t;steps.push({t:'d',c,v:t-bb,top:t,bot:bb});bin=bout}
 for(let c=0;c<cols;c++)if(work[c]===undefined)work[c]=null;
 // الأصفار في البداية من الناتج لا تُكتب
 return {ans,cols,steps,work,borrowed,lent}}
