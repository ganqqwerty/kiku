---
outline: deep
---

# Префектуры Японии (в разработке)

Плагин показывает карту Японии, если поле `Expression` или `ExpressionReading` содержит название японской префектуры.

<video controls playsinline width="100%">
  <source src="https://i.imgur.com/KdW3lKZ.mp4" type="video/mp4">
</video>

## Установка

Скопируйте файлы плагина в каталог `collection.media`.

::: code-group

<!-- prettier-ignore -->
<<< ../../../packages/note/plugins/japanese-prefectures/_kiku_plugin.js [_kiku_plugin.js]
<<< ../../../packages/note/plugins/japanese-prefectures/_kiku_plugin.css [_kiku_plugin.css]
<<< ../../../packages/note/plugins/japanese-prefectures/_kiku-plugin-japanese-prefectures.js [_kiku-plugin-japanese-prefectures.js]
:::

Файл карты:

- [\_japanese-prefectures-map-mobile.svg](https://github.com/ganqqwerty/kiku/blob/main/packages/note/plugins/japanese-prefectures/_japanese-prefectures-map-mobile.svg)

## Возможности

- Найденная префектура мигает. Задайте цвет в `matchFill` внутри `CONFIG` или укажите `null`, чтобы сохранить цвет региона.
- При наведении меняется яркость. Также появляются название префектуры и её регион.
- При нажатии открывается окно со ссылками на разные сайты.
