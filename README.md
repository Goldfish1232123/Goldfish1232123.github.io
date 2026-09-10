# Goldfish1232123 的博客

纯静态博客，托管在 GitHub Pages。

## 目录说明

- `index.html` —— 首页，文章列表
- `about.html` —— 关于页
- `404.html` —— 自定义 404
- `css/style.css` —— 全部样式
- `js/theme-init.js` —— 首屏主题初始化（防闪）
- `js/main.js` —— 主题切换、年份、导航高亮
- `posts/` —— 所有文章

## 怎么发一篇新文章

1. 复制 `posts/hello-world.html`，改名为 `posts/新文章名.html`
2. 改里面的 `<title>`、`<h1>`、日期、标签、正文
3. 打开 `index.html`，在 `<section class="post-list">` 里复制一张
   `<article class="post-card">...</article>` 卡片，改链接和摘要
4. 提交推送

## 注意

- 文章页里的路径都要带 `../` 前缀
- 文章正文里的标题从 `<h2>` 开始用
- 正文里要显示 HTML 标签，得写 `&lt;` 和 `&gt;`
- 所有文件保存为 **UTF-8 编码**
