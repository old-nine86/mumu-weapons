import{createInitialInventory}from'./rules.mjs';

export function createPlayer(tileSize=32){
  return{
    x:16*tileSize,y:17*tileSize,w:24,h:42,vx:0,vy:0,face:1,
    onGround:false,hp:120,maxHp:120,energy:100,tool:'sword',
    cool:0,iframes:0,inv:createInitialInventory(),flags:{},score:0,depth:0
  };
}

export function applyMovementIntent(player,intent,onLadder){
  player.vx=intent.horizontal*5.2;
  if(player.vx)player.face=Math.sign(player.vx);
  if(onLadder){
    player.vy=(intent.jump?-4:0)+(intent.down?4:0);
    player.onGround=true;
    return{jumped:false,climbing:Boolean(intent.jump||intent.down)};
  }
  if(intent.jump&&player.onGround){
    player.vy=-13.2;
    player.onGround=false;
    return{jumped:true,climbing:false};
  }
  return{jumped:false,climbing:false};
}

export function tickPlayerVitals(player){
  player.energy=Math.min(100,Math.max(0,player.energy+.075));
  player.cool=Math.max(0,player.cool-1);
  player.iframes=Math.max(0,player.iframes-1);
}

export function applyTerrainState(player,tileUnder,worldBottom){
  let hazardHit=false;
  if(tileUnder===17&&player.iframes<=0){
    player.hp-=10;
    player.iframes=40;
    hazardHit=true;
  }
  if(tileUnder===16)player.vx*=.7;
  if(player.y>worldBottom)player.hp=0;
  return{hazardHit,slowed:tileUnder===16,fallen:player.y>worldBottom};
}

export function healPlayer(player,hp=16){
  player.hp=Math.min(player.maxHp,player.hp+hp);
  player.energy=100;
}
