import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { getBank } from "../app/src/assessment/banks.js";
let base = process.env.TEST_URL;
for (const name of ["preview.json", "production-preview.json"]) {
  if (base) break;
  try {
    base = JSON.parse(await readFile(new URL(`../.runtime/${name}`, import.meta.url), "utf8")).url;
  } catch {}
}
if (!base) throw new Error("Start the app with npm start or set TEST_URL.");
const out = new URL("../artifacts/browser/", import.meta.url);
const screenshotPath = (name) => fileURLToPath(new URL(name, out));
await mkdir(out, { recursive: true });
const requestedChannel = process.env.BROWSER_CHANNEL || "chrome";
const browser = await chromium.launch({
  channel: requestedChannel === "chromium" ? undefined : requestedChannel,
  headless: true,
});
const errors = [],
  externalRequests = [],
  checks = [];
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
context.on("page", (page) =>
  page.on("pageerror", (error) => errors.push(error.message)),
);
await context.route("**/*", (route) => {
  if (
    !route.request().url().startsWith(base) &&
    !route.request().url().startsWith("data:")
  ) {
    externalRequests.push(route.request().url());
    return route.abort();
  }
  return route.continue();
});
const page = await context.newPage();
const goto = async (path) => {
  await page.goto(new URL(path, base).href);
  await page.locator("h1").waitFor();
};
async function noOverflow(label) {
  const result = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert.ok(
    result.scroll <= result.width + 1,
    `${label}: horizontal overflow ${JSON.stringify(result)}`,
  );
}
try {
  await goto("/assessments");
  assert.equal(await page.locator(".assessment-card").count(), 4);
  await page.getByRole("button", { name: "知识练习", exact: true }).click();
  assert.equal(await page.locator(".assessment-card").count(), 1);
  await page.getByRole("button", { name: "全部测评", exact: true }).click();
  checks.push("catalog filters");
  await goto("/assessment/daily-rhythm");
  await page.getByRole("button", { name: "下一题", exact: true }).click();
  assert.match(await page.locator("#runner-error").textContent(), /先选择/);
  await page.locator("#answer-2").check();
  await page.getByRole("button", { name: "下一题", exact: true }).click();
  await page.reload();
  assert.match(await page.locator(".question-index").textContent(), /第 2 题/);
  assert.equal(await page.locator("#answered-count").textContent(), "1");
  await page.getByRole("button", { name: "上一题", exact: true }).click();
  assert.equal(await page.locator("#answer-2").isChecked(), true);
  checks.push("required answer, reload resume, previous answer");
  await page
    .getByRole("button", { name: "第 12 题，未答", exact: true })
    .click();
  await page.locator("#answer-2").check();
  await page
    .getByRole("button", { name: "完成并查看报告", exact: true })
    .click();
  assert.match(await page.locator("#runner-error").textContent(), /10 题未答/);
  assert.match(await page.locator(".question-index").textContent(), /第 2 题/);
  checks.push("submission finds unanswered question");
  await page.getByRole("button", { name: /查看计分规则/ }).click();
  await page.locator("#assessment-dialog").waitFor({ state: "visible" });
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#assessment-dialog").isVisible(), false);
  for (let i = 1; i < 12; i++) {
    await page.locator("#answer-2").check();
    await page.locator('#question-form button[type="submit"]').click();
  }
  await page.waitForURL(/\/report\//);
  const reportUrl = page.url();
  assert.equal(await page.locator(".report-dimensions article").count(), 3);
  assert.deepEqual(
    await page.locator("meter").evaluateAll((xs) => xs.map((x) => x.value)),
    [8, 8, 8],
  );
  await page.locator(".answer-review summary").click();
  assert.equal(await page.locator(".answer-review li").count(), 12);
  await page.locator(".report-rules summary").first().click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 JSON 报告" }).click();
  const download = await downloadPromise;
  const reportFile = await download.path();
  const exported = JSON.parse(await readFile(reportFile, "utf8"));
  assert.equal(exported.provenance.kind, "original-demo");
  assert.equal(Object.keys(exported.answers).length, 12);
  checks.push("real scoring, dimension scores, answer review, JSON download");
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 960 });
    for (const path of [
      "/",
      "/assessments",
      "/quiz",
      "/quiz/literature",
      "/mbti",
      "/assessment/collaboration",
      "/reports",
      new URL(reportUrl).pathname,
      "/auth/login",
      "/demo",
    ]) {
      await goto(path);
      await noOverflow(`${path}@${width}`);
    }
    await goto("/assessments");
    await page.screenshot({
      path: screenshotPath(`catalog-${width}.png`),
      fullPage: true,
    });
    await goto("/assessment/collaboration");
    await page.screenshot({
      path: screenshotPath(`question-${width}.png`),
      fullPage: true,
    });
    await page.goto(reportUrl);
    await page.screenshot({
      path: screenshotPath(`report-${width}.png`),
      fullPage: true,
    });
  }
  checks.push("50 route/viewport overflow checks");
  await page.setViewportSize({ width: 390, height: 844 });
  await goto("/assessments");
  await page.getByRole("button", { name: "切换深色主题", exact: true }).click();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await page.screenshot({
    path: screenshotPath("catalog-dark-390.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "打开账户菜单" }).click();
  await page
    .locator("#account-menu")
    .getByRole("link", { name: "测试题", exact: true })
    .click();
  assert.equal(await page.locator("#account-menu").isVisible(), false);
  checks.push("dark theme and mobile menu");
  await goto("/assessment/digital-basics");
  for (const q of getBank("digital-basics").questions) {
    await page
      .locator(`input[value="${q.options.find((o) => o.value === 1).id}"]`)
      .check();
    await page.locator('#question-form button[type="submit"]').click();
  }
  await page.waitForURL(/\/report\//);
  assert.equal(await page.locator("meter").getAttribute("value"), "8");
  await page.locator(".answer-review summary").click();
  assert.equal(await page.locator(".answer-correct").count(), 8);
  await goto("/reports");
  assert.equal(await page.locator(".report-list>li").count(), 2);
  await page.locator('[data-assess="delete-report"]').first().click();
  assert.equal(await page.locator(".report-list>li").count(), 1);
  checks.push(
    "quiz full score and explanation, persisted history, delete report",
  );
  await goto("/assessment/collaboration");
  await page.locator("#answer-0").check();
  await page.getByRole("button", { name: "清空本份答案", exact: true }).click();
  await page
    .getByRole("button", { name: "清空并重新开始", exact: true })
    .click();
  assert.equal(await page.locator("#answered-count").textContent(), "0");
  checks.push("draft reset confirmation");
  await goto("/quiz");
  assert.equal(await page.locator(".observed-product").count(), 9);
  await page.locator(".observed-product").first().click();
  assert.match(
    await page.locator(".observed-status").textContent(),
    /题库尚未取得/,
  );
  checks.push(
    "9 public catalog entries disclose unavailable commercial questions",
  );
  await goto("/mbti");
  assert.equal(
    await page.locator(".question-text").textContent(),
    "在社交聚会中，你通常会：",
  );
  for (let i = 0; i < 40; i++) {
    await page.locator("#answer-0").check();
    await page.locator('#question-form button[type="submit"]').click();
  }
  await page.waitForURL(/\/report\//);
  assert.equal(await page.locator(".report-dimensions article").count(), 4);
  assert.deepEqual(
    await page.locator(".dimension-heading strong").allTextContents(),
    ["E", "S", "T", "J"],
  );
  await page.locator(".answer-review summary").click();
  assert.equal(await page.locator(".answer-review li").count(), 40);
  const originalDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 JSON 报告" }).click();
  const originalDownload = await originalDownloadPromise;
  const originalExport = JSON.parse(
    await readFile(await originalDownload.path(), "utf8"),
  );
  assert.equal(originalExport.provenance.kind, "observed-authorized");
  assert.equal(originalExport.result.scoringStatus, "independent-assumption");
  checks.push(
    "40 public original questions completed, ESTJ tally, source and scoring status exported",
  );
  await page.screenshot({
    path: screenshotPath("original-report-390.png"),
    fullPage: true,
  });
  const touchContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const touchPage = await touchContext.newPage();
  await touchPage.goto(new URL("/mbti", base).href);
  await touchPage.locator('label[for="answer-1"]').tap();
  await touchPage.getByRole("button", { name: "下一题", exact: true }).tap();
  assert.match(
    await touchPage.locator(".question-index").textContent(),
    /第 2 题/,
  );
  assert.equal(await touchPage.locator("#answered-count").textContent(), "1");
  await touchContext.close();
  checks.push("mobile touch selection and navigation");
  assert.deepEqual(errors, []);
  assert.deepEqual(externalRequests, []);
  const result = {
    passed: true,
    testedAt: new Date().toISOString(),
    base,
    checks,
    pageErrors: errors,
    externalRequests,
    screenshots: "artifacts/browser/",
  };
  await writeFile(
    new URL("results.json", out),
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  await page
    .screenshot({ path: screenshotPath("failure.png"), fullPage: true })
    .catch(() => {});
  throw error;
} finally {
  await browser.close();
}
