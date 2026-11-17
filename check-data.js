// فحص سلامة بيانات الدروس قبل البناء: node tools/check-data.js
const fs=require('fs'),vm=require('vm'),path=require('path');
const www=path.join(__dirname,'..','www');
const ctx={console,Math,Intl,document:{querySelector:()=>null,documentElement:{style:{setProperty(){}}}},localStorage:{getItem:()=>null,setItem(){}},window:{},getComputedStyle:()=>({getPropertyValue:()=>'#3D8BFD'})};
vm.createContext(ctx);
const html=fs.readFileSync(path.join(www,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]).filter(s=>!s.endsWith('app.js'));
for(const s of scripts)vm.runInContext(fs.readFileSync(path.join(www,s),'utf8').replace(/^'use strict';/m,'').replace(/^const /gm,'var ').replace(/^let /gm,'var ').replace(/^function /gm,'function '),ctx,{filename:s});
const r=vm.runInContext(`(function(){const out=[];let n=0;
 BOOK.chapters.forEach(c=>{c.lessons.forEach(l=>{if(!l.teach.length)out.push('no teach '+l.id);['ex','wb'].forEach(s=>l[s].forEach((it,i)=>{n++;const id=l.id+'|'+s+'|'+i;
  if(!W[it.k])out.push(id+' kind '+it.k);if(it.v&&!V[it.v.t])out.push(id+' visual '+it.v.t);
  if(it.k==='num'&&!(Number.isInteger(it.a)&&it.a>=0))out.push(id+' answer '+it.a);
  if(it.k==='mcq'&&!(it.a>=0&&it.a<it.o.length))out.push(id+' mcq');
  if(it.k==='sub'&&it.n[0]<it.n[1])out.push(id+' sub<0');
  if(it.k==='add'&&it.n.reduce((a,b)=>a+b,0)>9999)out.push(id+' add>9999');}))});
  c.test.forEach(it=>{n++;if(!W[it.k])out.push('test kind '+it.k)})});
 Object.keys(GEN).forEach(g=>{for(let i=0;i<50;i++){const it=GEN[g]();if(!W[it.k])out.push('gen '+g+' kind '+it.k)}});
 return {n,out,lessons:BOOK.chapters.reduce((a,c)=>a+c.lessons.length,0)}})()`,ctx);
console.log(`الدروس: ${r.lessons} — التمارين: ${r.n}`);
if(r.out.length){console.error('مشكلات:\n'+r.out.join('\n'));process.exit(1)}
console.log('✔ كل البيانات سليمة');
