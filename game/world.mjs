export const TILE_SIZE=32;
export const WORLD_WIDTH=380;
export const WORLD_HEIGHT=96;
export const GRAVITY=.72;
export const MAX_FALL_SPEED=17;

export const SOLID_TILES=new Set([1,2,3,4,5,7,9,10,11,12,13,14,15,20,21,22]);

export const TILE_COLORS={
  1:['#5caa59','#36713d'],2:['#8a5a36','#62391f'],3:['#68717c','#424954'],
  4:['#7b6048','#f59e5b'],5:['#ffe07a','#ff8a4f'],6:['#ffef99','#ffb84d'],
  7:['#8b5a2b','#5f3719'],8:['#62b65e','#2f7a3a'],9:['#596b74','#cbd5e1'],
  10:['#765f2a','#facc15'],11:['#51406d','#a78bfa'],12:['#d8b871','#9b7a35'],
  13:['#9c6650','#653727'],14:['#9a642f','#fbbf24'],15:['#7b4b24','#b7791f'],
  16:['#2dd4bf','#0f766e'],17:['#fb923c','#b91c1c'],18:['#c084fc','#6d28d9'],
  20:['#8b5a2b','#fbbf24'],21:['#475569','#f97316'],22:['#334155','#cbd5e1']
};

export function seededRandom(seed){
  let value=seed+0x6D2B79F5;
  return function(){
    value+=0x6D2B79F5;
    let result=Math.imul(value^value>>>15,1|value);
    result^=result+Math.imul(result^result>>>7,61|result);
    return((result^result>>>14)>>>0)/4294967296;
  };
}

export function biomeAt(tileX){
  if(tileX<WORLD_WIDTH*.22)return'森林';
  if(tileX<WORLD_WIDTH*.42)return'沙原';
  if(tileX<WORLD_WIDTH*.68)return'绿岭';
  if(tileX<WORLD_WIDTH*.84)return'影晶地';
  return'高地';
}

function addFeaturePools(map){
  [[42,34,8,3,16],[74,58,7,4,16],[122,71,10,3,17],[206,66,12,4,17],[304,47,7,4,18]].forEach(([sx,sy,w,h,tile])=>{
    for(let y=sy;y<sy+h;y++){
      for(let x=sx;x<sx+w;x++){
        if(map[y]&&x>=0&&x<WORLD_WIDTH)map[y][x]=tile;
      }
    }
  });
  [[52,40],[88,55],[142,63],[242,58],[314,38]].forEach(([x,y])=>{
    if(map[y])map[y][x]=14;
  });
  for(let y=35;y<54;y++)map[y][86]=19;
  for(let x=82;x<93;x++)map[54][x]=15;
}

function addBossArena(map){
  const arenaX=306;
  const arenaY=67;
  for(let y=arenaY-7;y<=arenaY+5;y++){
    for(let x=arenaX-13;x<=arenaX+13;x++){
      if(map[y])map[y][x]=0;
    }
  }
  for(let x=arenaX-11;x<=arenaX+11;x++){
    map[arenaY+5][x]=11;
    map[arenaY-7][x]=11;
  }
  for(let y=arenaY-6;y<=arenaY+5;y++){
    map[y][arenaX-13]=11;
    map[y][arenaX+13]=11;
  }
  for(let x=arenaX-5;x<=arenaX+5;x++)map[arenaY+4][x]=15;
  map[arenaY+3][arenaX]=18;
  map[arenaY+2][arenaX]=18;
  map[arenaY+1][arenaX]=18;
}

export function buildWorld(seed=5312026){
  const random=seededRandom(seed);
  const map=Array.from({length:WORLD_HEIGHT},()=>Array(WORLD_WIDTH).fill(0));

  for(let x=0;x<WORLD_WIDTH;x++){
    const biome=biomeAt(x);
    const surface=24+Math.floor(Math.sin(x*.06)*5+Math.sin(x*.017)*9+random()*3);
    for(let y=surface;y<WORLD_HEIGHT;y++){
      const depth=y-surface;
      let tile=y===surface?(biome==='沙原'?12:biome==='影晶地'?11:1):depth<5?(biome==='沙原'?12:2):3;
      if(depth>8&&random()<.055)tile=4;
      if(depth>17&&random()<.04)tile=9;
      if(depth>30&&random()<.025)tile=10;
      if(biome==='影晶地'&&depth<11&&random()<.18)tile=11;
      if(depth>7&&random()<.085)tile=0;
      if(depth>18&&random()<.06)tile=0;
      if(depth>34&&random()<.04)tile=0;
      map[y][x]=tile;
    }
    if((biome==='森林'||biome==='高地')&&random()<.18){
      const surfaceY=surface-1;
      for(let height=0;height<random()*3+3;height++)map[surfaceY-height][x]=7;
      for(let y=surfaceY-6;y<=surfaceY-3;y++){
        for(let branchX=x-2;branchX<=x+2;branchX++){
          if(map[y]&&branchX>=0&&branchX<WORLD_WIDTH&&!map[y][branchX]&&Math.abs(branchX-x)+Math.abs(y-(surfaceY-4))<4){
            map[y][branchX]=8;
          }
        }
      }
    }
  }

  const coreX=24;
  const coreY=22;
  for(let y=coreY-4;y<=coreY+4;y++){
    for(let x=coreX-5;x<=coreX+5;x++){
      if(map[y])map[y][x]=0;
    }
  }
  for(let x=coreX-6;x<=coreX+7;x++){
    map[coreY-1][x]=13;
    map[coreY+4][x]=13;
  }
  for(let y=coreY-1;y<=coreY+4;y++){
    map[y][coreX-6]=13;
    map[y][coreX+7]=13;
  }
  for(let x=coreX-3;x<=coreX+3;x++)map[coreY+1][x]=15;
  for(let y=coreY-2;y<=coreY+5;y++)map[y][coreX+5]=19;
  map[coreY+3][coreX]=5;
  map[coreY+2][coreX]=5;
  map[coreY+1][coreX]=6;
  map[coreY+3][coreX-4]=14;
  map[coreY+3][coreX+4]=14;
  map[coreY+3][coreX-2]=20;
  map[coreY+3][coreX+2]=21;
  map[coreY+3][coreX+3]=22;
  for(let x=coreX+8;x<=coreX+13;x++)map[coreY+2][x]=15;
  for(let y=coreY-5;y<=coreY+2;y++)map[y][coreX+11]=19;
  for(let x=0;x<WORLD_WIDTH;x++){
    const cave=48+Math.floor(Math.sin(x*.08)*8);
    for(let y=cave;y<cave+3;y++)if(map[y])map[y][x]=0;
  }

  addFeaturePools(map);
  addBossArena(map);
  return{map,core:{x:coreX*TILE_SIZE,y:(coreY+2)*TILE_SIZE,hp:260,max:260}};
}
