import { initI18n as initI18nImpl, getI18nInstance, i18nInstance as sharedI18nInstance } from "./config"

export function t(key: string, options?: Record<string, unknown>): string {
  const i18n = getI18nInstance()
  return i18n.t(key, options)
}

export async function initI18n(language: "en" | "zh-CN" = "en"): Promise<typeof sharedI18nInstance> {
  return initI18nImpl(language)
}

export function getI18nInstanceImpl() {
  return getI18nInstance()
}

export * from "./config"
