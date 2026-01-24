import { describe, it, expect } from "bun:test"
import { initI18n, t } from "./index"

describe("i18n", () => {
  it("should initialize with English", async () => {
    const i18n = initI18n("en")
    expect(i18n).toBeDefined()
  })

  it("should initialize with Chinese", async () => {
    const i18n = initI18n("zh-CN")
    expect(i18n).toBeDefined()
  })

  it("should return key if translation not found (fallback to English)", async () => {
    initI18n("en")
    const result = t("non.existent.key")
    expect(result).toBe("non.existent.key")
  })

  it("should support interpolation", async () => {
    initI18n("en")
    const result = t("key with {{name}}", { name: "value" })
    expect(result).toContain("value")
  })

  it("should support count-based pluralization for English", async () => {
    initI18n("en")
    const singular = t("item", { count: 1 })
    const plural = t("item", { count: 5 })
    expect(singular).toBeDefined()
    expect(plural).toBeDefined()
  })
})
