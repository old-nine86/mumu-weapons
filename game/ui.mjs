import{BUILD_ITEMS,ITEM_NAMES,RECIPES}from'./rules.mjs';

const inventoryOrder=['wood','dirt','stone','copper','iron','gold','crystal','torch','brick','star'];

export function blueprintSteps({player,core,openedChests,bossSpawned}){
  return[
    {label:'进入核心基地',done:Math.abs(player.x-core.x)<260},
    {label:'开启任意宝箱',done:openedChests.size>0},
    {label:'激活工作站',done:Boolean(player.flags.sword2||player.inv.brick>0)},
    {label:'深入 18 层以下',done:player.depth>=18},
    {label:'合成星核祭坛',done:Boolean(player.flags.bossReady||bossSpawned||player.inv.star>0)},
    {label:'击败星核守卫',done:player.inv.star>0}
  ];
}

export function currentGoal(player){
  if(player.inv.star>0)return'星核已取得';
  if(player.flags.bossReady)return'去影晶地星核门召唤 Boss';
  if(player.flags.blaster2)return'收集金矿和晶片，合成星核祭坛';
  if(player.flags.pick2)return'深入地下找金矿';
  if(player.flags.sword2)return'合成铁镐，挖更深矿脉';
  return'找 NPC / 宝箱 / 工作站推进基地';
}

export function createHudModel({player,isNight,activeBiome,selectedBuild,canCraft,core,openedChests,bossSpawned}){
  const steps=blueprintSteps({player,core,openedChests,bossSpawned});
  return{
    hp:String(Math.max(0,Math.round(player.hp))),
    energy:String(Math.round(player.energy)),
    time:isNight?'夜晚':'白昼',
    bag:String(Object.values(player.inv).reduce((sum,value)=>sum+value,0)),
    inventory:inventoryOrder.map(id=>({id,name:ITEM_NAMES[id],count:player.inv[id]||0})),
    builds:BUILD_ITEMS.map(item=>({...item,count:player.inv[item.id]||0,active:selectedBuild===item.id})),
    recipes:RECIPES.map(recipe=>({...recipe,ready:canCraft(recipe)})),
    goal:currentGoal(player)+' · '+activeBiome+' · 深度 '+player.depth,
    steps,
    activeStep:steps.findIndex(step=>!step.done)
  };
}

function syncHTML(element,html){
  if(element._renderedHTML===html)return;
  element.innerHTML=html;
  element._renderedHTML=html;
}

export function renderHud(elements,model){
  elements.hpText.textContent=model.hp;
  elements.energyText.textContent=model.energy;
  elements.timeText.textContent=model.time;
  elements.bagText.textContent=model.bag;
  syncHTML(elements.inventoryGrid,model.inventory.map(item=>
    '<div class="mini-cell">'+item.name+'<br>'+item.count+'</div>'
  ).join(''));
  syncHTML(elements.buildPalette,model.builds.map(item=>
    '<button class="build-btn '+(item.active?'active':'')+'" data-build="'+item.id+'" type="button" aria-label="选择'+ITEM_NAMES[item.id]+'"><span style="background:'+item.color+'"></span>'+item.label+' '+item.count+'</button>'
  ).join(''));
  syncHTML(elements.craftGrid,model.recipes.map(recipe=>
    '<button class="craft-btn '+(recipe.ready?'ready':'')+'" data-craft="'+recipe.id+'" type="button">'+recipe.name+'</button>'
  ).join(''));
  syncHTML(elements.questLine,'<strong>目标</strong> '+model.goal);
  syncHTML(elements.blueprintSteps,model.steps.map((step,index)=>
    '<div class="step '+(step.done?'done':index===model.activeStep?'active':'')+'"><span>'+(step.done?'✓':index+1)+'</span>'+step.label+'</div>'
  ).join(''));
}

export function setBagCollapsed(panel,toggle,collapsed){
  panel.classList.toggle('collapsed',collapsed);
  toggle.setAttribute('aria-expanded',String(!collapsed));
  toggle.setAttribute('aria-label',collapsed?'展开背包':'收起背包');
}
