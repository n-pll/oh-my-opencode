/**
 * @oh-my-opencode/i18n-core — harness-neutral i18n runtime.
 *
 * Provides the locale-detection + translation-lookup mechanism that every
 * Core package and Adapter can consume without depending on any specific
 * harness (OpenCode, Codex, ...). Consumers register their own dictionary
 * via {@link createTranslator} and get back a typed `t()` bound to their
 * key set.
 *
 * This package deliberately holds NO translation strings — the dictionaries
 * are adapter-specific (omo-opencode, omo-codex) and stay with the consumer.
 */

/** Locales supported across the workspace. */
export type SupportedLocale = "en" | "zh"

/** A dictionary maps every translation key to its localized string. */
export type LocaleMessages<TKey extends string> = Record<TKey, string>

/** Per-locale dictionary map. The `en` locale is required (baseline). */
export type LocaleMap<TKey extends string> = Record<SupportedLocale, LocaleMessages<TKey>>

/** Translate a key with optional interpolation params ({{name}} placeholders). */
export type TranslateFn<TKey extends string> = (
  key: TKey,
  params?: Record<string, string | number | null | undefined>,
) => string

export interface Translator<TKey extends string> {
  readonly locale: SupportedLocale
  readonly fallback: SupportedLocale
  /** Translate a key. Falls back to fallback locale, then to the raw key. */
  readonly t: TranslateFn<TKey>
}

export interface CreateTranslatorOptions<TKey extends string> {
  readonly locales: LocaleMap<TKey>
  readonly locale?: SupportedLocale
  readonly fallback?: SupportedLocale
}

const SUPPORTED_LOCALES: readonly SupportedLocale[] = ["en", "zh"]

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale)
}

/**
 * Detect the supported locale from the LANG environment variable.
 * Returns "en" for anything unrecognized.
 *
 * Examples: "zh_CN.UTF-8" -> "zh", "en_US.UTF-8" -> "en", "ja_JP" -> "en".
 */
export function detectLocale(langEnv: string | undefined): SupportedLocale {
  const lang = (langEnv ?? "").split(".")[0]?.split("_")[0]?.toLowerCase() ?? "en"
  return lang === "zh" ? "zh" : "en"
}

const INTERPOLATION_PATTERN = /\{\{(\w+)\}\}/g

function interpolate(template: string, params: Record<string, string | number | null | undefined> | undefined): string {
  if (params === undefined) return template
  return template.replace(INTERPOLATION_PATTERN, (match, name: string) => {
    const value = params[name]
    return value != null ? String(value) : match
  })
}

/**
 * Create a translator bound to a specific dictionary. Each Core package or
 * Adapter calls this once with its own {@link LocaleMap} and receives a
 * typed `t()` whose keys are constrained to its dictionary.
 *
 * The returned translator holds its own current-locale state, so multiple
 * packages can coexist without sharing mutable global state.
 */
export function createTranslator<TKey extends string>(
  options: CreateTranslatorOptions<TKey>,
): Translator<TKey> {
  const fallback: SupportedLocale = options.fallback ?? "en"
  let currentLocale: SupportedLocale =
    options.locale && isSupportedLocale(options.locale) ? options.locale : detectLocale(process.env.LANG)
  if (!isSupportedLocale(currentLocale)) currentLocale = "en"

  const translate: TranslateFn<TKey> = (key, params) => {
    const currentMessages = options.locales[currentLocale]
    const fallbackMessages = options.locales[fallback]
    const raw = currentMessages[key] ?? fallbackMessages[key] ?? key
    return interpolate(raw, params)
  }

  return {
    get locale() {
      return currentLocale
    },
    get fallback() {
      return fallback
    },
    t: translate,
  }
}

/** Mutable translator that allows runtime locale switching (for adapters). */
export interface MutableTranslator<TKey extends string> extends Translator<TKey> {
  setLocale(locale: SupportedLocale): void
}

export function createMutableTranslator<TKey extends string>(
  options: CreateTranslatorOptions<TKey>,
): MutableTranslator<TKey> {
  const base = createTranslator(options)
  let mutableLocale = base.locale
  const translate: TranslateFn<TKey> = (key, params) => {
    const currentMessages = options.locales[mutableLocale]
    const fallbackMessages = options.locales[base.fallback]
    const raw = currentMessages[key] ?? fallbackMessages[key] ?? key
    return interpolate(raw, params)
  }
  return {
    get locale() {
      return mutableLocale
    },
    get fallback() {
      return base.fallback
    },
    t: translate,
    setLocale(locale: SupportedLocale): void {
      if (isSupportedLocale(locale)) mutableLocale = locale
    },
  }
}
