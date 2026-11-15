import {
  createIcons,
  Gem,
  MoonStar,
  Sun,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  KeyRound,
  ContactRound,
  ShieldCheck,
  LayoutDashboard,
  Package,
  Copy,
  Download,
  Plus,
  RotateCcw,
  Search,
  Check,
  ChevronRight,
  LogOut,
  Eye,
  EyeOff,
  CheckCircle2,
  FileCheck2,
  Layers,
  Send,
} from "lucide";
import "./style.css";
import { setupAssessments, renderAssessmentRoute } from "./assessment/ui.js";

const icons = {
  Gem,
  MoonStar,
  Sun,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  KeyRound,
  ContactRound,
  ShieldCheck,
  LayoutDashboard,
  Package,
  Copy,
  Download,
  Plus,
  RotateCcw,
  Search,
  Check,
  ChevronRight,
  LogOut,
  Eye,
  EyeOff,
  CheckCircle2,
  FileCheck2,
  Layers,
  Send,
};
const app = document.querySelector("#app");
const store = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      notify("浏览器存储不可用，本次更改仅在当前页面有效。");
    }
  },
};
let theme = store.get("xin-xu-theme", "light");
let data = store.get("xin-xu-demo-v1", null);
let menuOpen = false,
  query = "",
  statusFilter = "all",
  codeSent = false;
let toastTimer;
const seed = () => ({
  quota: 120,
  batches: 2,
  codes: [
    {
      code: "DEMO-ALPHA01",
      product: "情绪探索 · 练习样例",
      batch: "B001",
      status: "unused",
      created: "示例数据",
    },
    {
      code: "DEMO-ALPHA02",
      product: "情绪探索 · 练习样例",
      batch: "B001",
      status: "used",
      created: "示例数据",
    },
    {
      code: "DEMO-BETA001",
      product: "沟通偏好 · 练习样例",
      batch: "B002",
      status: "unused",
      created: "示例数据",
    },
  ],
});
if (
  !data ||
  !Array.isArray(data.codes) ||
  !Number.isFinite(data.quota) ||
  !Number.isInteger(data.batches)
)
  data = seed();
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const icon = (name, cls = "") =>
  `<i data-lucide="${name}"${cls ? ` class="${cls}"` : ""} aria-hidden="true"></i>`;
const button = (text, route, cls = "primary") =>
  `<a class="button ${cls}" href="${route}" data-route>${text}</a>`;
const brand = () =>
  `<a class="brand" href="/" data-route aria-label="心序练习首页"><img src="/mark.svg" width="32" height="32" alt=""/><span>心序练习</span></a>`;
const themeButton = () =>
  `<button class="theme-button" data-action="theme" aria-label="${theme === "light" ? "切换深色主题" : "切换浅色主题"}" title="${theme === "light" ? "切换深色主题" : "切换浅色主题"}">${icon(theme === "light" ? "moon-star" : "sun")}<span>${theme === "light" ? "暗黑" : "明亮"}</span></button>`;
function notify(text) {
  clearTimeout(toastTimer);
  const el = document.querySelector("#toast");
  el.textContent = text;
  el.classList.add("show");
  toastTimer = setTimeout(() => el.classList.remove("show"), 5000);
}
function persist() {
  store.set("xin-xu-demo-v1", data);
}
function enhance() {
  createIcons({ icons, attrs: { "stroke-width": 1.75 } });
}
function applyTheme() {
  document.documentElement.dataset.theme = theme;
}
function header() {
  return `<header class="site-header"><div class="header-inner">${brand()}<span class="header-caption">测评商家的供货与履约练习平台</span><nav aria-label="主导航">${themeButton()}<div class="desktop-account">${button("登录", "/auth/login", "text-button")}${button("商家注册", "/auth/register", "primary compact")}</div><button class="icon-button mobile-menu-toggle" data-action="menu" aria-label="${menuOpen ? "关闭账户菜单" : "打开账户菜单"}" aria-expanded="${menuOpen}" aria-controls="account-menu">${icon(menuOpen ? "x" : "menu")}</button><div class="account-menu" id="account-menu" ${menuOpen ? "" : "hidden"}>${button("登录", "/auth/login", "text-button")}${button("商家注册", "/auth/register", "primary compact")}</div></nav></div></header>`;
}
function home() {
  const features = [
    [
      "credit-card",
      "一站式管理",
      "采购额度、生成授权码与履约跟踪，在同一处完成。",
    ],
    [
      "key-round",
      "授权码交付",
      "统一入口与独立授权码，让每一次数字交付清楚有序。",
    ],
    ["contact-round", "客户免注册", "凭授权码开始测评，连接轻松、流转顺畅。"],
  ];
  return `${header()}<main id="main"><section class="hero"><div class="container hero-inner"><p class="eyebrow">面向内容商家的数字测评交付练习</p><h1><span>心序练习</span>让每一次测评交付都更简单可靠</h1><p class="hero-description">采购额度、生成授权码、跟踪履约状态，一套工作台串起测评商品的日常交付。<br class="desktop-break"/> 以独立练习，探索更顺畅的数字交付体验。</p><div class="hero-actions">${button(`免费创建练习账户 ${icon("arrow-right")}`, "/auth/register")}${button("进入工作台", "/auth/login", "secondary")}</div><ul class="highlights"><li><strong>按需采购</strong><span>套餐按实际业务量选择</span></li><li><strong>批量发码</strong><span>一次生成，复制或下载</span></li><li><strong>全程可追溯</strong><span>额度、批次与使用状态清晰</span></li></ul></div></section><section class="container feature-grid" aria-label="平台能力">${features.map(([i, h, p]) => `<article class="feature"><div class="feature-icon">${icon(i)}</div><div><h2>${h}</h2><p>${p}</p></div></article>`).join("")}</section><section class="container process"><p class="section-kicker">交付流程</p><h2>一条授权码链路，串起整个交付</h2><ol class="steps">${[
    ["采购额度", "选择适合当前业务量的供货套餐。"],
    ["生成授权码", "选择测评与模板，按需批量生成授权码。"],
    ["发送给客户", "将凭证交给客户，集中查看使用状态。"],
  ]
    .map(
      ([h, p], i) =>
        `<li><span class="step-number">0${i + 1}</span><h3>${h}</h3><p>${p}</p></li>`,
    )
    .join(
      "",
    )}</ol></section></main><footer class="container home-footer"><p><span class="practice-dot"></span>独立复刻练习 · 与原站无关联 · 非真实测评服务</p><a href="/demo" data-route>体验本地模拟工作台 ${icon("arrow-right")}</a><small>仅使用虚构信息。所有业务状态均为本地模拟，无支付、邮件或真实授权码服务。</small></footer>`;
}
function field(
  name,
  type,
  placeholder,
  {
    required = true,
    minlength = "",
    pattern = "",
    autocomplete = "",
    maxlength = "",
  } = {},
) {
  return `<div class="field"><label class="sr-only" for="${name}">${placeholder}</label><input id="${name}" name="${name}" type="${type}" placeholder="${placeholder}" ${required ? "required" : ""} ${minlength ? `minlength="${minlength}"` : ""} ${maxlength ? `maxlength="${maxlength}"` : ""} ${pattern ? `pattern="${pattern}"` : ""} autocomplete="${autocomplete || "off"}" ${type === "password" ? 'aria-describedby="password-note"' : ""}/>${type === "password" ? `<button type="button" class="password-toggle" data-action="password" data-for="${name}" aria-label="显示${placeholder}" title="显示密码">${icon("eye")}</button>` : ""}</div>`;
}
function verification() {
  return `<div class="verification-row">${field("code", "text", "6位邮箱验证码", { pattern: "[0-9]{6}", maxlength: 6 })}<button type="button" class="button secondary verification-button" data-action="verification">${codeSent ? "重新获取" : "获取验证码"}</button></div><p class="verification-message" role="status">${codeSent ? "本地模拟验证码：246810（未发送邮件）" : ""}</p>`;
}
function auth() {
  const mode = location.pathname.split("/").pop();
  const register = mode === "register",
    forgot = mode === "forget-password";
  const title = register ? "创建账户" : forgot ? "忘记密码？" : "欢迎回来";
  const subtitle = register
    ? "创建练习账户，开始探索测评交付"
    : forgot
      ? "输入电子邮件，体验本地密码重置"
      : "输入虚构的账号和密码，进入本地练习";
  let fields = "";
  if (register)
    fields += field("username", "text", "请输入用户名", {
      minlength: 2,
      maxlength: 32,
      autocomplete: "username",
    });
  fields += field(
    "email",
    register || forgot ? "email" : "text",
    register
      ? "请输入邮箱地址"
      : forgot
        ? "请输入您的电子邮件"
        : "请输入用户名或邮箱",
    { autocomplete: register || forgot ? "email" : "username" },
  );
  if (register || forgot) fields += verification();
  fields += field(
    "password",
    "password",
    forgot ? "请输入新密码" : "请输入密码",
    {
      minlength: 8,
      maxlength: 128,
      autocomplete: register || forgot ? "new-password" : "current-password",
    },
  );
  if (register || forgot)
    fields += field(
      "confirm",
      "password",
      forgot ? "请再次输入新密码" : "请再次输入密码",
      { minlength: 8, maxlength: 128, autocomplete: "new-password" },
    );
  if (register)
    fields += field("invite", "text", "邀请码（选填，6位小写字母和数字）", {
      required: false,
      pattern: "[a-z0-9]{6}",
      maxlength: 6,
    });
  return `<div class="auth-layout"><aside class="auth-showcase" aria-label="交付理念">${brand()}<div class="auth-illustration" aria-hidden="true"><div class="illustration-sheet"><div class="illustration-top"><span></span><span></span><span></span></div><div class="illustration-content">${icon("layers")}<div class="art-lines"><span></span><span></span><span></span></div><div class="art-check">${icon("check")}</div></div><div class="illustration-bottom"><span></span><span></span></div></div><span class="art-tag tag-first">${icon("key-round")}<b>DEMO</b></span><span class="art-tag tag-last">${icon("file-check-2")}<b>已就绪</b></span></div><div class="showcase-copy"><p class="overline">MERCHANT DELIVERY PRACTICE</p><h2>让每一次测评交付，<br/>都有据可循。</h2><p>在额度、凭证与状态之间，探索清晰可靠的数字交付流程。</p><ul><li>额度清晰</li><li>批量发码</li><li>履约可追溯</li></ul></div></aside><div class="auth-main"><header class="auth-header"><a href="/" data-route>${icon("arrow-left")}返回首页</a>${themeButton()}</header><main id="main" class="auth-form-area"><h1>${title}</h1><p class="auth-subtitle">${subtitle}</p><form id="auth-form" data-mode="${mode}">${fields}<p id="password-note" class="local-note">独立练习：仅输入虚构信息，密码不保存；最少 8 位为本地演示规则。</p>${!register && !forgot ? `<div class="form-options"><label><input type="checkbox" name="remember" checked/>记住练习入口</label><a href="/auth/forget-password" data-route>忘记密码</a></div>` : ""}<p class="form-error" role="alert" id="form-error"></p><button class="button auth-submit" type="submit">${register ? "注册" : forgot ? "提交" : "登录"}</button><p class="auth-switch">${register ? "已有练习账号？" : forgot ? "" : "还没有练习账号？"}<a href="${register || forgot ? "/auth/login" : "/auth/register"}" data-route>${register ? "去登录" : forgot ? "返回登录" : "注册"}</a></p></form><a class="demo-direct" href="/demo" data-route>直接进入模拟工作台 ${icon("arrow-right")}</a><p class="auth-disclosure">本地演示 · 不连接原站 · 不发送邮件</p></main></div></div>`;
}
function filteredCodes() {
  return data.codes.filter(
    (c) =>
      (statusFilter === "all" || c.status === statusFilter) &&
      `${c.code} ${c.product} ${c.batch}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
}
function tableRows() {
  const rows = filteredCodes();
  return rows.length
    ? rows
        .map(
          (c) =>
            `<tr><td><code>${escape(c.code)}</code></td><td>${escape(c.product)}</td><td>${escape(c.batch)}</td><td><span class="status ${c.status}">${c.status === "used" ? "已使用" : "未使用"}</span></td><td>${escape(c.created)}</td><td><div class="row-actions"><button class="icon-button" data-action="copy" data-code="${escape(c.code)}" aria-label="复制 ${escape(c.code)}" title="复制授权码">${icon("copy")}</button><button class="row-state" data-action="use" data-code="${escape(c.code)}" ${c.status === "used" ? "disabled" : ""}>${c.status === "used" ? "已使用" : "模拟使用"}</button></div></td></tr>`,
        )
        .join("")
    : `<tr><td colspan="6" class="empty-state">${icon("search")}<strong>没有找到授权码</strong><span>试试其他关键词或筛选条件</span></td></tr>`;
}
function dashboard() {
  return `<div class="workspace">${header()}<div class="demo-ribbon">${icon("shield-check")}<span>本地模拟工作台 · 此页面为独立设计，业务数据不代表原站</span><button data-action="reset" class="text-button" title="重置所有本地演示数据">${icon("rotate-ccw")}<span>重置数据</span></button></div><main id="main" class="container dashboard"><div class="workspace-heading"><div><p class="section-kicker">WORKSPACE / PRACTICE</p><h1>交付工作台</h1><p>从一份额度，到一次清楚有序的交付。</p></div><button class="button primary" data-action="generate">${icon("plus")}生成授权码</button></div><section class="stats" aria-label="模拟业务概览"><article><div><p>可用额度 <span>模拟</span></p><strong id="quota-value">${data.quota}<small> 次</small></strong></div><div class="stat-icon">${icon("credit-card")}</div><button class="text-button" data-action="purchase">增加模拟额度 ${icon("arrow-right")}</button></article><article><div><p>已生成授权码</p><strong>${data.codes.length}<small> 个</small></strong></div><div class="stat-icon mint">${icon("key-round")}</div><p class="stat-note">${data.batches} 个模拟批次</p></article><article><div><p>已使用</p><strong>${data.codes.filter((c) => c.status === "used").length}<small> 个</small></strong></div><div class="stat-icon violet">${icon("check-circle-2")}</div><p class="stat-note">状态由本地操作更新</p></article></section><section class="code-section"><div class="table-heading"><div><h2>授权码记录</h2><p>仅 DEMO 前缀的练习码，无真实兑换能力。</p></div><button class="button secondary compact" data-action="export">${icon("download")}导出 CSV</button></div><div class="table-controls"><div class="search-field">${icon("search")}<label class="sr-only" for="code-search">搜索授权码、测评或批次</label><input type="search" id="code-search" placeholder="搜索授权码、测评或批次" value="${escape(query)}"/></div><label class="status-select">状态<select id="status-filter"><option value="all" ${statusFilter === "all" ? "selected" : ""}>全部状态</option><option value="unused" ${statusFilter === "unused" ? "selected" : ""}>未使用</option><option value="used" ${statusFilter === "used" ? "selected" : ""}>已使用</option></select></label></div><div class="table-scroll" tabindex="0" role="region" aria-label="授权码记录表格"><table><thead><tr><th scope="col">授权码</th><th scope="col">测评样例</th><th scope="col">批次</th><th scope="col">使用状态</th><th scope="col">生成时间</th><th scope="col">操作</th></tr></thead><tbody id="code-rows">${tableRows()}</tbody></table></div><p class="table-summary" aria-live="polite">显示 <span id="visible-count">${filteredCodes().length}</span> 条 / 共 ${data.codes.length} 条记录</p></section><section class="demo-explanation">${icon("file-check-2")}<div><h2>关于这次练习</h2><p>额度增加、发码、状态变更只发生在浏览器。刷新保留本地数据；重置可恢复样例。这里不提供支付、真实问卷、邮件或账号验证。</p></div></section><footer class="dashboard-footer"><span>心序练习 · 独立实现</span><a href="/" data-route>返回首页 ${icon("arrow-right")}</a></footer></main><dialog id="action-dialog" aria-labelledby="dialog-title"></dialog></div>`;
}
function render({ focus = false } = {}) {
  applyTheme();
  menuOpen = false;
  const path = location.pathname;
  const valid = [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/forget-password",
    "/demo",
  ];
  app.innerHTML = renderAssessmentRoute(path) ?? (
    path === "/"
      ? home()
      : path.startsWith("/auth/") && valid.includes(path)
        ? auth()
        : path === "/demo"
          ? dashboard()
          : `${header()}<main id="main" class="not-found"><h1>页面未找到</h1><p>这个地址不在练习页面中。</p>${button("返回首页", "/")}</main>`);
  if (path === "/") {
    const entry = app.querySelector(".hero-actions a");
    entry.href = "/assessments";
    entry.innerHTML = `体验测试题 ${icon("arrow-right")}`;
    const footerNote = app.querySelector(".home-footer>p");
    footerNote.textContent = "独立复刻练习 · 与原站无关联 · 40 道公开原题与独立样题";
  }
  for (const nav of app.querySelectorAll(".desktop-account, .account-menu")) {
    const a = document.createElement("a");
    a.className = "catalog-nav"; a.href = "/assessments";
    a.setAttribute("data-route", ""); a.textContent = "测试题"; nav.prepend(a);
    const publicLink = a.cloneNode(true);
    publicLink.href = "/quiz"; publicLink.textContent = "公开目录"; a.after(publicLink);
  }
  if (path === "/demo") {
    const explanation = app.querySelector(".demo-explanation p");
    explanation.textContent = "额度、发码与状态仍为本地模拟。题库已接入 40 道原站公开 MBTI 题和 32 道独立样题，支持实际答题与本机报告。原站服务器计分与其他题库未取得。";
    const a = document.createElement("a"); a.href = "/assessments";
    a.setAttribute("data-route", ""); a.textContent = "进入测试题";
    a.className = "button secondary"; explanation.after(a);
  }
  const remember = app.querySelector('input[name="remember"]');
  if (remember) remember.checked = store.get("xin-xu-remember", true);
  const entry = app.querySelector('.hero-actions a[href="/auth/login"]');
  if (entry && store.get("xin-xu-remember", false)) entry.href = "/demo";
  document.title = `${app.querySelector("h1")?.textContent || "心序练习"} · 独立练习版`;
  enhance();
  if (focus) {
    const h = app.querySelector("h1");
    h?.setAttribute("tabindex", "-1");
    h?.focus({ preventScroll: true });
  }
}
function navigate(path) {
  history.pushState({}, "", path);
  codeSent = false;
  render({ focus: true });
  window.scrollTo(0, 0);
}
window.addEventListener("popstate", () => {
  codeSent = false;
  render();
});
function refreshTable() {
  document.querySelector("#code-rows").innerHTML = tableRows();
  document.querySelector("#visible-count").textContent = filteredCodes().length;
  enhance();
}
function showDialog(kind) {
  const dialog = document.querySelector("#action-dialog");
  let body = "";
  if (kind === "generate")
    body = `<p class="dialog-description">选择练习测评和数量，每个授权码消耗 1 次模拟额度。</p><form id="generate-form"><label for="product">测评样例</label><select name="product" id="product"><option>情绪探索 · 练习样例</option><option>沟通偏好 · 练习样例</option></select><label for="quantity">生成数量 <span>可用 ${data.quota} 次</span></label><input type="number" id="quantity" name="quantity" value="3" min="1" max="${Math.min(data.quota, 100)}" required ${data.quota === 0 ? "disabled" : ""}/><p class="form-error" role="alert" id="dialog-error">${data.quota === 0 ? "额度不足，请先增加模拟额度。" : ""}</p><div class="dialog-actions"><button type="button" class="button secondary" data-action="close-dialog">取消</button><button class="button primary" type="submit" ${data.quota === 0 ? "disabled" : ""}>${icon("key-round")}确认生成</button></div></form>`;
  else if (kind === "purchase")
    body = `<p class="dialog-description">选择增加的次数。此操作完全免费，不产生订单或支付。</p><form id="purchase-form"><fieldset><legend class="sr-only">模拟额度套餐</legend><div class="package-options">${[30, 100, 500].map((n, i) => `<label><input type="radio" name="amount" value="${n}" ${i === 1 ? "checked" : ""}/><strong>${n}</strong><span>次模拟额度</span></label>`).join("")}</div></fieldset><div class="simulation-note">${icon("shield-check")}仅本地练习，不涉及真实资金</div><div class="dialog-actions"><button type="button" class="button secondary" data-action="close-dialog">取消</button><button class="button primary" type="submit">增加额度</button></div></form>`;
  else
    body = `<p class="dialog-description">将清除当前练习码和额度变更，恢复最初的 3 条样例记录与 120 次额度。</p><div class="dialog-actions"><button class="button secondary" data-action="close-dialog">取消</button><button class="button primary" data-action="confirm-reset">重置本地数据</button></div>`;
  dialog.innerHTML = `<div class="dialog-header"><h2 id="dialog-title">${kind === "generate" ? "生成授权码" : kind === "purchase" ? "增加模拟额度" : "重置练习数据"}</h2><button class="icon-button" data-action="close-dialog" aria-label="关闭对话框" title="关闭">${icon("x")}</button></div>${body}`;
  enhance();
  dialog.showModal();
  dialog.addEventListener(
    "click",
    (event) => {
      if (event.target === dialog) {
        const r = dialog.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          dialog.close();
      }
    },
    { once: true },
  );
}
document.addEventListener("click", async (event) => {
  const link = event.target.closest("a[data-route]");
  if (
    link &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    event.button === 0
  ) {
    event.preventDefault();
    navigate(link.getAttribute("href"));
    return;
  }
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "theme") {
    theme = theme === "light" ? "dark" : "light";
    store.set("xin-xu-theme", theme);
    applyTheme();
    document.querySelectorAll(".theme-button").forEach((el) => {
      el.innerHTML = `${icon(theme === "light" ? "moon-star" : "sun")}<span>${theme === "light" ? "暗黑" : "明亮"}</span>`;
      el.setAttribute(
        "aria-label",
        theme === "light" ? "切换深色主题" : "切换浅色主题",
      );
      el.title = el.getAttribute("aria-label");
    });
    enhance();
  } else if (action === "menu") {
    menuOpen = !menuOpen;
    target.setAttribute("aria-expanded", String(menuOpen));
    target.setAttribute(
      "aria-label",
      menuOpen ? "关闭账户菜单" : "打开账户菜单",
    );
    target.innerHTML = icon(menuOpen ? "x" : "menu");
    document.querySelector("#account-menu").hidden = !menuOpen;
    enhance();
  } else if (action === "password") {
    const input = document.getElementById(target.dataset.for);
    input.type = input.type === "password" ? "text" : "password";
    target.innerHTML = icon(input.type === "password" ? "eye" : "eye-off");
    target.setAttribute(
      "aria-label",
      `${input.type === "password" ? "显示" : "隐藏"}${input.placeholder}`,
    );
    target.title = input.type === "password" ? "显示密码" : "隐藏密码";
    enhance();
  } else if (action === "verification") {
    const email = document.getElementById("email");
    if (!email.reportValidity()) return;
    codeSent = true;
    document.querySelector(".verification-message").textContent =
      "本地模拟验证码：246810（未发送邮件）";
    target.textContent = "重新获取";
    notify("模拟验证码为 246810，没有发送邮件。");
  } else if (["generate", "purchase", "reset"].includes(action))
    showDialog(action);
  else if (action === "close-dialog")
    document.querySelector("#action-dialog").close();
  else if (action === "confirm-reset") {
    document.querySelector("#action-dialog").close();
    data = seed();
    query = "";
    statusFilter = "all";
    persist();
    render();
    notify("已恢复本地样例数据。");
  } else if (action === "use") {
    const record = data.codes.find((c) => c.code === target.dataset.code);
    if (record && record.status !== "used") {
      record.status = "used";
      persist();
      render();
      notify("已模拟一次使用，仅更新本地状态。");
    }
  } else if (action === "copy") {
    try {
      await navigator.clipboard.writeText(target.dataset.code);
      notify("练习授权码已复制。");
    } catch {
      notify("复制不可用，请从表格中手动选择授权码。");
    }
  } else if (action === "export") {
    const rows = [
      ["授权码", "测评样例", "批次", "使用状态", "生成时间"],
      ...filteredCodes().map((c) => [
        c.code,
        c.product,
        c.batch,
        c.status === "used" ? "已使用" : "未使用",
        c.created,
      ]),
    ];
    const csv =
      "\ufeff" +
      rows
        .map((row) =>
          row
            .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
            .join(","),
        )
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "xin-xu-demo-codes.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(`已导出当前筛选的 ${rows.length - 1} 条练习记录。`);
  }
});
document.addEventListener("input", (event) => {
  if (event.target.id === "code-search") {
    query = event.target.value;
    refreshTable();
  }
  if (event.target.closest("#auth-form"))
    document.querySelector("#form-error").textContent = "";
});
document.addEventListener("change", (event) => {
  if (event.target.id === "status-filter") {
    statusFilter = event.target.value;
    refreshTable();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuOpen) {
    menuOpen = false;
    const b = document.querySelector(".mobile-menu-toggle");
    b.setAttribute("aria-expanded", "false");
    b.setAttribute("aria-label", "打开账户菜单");
    b.innerHTML = icon("menu");
    document.querySelector("#account-menu").hidden = true;
    enhance();
    b.focus();
  }
});
document.addEventListener("submit", (event) => {
  if (
    !["auth-form", "generate-form", "purchase-form"].includes(event.target.id)
  )
    return;
  event.preventDefault();
  const form = event.target;
  const values = new FormData(form);
  if (form.id === "auth-form") {
    const err = document.querySelector("#form-error");
    if (
      values.has("confirm") &&
      values.get("password") !== values.get("confirm")
    ) {
      err.textContent = "两次输入的密码不一致。";
      return;
    }
    if (values.has("code") && (!codeSent || values.get("code") !== "246810")) {
      err.textContent = "请获取并输入本地模拟验证码 246810。";
      return;
    }
    if (form.dataset.mode === "forget-password") {
      navigate("/auth/login");
      notify("已完成本地重置演示，未变更任何真实账号。");
    } else {
      if (form.dataset.mode === "login") {
        store.set("xin-xu-remember", values.has("remember"));
      }
      navigate("/demo");
      notify(
        form.dataset.mode === "register"
          ? "已完成本地注册演示，没有创建真实账号。"
          : "已进入模拟工作台，未进行真实身份认证。",
      );
    }
  } else if (form.id === "generate-form") {
    const amount = Number(values.get("quantity"));
    if (
      !Number.isInteger(amount) ||
      amount < 1 ||
      amount > 100 ||
      amount > data.quota
    ) {
      document.querySelector("#dialog-error").textContent =
        "请输入 1–100 之间且不超过可用额度的整数。";
      return;
    }
    const batch = `B${String(++data.batches).padStart(3, "0")}`;
    const created = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
    const existing = new Set(data.codes.map((c) => c.code));
    const newCodes = [];
    for (let n = 0; n < amount; n++) {
      let code;
      do {
        code =
          "DEMO-" +
          Array.from(
            crypto.getRandomValues(new Uint8Array(8)),
            (n) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[n % 32],
          ).join("");
      } while (existing.has(code));
      existing.add(code);
      newCodes.push({
        code,
        product: String(values.get("product")),
        batch,
        status: "unused",
        created,
      });
    }
    data.codes.unshift(...newCodes);
    data.quota -= amount;
    query = "";
    statusFilter = "all";
    persist();
    document.querySelector("#action-dialog").close();
    render();
    notify(`已生成 ${amount} 个本地练习码，消耗 ${amount} 次模拟额度。`);
  } else {
    const amount = Number(values.get("amount"));
    if (![30, 100, 500].includes(amount)) return;
    data.quota += amount;
    persist();
    document.querySelector("#action-dialog").close();
    render();
    notify(`已增加 ${amount} 次模拟额度，无任何费用。`);
  }
});
setupAssessments({ header, icon, navigate, notify, render });
render();
