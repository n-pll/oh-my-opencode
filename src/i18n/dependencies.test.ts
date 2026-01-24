import { describe, it, expect } from "bun:test"

describe("i18n Dependencies", () => {
  it("should have i18next installed", async () => {
    const i18next = await import("i18next")
    expect(typeof i18next).toBe("object")
  })

  it("should have i18next-fs-backend installed", async () => {
    const i18nextFsBackend = await import("i18next-fs-backend")
    expect(typeof i18nextFsBackend).toBe("object")
  })
})
