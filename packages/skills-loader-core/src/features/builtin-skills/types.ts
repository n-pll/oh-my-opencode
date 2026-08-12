import type { SkillMcpConfig } from "../../types"

export interface BuiltinSkill {
  name: string
  description: string
  /** Locale-keyed description overrides (e.g. `{ zh: "..." }`); falls back to `description`. */
  descriptionByLocale?: Readonly<Record<string, string>>
  template: string
  /** Locale-keyed template overrides (e.g. `{ zh: "..." }`); falls back to `template`. */
  templateByLocale?: Readonly<Record<string, string>>
  resolvedPath?: string
  license?: string
  compatibility?: string
  metadata?: Record<string, string>
  allowedTools?: string[]
  agent?: string
  model?: string
  subtask?: boolean
  argumentHint?: string
  mcpConfig?: SkillMcpConfig
}

/**
 * Select the locale-specific string with graceful fallback to the base value.
 * Mirrors {@link selectBundledContent} in prompts-core: when `locale` is set
 * and an override exists for it, use it; otherwise return the English base.
 */
export function selectLocalizedField(
  base: string,
  byLocale: Readonly<Record<string, string>> | undefined,
  locale: string | undefined,
): string {
  if (locale !== undefined && byLocale !== undefined) {
    const localized = byLocale[locale]
    if (localized !== undefined) return localized
  }
  return base
}
