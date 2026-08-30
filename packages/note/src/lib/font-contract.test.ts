import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const __dirname = import.meta.dirname;

type UnicodeInterval = {
  start: number;
  end: number;
};

function fontFaceBlocks(css: string) {
  return css.match(/@font-face\s*\{[^}]+\}/g) ?? [];
}

function unicodeIntervals(block: string): UnicodeInterval[] {
  return [...block.matchAll(/U\+([0-9A-F]+)(?:-([0-9A-F]+))?/gi)].map((match) => {
    const start = Number.parseInt(match[1], 16);
    return {
      start,
      end: Number.parseInt(match[2] ?? match[1], 16),
    };
  });
}

function includesCodePoint(intervals: UnicodeInterval[], codePoint: number) {
  return intervals.some(({ start, end }) => codePoint >= start && codePoint <= end);
}

describe("bundled font CSS contract", () => {
  it("assigns Inter to Cyrillic and Noto JP only to Japanese ranges", async () => {
    const css = await readFile(join(__dirname, "../../template/style.css"), "utf-8");
    const blocks = fontFaceBlocks(css);
    const interBlock = blocks.find(
      (block) => block.includes('font-family: "Kiku Inter"') && block.includes("_kiku_inter.ttf"),
    );
    const notoBlocks = blocks.filter((block) => block.includes("_kiku_noto_"));

    expect(interBlock).toBeDefined();
    expect(notoBlocks).toHaveLength(3);

    const interRanges = unicodeIntervals(interBlock ?? "");
    expect(includesCodePoint(interRanges, "Я".codePointAt(0) ?? 0)).toBe(true);
    expect(includesCodePoint(interRanges, "漢".codePointAt(0) ?? 0)).toBe(false);

    for (const block of notoBlocks) {
      const ranges = unicodeIntervals(block);
      expect(includesCodePoint(ranges, "Я".codePointAt(0) ?? 0)).toBe(false);
      expect(includesCodePoint(ranges, "漢".codePointAt(0) ?? 0)).toBe(true);
      expect(includesCodePoint(ranges, "あ".codePointAt(0) ?? 0)).toBe(true);
    }
  });

  it("keeps language selectors lower priority than explicit semantic classes", async () => {
    const css = await readFile(join(__dirname, "../styles/configurable.css"), "utf-8");

    expect(css).toContain(".font-cyrillic");
    expect(css).toContain(".font-japanese-text");
    expect(css).toContain(".font-japanese-display");
    expect(css).toContain(':where([lang="ru"])');
    expect(css).toContain(':where([lang="ja"])');
  });

  it("marks Russian UI, Japanese sentences, translations, and expressions explicitly", async () => {
    const [layout, sentence, expression] = await Promise.all([
      readFile(join(__dirname, "../components/Layout.tsx"), "utf-8"),
      readFile(join(__dirname, "../lazy/components/Sentence.tsx"), "utf-8"),
      readFile(join(__dirname, "../components/ExpressionSection.tsx"), "utf-8"),
    ]);

    expect(layout).toContain('class="font-cyrillic transition-colors relative"');
    expect(layout).toContain('lang="ru"');
    expect(sentence).toContain('class="sentence font-japanese-text sentence-field"');
    expect(sentence).toContain(
      'class="collapse-content text-base sm:text-lg text-base-content-calm p-0 font-cyrillic"',
    );
    expect(expression).toContain("expression font-japanese-display");
    expect(sentence.match(/lang="ja"/g)).toHaveLength(1);
    expect(sentence.match(/lang="ru"/g)).toHaveLength(1);
    expect(expression).toContain('lang="ja"');
  });
});
