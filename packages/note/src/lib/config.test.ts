import { describe, expect, it } from "vitest";
import {
  DARK_VARS_REGEX,
  generateCssVars,
  generateCssVarsDark,
  getCssVar,
  getCssVarDark,
  LIGHT_VARS_REGEX,
  rootDatasetConfigWhitelist,
  validateConfig,
} from "./config";
import { defaultConfig } from "./default-config";

describe("rootDatasetConfigWhitelist", () => {
  it("should only contain keys present in defaultConfig", () => {
    const defaultConfigKeys = Object.keys(defaultConfig);

    for (const key of rootDatasetConfigWhitelist) {
      expect(defaultConfigKeys).toContain(key);
    }
  });
});

describe("font config validation", () => {
  it("uses defaults when a config lacks semantic font fields", () => {
    const incompleteConfig = {
      ...defaultConfig,
      fontFamilyCyrillic: undefined,
      fontFamilyJapaneseText: undefined,
      fontFamilyJapaneseDisplay: undefined,
    };
    const config = validateConfig(incompleteConfig as unknown as typeof defaultConfig);

    expect(config.fontFamilyCyrillic).toBe(defaultConfig.fontFamilyCyrillic);
    expect(config.fontFamilyJapaneseText).toBe(defaultConfig.fontFamilyJapaneseText);
    expect(config.fontFamilyJapaneseDisplay).toBe(defaultConfig.fontFamilyJapaneseDisplay);
  });

  it("preserves all three semantic font settings", () => {
    const config = validateConfig({
      ...defaultConfig,
      fontFamilyCyrillic: "'Test Cyrillic'",
      fontFamilyJapaneseText: "'Test Japanese Text'",
      fontFamilyJapaneseDisplay: "'Test Japanese Display'",
    });

    expect(config.fontFamilyCyrillic).toBe("'Test Cyrillic'");
    expect(config.fontFamilyJapaneseText).toBe("'Test Japanese Text'");
    expect(config.fontFamilyJapaneseDisplay).toBe("'Test Japanese Display'");
  });

  it("generates the three semantic font variables", () => {
    expect(getCssVar(defaultConfig)).toMatchObject({
      "--font-cyrillic": defaultConfig.fontFamilyCyrillic,
      "--font-japanese-text": defaultConfig.fontFamilyJapaneseText,
      "--font-japanese-display": defaultConfig.fontFamilyJapaneseDisplay,
    });
  });
});

describe("css vars regex guards", () => {
  const light = generateCssVars(getCssVar(defaultConfig));
  const dark = generateCssVarsDark(getCssVarDark(defaultConfig));

  it("LIGHT_VARS_REGEX matches the full generateCssVars output", () => {
    expect(light.match(LIGHT_VARS_REGEX)?.[0]).toBe(light);
  });

  it("DARK_VARS_REGEX matches the full generateCssVarsDark output", () => {
    expect(dark.match(DARK_VARS_REGEX)?.[0]).toBe(dark);
  });
});

describe("css vars regex isolation", () => {
  const light = generateCssVars(getCssVar(defaultConfig));
  const dark = generateCssVarsDark(getCssVarDark(defaultConfig));
  const SENTINEL = "/* __REPLACED__ */";
  const surroundingCss = [
    ":root { --my-var: red; }",
    "body { color: blue; }",
    ".card { padding: 10px; }",
    light,
    dark,
    ".another { background: green; }",
  ].join("\n");

  it("LIGHT_VARS_REGEX only matches the light block, not other CSS or the dark block", () => {
    expect(LIGHT_VARS_REGEX.test(dark)).toBe(false);

    const replaced = surroundingCss.replace(LIGHT_VARS_REGEX, SENTINEL);
    expect(replaced.match(/\/\* __REPLACED__ \*\//g)).toHaveLength(1);
    expect(replaced).toContain(":root { --my-var: red; }");
    expect(replaced).toContain("body { color: blue; }");
    expect(replaced).toContain(".card { padding: 10px; }");
    expect(replaced).toContain(dark);
    expect(replaced).toContain(".another { background: green; }");
    expect(replaced).not.toContain(light);
  });

  it("DARK_VARS_REGEX only matches the dark block, not other CSS or the light block", () => {
    expect(DARK_VARS_REGEX.test(light)).toBe(false);

    const replaced = surroundingCss.replace(DARK_VARS_REGEX, SENTINEL);
    expect(replaced.match(/\/\* __REPLACED__ \*\//g)).toHaveLength(1);
    expect(replaced).toContain(":root { --my-var: red; }");
    expect(replaced).toContain("body { color: blue; }");
    expect(replaced).toContain(".card { padding: 10px; }");
    expect(replaced).toContain(light);
    expect(replaced).toContain(".another { background: green; }");
    expect(replaced).not.toContain(dark);
  });
});
