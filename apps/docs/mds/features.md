---
outline: deep
---

# Возможности

## Основные возможности

### Сеть кандзи

Находите другие заметки с тем же кандзи, чтением или выражением, а также связанные выражения.
Для этой функции нужен [AnkiConnect](https://ankiweb.net/shared/info/2055492159) или кэш заметок от дополнения [Kiku Note Manager](https://ankiweb.net/shared/info/408592650?cb=1763445474367).

<video controls>
  <source src="/media/feature-kanji-web.webm" type="video/mp4" />
</video>

### Группировка изображений, предложений и аудио

В одну заметку можно добавить несколько изображений, предложений и аудиофайлов. Kiku RU объединит связанные поля в группы.
Подробнее читайте в разделе [«Группировка полей»](./field-grouping).

<video controls>
  <source src="/media/feature-group-field.2.webm" type="video/mp4" />
</video>

### Темы

Доступны 35 встроенных тем на основе [daisyUI](https://daisyui.com/).

<video controls>
  <source src="/media/feature-theme.2.webm" type="video/mp4" />
</video>

### Настройки

Меняйте параметры на отдельной странице настроек внутри карточки.

<video controls>
  <source src="/media/feature-settings.2.webm" type="video/mp4" />
</video>

### Поддержка AnkiDroid

Kiku RU полностью протестирован в AnkiDroid.

<video controls style="height: 720px;">
  <source src="/media/feature-ankidroid.2.webm" type="video/mp4"  />
</video>

:::info AnkiDroid
Рекомендуем включить [новый экран обучения](https://forums.ankiweb.net/t/new-study-screen-official-thread/67394).
На нём поиск по заметкам работает намного быстрее, потому что Web Worker и другие кэши сохраняются между карточками.
Откройте настройки AnkiDroid → `New study screen` → `Enable`.
:::

:::info AnkiMobile
AnkiMobile поддерживается с несколькими известными ограничениями.
Подробности есть в [задаче исходного проекта](https://github.com/youyoumu/kiku/issues/12).
:::

## Другие возможности

### Размытие NSFW

Добавьте заметке тег `NSFW`, и изображения будут автоматически размыты. Если изображений несколько, добавьте к нужному тегу `<img>` атрибут `data-nsfw="false"`, чтобы не размывать его.

### Интеграция с AnkiDroid

:::info
Эта функция работает только на старом экране обучения AnkiDroid. См. [задачу исходного проекта](https://github.com/youyoumu/kiku/issues/30).
:::

Смахните вправо, чтобы ответить `Хорошо`, или влево, чтобы ответить `Снова`.
