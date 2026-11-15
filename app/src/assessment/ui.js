import { banks, getBank } from "./banks.js";
import { createAttempt, inspectAnswers, scoreAssessment } from "./engine.js";
import "./assessment.css";
import { publicCatalogRoute } from "./public-catalog.js";

const PREFIX = "xin-xu-assess-v1:";
const memory = new Map();
let ui;
let filter = "all";
const labels = { low: "较少出现", middle: "有时出现", high: "经常出现" };
const esc = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const read = (key, fallback) => {
  if (memory.has(key)) return memory.get(key);
  try {
    return JSON.parse(localStorage.getItem(PREFIX + key)) ?? fallback;
  } catch {
    return memory.get(key) ?? fallback;
  }
};
const write = (key, value) => {
  memory.set(key, value);
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    ui.notify(
      "浏览器存储不可用，答案仅保留在本次打开的页面中。请及时导出报告。",
    );
    return false;
  }
};
function draft(bank) {
  const saved = read(`draft:${bank.id}`, {});
  if (saved.version !== bank.version)
    return { version: bank.version, position: 0, answers: {} };
  return {
    version: bank.version,
    position: Number.isInteger(saved.position)
      ? Math.min(Math.max(0, saved.position), bank.questions.length - 1)
      : 0,
    answers: { ...inspectAnswers(bank, saved.answers).answers },
  };
}
const footer = () =>
  `<footer class="assessment-footer"><span>心序练习 · 独立实现</span><a href="/assessments" data-route>测评目录</a><a href="/reports" data-route>本机报告</a><a href="/demo" data-route>模拟工作台</a></footer>`;
const shell = (content) =>
  `${ui.header()}<main id="main" class="assessment-main container">${content}${footer()}</main>`;
const link = (url, text, type = "primary") =>
  `<a class="button ${type}" href="${url}" data-route>${text}</a>`;
const sourceBadge = (bank) =>
  `<span class="source-badge">${bank.provenance.kind === "original-demo" ? "独立样题" : "原站公开题"}</span>`;

function catalog() {
  const selected = banks.filter((b) => filter === "all" || b.type === filter);
  return shell(
    `<div class="assessment-heading"><div><p class="section-kicker">ASSESSMENT LIBRARY</p><h1>留一点时间，了解自己。</h1><p>选一份问卷，按自己的节奏完成。</p></div>${link("/reports", `${ui.icon("file-check-2")}本机报告`, "secondary")}</div><aside class="assessment-disclosure">${ui.icon("shield-check")}<p><strong>40 道原题来自原站公开 MBTI 页面；另有 32 道独立样题。</strong>原站 MBTI 计分规则未验证，本地使用独立 A/B 计数。独立样题不是原站题目。答案保存在当前浏览器。</p></aside><div class="catalog-toolbar"><div class="catalog-filters" role="group" aria-label="筛选测评">${[
      ["all", "全部测评"],
      ["dichotomy", "公开原题"],
      ["profile", "自我观察"],
      ["quiz", "知识练习"],
    ]
      .map(
        ([id, label]) =>
          `<button class="filter-tab ${filter === id ? "active" : ""}" data-assess="filter" data-filter="${id}" aria-pressed="${filter === id}">${label}</button>`,
      )
      .join(
        "",
      )}</div><span>${selected.length} 份测评</span></div><section class="assessment-grid" aria-label="可用测评">${selected
      .map((bank, i) => {
        const saved = draft(bank);
        const count = inspectAnswers(bank, saved.answers).answered;
        return `<article class="assessment-card"><div class="card-meta"><span>${esc(bank.category)}</span>${sourceBadge(bank)}</div><div class="assessment-art art-${bank.type === "quiz" ? "quiz" : i % 2}" aria-hidden="true">${ui.icon(bank.type === "quiz" ? "shield-check" : bank.id === "collaboration" ? "contact-round" : "layers")}<span>${String(banks.indexOf(bank) + 1).padStart(2, "0")}</span></div><h2>${esc(bank.title)}</h2><p>${esc(bank.subtitle)}</p><div class="assessment-card-facts"><span>${bank.questions.length} 道题</span><span>约 ${bank.minutes} 分钟</span><span>${bank.type === "quiz" ? "答案解析" : `${bank.dimensions.length} 个维度`}</span></div>${count ? `<p class="saved-progress">已保存 ${count} / ${bank.questions.length} 题</p>` : ""}${link(`/assessment/${bank.id}`, `${count ? "继续作答" : "了解并开始"} ${ui.icon("arrow-right")}`, "secondary")}<small>v${esc(bank.version)} · ${esc(bank.provenance.kind === "observed-authorized" ? "公开原题 · 经请求者授权发布" : bank.provenance.license)}</small></article>`;
      })
      .join("")}</section>`,
  );
}
function assessment(bank) {
  const saved = draft(bank);
  const checked = inspectAnswers(bank, saved.answers);
  const index = saved.position;
  const question = bank.questions[index];
  const options = question.options || bank.options;
  return shell(
    `<div class="question-topline"><a href="/assessments" data-route>${ui.icon("arrow-left")}测评目录</a><span>${sourceBadge(bank)} <span>v${esc(bank.version)}</span></span></div><div class="runner-layout"><section class="question-sheet"><div class="question-title"><p class="section-kicker">${esc(bank.category)}</p><h1>${esc(bank.title)}</h1><p>${esc(bank.instructions)}</p></div><div class="question-progress"><div><span>已答 <b id="answered-count">${checked.answered}</b> / ${bank.questions.length}</span><span id="save-status" role="status">本机自动保存</span></div><progress aria-label="已完成题目" max="${bank.questions.length}" value="${checked.answered}"></progress></div><form id="question-form" data-bank="${bank.id}"><fieldset class="answer-fieldset"><legend><span class="question-index">第 ${index + 1} 题 / 共 ${bank.questions.length} 题</span><span class="question-text">${esc(question.text)}</span></legend><div class="answer-options">${options.map((option, i) => `<label class="answer-option ${saved.answers[question.id] === option.id ? "selected" : ""}" for="answer-${i}"><input id="answer-${i}" type="radio" name="answer" value="${esc(option.id)}" ${saved.answers[question.id] === option.id ? "checked" : ""}/><span class="option-index" aria-hidden="true">${String.fromCharCode(65 + i)}</span><span>${esc(option.label)}</span><span class="option-check" aria-hidden="true">${ui.icon("check")}</span></label>`).join("")}</div></fieldset><p class="runner-error" id="runner-error" role="alert"></p><div class="runner-actions"><button class="button secondary" type="button" data-assess="previous" ${index === 0 ? "disabled" : ""}>${ui.icon("arrow-left")}上一题</button><button class="button primary" type="submit">${index === bank.questions.length - 1 ? "完成并查看报告" : "下一题"}${ui.icon("arrow-right")}</button></div></form><p class="runner-privacy">${ui.icon("shield-check")}答案只保存在本机，不发送到原站或服务器。</p></section><aside class="question-sidebar"><section><h2>答题进度</h2><p>可返回任意题目修改答案。</p><div class="question-jumps" aria-label="跳转题目">${bank.questions.map((q, i) => `<button type="button" data-assess="jump" data-index="${i}" class="${saved.answers[q.id] ? "answered" : ""} ${i === index ? "current" : ""}" aria-label="第 ${i + 1} 题${saved.answers[q.id] ? "，已答" : "，未答"}" ${i === index ? 'aria-current="step"' : ""}>${i + 1}</button>`).join("")}</div><div class="jump-legend"><span><i></i>未答</span><span><i class="filled"></i>已答</span></div></section><section class="source-panel"><h2>题目与规则</h2><p>${esc(bank.provenance.notice)}</p><p>计分与报告由本项目独立实现。</p><button type="button" class="text-button" data-assess="rules">查看计分规则 ${ui.icon("chevron-right")}</button></section><button class="text-button restart-button" data-assess="reset">${ui.icon("rotate-ccw")}清空本份答案</button></aside></div><dialog id="assessment-dialog" aria-labelledby="assessment-dialog-title"></dialog>`,
  );
}
function rules(bank) {
  return `<h2 id="assessment-dialog-title">${esc(bank.title)} · 计分规则</h2><p>版本 ${esc(bank.version)}。${esc(bank.provenance.notice)}</p>${bank.type === "quiz" ? "<p>每题一个最佳答案。答对 1 分，答错 0 分，总分为答对题数。</p>" : bank.type === "dichotomy" ? `<p>本地独立规则：A 给维度第一侧记 1 票，B 给第二侧记 1 票。每题同权，每维度 10 题。比较两侧票数，平分显示 X。这不是已验证的原站算法，不代表能力、诊断或专业人格结论。</p>` : `<p>选项按顺序记 0、1、2、3、4 分。反向题记分为 4 − 原始分。同维度逐题相加，再换算为可得分区间的 0–100。</p><p>展示区间：0–33 为较少出现，34–66 为有时出现，67–100 为经常出现。这是项目的描述性划分，未经常模验证，不是排名、百分位或诊断阈值。</p>`}<details><summary>逐题计分表</summary><div class="rules-table-wrap"><table class="rules-table"><thead><tr><th>题号</th><th>维度</th><th>计分</th></tr></thead><tbody>${bank.questions.map((q, i) => `<tr><td>${i + 1}</td><td>${esc(bank.dimensions.find((d) => d.id === q.dimension).name)}</td><td>${q.reverse ? "反向" : bank.type === "dichotomy" ? "A→第一侧，B→第二侧" : "正向"}</td></tr>`).join("")}</tbody></table></div></details><button class="button secondary" data-assess="close-dialog">关闭</button>`;
}
function savedReports() {
  const value = read("reports", []);
  return Array.isArray(value)
    ? value.filter(
        (attempt) =>
          attempt &&
          typeof attempt === "object" &&
          typeof attempt.id === "string",
      )
    : [];
}
function resolveReport(attempt) {
  const bank = getBank(attempt?.bankId);
  if (!bank || attempt.bankVersion !== bank.version) return null;
  try {
    return { bank, result: scoreAssessment(bank, attempt.answers) };
  } catch {
    return null;
  }
}
function reportList() {
  const reports = savedReports();
  return shell(
    `<div class="assessment-heading"><div><p class="section-kicker">YOUR LOCAL REPORTS</p><h1>本机报告</h1><p>最近 20 次完成记录，仅此浏览器可见。</p></div>${link("/assessments", "选择测评", "secondary")}</div>${
      reports.length
        ? `<ul class="report-list">${reports
            .map((attempt) => {
              const resolved = resolveReport(attempt);
              return `<li><div>${sourceBadge(resolved?.bank || { provenance: { kind: "original-demo" } })}<h2>${esc(resolved?.bank.title || "题库版本已变化")}</h2><p>${esc(date(attempt.createdAt))} · ${esc(attempt.bankVersion)}</p></div><div class="report-list-actions">${resolved ? link(`/report/${encodeURIComponent(attempt.id)}`, `查看报告 ${ui.icon("arrow-right")}`, "secondary compact") : "<span>当前版本无法复算</span>"}<button class="icon-button" data-assess="delete-report" data-id="${esc(attempt.id)}" aria-label="删除 ${esc(date(attempt.createdAt))} 的报告" title="删除报告">${ui.icon("x")}</button></div></li>`;
            })
            .join("")}</ul>`
        : `<div class="assessment-empty">${ui.icon("file-check-2")}<h2>还没有完成记录</h2><p>完成一份测评后，可以在这里重新查看和导出报告。</p>${link("/assessments", "去选择一份测评")}</div>`
    }`,
  );
}
function date(value) {
  const d = new Date(value);
  return Number.isFinite(d.getTime())
    ? d.toLocaleString("zh-CN", { hour12: false })
    : "日期不可用";
}
function report(attempt) {
  const resolved = resolveReport(attempt);
  if (!resolved)
    return shell(
      `<div class="assessment-empty"><h1>报告无法打开</h1><p>记录可能已删除、数据不完整或题库版本发生变化。</p>${link("/reports", "返回本机报告")}</div>`,
    );
  const { bank, result } = resolved;
  return shell(
    `<div class="question-topline"><a href="/reports" data-route>${ui.icon("arrow-left")}本机报告</a>${sourceBadge(bank)}</div><section class="report-cover"><div><p class="section-kicker">PERSONAL REFLECTION / LOCAL REPORT</p><h1>${esc(bank.title)}<span>本次作答报告</span></h1><p>${esc(date(attempt.createdAt))} · 共 ${result.totalQuestions} 题 · v${esc(bank.version)}</p></div><div class="report-seal">${ui.icon("file-check-2")}<span>已完成</span></div></section><aside class="assessment-disclosure">${ui.icon("shield-check")}<p>${esc(bank.provenance.notice)}${bank.type === "profile" ? "结果只描述本次回答，维度分数不是能力排名或临床结论。" : bank.type === "dichotomy" ? "字母模式由本项目独立规则计算，不等同于原站报告。" : "分数只反映本次八题的回答。"}计分规则已公开。</p></aside><section class="report-dimensions" aria-label="维度结果">${result.dimensions.map((d) => `<article><div class="dimension-heading"><h2>${esc(d.name)}</h2><strong>${bank.type === "dichotomy" ? d.symbol : d.score}<small>${bank.type === "dichotomy" ? "" : ` / ${d.max}`}</small></strong></div><p>${esc(d.description)}</p><meter value="${d.score - d.min}" min="0" max="${d.max - d.min}" aria-label="${esc(d.name)}：${d.score} / ${d.max}"></meter><div class="dimension-caption"><span>${bank.type === "quiz" ? `答对 ${d.score} / ${d.max} 题` : bank.type === "dichotomy" ? `${d.first} ${d.firstCount} · ${d.second} ${d.secondCount}` : `${labels[d.band]} · 区间分 ${d.percent}`}</span><span>${bank.type === "quiz" ? `${d.percent}%` : bank.type === "dichotomy" ? `共 ${d.max} 题` : "0–100"}</span></div><p class="dimension-interpretation">${esc(d.interpretation)}</p></article>`).join("")}</section><details class="report-rules"><summary>查看计分规则与逐题归属</summary>${rules(bank).replace(/<button[\s\S]*?<\/button>/, "")}</details><details class="answer-review"><summary>逐题回顾${bank.type === "quiz" ? "与答案解析" : ""}（${bank.questions.length} 题）</summary><ol>${bank.questions
      .map((q, i) => {
        const detail = result.details[i];
        const correct =
          bank.type === "quiz" ? q.options.find((o) => o.value === 1) : null;
        return `<li><h3>${esc(q.text)}</h3><p>你的选择：<strong>${esc(detail.optionLabel)}</strong></p>${correct ? `<p class="${detail.value === 1 ? "answer-correct" : "answer-incorrect"}">${detail.value === 1 ? "回答正确" : `最佳答案：${esc(correct.label)}`}</p><p>${esc(q.explanation)}</p>` : bank.type === "dichotomy" ? `<p class="answer-scoring">${esc(q.dimension)} · ${detail.optionId} 计入 ${esc(bank.dimensions.find((d) => d.id === q.dimension)[detail.optionId === "A" ? "first" : "second"])} 倾向</p>` : `<p class="answer-scoring">${esc(bank.dimensions.find((d) => d.id === q.dimension).name)} · ${detail.value} 分${detail.reverse ? `（反向计分：4 − ${detail.originalValue}）` : ""}</p>`}</li>`;
      })
      .join(
        "",
      )}</ol></details><div class="report-actions"><button class="button primary" data-assess="export-report" data-id="${esc(attempt.id)}">${ui.icon("download")}导出 JSON 报告</button><button class="button secondary" data-assess="print">打印 / 保存 PDF</button>${link("/assessments", "返回测评目录", "text-button")}</div><p class="report-retention">本报告含你的作答记录。清除浏览器数据会删除本机记录；导出文件请自行保管。</p>`,
  );
}
function currentBank() {
  return getBank(
    location.pathname === "/mbti"
      ? "mbti-public"
      : location.pathname.split("/")[2],
  );
}
function jump(bank, index) {
  const saved = draft(bank);
  saved.position = index;
  write(`draft:${bank.id}`, saved);
  ui.render();
  const legend = document.querySelector(".question-text");
  legend?.setAttribute("tabindex", "-1");
  legend?.focus({ preventScroll: true });
  document
    .querySelector(".question-sheet")
    ?.scrollIntoView({ block: "start", behavior: "instant" });
}

export function renderAssessmentRoute(path) {
  const publicPage = publicCatalogRoute(path, ui);
  if (publicPage) return publicPage;
  if (path === "/mbti") return assessment(getBank("mbti-public"));
  if (path === "/assessments") return catalog();
  if (path === "/reports") return reportList();
  if (/^\/assessment\/[^/]+$/.test(path)) {
    const bank = currentBank();
    return bank
      ? assessment(bank)
      : shell(
          `<div class="assessment-empty"><h1>未找到这份测评</h1>${link("/assessments", "返回目录")}</div>`,
        );
  }
  if (/^\/report\/[^/]+$/.test(path))
    return report(
      savedReports().find((a) => a.id === location.pathname.split("/")[2]),
    );
  return null;
}

export function setupAssessments(context) {
  ui = context;
  document.addEventListener("change", (event) => {
    if (!event.target.matches('#question-form input[name="answer"]')) return;
    const bank = currentBank();
    if (!bank) return;
    const saved = draft(bank);
    const question = bank.questions[saved.position];
    saved.answers[question.id] = event.target.value;
    const persisted = write(`draft:${bank.id}`, saved);
    document
      .querySelectorAll(".answer-option")
      .forEach((label) =>
        label.classList.toggle("selected", label.contains(event.target)),
      );
    const checked = inspectAnswers(bank, saved.answers);
    document.querySelector("#answered-count").textContent = checked.answered;
    document.querySelector("progress").value = checked.answered;
    document.querySelector("#save-status").textContent = persisted
      ? "已保存到本机"
      : "本次会话已保存";
    document.querySelector("#runner-error").textContent = "";
    const jumpButton = document.querySelector(
      `[data-assess="jump"][data-index="${saved.position}"]`,
    );
    jumpButton.classList.add("answered");
    jumpButton.setAttribute("aria-label", `第 ${saved.position + 1} 题，已答`);
  });
  document.addEventListener("submit", (event) => {
    if (event.target.id !== "question-form") return;
    event.preventDefault();
    const bank = currentBank();
    const saved = draft(bank);
    const checked = inspectAnswers(bank, saved.answers);
    if (!saved.answers[bank.questions[saved.position].id]) {
      document.querySelector("#runner-error").textContent =
        "请先选择一个答案，再继续。";
      return;
    }
    if (saved.position < bank.questions.length - 1) {
      jump(bank, saved.position + 1);
      return;
    }
    if (checked.missing.length) {
      const index = bank.questions.findIndex(
        (q) => q.id === checked.missing[0],
      );
      jump(bank, index);
      document.querySelector("#runner-error").textContent =
        `还有 ${checked.missing.length} 题未答，已为你定位到第一道。`;
      return;
    }
    const attempt = createAttempt(bank, saved.answers);
    write("reports", [attempt, ...savedReports()].slice(0, 20));
    write(`draft:${bank.id}`, {
      version: bank.version,
      position: 0,
      answers: {},
    });
    ui.navigate(`/report/${attempt.id}`);
  });
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-assess]");
    if (!button) return;
    const action = button.dataset.assess;
    const bank = currentBank();
    if (action === "filter") {
      filter = button.dataset.filter;
      ui.render();
    } else if (action === "previous" && bank)
      jump(bank, Math.max(0, draft(bank).position - 1));
    else if (action === "jump" && bank)
      jump(bank, Number(button.dataset.index));
    else if (action === "rules" && bank) {
      const dialog = document.querySelector("#assessment-dialog");
      dialog.innerHTML = rules(bank);
      dialog.showModal();
    } else if (action === "close-dialog")
      document.querySelector("#assessment-dialog").close();
    else if (action === "reset" && bank) {
      const dialog = document.querySelector("#assessment-dialog");
      dialog.innerHTML = `<h2 id="assessment-dialog-title">清空本份答案？</h2><p>将清空「${esc(bank.title)}」未完成的答案。已完成的报告会保留。</p><div class="dialog-actions"><button class="button secondary" data-assess="close-dialog">取消</button><button class="button primary" data-assess="confirm-reset">清空并重新开始</button></div>`;
      dialog.showModal();
    } else if (action === "confirm-reset" && bank) {
      write(`draft:${bank.id}`, {
        version: bank.version,
        position: 0,
        answers: {},
      });
      ui.render();
      ui.notify("本份问卷已重新开始。");
    } else if (action === "delete-report") {
      write(
        "reports",
        savedReports().filter((a) => a.id !== button.dataset.id),
      );
      ui.render();
      ui.notify("已删除这份本机报告。");
    } else if (action === "export-report") {
      const attempt = savedReports().find((a) => a.id === button.dataset.id);
      if (!attempt) return;
      const resolved = resolveReport(attempt);
      if (!resolved) return;
      const payload = { ...attempt, result: resolved.result };
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(payload, null, 2)], {
          type: "application/json",
        }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `${attempt.bankId}-${attempt.id}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else if (action === "print") window.print();
  });
}
