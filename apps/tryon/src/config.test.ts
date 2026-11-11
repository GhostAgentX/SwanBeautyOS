import { describe, expect, it } from "vitest"
import { readConfig } from "./config"

describe("readConfig", () => {
  it("reads embed parameters and falls back to env defaults", () => {
    expect(readConfig("?brand=swan-beauty&look=classic-red&embed=1&api=https%3A%2F%2Fdesign.example.com%2F", {})).toEqual({ api: "https://design.example.com", brand: "swan-beauty", look: "classic-red", embed: true })
    expect(readConfig("", { BEAUTYOS_API_URL: "https://x.test", BEAUTYOS_BRAND: "b" })).toMatchObject({ api: "https://x.test", brand: "b", embed: false })
    expect(readConfig("", {}, "https://preview.example.com").api).toBe("https://preview.example.com")
  })

  it("rejects non-http API origins and sanitizes the brand slug", () => {
    expect(() => readConfig("?api=javascript:alert(1)", {})).toThrow()
    expect(readConfig("?brand=../../evil", {}).brand).toBe("evil")
  })
})
