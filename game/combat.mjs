export function createEnemyState({x,y,boss=false,deep=false,shadow=false,night=false,day=1}){
  const type=boss?9:(deep?3:(shadow?2:(night?1:0)));
  const hp=boss?360:(38+day*6+type*12);
  return{x,y,w:boss?72:28,h:boss?66:34,vx:0,vy:0,hp,max:hp,hit:0,type,boss,defeated:false};
}

export function startAttack(player){
  if(player.cool>0)return{kind:'none',reason:'cooldown'};

  if(player.tool==='blaster'){
    if(player.energy<8)return{kind:'none',reason:'energy'};
    const damage=24+(player.flags.blaster2?12:0);
    player.cool=14;
    player.energy-=8;
    return{
      kind:'projectile',
      effect:{x:player.x+player.w/2+player.face*22,y:player.y+18,color:'#7dd3fc',count:6},
      projectile:{
        x:player.x+player.w/2+player.face*18,y:player.y+18,
        vx:player.face*15,vy:-.4,life:78,dmg:damage
      }
    };
  }

  player.cool=12;
  const damage=20+(player.flags.sword2?14:0);
  return{
    kind:'melee',
    damage,
    knock:player.face*4.5,
    box:{
      x:player.face>0?player.x+player.w:player.x-56,
      y:player.y-6,w:56,h:58
    },
    effect:{x:player.x+player.w/2+player.face*34,y:player.y+18,color:'#ffd34f',count:10}
  };
}

export function attackHits(box,enemy){
  return enemy.hp>0&&box.x<enemy.x+enemy.w&&box.x+box.w>enemy.x&&box.y<enemy.y+enemy.h&&box.y+box.h>enemy.y;
}

export function damageEnemyState(enemy,damage,knock){
  if(enemy.defeated||enemy.hp<=0)return{hit:false,defeated:false,reward:null};
  enemy.hp-=damage;
  enemy.hit=10;
  enemy.vx+=knock;
  if(enemy.hp>0)return{hit:true,defeated:false,reward:null};
  enemy.hp=0;
  enemy.defeated=true;
  return{
    hit:true,
    defeated:true,
    reward:{
      score:enemy.boss?250:18,
      drop:enemy.boss?'star':(enemy.type>=2?'crystal':'copper'),
      energy:10
    }
  };
}

export function applyPlayerHit(player,enemy,day,direction){
  if(player.iframes>0)return false;
  player.hp-=enemy.boss?20:8+day+enemy.type;
  player.iframes=45;
  player.vx+=direction*5;
  return true;
}

export function enemyMotion(enemy,{player,core,day}){
  const target=enemy.boss?player:(Math.abs(enemy.x-core.x)<Math.abs(enemy.x-player.x)?core:player);
  const direction=Math.sign((target.x||player.x)-enemy.x)||1;
  return{
    direction,
    speed:direction*(enemy.boss?2.3:1.25+day*.04+enemy.type*.15),
    jumpVelocity:enemy.boss?-12:-9,
    jumpChance:enemy.boss?.025:.012,
    coreDamage:enemy.boss?.55:.14+day*.02
  };
}
