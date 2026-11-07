import test from'node:test';
import assert from'node:assert/strict';
import{createPlayer,applyMovementIntent,applyTerrainState,tickPlayerVitals}from'../game/player.mjs';
import{consumeAction,createInputState,movementIntent,toolForKey}from'../game/input.mjs';
import{
  applyPlayerHit,attackHits,createEnemyState,damageEnemyState,startAttack
}from'../game/combat.mjs';
import{blueprintSteps,createHudModel,currentGoal}from'../game/ui.mjs';

test('player creation and movement preserve platform behavior',()=>{
  const player=createPlayer();
  assert.equal(player.hp,120);
  assert.equal(player.inv.wood,10);
  player.onGround=true;
  const result=applyMovementIntent(player,{horizontal:1,jump:true,down:false},false);
  assert.equal(player.vx,5.2);
  assert.equal(player.face,1);
  assert.equal(player.vy,-13.2);
  assert.equal(result.jumped,true);

  applyMovementIntent(player,{horizontal:-1,jump:false,down:true},true);
  assert.equal(player.vx,-5.2);
  assert.equal(player.vy,4);
  assert.equal(player.onGround,true);
});

test('input aliases and one-shot actions are deterministic',()=>{
  const input=createInputState();
  input.KeyA=true;
  input.Space=true;
  assert.deepEqual(movementIntent(input),{horizontal:-1,jump:true,down:false});
  input.attack=true;
  assert.equal(consumeAction(input,'KeyJ','attack'),true);
  assert.equal(consumeAction(input,'KeyJ','attack'),false);
  assert.equal(toolForKey('Digit2'),'blaster');
  assert.equal(toolForKey('KeyZ'),'');
});

test('player vitals and terrain effects clamp state',()=>{
  const player=createPlayer();
  player.energy=99.98;
  player.cool=2;
  player.iframes=1;
  tickPlayerVitals(player);
  assert.equal(player.energy,100);
  assert.equal(player.cool,1);
  assert.equal(player.iframes,0);
  const hazard=applyTerrainState(player,17,9999);
  assert.equal(hazard.hazardHit,true);
  assert.equal(player.hp,110);
  const repeated=applyTerrainState(player,17,9999);
  assert.equal(repeated.hazardHit,false);
});

test('weapon attacks enforce cooldown and blaster energy',()=>{
  const player=createPlayer();
  const sword=startAttack(player);
  assert.equal(sword.kind,'melee');
  assert.equal(sword.damage,20);
  assert.equal(startAttack(player).reason,'cooldown');

  player.cool=0;
  player.tool='blaster';
  player.energy=7;
  assert.deepEqual(startAttack(player),{kind:'none',reason:'energy'});
  assert.equal(player.cool,0);

  player.energy=20;
  player.flags.blaster2=true;
  const shot=startAttack(player);
  assert.equal(shot.kind,'projectile');
  assert.equal(shot.projectile.dmg,36);
  assert.equal(player.energy,12);
});

test('enemy defeat rewards and player contact damage settle once',()=>{
  const enemy=createEnemyState({x:30,y:20,type:0,day:1});
  const box={x:0,y:0,w:60,h:60};
  assert.equal(attackHits(box,enemy),true);
  const defeated=damageEnemyState(enemy,999,4);
  assert.equal(defeated.defeated,true);
  assert.equal(defeated.reward.score,18);
  assert.equal(defeated.reward.drop,'copper');
  assert.equal(damageEnemyState(enemy,999,4).hit,false);

  const player=createPlayer();
  assert.equal(applyPlayerHit(player,enemy,2,1),true);
  const hp=player.hp;
  assert.equal(applyPlayerHit(player,enemy,2,1),false);
  assert.equal(player.hp,hp);
});

test('HUD model exposes progression without DOM dependencies',()=>{
  const player=createPlayer();
  const core={x:player.x+500};
  const openedChests=new Set();
  assert.equal(currentGoal(player),'找 NPC / 宝箱 / 工作站推进基地');
  let steps=blueprintSteps({player,core,openedChests,bossSpawned:false});
  assert.equal(steps[0].done,false);
  player.flags.sword2=true;
  player.depth=19;
  openedChests.add('1,2');
  steps=blueprintSteps({player,core,openedChests,bossSpawned:false});
  assert.equal(steps[1].done,true);
  assert.equal(steps[2].done,true);
  assert.equal(steps[3].done,true);
  const model=createHudModel({
    player,isNight:false,activeBiome:'森林',selectedBuild:'wood',
    canCraft:()=>false,core,openedChests,bossSpawned:false
  });
  assert.equal(model.time,'白昼');
  assert.equal(model.builds.find(item=>item.id==='wood').active,true);
  assert.match(model.goal,/深度 19/);
});
