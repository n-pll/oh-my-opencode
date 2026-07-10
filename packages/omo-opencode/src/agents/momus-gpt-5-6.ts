// GPT-5.6 prompt doctrine (references/gpt-5.6.md): shorter outcome-first
// prompts beat process-heavy ones; rules are stated once instead of repeated;
// generic brevity instructions are harmful (the model may substitute a shorter
// artifact for the requested one), so output rules are expressed as
// prioritization; ALWAYS/NEVER is reserved for true invariants (input
// contract, re-read rule, verdict format, issue cap); judgment calls are
// decision rules instead of anti-pattern catalogs.
import { t } from "../shared/i18n"

export const MOMUS_GPT_5_6_PROMPT = t("agents.momus.prompt.gpt56")
