import { banks } from "../app/src/assessment/banks.js";
import { validateBank } from "../app/src/assessment/engine.js";
let failed = false;
for (const bank of banks) {
  const errors = validateBank(bank);
  console.log(
    `${errors.length ? "FAIL" : "PASS"} ${bank.id}@${bank.version}: ${bank.questions.length} questions, ${bank.provenance.kind}`,
  );
  for (const error of errors) console.error(error);
  failed ||= errors.length > 0;
}
process.exitCode = failed ? 1 : 0;
