/* V2 论坛页：公开读取 approved topics/replies，并可匿名发帖回复 */
(function () {
  'use strict';
  const CLOUD = window.MUMU_SUPABASE || {};
  const state = { posts: [], filter: 'all', cloudReady: false };

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
    const el = $('#forumStatus');
    if (!el) return;
    el.textContent = text || '';
    el.dataset.tone = tone || '';
  }
  function fmtTime(v) {
    try {
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return '';
      return new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      }).format(d) + '（北京时间）';
    } catch (e) { return ''; }
  }
  function tagEmoji(cat) {
    return cat === '建议' ? '💡' : cat === '反馈' ? '🛠️' : cat === '晒图' ? '🧱' : '💬';
  }

  async function loadForum() {
    if (!cloudEnabled()) {
      state.posts = [];
      state.cloudReady = false;
      render();
      status('未连接云端，暂不能读取公开论坛。', 'warn');
      return;
    }
    status('正在读取云端论坛…');
    try {
      const topicRes = await fetch(cloudBase() + '/rest/v1/forum_topics?select=id,name,category,title,body,created_at&status=eq.approved&order=created_at.desc&limit=80', { headers: headers() });
      if (!topicRes.ok) throw new Error('论坛读取失败：' + topicRes.status);
      const topics = await topicRes.json();
      let replies = [];
      if (topics.length) {
        const replyRes = await fetch(cloudBase() + '/rest/v1/forum_replies?select=id,topic_id,name,body,created_at&status=eq.approved&order=created_at.asc&limit=240', { headers: headers() });
        if (!replyRes.ok) throw new Error('回复读取失败：' + replyRes.status);
        replies = await replyRes.json();
      }
      const byTopic = {};
      replies.forEach(r => {
        const id = String(r.topic_id);
        (byTopic[id] || (byTopic[id] = [])).push({
          id: r.id,
          name: r.name,
          text: r.body,
          ts: r.created_at
        });
      });
      state.posts = topics.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        title: t.title,
        body: t.body,
        ts: t.created_at,
        cloud: true,
        replies: byTopic[String(t.id)] || []
      }));
      state.cloudReady = true;
      status(topics.length ? '已同步云端公开帖。' : '云端论坛还是空的，来发第一条吧。', topics.length ? 'good' : '');
      render();
    } catch (err) {
      state.cloudReady = false;
      state.posts = [];
      render();
      status((err && err.message) || '读取失败', 'bad');
    }
  }

  function render() {
    const list = $('#forumList');
    const count = $('#forumCount');
    const posts = state.posts.filter(p => state.filter === 'all' || p.category === state.filter);
    const totalReplies = posts.reduce((n, p) => n + (p.replies ? p.replies.length : 0), 0);
    count.textContent = posts.length + ' 个帖子 · ' + totalReplies + ' 条回复' + (state.cloudReady ? ' · 云端' : '');
    if (!posts.length) {
      list.innerHTML = '<div class="empty-soft"><div class="emoji">🧸</div><h3>还没有讨论</h3><p>' +
        (state.filter === 'all'
          ? '留言墙空空的。左侧发一条建议、讨论或晒图吧。'
          : '这个分类暂时没有帖子，换个分类看看，或发第一条。') +
        '</p></div>';
      return;
    }
    list.innerHTML = posts.map(p => {
      const replies = (p.replies || []).slice(-6).map(r =>
        '<div class="reply"><b>' + escapeHTML(r.name) + '</b> · ' + escapeHTML(fmtTime(r.ts)) + '<br>' + escapeHTML(r.text) + '</div>'
      ).join('');
      return (
        '<article class="topic-card" data-id="' + escapeHTML(p.id) + '">' +
          '<div class="topic-top"><span class="tag">' + tagEmoji(p.category) + ' ' + escapeHTML(p.category) + '</span></div>' +
          '<h3>' + escapeHTML(p.title) + '</h3>' +
          '<div class="topic-meta">由 ' + escapeHTML(p.name) + ' 发布 · ' + escapeHTML(fmtTime(p.ts)) + '</div>' +
          '<div class="topic-body">' + escapeHTML(p.body) + '</div>' +
          (replies ? '<div class="replies">' + replies + '</div>' : '') +
          '<div class="reply-row">' +
            '<input maxlength="120" placeholder="回复这个话题..." data-reply-input>' +
            '<button class="btn btn-yellow" type="button" data-reply-btn style="min-height:42px;padding:8px 16px;border-radius:999px;border:0;font-weight:900;cursor:pointer">回复</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  async function postTopic() {
    const name = ($('#forumName').value.trim() || '匿名玩家').slice(0, 16);
    const category = ($('#forumCategory').value || '讨论').slice(0, 12);
    const title = $('#forumTitle').value.trim().slice(0, 34);
    const body = $('#forumBody').value.trim().slice(0, 240);
    if (!title || !body) {
      status('标题和内容都要填写。', 'warn');
      return;
    }
    if (!cloudEnabled()) {
      status('未连接云端，无法发布。', 'bad');
      return;
    }
    status('正在发布到云端论坛…');
    try {
      const res = await fetch(cloudBase() + '/rest/v1/forum_topics', {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
        body: JSON.stringify({ name, category, title, body, status: 'approved' })
      });
      if (!res.ok) {
        let msg = '发布失败：' + res.status;
        try { const j = await res.json(); msg = j.message || msg; } catch (e) {}
        throw new Error(msg);
      }
      $('#forumTitle').value = '';
      $('#forumBody').value = '';
      status('已发布到云端论坛。', 'good');
      await loadForum();
    } catch (err) {
      status((err && err.message) || '发布失败', 'bad');
    }
  }

  async function postReply(topicId, input) {
    const text = (input.value || '').trim().slice(0, 120);
    if (!text) return;
    const author = ($('#forumName').value.trim() || '匿名玩家').slice(0, 16);
    if (!cloudEnabled()) {
      status('未连接云端，无法回复。', 'bad');
      return;
    }
    try {
      const res = await fetch(cloudBase() + '/rest/v1/forum_replies', {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
        body: JSON.stringify({ topic_id: topicId, name: author, body: text, status: 'approved' })
      });
      if (!res.ok) {
        let msg = '回复失败：' + res.status;
        try { const j = await res.json(); msg = j.message || msg; } catch (e) {}
        throw new Error(msg);
      }
      input.value = '';
      status('回复已同步到云端。', 'good');
      await loadForum();
    } catch (err) {
      status((err && err.message) || '回复失败', 'bad');
    }
  }

  function bind() {
    $('#postBtn').addEventListener('click', postTopic);
    $$('.filter-chips button').forEach(btn => {
      btn.addEventListener('click', () => {
        state.filter = btn.dataset.filter;
        $$('.filter-chips button').forEach(b => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
        render();
      });
    });
    $('#forumList').addEventListener('click', e => {
      const btn = e.target.closest('[data-reply-btn]');
      if (!btn) return;
      const card = btn.closest('[data-id]');
      const input = card && card.querySelector('[data-reply-input]');
      if (!card || !input) return;
      postReply(card.dataset.id, input);
    });
  }

  bind();
  loadForum();
})();
