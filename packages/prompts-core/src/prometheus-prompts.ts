import type { VariantTable } from "./types"
import defaultPrompt from "../prompts/prometheus/default.md"
import defaultPromptZh from "../prompts/prometheus/default.zh.md"

export const prometheusPromptVariants = {
  default: {
    kind: "bundled",
    content: defaultPrompt,
    filePath: "packages/prompts-core/prompts/prometheus/default.md",
    contentByLocale: { zh: defaultPromptZh },
  },
} satisfies VariantTable
