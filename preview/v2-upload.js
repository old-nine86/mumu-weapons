/* V2 上传页：复用线上公开云端模式（待审插入 + 配额只读 + 推广证明） */
(function () {
  'use strict';
  const CLOUD = window.MUMU_SUPABASE || {};
  const UPLOAD_COUNT_KEY = 'mumu_local_upload_count';
  const PROMO_TOKEN_KEY = 'mumu_promo_client_token';
  const PROMO_BONUS_KEY = 'mumu_promo_bonus_slots';
  const state = {
    type: 'sword',
    pending: null,
    freePerIp: 50,
    bonusRule: 10,
    bonusSlots: 0
  };

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
  function cloudBase() { return String(CLOUD.url || '').replace(/\/+$/, ''); }
  function cloudEnabled() { return !!(CLOUD.enabled && CLOUD.url && CLOUD.anonKey); }
  function headers(extra) {
    return Object.assign({
      apikey: CLOUD.anonKey,
      Authorization: 'Bearer ' + CLOUD.anonKey
    }, extra || {});
  }
  function status(text, tone) {
    const el = $('#status');
    if (!el) return;
    el.textContent = text || '';
    el.dataset.tone = tone || '';
  }
  function typeLabel(t) { return t === 'sword' ? '剑刃' : t === 'gun' ? '枪械' : '长柄'; }
  function typeEmoji(t) { return t === 'sword' ? '🗡️' : t === 'gun' ? '🔫' : '🔱'; }
  function getLocalUploadCount() { return Math.max(0, Number(localStorage.getItem(UPLOAD_COUNT_KEY) || 0)); }
  function getBonusSlots() { return Math.max(0, Number(localStorage.getItem(PROMO_BONUS_KEY) || 0)); }
  function getAllowance() {
    if (!cloudEnabled()) return 1;
    return Math.max(0, Number(state.freePerIp || 50) + getBonusSlots());
  }
  function limitReached() { return getLocalUploadCount() >= getAllowance(); }
  function markUsed() {
    localStorage.setItem(UPLOAD_COUNT_KEY, String(getLocalUploadCount() + 1));
  }
  function getPromotionToken() {
    let token = localStorage.getItem(PROMO_TOKEN_KEY);
    if (!token) {
      token = 'mumu-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
      localStorage.setItem(PROMO_TOKEN_KEY, token);
    }
    return token;
  }
  function refreshQuotaUI() {
    $('#qFree').textContent = String(state.freePerIp);
    $('#qBonusRule').textContent = '+' + String(state.bonusRule);
    const used = getLocalUploadCount();
    const allow = getAllowance();
    $('#qUsed').textContent = used + ' / ' + allow;
    $('#qHint').textContent = cloudEnabled()
      ? (limitReached() ? '名额已用完，可提交推广证明换名额' : '按站点规则自动计算')
      : '当前按本机规则计算，先限 1 件';
    const submit = $('#submitBtn');
    if (submit) submit.disabled = limitReached() || !state.pending;
  }

  async function loadQuotaRules() {
    if (!cloudEnabled()) {
      state.freePerIp = 1;
      state.bonusRule = 10;
      refreshQuotaUI();
      return;
    }
    try {
      const res = await fetch(cloudBase() + '/rest/v1/upload_quota_rules?id=eq.default&select=free_per_ip,bonus_per_approved_promotion', { headers: headers() });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows[0]) {
          state.freePerIp = Number(rows[0].free_per_ip || 50);
          state.bonusRule = Number(rows[0].bonus_per_approved_promotion || 10);
        }
      }
    } catch (e) {}
    try {
      const res = await fetch(cloudBase() + '/rest/v1/rpc/check_promotion_bonus', {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ input_client_token: getPromotionToken() })
      });
      if (res.ok) {
        const rows = await res.json();
        const info = rows && rows[0];
        if (info && Number(info.approved_bonus) >= 0) {
          localStorage.setItem(PROMO_BONUS_KEY, String(Number(info.approved_bonus) || 0));
        }
      }
    } catch (e) {}
    refreshQuotaUI();
  }

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('图片读取失败'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('图片无法识别'));
        img.onload = () => {
          const max = 900;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/webp', 0.86);
          resolve({ dataUrl, width: img.width, height: img.height });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function dataUrlToBlob(dataUrl) {
    const parts = String(dataUrl).split(',');
    const mime = (parts[0].match(/:(.*?);/) || [])[1] || 'image/webp';
    const bin = atob(parts[1] || '');
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  function guessTypeFromName(name) {
    const n = String(name || '').toLowerCase();
    if (/枪|炮|弩|blaster|gun|rifle/.test(n)) return 'gun';
    if (/矛|戟|枪头|spear|trident|lance/.test(n)) return 'spear';
    return 'sword';
  }

  function setType(t) {
    state.type = t;
    $$('.type-chip').forEach(btn => btn.setAttribute('aria-pressed', btn.dataset.type === t ? 'true' : 'false'));
    const skill = $('#skillName');
    if (skill && !skill.value.trim()) skill.placeholder = typeEmoji(t) + ' 积木闪光连击';
  }

  async function onFile(file) {
    if (!file) return;
    if (limitReached()) {
      status('这个浏览器的上传名额已用完。可先提交推广证明换名额。', 'warn');
      return;
    }
    status('正在读取图片…');
    try {
      const packed = await compressImage(file);
      state.pending = {
        img: packed.dataUrl,
        originalImg: packed.dataUrl,
        t: guessTypeFromName(file.name),
        analysis: {
          pieceCount: 24,
          aiPower: 120,
          defense: 86,
          crit: 0.14,
          confidence: 60,
          tags: ['玩家原创上传'],
          admin_refinement_required: true
        }
      };
      setType(state.pending.t);
      $('#dropEmpty').style.display = 'none';
      $('#previewPane').classList.add('is-on');
      $('#imgOriginal').src = packed.dataUrl;
      $('#imgSubmit').src = packed.dataUrl;
      status('照片已选好。填好名字和介绍就可以提交，抠图由站长统一处理。', 'good');
      refreshQuotaUI();
    } catch (err) {
      status((err && err.message) || '图片处理失败', 'bad');
    }
  }

  function clearFile() {
    state.pending = null;
    $('#fileInput').value = '';
    $('#dropEmpty').style.display = '';
    $('#previewPane').classList.remove('is-on');
    status('请选一张平放拍摄的照片。提交后会先进入审核。');
    refreshQuotaUI();
  }

  async function saveToCloud(item) {
    const bucket = CLOUD.imageBucket || 'mumu-weapon-images';
    const table = CLOUD.weaponsTable || 'weapons';
    const imagePath = 'weapon-' + item.i + '.webp';
    const blob = dataUrlToBlob(item.img);
    const uploadRes = await fetch(cloudBase() + '/storage/v1/object/' + encodeURIComponent(bucket) + '/' + encodeURIComponent(imagePath), {
      method: 'POST',
      headers: headers({ 'Content-Type': 'image/webp', 'x-upsert': 'false' }),
      body: blob
    });
    if (!uploadRes.ok) {
      let msg = '图片上传失败：' + uploadRes.status;
      try { const j = await uploadRes.json(); msg = j.message || msg; } catch (e) {}
      throw new Error(msg);
    }
    const imageUrl = cloudBase() + '/storage/v1/object/public/' + encodeURIComponent(bucket) + '/' + encodeURIComponent(imagePath);
    const analysis = Object.assign({}, item.analysis || {}, {
      original_image_url: imageUrl,
      refined_image_url: '',
      admin_refinement_required: true
    });
    const row = {
      id: String(item.i),
      name: item.n,
      type: item.t,
      label: item.l,
      description: item.d,
      features: item.f,
      skill: item.s,
      fx: item.fx,
      creator: item.creator,
      image_url: imageUrl,
      defense: item.def.df,
      crit: item.def.cr,
      piece_count: item.pieceCount || 0,
      ai_power: item.aiPower || 100,
      analysis,
      status: 'pending',
      share_proof: item.shareProof || ''
    };
    const insertRes = await fetch(cloudBase() + '/rest/v1/' + encodeURIComponent(table), {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
      body: JSON.stringify(row)
    });
    if (!insertRes.ok) {
      let msg = '武器保存失败：' + insertRes.status;
      try { const j = await insertRes.json(); msg = j.message || msg; } catch (e) {}
      throw new Error(msg);
    }
    return row;
  }

  async function submitWeapon() {
    if (!state.pending || limitReached()) return;
    const name = ($('#weaponName').value.trim() || '未命名积木武器').slice(0, 20);
    const creator = ($('#creatorName').value.trim() || '匿名创造者').slice(0, 16);
    const t = state.type || state.pending.t;
    const skill = ($('#skillName').value.trim() || (typeEmoji(t) + ' 积木闪光连击')).slice(0, 22);
    const desc = ($('#desc').value.trim() || '由玩家上传的原创积木武器，等待站长审核。').slice(0, 90);
    const shareProof = $('#shareProof').value.trim().slice(0, 180);
    const analysis = state.pending.analysis || {};
    const id = Date.now();
    const item = {
      i: id,
      n: name,
      t,
      l: typeLabel(t),
      d: desc,
      f: ['玩家原创上传', '自动识别：' + typeLabel(t), 'AI战力：' + (analysis.aiPower || 120), '创造者：' + creator],
      s: skill,
      fx: typeEmoji(t),
      creator,
      shareProof,
      img: state.pending.img,
      originalImg: state.pending.originalImg,
      def: { df: analysis.defense || 86, cr: analysis.crit || 0.14 },
      pieceCount: analysis.pieceCount || 24,
      aiPower: analysis.aiPower || 120,
      analysis
    };
    try {
      if (cloudEnabled()) {
        status('正在提交，请稍等…');
        await saveToCloud(item);
        markUsed();
        clearFile();
        status('已提交审核：' + name + '。通过后会出现在橱窗里。', 'good');
      } else {
        markUsed();
        clearFile();
        status('暂时无法提交审核，已先记入本机次数。请稍后再试。', 'warn');
      }
      refreshQuotaUI();
    } catch (err) {
      status((err && err.message) || '上传失败', 'bad');
    }
  }

  async function submitPromo() {
    if (!cloudEnabled()) {
      status('暂时无法提交推广证明，请稍后再试。', 'warn');
      return;
    }
    const creator = ($('#creatorName').value.trim() || '匿名创造者').slice(0, 16);
    const proof = $('#shareProof').value.trim();
    if (!proof) {
      status('先在“推广证明”里填写分享链接、平台账号或截图说明。', 'warn');
      return;
    }
    try {
      status('正在提交推广证明，等待站长审核…');
      const res = await fetch(cloudBase() + '/rest/v1/promotion_submissions', {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
        body: JSON.stringify({
          creator,
          proof: proof.slice(0, 180),
          status: 'pending',
          bonus_slots: Number(state.bonusRule || 10),
          client_token: getPromotionToken()
        })
      });
      if (!res.ok) {
        let msg = '推广证明提交失败：' + res.status;
        try { const j = await res.json(); msg = j.message || msg; } catch (e) {}
        throw new Error(msg);
      }
      status('推广证明已提交。审核通过后会增加上传名额。', 'good');
    } catch (err) {
      status((err && err.message) || '提交失败', 'bad');
    }
  }

  function bind() {
    $$('.type-chip').forEach(btn => btn.addEventListener('click', () => setType(btn.dataset.type)));
    $('#fileInput').addEventListener('change', e => onFile(e.target.files && e.target.files[0]));
    const stage = $('#dropStage');
    stage.addEventListener('dragover', e => { e.preventDefault(); stage.classList.add('is-over'); });
    stage.addEventListener('dragleave', () => stage.classList.remove('is-over'));
    stage.addEventListener('drop', e => {
      e.preventDefault();
      stage.classList.remove('is-over');
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      onFile(file);
    });
    $('#clearBtn').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); clearFile(); });
    $('#submitBtn').addEventListener('click', () => submitWeapon());
    $('#promoBtn').addEventListener('click', () => submitPromo());
  }

  bind();
  loadQuotaRules();
  if (!cloudEnabled()) status('当前为展示小样，提交和名额先记在本机。', 'warn');
})();
