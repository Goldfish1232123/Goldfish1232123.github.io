/* 首页：hero 统计 + 平台/类型筛选 + 关键词搜索
   无 JS 时全部卡片仍然可见（筛选条默认 hidden，由本脚本启用） */
(function () {
  'use strict';

  var wrap = document.getElementById('post-cards');
  if (!wrap) return;

  var cards  = [].slice.call(wrap.querySelectorAll('.post-card'));
  var bar    = document.getElementById('filter-bar');
  var search = document.getElementById('filter-search');
  var countEl = document.getElementById('filter-count');
  var reset  = document.getElementById('filter-reset');
  var empty  = document.getElementById('filter-empty');

  /* ---------- 每张卡片的可搜索文本 ---------- */
  cards.forEach(function (c) {
    c._hay = (c.textContent + ' ' + (c.dataset.platform || '') + ' ' + (c.dataset.type || ''))
      .toLowerCase();
  });

  /* 只有带类型的才是 writeup（task01 之类不计入统计 / 分母） */
  var writeups = cards.filter(function (c) { return !!c.dataset.type; });

  /* ---------- hero 统计（按类型自动汇总） ---------- */
  var statsEl = document.getElementById('hero-stats');
  if (statsEl) {
    var byType = {}, typeOrder = [], platforms = [];
    writeups.forEach(function (c) {
      var t = c.dataset.type;
      if (!(t in byType)) { byType[t] = 0; typeOrder.push(t); }
      byType[t]++;
      var p = c.dataset.platform;
      if (p && platforms.indexOf(p) === -1) platforms.push(p);
    });
    typeOrder.sort(function (a, b) { return byType[b] - byType[a]; });
    statsEl.innerHTML =
      '共 <b>' + writeups.length + '</b> 篇 Writeup · ' + platforms.join(' / ') + ' 平台 · ' +
      typeOrder.map(function (t) { return t + ' <b>' + byType[t] + '</b>'; }).join(' · ');
    statsEl.hidden = false;
  }

  if (!bar || !search) return;

  /* ---------- 依据卡片数据生成筛选按钮（以后加平台/类型会自动出现） ---------- */
  function uniq(key) {
    var seen = {}, out = [];
    cards.forEach(function (c) {
      var v = c.dataset[key];
      if (v && !seen[v]) { seen[v] = 1; out.push(v); }
    });
    return out;
  }
  function buildChips(hostId, dim, values) {
    var host = document.getElementById(hostId);
    if (!host) return;
    values.forEach(function (v) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (v === 'all' ? ' is-active' : '');
      b.setAttribute('data-dim', dim);
      b.setAttribute('data-value', v);
      b.setAttribute('aria-pressed', v === 'all' ? 'true' : 'false');
      b.textContent = v === 'all' ? '全部' : v;
      host.appendChild(b);
    });
  }
  buildChips('filter-platforms', 'platform', ['all'].concat(uniq('platform')));
  buildChips('filter-types', 'type', ['all'].concat(uniq('type')));

  var state = { platform: 'all', type: 'all', q: '' };

  /* ---------- 从 URL 恢复状态（可分享筛选结果） ---------- */
  (function initFromUrl() {
    var p = new URLSearchParams(location.search);
    ['platform', 'type', 'q'].forEach(function (k) {
      var v = p.get(k);
      if (v) state[k] = v;
    });
    if (state.q) search.value = state.q;
  })();

  function syncUrl() {
    var p = new URLSearchParams();
    if (state.platform !== 'all') p.set('platform', state.platform);
    if (state.type !== 'all') p.set('type', state.type);
    if (state.q.trim()) p.set('q', state.q.trim());
    var qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  function apply(updateUrl) {
    var words = state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    var visible = 0, lastVisible = null;
    cards.forEach(function (c) {
      var ok = (state.platform === 'all' || c.dataset.platform === state.platform) &&
               (state.type === 'all' || c.dataset.type === state.type) &&
               words.every(function (w) { return c._hay.indexOf(w) !== -1; });
      c.hidden = !ok;
      if (ok) { visible++; lastVisible = c; }
    });
    cards.forEach(function (c) { c.classList.remove('is-last'); });
    if (lastVisible) lastVisible.classList.add('is-last');

    var filtering = state.platform !== 'all' || state.type !== 'all' || !!state.q.trim();
    if (countEl) countEl.textContent = filtering ? visible + ' / ' + writeups.length + ' 篇' : '';
    if (reset) reset.hidden = !filtering;
    if (empty) empty.hidden = visible !== 0;

    [].forEach.call(bar.querySelectorAll('.chip'), function (b) {
      var on = state[b.getAttribute('data-dim')] === b.getAttribute('data-value');
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    if (updateUrl !== false) syncUrl();
  }

  bar.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.chip') : null;
    if (!b) return;
    state[b.getAttribute('data-dim')] = b.getAttribute('data-value');
    apply();
  });

  if (reset) {
    reset.addEventListener('click', function () {
      state.platform = 'all'; state.type = 'all'; state.q = '';
      search.value = '';
      apply();
      search.focus();
    });
  }

  var timer = null;
  search.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () { state.q = search.value; apply(); }, 120);
  });
  search.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { search.value = ''; state.q = ''; apply(); }
  });

  /* 按 “/” 快速聚焦搜索框 */
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
    search.focus();
  });

  bar.hidden = false;

  /* 触屏设备没有物理键盘，去掉 “/” 提示 */
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
    search.placeholder = '搜索题目名、摘要或标签';
  }

  apply(false);
})();
