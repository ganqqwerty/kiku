import { describe, expect, it } from "vitest";
import keywordByKanji from "./data/kanji-keyword-yarxi.json" with { type: "json" };
import { normalizeYarxiKeyword } from "./yarxi-keyword.ts";

describe("normalizeYarxiKeyword", () => {
  it.each([
    ["Почта*Удобство*", "Почта, Удобство"],
    ["Будда*Франция*", "Будда, Франция"],
    [
      "Речь*_*Различать*_*Лепесток*Косичка*_*Управление*",
      "Речь, Различать, Лепесток, Косичка, Управление",
    ],
    [" Доля*Минута*Процент* ", "Доля, Минута, Процент"],
    ["Почта, Удобство", "Почта, Удобство"],
    ["*_*", ""],
  ])("normalizes %s", (source, expected) => {
    expect(normalizeYarxiKeyword(source)).toBe(expected);
  });

  it("keeps the checked-in YARXI snapshot normalized", () => {
    const unnormalized = Object.entries(keywordByKanji).filter(
      ([, keyword]) => normalizeYarxiKeyword(keyword) !== keyword,
    );

    expect(Object.keys(keywordByKanji)).toHaveLength(2_316);
    expect(unnormalized).toEqual([]);
  });
});
