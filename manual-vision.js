(function(global){
  'use strict';

  function cloudConfig(){
    return global.MUMU_SUPABASE||{};
  }

  function isEnabled(){
    const config=cloudConfig();
    return !!(config.enabled&&config.url&&config.anonKey&&config.manualVisionFunction);
  }

  function functionUrl(){
    const config=cloudConfig();
    return String(config.url||'').replace(/\/+$/,'')+
      '/functions/v1/'+encodeURIComponent(String(config.manualVisionFunction||''));
  }

  function clamp(value,min,max){
    return Math.max(min,Math.min(max,Number(value)||0));
  }

  function cleanText(value,maxLength){
    return String(value||'').trim().slice(0,maxLength);
  }

  function absoluteImageUrl(src){
    const value=String(src||'').trim();
    if(/^data:image\//i.test(value)||/^https?:\/\//i.test(value))return value;
    return new URL(value,global.location.href).href;
  }

  function resizeDataUrl(src){
    if(!/^data:image\//i.test(src)||src.length<3_200_000)return Promise.resolve(src);
    return new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>{
        const maxSide=1280,scale=Math.min(1,maxSide/Math.max(img.naturalWidth,img.naturalHeight));
        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
        canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
        const ctx=canvas.getContext('2d');
        if(!ctx){reject(new Error('Image compression is unavailable.'));return}
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL('image/jpeg',.86));
      };
      img.onerror=()=>reject(new Error('The selected image could not be prepared.'));
      img.src=src;
    });
  }

  function normalizeAnalysis(raw){
    if(!raw||typeof raw!=='object')throw new Error('Vision analysis returned no usable result.');
    const type=['sword','gun','spear'].includes(raw.type)?raw.type:'sword';
    const estimated=Math.round(clamp(raw.estimated_bricks,24,2500));
    const colors=(Array.isArray(raw.colors)?raw.colors:[]).slice(0,8).map(item=>({
      name:cleanText(item&&item.name,40)||'Mixed',
      hex:/^#[0-9a-f]{6}$/i.test(String(item&&item.hex||''))?String(item.hex):'#808080',
      share:Math.round(clamp(item&&item.share,0,100))
    }));
    const parts=(Array.isArray(raw.parts)?raw.parts:[]).slice(0,12).map(item=>({
      name:cleanText(item&&item.name,60),
      use:cleanText(item&&item.use,100),
      qty:Math.max(1,Math.round(clamp(item&&item.quantity,1,2500))),
      color:cleanText(item&&item.color,50)
    })).filter(item=>item.name&&item.use);
    const steps=(Array.isArray(raw.steps)?raw.steps:[]).slice(0,10).map((item,index)=>({
      title:cleanText(item&&item.title,70)||String(index+1),
      text:cleanText(item&&item.instruction,320)
    })).filter(item=>item.text);
    if(colors.length<2||parts.length<3||steps.length<3)throw new Error('Vision analysis was incomplete.');
    const partTotal=parts.reduce((sum,item)=>sum+item.qty,0);
    if(partTotal!==estimated){
      const scale=estimated/Math.max(1,partTotal);
      let remaining=estimated;
      parts.forEach((item,index)=>{
        const remainingItems=parts.length-index-1;
        if(!remainingItems){
          item.qty=Math.max(1,remaining);
          return;
        }
        const scaled=Math.max(1,Math.round(item.qty*scale));
        item.qty=Math.min(scaled,Math.max(1,remaining-remainingItems));
        remaining-=item.qty;
      });
    }
    return {
      type,
      estimated_bricks:estimated,
      confidence:Math.round(clamp(raw.confidence,0,100)),
      shape_summary:cleanText(raw.shape_summary,180),
      width_studs:Math.round(clamp(raw.width_studs,1,300)),
      height_studs:Math.round(clamp(raw.height_studs,1,300)),
      colors,
      parts,
      steps
    };
  }

  async function analyze(options){
    if(!isEnabled())throw new Error('Cloud vision is not configured.');
    const config=cloudConfig();
    const imageUrl=await resizeDataUrl(absoluteImageUrl(options&&options.src));
    const controller=typeof AbortController!=='undefined'?new AbortController():null;
    const timeoutMs=Math.max(5000,Number(config.manualVisionTimeout)||22000);
    const timer=controller?setTimeout(()=>controller.abort(),timeoutMs):null;
    try{
      const response=await fetch(functionUrl(),{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          apikey:config.anonKey,
          Authorization:'Bearer '+config.anonKey
        },
        body:JSON.stringify({
          image_url:imageUrl,
          locale:options&&options.locale==='en'?'en':'zh',
          weapon_hint:options&&options.weaponHint||{},
          local_estimate:options&&options.localEstimate||{}
        }),
        signal:controller&&controller.signal
      });
      const payload=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(cleanText(payload.error,180)||('Cloud vision failed with status '+response.status+'.'));
      return {
        analysis:normalizeAnalysis(payload.analysis),
        model:cleanText(payload.model,80),
        requestId:cleanText(payload.request_id,120)
      };
    }finally{
      if(timer)clearTimeout(timer);
    }
  }

  global.MumuManualVision={isEnabled,analyze,normalizeAnalysis};
})(window);
