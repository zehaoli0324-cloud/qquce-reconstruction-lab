import catalog from "../../../data/observed/catalog.json" with { type: "json" };

const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function publicCatalogRoute(path, { icon }) {
  if (path === "/quiz")
    return `<main id="main" class="observed-catalog"><div class="observed-nav"><a href="/assessments" data-route>${icon("arrow-left")}可答题库</a><span>心序练习 · 公开界面复刻</span></div><p class="observed-kicker">测评列表</p><h1>选择你想进行的测评</h1><p class="observed-subtitle">原站公开目录的 9 个产品。完整题库与报告尚未取得，下方只展示已观察的信息。</p><div class="observed-catalog-grid">${catalog.items.map((item) => `<a class="observed-product" href="/quiz/${esc(item.code)}" data-route><span class="observed-product-icon">${icon("file-check-2")}</span><p class="observed-category">${esc(item.category)}</p><h2>${esc(item.name)}</h2><p class="observed-intro">${esc(item.introduction)}</p><div class="observed-product-footer"><span>${item.question_count} 题 · 约 ${item.estimated_minutes} 分钟</span><strong>查看公开信息 ${icon("arrow-right")}</strong></div></a>`).join("")}</div><p class="observed-catalog-footnote">已接入可实际作答的 40 道公开 MBTI 原题，使用独立本地计分。<a href="/assessment/mbti-public" data-route>开始作答 →</a></p></main>`;
  const match = path.match(/^\/quiz\/([^/]+)$/);
  if (!match) return null;
  const item = catalog.items.find((item) => item.code === match[1]);
  if (!item) return null;
  return `<main id="main" class="observed-catalog observed-detail"><div class="observed-nav"><a href="/quiz" data-route>${icon("arrow-left")}公开测评目录</a><span>独立练习 · 非原站服务</span></div><p class="observed-kicker">${esc(item.category)} / 公开信息</p><h1>${esc(item.name)}</h1><p class="observed-detail-intro">${esc(item.introduction)}</p><div class="observed-detail-facts"><span><strong>${item.question_count}</strong>原站标示题数</span><span><strong>${item.estimated_minutes}</strong>约需分钟</span></div><section class="observed-status"><h2>题库尚未取得</h2><p>已观察到公开介绍页和开始入口，原站问卷需通过其授权流程。此练习没有该产品的完整题目、权重或报告，不提供伪造的原站授权码。</p><p>如后续取得合法可用的题库数据，可按本项目的数据格式接入；目前可以先完成已公开的 40 题 MBTI。</p></section><div class="observed-detail-actions"><a class="button primary" href="/assessment/mbti-public" data-route>体验 40 道公开原题 ${icon("arrow-right")}</a><a class="button secondary" href="/assessments" data-route>查看其他独立样题</a></div><p class="observed-catalog-footnote">原站题目与作品权利归其权利人；来源与差异已记录。本练习不连接原站验证或提交接口。</p></main>`;
}
