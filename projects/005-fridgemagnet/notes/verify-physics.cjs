'use strict';
// Non-browser checks of actual spring integration and placement rules.
const assert = require('node:assert/strict');
const {profiles,step,snap}=require('../app/panel-physics.js');
for(const [name,profile] of Object.entries(profiles)){
  for(const hz of [30,60,120]){
    let state={position:24,velocity:-80};
    for(let i=0;i<hz*3;i++){
      state=step(state.position,state.velocity,1/hz,profile);
      assert.ok(Number.isFinite(state.position)&&Number.isFinite(state.velocity),`${name}: finite at ${hz}Hz`);
      assert.ok(Math.abs(state.position)<40,`${name}: bounded displacement`);
    }
    assert.ok(Math.abs(state.position)<.01&&Math.abs(state.velocity)<.1,`${name}: settles at ${hz}Hz`);
  }
  let state={position:.13,velocity:0};
  for(let i=0;i<200;i++){state=step(state.position,state.velocity,1/60,profile);assert.ok(1-Math.abs(state.position)>.8,'card scale stays positive');}
  const paused=step(24,-80,5,profile),bounded=step(24,-80,.04,profile);
  assert.deepEqual(paused,bounded,'background frame gaps are bounded');
}
assert.deepEqual(snap('fridge',12,15),{x:0,y:0});
assert.deepEqual(snap('fridge',25,0),{x:25,y:0});
assert.deepEqual(snap('blueprint',37,-31),{x:40,y:-40});
assert.deepEqual(snap('glass',37,-31),{x:37,y:-31});
console.log('PASS: six spring profiles at 30/60/120Hz, convergence, scale bounds, frame-gap safety, magnetic threshold, grid rounding.');
