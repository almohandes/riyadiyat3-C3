// ===== النواة: أدوات مشتركة =====
'use strict';
const DIG='٠١٢٣٤٥٦٧٨٩';
function AR(n){return String(n).replace(/\d/g,d=>DIG[d]).replace(/-/g,'−')}
function EN(s){return String(s).replace(/[٠-٩]/g,d=>DIG.indexOf(d))}
const $=s=>document.querySelector(s);
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function fr(n,d,cls){return `<span class="fr ${cls||''}"><b>${n===null||n===undefined?'<u class="q">☐</u>':AR(n)}</b><i>${d===null||d===undefined?'<u class="q">☐</u>':AR(d)}</i></span>`}
// يحوّل "٣/٥" في النص إلى كسر عمودي
function fmt(s){if(s===undefined||s===null)return '';return String(s).replace(/([٠-٩]+)\/([٠-٩]+)/g,(m,a,b)=>`<span class="fr"><b>${a}</b><i>${b}</i></span>`)}
function roundTo(n,to){return Math.floor((n+to/2)/to)*to}

// ===== البيانات =====
const BOOK={chapters:[]};
function CH(c){c.lessons.forEach(l=>{l.ch=c.n;l.wb=l.wb||[]});BOOK.chapters.push(c)}
function findLesson(id){for(const c of BOOK.chapters)for(const l of c.lessons)if(l.id===id)return l;return null}
function WB(id,items){const l=findLesson(id);if(l)l.wb=items;else console.warn('WB: no lesson',id)}

// ===== التخزين =====
const STORE='riyadiyat3_v1';
let P={name:'',stars:{},seen:{},sound:true,voice:true,streak:0,best:{},redo:[],lastDay:'',log:{}};
try{const s=JSON.parse(localStorage.getItem(STORE)||'null');if(s)P=Object.assign(P,s)}catch(e){}
function save(){try{localStorage.setItem(STORE,JSON.stringify(P))}catch(e){}}
function setStar(key,s){if((P.stars[key]||0)<s){P.stars[key]=s;save()}}
function totalStars(){return Object.values(P.stars).reduce((a,b)=>a+b,0)}

// ===== الأصوات =====
let AC=null;
function tone(f,d=.12,type='sine',delay=0,vol=.16){if(!P.sound)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(vol,AC.currentTime+delay);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+delay+d);o.connect(g);g.connect(AC.destination);o.start(AC.currentTime+delay);o.stop(AC.currentTime+delay+d+.02)}catch(e){}}
const SND={tap:()=>tone(520,.05,'sine',0,.08),ok:()=>{tone(660);tone(880,.15,'sine',.08)},bad:()=>tone(190,.22,'triangle'),
 win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.22,'triangle',i*.12)),step:()=>tone(740,.07,'sine',0,.1)};

// ===== القراءة بالصوت =====
function plain(html){const d=document.createElement('div');d.innerHTML=String(html).replace(/<span class="fr[^"]*"><b>([^<]*)<\/b><i>([^<]*)<\/i><\/span>/g,' $1 على $2 ');return d.textContent.replace(/[☐؟]/g,' ').replace(/\s+/g,' ').trim()}
async function speak(html){
 const text=plain(html);if(!text)return;
 try{const T=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.TextToSpeech;
  if(T){try{await T.stop()}catch(e){}await T.speak({text,lang:'ar-SA',rate:0.9,pitch:1.1,volume:1,category:'playback'});return}}catch(e){}
 try{if('speechSynthesis' in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ar-SA';u.rate=.9;u.pitch=1.1;
  const v=speechSynthesis.getVoices().find(v=>/^ar/i.test(v.lang));if(v)u.voice=v;speechSynthesis.speak(u)}}catch(e){}
}
function stopSpeak(){try{const T=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.TextToSpeech;if(T)T.stop()}catch(e){}try{speechSynthesis&&speechSynthesis.cancel()}catch(e){}}

// ===== كتابة العدد بالكلمات (حتى ٩٩٩٩) =====
function words(n){
 if(n===0)return 'صفر';
 const U=['','واحد','اثنان','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة'];
 const T=['','عشرة','عشرون','ثلاثون','أربعون','خمسون','ستون','سبعون','ثمانون','تسعون'];
 const H=['','مئة','مئتان','ثلاثمئة','أربعمئة','خمسمئة','ستمئة','سبعمئة','ثمانمئة','تسعمئة'];
 const K=['','ألف','ألفان','ثلاثة آلاف','أربعة آلاف','خمسة آلاف','ستة آلاف','سبعة آلاف','ثمانية آلاف','تسعة آلاف'];
 const th=Math.floor(n/1000),h=Math.floor(n/100)%10,r=n%100,parts=[];
 if(th)parts.push(K[th]);if(h)parts.push(H[h]);
 if(r){let s;if(r<10)s=U[r];else if(r===10)s='عشرة';else if(r===11)s='أحد عشر';else if(r===12)s='اثنا عشر';else if(r<20)s=U[r-10]+' عشر';
  else{const t=Math.floor(r/10),u=r%10;s=u?U[u]+' و'+T[t]:T[t]}parts.push(s)}
 return parts.join(' و');
}
