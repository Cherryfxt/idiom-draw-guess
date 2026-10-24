(function(root){
'use strict';
// A persisted shuffled deck: a word is consumed when it is shown, including skips.
function createDeck(ids,storage,random=Math.random){
 const key='idiom-draw-guess:shown-deck:v1', signature=ids.join('|');
 let memory=null;
 function read(){try{return JSON.parse(storage?.getItem(key)||'null')||memory}catch{return memory}}
 function valid(d){return d&&d.signature===signature&&Array.isArray(d.remaining)&&new Set(d.remaining).size===d.remaining.length&&d.remaining.every(id=>ids.includes(id))}
 function refill(last){const remaining=ids.slice();for(let i=remaining.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[remaining[i],remaining[j]]=[remaining[j],remaining[i]]}if(remaining.length>1&&remaining[0]===last)[remaining[0],remaining[1]]=[remaining[1],remaining[0]];return {signature,remaining,last}}
 return {take(){if(!ids.length)return null;let d=read();if(!valid(d))d=refill(null);else if(!d.remaining.length)d=refill(d.last);const id=d.remaining.shift();d.last=id;memory=d;try{storage?.setItem(key,JSON.stringify(d))}catch{}return id}};
}
if(typeof module==='object'&&module.exports)module.exports=createDeck;else root.createIdiomDeck=createDeck;
})(typeof window==='object'?window:globalThis);
