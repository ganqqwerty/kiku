---
outline: deep
---

# Как устроен Kiku RU

В отличие от обычных типов заметок, Kiku RU полностью написан на TypeScript и использует библиотеку интерфейсов [SolidJS](https://www.solidjs.com/).
Это позволяет сделать интерфейс интерактивным.

Kiku RU также использует SSR и гидратацию SolidJS, поэтому первый экран загружается быстро. Заголовок, значение слова и другие компоненты загружаются позже по мере необходимости.

## Файлы Kiku

Kiku RU хранит служебные файлы в каталоге Anki `collection.media`. Их имена начинаются с `_kiku`.

```json
[
  "_kiku_style.css",
  "_kiku.css",
  "_kiku_plugin.css",
  "_kiku_notes_0.json.gz",
  "_kiku_notes_1.json.gz",
  "_kiku_notes_2.json.gz",
  "_kiku_notes_3.json.gz",
  "_kiku_notes_4.json.gz",
  "_kiku_notes_5.json.gz",
  "_kiku_notes_6.json.gz",
  "_kiku_notes_7.json.gz",
  "_kiku_notes_8.json.gz",
  "_kiku_notes_9.json.gz",
  "_kiku_back.html",
  "_kiku_front.html",
  "_kiku_lazy.js",
  "_kiku_libs.js",
  "_kiku_plugin.js",
  "_kiku_shared.js",
  "_kiku_worker.js",
  "_kiku.js",
  "_kiku_config.json",
  "_kiku_db_main_manifest.json",
  "_kiku_notes_manifest.json",
  "_kiku_db_main.tar"
]
```

Назначение основных файлов:

- `_kiku_config.json` хранит настройки.
- Файлы `_kiku_notes_1.json.gz`, `_kiku_notes_2.json.gz`, `_kiku_notes_*` и другие создаёт Kiku Note Manager для сети кандзи. Они содержат результат, похожий на ответ API [`notesInfo`](https://git.sr.ht/~foosoft/anki-connect#codenotesinfocode) AnkiConnect, для заметок с `modelName` **"Kiku RU"**, **"Kiku"** или **"Lapis"**.
- `_kiku_db_main.tar` и `_kiku_db_main_manifest.json` содержат базы данных для сети кандзи.
- `_kiku.js` — точка входа JavaScript-модуля. Другие модули, например `_kiku_lazy.js`, загружаются после первого показа страницы.
  `_kiku_worker.js` выполняет JavaScript-операции через [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker).
- `_kiku.css` содержит стили Kiku RU.
- `_kiku_front.html`, `_kiku_back.html` и `_kiku_style.css` содержат шаблоны лицевой стороны, обратной стороны и стилей. Kiku RU применяет их при сохранении настроек.

## Настройки

Каждое изменение применяется сразу и сохраняется в [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).
Anki удаляет эти временные настройки после выхода из экрана повторения.

Для постоянного сохранения настроек нужен AnkiConnect.
Когда AnkiConnect запущен, нажмите **Сохранить** на странице настроек. Kiku RU выполнит два действия:

- Сохранит параметры в `_kiku_config.json`.
- Обновит параметры в лицевом шаблоне, обратном шаблоне и стилях заметки **"Kiku RU"** из файлов `_kiku_front.html`, `_kiku_back.html` и `_kiku_style.css`.

### Стандартная конфигурация

<<< ../../../packages/note/src/lib/default-config.ts

### Настройки в шаблонах лицевой стороны, обратной стороны и стилей

::: details Зачем хранить часть настроек в шаблонах? {open}
CSS загружается сразу, а JavaScript запускается после первого показа страницы.
Если хранить параметры только в JSON, карточка на короткое время покажет неверную тему до запуска JavaScript. Это называют [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content).
Ключевые параметры в шаблонах предотвращают такое мерцание.
:::

```js
[
  "theme",
  "themeDark",
  "fontFamilyCyrillic",
  "fontFamilyJapaneseText",
  "fontFamilyJapaneseDisplay",
  "blurNsfw",
  "pictureOnFront",
  "modVertical",
  "fontSizeBaseExpression",
  "fontSizeBasePitch",
  "fontSizeBaseSentence",
  "fontSizeBaseMiscInfo",
  "fontSizeBaseHint",
  "fontSizeSmExpression",
  "fontSizeSmPitch",
  "fontSizeSmSentence",
  "fontSizeSmMiscInfo",
  "fontSizeSmHint",
];
```
