import { t } from "../../shared/i18n"

/**
 * Gemini-specific overlay sections for Sisyphus prompt.
 *
 * Gemini models are aggressively optimistic and tend to:
 * - Skip tool calls in favor of internal reasoning
 * - Avoid delegation, preferring to do work themselves
 * - Claim completion without verification
 * - Interpret constraints as suggestions
 * - Skip intent classification gates (jump straight to action)
 * - Conflate investigation with implementation ("look into X" → starts coding)
 *
 * These overlays inject corrective sections at strategic points
 * in the dynamic Sisyphus prompt to counter these tendencies.
 */

export function buildGeminiToolMandate(): string {
  return t("agents.sisyphus.prompt.gemini-toolmandate")
}

export function buildGeminiToolGuide(): string {
  return t("agents.sisyphus.prompt.gemini-toolguide")
}

export function buildGeminiToolCallExamples(): string {
  return t("agents.sisyphus.prompt.gemini-toolcallexamples")
}

export function buildGeminiDelegationOverride(): string {
  return t("agents.sisyphus.prompt.gemini-delegationoverride")
}

export function buildGeminiVerificationOverride(): string {
  return t("agents.sisyphus.prompt.gemini-verificationoverride")
}

export function buildGeminiIntentGateEnforcement(): string {
  return t("agents.sisyphus.prompt.gemini-intentgateenforcement")
}
