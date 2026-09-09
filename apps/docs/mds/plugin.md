---
outline: deep
---

# Плагины

Плагин Kiku — это JavaScript-модуль `_kiku_plugin.js` в каталоге `collection.media`.
Модуль должен экспортировать именованную переменную `plugin`.
Типы для модуля доступны [в репозитории](https://github.com/ganqqwerty/kiku/blob/main/packages/note/plugins/plugin-types.ts).

:::info
Для собственных стилей можно также создать файл `_kiku_plugin.css`.
:::

<<< ../../../packages/note/plugins/plugin-types.ts

Система плагинов пока проста. В будущем в ней появятся новые API.
Для более сложных сценариев изучите [примеры](https://github.com/ganqqwerty/kiku/tree/main/packages/note/plugins).
