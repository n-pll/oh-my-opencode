import type { VariantTable } from "./types"
import codexPrompt from "../prompts/ultrawork/codex.md"
import codexPromptZh from "../prompts/ultrawork/codex.zh.md"
import defaultPrompt from "../prompts/ultrawork/default.md"
import defaultPromptZh from "../prompts/ultrawork/default.zh.md"
import geminiPrompt from "../prompts/ultrawork/gemini.md"
import geminiPromptZh from "../prompts/ultrawork/gemini.zh.md"
import glmPromptZh from "../prompts/ultrawork/glm.zh.md"
import gptPromptZh from "../prompts/ultrawork/gpt.zh.md"
import plannerPromptZh from "../prompts/ultrawork/planner.zh.md"
import glmPrompt from "../prompts/ultrawork/glm.md"
import gptPrompt from "../prompts/ultrawork/gpt.md"
import plannerPrompt from "../prompts/ultrawork/planner.md"

export const ULTRAWORK_DEFAULT_PROMPT = defaultPrompt
export const ULTRAWORK_GEMINI_PROMPT = geminiPrompt
export const ULTRAWORK_GLM_PROMPT = glmPrompt
export const ULTRAWORK_GPT_PROMPT = gptPrompt
export const ULTRAWORK_PLANNER_PROMPT = plannerPrompt
export const CODEX_ULTRAWORK_PROMPT = codexPrompt

const ULTRAWORK_DEFAULT_BY_LOCALE: Record<string, string> = {
  zh: defaultPromptZh,
}

export function getUltraworkDefaultPrompt(locale?: string): string {
  if (locale !== undefined) {
    const localized = ULTRAWORK_DEFAULT_BY_LOCALE[locale]
    if (localized !== undefined) return localized
  }
  return ULTRAWORK_DEFAULT_PROMPT
}

export const ultraworkPromptVariants = {
  planner: {
    kind: "bundled",
    content: plannerPrompt,
    filePath: "packages/prompts-core/prompts/ultrawork/planner.md",
    contentByLocale: { zh: plannerPromptZh },
  },
  gpt: {
    kind: "bundled",
    content: gptPrompt,
    filePath: "packages/prompts-core/prompts/ultrawork/gpt.md",
    contentByLocale: { zh: gptPromptZh },
  },
  gemini: {
    kind: "bundled",
    content: geminiPrompt,
    filePath: "packages/prompts-core/prompts/ultrawork/gemini.md",
    contentByLocale: { zh: geminiPromptZh },
  },
  glm: {
    kind: "bundled",
    content: glmPrompt,
    filePath: "packages/prompts-core/prompts/ultrawork/glm.md",
    contentByLocale: { zh: glmPromptZh },
  },
  default: {
    kind: "bundled",
    content: defaultPrompt,
    filePath: "packages/prompts-core/prompts/ultrawork/default.md",
    contentByLocale: { zh: defaultPromptZh },
  },
} satisfies VariantTable

export const codexUltraworkPromptVariants = {
  codex: {
    kind: "bundled",
    content: codexPrompt,
    filePath: "packages/prompts-core/prompts/ultrawork/codex.md",
    contentByLocale: { zh: codexPromptZh },
  },
} satisfies VariantTable
