const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let saved=null;const storage={getItem:()=>saved,setItem:(_,v)=>saved=v};
function load(){
 const element={innerHTML:'',querySelectorAll:()=>[],querySelector:()=>({addEventListener(){}})};
 const c={window:{localStorage:storage,scrollTo(){}},document:{querySelector:s=>s==='#app'?element:null},confirm:()=>true,console};vm.createContext(c);
 vm.runInContext(fs.readFileSync('data.js','utf8'),c);vm.runInContext(fs.readFileSync('deck.js','utf8'),c);
 vm.runInContext(fs.readFileSync('app.js','utf8').replace('render();\n})();','window.test={act,state};render();\n})();'),c);
 return c.window.test;
}
let t=load();t.act('begin');let seen=[t.state.current.id];
for(let i=1;i<500;i++){
 if(i%43===0){t=load();t.act('begin')}
 else if(i%19===0){t.act('end');t.act('restart');t.act('begin')}
 else if(i%7===0){t.act('reveal');t.act('next');if(t.state.page==='finish'){t.act('restart');t.act('begin')}else{assert.equal(t.state.current,null);t.act('ready')}}
 else {const round=t.state.round;t.act('skip');assert.equal(t.state.round,round)}
 assert.equal(t.state.page,'private');seen.push(t.state.current.id);
}
assert.equal(new Set(seen).size,500);t.act('skip');assert(seen.includes(t.state.current.id));assert.notEqual(t.state.current.id,seen.at(-1));
console.log('PASS: actual 500-word app flow, skips + reveal/next + restart + reload, zero repeats before exhaustion, next cycle starts');
