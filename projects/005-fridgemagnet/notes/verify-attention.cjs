'use strict';
const assert=require('node:assert/strict');
const {create,change,group}=require('../app/attention-model.js');
const cards=Array.from({length:6},(_,i)=>({id:`card-${i}`}));
const original=create(cards.map(c=>c.id));
assert.deepEqual(Object.values(group(cards,original)).map(items=>items.length),[1,2,3]);
let state=change(original,'card-5','focus');
assert.equal(original['card-0'],'focus','changes do not mutate undo snapshots');
assert.equal(state['card-0'],'important','old focus remains visible in important');
assert.equal(state['card-5'],'focus');
for(const card of cards)for(const level of ['focus','important','later']){
  state=change(state,card.id,level);
  const groups=group(cards,state),all=Object.values(groups).flat();
  assert.ok(groups.focus.length<=1);
  assert.equal(all.length,cards.length);
  assert.equal(new Set(all.map(c=>c.id)).size,cards.length,'every card remains reachable exactly once');
}
for(const card of cards)state=change(state,card.id,'later');
assert.equal(group(cards,state).focus.length,0,'no focus is allowed');
assert.equal(group(cards,state).later.length,6);
state=change(state,'card-2','focus');
assert.equal(group(cards,state).focus[0].id,'card-2','a deferred card can return to focus');
assert.throws(()=>change(state,'missing','focus'));
assert.throws(()=>change(state,'card-0','urgent'));
console.log('PASS: three attention tiers, single-focus rule, immutable snapshots, no lost or duplicated cards, empty focus, restoring deferred cards, invalid input.');
