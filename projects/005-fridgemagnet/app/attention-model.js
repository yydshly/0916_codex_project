(function(root){
  'use strict';
  const levels=['focus','important','later'];
  function create(ids){return Object.fromEntries(ids.map((id,i)=>[id,i===0?'focus':i<3?'important':'later']));}
  function change(state,id,level){
    if(!Object.hasOwn(state,id)||!levels.includes(level))throw new Error('Unknown card or attention level');
    const next={...state};
    if(level==='focus')for(const key of Object.keys(next))if(next[key]==='focus')next[key]='important';
    next[id]=level;return next;
  }
  function group(cards,state){return Object.fromEntries(levels.map(level=>[level,cards.filter(card=>state[card.id]===level)]));}
  const api={create,change,group};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.AttentionModel=api;
})(typeof window==='undefined'?globalThis:window);
