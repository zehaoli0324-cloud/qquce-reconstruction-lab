import test from "node:test";
import assert from "node:assert/strict";
import { banks, getBank } from "../app/src/assessment/banks.js";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  validateBank,
  inspectAnswers,
  scoreAssessment,
  createAttempt,
} from "../app/src/assessment/engine.js";

const answerAll = (bank, select) =>
  Object.fromEntries(
    bank.questions.map((q) => [q.id, select(q.options || bank.options, q).id]),
  );
test("all published banks have sources, valid questions, and unique bank ids", () => {
  assert.equal(new Set(banks.map((b) => b.id)).size, banks.length);
  for (const bank of banks) {
    assert.deepEqual(validateBank(bank), []);
    if (bank.provenance.kind === "original-demo") {
      assert.equal(bank.provenance.originalSiteMatch, false);
      assert.equal(bank.provenance.license, "MIT");
    } else assert.equal(bank.provenance.kind, "observed-authorized");
  }
  assert.equal(
    banks.reduce((n, bank) => n + bank.questions.length, 0),
    72,
  );
});
test("score boundaries include reverse items and every dimension", () => {
  for (const bank of banks) {
    for (const maximum of [false, true]) {
      const answers = answerAll(bank, (options, q) => {
        const sorted = [...options].sort((a, b) => a.value - b.value);
        return sorted[maximum !== Boolean(q.reverse) ? sorted.length - 1 : 0];
      });
      const result = scoreAssessment(bank, answers);
      for (const d of result.dimensions)
        assert.equal(d.percent, maximum ? 100 : 0);
    }
  }
});
test("known mixed profile yields independently calculated scores", () => {
  const bank = getBank("daily-rhythm");
  const answers = answerAll(bank, () => bank.options[4]);
  const report = scoreAssessment(bank, answers);
  assert.deepEqual(
    report.dimensions.map((d) => [d.score, d.max, d.percent]),
    [
      [12, 16, 75],
      [12, 16, 75],
      [12, 16, 75],
    ],
  );
  const reverse = report.details.find((q) => q.questionId === "rhythm-06");
  assert.equal(reverse.originalValue, 4);
  assert.equal(reverse.value, 0);
});
test("incomplete and invalid answers cannot create reports", () => {
  const bank = getBank("daily-rhythm");
  assert.throws(() => scoreAssessment(bank, {}), /Missing answers/);
  const answers = answerAll(bank, () => bank.options[2]);
  answers[bank.questions[2].id] = "invalid-option";
  assert.throws(() => createAttempt(bank, answers), /Missing answers/);
  const inspected = inspectAnswers(bank, { ...answers, invented: "always" });
  assert.equal(inspected.answered, 11);
  assert.equal(Object.hasOwn(inspected.answers, "invented"), false);
  assert.deepEqual(
    inspectAnswers(bank, null).missing,
    bank.questions.map((q) => q.id),
  );
});
test("quiz score counts correct choices and no partial credit", () => {
  const bank = getBank("digital-basics");
  const answers = answerAll(bank, (options) =>
    options.find((o) => o.value === 1),
  );
  answers[bank.questions[0].id] = "choice-0";
  const report = scoreAssessment(bank, answers);
  assert.equal(report.dimensions[0].score, 7);
  assert.equal(report.dimensions[0].max, 8);
  assert.equal(report.dimensions[0].percent, 88);
});
test("malformed imported bank fails validation", () => {
  const bank = structuredClone(getBank("daily-rhythm"));
  bank.questions[1].id = bank.questions[0].id;
  bank.questions[2].dimension = "not-a-dimension";
  bank.provenance = {};
  const errors = validateBank(bank);
  assert.ok(errors.some((e) => e.includes("Duplicate")));
  assert.ok(errors.some((e) => e.includes("Unknown dimension")));
  assert.ok(errors.some((e) => e.includes("Source/license")));
});
test("report preserves source, bank version and supplied deterministic metadata", () => {
  const bank = getBank("daily-rhythm");
  const answers = answerAll(bank, () => bank.options[2]);
  const attempt = createAttempt(bank, answers, {
    id: "test-id",
    createdAt: "2026-11-15T12:00:00Z",
  });
  assert.equal(attempt.id, "test-id");
  assert.equal(attempt.bankVersion, bank.version);
  assert.equal(attempt.provenance.kind, "original-demo");
  assert.equal(attempt.result.scoringVersion, "linear-dimension-v1");
  assert.equal(JSON.stringify(answers), JSON.stringify(attempt.answers));
  assert.notEqual(attempt.provenance, bank.provenance);
});
test("observed original questions retain exact text, option order, dimensions and digest", async () => {
  const bank = getBank("mbti-public");
  const bytes = await readFile(
    new URL("../data/observed/mbti-type-test.questions.json", import.meta.url),
  );
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    bank.provenance.dataSha256,
  );
  const payload = JSON.parse(bytes);
  assert.equal(payload.questionCount, 40);
  assert.equal(bank.questions.length, 40);
  for (let i = 0; i < 40; i++) {
    const q = bank.questions[i],
      original = payload.questions[i];
    assert.equal(q.text, original.text);
    assert.equal(q.sourceId, original.id);
    assert.equal(q.dimension, original.dimension);
    assert.deepEqual(
      q.options.map((o) => o.label),
      [original.optionA, original.optionB],
    );
  }
});
test("independent A/B tally is explicit and handles extremes and ties", () => {
  const bank = getBank("mbti-public");
  const allA = answerAll(bank, (options) => options[0]);
  const allB = answerAll(bank, (options) => options[1]);
  assert.equal(scoreAssessment(bank, allA).pattern, "ESTJ");
  assert.equal(scoreAssessment(bank, allB).pattern, "INFP");
  const tied = Object.fromEntries(
    bank.questions.map((q, i) => [q.id, i % 2 ? "A" : "B"]),
  );
  const result = scoreAssessment(bank, tied);
  assert.equal(result.pattern, "XXXX");
  assert.equal(result.scoringStatus, "independent-assumption");
  assert.deepEqual(
    result.dimensions.map((d) => [d.firstCount, d.secondCount]),
    [
      [5, 5],
      [5, 5],
      [5, 5],
      [5, 5],
    ],
  );
});
