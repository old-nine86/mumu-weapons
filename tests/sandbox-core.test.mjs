import test from'node:test';
import assert from'node:assert/strict';
import{
  RECIPES,applyRecipe,canCraft,createInitialInventory,findBuildItem,
  miningHit,placementResult,spendInventory
}from'../game/rules.mjs';
import{buildWorld,WORLD_HEIGHT,WORLD_WIDTH}from'../game/world.mjs';
import{
  SAVE_KEY,createSaveSnapshot,loadSandboxState,normalizeSandboxState,saveSandboxState
}from'../game/persistence.mjs';

test('world generation is deterministic and has stable dimensions',()=>{
  const first=buildWorld();
  const second=buildWorld();
  assert.equal(first.map.length,WORLD_HEIGHT);
  assert.equal(first.map[0].length,WORLD_WIDTH);
  assert.deepEqual(first.map,second.map);
  assert.deepEqual(first.core,second.core);
});

test('recipes spend once, grant output, and prevent duplicate upgrades',()=>{
  const inventory=createInitialInventory();
  inventory.gold=8;
  inventory.crystal=14;
  const flags={};
  const altar=RECIPES.find(recipe=>recipe.id==='bossReady');
  assert.equal(canCraft(altar,inventory,flags),true);
  assert.equal(applyRecipe(altar,inventory,flags),true);
  assert.equal(inventory.gold,0);
  assert.equal(inventory.crystal,0);
  assert.equal(flags.bossReady,true);
  assert.equal(applyRecipe(altar,inventory,flags),false);
  assert.equal(spendInventory(inventory,{gold:1}),false);
  assert.equal(inventory.gold,0);
});

test('placement rejects occupied, missing, and player-overlap tiles',()=>{
  const build=findBuildItem('wood');
  const inventory={wood:1};
  const placed={x:64,y:64,w:32,h:32};
  const player={x:0,y:0,w:24,h:42};
  assert.equal(placementResult({currentTile:3,inventory,build,placed,player}).reason,'occupied');
  assert.equal(placementResult({currentTile:0,inventory:{wood:0},build,placed,player}).reason,'missing');
  assert.equal(placementResult({currentTile:0,inventory,build,placed,player:{x:70,y:70,w:24,h:42}}).reason,'player');
  assert.equal(placementResult({currentTile:0,inventory,build,placed,player}).allowed,true);
});

test('mining honors hardness, upgrades, drops, and protected tiles',()=>{
  const first=miningHit(9,0,1);
  assert.equal(first.complete,false);
  const upgraded=miningHit(9,2,1.45);
  assert.equal(upgraded.complete,true);
  assert.equal(upgraded.drop,'iron');
  assert.equal(miningHit(6,0,20).allowed,false);
  assert.equal(miningHit(8,0,.7).amount,2);
});

test('save snapshots preserve edits and sanitize malformed values',()=>{
  const snapshot=createSaveSnapshot({
    inventory:{...createInitialInventory(),wood:42},
    flags:{sword2:true,unknown:true},
    day:7,
    opened:new Set(['12,9']),
    selectedBuild:'wood',
    edits:new Map([['12,9',0],['13,9',7]])
  });
  assert.equal(snapshot.inv.wood,42);
  assert.deepEqual(snapshot.edits,[[12,9,0],[13,9,7]]);
  assert.deepEqual(snapshot.flags,{sword2:true});

  const normalized=normalizeSandboxState({
    inv:{wood:-5,dirt:'18',stone:Infinity},
    flags:{pick2:true},
    day:-2,
    opened:['good','4,5'],
    selectedBuild:'unknown',
    edits:[[4,5,7],[-1,2,3],[999,2,3]]
  });
  assert.equal(normalized.inv.wood,0);
  assert.equal(normalized.inv.dirt,18);
  assert.equal(normalized.day,1);
  assert.equal(normalized.selectedBuild,'dirt');
  assert.deepEqual(normalized.opened,['4,5']);
  assert.deepEqual(normalized.edits,[[4,5,7]]);
});

test('storage uses V4 and migrates a valid V3 save',()=>{
  const values=new Map();
  const storage={
    getItem:key=>values.get(key)||null,
    setItem:(key,value)=>values.set(key,value)
  };
  values.set('mumuSandboxV3',JSON.stringify({inv:{wood:9},flags:{pick2:true},day:3,opened:[]}));
  const legacy=loadSandboxState(storage);
  assert.equal(legacy.inv.wood,9);
  assert.equal(legacy.flags.pick2,true);
  assert.equal(saveSandboxState(storage,legacy),true);
  assert.ok(values.has(SAVE_KEY));
});
