export const ITEM_NAMES={
  dirt:'泥土',stone:'石块',wood:'木材',copper:'铜矿',iron:'铁矿',
  gold:'金矿',crystal:'晶片',torch:'火把',brick:'砖块',star:'星核'
};

export const BUILD_ITEMS=[
  {id:'dirt',label:'泥',tile:2,color:'#8a5a36'},
  {id:'stone',label:'石',tile:3,color:'#68717c'},
  {id:'wood',label:'木',tile:7,color:'#8b5a2b'},
  {id:'brick',label:'砖',tile:13,color:'#9c6650'},
  {id:'torch',label:'火',tile:6,color:'#ffef99'}
];

export const RECIPES=[
  {id:'torch',name:'火把',cost:{wood:1,crystal:1},make:{torch:4}},
  {id:'brick',name:'砖块',cost:{stone:3,dirt:1},make:{brick:4}},
  {id:'sword2',name:'铜剑',cost:{wood:4,copper:8},flag:'sword2'},
  {id:'pick2',name:'铁镐',cost:{wood:5,iron:10},flag:'pick2'},
  {id:'blaster2',name:'星能枪',cost:{copper:8,crystal:8,gold:4},flag:'blaster2'},
  {id:'bossReady',name:'星核祭坛',cost:{gold:8,crystal:14},flag:'bossReady'}
];

export const TILE_DROPS={
  1:'dirt',2:'dirt',3:'stone',4:'copper',7:'wood',8:'wood',9:'iron',
  10:'gold',11:'crystal',12:'dirt',13:'brick',14:'wood',15:'wood',
  20:'wood',21:'stone',22:'iron'
};

export const TILE_HARDNESS={
  1:1,2:1,3:2.1,4:2.6,7:1,8:.7,9:3.2,10:4.1,11:3,
  12:1,13:2,14:1.5,15:1,20:1.4,21:2.6,22:2.8
};

export const PROTECTED_TILES=new Set([5,6,16,17,18,19,20,21,22]);

export function createInitialInventory(){
  return{dirt:28,stone:12,wood:10,copper:0,iron:0,gold:0,crystal:0,torch:5,brick:0,star:0};
}

export function addInventory(inventory,item,amount){
  inventory[item]=(inventory[item]||0)+amount;
  return inventory[item];
}

export function canAfford(inventory,cost){
  return Object.keys(cost).every(item=>(inventory[item]||0)>=cost[item]);
}

export function spendInventory(inventory,cost){
  if(!canAfford(inventory,cost))return false;
  Object.keys(cost).forEach(item=>{inventory[item]-=cost[item]});
  return true;
}

export function canCraft(recipe,inventory,flags){
  return Boolean(recipe)&&(!recipe.flag||!flags[recipe.flag])&&canAfford(inventory,recipe.cost);
}

export function applyRecipe(recipe,inventory,flags){
  if(!canCraft(recipe,inventory,flags))return false;
  spendInventory(inventory,recipe.cost);
  if(recipe.make){
    Object.keys(recipe.make).forEach(item=>addInventory(inventory,item,recipe.make[item]));
  }
  if(recipe.flag)flags[recipe.flag]=true;
  return true;
}

export function findBuildItem(id){
  return BUILD_ITEMS.find(item=>item.id===id)||BUILD_ITEMS[0];
}

export function rectsOverlap(a,b){
  return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
}

export function placementResult({currentTile,inventory,build,placed,player}){
  if(currentTile)return{allowed:false,reason:'occupied'};
  if(!inventory||!(inventory[build.id]>0))return{allowed:false,reason:'missing'};
  if(rectsOverlap(placed,player))return{allowed:false,reason:'player'};
  return{allowed:true,reason:'ok'};
}

export function miningHit(tile,currentWork,power=1){
  if(!tile||PROTECTED_TILES.has(tile))return{allowed:false,complete:false,work:currentWork};
  const work=currentWork+power;
  const hardness=TILE_HARDNESS[tile]||1;
  return{
    allowed:true,
    complete:work>=hardness,
    work,
    hardness,
    drop:TILE_DROPS[tile]||'dirt',
    amount:tile===8?2:1
  };
}
