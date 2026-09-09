import vueJsx from "@vitejs/plugin-vue-jsx";
import { defineConfig, type HeadConfig } from "vitepress";
import { vitePluginCopyKikuAssets } from "./tools/vite-plugin-copy-kiku-assets";
import { vitePluginServeKikuAssets } from "./tools/vite-plugin-serve-kiku-assets";

const umamiScript: HeadConfig = [
  "script",
  {
    defer: "true",
    src: process.env.VITE_UMAMI_URL ?? "",
    "data-website-id": process.env.VITE_UMAMI_WEBSITE_ID ?? "",
  },
];

// TODO: PURE annotation to avoid Rollup warning https://github.com/vueuse/vueuse/pull/5388

export default defineConfig({
  lang: "ru-RU",
  base: process.env.GITHUB_ACTIONS ? "/kiku/" : "/",
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag === "kiku-host-docs",
      },
    },
  },
  srcDir: "mds",
  title: "Kiku RU",
  description: "Интерактивный тип заметки Anki для изучения японского языка на русском.",
  head: [
    [
      "link",
      {
        rel: "icon",
        href: process.env.GITHUB_ACTIONS ? "/kiku/favicon.ico" : "/favicon.ico",
      },
    ],
    umamiScript,
  ],
  vite: {
    publicDir: "../public",
    plugins: [
      //@ts-expect-error rolldown/rollup type mismatch
      vueJsx(),
      vitePluginCopyKikuAssets(),
      //@ts-expect-error rolldown/rollup type mismatch
      vitePluginServeKikuAssets(),
    ],
  },
  themeConfig: {
    lastUpdated: { text: "Обновлено" },
    docFooter: { prev: "Предыдущая страница", next: "Следующая страница" },
    darkModeSwitchLabel: "Тема",
    lightModeSwitchTitle: "Включить светлую тему",
    darkModeSwitchTitle: "Включить тёмную тему",
    sidebarMenuLabel: "Меню",
    returnToTopLabel: "Наверх",
    langMenuLabel: "Сменить язык",
    skipToContentLabel: "Перейти к содержанию",
    nav: [{ text: "Главная", link: "/" }],
    sidebar: [
      {
        text: "Начало работы",
        items: [
          { text: "Установка", link: "/installation" },
          { text: "Обновление Kiku RU", link: "/updating" },
          { text: "Переход с Lapis", link: "/migration" },
        ],
      },
      {
        text: "Подробнее",
        items: [
          { text: "Возможности", link: "/features" },
          { text: "Группировка полей", link: "/field-grouping" },
          { text: "Связанные выражения", link: "/related-expression" },
          { text: "Плагины", link: "/plugin" },
          { text: "Как устроен Kiku", link: "/how-things-work" },
          { text: "Разработка", link: "/development" },
        ],
      },
      {
        text: "Рецепты",
        items: [
          { text: "Дополнительные внешние ссылки", link: "/add-more-external-links" },
          { text: "Конфетти", link: "/confetti" },
          { text: "Стиль словаря", link: "/custom-dictionary-style" },
          { text: "Разделы окна кандзи", link: "/custom-kanji-info-extra" },
          { text: "Цвет акцентных схем", link: "/custom-pitch-accent-color" },
          { text: "Своя тема", link: "/custom-theme" },
          { text: "Дополнительные поля", link: "/display-extra-fields" },
          { text: "Префектуры Японии", link: "/japanese-prefectures" },
          { text: "Случайный шрифт", link: "/random-font" },
          { text: "Автоматическое снятие размытия", link: "/unblur-picture-automatically" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/ganqqwerty/kiku" }],
  },
});
