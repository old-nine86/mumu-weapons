const movementAliases={
  left:['ArrowLeft','KeyA','left'],
  right:['ArrowRight','KeyD','right'],
  jump:['Space','ArrowUp','KeyW','jump'],
  down:['ArrowDown','KeyS','down']
};

const toolKeys={
  Digit1:'sword',
  Digit2:'blaster',
  Digit3:'pick',
  Digit4:'block',
  Digit5:'torch'
};

export function createInputState(){
  return Object.create(null);
}

export function resetInputState(state){
  Object.keys(state).forEach(key=>{delete state[key]});
}

export function movementIntent(state){
  const active=name=>movementAliases[name].some(key=>Boolean(state[key]));
  return{
    horizontal:(active('right')?1:0)-(active('left')?1:0),
    jump:active('jump'),
    down:active('down')
  };
}

export function consumeAction(state,...keys){
  const active=keys.some(key=>Boolean(state[key]));
  keys.forEach(key=>{state[key]=false});
  return active;
}

export function toolForKey(code){
  return toolKeys[code]||'';
}

export function bindGameInput(options){
  const{
    win,canvas,state,holdButtons,tapButtons,getPointer,getTool,setTool,
    syncTools,onPrimary,onMineEnd
  }=options;

  const keydown=event=>{
    state[event.code]=true;
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code)){
      event.preventDefault();
    }
    const tool=toolForKey(event.code);
    if(tool){
      setTool(tool);
      syncTools();
    }
  };
  const keyup=event=>{state[event.code]=false};
  const pointermove=event=>{
    const pointer=getPointer();
    pointer.x=event.clientX;
    pointer.y=event.clientY;
  };
  const pointerdown=event=>{
    const pointer=getPointer();
    pointer.down=true;
    pointer.button=event.button;
    pointer.x=event.clientX;
    pointer.y=event.clientY;
    canvas.setPointerCapture(event.pointerId);
    if(event.button===2)setTool('block');
    syncTools();
    onPrimary(getTool());
  };
  const pointerup=()=>{
    getPointer().down=false;
    onMineEnd();
  };
  const contextmenu=event=>event.preventDefault();

  win.addEventListener('keydown',keydown);
  win.addEventListener('keyup',keyup);
  canvas.addEventListener('pointermove',pointermove);
  canvas.addEventListener('pointerdown',pointerdown);
  canvas.addEventListener('pointerup',pointerup);
  canvas.addEventListener('pointercancel',pointerup);
  canvas.addEventListener('contextmenu',contextmenu);

  const cleanups=[];
  holdButtons.forEach(button=>{
    const key=button.dataset.hold;
    const down=()=>{state[key]=true};
    const up=()=>{state[key]=false};
    button.addEventListener('pointerdown',down);
    button.addEventListener('pointerup',up);
    button.addEventListener('pointercancel',up);
    button.addEventListener('pointerleave',up);
    cleanups.push(()=>{
      button.removeEventListener('pointerdown',down);
      button.removeEventListener('pointerup',up);
      button.removeEventListener('pointercancel',up);
      button.removeEventListener('pointerleave',up);
    });
  });
  tapButtons.forEach(button=>{
    const down=event=>{
      event.preventDefault();
      state[button.dataset.tap]=true;
    };
    button.addEventListener('pointerdown',down);
    cleanups.push(()=>button.removeEventListener('pointerdown',down));
  });

  return function unbind(){
    win.removeEventListener('keydown',keydown);
    win.removeEventListener('keyup',keyup);
    canvas.removeEventListener('pointermove',pointermove);
    canvas.removeEventListener('pointerdown',pointerdown);
    canvas.removeEventListener('pointerup',pointerup);
    canvas.removeEventListener('pointercancel',pointerup);
    canvas.removeEventListener('contextmenu',contextmenu);
    cleanups.forEach(cleanup=>cleanup());
  };
}
