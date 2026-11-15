export const SCORING_VERSION = "linear-dimension-v1";

export function validateBank(bank) {
  const errors = [];
  if (!bank || !/^[a-z][a-z0-9-]+$/.test(bank.id || ""))
    errors.push("Invalid bank id");
  if (!bank?.version || !bank?.title) errors.push("Bank title/version missing");
  if (!["profile", "quiz", "dichotomy"].includes(bank?.type))
    errors.push("Unsupported bank type");
  if (!bank?.provenance?.license || !bank?.provenance?.kind)
    errors.push("Source/license missing");
  if (!Array.isArray(bank?.questions) || !bank.questions.length)
    errors.push("Questions missing");
  const dimensions = bank?.dimensions || [];
  if (
    !dimensions.length ||
    new Set(dimensions.map((d) => d.id)).size !== dimensions.length
  )
    errors.push("Invalid dimensions");
  const questionIds = new Set();
  for (const question of bank?.questions || []) {
    if (!question.id || questionIds.has(question.id))
      errors.push(`Duplicate/missing question ${question.id}`);
    questionIds.add(question.id);
    if (!question.text?.trim())
      errors.push(`Question text missing: ${question.id}`);
    if (!dimensions.some((d) => d.id === question.dimension))
      errors.push(`Unknown dimension: ${question.id}`);
    const options = question.options || bank.options;
    if (
      !Array.isArray(options) ||
      options.length < 2 ||
      new Set(options.map((o) => o.id)).size !== options.length ||
      options.some((o) => !o.id || !o.label || !Number.isFinite(o.value))
    ) {
      errors.push(`Invalid options: ${question.id}`);
      continue;
    }
    if (
      Math.max(...options.map((o) => o.value)) ===
      Math.min(...options.map((o) => o.value))
    )
      errors.push(`No scoring range: ${question.id}`);
    if (
      bank.type === "quiz" &&
      (!question.explanation ||
        options.filter((o) => o.value === 1).length !== 1 ||
        options.some((o) => ![0, 1].includes(o.value)) ||
        question.reverse)
    )
      errors.push(`Invalid quiz rule: ${question.id}`);
  }
  for (const d of dimensions)
    if (!(bank?.questions || []).some((q) => q.dimension === d.id))
      errors.push(`Empty dimension: ${d.id}`);
  return errors;
}

export function inspectAnswers(bank, answers) {
  const clean = Object.create(null);
  if (answers && typeof answers === "object" && !Array.isArray(answers)) {
    for (const question of bank.questions) {
      const selected = answers[question.id];
      if (
        Object.hasOwn(answers, question.id) &&
        (question.options || bank.options).some((o) => o.id === selected)
      )
        clean[question.id] = selected;
    }
  }
  const missing = bank.questions
    .filter((q) => !Object.hasOwn(clean, q.id))
    .map((q) => q.id);
  return {
    answers: clean,
    answered: bank.questions.length - missing.length,
    missing,
  };
}

export function scoreAssessment(bank, answers) {
  const errors = validateBank(bank);
  if (errors.length) throw new Error(errors.join("; "));
  const checked = inspectAnswers(bank, answers);
  if (checked.missing.length)
    throw new Error(`Missing answers: ${checked.missing.join(", ")}`);
  const details = bank.questions.map((question) => {
    const options = question.options || bank.options;
    const selected = options.find((o) => o.id === checked.answers[question.id]);
    const min = Math.min(...options.map((o) => o.value));
    const max = Math.max(...options.map((o) => o.value));
    return {
      questionId: question.id,
      dimensionId: question.dimension,
      optionId: selected.id,
      optionLabel: selected.label,
      originalValue: selected.value,
      value: question.reverse ? min + max - selected.value : selected.value,
      reverse: Boolean(question.reverse),
      min,
      max,
    };
  });
  const dimensions = bank.dimensions.map((dimension) => {
    const items = details.filter((q) => q.dimensionId === dimension.id);
    const sum = items.reduce((n, q) => n + q.value, 0);
    const min = items.reduce((n, q) => n + q.min, 0);
    const max = items.reduce((n, q) => n + q.max, 0);
    const percent = Math.round(((sum - min) / (max - min)) * 100);
    // Descriptive thirds are project rules, not norms or clinical thresholds.
    const band = percent < 34 ? "low" : percent < 67 ? "middle" : "high";
    const paired =
      bank.type === "dichotomy"
        ? {
            first: dimension.first,
            second: dimension.second,
            firstCount: sum,
            secondCount: max - sum,
            symbol:
              sum * 2 === max
                ? "X"
                : sum * 2 > max
                  ? dimension.first
                  : dimension.second,
          }
        : {};
    return {
      id: dimension.id,
      name: dimension.name,
      score: sum,
      min,
      max,
      percent,
      band,
      description: dimension.description,
      interpretation: dimension[band],
      ...paired,
    };
  });
  return {
    bankId: bank.id,
    bankVersion: bank.version,
    scoringVersion:
      bank.type === "dichotomy" ? "independent-ab-tally-v1" : SCORING_VERSION,
    type: bank.type,
    totalQuestions: bank.questions.length,
    dimensions,
    details,
    ...(bank.type === "dichotomy"
      ? {
          pattern: dimensions.map((d) => d.symbol).join(""),
          scoringStatus: "independent-assumption",
        }
      : {}),
  };
}

export function createAttempt(bank, answers, options = {}) {
  const checked = inspectAnswers(bank, answers);
  const result = scoreAssessment(bank, checked.answers);
  return {
    schemaVersion: 1,
    id: options.id || crypto.randomUUID(),
    createdAt: options.createdAt || new Date().toISOString(),
    bankId: bank.id,
    bankVersion: bank.version,
    provenance: { ...bank.provenance },
    answers: { ...checked.answers },
    result,
  };
}
