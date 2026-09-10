/* 首屏主题初始化：在任何内容渲染前设置 data-theme，避免闪白/闪黑 */
(function () {
  var t = null;
  try { t = localStorage.getItem('blog-theme'); } catch (e) {}
  if (!t) {
    t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark' : 'light';
  }
  var root = document.documentElement;
  root.setAttribute('data-theme', t);

  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t === 'dark' ? '#14161a' : '#ffffff');
})();
