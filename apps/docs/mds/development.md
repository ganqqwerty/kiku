---
outline: deep
---

# Разработка

## Структура проекта

Репозиторий Kiku — это монорепозиторий под управлением [Turborepo](https://turborepo.com/). Проект использует [pnpm](https://pnpm.io/) как менеджер пакетов
и [Oxc](https://oxc.rs/) для проверки и форматирования кода.

```
 kiku
├──  apps
│   └──  docs                 # Документация
├──  packages
│   ├──  addon                # Дополнение Kiku Note Manager
│   └──  note                 # Тип заметки Kiku
├── 󰊢 .gitignore
├──  .oxfmtrc.json
├──  .oxlintrc.json
├──  package.json
├──  pnpm-lock.yaml
├──  pnpm-workspace.yaml
├── 󰂺 README.md
└──  turbo.json
```

## Тип заметки Kiku RU

Тип заметки Kiku RU написан на TypeScript и собирается с помощью [Vite](https://vitejs.dev/).

```
 kiku/packages/note
├──  .db                      # Базы данных Kiku
├──  dist
├──  plugins                  # Типы и примеры плагинов
├──  preprocess
├──  preview                  # Предпросмотр Anki
├──  script
├──  template                 # Шаблоны файлов заметки Anki
│   ├──  _kiku_plugin.css     # Шаблон _kiku_plugin.css
│   ├──  _kiku_plugin.js      # Шаблон _kiku_plugin.js
│   ├──  back.html            # Обратный шаблон и _kiku_back.html
│   ├──  front.html           # Лицевой шаблон и _kiku_front.html
│   └──  style.css            # Шаблон стилей и _kiku_style.css
├──  tools                    # Общие инструменты и настройки
├── 󰣞 src
│   ├──  components
│   ├──  contexts
│   ├──  hooks
│   ├──  lazy
│   ├──  styles               # Исходные CSS-файлы
│   ├──  lib
│   ├──  worker
│   └──  index.tsx            # Точка входа JavaScript-сборки
├──  package.json
├──  tsconfig.json
└──  vite.config.ts
```

### Технологии

- [SolidJS](https://www.solidjs.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)

### Подготовка

- Создайте в `packages/note` файл `.env` на основе `.env.example` и укажите путь к Anki.
- Для сборки английского пакета создайте в Anki колоду `Kiku`.
- Для русского пакета используйте команду `pnpm --filter @repo/note package-ru`. Она берёт официальный APKG как базовый контейнер и создаёт колоду `Kiku RU`.

#### Базы данных

::: info
Файлы `.db/_kiku_db_main.tar` и `.db/_kiku_db_main_manifest.json` разрешены в `.gitignore`, поэтому Git может хранить их в репозитории.
:::

Скрипт `preprocess/generate-kiku-db-main.ts` создаёт `.db/_kiku_db_main.tar` и `.db/_kiku_db_main_manifest.json`.
Он использует результаты вспомогательных скриптов `preprocess/scrap-jpdb.ts`, `preprocess/scrap-wk.ts`, `preprocess/parse-jmdict.ts` и `preprocess/parse-kanji-vg.ts`.

### Сборка

::: info
Для части скриптов нужны запущенные Anki и AnkiConnect.
:::

- `pnpm run build` собирает JavaScript и CSS.
- `pnpm generate-template` создаёт лицевой шаблон, обратный шаблон и стили, а затем обрабатывает результат сборки.
- `pnpm copy-anki-build` копирует созданные файлы в каталог Anki `collection.media`.
- `pnpm update-note-type` обновляет тип заметки без повторного импорта `.apkg`.
- `pnpm apply` по очереди запускает `build`, `generate-template`, `copy-anki-build` и `update-note-type`.
- `pnpm package` создаёт английский `.apkg`.
- `pnpm --filter @repo/note package-ru` создаёт русский `.apkg`.

### Разработка с сервером Vite

Запустите `pnpm run dev`, чтобы открыть сервер Vite на порте `5173`.
Он загружает `preview/anki/index.html`, который имитирует WebView Anki.
Сервер также раздаёт файлы из каталога Anki `collection.media`.

Используйте `http://localhost:5173/?side=back#` для обратной стороны и `http://localhost:5173/?side=front#` для лицевой.
Поля тестовой заметки можно изменить в `src/lib/examples.ts`.
Чтобы скопировать поля из Kiku RU, откройте **Настройки → Отладка → AnkiFields**.
