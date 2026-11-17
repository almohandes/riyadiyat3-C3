// ===== أنواع التمارين التفاعلية =====
'use strict';
const W={};
const PLACES=['الآحاد','العشرات','المئات','الألوف'];
const PRAISE=['ممتاز! 🌟','أحسنتِ يا بطلة! 💪','رائع جداً! 🎉','شاطرة! 👏','عبقرية! 🧠','استمرّي هكذا! 🚀','صحيح! ✨'];

// ---- خانة إدخال رقمية عامّة ----
function inputBox(id,cls){return `<span class="box ${cls||''}" id="${id}" tabindex="0"></span>`}
function setBox(id,val,state){const b=document.getElementById(id);if(!b)return;b.textContent=val===''||val===null||val===undefined?'':AR(val);b.className='box '+(b.classList.contains('small')?'small ':'')+(state||'')}
// مدير إدخال لعدّة خانات متتالية
function multiInput(ctx,boxes,answers,opts){// boxes: ids ; answers: numbers
 let i=0,buf='';opts=opts||{};
 const mark=()=>boxes.forEach((id,k)=>{const b=document.getElementById(id);if(!b)return;b.classList.toggle('cur',k===i);});
 boxes.forEach((id,k)=>{const b=document.getElementById(id);if(b&&!opts.locked)b.onclick=()=>{if(k<=i||opts.free){if(opts.free){i=k;buf=EN(b.textContent);mark()}}}});
 mark();
 ctx.pad(d=>{if(i>=boxes.length)return;if(buf.length>=(opts.max||5))return;buf=(buf==='0'?'':buf)+d;setBox(boxes[i],buf,'cur')},
  ()=>{buf=buf.slice(0,-1);setBox(boxes[i],buf,'cur')},
  ()=>{if(buf===''){ctx.say('اكتبي الإجابة أولاً ✍️','bad');return}
   const v=Number(buf),want=answers[i];
   if(v===want){SND.step();setBox(boxes[i],v,'ok');i++;buf='';if(i>=boxes.length){ctx.finish();return}mark();opts.onStep&&opts.onStep(i)}
   else{ctx.mistake(opts.hints?opts.hints(i):null);const b=document.getElementById(boxes[i]);b.classList.add('bad');shakeEl(b);setTimeout(()=>{b.classList.remove('bad')},400);
    if(ctx.stepMistakes()>=3){setBox(boxes[i],want,'ok');ctx.say(`الإجابة الصحيحة هي <b>${AR(want)}</b>. لا بأس، نكمل 💛`,'bad');ctx.resetStep();i++;buf='';if(i>=boxes.length){ctx.finish(true);return}mark()}
    else{const wrongV=buf;buf='';const bx=document.getElementById(boxes[i]);bx.innerHTML=`<span class="was">${AR(wrongV)}</span>`;setTimeout(()=>{if(buf===''&&!ctx.isLocked())setBox(boxes[i],'','cur')},900)}}
  });
}
function shakeEl(el){if(!el)return;el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake')}

// ---- إجابة رقمية ----
W.num=(it,ctx)=>{
 let html='';
 if(it.qf){html=`<div class="ansrow" style="font-size:34px;direction:rtl">${it.qf.map((p,k)=>{if(typeof p==='string')return `<span>${p}</span>`;return fracInput(p,k,it.miss)}).join('')}</div>`}
 else html=`<div class="ansrow">${it.pre||''}${inputBox('a0')}${it.unit?`<span class="unit">${it.unit}</span>`:''}</div>`;
 ctx.area(html);
 multiInput(ctx,['a0'],[it.a],{hints:()=>it.hint?`💡 ${fmt(it.hint)}`:null,max:6});
};
function fracInput(p,k,miss){// p=[n,d]; null → خانة
 const cell=v=>v===null||v===undefined?`<span class="box small" id="a0"></span>`:AR(v);
 return `<span class="fr" style="font-size:30px"><b>${cell(p[0])}</b><i>${cell(p[1])}</i></span>`}

// ---- اختيار من متعدد ----
W.mcq=(it,ctx)=>{
 let idx=it.o.map((_,i)=>i);if(it.shuffle!==false&&!(it.o.length===2&&typeof it.o[0]==='string'&&it.o[0].length<4))idx=shuffle(idx);
 const isVis=typeof it.o[0]==='object';const long=!isVis&&it.o.some(o=>String(o).length>22);
 ctx.area(`<div class="opts ${long?'one':''}">${idx.map(i=>`<button class="opt" data-i="${i}">${isVis?vis(it.o[i].v):fmt(it.o[i])}</button>`).join('')}</div>`);
 ctx.el.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{if(ctx.isLocked())return;const i=+b.dataset.i;
  if(i===it.a){b.classList.add('right');ctx.ok(it.why?`✔️ ${fmt(it.why)}`:null)}
  else{b.classList.add('wrong');b.disabled=true;ctx.mistake(it.why&&ctx.mistakes>=1?`💡 ${fmt(it.why)}`:null);
   if(ctx.stepMistakes()>=3){const r=ctx.el.querySelector(`.opt[data-i="${it.a}"]`);r.classList.add('right');ctx.reveal()}}});
};
W.multi=(it,ctx)=>{const sel=new Set();
 ctx.area(`<div class="opts">${it.o.map((o,i)=>`<button class="opt" data-i="${i}">${AR(o)}</button>`).join('')}</div><div class="row"><button class="btn ok" id="chk">✔ تحقّقي</button></div>`);
 ctx.el.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;sel.has(i)?sel.delete(i):sel.add(i);b.classList.toggle('sel');SND.tap()});
 ctx.el.querySelector('#chk').onclick=()=>{const ok=it.a.length===sel.size&&it.a.every(i=>sel.has(i));
  if(ok){it.a.forEach(i=>ctx.el.querySelector(`.opt[data-i="${i}"]`).classList.add('right'));ctx.ok()}
  else{ctx.mistake('💡 قارني كل عدد بالعدد المعطى، مبتدئة من الألوف');if(ctx.stepMistakes()>=3){ctx.el.querySelectorAll('.opt').forEach(b=>b.classList.remove('sel'));it.a.forEach(i=>ctx.el.querySelector(`.opt[data-i="${i}"]`).classList.add('right'));ctx.reveal()}}}};

// ---- المقارنة ----
function cmpWidget(it,ctx,xh,yh,xv,yv){
 const want=xv>yv?'>':xv<yv?'<':'=';
 ctx.area(`<div class="cmp" dir="rtl"><div class="side">${xh}</div><div class="slot" id="slot"></div><div class="side">${yh}</div></div>
 <div class="sym" dir="rtl"><button data-s=">">&gt;<small>أكبر من</small></button><button data-s="<">&lt;<small>أصغر من</small></button><button data-s="=">=<small>يساوي</small></button></div>
 <p class="muted" style="text-align:center;margin:6px 0 0">🐊 فم التمساح يفتح نحو العدد الأكبر</p>`);
 ctx.el.querySelectorAll('.sym button').forEach(b=>b.onclick=()=>{if(ctx.isLocked())return;const s=b.dataset.s;const slot=ctx.el.querySelector('#slot');slot.textContent=s;slot.setAttribute('dir','rtl');
  if(s===want){slot.style.borderStyle='solid';slot.style.borderColor='var(--mint)';ctx.ok()}
  else{shakeEl(slot);ctx.mistake(it.hintCmp||'💡 قارني الألوف أولاً، ثم المئات، ثم العشرات، ثم الآحاد');if(ctx.stepMistakes()>=3){slot.textContent=want;ctx.reveal()}}});
}
W.cmp=(it,ctx)=>cmpWidget(it,ctx,it.xs?fmt(it.xs):AR(it.x),it.ys?fmt(it.ys):AR(it.y),it.x,it.y);
W.cmpf=(it,ctx)=>{it.hintCmp='💡 عندما يكون المقام نفسه، الكسر ذو البسط الأكبر هو الأكبر. ويمكنك رسم شكل!';
 cmpWidget(it,ctx,`<span style="font-size:40px">${fr(it.x.n,it.x.d)}</span>${V.fbar({d:it.x.d,s:it.x.n}).replace(/width="[\d.]+" height="48"/,'width="150" height="30" preserveAspectRatio="none"')}`,
  `<span style="font-size:40px">${fr(it.y.n,it.y.d)}</span>${V.fbar({d:it.y.d,s:it.y.n}).replace(/width="[\d.]+" height="48"/,'width="150" height="30" preserveAspectRatio="none"')}`,it.x.n/it.x.d,it.y.n/it.y.d)};

// ---- الترتيب ----
function orderWidget(it,ctx,items,keyOf,label,dir){
 const order=items.map((x,i)=>i).sort((a,b)=>dir!=='desc'?keyOf(items[a])-keyOf(items[b]):keyOf(items[b])-keyOf(items[a]));
 const sh=shuffle(items.map((_,i)=>i));let picked=[];
 const draw=()=>{ctx.area(`<div class="arrow-lbl">${dir==='asc'?'من الأصغر ← إلى الأكبر':dir==='desc'?'من الأكبر ← إلى الأصغر':'بالترتيب ←'}</div>
  <div class="slots" dir="rtl">${items.map((_,k)=>`<div class="s ${picked[k]!==undefined?'full':''}" data-k="${k}">${picked[k]!==undefined?label(items[picked[k]]):AR(k+1)}</div>`).join('')}</div>
  <div class="chips" dir="rtl">${sh.map(i=>`<button class="chip ${picked.includes(i)?'used':''}" data-i="${i}">${label(items[i])}</button>`).join('')}</div>`);
  ctx.el.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{if(ctx.isLocked())return;picked.push(+b.dataset.i);SND.tap();if(picked.length===items.length)check();else draw()});
  ctx.el.querySelectorAll('.slots .s').forEach(s=>s.onclick=()=>{const k=+s.dataset.k;if(picked[k]!==undefined&&!ctx.isLocked()){picked=picked.slice(0,k);draw()}});};
 const check=()=>{draw();const ok=picked.every((p,k)=>keyOf(items[p])===keyOf(items[order[k]]));
  if(ok)ctx.ok();else{ctx.mistake(dir?`💡 ${dir==='asc'?'ابدئي بالأصغر':'ابدئي بالأكبر'}، وقارني من اليسار (الألوف أولاً)`:'💡 فكّري: ماذا يأتي أولاً؟');
   if(ctx.stepMistakes()>=3){picked=order.slice();draw();ctx.reveal()}else setTimeout(()=>{picked=[];draw()},700)}};
 draw();
}
W.ord=(it,ctx)=>orderWidget(it,ctx,it.n,x=>x,x=>AR(x),it.d);
W.ordf=(it,ctx)=>orderWidget(it,ctx,it.n,x=>x.n/x.d,x=>`<span style="font-size:26px">${fr(x.n,x.d)}</span>`,it.d);
W.ordtext=(it,ctx)=>{const items=it.items.map((t,i)=>({t,i}));orderWidget(it,ctx,items,x=>x.i,x=>`<span style="font-size:17px">${x.t}</span>`,null)};

// ---- العمليات العمودية الموجّهة (جمع/طرح) ----
W.add=(it,ctx)=>colGuided(it,ctx,'+');
W.sub=(it,ctx)=>colGuided(it,ctx,'-');
function colGuided(it,ctx,op){
 const nums=it.n;const R=op==='+'?computeAdd(nums):computeSub(nums);const cols=op==='+'?R.cols:R.cols;
 const ansLen=String(R.ans).length;
 let steps=R.steps.filter(s=>!(op==='-'&&s.t==='d'&&s.c>=ansLen&&s.v===0));
 let k=0;const filled={},carries={},work={},lent={};
 const draw=()=>{const st=steps[k];const hl=st?st.c:-1;let h='';
  for(let c=cols-1;c>=0;c--)h+=`<div class="c h">${PLACES[c]||''}</div>`;h+='<div></div>';
  for(let c=cols-1;c>=0;c--){let cls='',txt='';
   if(op==='+'){const cur=st&&st.t==='c'&&st.c===c;if(cur||carries[c])cls='on';if(cur)cls+=' cur';txt=carries[c]?AR(carries[c]):''}
   else{if(work[c]!==undefined)txt=AR(work[c])}
   h+=`<div class="c carry ${cls} ${hl===c&&st&&st.t!=='c'?'hl':''}">${txt}</div>`}h+='<div></div>';
  nums.forEach((num,ri)=>{const s=String(num);for(let c=cols-1;c>=0;c--){const d=c<s.length?s[s.length-1-c]:'';const x=op==='-'&&ri===0&&(lent[c]||work[c]!==undefined&&work[c]!==Number(d));h+=`<div class="c ${hl===c&&st&&st.t!=='c'?'hl':''} ${x?'x':''}">${d?AR(d):''}</div>`}
   h+=`<div class="c op">${ri===nums.length-1?(op==='-'?'−':'+'):''}</div>`});
  h+=`<div class="line" style="grid-column:1/${cols+1}"></div><div></div>`;
  for(let c=cols-1;c>=0;c--){const cur=st&&st.t==='d'&&st.c===c;const v=filled[c];h+=`<div class="c a ${cur?'cur':''} ${v!==undefined?'ok':''}" data-c="${c}">${v!==undefined?AR(v):''}</div>`}h+='<div></div>';
  ctx.area(`<div class="colop" id="board" style="grid-template-columns:repeat(${cols},52px) 40px">${h}</div><div id="xtra"></div>`);
  if(st&&st.t==='b'){ctx.el.querySelector('#xtra').innerHTML=`<div class="row"><button class="btn sun" id="borrow">🤝 أستلف من ${PLACES[st.c+1]}</button></div>`;ctx.el.querySelector('#borrow').onclick=doBorrow}
 };
 const doBorrow=()=>{const st=steps[k];SND.step();lent[st.c+1]=true;work[st.c]=st.top+10;
  // إذا كان العمود المجاور صفراً فإنه يصبح ٩ بعد أن يستلف بدوره
  k++;draw();ctx.say(st.top<0?`أصبح العمود <b>${AR(st.top+10)}</b>. الآن ${AR(st.top+10)} − ${AR(st.bot)} = ؟`:`أستلف عشرة: ${AR(st.top)} + ${AR(10)} = <b>${AR(st.top+10)}</b>. الآن ${AR(st.top+10)} − ${AR(st.bot)} = ؟`,'good');};
 const explain=()=>{const st=steps[k];if(!st)return;
  if(st.t==='b'){ctx.say(st.top<0?`عمود <b>${PLACES[st.c]}</b> كان صفراً وأعطى ما عنده، فنستلف له من العمود التالي ليصبح <b>${AR(st.top+10)}</b> 🤝`:`في عمود <b>${PLACES[st.c]}</b>: لا أستطيع طرح ${AR(st.bot)} من ${AR(st.top)}! أحتاج أن أستلف 🤝`)}
  else if(st.t==='c')ctx.say(`المجموع ${AR(st.s)} أكبر من ٩ ✋ نكتب ${AR(st.s%10)} ونحمل <b>كم</b> إلى عمود ${PLACES[st.c]}؟ اكتبيه في المربّع الأحمر 👆`);
  else if(op==='+')ctx.say(`الآن عمود <b>${PLACES[st.c]}</b>${st.carryIn?' (لا تنسي المحمول!)':''}`);
  else ctx.say(`الآن عمود <b>${PLACES[st.c]}</b>: ${AR(st.top)} − ${AR(st.bot)} = ؟`)};
 const hint=()=>{const st=steps[k];if(!st)return null;
  if(st.t==='c')return `💡 ${AR(st.s)} = ${AR(Math.floor(st.s/10))} عشرة و ${AR(st.s%10)} آحاد ← نحمل <b>${AR(st.v)}</b>`;
  if(st.t==='d'&&op==='+')return `💡 ${st.parts.map(AR).join(' + ')}${st.carryIn?` + <span style="color:var(--coral)">${AR(st.carryIn)}</span>`:''} = ${ctx.stepMistakes()>=2?AR(st.s):'؟'}${st.s>=10?' ← اكتبي رقم الآحاد فقط':''}`;
  if(st.t==='d')return `💡 ${AR(st.top)} − ${AR(st.bot)} = ${ctx.stepMistakes()>=2?AR(st.v):'؟'}`;return null};
 draw();ctx.say(it.story?'اقرئي القصة، ثم ابدئي من عمود <b>الآحاد</b> (أقصى اليمين) 👉':'نبدأ دائماً من عمود <b>الآحاد</b> على اليمين 👉');
 if(steps[0]&&steps[0].t==='b')explain();
 ctx.pad(d=>{const st=steps[k];if(!st||st.t==='b'){if(st)ctx.say('اضغطي زر <b>أستلف</b> أولاً 🤝');return}
  if(d===st.v){SND.step();if(st.t==='d')filled[st.c]=d;else carries[st.c]=d;ctx.resetStep();k++;
   if(op==='-'&&steps[k]&&steps[k].t==='d'&&work[steps[k].c]===undefined&&lent[steps[k].c]){work[steps[k].c]=steps[k].top}
   draw();if(k>=steps.length)return finishCol();explain();}
  else{ctx.mistake(hint());shakeEl(ctx.el.querySelector('#board'));if(ctx.stepMistakes()>=4){if(st.t==='d')filled[st.c]=st.v;else carries[st.c]=st.v;ctx.resetStep();k++;draw();if(k>=steps.length)return finishCol();explain()}}
 },null,null);
 const finishCol=()=>{let extra='';if(it.check){const inv=op==='+'?`${AR(R.ans)} − ${AR(nums[1])} = ${AR(nums[0])}`:`${AR(R.ans)} + ${AR(nums[1])} = ${AR(nums[0])}`;extra=`<br>🔄 أتحقّق: ${inv} ✅`}
  ctx.finish(false,`${pick(PRAISE)} الناتج = <b>${AR(R.ans)}</b> ${it.unit||''}${extra}`)};
}
// ---- الضرب العمودي ----
W.mul=(it,ctx)=>{const [a,b]=it.n;if(b>9){return W.num({...it,pre:`<span style="direction:rtl">${AR(a)} × ${AR(b)} =</span>`,a:a*b},ctx)}
 const as=String(a),ans=a*b,cols=Math.max(as.length,String(ans).length);const steps=[];let carry=0;
 for(let c=0;c<as.length;c++){const d=Math.floor(a/10**c)%10,p=d*b+carry;const last=c===as.length-1;
  steps.push({t:'d',c,v:last?p%10:p%10,p,d,carryIn:carry});
  if(last){if(p>=10)steps.push({t:'d',c:c+1,v:Math.floor(p/10),p,tail:true})}else{carry=Math.floor(p/10);if(carry)steps.push({t:'c',c:c+1,v:carry})}
  if(last)carry=0}
 let k=0;const filled={},carries={};
 const draw=()=>{const st=steps[k];let h='';const hl=st&&st.t==='d'&&!st.tail?st.c:-1;
  for(let c=cols-1;c>=0;c--){const cur=st&&st.t==='c'&&st.c===c;h+=`<div class="c carry ${cur||carries[c]?'on':''} ${cur?'cur':''}">${carries[c]?AR(carries[c]):''}</div>`}h+='<div></div>';
  for(let c=cols-1;c>=0;c--){const d=c<as.length?as[as.length-1-c]:'';h+=`<div class="c ${hl===c?'hl':''}">${d?AR(d):''}</div>`}h+='<div></div>';
  for(let c=cols-1;c>=0;c--)h+=`<div class="c ${c===0&&st&&st.t==='d'?'hl':''}">${c===0?AR(b):''}</div>`;h+='<div class="c op">×</div>';
  h+=`<div class="line" style="grid-column:1/${cols+1}"></div><div></div>`;
  for(let c=cols-1;c>=0;c--){const cur=st&&st.t==='d'&&st.c===c;const v=filled[c];h+=`<div class="c a ${cur?'cur':''} ${v!==undefined?'ok':''}">${v!==undefined?AR(v):''}</div>`}h+='<div></div>';
  ctx.area(`<div class="colop" id="board" style="grid-template-columns:repeat(${cols},52px) 40px">${h}</div>`)};
 const explain=()=>{const st=steps[k];if(!st)return;
  if(st.t==='c')ctx.say(`${AR(steps[k-1].p)} أكبر من ٩: نكتب ${AR(steps[k-1].p%10)} ونحمل <b>${AR(st.v)}</b> إلى العمود التالي 👆`);
  else if(st.tail)ctx.say(`الناتج ${AR(st.p)}: اكتبي الرقم <b>${AR(st.v)}</b> في العمود التالي`);
  else ctx.say(`أضرب ${AR(b)} × ${AR(st.d)}${st.carryIn?` ثم أضيف المحمول ${AR(st.carryIn)}`:''} = ؟${st.c===as.length-1&&st.p>=10?' (اكتبي الآحاد أولاً)':''}`)};
 draw();explain();
 ctx.pad(d=>{const st=steps[k];if(!st)return;if(d===st.v){SND.step();if(st.t==='d')filled[st.c]=d;else carries[st.c]=d;ctx.resetStep();k++;draw();if(k>=steps.length)return ctx.finish(false,`${pick(PRAISE)} ${AR(a)} × ${AR(b)} = <b>${AR(ans)}</b> ${it.unit||''}`);explain()}
  else{ctx.mistake(st.t==='d'&&!st.tail?`💡 ${AR(b)} × ${AR(st.d)} = ${AR(b*st.d)}${st.carryIn?` ، + ${AR(st.carryIn)} = ${AR(st.p)}`:''}`:null);shakeEl(ctx.el.querySelector('#board'));
   if(ctx.stepMistakes()>=4){if(st.t==='d')filled[st.c]=st.v;else carries[st.c]=st.v;ctx.resetStep();k++;draw();if(k>=steps.length)return ctx.finish(true);explain()}}},null,null);
};
// ---- الأرقام المخفية ----
W.puz=(it,ctx)=>{const op=it.op||'+';const rows=it.rows,sum=it.sum;const blanks=[];
 rows.forEach((r,ri)=>[...r].forEach((ch,ci)=>{if(ch==='_')blanks.push({ri,ci})}));[...sum].forEach((ch,ci)=>{if(ch==='_')blanks.push({ri:-1,ci})});
 let sol=null;const tot=10**blanks.length;
 for(let x=0;x<tot&&!sol;x++){const ds=String(x).padStart(blanks.length,'0').split('').map(Number);const R=rows.map(r=>[...r]),S=[...sum];blanks.forEach((b,j)=>{if(b.ri<0)S[b.ci]=ds[j];else R[b.ri][b.ci]=ds[j]});
  if(R.some(r=>r[0]==0&&r.length>1)||(S[0]==0&&S.length>1))continue;const vals=R.map(r=>+r.join(''));const res=op==='+'?vals.reduce((a,b)=>a+b,0):vals[0]-vals[1];if(res===+S.join(''))sol=ds}
 if(!sol){ctx.area('<p>⚠️</p>');ctx.finish(true);return}
 const vals=blanks.map(()=>null);let sel=0;const cols=sum.length;
 const draw=()=>{let h='';rows.forEach((r,ri)=>{for(let p=0;p<cols-r.length;p++)h+='<div class="c"></div>';[...r].forEach((ch,ci)=>{if(ch==='_'){const j=blanks.findIndex(b=>b.ri===ri&&b.ci===ci);h+=`<div class="c a ${j===sel?'cur':''} ${vals[j]!==null?'ok':''}" data-j="${j}" style="border-style:dashed">${vals[j]!==null?AR(vals[j]):'?'}</div>`}else h+=`<div class="c">${AR(ch)}</div>`});h+=`<div class="c op">${ri===rows.length-1?(op==='-'?'−':'+'):''}</div>`});
  h+=`<div class="line" style="grid-column:1/${cols+1}"></div><div></div>`;
  [...sum].forEach((ch,ci)=>{if(ch==='_'){const j=blanks.findIndex(b=>b.ri<0&&b.ci===ci);h+=`<div class="c a ${j===sel?'cur':''}" data-j="${j}" style="border-style:dashed">${vals[j]!==null?AR(vals[j]):'?'}</div>`}else h+=`<div class="c a ok">${AR(ch)}</div>`});h+='<div></div>';
  ctx.area(`<div class="colop" id="board" style="grid-template-columns:repeat(${cols},52px) 40px">${h}</div><div class="row"><button class="btn ok" id="chk">✔ تحقّقي</button></div>`);
  ctx.el.querySelectorAll('[data-j]').forEach(c=>c.onclick=()=>{sel=+c.dataset.j;draw()});ctx.el.querySelector('#chk').onclick=check};
 const check=()=>{if(vals.some(v=>v===null)){ctx.say('ما زالت هناك مربّعات فارغة ❓','bad');return}const wrong=vals.map((v,j)=>v!==sol[j]);
  if(!wrong.some(Boolean)){ctx.finish(false,'وجدتِ كل الأرقام المخفية! 🕵️‍♀️');return}
  sel=wrong.indexOf(true);ctx.mistake(`💡 تحقّقي من المربّع المضيء. ابدئي من عمود الآحاد وتذكّري ${op==='+'?'المحمول':'الاستلاف'}`);draw();shakeEl(ctx.el.querySelector('#board'));
  if(ctx.stepMistakes()>=4){sol.forEach((v,j)=>vals[j]=v);draw();ctx.reveal()}};
 draw();ctx.say('ابحثي عن الرقم المخفي 🕵️‍♀️ اضغطي على المربّع ثم اختاري الرقم.');
 ctx.pad(d=>{vals[sel]=d;SND.tap();const nx=vals.findIndex(v=>v===null);if(nx>=0)sel=nx;draw()},null,null);
};
// ---- المسألة المفتوحة: ٣ أعداد ----
W.open3=(it,ctx)=>{const v=['','',''];let sel=0;const T=it.sum;
 const draw=()=>{const s=v.reduce((a,b)=>a+Number(b||0),0);ctx.area(`<p class="muted">اكتبي <b>ثلاثة أعداد</b> مجموعها <b>${AR(T)}</b>، ونحتاج إلى <b>إعادة تسمية المئات</b> عند جمعها (مجموع عمود المئات ١٠ أو أكثر).</p>
  ${v.map((x,i)=>`<div class="ansrow ltr" style="direction:ltr"><span class="box ${sel===i?'cur':''}" data-i="${i}" style="min-width:180px;letter-spacing:4px">${x?AR(x):''}</span><span style="width:30px">${i===2?'+':''}</span></div>`).join('')}
  <div style="height:4px;background:var(--ink);width:230px;margin:4px auto;border-radius:4px"></div><div style="text-align:center;font-size:32px;font-weight:800">${AR(s)}</div>`);
  ctx.el.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{sel=+b.dataset.i;draw()})};
 draw();
 ctx.pad(d=>{if(v[sel].length>=4||(!v[sel]&&d===0))return;v[sel]+=d;SND.tap();draw()},()=>{v[sel]=v[sel].slice(0,-1);draw()},()=>{
  const n=v.map(Number);if(n.some(x=>!x)){ctx.say('اكتبي الأعداد الثلاثة أولاً ✍️','bad');return}
  const s=n.reduce((a,b)=>a+b,0),dg=(x,c)=>Math.floor(x/10**c)%10;const c1=Math.floor(n.reduce((a,x)=>a+dg(x,0),0)/10),c2=Math.floor((n.reduce((a,x)=>a+dg(x,1),0)+c1)/10),h=n.reduce((a,x)=>a+dg(x,2),0)+c2;
  if(s!==T){ctx.mistake(`المجموع الآن ${AR(s)}. ${s>T?'كبير قليلاً، صغّري أحد الأعداد':'صغير قليلاً، كبّري أحد الأعداد'} 🙂`,true);return}
  if(h<10){ctx.mistake(`المجموع صحيح 👍 لكن عمود المئات مجموعه ${AR(h)} فقط. اجعلي أرقام المئات أكبر!`,true);return}
  ctx.finish(false,`${n.map(AR).join(' + ')} = ${AR(T)} ✔ وعمود المئات = ${AR(h)} فأعدنا التسمية 🎉`)});
};
// ---- القيمة المكانية ----
function bigNum(n,hl){const s=String(n);return `<div class="ltr" style="text-align:center;font-size:52px;font-weight:800;letter-spacing:6px;direction:ltr">${[...s].map((d,i)=>{const pos=s.length-1-i;return pos===hl?`<span style="color:var(--coral);background:#FFF1B8;border-bottom:5px solid var(--coral);border-radius:8px;padding:0 6px">${AR(d)}</span>`:AR(d)}).join('')}</div>`}
W.pv=(it,ctx)=>{const s=String(it.n),d=+s[s.length-1-it.d],val=d*10**it.d;
 ctx.area(`<p class="q" style="font-size:19px">${it.q?fmt(it.q):'ما اسم مرتبة الرقم الذي تحته خط؟ وما قيمته المكانية؟'}</p>${bigNum(it.n,it.d)}<div class="opts" id="places" style="grid-template-columns:repeat(4,1fr)">${[0,1,2,3].map(p=>`<button class="opt" data-p="${p}">${PLACES[p]}</button>`).join('')}</div><div id="step2"></div>`);
 ctx.el.querySelectorAll('#places .opt').forEach(b=>b.onclick=()=>{if(ctx.isLocked())return;const p=+b.dataset.p;
  if(p===it.d){b.classList.add('right');ctx.el.querySelectorAll('#places .opt').forEach(x=>x.disabled=true);SND.step();ctx.resetStep();
   ctx.say(`صحيح! الرقم ${AR(d)} في مرتبة <b>${PLACES[p]}</b>. الآن ما قيمته المكانية؟`,'good');
   ctx.el.querySelector('#step2').innerHTML=`<div class="ansrow">القيمة المكانية = ${inputBox('a0')}</div>`;multiInput(ctx,['a0'],[val],{hints:()=>`💡 ${AR(d)} ${PLACES[it.d]} = ${AR(d)} × ${AR(10**it.d)}`})}
  else{b.classList.add('wrong');ctx.mistake('💡 عدّي المراتب من اليمين: آحاد، عشرات، مئات، ألوف');if(ctx.stepMistakes()>=3){ctx.el.querySelector(`#places [data-p="${it.d}"]`).click()}}})};
W.pvall=(it,ctx)=>{const s=String(it.n);const ids=[],ans=[];let h='';for(let i=0;i<s.length;i++){const p=s.length-1-i;ids.push('a'+i);ans.push(+s[i]*10**p);h+=`<div class="ansrow" style="font-size:20px">قيمة الرقم ${AR(s[i])} (${PLACES[p]}) = ${inputBox('a'+i,'small')}</div>`}
 ctx.area(bigNum(it.n)+h);multiInput(ctx,ids,ans,{hints:i=>`💡 الرقم في مرتبة ${PLACES[s.length-1-i]}`})};
W.expand=(it,ctx)=>{const s=String(it.n);const ids=[],ans=[];for(let i=0;i<s.length;i++){ids.push('a'+i);ans.push(+s[i]*10**(s.length-1-i))}
 ctx.area(`<p class="q" style="font-size:19px">${it.q?fmt(it.q):'اكتبي العدد بالصورة التحليلية:'}</p><div class="ansrow" style="direction:rtl">${AR(it.n)} = ${ids.map(id=>inputBox(id,'small')).join(' + ')}</div>`);
 multiInput(ctx,ids,ans,{hints:i=>`💡 قيمة الرقم ${AR(s[i])} في مرتبة ${PLACES[s.length-1-i]}`})};
W.pvfill=(it,ctx)=>{const s=String(it.n).padStart(4,'0');ctx.area(`<p class="q" style="font-size:19px">${it.q?fmt(it.q):`اكتبي العدد <b>${AR(it.n)}</b> بجدول القيمة المكانية، ثم اقرئيه:`}</p>
 <table class="t pv"><tr><th>ألوف</th><th>مئات</th><th>عشرات</th><th>آحاد</th></tr><tr>${[0,1,2,3].map(i=>`<td>${inputBox('a'+i,'small')}</td>`).join('')}</tr></table>`);
 multiInput(ctx,['a3','a2','a1','a0'],[+s[3],+s[2],+s[1],+s[0]],{hints:i=>`💡 ابدئي بالآحاد (أول رقم من اليمين)`,onStep:()=>{}});
 ctx.onFinish=()=>`نقرأ: <b>${words(it.n)}</b> 🔊`};
W.read=(it,ctx)=>{const n=it.n,s=String(n);const alts=new Set([n]);const sw=(a,i,j)=>{const x=[...a];[x[i],x[j]]=[x[j],x[i]];return +x.join('')};
 [sw(s,2,3),sw(s,1,2),sw(s,0,1),n+10,n-100,n+1000].forEach(x=>{if(alts.size<4&&x>=1000&&x<=9999&&x!==n)alts.add(x)});
 const o=[...alts];const it2={o:o.map(words),a:0,shuffle:true};
 ctx.area(`<p class="q" style="font-size:19px">كيف نقرأ العدد؟</p>${bigNum(n)}`);const area=document.createElement('div');ctx.el.appendChild(area);
 const sub={...ctx,area:h=>{area.innerHTML=h},el:area};W.mcq(it2,sub)};
W.round=(it,ctx)=>{const to=it.to,lo=Math.floor(it.n/to)*to,hi=lo+to,a=roundTo(it.n,to);
 ctx.area(`<p class="q">${it.q?fmt(it.q):`قرّبي العدد <b>${AR(it.n)}</b> إلى أقرب ${to===10?'عشرة':'مئة'}`}</p><div class="vis">${V.nline({from:lo,to:hi,step:to/10,marks:[it.n]})}</div><div class="ansrow">${AR(it.n)} ≈ ${inputBox('a0')}</div>`);
 multiInput(ctx,['a0'],[a],{hints:()=>`💡 العدد بين ${AR(lo)} و ${AR(hi)}. أيهما أقرب؟ ${it.n-lo===to/2?'(في المنتصف نقرّب إلى الأكبر)':''}`})};
W.est=(it,ctx)=>{const [x,y]=it.n,to=it.to,rx=roundTo(x,to),ry=roundTo(y,to);
 ctx.area(`<p class="q">${it.q?fmt(it.q):`قدّري ناتج الجمع ${AR(x)} + ${AR(y)} بالتقريب إلى أقرب ${to===10?'عشرة':'مئة'}`}</p>
 <div class="ansrow" style="font-size:20px">${AR(x)} ≈ ${inputBox('a0','small')}</div><div class="ansrow" style="font-size:20px">${AR(y)} ≈ ${inputBox('a1','small')}</div><div class="ansrow" style="font-size:22px;direction:rtl">التقدير: ${inputBox('a2')}</div>`);
 multiInput(ctx,['a0','a1','a2'],[rx,ry,rx+ry],{hints:i=>i<2?`💡 قرّبي إلى أقرب ${to===10?'عشرة':'مئة'}`:`💡 ${AR(rx)} + ${AR(ry)}`,max:5})};
W.pat=(it,ctx)=>{const seq=it.seq;const kn=seq.map((v,i)=>v===null?null:i).filter(i=>i!==null);const i0=kn[0],i1=kn[1];const step=(seq[i1]-seq[i0])/(i1-i0);
 const full=seq.map((_,i)=>seq[i0]+(i-i0)*step);const ids=[],ans=[];
 const h=seq.map((v,i)=>v===null?(ids.push('a'+i),ans.push(full[i]),`<span class="box small" id="a${i}" style="min-width:76px"></span>`):`<span class="box small ok" style="min-width:76px">${AR(v)}</span>`).join('');
 ctx.area(`${it.q?`<p class="q">${fmt(it.q)}</p>`:'<p class="q">صِفي قاعدة النمط، ثم أكمليه:</p>'}<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;direction:rtl">${h}</div>`);
 multiInput(ctx,ids,ans,{hints:()=>`💡 قارني العددين الأوّلين: ماذا يتغيّر؟`});
 ctx.onFinish=()=>`القاعدة: ${step>0?'يزيد':'ينقص'} كل عدد بمقدار <b>${AR(Math.abs(step))}</b> عن العدد السابق`};
// ---- إنشاء التمثيل بالأعمدة ----
W.barmake=(it,ctx)=>{const n=it.cats.length,max=it.max;const h=it.cats.map(()=>0);
 const draw=()=>{let g='';
  if(it.horiz){g=`<div style="display:grid;grid-template-columns:120px repeat(${max},30px);gap:3px;justify-content:center;direction:rtl">`;it.cats.forEach((c,i)=>{g+=`<div style="font-size:15px;align-self:center">${c}</div>`;for(let k=1;k<=max;k++)g+=`<button class="cellb" data-i="${i}" data-k="${k}" style="height:30px;border:none;border-radius:6px;background:${k<=h[i]?'var(--c)':'#EEF3F9'}"></button>`});g+=`<div></div>${Array.from({length:max},(_,k)=>`<div class="muted" style="text-align:center">${AR(k+1)}</div>`).join('')}</div>`}
  else{g=`<div style="display:grid;grid-template-columns:28px repeat(${n},70px);gap:3px;justify-content:center;direction:ltr">`;for(let k=max;k>=1;k--){g+=`<div class="muted" style="text-align:center;line-height:26px">${AR(k)}</div>`;for(let i=n-1;i>=0;i--)g+=`<button class="cellb" data-i="${i}" data-k="${k}" style="height:26px;border:none;border-radius:5px;background:${k<=h[i]?'var(--c)':'#EEF3F9'}"></button>`}
   g+=`<div></div>${it.cats.slice().reverse().map(c=>`<div style="text-align:center;font-size:14px;line-height:1.2">${c}</div>`).join('')}</div>`}
  ctx.area(`<p class="q" style="font-size:19px">${it.q?fmt(it.q):`مثّلي البيانات بالأعمدة${it.horiz?' الأفقية':''}: «${it.title}»`}</p>${V.table({head:['',...it.cats],rows:[['العدد',...it.vals.map(AR)]]})}<div class="muted" style="text-align:center">اضغطي على المربّع الذي يصل إليه العمود 👇</div>${g}<div class="row"><button class="btn ok" id="chk">✔ تحقّقي</button></div>`);
  ctx.el.querySelectorAll('.cellb').forEach(b=>b.onclick=()=>{const i=+b.dataset.i,k=+b.dataset.k;h[i]=h[i]===k?k-1:k;SND.tap();draw()});
  ctx.el.querySelector('#chk').onclick=()=>{const bad=h.map((x,i)=>x!==it.vals[i]);if(!bad.some(Boolean))ctx.finish(false,'تمثيل رائع! 📊');else{ctx.mistake(`💡 عمود «${it.cats[bad.indexOf(true)]}» يجب أن يصل إلى ${AR(it.vals[bad.indexOf(true)])}`);if(ctx.stepMistakes()>=4){it.vals.forEach((v,i)=>h[i]=v);draw();ctx.reveal()}}}};
 draw()};
// ---- قائمة منظّمة (التباديل) ----
W.perm=(it,ctx)=>{const all=perms(it.items).map(p=>p.join(''));const found=[];let cur=[];
 const draw=()=>{ctx.area(`<p class="q" style="font-size:19px">${fmt(it.q)}</p>
  <div class="slots" dir="rtl">${[0,1,2].map(k=>`<div class="s ${cur[k]?'full':''}" style="font-size:32px">${cur[k]||AR(k+1)}</div>`).join('')}</div>
  <div class="chips" dir="rtl">${it.items.map((x,i)=>`<button class="chip ${cur.includes(x)?'used':''}" data-x="${i}" style="font-size:30px">${x}</button>`).join('')}<button class="chip" id="clr" style="background:#FFE4E8">⟲</button></div>
  <div class="muted" style="text-align:center">الترتيبات التي وجدتِها: ${AR(found.length)} من ؟</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;font-size:24px;direction:rtl">${found.map(f=>`<span class="pill">${f}</span>`).join('')}</div>${it.names?`<div class="muted" style="text-align:center">${it.items.map((x,i)=>x+' '+it.names[i]).join(' ، ')}</div>`:''}`);
  ctx.el.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{cur.push(it.items[+b.dataset.x]);SND.tap();if(cur.length===3)add();else draw()});ctx.el.querySelector('#clr').onclick=()=>{cur=[];draw()}};
 const add=()=>{const k=cur.join('');if(found.includes(k)){ctx.say('هذا الترتيب موجود من قبل! جرّبي ترتيباً مختلفاً 🔁','bad');SND.bad()}else{found.push(k);SND.step();ctx.say(found.length<all.length?`ترتيب جديد! 👏 ابحثي عن غيره… 💡 ابدئي كل مرة بلون مختلف`:'','good')}cur=[];draw();
  if(found.length===all.length)ctx.finish(false,`وجدتِ كل الترتيبات! عدد الطرق = <b>${AR(all.length)}</b> 🎉`)};
 draw()};
// ---- الكسور ----
W.frac=(it,ctx)=>{let sel=0;const v=['',''];
 const draw=()=>{ctx.area(`<div class="ansrow" style="font-size:24px">${it.qf?`<span class="ltr" style="direction:rtl;font-size:30px">${it.qf.map(p=>typeof p==='string'?` ${p} `:fr(p[0],p[1])).join('')} =</span>`:''}
  <span class="fr" style="font-size:30px"><b style="padding-bottom:6px"><span class="box small ${sel===0?'cur':''}" id="fn">${v[0]?AR(v[0]):''}</span></b><i style="padding-top:6px"><span class="box small ${sel===1?'cur':''}" id="fd">${v[1]?AR(v[1]):''}</span></i></span></div>
  <p class="muted" style="text-align:center;margin:0">البسط فوق ⬆️ والمقام تحت ⬇️</p>`);
  ctx.el.querySelector('#fn').onclick=()=>{sel=0;draw()};ctx.el.querySelector('#fd').onclick=()=>{sel=1;draw()}};
 draw();
 ctx.pad(d=>{if(v[sel].length>=2)return;v[sel]+=d;SND.tap();if(sel===0&&v[0].length>=1&&!v[1])sel=1;draw()},()=>{if(!v[sel]&&sel===1)sel=0;v[sel]=v[sel].slice(0,-1);draw()},()=>{
  if(v[0]===''||v[1]===''){ctx.say('اكتبي البسط والمقام ✍️','bad');return}const n=+v[0],d=+v[1];
  const ok=it.exact?(n===it.a.n&&d===it.a.d):(d>0&&n*it.a.d===it.a.n*d);
  if(ok)ctx.finish(false,`${pick(PRAISE)} ${fr(it.a.n,it.a.d)}`);
  else{ctx.mistake(it.qf?'💡 المقامان متساويان: أجري العملية على البسطين وأبقي المقام':'💡 البسط = عدد الأجزاء الملوّنة ، المقام = عدد كل الأجزاء');shakeEl(ctx.el.querySelector('.ansrow'));
   if(ctx.stepMistakes()>=3){v[0]=String(it.a.n);v[1]=String(it.a.d);draw();ctx.reveal()}}})};
W.fracEq3=(it,ctx)=>{const v=[['',''],['',''],['','']];let sel=[0,0];
 const draw=()=>{ctx.area(`<p class="q">اكتبي ٣ كسور متكافئة (تدلّ على الكمية نفسها):</p><div class="ansrow" style="direction:rtl;gap:18px">${v.map((f,i)=>`<span class="fr" style="font-size:28px"><b style="padding-bottom:6px"><span class="box small ${sel[0]===i&&sel[1]===0?'cur':''}" data-i="${i}" data-p="0">${f[0]?AR(f[0]):''}</span></b><i style="padding-top:6px"><span class="box small ${sel[0]===i&&sel[1]===1?'cur':''}" data-i="${i}" data-p="1">${f[1]?AR(f[1]):''}</span></i></span>${i<2?'<span>=</span>':''}`).join('')}</div>`);
  ctx.el.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{sel=[+b.dataset.i,+b.dataset.p];draw()})};
 draw();ctx.say('💡 مثلاً: اضربي البسط والمقام في العدد نفسه');
 ctx.pad(d=>{const f=v[sel[0]];if(f[sel[1]].length>=2)return;f[sel[1]]+=d;SND.tap();draw()},()=>{const f=v[sel[0]];f[sel[1]]=f[sel[1]].slice(0,-1);draw()},()=>{
  if(v.some(f=>f[0]===''||f[1]===''||+f[1]===0)){ctx.say('أكملي الكسور الثلاثة ✍️','bad');return}
  const val=v.map(f=>+f[0]/+f[1]);const distinct=new Set(v.map(f=>f.join('/'))).size===3;
  if(Math.abs(val[0]-val[1])<1e-9&&Math.abs(val[1]-val[2])<1e-9&&distinct)ctx.finish(false,'كسور متكافئة رائعة! 🍕');else ctx.mistake('💡 يجب أن تكون الكسور مختلفة الكتابة ومتساوية القيمة، مثل ١/٢ = ٢/٤ = ٣/٦',true)})};
// ---- الساعة ----
const tstr=(h,m)=>`${AR(h)}:${AR(String(m).padStart(2,'0'))}`;
W.clockread=(it,ctx)=>{const ops=new Set([tstr(it.h,it.m)]);const cand=[[it.h,(it.m+5)%60],[it.h%12+1,it.m],[it.h,(it.m+55)%60],[(it.h+10)%12+1,it.m],[Math.round(it.m/5)||12,it.h*5%60]];
 cand.forEach(([h,m])=>{if(ops.size<4)ops.add(tstr(h||12,m))});const o=[...ops];
 const before=60-it.m;ctx.area(`<div class="vis">${V.clock({h:it.h,m:it.m})}</div>`);const area=document.createElement('div');ctx.el.appendChild(area);
 W.mcq({o,a:0,why:it.m<=30?`الساعة ${tstr(it.h,it.m)}: الساعة ${AR(it.h)} و ${AR(it.m)} دقيقة`:`الساعة ${tstr(it.h,it.m)}: أي ${AR(it.h%12+1)} إلا ${AR(before)} دقيقة`},{...ctx,area:h=>{area.innerHTML=h},el:area});
 ctx.say('اقرئي الساعة: العقرب القصير للساعات، والعقرب الطويل للدقائق. عدّي قفزاً خمسات من ١٢ ⏰')};
W.clockset=(it,ctx)=>{let m=0;
 const draw=()=>{ctx.area(`<p class="q">ارسمي عقرب الدقائق ليدلّ على الوقت <span class="pill ltr" style="font-size:26px">${tstr(it.h,it.m)}</span></p><div class="vis">${V.clock({h:it.h,m})}</div>
  <div class="clockctl"><button data-d="-5">−٥</button><button data-d="-1">−١</button><span class="pill" style="font-size:22px">${AR(m)} دقيقة</span><button data-d="1">+١</button><button data-d="5">+٥</button></div><div class="row"><button class="btn ok" id="chk">✔ تحقّقي</button></div>`);
  ctx.el.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{m=(m+ +b.dataset.d+60)%60;SND.tap();draw()});
  ctx.el.querySelector('#chk').onclick=()=>{if(m===it.m)ctx.finish(false,`${pick(PRAISE)} ${tstr(it.h,it.m)}`);else{ctx.mistake(`💡 ${AR(it.m)} دقيقة = ${AR(Math.floor(it.m/5))} قفزات من ٥ و ${AR(it.m%5)}`);if(ctx.stepMistakes()>=4){m=it.m;draw();ctx.reveal()}}}};
 draw()};
W.hijri=(it,ctx)=>{const months=['محرّم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوّال','ذو القعدة','ذو الحجة'];let idx=-1;
 try{const f=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{month:'numeric'}).formatToParts(new Date());const mm=+f.find(p=>p.type==='month').value;if(mm>=1&&mm<=12)idx=mm-1}catch(e){}
 if(idx<0){try{const f=new Intl.DateTimeFormat('en-u-ca-islamic',{month:'numeric'}).formatToParts(new Date());idx=+f.find(p=>p.type==='month').value-1}catch(e){}}
 if(idx<0||isNaN(idx)){W.mcq({o:['ذو الحجة','رمضان','رجب'],a:0},ctx);return}
 const o=[months[idx]];while(o.length<4){const m=pick(months);if(!o.includes(m))o.push(m)}
 ctx.area('<p class="q">اكتبي الشهر الحالي من السنة الهجرية 🌙</p>');const area=document.createElement('div');ctx.el.appendChild(area);W.mcq({o,a:0},{...ctx,area:h=>{area.innerHTML=h},el:area})};
// ---- تلوين المساحة ----
W.areamake=(it,ctx)=>{const on=new Set();
 const draw=()=>{ctx.area(`<p class="q">${fmt(it.q)}</p><div class="gridpick" style="grid-template-columns:repeat(${it.w},34px)">${Array.from({length:it.w*it.h},(_,i)=>`<button data-i="${i}" class="${on.has(i)?'on':''}"></button>`).join('')}</div><div class="muted" style="text-align:center">لوّنتِ ${AR(on.size)} مربّعاً</div><div class="row"><button class="btn ok" id="chk">✔ تحقّقي</button></div>`);
  ctx.el.querySelectorAll('.gridpick button').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;on.has(i)?on.delete(i):on.add(i);SND.tap();draw()});
  ctx.el.querySelector('#chk').onclick=()=>{if(on.size===it.a)ctx.finish(false,`مساحة شكلك = <b>${AR(it.a)}</b> وحدات مربّعة 🎨`);else ctx.mistake(on.size>it.a?'💡 لوّنتِ مربّعات أكثر من المطلوب':'💡 تحتاجين مربّعات أكثر',true)}};
 draw()};
// ---- حقائق مترابطة ----
W.family=(it,ctx)=>{const a=it.a,b=it.b,p=a*b;
 ctx.area(`<p class="q">أكتب حقائق الضرب والقسمة المترابطة للأعداد ${AR(a)} ، ${AR(b)} ، ${AR(p)}:</p>
 <div class="ansrow" style="direction:rtl;font-size:24px">${AR(a)} × ${AR(b)} = ${inputBox('a0','small')}</div><div class="ansrow" style="direction:rtl;font-size:24px">${AR(b)} × ${AR(a)} = ${inputBox('a1','small')}</div>
 <div class="ansrow" style="direction:rtl;font-size:24px">${AR(p)} ÷ ${AR(a)} = ${inputBox('a2','small')}</div><div class="ansrow" style="direction:rtl;font-size:24px">${AR(p)} ÷ ${AR(b)} = ${inputBox('a3','small')}</div>`);
 multiInput(ctx,['a0','a1','a2','a3'],[p,p,b,a],{hints:i=>i>=2?`💡 ما العدد الذي أضربه في ${AR(i===2?a:b)} ليكون الناتج ${AR(p)}؟`:null})};
