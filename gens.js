// ===== مولّدات «تدرّب أكثر» — تمارين جديدة في كل مرة =====
'use strict';
const n4=()=>rnd(1000,9999);
function addNoCarry(k){for(;;){const a=rnd(1000,8999),b=rnd(1000,9999-a);const ok=[0,1,2,3].every(c=>Math.floor(a/10**c)%10+Math.floor(b/10**c)%10<10);if(ok&&(k||1))return [a,b]}}
function subNoBorrow(){for(;;){const a=rnd(2000,9999),b=rnd(1000,a-1);if([0,1,2,3].every(c=>Math.floor(a/10**c)%10>=Math.floor(b/10**c)%10))return [a,b]}}
function subBorrow(){for(;;){const a=rnd(2000,9999),b=rnd(1000,a-1);if([0,1,2,3].some(c=>Math.floor(a/10**c)%10<Math.floor(b/10**c)%10))return [a,b]}}
const fact=(t)=>{const b=t||rnd(2,10),a=rnd(1,10);return Math.random()<.5?[a,b]:[b,a]};
const months=['محرّم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوّال','ذو القعدة','ذو الحجة'];
const ord_=['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر','الحادي عشر','الثاني عشر'];
const GEN={
 thousands:()=>pick([()=>{const k=rnd(1,9);return {k:'num',q:'كم يساوي العدد الذي تمثّله المكعبات؟',v:{t:'blocks',n:k*1000},a:k*1000}},()=>{const k=rnd(1,9);return {k:'num',q:`${AR(k)} ألوف = ؟ مئة`,a:k*10}},()=>{const k=rnd(1,9);return {k:'num',q:`${AR(k)} ألوف = ؟ عشرة`,a:k*100}}])(),
 blocksRead:()=>{const n=rnd(1000,4999);return {k:'num',q:'اكتبي العدد الذي يمثّله النموذج',v:{t:'blocks',n},a:n}},
 placeValue:()=>{const n=n4();return pick([{k:'pv',n,d:rnd(0,3)},{k:'expand',n}])},
 readWrite:()=>{const n=n4();return pick([{k:'num',q:`اكتبي بالأرقام: ${words(n)}`,a:n},{k:'read',n},{k:'pvfill',n}])},
 compare:()=>{const a=n4();const b=pick([a+rnd(1,9),a-rnd(1,9)*10,a+rnd(1,9)*100,a,Number(String(a).split('').reverse().join(''))]);return {k:'cmp',x:a,y:Math.min(9999,Math.max(1000,b))}},
 order:()=>{const s=new Set();const base=rnd(1000,8000);while(s.size<3)s.add(base+rnd(0,999));return {k:'ord',n:[...s],d:pick(['asc','desc'])}},
 round:()=>pick([{k:'round',n:rnd(11,989),to:10},{k:'round',n:rnd(101,9899),to:100}]),
 props:()=>{const a=rnd(2,40),b=rnd(2,40),c=rnd(2,30);return pick([{k:'num',q:`${AR(a)} + ؟ = ${AR(b)} + ${AR(a)}`,a:b},{k:'num',q:`(${AR(a)} + ${AR(b)}) + ${AR(c)} = ${AR(a)} + (؟ + ${AR(c)})`,a:b},{k:'num',q:`${AR(a)} + ${AR(b)} + ${AR(c)} = ؟`,a:a+b+c}])},
 estimate:()=>pick([{k:'est',n:[rnd(11,99),rnd(11,99)],to:10},{k:'est',n:[rnd(101,899),rnd(101,899)],to:100}]),
 add4:()=>({k:'add',n:addNoCarry()}),
 add4c:()=>{for(;;){const a=rnd(1000,7999),b=rnd(1000,9999-a);if([0,1,2].some(c=>Math.floor(a/10**c)%10+Math.floor(b/10**c)%10>=10))return {k:'add',n:[a,b]}}},
 add3:()=>{for(;;){const a=rnd(1000,4000),b=rnd(1000,3500),c=rnd(100,9999-a-b);if(c>0&&a+b+c<=9999)return {k:'add',n:[a,b,c]}}},
 sub4:()=>({k:'sub',n:subNoBorrow()}),
 sub4c:()=>({k:'sub',n:subBorrow()}),
 sub0:()=>{const a=pick([rnd(1,9)*1000,rnd(1,9)*1000+rnd(1,9),rnd(2,9)*100,rnd(1,9)*1000+rnd(1,9)*10]);const b=rnd(Math.floor(a/4),a-1);return {k:'sub',n:[a,b]}},
 addsub:()=>Math.random()<.5?{k:'add',n:addNoCarry(),check:true}:{k:'sub',n:subBorrow(),check:true},
 pattern:()=>{const st=pick([10,100,1000,20,50,25]),sg=pick([1,-1]),start=sg>0?rnd(1000,5000):rnd(6000,9000);const seq=Array.from({length:5},(_,i)=>start+sg*st*i);const blanks=shuffle([2,3,4]).slice(0,2);return Math.random()<.6?{k:'pat',seq:seq.map((v,i)=>blanks.includes(i)?null:v)}:(()=>{const a=rnd(3000,9000),x=rnd(100,a-1000);return pick([{k:'num',q:`${AR(a)} − ☐ = ${AR(a-x)}`,a:x},{k:'num',q:`☐ + ${AR(x)} = ${AR(a)}`,a:a-x}])})()},
 barMake:()=>{const set=pick([['🍎 تفاح','🍌 موز','🍇 عنب'],['⚽ كرة القدم','🏀 السلة','🏐 الطائرة'],['🐱 قطة','🐶 كلب','🐰 أرنب']]);return {k:'barmake',title:'مثّلي البيانات',cats:set,vals:set.map(()=>rnd(1,8)),max:8,horiz:Math.random()<.4}},
 barRead:()=>{const cats=pick([['🍎 تفاح','🍌 موز','🍇 عنب'],['🚗 سيارات','🚲 درّاجات','🚌 حافلات'],['🌹 جوري','🌻 دوار الشمس','🌷 توليب']]);const vals=shuffle([2,3,4,5,6,7,8,9]).slice(0,3);const v={t:'bar',title:'التمثيل بالأعمدة',cats,vals,max:10};const i=rnd(0,2),j=(i+1)%3;
  return pick([{k:'num',q:`ما عدد «${cats[i]}»؟`,v,a:vals[i]},{k:'num',q:`كم يزيد «${cats[vals[i]>vals[j]?i:j]}» على «${cats[vals[i]>vals[j]?j:i]}»؟`,v,a:Math.abs(vals[i]-vals[j])},{k:'num',q:`ما مجموع «${cats[i]}» و «${cats[j]}»؟`,v,a:vals[i]+vals[j]},{k:'mcq',q:'أيّها الأكثر؟',v,o:cats,a:vals.indexOf(Math.max(...vals)),shuffle:false}])},
 length:()=>pick([()=>{const k=rnd(2,9);return {k:'num',q:`${AR(k*100)} سم = ؟ م`,a:k}},()=>{const k=rnd(2,9);return {k:'num',q:`${AR(k)} كم = ؟ م`,a:k*1000}},()=>{const k=rnd(2,9);return {k:'num',q:`${AR(k*1000)} م = ؟ كم`,a:k}},()=>{const it=pick([['طول ممحاة','سم',0],['طول ملعب كرة القدم','م',1],['المسافة بين بغداد والبصرة','كم',2],['طول قلم تلوين','سم',0],['ارتفاع شجرة نخيل','م',1]]);return {k:'mcq',q:`الوحدة المناسبة لقياس ${it[0]}:`,o:['سم','م','كم'],a:it[2],shuffle:false}}])(),
 mass:()=>pick([()=>{const k=rnd(2,9);return {k:'num',q:`${AR(k)} كغم = ؟ غم`,a:k*1000}},()=>{const k=rnd(2,9);return {k:'num',q:`${AR(k*1000)} غم = ؟ كغم`,a:k}},()=>{const it=pick([['ممحاة','غم'],['بطيخة كبيرة','كغم'],['قلم','غم'],['خروف','كغم'],['ملعقة','غم'],['كيس طحين','كغم']]);return {k:'mcq',q:`الوحدة المناسبة لقياس كتلة ${it[0]}:`,o:['غم','كغم'],a:it[1]==='غم'?0:1,shuffle:false}}])(),
 capacity:()=>pick([()=>{const k=rnd(2,9);return {k:'num',q:`${AR(k)} لتر = ؟ مللتر`,a:k*1000}},()=>{const k=rnd(2,9);return {k:'num',q:`${AR(k*1000)} مللتر = ؟ لتر`,a:k}}])(),
 clock:()=>{const h=rnd(1,12),m=rnd(1,59);return Math.random()<.5?{k:'clockread',h,m}:{k:'clockset',h,m}},
 hijri:()=>{const i=rnd(0,11);const t=rnd(0,2);const ans=t===0?months[i]:t===1?months[(i+1)%12]:months[(i+11)%12];const q=t===0?`الشهر ${ord_[i]} في السنة الهجرية هو`:t===1?`الشهر الذي يأتي بعد ${months[i]} هو`:`الشهر الذي يأتي قبل ${months[i]} هو`;const o=[ans];while(o.length<4){const m=pick(months);if(!o.includes(m))o.push(m)}return {k:'mcq',q,o,a:0}},
 angles:()=>{const deg=pick([30,45,60,75,90,90,110,130,150]);return {k:'mcq',q:'حدّدي نوع الزاوية:',v:{t:'angle',deg},o:['زاوية قائمة','أصغر من القائمة','أكبر من القائمة'],a:deg===90?0:deg<90?1:2,shuffle:false}},
 perimeter:()=>{const w=rnd(2,6),h=rnd(1,5);return Math.random()<.5?{k:'num',q:'أجدي محيط الشكل:',v:{t:'rectlab',w,h,u:'سم'},a:2*(w+h),unit:'سم'}:{k:'num',q:'أجدي محيط الشكل (بالوحدات):',v:{t:'grid',w:w+2,h:h+2,cells:Array.from({length:w*h},(_,i)=>[1+i%w,1+Math.floor(i/w)])},a:2*(w+h)}},
 area:()=>{const w=7,h=5,s=new Set();const n=rnd(5,12);let x=rnd(1,4),y=rnd(1,2);s.add(x+','+y);while(s.size<n){const d=pick([[1,0],[-1,0],[0,1],[0,-1]]);x=Math.min(w-1,Math.max(0,x+d[0]));y=Math.min(h-1,Math.max(0,y+d[1]));s.add(x+','+y)}const cells=[...s].map(p=>p.split(',').map(Number));return Math.random()<.7?{k:'num',q:'أجدي مساحة الشكل (بالوحدات المربّعة):',v:{t:'grid',w,h,cells},a:cells.length}:(()=>{const a=rnd(5,14);return {k:'areamake',w,h,a,q:`لوّني مربّعات لتكوّني شكلاً مساحته ${AR(a)} وحدات مربّعة`}})()},
 volume:()=>{const r=rnd(1,2),c=rnd(2,4);const hm=Array.from({length:r},()=>Array.from({length:c},()=>rnd(1,3)));return {k:'num',q:'أجدي حجم المجسّم (عدد المكعّبات):',v:{t:'iso',hm},a:hm.flat().reduce((a,b)=>a+b,0)}},
 fracRead:()=>{const d=rnd(2,10),s=rnd(1,d);return {k:'frac',q:'اقرئي الكسر الذي يمثّله الجزء الملوّن:',v:pick([{t:'fbar',d,s},{t:'fcircle',d,s},{t:'fset',d,s,ic:pick(['⭐','🔵','🍎','🌸'])}]),a:{n:s,d},exact:true}},
 fracEq:()=>{const d=pick([2,3,4,5]),n=rnd(1,d-1),k=pick([2,3]);const miss=rnd(2,3);return {k:'num',qf:[[n,d],'=',miss===2?[null,d*k]:[n*k,null]],miss,q:'اكتبي العدد المناسب في ☐',a:miss===2?n*k:d*k,v:{t:'fpair',a:[d,n],b:[d*k,n*k]}}},
 fracCmp:()=>{const d=rnd(3,10);let a=rnd(1,d),b=rnd(1,d);return {k:'cmpf',x:{n:a,d},y:{n:b,d}}},
 fracOrd:()=>{const d=rnd(4,10);const s=new Set();while(s.size<3)s.add(rnd(1,d));return {k:'ordf',n:[...s].map(n=>({n,d})),d:pick(['asc','desc'])}},
 fracAdd:()=>{const d=rnd(3,10),a=rnd(1,d-1),b=rnd(1,d-a);return {k:'frac',q:`${AR(a)}/${AR(d)} + ${AR(b)}/${AR(d)} = ؟`,qf:[[a,d],'+',[b,d]],v:{t:'faddbar',d,a,b},a:{n:a+b,d}}},
 fracSub:()=>{const d=rnd(3,10),a=rnd(2,d),b=rnd(1,a-1);return {k:'frac',q:`${AR(a)}/${AR(d)} − ${AR(b)}/${AR(d)} = ؟`,qf:[[a,d],'−',[b,d]],v:{t:'fsubbar',d,a,b},a:{n:a-b,d}}},
 mul01:()=>{const a=rnd(1,30),z=pick([0,1]);return Math.random()<.5?{k:'num',q:`${AR(a)} × ${AR(z)} = ؟`,a:a*z}:{k:'num',q:`${AR(z)} × ${AR(a)} = ؟`,a:a*z}},
 mul6:()=>mulFact(6),mul7:()=>mulFact(7),mul8:()=>mulFact(8),mul9:()=>mulFact(9),mul10:()=>mulFact(10),
 mul2d:()=>{for(;;){const b=rnd(2,4),a=rnd(11,49);if(Math.floor(a/10)*b<10&&(a%10)*b<10)return {k:'mul',n:[a,b]}}},
 mul3:()=>{const a=rnd(1,5),b=rnd(1,5),c=rnd(1,5);return Math.random()<.6?{k:'num',q:`${AR(a)} × ${AR(b)} × ${AR(c)} = ؟`,a:a*b*c}:{k:'num',q:`${AR(a)} × ☐ × ${AR(c)} = ${AR(a*b*c)}`,a:b}},
 divMeaning:()=>{const b=rnd(2,5),q=rnd(2,5);return pick([{k:'num',q:`${AR(b*q)} ÷ ${AR(b)} = ؟`,v:{t:'share',n:b*q,g:b},a:q},{k:'num',q:`استعملي الطرح المتكرّر: ${AR(b*q)} ÷ ${AR(b)} = ؟`,v:{t:'repsub',a:b*q,b},a:q}])},
 divFam:()=>({k:'family',a:rnd(2,9),b:rnd(2,9)}),
 divFacts:()=>{const b=rnd(2,9),q=rnd(1,9);return pick([{k:'num',q:`${AR(b*q)} ÷ ${AR(b)} = ؟`,a:q},{k:'num',q:'أجدي ناتج القسمة:',v:{t:'ldiv',a:b*q,b},a:q},{k:'num',q:`${AR(b*q)} ÷ ☐ = ${AR(q)}`,a:b}])},
 divRules:()=>{const n=rnd(1,50);return pick([{k:'num',q:`${AR(n)} ÷ ${AR(n)} = ؟`,a:1},{k:'num',q:`${AR(n)} ÷ ١ = ؟`,a:n},{k:'num',q:`٠ ÷ ${AR(n)} = ؟`,a:0}])}
};
function mulFact(t){const a=rnd(1,10);const sw=Math.random()<.5;return pick([{k:'num',q:sw?`${AR(t)} × ${AR(a)} = ؟`:`${AR(a)} × ${AR(t)} = ؟`,a:a*t},{k:'mul',n:[t,a]},{k:'num',q:`${AR(t)} × ☐ = ${AR(a*t)}`,a:a}])}
function genItems(l,count){const g=GEN[l.gen];const out=[];if(g){for(let i=0;i<count;i++){try{out.push(g())}catch(e){console.error(e)}}}
 else{const pool=l.ex.concat(l.wb||[]);for(let i=0;i<count;i++)out.push(pick(pool))}
 return out}
// تمارين سريعة للتحدّي (أنواع قصيرة فقط)
function quickItem(l){const quick=['num','mcq','cmp','cmpf','round'];for(let t=0;t<20;t++){const it=GEN[l.gen]?GEN[l.gen]():pick(l.ex);if(quick.includes(it.k)&&!(it.v&&it.v.t==='repsub'))return it}
 const pool=l.ex.filter(i=>quick.includes(i.k));return pool.length?pick(pool):pick(l.ex)}
