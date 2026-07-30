import type { VariantTable } from "./types"
import defaultPrompt from "../prompts/atlas/default.md"
import defaultPromptZh from "../prompts/atlas/default.zh.md"
import geminiPromptZh from "../prompts/atlas/gemini.zh.md"
import glmPromptZh from "../prompts/atlas/glm.zh.md"
import gptPromptZh from "../prompts/atlas/gpt.zh.md"
import kimiPromptZh from "../prompts/atlas/kimi.zh.md"
import kimiK27PromptZh from "../prompts/atlas/kimi-k2-7.zh.md"
import opus47PromptZh from "../prompts/atlas/opus-4-7.zh.md"
import geminiPrompt from "../prompts/atlas/gemini.md"
import glmPrompt from "../prompts/atlas/glm.md"
import gptPrompt from "../prompts/atlas/gpt.md"
import kimiPrompt from "../prompts/atlas/kimi.md"
import kimiK27Prompt from "../prompts/atlas/kimi-k2-7.md"
import kimiK3Prompt from "../prompts/atlas/kimi-k3.md"
import opus47Prompt from "../prompts/atlas/opus-4-7.md"

export const atlasPromptVariants = {
  "opus-4-7": {
    kind: "bundled",
    content: opus47Prompt,
    filePath: "packages/prompts-core/prompts/atlas/opus-4-7.md",
    contentByLocale: { zh: opus47PromptZh },
  },
  gpt: {
    kind: "bundled",
    content: gptPrompt,
    filePath: "packages/prompts-core/prompts/atlas/gpt.md",
    contentByLocale: { zh: gptPromptZh },
  },
  gemini: {
    kind: "bundled",
    content: geminiPrompt,
    filePath: "packages/prompts-core/prompts/atlas/gemini.md",
    contentByLocale: { zh: geminiPromptZh },
  },
  "kimi-k3": {
    kind: "bundled",
    content: kimiK3Prompt,
    filePath: "packages/prompts-core/prompts/atlas/kimi-k3.md",
  },
  "kimi-k2-7": {
    kind: "bundled",
    content: kimiK27Prompt,
    filePath: "packages/prompts-core/prompts/atlas/kimi-k2-7.md",
    contentByLocale: { zh: kimiK27PromptZh },
  },
  kimi: {
    kind: "bundled",
    content: kimiPrompt,
    filePath: "packages/prompts-core/prompts/atlas/kimi.md",
    contentByLocale: { zh: kimiPromptZh },
  },
  glm: {
    kind: "bundled",
    content: glmPrompt,
    filePath: "packages/prompts-core/prompts/atlas/glm.md",
    contentByLocale: { zh: glmPromptZh },
  },
  default: {
    kind: "bundled",
    content: defaultPrompt,
    filePath: "packages/prompts-core/prompts/atlas/default.md",
    contentByLocale: { zh: defaultPromptZh },
  },
} satisfies VariantTable
