import i18next, { i18n as i18nType } from "i18next"
import i18nextFsBackend from "i18next-fs-backend"
import { join } from "path"
import { fileURLToPath } from "url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

let i18nInstance: i18nType | null = null

export async function initI18n(language: "en" | "zh-CN" = "en"): Promise<i18nType> {
  i18nInstance = i18next.createInstance({
    backend: i18nextFsBackend,
    fallbackLng: "en",
    lng: language,
    debug: false,
    ns: ["common", "cli", "doctor", "agents", "errors", "config", "docs"],
    defaultNS: "common",
  })
  await i18nInstance.init()
  return i18nInstance
}

export function getI18nInstance(): i18nType {
  if (!i18nInstance) {
    throw new Error("i18n not initialized. Call initI18n() first.")
  }
  return i18nInstance
}

export function createI18nInstance(language: "en" | "zh-CN"): i18nType {
  return i18next.createInstance({
    backend: i18nextFsBackend,
    fallbackLng: "en",
    lng: language,
    debug: false,
    ns: ["common", "cli", "doctor", "agents", "errors", "config", "docs"],
    defaultNS: "common",
  })
}

export { i18nInstance }


