(function () {
  'use strict';
  const physics=window.PanelPhysics;
  const surface=document.querySelector('#fridge');
  const board=document.querySelector('#magnet-board');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton=document.querySelector('#motion-toggle');
  const soundButton=document.querySelector('#sound-toggle');
  const demoButton=document.querySelector('#feel-demo');
  const message=document.querySelector('#feel-message');
  const guide=document.createElement('div');
  guide.className='feel-guide';guide.setAttribute('aria-hidden','true');surface.append(guide);
  const hints={fridge:'拖离原位再靠近：松手时会吸回原位。',cork:'拿住图钉移动，松手看看纸卡的余摆。',blueprint:'拖动卡片，松手后会对齐 20 像素网格。',gallery:'移动鼠标追逐灯光，再拿起一幅小画。',glass:'在卡片上移动鼠标，观察倾斜与反光。',play:'拿起再放下，看看积木的挤压和回弹。'};
  const jobs=new Map();
  const fxNodes=new Set();
  let enabled=!reduced.matches,sound=false,audio=null,demoCancel=null,hoverFrame=0,hoverEl=null;
  const theme=()=>document.body.dataset.panelTheme||'fridge';
  const profile=()=>physics.profiles[theme()];
  const props=['--feel-x','--feel-y','--feel-z','--feel-roll','--feel-pitch','--feel-yaw','--feel-scale-x','--feel-scale-y'];
  function clear(el){for(const prop of props)el.style.removeProperty(prop);el.classList.remove('is-held','is-settling');}
  function stop(el){const job=jobs.get(el);if(job){cancelAnimationFrame(job.id);jobs.delete(el);}clear(el);}
  function set(el,name,value,unit=''){el.style.setProperty(`--feel-${name}`,`${value}${unit}`);}
  function stopDemo(){if(demoCancel){demoCancel();demoCancel=null;}demoButton.disabled=!enabled;}
  function stopAll(){stopDemo();for(const el of [...jobs.keys()])stop(el);if(hoverEl){clear(hoverEl);hoverEl=null;}cancelAnimationFrame(hoverFrame);hoverFrame=0;surface.classList.remove('feel-drag-active');fxNodes.forEach(node=>node.remove());fxNodes.clear();}
  function updateControls(){
    document.body.dataset.feel=enabled?'on':'off';
    motionButton.textContent=`动态反馈：${enabled?'开':'关'}`;motionButton.setAttribute('aria-pressed',String(enabled));
    demoButton.disabled=!enabled;
    message.textContent=enabled?hints[theme()]:'已关闭动态反馈，仍可拖动、吸附与展开卡片。';
  }
  function soundAtDrop(){
    if(!sound||!audio||audio.state!=='running')return;
    const time=audio.currentTime,osc=audio.createOscillator(),gain=audio.createGain();
    osc.type=theme()==='blueprint'?'sine':'triangle';
    osc.frequency.setValueAtTime(profile().frequency,time);osc.frequency.exponentialRampToValueAtTime(profile().frequency*.45,time+.09);
    gain.gain.setValueAtTime(.045,time);gain.gain.exponentialRampToValueAtTime(.001,time+.13);
    osc.connect(gain);gain.connect(audio.destination);osc.start(time);osc.stop(time+.14);
    osc.onended=()=>{osc.disconnect();gain.disconnect();};
  }
  function guideAt(el){
    if(theme()!=='blueprint')return;
    const a=el.getBoundingClientRect(),b=surface.getBoundingClientRect();
    surface.style.setProperty('--guide-x',`${a.left+a.width/2-b.left}px`);
    surface.style.setProperty('--guide-y',`${a.top+a.height/2-b.top}px`);
    surface.classList.add('feel-drag-active');
  }
  function pickup(el){
    stopDemo();stop(el);if(!enabled)return;
    el.classList.add('is-held');set(el,'z',profile().lift,'px');set(el,'scale-x',1.035);set(el,'scale-y',1.035);guideAt(el);
  }
  function drag(el,dx,dy,vx){
    if(!enabled)return;
    const p=profile();set(el,'roll',physics.clamp(vx*.016,-p.roll,p.roll),'deg');
    set(el,'pitch',physics.clamp(-dy*.028,-p.tilt,p.tilt),'deg');
    set(el,'yaw',physics.clamp(dx*.026,-p.tilt,p.tilt),'deg');guideAt(el);
  }
  function ring(el){
    if(theme()!=='glass')return;
    const a=el.getBoundingClientRect(),b=surface.getBoundingClientRect(),node=document.createElement('span');
    node.className='glass-ripple';node.setAttribute('aria-hidden','true');
    node.style.left=`${a.left+a.width/2-b.left}px`;node.style.top=`${a.top+a.height/2-b.top}px`;surface.append(node);fxNodes.add(node);
    node.addEventListener('animationend',()=>{fxNodes.delete(node);node.remove();},{once:true});
  }
  function settle(el,vx=0,vy=0,offset={x:0,y:0}){
    const initialRoll=parseFloat(el.style.getPropertyValue('--feel-roll'))||0;
    stop(el);surface.classList.remove('feel-drag-active');if(!enabled||!el.isConnected)return;
    const p=profile(),kind=theme();el.classList.add('is-settling');
    let x={position:offset.x,velocity:physics.clamp(vx*.045,-30,30)},y={position:offset.y-4,velocity:Math.min(physics.clamp(vy*.035,-30,30),0)-p.bounce*5};
    let roll={position:initialRoll|| (kind==='cork'?6:0),velocity:kind==='cork'?24:0};
    let squash={position:kind==='play'?.13:.015,velocity:0},z={position:p.lift,velocity:-50};
    const job={id:0},start=performance.now();let previous=start;jobs.set(el,job);
    soundAtDrop();ring(el);
    function frame(now){
      if(!el.isConnected){stop(el);return;}
      const dt=(now-previous)/1000;previous=now;
      x=physics.step(x.position,x.velocity,dt,p);y=physics.step(y.position,y.velocity,dt,p);roll=physics.step(roll.position,roll.velocity,dt,p);squash=physics.step(squash.position,squash.velocity,dt,p);z=physics.step(z.position,z.velocity,dt,p);
      set(el,'x',x.position,'px');set(el,'y',y.position,'px');set(el,'z',z.position,'px');set(el,'roll',roll.position,'deg');set(el,'scale-x',1+squash.position);set(el,'scale-y',1-squash.position);
      if(now-start>1700||(now-start>300&&Math.abs(x.position)+Math.abs(y.position)+Math.abs(roll.position)+Math.abs(z.position)<.15)){jobs.delete(el);clear(el);return;}
      job.id=requestAnimationFrame(frame);
    }
    job.id=requestAnimationFrame(frame);
  }
  function demo(){
    if(!enabled)return;stopAll();const el=board.querySelector('.magnet');if(!el)return;
    const kind=theme(),p=profile(),start=performance.now();let id=0;
    demoButton.disabled=true;el.classList.add('is-held');
    message.textContent=kind==='blueprint'?'先自由移动，再落到网格上。演示不会改变摆放。':kind==='cork'?'拿起纸卡，再松开图钉，感受纸张轻摆。':'正在演示拿起与放下；不会改变你的摆放。';
    demoCancel=()=>{cancelAnimationFrame(id);stop(el);surface.classList.remove('feel-drag-active');};
    function frame(now){
      if(!el.isConnected){stopDemo();return;}
      const t=physics.clamp((now-start)/1100,0,1),arc=Math.sin(t*Math.PI),x=arc*35,y=-arc*28;
      set(el,'x',x,'px');set(el,'y',y,'px');set(el,'z',arc*p.lift,'px');set(el,'roll',Math.sin(t*Math.PI*1.5)*p.roll,'deg');
      set(el,'pitch',arc*p.tilt,'deg');set(el,'yaw',-arc*p.tilt,'deg');
      if(kind==='glass'){el.style.setProperty('--shine-x',`${20+t*60}%`);el.style.setProperty('--shine-y','35%');}
      if(kind==='gallery'){surface.style.setProperty('--light-x',`${35+t*30}%`);surface.style.setProperty('--light-y','40%');}
      guideAt(el);
      if(t<1)id=requestAnimationFrame(frame);
      else{demoCancel=null;demoButton.disabled=false;settle(el,70,80);message.textContent=hints[kind];}
    }
    id=requestAnimationFrame(frame);
  }
  board.addEventListener('pointermove',event=>{
    if(!enabled||event.pointerType!=='mouse')return;
    const el=event.target.closest('.magnet');if(!el||el.classList.contains('dragging')||el.classList.contains('is-settling')||demoCancel)return;
    if(hoverEl&&hoverEl!==el)clear(hoverEl);hoverEl=el;
    const clientX=event.clientX,clientY=event.clientY;cancelAnimationFrame(hoverFrame);
    hoverFrame=requestAnimationFrame(()=>{
      const r=el.getBoundingClientRect(),x=physics.clamp((clientX-r.left)/r.width,0,1),y=physics.clamp((clientY-r.top)/r.height,0,1),tilt=profile().tilt;
      set(el,'pitch',(0.5-y)*tilt*2,'deg');set(el,'yaw',(x-.5)*tilt*2,'deg');
      el.style.setProperty('--shine-x',`${x*100}%`);el.style.setProperty('--shine-y',`${y*100}%`);
    });
  });
  board.addEventListener('pointerout',event=>{const el=event.target.closest('.magnet');if(el&&!el.contains(event.relatedTarget)&&!el.classList.contains('dragging')&&!jobs.has(el)&&!demoCancel){cancelAnimationFrame(hoverFrame);clear(el);if(hoverEl===el)hoverEl=null;}});
  surface.addEventListener('pointermove',event=>{if(!enabled||theme()!=='gallery')return;const r=surface.getBoundingClientRect();surface.style.setProperty('--light-x',`${event.clientX-r.left}px`);surface.style.setProperty('--light-y',`${event.clientY-r.top}px`);});
  surface.addEventListener('pointerleave',()=>{surface.style.removeProperty('--light-x');surface.style.removeProperty('--light-y');});
  motionButton.addEventListener('click',()=>{enabled=!enabled;stopAll();updateControls();});
  soundButton.addEventListener('click',async()=>{
    sound=!sound;
    if(sound){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('unsupported');audio=audio||new Audio();await audio.resume();}catch{sound=false;message.textContent='当前环境无法播放触感音，视觉反馈仍可使用。';}}
    soundButton.textContent=`触感音：${sound?'开':'关'}`;soundButton.setAttribute('aria-pressed',String(sound));
  });
  demoButton.addEventListener('click',demo);
  reduced.addEventListener('change',()=>{enabled=!reduced.matches;stopAll();updateControls();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});
  document.addEventListener('panel-theme-change',()=>{stopAll();updateControls();});
  window.PanelFeel={pickup,drag,settle,cancel:el=>{stop(el);surface.classList.remove('feel-drag-active');},beforeRender:stopAll};
  updateControls();
})();
