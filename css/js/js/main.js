(function () {
  'use strict';

  var root = document.documentElement;
  var btn  = document.getElementById('theme-toggle');
  var meta = document.querySelector('meta[name="theme-color"]');

  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  function isDark() { return root.getAttribute('data-theme') === 'dark'; }

  function paint() {
    var dark = isDark();
    if (meta) meta.setAttribute('content', dark ? '#14161a' : '#ffffff');
    if (btn) {
      btn.innerHTML = dark ? SUN : MOON;
      var label = dark ? '切换到浅色模式' : '切换到深色模式';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    }
  }

  paint();

  if (btn) {
    btn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('blog-theme', next); } catch (e) {}
      paint();
    });
  }

  /* 双 rAF：首帧绘制完之后再开启过渡，彻底杜绝刷新闪渐变 */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      root.classList.add('theme-ready');
    });
  });

  /* 用户没手动选过时，跟随系统主题切换 */
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function (e) {
      var saved = null;
      try { saved = localStorage.getItem('blog-theme'); } catch (err) {}
      if (saved) return;
      root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      paint();
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* 页脚年份 */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* 自动高亮当前页导航 */
  var here = location.pathname.replace(/index\.html$/, '');
  var links = document.querySelectorAll('.nav a[href]');
  for (var i = 0; i < links.length; i++) {
    var a = links[i];
    var abs;
    try { abs = new URL(a.getAttribute('href'), location.href).pathname; }
    catch (e) { continue; }
    if (abs.replace(/index\.html$/, '') === here) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  }
})();
