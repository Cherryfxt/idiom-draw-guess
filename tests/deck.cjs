const assert=require('node:assert/strict');
const createDeck=require('../deck.js');
const ids=Array.from({length:500},(_,i)=>String(i));
let value=null;const storage={getItem:()=>value,setItem:(_,v)=>value=v};
let deck=createDeck(ids,storage),seen=[];
for(let i=0;i<500;i++){if(i%17===0)deck=createDeck(ids,storage);seen.push(deck.take())}
assert.equal(new Set(seen).size,500);assert.notEqual(deck.take(),seen.at(-1));
const remaining=JSON.parse(value).remaining;assert.equal(remaining.length,499);
const second=[JSON.parse(value).last,...Array.from({length:499},()=>deck.take())];assert.equal(new Set(second).size,500);
const denied={getItem(){throw Error('denied')},setItem(){throw Error('denied')}};
const fallback=createDeck(ids,denied);assert.equal(new Set(Array.from({length:500},()=>fallback.take())).size,500);
value='invalid json';assert(ids.includes(createDeck(ids,storage).take()));
value=JSON.stringify({signature:ids.join('|'),remaining:['0','0']});assert(ids.includes(createDeck(ids,storage).take()));
console.log('PASS: 500 unique per cycle, two cycles, reload persistence, no immediate cycle-boundary repeat, unavailable/corrupt storage recovery');
