const assert=require('node:assert/strict');
const createDeck=require('../deck.js');
const ids=Array.from({length:500},(_,i)=>String(i));
let value=null;const storage={getItem:()=>value,setItem:(_,v)=>value=v};
let deck=createDeck(ids,storage),seen=[];
assert.deepEqual(deck.progress(),{seen:0,remaining:500,total:500});
assert.equal(value,null,'Reading progress must not consume or save a word');
for(let i=0;i<500;i++){
 if(i%17===0)deck=createDeck(ids,storage);
 assert.deepEqual(deck.progress(),{seen:i,remaining:500-i,total:500});
 seen.push(deck.take());
 assert.deepEqual(deck.progress(),{seen:i+1,remaining:499-i,total:500});
}
assert.equal(new Set(seen).size,500);
deck=createDeck(ids,storage);
assert.deepEqual(deck.progress(),{seen:500,remaining:0,total:500},'Exhausted progress survives reload until next draw');
assert.notEqual(deck.take(),seen.at(-1));
assert.deepEqual(deck.progress(),{seen:1,remaining:499,total:500});
const second=[JSON.parse(value).last,...Array.from({length:499},()=>deck.take())];assert.equal(new Set(second).size,500);
const denied={getItem(){throw Error('denied')},setItem(){throw Error('denied')}};
const fallback=createDeck(ids,denied);
assert.equal(new Set(Array.from({length:500},()=>fallback.take())).size,500);
assert.deepEqual(fallback.progress(),{seen:500,remaining:0,total:500});
value='invalid json';deck=createDeck(ids,storage);
assert.deepEqual(deck.progress(),{seen:0,remaining:500,total:500});assert(ids.includes(deck.take()));
value=JSON.stringify({signature:ids.join('|'),remaining:['0','0']});deck=createDeck(ids,storage);
assert.deepEqual(deck.progress(),{seen:0,remaining:500,total:500});assert(ids.includes(deck.take()));
console.log('PASS: 500 unique per cycle, exact progress, two cycles, reload persistence, no boundary repeat, unavailable/corrupt storage recovery');
