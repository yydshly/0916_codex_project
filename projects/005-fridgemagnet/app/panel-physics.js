/* Small, bounded spring model shared by pointer and keyboard interactions. */
(function (root) {
  'use strict';
  const profiles = {
    fridge: {spring:310,damping:23,roll:3,lift:19,tilt:4,bounce:10,frequency:180},
    cork: {spring:115,damping:9,roll:11,lift:13,tilt:3,bounce:5,frequency:330},
    blueprint: {spring:380,damping:32,roll:0,lift:8,tilt:0,bounce:2,frequency:660},
    gallery: {spring:155,damping:24,roll:1,lift:21,tilt:3,bounce:6,frequency:440},
    glass: {spring:150,damping:16,roll:4,lift:24,tilt:11,bounce:9,frequency:880},
    play: {spring:200,damping:10,roll:7,lift:22,tilt:5,bounce:17,frequency:240}
  };
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  function step(position,velocity,dt,profile){
    // Bound frame gaps (e.g. background tabs), then use small integration steps.
    let remaining=clamp(dt,0,.04);
    while(remaining>0){const h=Math.min(remaining,1/240);velocity+=(-profile.spring*position-profile.damping*velocity)*h;position+=velocity*h;remaining-=h;}
    return {position,velocity};
  }
  function snap(theme,x,y){
    if(theme==='blueprint')return {x:Math.round(x/20)*20,y:Math.round(y/20)*20};
    if(theme==='fridge'&&Math.hypot(x,y)<25)return {x:0,y:0};
    return {x,y};
  }
  const api=Object.freeze({profiles,clamp,step,snap});
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.PanelPhysics=api;
})(typeof window==='undefined'?globalThis:window);
