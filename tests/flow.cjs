const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let saved=null;const storage={getItem:()=>saved,setItem:(_,v)=>saved=v};
function load(){
 const ctx={setTransform(){},clearRect(){}};
 const canvas={getContext:()=>ctx,getBoundingClientRect:()=>({width:900,height:500}),clientWidth:900,clientHeight:500,addEventListener(){},toDataURL:()=>''};
 const control={addEventListener(){},style:{}};
 const element={innerHTML:'',querySelectorAll:()=>[],querySelector:s=>s==='canvas'?canvas:control};
 const c={window:{localStorage:storage,scrollTo(){}},document:{querySelector:s=>s==='#app'?element:null},ResizeObserver:class{observe(){}disconnect(){}},confirm:()=>true,console};vm.createContext(c);
 vm.runInContext(fs.readFileSync('data.js','utf8'),c);vm.runInContext(fs.readFileSync('deck.js','utf8'),c);
 const appSource=fs.readFileSync('app.js','utf8');
 const instrumented=appSource.replace('render();\n})();','window.test={act,state,progress:()=>deck.progress()};render();\n})();');
 assert.notEqual(instrumented,appSource,'App test hook must be installed');
 vm.runInContext(instrumented,c);
 return c.window.test;
}
function progress(t,seen){assert.equal(t.progress().seen,seen);assert.equal(t.progress().remaining,500-seen);assert.equal(t.progress().total,500)}
let t=load();progress(t,0);t.act('begin');progress(t,1);
const seen=[t.state.current.id];
for(let i=1;i<500;i++){
 // First 25 full drawing rounds prove there is no automatic 3/6/12-round finish.
 if(i<=25||i%7===0){
  const id=t.state.current.id;
  t.act('draw');assert.equal(t.state.page,'draw');progress(t,i);
  t.act('reveal');assert.equal(t.state.page,'reveal');assert.equal(t.state.current.id,id);progress(t,i);
  t.act('next');assert.equal(t.state.page,'handoff');assert.equal(t.state.current,null);progress(t,i);
  t.act('ready');
 }else if(i%43===0){t=load();progress(t,i);t.act('begin')}
 else if(i%19===0){t.act('end');assert.equal(t.state.page,'finish');progress(t,i);t.act('restart');progress(t,i);t.act('begin')}
 else {t.act('skip')}
 assert.equal(t.state.page,'private');progress(t,i+1);seen.push(t.state.current.id);
}
assert.equal(new Set(seen).size,500);
t.act('end');assert.equal(t.state.page,'finish');progress(t,500);
t=load();progress(t,500);t.act('begin');progress(t,1);
assert(seen.includes(t.state.current.id));assert.notEqual(t.state.current.id,seen.at(-1));
console.log('PASS: actual app exceeds 12 drawing rounds, explicit exit, 500-word skips/draw/reveal/handoff/restart/reload flow, exact progress and cycle reset');
