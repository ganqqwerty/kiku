---
outline: deep
---

# Дополнительные поля

Допустим, у вас есть поле **ExtraInfo**. Вы хотите показать его под разделом **Sentence** на обратной стороне карточки.

Сначала откройте файл `_kiku_back.html` в каталоге `collection.media`. Его начало выглядит так:

::: code-group

```html [_kiku_back.html]
<!-- Kiku Note v2.0.0
Этот файл создаётся автоматически. Ручные изменения будут потеряны после сохранения.

... остальная часть файла
```

:::

Добавьте **ExtraInfo** внутрь элемента `template`:

::: code-group

```html [_kiku_back.html]
<template id="ExtraInfo">{{ExtraInfo}}</template>

<!-- Kiku Note v2.0.0
Этот файл создаётся автоматически. Ручные изменения будут потеряны после сохранения.

... остальная часть файла
```

:::

::: warning
Не меняйте остальную часть файла даже с помощью форматтера, например [Prettier](https://prettier.io/).
Созданный SSR-шаблон зависит от пробелов и переводов строк.
:::

Теперь добавьте поле **ExtraInfo** в компонент **Sentence** через `_kiku_plugin.js`:

::: code-group

<!-- prettier-ignore -->
<<< ../../../packages/note/plugins/display-extra-fields/_kiku_plugin.js [_kiku_plugin.js]
:::

Затем откройте настройки Kiku RU и нажмите **Сохранить**. Kiku RU обновит обратный шаблон из изменённого `_kiku_back.html`.
