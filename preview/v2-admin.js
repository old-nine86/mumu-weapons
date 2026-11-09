/* 沐沐积木武器库 · V2 后台小样逻辑
   - 审核口令只留在内存 / sessionStorage，登录后清空输入框，不回显
   - 示例模式展示带「示例」角标的假结构，方便无口令审美术
   - 不移植整套 AI 精修引擎；指向线上 admin.html
*/
(function () {
  'use strict';

  const CLOUD = window.MUMU_SUPABASE || {};
  const KEY_STORE = 'mumu_v2_admin_review_key_session';
  const state = {
    mode: 'locked', // locked | preview | live
    reviewKey: '',
    pane: 'dash',
    rpcFlags: {
      dashboard: null,
      promotionsAll: null,
      forumTopics: null,
      forumReplies: null,
      forumHide: null,
      quotaUpdate: null,
      history: null
    },
    cache: {
      pending: [],
      approved: [],
      promo: [],
      forumTopics: [],
      forumReplies: [],
      history: [],
      quota: null,
      stats: null
    }
  };

  const SAMPLE = {
    stats: {
      weapons_pending: 2,
      weapons_approved: 9,
      weapons_rejected: 1,
      promotions_pending: 1,
      promotions_approved: 1,
      promotions_rejected: 0,
      forum_topics_visible: 0,
      forum_topics_hidden: 0,
      forum_replies_visible: 0,
      forum_replies_hidden: 0
    },
    pending: [
      {
        id: 'sample-pending-01',
        name: '示例·晨光短剑',
        type: 'sword',
        label: '短剑',
        description: '这是预览结构里的示例武器，不是线上待审数据。',
        skill: '晨光一闪',
        creator: '示例创作者',
        image_url: '../assets/weapon-cutouts/weapon-01.png',
        showcase_url: '../assets/weapon-showcases/weapon-01.webp',
        name_en: 'Sample Dawn Blade',
        label_en: 'Short Blade',
        description_en: 'Preview-only sample card, not live queue data.',
        skill_en: 'Dawn Flash',
        locale: 'both',
        piece_count: 96,
        ai_power: 168,
        card_rarity: 'SR',
        card_score: 82,
        defense: 90,
        crit: 0.16,
        status: 'pending',
        share_proof: '示例推广备注',
        sample: true
      }
    ],
    approved: [
      {
        id: 'sample-approved-01',
        name: '示例·橱窗长枪',
        type: 'spear',
        label: '长柄',
        description: '已通过样式样板。真实数据登录后才会出现。',
        skill: '橱窗突刺',
        creator: '示例馆长',
        image_url: '../assets/weapon-cutouts/weapon-03.png',
        showcase_url: '../assets/weapon-showcases/weapon-03.webp',
        name_en: 'Sample Showcase Spear',
        label_en: 'Polearm',
        description_en: 'Approved-style sample only.',
        skill_en: 'Cabinet Thrust',
        locale: 'both',
        piece_count: 120,
        ai_power: 210,
        card_rarity: 'SSR',
        card_score: 94,
        defense: 102,
        crit: 0.18,
        status: 'approved',
        sample: true
      }
    ],
    promo: [
      {
        id: 'sample-promo-01',
        creator: '示例玩家',
        proof: '在示例平台分享了武器橱窗截图（预览结构，非真实证明）',
        status: 'pending',
        bonus_slots: 10,
        review_note: '',
        created_at: '2026-11-08T02:00:00Z',
        sample: true
      }
    ],
    forumTopics: [
      {
        id: 'sample-topic-01',
        name: '砖砖',
        category: '讨论',
        title: '示例帖：想看更多枪械橱窗',
        body: '这是论坛审核卡片的预览结构。线上目前可能还没有真实帖子。',
        status: 'approved',
        created_at: '2026-11-08T01:00:00Z',
        sample: true
      }
    ],
    forumReplies: [
      {
        id: 'sample-reply-01',
        topic_id: 'sample-topic-01',
        name: '木木',
        body: '示例回复：已记下，会继续补枪械陈列。',
        status: 'approved',
        created_at: '2026-11-08T01:20:00Z',
        sample: true
      }
    ],
    history: [
      {
        kind: 'weapon',
        item_id: 'sample-hist-01',
        title: '示例·已通过短刀',
        actor: '示例创作者',
        status: 'approved',
        review_note: '资料齐全，示例通过',
        reviewed_at: '2026-11-07T12:00:00Z',
        created_at: '2026-11-06T10:00:00Z',
        sample: true
      },
      {
        kind: 'promotion',
        item_id: 'sample-hist-02',
        title: '示例推广证明摘要',
        actor: '示例玩家',
        status: 'approved',
        review_note: '截图清晰',
        reviewed_at: '2026-11-07T09:00:00Z',
        created_at: '2026-11-06T08:00:00Z',
        sample: true
      }
    ],
    quota: { free_per_ip: 50, bonus_per_approved_promotion: 10, updated_at: null, sample: true }
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }
  function cloudBase() { return String(CLOUD.url || '').replace(/\/+$/, ''); }
  function headers() {
    return {
      apikey: CLOUD.anonKey,
      Authorization: 'Bearer ' + CLOUD.anonKey,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    };
  }
  function keyStore() {
    try { return window.sessionStorage; } catch (e) { return null; }
  }
  function rememberKey(k) {
    state.reviewKey = k || '';
    const store = keyStore();
    if (!store) return;
    if (k) store.setItem(KEY_STORE, k); else store.removeItem(KEY_STORE);
  }
  function restoreKey() {
    const store = keyStore();
    if (!store) return '';
    try { return store.getItem(KEY_STORE) || ''; } catch (e) { return ''; }
  }
  function activeKey() { return state.reviewKey || ''; }
  function status(text, tone) {
    const el = $('#statusLine');
    if (!el) return;
    el.textContent = text || '';
    el.dataset.tone = tone || '';
  }
  function typeLabel(t) {
    return t === 'sword' ? '剑刃' : t === 'gun' ? '枪械' : t === 'spear' ? '长柄' : (t || '未知');
  }
  function rarityClass(r) {
    if (r === 'SSR') return 'chip-ssr';
    if (r === 'SR') return 'chip-sr';
    if (r === 'R') return 'chip-r';
    return '';
  }
  function statusChip(st) {
    if (st === 'pending') return '<span class="chip chip-pending">待审核</span>';
    if (st === 'approved') return '<span class="chip chip-approved">已通过</span>';
    if (st === 'rejected') return '<span class="chip chip-rejected">已拒绝</span>';
    if (st === 'hidden') return '<span class="chip chip-hidden">已隐藏</span>';
    return '<span class="chip">' + escapeHTML(st || '') + '</span>';
  }
  function fmtTime(v) {
    if (!v) return '—';
    try {
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return String(v);
      return new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }).format(d) + '（北京时间）';
    } catch (e) { return String(v); }
  }
  function imgOf(item) {
    return item.showcase_url || item.image_url || '../assets/weapon-cutouts/weapon-01.png';
  }

  async function rpc(name, body) {
    const res = await fetch(cloudBase() + '/rest/v1/rpc/' + name, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body || {})
    });
    if (!res.ok) {
      let msg = '请求失败：' + res.status;
      try {
        const data = await res.json();
        msg = data.message || data.error || msg;
      } catch (e) {}
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch (e) { return text; }
  }

  async function restSelect(table, query) {
    const res = await fetch(cloudBase() + '/rest/v1/' + table + '?' + query, {
      method: 'GET',
      headers: headers()
    });
    if (!res.ok) {
      let msg = '读取失败：' + res.status;
      try { const data = await res.json(); msg = data.message || msg; } catch (e) {}
      throw new Error(msg);
    }
    return res.json();
  }

  function setPane(name) {
    state.pane = name;
    $all('.side-nav [data-pane]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.pane === name);
    });
    $all('[data-pane-panel]').forEach(function (panel) {
      panel.classList.toggle('is-active', panel.dataset.panePanel === name);
    });
  }

  function setMode(mode) {
    state.mode = mode;
    const shell = $('#adminShell');
    const banner = $('#previewBanner');
    const auth = $('#topAuthLabel');
    const login = $('#loginShell');
    if (shell) shell.classList.toggle('is-locked', mode === 'locked');
    if (banner) banner.classList.toggle('is-on', mode === 'preview');
    if (login) login.classList.toggle('hidden', mode !== 'locked');
    if (auth) {
      auth.textContent = mode === 'live' ? '已进入' : mode === 'preview' ? '示例中' : '未进入';
    }
    $('#previewToggleBtn').textContent = mode === 'preview' ? '关闭预览结构' : '查看预览结构';
  }

  function renderStats(stats) {
    const s = stats || {};
    $all('[data-stat]').forEach(function (el) {
      const key = el.dataset.stat;
      el.textContent = s[key] == null ? '—' : String(s[key]);
    });
    const reminders = $('#dashReminders');
    if (reminders) {
      const pending = Number(s.weapons_pending || 0);
      const promo = Number(s.promotions_pending || 0);
      const hiddenTopics = Number(s.forum_topics_hidden || 0);
      reminders.innerHTML = [
        item('待审武器', pending ? (pending + ' 件还在排队') : '队列清空，可以歇口气', pending),
        item('推广证明', promo ? (promo + ' 条待核验') : '没有待审证明', promo),
        item('论坛隐藏', hiddenTopics ? (hiddenTopics + ' 条主题仍隐藏') : '暂无隐藏主题', hiddenTopics)
      ].join('');
    }
    function item(title, hint, hot) {
      return '<div class="dash-item"><div><b>' + escapeHTML(title) + '</b><div class="line">' + escapeHTML(hint) + '</div></div><span>' + (hot ? '需处理' : '平静') + '</span></div>';
    }
    renderRpcStatus();
  }

  function renderRpcStatus() {
    const box = $('#dashRpcStatus');
    if (!box) return;
    const rows = [
      ['admin_dashboard_stats', state.rpcFlags.dashboard, '总览一键计数'],
      ['list_admin_promotions', state.rpcFlags.promotionsAll, '推广全量列表'],
      ['list_admin_forum_topics', state.rpcFlags.forumTopics, '论坛主题（含隐藏）'],
      ['admin_set_forum_topic_status', state.rpcFlags.forumHide, '论坛隐藏/恢复'],
      ['admin_update_upload_quota', state.rpcFlags.quotaUpdate, '配额改写'],
      ['list_admin_moderation_history', state.rpcFlags.history, '审核履历']
    ];
    box.innerHTML = rows.map(function (r) {
      const flag = r[1];
      const label = flag === true ? '已开通' : flag === false ? '待开通' : (state.mode === 'preview' ? '示例态' : '未检测');
      return '<div class="dash-item"><div><b>' + escapeHTML(r[2]) + '</b><div class="line">后仓能力</div></div><span>' + label + '</span></div>';
    }).join('');
  }

  function emptyHTML(title, desc) {
    return '<div class="empty-state"><div class="emoji">🧸</div><h3>' + escapeHTML(title) + '</h3><p>' + escapeHTML(desc) + '</p></div>';
  }

  function editorHTML(item) {
    return (
      '<div class="edit-grid">' +
        field('name', '武器名', item.name, 20) +
        field('creator', '创作者', item.creator, 16) +
        selectType(item.type) +
        field('label', '分类名', item.label || typeLabel(item.type), 20) +
        field('skill', '技能', item.skill, 28) +
        field('piece_count', '积木数', item.piece_count || 0, null, 'number') +
        field('ai_power', 'AI战力', item.ai_power || 100, null, 'number') +
        raritySelect(item.card_rarity) +
        field('card_score', '卡片评分', item.card_score || 0, null, 'number') +
        field('defense', '防御', item.defense || 82, null, 'number') +
        field('crit', '暴击', item.crit || 0.12, null, 'number') +
        field('showcase_url', '展示图地址', item.showcase_url || '', null, 'text', 'span-3') +
        localeSelect(item.locale) +
        field('name_en', '英文名', item.name_en || '', 40) +
        field('label_en', '英文分类', item.label_en || '', 28) +
        field('skill_en', '英文技能', item.skill_en || '', 40) +
        '<label class="span-3">中文介绍<textarea data-field="description" maxlength="120">' + escapeHTML(item.description || '') + '</textarea></label>' +
        '<label class="span-3">英文介绍<textarea data-field="description_en" maxlength="180">' + escapeHTML(item.description_en || '') + '</textarea></label>' +
      '</div>'
    );
  }
  function field(name, label, value, max, type, span) {
    const t = type || 'text';
    const maxAttr = max ? (' maxlength="' + max + '"') : '';
    return '<label class="' + (span || '') + '">' + escapeHTML(label) +
      '<input data-field="' + name + '" type="' + t + '" value="' + escapeHTML(value) + '"' + maxAttr + '></label>';
  }
  function selectType(type) {
    return '<label>类型<select data-field="type">' +
      opt('sword', '剑刃', type) + opt('gun', '枪械', type) + opt('spear', '长柄', type) +
      '</select></label>';
  }
  function raritySelect(r) {
    return '<label>收藏等级<select data-field="card_rarity">' +
      opt('', '自动计算', r) + opt('SSR', 'SSR 传说', r) + opt('SR', 'SR 稀有', r) +
      opt('R', 'R 精良', r) + opt('N', 'N 普通', r) +
      '</select></label>';
  }
  function localeSelect(locale) {
    const v = locale || 'both';
    return '<label>显示站点<select data-field="locale">' +
      opt('both', '中英文都显示', v) + opt('zh-CN', '只显示中文站', v) + opt('en', '只显示英文站', v) +
      '</select></label>';
  }
  function opt(value, label, current) {
    return '<option value="' + escapeHTML(value) + '"' + (String(current || '') === String(value) ? ' selected' : '') + '>' + escapeHTML(label) + '</option>';
  }

  function weaponCardHTML(item, kind) {
    const sample = item.sample || state.mode === 'preview';
    const no = String(item.id || '').slice(-2) || '01';
    const actions = kind === 'pending'
      ? '<div class="actions">' +
          '<button type="button" class="btn btn-sm btn-ghost" data-act="save">仅保存</button>' +
          '<button type="button" class="btn btn-sm btn-good" data-act="approve">通过</button>' +
          '<button type="button" class="btn btn-sm btn-bad" data-act="reject">拒绝</button>' +
        '</div>'
      : '<div class="actions">' +
          '<button type="button" class="btn btn-sm btn-good" data-act="save">保存信息</button>' +
        '</div>';
    return (
      '<article class="weapon-card' + (sample ? ' is-sample' : '') + '" data-id="' + escapeHTML(item.id) + '" data-kind="' + escapeHTML(kind) + '">' +
        '<div class="weapon-stage">' +
          '<span class="serial">' + escapeHTML(no) + '</span>' +
          '<img src="' + escapeHTML(imgOf(item)) + '" alt="' + escapeHTML(item.name || '武器') + '">' +
        '</div>' +
        '<div class="weapon-meta">' +
          '<div class="title-row"><h3>' + escapeHTML(item.name || '未命名') + '</h3>' +
            (sample ? '<span class="sample-badge">示例</span>' : '') +
          '</div>' +
          '<div class="chips">' +
            '<span class="chip">' + escapeHTML(typeLabel(item.type)) + '</span>' +
            '<span class="chip">创作者：' + escapeHTML(item.creator || '—') + '</span>' +
            statusChip(item.status || kind) +
            (item.card_rarity ? '<span class="chip ' + rarityClass(item.card_rarity) + '">' + escapeHTML(item.card_rarity) + '</span>' : '') +
          '</div>' +
          '<div class="line">' + escapeHTML(item.description || '等待补全资料') + '</div>' +
          '<div class="line">技能：' + escapeHTML(item.skill || '待生成') + ' · ' + escapeHTML(item.piece_count || 0) + ' 颗 · 战力 ' + escapeHTML(item.ai_power || 100) + '</div>' +
          (kind === 'pending' ? '<div class="line">推广证明：' + escapeHTML(item.share_proof || '无') + '</div>' : '') +
          '<div class="ai-note">AI 精修 / 抠图 / 批量重做橱窗仍在线上后台：' +
            '<a href="../admin.html" target="_blank" rel="noopener">打开 admin.html 工作台</a>。本小样只做审核与资料编辑。</div>' +
          '<details class="details-box" ' + (kind === 'pending' ? 'open' : '') + '><summary>资料编辑（中英双语）</summary><div class="body">' +
            editorHTML(item) +
            (kind === 'pending' ? '<textarea class="note-box" data-note placeholder="审核备注，可不填"></textarea>' : '') +
            actions +
          '</div></details>' +
        '</div>' +
      '</article>'
    );
  }

  function renderWeapons(gridId, rows, kind, emptyTitle, emptyDesc) {
    const grid = $(gridId);
    if (!grid) return;
    if (!rows || !rows.length) {
      grid.innerHTML = emptyHTML(emptyTitle, emptyDesc);
      return;
    }
    grid.innerHTML = rows.map(function (item) { return weaponCardHTML(item, kind); }).join('');
  }

  function promoCardHTML(item) {
    const sample = item.sample || state.mode === 'preview';
    const pending = item.status === 'pending';
    return (
      '<article class="promo-card' + (sample ? ' is-sample' : '') + '" data-id="' + escapeHTML(item.id) + '">' +
        '<div class="meta-row">' +
          '<h3 style="margin:0">' + escapeHTML(item.creator || '未知创作者') + '</h3>' +
          statusChip(item.status) +
          (sample ? '<span class="sample-badge">示例</span>' : '') +
          '<span class="chip">+' + escapeHTML(item.bonus_slots || 10) + ' 名额</span>' +
        '</div>' +
        '<div class="promo-body">' + escapeHTML(item.proof || '') + '</div>' +
        '<div class="line" style="margin-top:8px">提交于 ' + escapeHTML(fmtTime(item.created_at)) +
          (item.reviewed_at ? (' · 审于 ' + escapeHTML(fmtTime(item.reviewed_at))) : '') + '</div>' +
        (pending
          ? '<textarea class="note-box" data-note placeholder="审核备注，可不填" style="margin-top:10px"></textarea>' +
            '<div class="actions" style="margin-top:10px">' +
              '<button type="button" class="btn btn-sm btn-good" data-promo="approved">通过</button>' +
              '<button type="button" class="btn btn-sm btn-bad" data-promo="rejected">拒绝</button>' +
            '</div>'
          : (item.review_note ? '<div class="line" style="margin-top:8px">备注：' + escapeHTML(item.review_note) + '</div>' : '')) +
      '</article>'
    );
  }

  function renderPromos(rows) {
    const grid = $('#promoGrid');
    if (!rows || !rows.length) {
      grid.innerHTML = emptyHTML('暂时没有推广证明', '有人提交推广截图后，会出现在这里。');
      return;
    }
    grid.innerHTML = rows.map(promoCardHTML).join('');
  }

  function renderForum(topics, replies) {
    const grid = $('#forumGrid');
    if ((!topics || !topics.length) && (!replies || !replies.length)) {
      grid.innerHTML = emptyHTML('论坛还是空的', '主题与回复表已就绪，只是目前没有内容。空状态也算一种秩序。');
      return;
    }
    const byTopic = {};
    (replies || []).forEach(function (r) {
      const key = String(r.topic_id);
      (byTopic[key] || (byTopic[key] = [])).push(r);
    });
    grid.innerHTML = (topics || []).map(function (t) {
      const sample = t.sample || state.mode === 'preview';
      const list = byTopic[String(t.id)] || [];
      return (
        '<article class="forum-card' + (sample ? ' is-sample' : '') + '" data-topic-id="' + escapeHTML(t.id) + '">' +
          '<div class="meta-row">' +
            '<span class="chip">' + escapeHTML(t.category || '讨论') + '</span>' +
            statusChip(t.status) +
            (sample ? '<span class="sample-badge">示例</span>' : '') +
            '<span class="chip">' + escapeHTML(t.name || '') + '</span>' +
            '<span class="chip">' + escapeHTML(fmtTime(t.created_at)) + '</span>' +
          '</div>' +
          '<h3>' + escapeHTML(t.title || '') + '</h3>' +
          '<div class="forum-body">' + escapeHTML(t.body || '') + '</div>' +
          '<div class="actions" style="margin-top:12px">' +
            (t.status === 'hidden'
              ? '<button type="button" class="btn btn-sm btn-good" data-topic-status="approved">恢复显示</button>'
              : '<button type="button" class="btn btn-sm btn-ghost" data-topic-status="hidden">隐藏主题</button>') +
          '</div>' +
          (list.length
            ? '<div class="reply-list">' + list.map(function (r) {
                return '<div class="reply-item" data-reply-id="' + escapeHTML(r.id) + '">' +
                  '<div class="meta-row"><span class="who">' + escapeHTML(r.name || '') + '</span>' + statusChip(r.status) +
                  (r.sample || state.mode === 'preview' ? '<span class="sample-badge">示例</span>' : '') + '</div>' +
                  '<div class="txt">' + escapeHTML(r.body || '') + '</div>' +
                  '<div class="actions" style="margin-top:8px">' +
                    (r.status === 'hidden'
                      ? '<button type="button" class="btn btn-sm btn-good" data-reply-status="approved">恢复回复</button>'
                      : '<button type="button" class="btn btn-sm btn-ghost" data-reply-status="hidden">隐藏回复</button>') +
                  '</div></div>';
              }).join('') + '</div>'
            : '') +
        '</article>'
      );
    }).join('');
  }

  function renderQuota(q) {
    const data = q || { free_per_ip: '—', bonus_per_approved_promotion: '—' };
    $('#quotaFree').textContent = data.free_per_ip == null ? '—' : String(data.free_per_ip);
    $('#quotaBonus').textContent = data.bonus_per_approved_promotion == null ? '—' : String(data.bonus_per_approved_promotion);
    if (data.free_per_ip != null) $('#quotaFreeInput').value = data.free_per_ip;
    if (data.bonus_per_approved_promotion != null) $('#quotaBonusInput').value = data.bonus_per_approved_promotion;
    const updated = $('#quotaUpdated');
    if (data.sample) {
      updated.textContent = '当前为示例数值。登录后会读取站点真实配额。';
    } else if (data.updated_at) {
      updated.textContent = '最近更新：' + fmtTime(data.updated_at);
    } else {
      updated.textContent = '已读取当前配额。若要改写，需先开通配额保存能力。';
    }
  }

  function renderHistory(rows) {
    const list = $('#historyList');
    if (!rows || !rows.length) {
      list.innerHTML = emptyHTML('还没有审核履历', '通过或拒绝武器 / 推广后，会按审核时间出现在这里。');
      return;
    }
    list.innerHTML = rows.map(function (h) {
      const sample = h.sample || state.mode === 'preview';
      const kind = h.kind === 'promotion' ? '推广' : '武器';
      return (
        '<article class="history-card' + (sample ? ' is-sample' : '') + '">' +
          '<div class="meta-row">' +
            '<span class="chip">' + kind + '</span>' +
            statusChip(h.status) +
            (sample ? '<span class="sample-badge">示例</span>' : '') +
            '<span class="chip">' + escapeHTML(fmtTime(h.reviewed_at || h.created_at)) + '</span>' +
          '</div>' +
          '<h3>' + escapeHTML(h.title || h.item_id || '') + '</h3>' +
          '<div class="history-body">创作者 / 提交者：' + escapeHTML(h.actor || '—') +
            (h.review_note ? ('\n备注：' + escapeHTML(h.review_note)) : '') +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function collectFields(card) {
    const fields = {};
    $all('[data-field]', card).forEach(function (input) {
      fields[input.dataset.field] = input.value.trim();
    });
    return fields;
  }

  function fillPreviewData() {
    state.cache.stats = SAMPLE.stats;
    state.cache.pending = SAMPLE.pending;
    state.cache.approved = SAMPLE.approved;
    state.cache.promo = SAMPLE.promo;
    state.cache.forumTopics = SAMPLE.forumTopics;
    state.cache.forumReplies = SAMPLE.forumReplies;
    state.cache.history = SAMPLE.history;
    state.cache.quota = SAMPLE.quota;
    Object.keys(state.rpcFlags).forEach(function (k) { state.rpcFlags[k] = null; });
    $('#dashSub').textContent = '示例结构 · 非线上真实数据';
    paintAll();
  }

  function paintAll() {
    renderStats(state.cache.stats);
    renderWeapons('#pendingGrid', state.cache.pending, 'pending', '没有待审武器', '队列空空如也，后仓可以泡杯茶。');
    renderWeapons('#approvedGrid', state.cache.approved, 'approved', '没有已通过武器', '通过审核的武器会在这里继续打磨资料。');
    renderPromos(state.cache.promo);
    renderForum(state.cache.forumTopics, state.cache.forumReplies);
    renderQuota(state.cache.quota);
    renderHistory(state.cache.history);
  }

  async function probeExtraRpc(flag, name, body) {
    try {
      await rpc(name, body);
      state.rpcFlags[flag] = true;
      return true;
    } catch (err) {
      const msg = String(err && err.message || '');
      if (/could not find|does not exist|404|PGRST202|function/i.test(msg) || err.status === 404) {
        state.rpcFlags[flag] = false;
        return false;
      }
      // invalid key or other errors still mean the function exists
      if (/invalid review key/i.test(msg)) {
        state.rpcFlags[flag] = true;
        throw err;
      }
      state.rpcFlags[flag] = false;
      return false;
    }
  }

  async function loadQuotaReadonly() {
    try {
      const rows = await restSelect('upload_quota_rules', 'id=eq.default&select=free_per_ip,bonus_per_approved_promotion,updated_at');
      state.cache.quota = (rows && rows[0]) || { free_per_ip: 50, bonus_per_approved_promotion: 10 };
    } catch (err) {
      state.cache.quota = { free_per_ip: 50, bonus_per_approved_promotion: 10 };
      status('配额只读读取失败：' + (err.message || '未知错误'), 'warn');
    }
    renderQuota(state.cache.quota);
  }

  async function loadDashboard() {
    const key = activeKey();
    if (!key) return;
    const ok = await probeExtraRpc('dashboard', 'admin_dashboard_stats', { input_review_key: key });
    if (ok) {
      const rows = await rpc('admin_dashboard_stats', { input_review_key: key });
      state.cache.stats = Array.isArray(rows) ? rows[0] : rows;
    } else {
      // fallback assemble from existing RPCs + public forum select
      const pending = await rpc('list_pending_weapons_v2', { input_review_key: key });
      const approved = await rpc('list_admin_weapons', { input_review_key: key });
      let promoPending = [];
      try { promoPending = await rpc('list_pending_promotions', { input_review_key: key }); } catch (e) { promoPending = []; }
      let topics = [], replies = [];
      try { topics = await restSelect('forum_topics', 'select=id&status=eq.approved'); } catch (e) {}
      try { replies = await restSelect('forum_replies', 'select=id&status=eq.approved'); } catch (e) {}
      state.cache.stats = {
        weapons_pending: (pending || []).length,
        weapons_approved: (approved || []).length,
        weapons_rejected: null,
        promotions_pending: (promoPending || []).length,
        promotions_approved: null,
        promotions_rejected: null,
        forum_topics_visible: (topics || []).length,
        forum_topics_hidden: null,
        forum_replies_visible: (replies || []).length,
        forum_replies_hidden: null
      };
      $('#dashSub').textContent = '部分计数来自现有接口；拒绝数 / 隐藏数需开通总览能力。';
    }
    if (state.rpcFlags.dashboard) $('#dashSub').textContent = '已读取完整总览数据';
    renderStats(state.cache.stats);
  }

  async function loadPending() {
    const key = activeKey();
    const rows = await rpc('list_pending_weapons_v2', { input_review_key: key });
    state.cache.pending = rows || [];
    renderWeapons('#pendingGrid', state.cache.pending, 'pending', '没有待审武器', '队列空空如也，后仓可以泡杯茶。');
  }

  async function loadApproved() {
    const key = activeKey();
    const rows = await rpc('list_admin_weapons', { input_review_key: key });
    state.cache.approved = rows || [];
    renderWeapons('#approvedGrid', state.cache.approved, 'approved', '没有已通过武器', '通过审核的武器会在这里继续打磨资料。');
  }

  async function loadPromos() {
    const key = activeKey();
    let rows = [];
    const allOk = await probeExtraRpc('promotionsAll', 'list_admin_promotions', { input_review_key: key });
    if (allOk) {
      rows = await rpc('list_admin_promotions', { input_review_key: key }) || [];
    } else {
      rows = await rpc('list_pending_promotions', { input_review_key: key }) || [];
    }
    state.cache.promo = rows;
    renderPromos(rows);
  }

  async function loadForum() {
    const key = activeKey();
    let topics = [], replies = [];
    const tOk = await probeExtraRpc('forumTopics', 'list_admin_forum_topics', { input_review_key: key });
    if (tOk) {
      topics = await rpc('list_admin_forum_topics', { input_review_key: key }) || [];
      try {
        replies = await rpc('list_admin_forum_replies', { input_review_key: key }) || [];
        state.rpcFlags.forumReplies = true;
      } catch (e) {
        state.rpcFlags.forumReplies = false;
        try { replies = await restSelect('forum_replies', 'select=*&status=eq.approved&order=created_at.desc'); } catch (err) { replies = []; }
      }
      state.rpcFlags.forumHide = null; // tested on action
    } else {
      try { topics = await restSelect('forum_topics', 'select=*&status=eq.approved&order=created_at.desc'); } catch (e) { topics = []; }
      try { replies = await restSelect('forum_replies', 'select=*&status=eq.approved&order=created_at.asc'); } catch (e) { replies = []; }
    }
    state.cache.forumTopics = topics;
    state.cache.forumReplies = replies;
    renderForum(topics, replies);
  }

  async function loadHistory() {
    const key = activeKey();
    const ok = await probeExtraRpc('history', 'list_admin_moderation_history', { input_review_key: key });
    if (ok) {
      state.cache.history = await rpc('list_admin_moderation_history', { input_review_key: key }) || [];
    } else {
      // best-effort: approved weapons lack reviewed_at in list_admin_weapons; show approved names as soft history
      const approved = state.cache.approved.length ? state.cache.approved : (await rpc('list_admin_weapons', { input_review_key: key }) || []);
      let promos = [];
      try {
        if (state.rpcFlags.promotionsAll) promos = await rpc('list_admin_promotions', { input_review_key: key }) || [];
      } catch (e) {}
      state.cache.history = []
        .concat((approved || []).map(function (w) {
          return {
            kind: 'weapon',
            item_id: w.id,
            title: w.name,
            actor: w.creator,
            status: w.status || 'approved',
            review_note: w.review_note || '',
            reviewed_at: w.reviewed_at || null,
            created_at: w.created_at
          };
        }))
        .concat((promos || []).filter(function (p) { return p.status !== 'pending'; }).map(function (p) {
          return {
            kind: 'promotion',
            item_id: p.id,
            title: String(p.proof || '').slice(0, 40),
            actor: p.creator,
            status: p.status,
            review_note: p.review_note || '',
            reviewed_at: p.reviewed_at,
            created_at: p.created_at
          };
        }));
    }
    renderHistory(state.cache.history);
  }

  async function refreshAllLive() {
    status('正在读取后仓数据…');
    await loadQuotaReadonly();
    await loadDashboard();
    await loadPending();
    await loadApproved();
    await loadPromos();
    await loadForum();
    await loadHistory();
    status('后仓数据已刷新。', 'good');
    renderRpcStatus();
  }

  async function login() {
    const input = $('#reviewKey');
    const typed = (input && input.value || '').trim();
    const fallback = activeKey();
    const useKey = typed || fallback;
    if (!useKey) { status('先输入审核口令。', 'warn'); return; }
    rememberKey(useKey);
    if (input) input.value = '';
    status('正在校验口令并读取队列…');
    try {
      await rpc('list_pending_weapons_v2', { input_review_key: activeKey() });
    } catch (err) {
      rememberKey('');
      status(err.message || '口令无效或网络不可用', 'bad');
      setMode('locked');
      return;
    }
    setMode('live');
    setPane('dash');
    try {
      await refreshAllLive();
    } catch (err) {
      status(err.message || '读取失败', 'bad');
    }
  }

  async function saveWeapon(card, silent) {
    if (state.mode !== 'live') { status('示例模式下不会写入数据库。', 'warn'); return; }
    const id = card.dataset.id;
    const fields = collectFields(card);
    if (!silent) status('正在保存武器信息…');
    await rpc('admin_update_weapon', {
      input_review_key: activeKey(),
      weapon_id: id,
      edited_name: fields.name,
      edited_type: fields.type,
      edited_label: fields.label,
      edited_description: fields.description,
      edited_skill: fields.skill,
      edited_creator: fields.creator,
      edited_showcase_url: fields.showcase_url,
      edited_name_en: fields.name_en,
      edited_label_en: fields.label_en,
      edited_description_en: fields.description_en,
      edited_skill_en: fields.skill_en,
      edited_locale: fields.locale,
      edited_piece_count: Number(fields.piece_count || 0),
      edited_ai_power: Number(fields.ai_power || 100),
      edited_card_rarity: fields.card_rarity,
      edited_card_score: Number(fields.card_score || 0),
      edited_defense: Number(fields.defense || 82),
      edited_crit: Number(fields.crit || 0.12)
    });
    if (!silent) status('武器信息已保存。', 'good');
  }

  async function reviewWeapon(card, decision) {
    if (state.mode !== 'live') { status('示例模式下不会写入数据库。', 'warn'); return; }
    const id = card.dataset.id;
    const noteEl = $('[data-note]', card);
    const note = noteEl ? noteEl.value.trim() : '';
    const fields = collectFields(card);
    await saveWeapon(card, true);
    status(decision === 'approved' ? '正在通过…' : '正在拒绝…');
    await rpc('review_weapon_with_edits', {
      input_review_key: activeKey(),
      weapon_id: id,
      decision: decision,
      note: note,
      edited_name: fields.name,
      edited_creator: fields.creator,
      edited_piece_count: Number(fields.piece_count || 0),
      edited_ai_power: Number(fields.ai_power || 100),
      edited_card_rarity: fields.card_rarity,
      edited_card_score: Number(fields.card_score || 0),
      edited_defense: Number(fields.defense || 82),
      edited_crit: Number(fields.crit || 0.12)
    });
    card.remove();
    status(decision === 'approved' ? '已通过。' : '已拒绝。', 'good');
    await loadDashboard();
    await loadPending();
  }

  async function reviewPromo(card, decision) {
    if (state.mode !== 'live') { status('示例模式下不会写入数据库。', 'warn'); return; }
    const id = card.dataset.id;
    const noteEl = $('[data-note]', card);
    const note = noteEl ? noteEl.value.trim() : '';
    status(decision === 'approved' ? '正在通过推广证明…' : '正在拒绝推广证明…');
    await rpc('review_promotion', {
      input_review_key: activeKey(),
      promotion_id: id,
      decision: decision,
      note: note
    });
    status(decision === 'approved' ? '推广证明已通过。' : '推广证明已拒绝。', 'good');
    await loadPromos();
    await loadDashboard();
  }

  async function setTopicStatus(topicId, newStatus) {
    if (state.mode !== 'live') { status('示例模式下不会写入数据库。', 'warn'); return; }
    try {
      await rpc('admin_set_forum_topic_status', {
        input_review_key: activeKey(),
        topic_id: topicId,
        new_status: newStatus
      });
      state.rpcFlags.forumHide = true;
      status(newStatus === 'hidden' ? '主题已隐藏。' : '主题已恢复。', 'good');
      await loadForum();
      await loadDashboard();
    } catch (err) {
      state.rpcFlags.forumHide = false;
      status((err.message || '隐藏失败') + ' · 请先开通论坛审核能力', 'bad');
      renderRpcStatus();
    }
  }

  async function setReplyStatus(replyId, newStatus) {
    if (state.mode !== 'live') { status('示例模式下不会写入数据库。', 'warn'); return; }
    try {
      await rpc('admin_set_forum_reply_status', {
        input_review_key: activeKey(),
        reply_id: replyId,
        new_status: newStatus
      });
      state.rpcFlags.forumHide = true;
      status(newStatus === 'hidden' ? '回复已隐藏。' : '回复已恢复。', 'good');
      await loadForum();
      await loadDashboard();
    } catch (err) {
      state.rpcFlags.forumHide = false;
      status((err.message || '操作失败') + ' · 请先开通论坛审核能力', 'bad');
      renderRpcStatus();
    }
  }

  async function saveQuota() {
    if (state.mode !== 'live') { status('示例模式下不会写入数据库。', 'warn'); return; }
    const free = Number($('#quotaFreeInput').value);
    const bonus = Number($('#quotaBonusInput').value);
    try {
      const rows = await rpc('admin_update_upload_quota', {
        input_review_key: activeKey(),
        new_free_per_ip: free,
        new_bonus_per_approved_promotion: bonus
      });
      state.rpcFlags.quotaUpdate = true;
      state.cache.quota = Array.isArray(rows) ? rows[0] : rows;
      renderQuota(state.cache.quota);
      status('配额已更新。', 'good');
    } catch (err) {
      state.rpcFlags.quotaUpdate = false;
      status((err.message || '保存失败') + ' · 请先开通配额保存能力', 'bad');
      renderRpcStatus();
    }
  }

  function enterPreview() {
    rememberKey('');
    const input = $('#reviewKey');
    if (input) input.value = '';
    setMode('preview');
    setPane('dash');
    fillPreviewData();
    status('已打开示例 / 预览结构。所有卡片带「示例」角标。', 'warn');
  }

  function exitPreview() {
    if (state.mode === 'live') return;
    setMode('locked');
    status('已退出示例。输入口令可进入真实审核。');
  }

  function bind() {
    $('#loginBtn').addEventListener('click', function () { login().catch(function (e) { status(e.message || '登录失败', 'bad'); }); });
    $('#reviewKey').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); $('#loginBtn').click(); }
    });
    $('#previewToggleBtn').addEventListener('click', function () {
      if (state.mode === 'preview') exitPreview(); else enterPreview();
    });
    $('#enterPreviewBtn').addEventListener('click', enterPreview);
    $('#exitPreviewBtn').addEventListener('click', exitPreview);
    $('#refreshDashBtn').addEventListener('click', function () {
      if (state.mode === 'preview') { fillPreviewData(); return; }
      if (state.mode !== 'live') { status('先进入审核或打开示例。', 'warn'); return; }
      refreshAllLive().catch(function (e) { status(e.message || '刷新失败', 'bad'); });
    });
    $('#saveQuotaBtn').addEventListener('click', function () {
      saveQuota().catch(function (e) { status(e.message || '保存失败', 'bad'); });
    });

    $all('[data-refresh]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const kind = btn.dataset.refresh;
        if (state.mode === 'preview') { fillPreviewData(); setPane(kind === 'pending' || kind === 'approved' ? kind : state.pane); return; }
        if (state.mode !== 'live') { status('先进入审核。', 'warn'); return; }
        const map = {
          pending: loadPending,
          approved: loadApproved,
          promo: loadPromos,
          forum: loadForum,
          quota: loadQuotaReadonly,
          history: loadHistory
        };
        const fn = map[kind];
        if (!fn) return;
        fn().then(function () { status('已刷新。', 'good'); }).catch(function (e) { status(e.message || '刷新失败', 'bad'); });
      });
    });

    $all('.side-nav [data-pane]').forEach(function (btn) {
      btn.addEventListener('click', function () { setPane(btn.dataset.pane); });
    });

    document.addEventListener('click', function (e) {
      const weaponAct = e.target.closest('[data-act]');
      if (weaponAct) {
        const card = weaponAct.closest('.weapon-card');
        if (!card) return;
        const act = weaponAct.dataset.act;
        const run = act === 'save' ? saveWeapon(card, false)
          : act === 'approve' ? reviewWeapon(card, 'approved')
          : act === 'reject' ? reviewWeapon(card, 'rejected')
          : null;
        if (run) run.catch(function (err) { status(err.message || '操作失败', 'bad'); });
        return;
      }
      const promoAct = e.target.closest('[data-promo]');
      if (promoAct) {
        const card = promoAct.closest('.promo-card');
        if (!card) return;
        reviewPromo(card, promoAct.dataset.promo).catch(function (err) { status(err.message || '操作失败', 'bad'); });
        return;
      }
      const topicAct = e.target.closest('[data-topic-status]');
      if (topicAct) {
        const card = topicAct.closest('[data-topic-id]');
        if (!card) return;
        setTopicStatus(card.dataset.topicId, topicAct.dataset.topicStatus);
        return;
      }
      const replyAct = e.target.closest('[data-reply-status]');
      if (replyAct) {
        const item = replyAct.closest('[data-reply-id]');
        if (!item) return;
        setReplyStatus(item.dataset.replyId, replyAct.dataset.replyStatus);
      }
    });
  }

  function boot() {
    bind();
    setMode('locked');
    setPane('dash');
    loadQuotaReadonly().catch(function () {});
    // restore session key presence without echoing into the input
    const saved = restoreKey();
    if (saved) {
      state.reviewKey = saved;
      status('检测到本会话已保存过口令（不回显）。点「进入审核」将直接使用它；也可重新输入。');
      // leave input empty on purpose
    }
    // auto-show preview structure so screenshots / art review work without secrets
    // but keep login available; user/parent can open preview explicitly.
    // For first paint of design review, enter preview automatically if URL has ?preview=1
    if (/[?&]preview=1(?:&|$)/.test(location.search)) enterPreview();
    const paneMatch = location.search.match(/[?&]pane=([a-z]+)/);
    if (paneMatch) setPane(paneMatch[1]);
  }

  boot();
})();
