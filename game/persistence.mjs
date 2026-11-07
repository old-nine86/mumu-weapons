import{BUILD_ITEMS,ITEM_NAMES}from'./rules.mjs';
import{WORLD_HEIGHT,WORLD_WIDTH}from'./world.mjs';

export const SAVE_KEY='mumuSandboxV4';
export const LEGACY_SAVE_KEYS=['mumuSandboxV3','mumuSandboxV2'];

const itemIds=Object.keys(ITEM_NAMES);
const buildIds=new Set(BUILD_ITEMS.map(item=>item.id));

function safeCount(value){
  const number=Number(value);
  return Number.isFinite(number)?Math.max(0,Math.min(99999,Math.floor(number))):0;
}

function normalizeInventory(value){
  const inventory={};
  itemIds.forEach(item=>{inventory[item]=safeCount(value&&value[item])});
  return inventory;
}

function normalizeFlags(value){
  const flags={};
  ['sword2','pick2','blaster2','bossReady'].forEach(flag=>{
    if(value&&value[flag]===true)flags[flag]=true;
  });
  return flags;
}

function normalizeOpened(value){
  if(!Array.isArray(value))return[];
  return value.filter(entry=>typeof entry==='string'&&/^\d+,\d+$/.test(entry)).slice(0,500);
}

function normalizeEdits(value){
  if(!Array.isArray(value))return[];
  const edits=[];
  for(const edit of value.slice(0,2500)){
    if(!Array.isArray(edit)||edit.length!==3)continue;
    const [x,y,tile]=edit.map(Number);
    if(!Number.isInteger(x)||!Number.isInteger(y)||!Number.isInteger(tile))continue;
    if(x<0||x>=WORLD_WIDTH||y<0||y>=WORLD_HEIGHT||tile<0||tile>22)continue;
    edits.push([x,y,tile]);
  }
  return edits;
}

export function normalizeSandboxState(value){
  if(!value||typeof value!=='object'||!value.inv)return null;
  return{
    version:4,
    inv:normalizeInventory(value.inv),
    flags:normalizeFlags(value.flags),
    day:Math.max(1,Math.min(9999,safeCount(value.day)||1)),
    opened:normalizeOpened(value.opened),
    selectedBuild:buildIds.has(value.selectedBuild)?value.selectedBuild:'dirt',
    edits:normalizeEdits(value.edits)
  };
}

export function createSaveSnapshot({inventory,flags,day,opened,selectedBuild,edits}){
  return normalizeSandboxState({
    inv:inventory,
    flags,
    day,
    opened:Array.from(opened||[]),
    selectedBuild,
    edits:Array.from(edits||[],entry=>{
      if(Array.isArray(entry)&&entry.length===3)return entry;
      const [key,tile]=entry;
      const [x,y]=String(key).split(',').map(Number);
      return[x,y,tile];
    })
  });
}

export function loadSandboxState(storage){
  for(const key of[SAVE_KEY,...LEGACY_SAVE_KEYS]){
    try{
      const raw=storage.getItem(key);
      if(!raw)continue;
      const state=normalizeSandboxState(JSON.parse(raw));
      if(state)return state;
    }catch(err){}
  }
  return null;
}

export function saveSandboxState(storage,state){
  const normalized=normalizeSandboxState(state);
  if(!normalized)return false;
  try{
    storage.setItem(SAVE_KEY,JSON.stringify(normalized));
    return true;
  }catch(err){
    return false;
  }
}
