(function(){
  'use strict';

  function localized(value,locale){
    if(!value||typeof value!=='object')return '';
    return String(value[locale]||value.en||value.zh||'');
  }

  function safeDestination(item){
    if(!item||item.active!==true||item.verified!==true)return '';
    try{
      const url=new URL(String(item.url||''));
      return url.protocol==='https:'?url.href:'';
    }catch(err){
      return '';
    }
  }

  function readCounts(config){
    try{
      const raw=localStorage.getItem(config.storageKey);
      const parsed=raw?JSON.parse(raw):{};
      return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};
    }catch(err){
      return {};
    }
  }

  function recordClick(config,id){
    const counts=readCounts(config);
    const current=Number.isFinite(Number(counts[id]))?Number(counts[id]):0;
    counts[id]=current+1;
    try{
      localStorage.setItem(config.storageKey,JSON.stringify(counts));
    }catch(err){
      return current;
    }
    return counts[id];
  }

  function createAction(item,locale,className,status){
    const destination=safeDestination(item);
    const label=className==='commerce-link'
      ?(destination?(locale==='zh'?'查看推荐':'View recommendation'):(locale==='zh'?'购买链接待配置':'Purchase link pending'))
      :localized(item.label,locale);
    const action=document.createElement(destination?'a':'button');
    action.className=className+(destination?'':' disabled');
    action.textContent=label;

    if(destination){
      action.href=destination;
      action.target='_blank';
      action.rel=item.affiliate?'noopener noreferrer sponsored':'noopener noreferrer';
      action.dataset.commerceId=item.id;
      action.addEventListener('click',function(){
        const count=recordClick(window.MUMU_COMMERCE_CONFIG,item.id);
        if(status){
          status.textContent=locale==='zh'
            ?'已打开已核验链接。本机累计打开 '+count+' 次；不记录身份信息。'
            :'Verified link opened '+count+' time'+(count===1?'':'s')+' on this device. No identity data is stored.';
        }
      });
    }else{
      action.type='button';
      action.disabled=true;
      action.setAttribute('aria-disabled','true');
    }
    return action;
  }

  function renderProducts(config,locale,container,status){
    container.replaceChildren();
    (Array.isArray(config.products)?config.products:[]).forEach(function(item){
      const card=document.createElement('article');
      card.className='product-card';

      const visual=document.createElement('div');
      visual.className='product-visual';
      visual.setAttribute('aria-hidden','true');
      visual.textContent=String(item.icon||'🧱');

      const name=document.createElement('div');
      name.className='product-name';
      name.textContent=localized(item.title,locale);

      const note=document.createElement('div');
      note.className='product-note';
      note.textContent=localized(item.note,locale);

      card.append(visual,name,note,createAction(item,locale,'commerce-link',status));
      container.appendChild(card);
    });
  }

  function renderSupport(config,locale,container,status){
    container.querySelectorAll('[data-commerce-managed]').forEach(function(node){node.remove()});
    const support=config.creatorSupport||{};
    const action=createAction(support,locale,'support-link',status);
    action.dataset.commerceManaged='true';
    container.prepend(action);
  }

  /* 未开放时的可见性兜底：只有存在 active+verified 的 HTTPS 目标，才允许橱窗区域显示。
     默认隐藏，保证访客看不到商品卡、支援入口和「链接待配置」状态条。 */
  function hasOpenDestination(config){
    const items=Array.isArray(config.products)?config.products.slice():[];
    items.push(config.creatorSupport||{});
    return items.some(function(item){return safeDestination(item)!==''});
  }

  function syncVisibility(config,container){
    const row=container.closest('.commerce-row')||document.getElementById('commerceRow')||container.parentElement;
    if(!row)return;
    if(hasOpenDestination(config)){
      row.removeAttribute('hidden');
      row.removeAttribute('aria-hidden');
    }else{
      row.setAttribute('hidden','');
      row.setAttribute('aria-hidden','true');
    }
  }

  function render(options){
    const config=window.MUMU_COMMERCE_CONFIG;
    if(!config)return false;
    const locale=options&&options.locale==='en'?'en':'zh';
    const products=document.getElementById(options.productContainerId);
    const support=document.getElementById(options.supportContainerId);
    const status=document.getElementById(options.statusId);
    if(!products||!support)return false;
    renderProducts(config,locale,products,status);
    renderSupport(config,locale,support,status);
    syncVisibility(config,products);
    return true;
  }

  window.MumuCommerce={
    render:render,
    safeDestination:safeDestination,
    recordLocalClick:function(id){
      return window.MUMU_COMMERCE_CONFIG?recordClick(window.MUMU_COMMERCE_CONFIG,String(id||'')):0;
    },
    getLocalClickCounts:function(){
      return window.MUMU_COMMERCE_CONFIG?readCounts(window.MUMU_COMMERCE_CONFIG):{};
    }
  };
})();
