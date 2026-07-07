import { loadPromptSync, prometheusPromptVariants } from "@oh-my-opencode/prompts-core"
import { getLocale } from "../../shared/i18n"

export const PROMETHEUS_PERMISSION = {
  edit: "allow" as const,
  bash: "allow" as const,
  webfetch: "allow" as const,
  question: "allow" as const,
}

function loadDefaultPrometheusPrompt(locale?: string): string {
  return loadPromptSync({
    source: prometheusPromptVariants.default,
    name: "prometheus",
    variant: "default",
    locale,
  }).body
}

export const PROMETHEUS_SYSTEM_PROMPT = loadDefaultPrometheusPrompt()

export function getPrometheusPrompt(model?: string, disabledTools?: readonly string[]): string {
  void model
  void disabledTools
  return loadDefaultPrometheusPrompt(getLocale())
}
