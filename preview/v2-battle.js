/* V2 战场落地页：选人预览，开战跳转到线上完整站点 */
(function () {
  'use strict';
  const FIGHTERS = [
{id:1,name:'炎之统帅',mbti:'ENTJ',group:'NT',weapon:'sword',avatar:'../assets/characters/entj-avatar.webp'},
{id:2,name:'暗影军师',mbti:'INTJ',group:'NT',weapon:'sword',avatar:'../assets/characters/intj-avatar.webp'},
{id:3,name:'机械奇才',mbti:'INTP',group:'NT',weapon:'gun',avatar:'../assets/characters/intp-avatar.webp'},
{id:4,name:'诡雷策士',mbti:'ENTP',group:'NT',weapon:'gun',avatar:'../assets/characters/entp-avatar.webp'},
{id:5,name:'辉光导师',mbti:'ENFJ',group:'NF',weapon:'sword',avatar:'../assets/characters/enfj-avatar.webp'},
{id:6,name:'月影先知',mbti:'INFJ',group:'NF',weapon:'spear',avatar:'../assets/characters/infj-avatar.webp'},
{id:7,name:'光之咏者',mbti:'INFP',group:'NF',weapon:'spear',avatar:'../assets/characters/infp-avatar.webp'},
{id:8,name:'星火游侠',mbti:'ENFP',group:'NF',weapon:'gun',avatar:'../assets/characters/enfp-avatar.webp'},
{id:9,name:'检查员',mbti:'ISTJ',group:'SJ',weapon:'sword',avatar:'../assets/characters/istj-avatar.webp'},
{id:10,name:'坚盾卫士',mbti:'ISFJ',group:'SJ',weapon:'spear',avatar:'../assets/characters/isfj-avatar.webp'},
{id:11,name:'钢铁督军',mbti:'ESTJ',group:'SJ',weapon:'gun',avatar:'../assets/characters/estj-avatar.webp'},
{id:12,name:'暖心护使',mbti:'ESFJ',group:'SJ',weapon:'spear',avatar:'../assets/characters/esfj-avatar.webp'},
{id:13,name:'孤狼猎手',mbti:'ISTP',group:'SP',weapon:'gun',avatar:'../assets/characters/istp-avatar.webp'},
{id:14,name:'绯焰艺者',mbti:'ISFP',group:'SP',weapon:'sword',avatar:'../assets/characters/isfp-avatar.webp'},
{id:15,name:'雷霆先锋',mbti:'ESTP',group:'SP',weapon:'gun',avatar:'../assets/characters/estp-avatar.webp'},
{id:16,name:'烈阳舞者',mbti:'ESFP',group:'SP',weapon:'sword',avatar:'../assets/characters/esfp-avatar.webp'}
  ];
  const state = { p1: null, p2: null };
  const $ = (s) => document.querySelector(s);
  function weaponLabel(w) { return w === 'sword' ? '剑' : w === 'gun' ? '枪' : '长矛'; }
  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
  function renderSlots() {
    function fill(el, fighter, idx) {
      if (!fighter) {
        el.innerHTML = '<div class="ph">' + idx + '</div><b>第' + (idx === '①' ? '一' : '二') + '位战士</b><span>点下方卡片选择</span>';
        return;
      }
      el.innerHTML = '<img src="' + escapeHTML(fighter.avatar) + '" alt="' + escapeHTML(fighter.name) + '"><b>' + escapeHTML(fighter.name) + '</b><span>' + escapeHTML(fighter.mbti) + ' · 偏好' + weaponLabel(fighter.weapon) + '</span>';
    }
    fill($('#slot1'), state.p1, '①');
    fill($('#slot2'), state.p2, '②');
    const hint = $('#battleHint');
    const link = $('#startLink');
    if (state.p1 && state.p2) {
      hint.textContent = state.p1.name + ' vs ' + state.p2.name + '。点击右侧按钮前往线上完整站点开战（本页不运行战斗引擎）。';
      link.href = '../index.html#weapons';
      link.textContent = '去线上开战';
    } else if (state.p1) {
      hint.textContent = '已选 ' + state.p1.name + '。再选一位对手。';
      link.textContent = '带着选择去开战';
    } else {
      hint.textContent = '先点两位战士组成对阵。开战会跳到线上完整站点（不在此页重写战斗引擎）。';
      link.textContent = '带着选择去开战';
    }
    document.querySelectorAll('.fighter-pick').forEach(btn => {
      const id = Number(btn.dataset.id);
      btn.classList.toggle('is-p1', !!(state.p1 && state.p1.id === id));
      btn.classList.toggle('is-p2', !!(state.p2 && state.p2.id === id));
    });
  }
  function renderGrid() {
    const grid = $('#fighterGrid');
    grid.innerHTML = FIGHTERS.map(f => (
      '<button class="fighter-pick" type="button" data-id="' + f.id + '" aria-label="选择 ' + escapeHTML(f.name) + '">' +
        '<div class="stage"><img src="' + escapeHTML(f.avatar) + '" alt="" width="256" height="256" loading="lazy"></div>' +
        '<div class="nm">' + escapeHTML(f.name) + '</div>' +
        '<div class="mb">' + escapeHTML(f.mbti) + ' · ' + f.group + ' · ' + weaponLabel(f.weapon) + '</div>' +
      '</button>'
    )).join('');
    grid.addEventListener('click', e => {
      const btn = e.target.closest('.fighter-pick');
      if (!btn) return;
      const fighter = FIGHTERS.find(x => String(x.id) === btn.dataset.id);
      if (!fighter) return;
      if (!state.p1 || (state.p1 && state.p2)) {
        state.p1 = fighter;
        state.p2 = null;
      } else if (state.p1.id === fighter.id) {
        return;
      } else {
        state.p2 = fighter;
      }
      renderSlots();
    });
  }
  renderGrid();
  renderSlots();
})();
