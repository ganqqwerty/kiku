import type { Source } from "./types";
import type { DaisyUITheme } from "./theme";

const themeNames: Record<DaisyUITheme, string> = {
  light: "Светлая",
  dark: "Тёмная",
  cupcake: "Кекс",
  bumblebee: "Шмель",
  emerald: "Изумруд",
  corporate: "Корпоративная",
  synthwave: "Синтвейв",
  retro: "Ретро",
  cyberpunk: "Киберпанк",
  valentine: "Валентинка",
  halloween: "Хэллоуин",
  garden: "Сад",
  forest: "Лес",
  aqua: "Аква",
  lofi: "Лоу-фай",
  pastel: "Пастель",
  fantasy: "Фэнтези",
  wireframe: "Каркас",
  black: "Чёрная",
  luxury: "Роскошь",
  dracula: "Дракула",
  cmyk: "CMYK",
  autumn: "Осень",
  business: "Деловая",
  acid: "Кислотная",
  lemonade: "Лимонад",
  night: "Ночь",
  coffee: "Кофе",
  winter: "Зима",
  dim: "Приглушённая",
  nord: "Север",
  sunset: "Закат",
  caramellatte: "Карамельный латте",
  abyss: "Бездна",
  silk: "Шёлк",
};

const sourceNames: Record<Source, string> = {
  forms: "Форма",
  antonym: "Антоним",
  referenced: "Ссылка",
  related: "Связь",
};

export function getRussianThemeName(theme: DaisyUITheme) {
  return themeNames[theme];
}

export function getRussianSourceName(source: Source) {
  return sourceNames[source];
}
