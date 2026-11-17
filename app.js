// ===== الشاشات والمشغّل =====
'use strict';
const app=$('#app');
let NAV=[];// مكدّس الرجوع
let CLEAN=null;function cleanup(){if(CLEAN){try{CLEAN()}catch(e){}CLEAN=null}}
function go(fn,push=true){stopSpeak();cleanup();if(push)NAV.push(fn);fn();window.scrollTo(0,0)}
function back(){stopSpeak();cleanup();closeOv();if(NAV.length>1){NAV.pop();NAV[NAV.length-1]();window.scrollTo(0,0);return true}return false}

// ---- ألوان الفصل ----
function mix(hex,with_,t){const h=x=>parseInt(x,16);const a=[h(hex.slice(1,3)),h(hex.slice(3,5)),h(hex.slice(5,7))],b=[h(with_.slice(1,3)),h(with_.slice(3,5)),h(with_.slice(5,7))];return '#'+a.map((v,i)=>Math.round(v*(1-t)+b[i]*t).toString(16).padStart(2,'0')).join('')}
function setColor(c){const r=document.documentElement.style;r.setProperty('--c',c);r.setProperty('--cd',mix(c,'#000000',.3));r.setProperty('--cm',mix(c,'#ffffff',.35));r.setProperty('--cl',mix(c,'#ffffff',.86));r.setProperty('--cg',c+'38')}
const chapterOf=l=>BOOK.chapters.find(c=>c.n===l.ch);

// ---- حساب النجوم ----
function setStarsOf(prefix,n){let s=0;for(let i=0;i<n;i++)s+=P.stars[prefix+'|'+i]||0;return s}
function lessonStars(l){return setStarsOf(l.id+'|ex',l.ex.length)+setStarsOf(l.id+'|wb',l.wb.length)}
function lessonMax(l){return 3*(l.ex.length+l.wb.length)}
function chapterPct(c){let s=0,m=0;c.lessons.forEach(l=>{s+=lessonStars(l);m+=lessonMax(l)});return m?s/m:0}
const BADGES=[[10,'🥉','١٠ نجوم'],[50,'🥈','٥٠ نجمة'],[150,'🥇','١٥٠ نجمة'],[300,'🏆','٣٠٠ نجمة'],[600,'👑','٦٠٠ نجمة'],[1000,'🦉','١٠٠٠ نجمة']];

// ================= الصفحة الرئيسية =================
function home(){setColor('#3D8BFD');
 if(!P.name){return askName()}
 const ts=totalStars();
 app.innerHTML=`<div class="top"><span class="pill">⭐ ${AR(ts)}</span><span class="ttl"></span><button class="icon-btn" id="set" aria-label="الإعدادات">⚙️</button></div>
 <div class="hello"><div class="owl bob" aria-hidden="true">🦉</div><div><h1>أهلاً يا ${esc(P.name)}!</h1><p>أنا بومة، سأرافقكِ في رحلة الرياضيات. اختاري محطّة لنبدأ.</p></div></div>
 <div class="home-cards"><button class="tile main" id="mission"><span class="ic">🎯</span><span class="tt">مهمّة اليوم</span><span class="ds">${P.lastDay===today()?'أنجزتِها اليوم ✅':'٨ أسئلة منوّعة'}${P.streak>1?`<br>🔥 ${AR(P.streak)} أيام متتالية`:''}</span></button>
 <button class="tile" id="redo"><span class="ic">📒</span><span class="tt">دفتر أخطائي</span><span class="ds">${P.redo.length?`${AR(P.redo.length)} تمريناً لنتدرّب عليها`:'فارغ — ممتاز! 🌟'}</span></button></div>
 <div class="map">${mapSvg()}${BOOK.chapters.map(c=>{const p=chapterPct(c);return `<button class="stop" data-c="${c.n}" style="--cc:${c.color}"><span class="num">${AR(c.n)}</span><span style="flex:1"><span class="nm">${c.ico} ${c.title.replace(/ (?=[٠-٩])/g,'\u00a0')}</span><span class="sub" style="display:block">${AR(c.lessons.length)} دروس${p>0?` | أنجزتِ ${AR(Math.round(p*100))}٪`:''}</span><span class="mini-bar"><i style="width:${p*100}%"></i></span></span></button>`}).join('')}</div>
 <div class="sheet" style="text-align:center"><b>أوسمتي</b><div class="badges">${BADGES.map(([n,b,t])=>`<span class="${ts>=n?'on':''}" title="${t}">${b}</span>`).join('')}</div><div class="muted">كل تمرين صحيح من أول محاولة = ٣ نجوم ⭐</div></div>`;
 app.querySelectorAll('.stop').forEach(b=>b.onclick=()=>{SND.tap();const c=BOOK.chapters.find(x=>x.n===+b.dataset.c);go(()=>chapter(c))});
 $('#set').onclick=()=>go(settings);
 $('#mission').onclick=()=>go(()=>runSet({title:'مهمّة اليوم 🎯',items:missionItems(),color:'#FFB703',mission:true}));
 $('#redo').onclick=()=>{if(!P.redo.length){SND.ok();return}go(()=>runSet({title:'دفتر أخطائي 📒',items:P.redo.slice(-8).reverse(),color:'#FF5D73',redoMode:true}))};
}
function today(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function missionItems(){// أخطاء سابقة + تمارين جديدة من الدروس التي بدأتها
 const started=[];BOOK.chapters.forEach(c=>c.lessons.forEach(l=>{if(P.seen[l.id]||lessonStars(l)>0)started.push(l)}));
 const pool=started.length?started:[BOOK.chapters[0].lessons[0]];
 const items=shuffle(P.redo).slice(0,3);
 while(items.length<8){const l=pick(pool);items.push(genItems(l,1)[0])}
 return shuffle(items)}
function markMission(){const t=today();if(P.lastDay===t)return;const y=new Date();y.setDate(y.getDate()-1);const ys=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();P.streak=P.lastDay===ys?(P.streak||0)+1:1;P.lastDay=t;save()}
function mapSvg(){// مسار متعرّج يربط المحطّات
 return `<svg class="path" viewBox="0 0 100 ${BOOK.chapters.length*10}" preserveAspectRatio="none" aria-hidden="true"><path d="${BOOK.chapters.map((_,i)=>`${i?'L':'M'}${i%2?24:76} ${i*10+5}`).join(' ')}" fill="none" stroke="#C8D7EA" stroke-width="1.6" stroke-dasharray="2 2" vector-effect="non-scaling-stroke" style="stroke-width:5px"/></svg>`}
function askName(){app.innerHTML=`<div style="height:8vh"></div><div class="sheet" style="text-align:center"><div class="owl bob" style="font-size:80px">🦉</div><h1 style="margin:4px 0">مرحباً! أنا بومة</h1><p>سأعلّمكِ رياضيات الصف الثالث الابتدائي بطريقة ممتعة. ما اسمكِ؟</p>
 <input class="name" id="nm" maxlength="20" placeholder="اكتبي اسمكِ هنا" autocomplete="off"><div class="row"><button class="btn sun" id="go">هيا نبدأ 🚀</button></div></div>`;
 const f=()=>{const v=$('#nm').value.trim();if(!v){shakeEl($('#nm'));return}P.name=v;save();NAV=[home];home()};$('#go').onclick=f;$('#nm').onkeydown=e=>{if(e.key==='Enter')f()}}
function report(){const rows=[];BOOK.chapters.forEach(c=>c.lessons.forEach(l=>{const m=lessonMax(l),s=lessonStars(l);if(s>0||P.seen[l.id])rows.push([l,s/m])}));
 if(!rows.length)return '<p class="muted">لم تبدأ أيّ درس بعد.</p>';
 const weak=rows.slice().sort((a,b)=>a[1]-b[1]).slice(0,3).filter(r=>r[1]<.7);
 return `<p class="muted" style="margin:4px 0">الدروس التي بدأتها: ${AR(rows.length)} من ${AR(BOOK.chapters.reduce((a,c)=>a+c.lessons.length,0))} | أيام متتالية: ${AR(P.streak||0)} | في دفتر الأخطاء: ${AR(P.redo.length)}</p>
 ${weak.length?`<p style="margin:4px 0">تحتاج تدريباً أكثر: <b>${weak.map(r=>r[0].title).join('، ')}</b></p>`:''}
 <table class="t report"><tr><th>الدرس</th><th>الإنجاز</th></tr>${rows.map(([l,p])=>`<tr><td style="text-align:right">${l.id.replace(/\d/g,d=>DIG[d]).replace('-','.')} ${l.title}</td><td>${AR(Math.round(p*100))}٪</td></tr>`).join('')}</table>`}
function settings(){app.innerHTML=`<div class="top"><button class="icon-btn" id="bk" aria-label="رجوع">→</button><span class="ttl">الإعدادات</span></div>
 <div class="sheet"><div class="switch"><span>الاسم</span><span><b>${esc(P.name)}</b> <button class="btn sec" id="rn" style="padding:4px 12px;font-size:15px">تغيير</button></span></div>
 <div class="switch"><span>الأصوات 🔔</span><button class="btn ${P.sound?'ok':'sec'}" id="snd" style="padding:4px 16px">${P.sound?'تعمل':'متوقفة'}</button></div>
 <div class="switch"><span>قراءة الشرح بالصوت تلقائياً 🔊</span><button class="btn ${P.voice?'ok':'sec'}" id="vc" style="padding:4px 16px">${P.voice?'تعمل':'متوقفة'}</button></div>
 <div class="switch"><span>مجموع النجوم</span><b>⭐ ${AR(totalStars())}</b></div>
 <div class="switch"><span>مسح التقدّم والبدء من جديد</span><button class="btn sec" id="rs" style="padding:4px 12px;font-size:15px">مسح</button></div></div>
 <div class="sheet"><b>📊 تقرير لوليّ الأمر</b>${report()}</div>
 <div class="sheet nomargin muted" style="font-size:14px">مبنيّ على كتاب الرياضيات وكتاب التمرينات للصف الثالث الابتدائي (جمهورية العراق – وزارة التربية، الطبعة الثامنة ١٤٤٧هـ / ٢٠٢٥م). الشروح مكتوبة بأسلوب مبسّط، والتمارين مأخوذة من الكتابين، مع تمارين إضافية متجدّدة.</div>`;
 $('#bk').onclick=back;$('#snd').onclick=()=>{P.sound=!P.sound;save();settings()};$('#vc').onclick=()=>{P.voice=!P.voice;save();settings()};
 $('#rn').onclick=()=>{P.name='';save();NAV=[home];home()};
 let armed=false;$('#rs').onclick=e=>{if(!armed){armed=true;e.target.textContent='اضغطي مرة أخرى للتأكيد';e.target.className='btn';return}P.stars={};P.seen={};P.best={};save();NAV=[home];home()}}

// ================= الفصل =================
function chapter(c){setColor(c.color);
 app.innerHTML=`<div class="top"><button class="icon-btn" id="bk" aria-label="رجوع">→</button><span class="ttl">الفصل ${AR(c.n)}</span><span class="pill">${AR(Math.round(chapterPct(c)*100))}٪</span></div>
 <div class="sheet"><div class="ch-head"><div class="ch-badge">${c.ico}</div><div><h2>${c.title}</h2><p>${AR(c.lessons.length)} دروس واختبار</p></div></div>
 <div class="owl-say"><div class="owl">🦉</div><div class="bubble">${fmt(c.intro)}</div></div></div>
 <div>${c.lessons.map((l,i)=>{const s=lessonStars(l),m=lessonMax(l);return `<button class="lesson-item ${s>=m*.6&&s>0?'done':''}" data-i="${i}"><span class="n">${AR(i+1)}</span><span class="t">${l.title}<span class="s" style="display:block">${l.plan?'🧩 خطة حل مسألة | ':''}ص ${AR(l.page)} | ⭐ ${AR(s)} / ${AR(m)}</span></span><span aria-hidden="true">←</span></button>`}).join('')}
 <button class="lesson-item" id="test"><span class="n">📝</span><span class="t">اختبار الفصل<span class="s" style="display:block">${AR(c.test.length)} سؤالاً | ⭐ ${AR(setStarsOf('t'+c.n,c.test.length))} / ${AR(c.test.length*3)}</span></span><span>←</span></button></div>`;
 $('#bk').onclick=back;
 app.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{SND.tap();go(()=>lesson(c.lessons[+b.dataset.i]))});
 $('#test').onclick=()=>go(()=>runSet({title:'اختبار الفصل '+AR(c.n),items:c.test,key:'t'+c.n,color:c.color}));
}

// ================= الدرس =================
function lesson(l){const c=chapterOf(l);setColor(c.color);const idx=c.lessons.indexOf(l);const nxt=c.lessons[idx+1];
 const exS=setStarsOf(l.id+'|ex',l.ex.length),wbS=setStarsOf(l.id+'|wb',l.wb.length);
 app.innerHTML=`<div class="top"><button class="icon-btn" id="bk" aria-label="رجوع">→</button><span class="ttl">الدرس ${AR(idx+1)}</span><span class="pill">ص ${AR(l.page)}</span></div>
 <div class="sheet"><h2 style="margin:0;font-size:24px;line-height:1.35">${l.title}</h2><div class="idea"><span style="font-size:24px">📌</span><div><b>فكرة الدرس:</b> ${fmt(l.idea)}</div></div></div>
 <div class="tiles">
  <button class="tile main" id="t1"><span class="ic">📖</span><span class="tt">أتعلّم</span><span class="ds">شرح الدرس خطوة بخطوة (${AR(l.teach.length)} شرائح)${P.seen[l.id]?' ✅':''}</span></button>
  <button class="tile" id="t2"><span class="ic">✏️</span><span class="tt">أتأكّد وأحلّ</span><span class="ds">تمارين الكتاب | ${AR(l.ex.length)} تمريناً<br>⭐ ${AR(exS)} / ${AR(l.ex.length*3)}</span></button>
  ${l.wb.length?`<button class="tile" id="t3"><span class="ic">📒</span><span class="tt">كراس التمارين</span><span class="ds">${AR(l.wb.length)} تمريناً<br>⭐ ${AR(wbS)} / ${AR(l.wb.length*3)}</span></button>`:''}
  ${l.gen?`<button class="tile" id="t4"><span class="ic">♾️</span><span class="tt">تدرّب أكثر</span><span class="ds">تمارين جديدة في كل مرة</span></button>
  <button class="tile" id="t5"><span class="ic">⏱️</span><span class="tt">تحدّي الدقيقة</span><span class="ds">كم سؤالاً تحلّين في ٦٠ ثانية؟${P.best[l.id]?`<br>أفضل نتيجة: ${AR(P.best[l.id])}`:''}</span></button>`:''}
 </div>
 ${nxt?`<div class="row"><button class="btn sec" id="nx">الدرس التالي: ${nxt.title} ←</button></div>`:''}`;
 $('#bk').onclick=back;
 $('#t1').onclick=()=>go(()=>teach(l));
 $('#t2').onclick=()=>go(()=>runSet({title:'أتأكّد وأحلّ',items:l.ex,key:l.id+'|ex',color:c.color,lesson:l}));
 if($('#t3'))$('#t3').onclick=()=>go(()=>runSet({title:'كراس التمارين',items:l.wb,key:l.id+'|wb',color:c.color,lesson:l}));
 if($('#t4'))$('#t4').onclick=()=>go(()=>runSet({title:'تدرّب أكثر',items:genItems(l,10),color:c.color,lesson:l,practice:true}));
 if($('#t5'))$('#t5').onclick=()=>{if(lessonStars(l)<l.ex.length*1.5){showOv(`<div class="big">⏱️</div><h2>تحدّي الدقيقة</h2><p>حلّي تمارين <b>أتأكّد وأحلّ</b> أولاً، واجمعي نصف نجومها على الأقل، ثم يُفتح التحدّي 🔓</p><div class="row"><button class="btn ok" id="okk">حسناً</button></div>`);$('#okk').onclick=closeOv;return}go(()=>timed(l))};
 if(nxt)$('#nx').onclick=()=>{NAV.pop();go(()=>lesson(nxt))};
}

// ================= الشرح =================
function teach(l){const c=chapterOf(l);setColor(c.color);let i=0;
 const draw=()=>{const s=l.teach[i];app.innerHTML=`<div class="top"><button class="icon-btn" id="bk" aria-label="رجوع">→</button><div class="prog"><i style="width:${(i+1)/l.teach.length*100}%"></i></div><span class="pill">${AR(i+1)} / ${AR(l.teach.length)}</span></div>
  <div class="sheet pop"><div class="tag">أتعلّم | ${l.title}</div><div class="owl-say" style="margin-top:4px"><div class="owl bob">🦉</div><div class="bubble" style="font-size:20px"><button class="spk" id="spk" aria-label="استمعي">🔊</button>${fmt(s.s)}</div></div>${s.v?`<div class="vis">${vis(s.v)}</div>`:''}</div>
  <div class="row"><button class="btn sec" id="pv" ${i===0?'disabled':''}>→ السابق</button>${i<l.teach.length-1?`<button class="btn" id="nx">التالي ←</button>`:`<button class="btn ok" id="done">فهمت! هيا نتدرّب ✏️</button>`}</div>`;
  $('#bk').onclick=back;$('#spk').onclick=()=>speak(s.s);
  $('#pv').onclick=()=>{i--;SND.tap();draw()};if($('#nx'))$('#nx').onclick=()=>{i++;SND.tap();draw()};
  if($('#done'))$('#done').onclick=()=>{P.seen[l.id]=1;save();NAV.pop();go(()=>runSet({title:'أتأكّد وأحلّ',items:l.ex,key:l.id+'|ex',color:c.color,lesson:l}))};
  if(P.voice)speak(s.s)};
 draw()}

// ================= مشغّل التمارين =================
const SELFQ=new Set(['pv','pvall','expand','pvfill','round','est','pat','barmake','perm','open3','fracEq3','clockset','hijri','areamake','family','read']);
function runSet(o){setColor(o.color||'#3D8BFD');const items=o.items;let i=0;const res=[];
 const draw=()=>{const it=items[i];if(!it){return endSet()}
  let locked=false,mistakes=0,step=0;
  app.innerHTML=`<div class="top"><button class="icon-btn" id="bk" aria-label="خروج">✕</button><div class="prog"><i style="width:${i/items.length*100}%"></i></div><span class="pill">${AR(i+1)} / ${AR(items.length)}</span></div>
  <div class="sheet" id="card">${it.tag?`<span class="tag">${it.tag}</span> `:''}<span class="tag">${o.title}</span>
   ${it.story?`<div class="story">${fmt(it.story)}</div>`:''}
   ${!SELFQ.has(it.k)&&(it.q||defaultQ(it))&&!(it.story&&(it.k==='add'||it.k==='sub'||it.k==='mul'))?(()=>{const qq=it.k==='frac'&&it.qf?'أجدي الناتج:':it.q||defaultQ(it);const big=/[٠-٩]/.test(qq)&&plain(qq).length<=26&&/[=×÷+−]/.test(qq);return `<div class="q ${big?'big':''}">${fmt(qq)}</div>`})():''}
   ${it.v&&!['clockread'].includes(it.k)?`<div class="vis">${vis(it.v)}</div>`:''}
   <div id="w"></div>
   <div class="owl-say"><div class="owl">🦉</div><div class="bubble" id="bub"><button class="spk" id="spk" aria-label="استمعي للسؤال">🔊</button><span id="msg"></span></div></div>
   <div id="padbox"></div><div id="nextbox"></div></div>`;
  $('#bk').onclick=back;
  $('#spk').onclick=()=>speak([it.story,it.q||defaultQ(it),$('#msg').innerHTML].filter(Boolean).join('. '));
  const w=$('#w');
  const say=(h,cls)=>{$('#bub').className='bubble '+(cls||'');$('#msg').innerHTML=h||''};
  const ctx={el:w,area:h=>{w.innerHTML=h},say,isLocked:()=>locked,stepMistakes:()=>step,resetStep:()=>{step=0},get mistakes(){return mistakes},
   pad:(onD,onDel,onGo)=>{const pb=$('#padbox');pb.innerHTML=`<div class="pad">${[1,2,3,4,5,6,7,8,9,0].map(d=>`<button data-d="${d}">${AR(d)}</button>`).join('')}${onDel?'<button class="del" data-x="del" aria-label="مسح">⌫ مسح</button>':''}${onGo?`<button class="go" data-x="go" aria-label="تحقّق" style="grid-column:span ${onDel?3:5}">✔ تحقّقي</button>`:''}</div>`;
    pb.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(locked)return;if(b.dataset.d!==undefined){SND.tap();onD(+b.dataset.d)}else if(b.dataset.x==='del')onDel&&onDel();else onGo&&onGo()});
    keyH=e=>{if(locked)return;if(/^[0-9٠-٩]$/.test(e.key)){onD(+EN(e.key))}else if(e.key==='Backspace'&&onDel)onDel();else if(e.key==='Enter'&&onGo)onGo()}},
   mistake:(h,soft)=>{if(locked)return;mistakes++;step++;SND.bad();say(soft?h:(step>=2&&h?h:pick(['حاولي مرة أخرى 🙂','فكّري مرة أخرى 🤔','لا بأس، الخطأ يعلّمنا 💪'])),'bad');if(o.timed&&step>=2){finish(true)}},
   ok:(m)=>finish(false,m),reveal:()=>finish(true),finish:(rev,m)=>finish(rev,m),onFinish:null};
  const finish=(revealed,msg)=>{if(locked)return;locked=true;const stars=revealed?0:mistakes===0?3:mistakes<=2?2:1;res[i]=stars;
   if(o.key)setStar(o.key+'|'+i,stars);
   const extra=ctx.onFinish?' '+ctx.onFinish():'';
   if(o.redoMode){if(!revealed&&mistakes===0){P.redo=P.redo.filter(r=>JSON.stringify(r)!==JSON.stringify(it))}}
   else if((revealed||mistakes>0)&&!o.timed){const js=JSON.stringify(it);if(!P.redo.some(r=>JSON.stringify(r)===js)){P.redo.push(JSON.parse(js));if(P.redo.length>40)P.redo.shift()}}
   save();
   if(revealed){say(`الإجابة الصحيحة موضّحة 👆 لا بأس، حفظتُ هذا التمرين في <b>دفتر أخطائي</b> لنتدرّب عليه لاحقاً 💛${extra?'<br>'+extra:''}`,'neutral')}
   else{SND.ok();say(`${msg||pick(PRAISE)} ${'⭐'.repeat(stars)}${extra?'<br>'+extra:''}`,'good')}
   $('#padbox').innerHTML='';
   if(o.timed){o.onAnswer&&o.onAnswer(!revealed&&mistakes===0);setTimeout(()=>{i++;draw()},revealed?900:450);return}
   $('#nextbox').innerHTML=`<div class="row"><button class="btn ${revealed?'sec':'ok'}" id="nxt">${i<items.length-1?'التالي ←':'النتيجة 🏁'}</button></div>`;
   $('#nxt').onclick=()=>{i++;draw()};$('#nxt').focus({preventScroll:true});
   setTimeout(()=>$('#nextbox').scrollIntoView({behavior:'smooth',block:'nearest'}),80)};
  keyH=null;
  if(P.voice&&!o.timed)setTimeout(()=>{if(!locked)speak([it.story,it.q||defaultQ(it)].filter(Boolean).join('. '))},250);
  try{(W[it.k]||W.num)(it,ctx)}catch(e){console.error(e,it);say('⚠️ حدث خطأ في هذا التمرين، اضغطي التالي');finish(true)}
  if(!$('#msg').innerHTML)say(it.story?'اقرئي القصة جيداً ثم أجيبي 📖':pick(['هيا نفكّر معاً 💭','أنا متأكدة أنكِ تستطيعين! 💪','خذي وقتكِ 🌱']));
 };
 const endSet=()=>{if(o.timed)return o.onEnd&&o.onEnd();if(o.mission)markMission();const got=res.reduce((a,b)=>a+(b||0),0),max=items.length*3,pct=max?got/max:0;
  if(pct>=.5){SND.win();confetti()}
  showOv(`<div class="big">${pct>=.85?'🏆':pct>=.5?'🌟':'💪'}</div><h2>${pct>=.85?'أداء مذهل!':pct>=.5?'أحسنتِ!':'محاولة جيدة!'}</h2>
   <p style="font-size:22px;margin:4px 0">⭐ ${AR(got)} من ${AR(max)}</p><p class="muted">${pct>=.85?'أنتِ بطلة الرياضيات 🦉':pct>=.5?'استمرّي، أنتِ تتقدّمين بسرعة!':'أعيدي المحاولة، وستتحسّن نتيجتكِ'}</p>
   <div class="row"><button class="btn sec" id="again">أعيدي ⟲</button><button class="btn ok" id="fin">تمّ ✔</button></div>`);
  $('#again').onclick=()=>{closeOv();i=0;res.length=0;if(o.practice&&o.lesson)o.items=genItems(o.lesson,10);draw()};$('#fin').onclick=()=>{closeOv();back()}};
 draw();
}
let keyH=null;document.addEventListener('keydown',e=>{if(keyH)keyH(e)});
function defaultQ(it){switch(it.k){case 'cmp':return 'قارني بين العددين، وضعي الرمز المناسب (&gt; ، &lt; ، =):';case 'cmpf':return 'قارني بين الكسرين:';case 'ord':case 'ordf':return it.q||(it.d==='asc'?'رتّبي من الأصغر إلى الأكبر:':'رتّبي من الأكبر إلى الأصغر:');case 'ordtext':return it.q;case 'add':return 'أجدي ناتج الجمع:';case 'sub':return 'أجدي ناتج الطرح:';case 'mul':return 'أجدي ناتج الضرب:';case 'puz':return 'ضعي العدد المناسب في المربّعات:';case 'multi':return it.q;case 'clockread':return 'اقرئي الساعة، ما الوقت الذي تشير إليه؟';case 'frac':return it.q;default:return it.q||''}}

// ================= تحدّي الدقيقة =================
function timed(l){const c=chapterOf(l);let score=0,left=60,timer=null,started=false;
 app.innerHTML=`<div class="top"><button class="icon-btn" id="bk">→</button><span class="ttl">تحدّي الدقيقة ⏱️</span></div><div class="sheet" style="text-align:center"><div class="owl bob" style="font-size:70px">🦉</div><h2>كم سؤالاً تحلّين في ٦٠ ثانية؟</h2><p class="muted">كل إجابة صحيحة من أول مرة = نقطة</p><div class="row"><button class="btn sun" id="st">ابدئي! 🚀</button></div></div>`;
 $('#bk').onclick=back;
 $('#st').onclick=()=>{const items=Array.from({length:60},()=>quickItem(l));
  const end=()=>{clearInterval(timer);keyH=null;CLEAN=null;const best=Math.max(P.best[l.id]||0,score);const rec=score>(P.best[l.id]||0);P.best[l.id]=best;save();SND.win();if(score>0)confetti();
   showOv(`<div class="big">⏱️</div><h2>${rec&&score?'رقم قياسي جديد! 🎉':'انتهى الوقت!'}</h2><p style="font-size:26px;margin:4px 0">${AR(score)} إجابة صحيحة</p><p class="muted">أفضل نتيجة: ${AR(best)}</p><div class="row"><button class="btn sec" id="again">مرة أخرى ⟲</button><button class="btn ok" id="fin">تمّ ✔</button></div>`);
   $('#again').onclick=()=>{closeOv();timed(l)};$('#fin').onclick=()=>{closeOv();back()}};
  runSet({title:'تحدّي',items,color:c.color,timed:true,onAnswer:ok=>{if(ok)score++;const t=$('#tm');if(t)t.textContent=`✔ ${AR(score)}`},onEnd:end});
  const addTimer=()=>{const top=$('.top');if(top&&!$('#tl')){top.insertAdjacentHTML('beforeend',`<span class="pill timer" id="tl">⏱ ${AR(left)}</span><span class="pill" id="tm">✔ ${AR(score)}</span>`)}};
  addTimer();const mo=new MutationObserver(addTimer);mo.observe(app,{childList:true});
  timer=setInterval(()=>{left--;const t=$('#tl');if(t)t.textContent='⏱ '+AR(left);if(left<=0){mo.disconnect();CLEAN=null;end()}},1000);
  CLEAN=()=>{clearInterval(timer);mo.disconnect();keyH=null};};
}

// ================= نافذة واحتفال =================
function showOv(h){$('#winbox').innerHTML=h;$('#ov').classList.add('show')}
function closeOv(){$('#ov').classList.remove('show')}
function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const E=['⭐','🎉','✨','🌟','🎈','💛','🦉'];for(let i=0;i<26;i++){const d=document.createElement('div');d.className='conf';d.textContent=pick(E);d.style.left=Math.random()*100+'vw';d.style.animationDuration=(1.6+Math.random()*1.6)+'s';d.style.animationDelay=Math.random()*.4+'s';document.body.appendChild(d);setTimeout(()=>d.remove(),3800)}}

// ================= زر الرجوع في أندرويد =================
document.addEventListener('DOMContentLoaded',()=>{});
(function(){try{const A=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;if(A)A.addListener('backButton',()=>{if(!back()){A.exitApp()}})}catch(e){}})();
window.addEventListener('popstate',()=>{});

NAV=[home];home();
