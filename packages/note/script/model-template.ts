import {
  generateCssVars,
  generateCssVarsDark,
  getCssVar,
  getCssVarDark,
} from "#/src/lib/config.ts";
import { defaultConfig } from "#/src/lib/default-config.ts";

export function applyDefaultDataAttributes(template: string) {
  return template
    .replaceAll("__DATA_THEME__", defaultConfig.theme)
    .replaceAll("__DATA_THEME_DARK__", defaultConfig.themeDark)
    .replace("__DATA_BLUR_NSFW__", defaultConfig.blurNsfw.toString())
    .replace("__DATA_PICTURE_ON_FRONT__", defaultConfig.pictureOnFront.toString())
    .replace("__DATA_MOD_VERTICAL__", defaultConfig.modVertical.toString());
}

export function applyDefaultStyleVariables(style: string) {
  const cssVars = generateCssVars(getCssVar(defaultConfig));
  const cssVarsDark = generateCssVarsDark(getCssVarDark(defaultConfig));
  return style
    .replace("/* __CSS_VARIABLE__ */", cssVars)
    .replace("/* __CSS_VARIABLE_DARK__ */", cssVarsDark);
}
