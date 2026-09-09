---
outline: deep
---

# Группировка полей

## Ручная группировка

Допустим, у вас уже есть обычная заметка с полями **Picture**, **Sentence** и
**SentenceAudio**:
::: details Поля {open}

Picture:

```html
<img src="gochuumon_wa_usagi_desuka.mkv_957803.webp" />
```

Sentence:

```html
このお店に<b>貢献</b>するために―
```

SentenceAudio:

```html
[sound:Gochuumon wa Usagi Desuka S01E09 9092049A.mkv_955687.289_958481.289.mp3]
```

:::

<img src="/media/field-grouping-1.2.png" alt="Поля без группировки" style="max-width: 100%;">

---

Теперь вы хотите добавить в эту заметку ещё одно изображение, предложение и аудио.
Без группировки поля будут выглядеть так:

::: details Поля {open}

Picture:

```html
<img src="Tate_no_Yuusha_no_NariagariS3-20.mkv_1190221.jpeg" />
<img src="gochuumon_wa_usagi_desuka.mkv_957803.webp" />
```

Sentence:

```html
どうせ勇者の捕縛に<b>貢献</b>すれば➡
<br />
このお店に<b>貢献</b>するために―
```

SentenceAudio:

<!-- prettier-ignore -->
```html
[sound:Tate no Yuusha no Nariagari S3 - 10.mkv_118779.mp3]
[sound:Gochuumon wa Usagi Desuka S01E09 9092049A.mkv_955687.289_958481.289.mp3]
```

:::

Изображения появятся на отдельных страницах, а остальные значения просто добавятся друг за другом.

<video controls autoplay loop>
  <source src="/media/field-grouping-2.2.webm" type="video/webm" />
</video>

---

Чтобы связать поля, добавьте атрибут `data-group-id` в тег `<img>`. Новые значения Sentence и SentenceAudio оберните в `<span>` с тем же `data-group-id`.

::: details Поля {open}

Picture:

```html
<img data-group-id="10" src="Tate_no_Yuusha_no_NariagariS3-20.mkv_1190221.jpeg" />
<img src="gochuumon_wa_usagi_desuka.mkv_957803.webp" />
```

Sentence:

```html
<span data-group-id="10"> どうせ勇者の捕縛に<b>貢献</b>すれば➡ </span>
このお店に<b>貢献</b>するために―
```

SentenceAudio:

```html
<span data-group-id="10"> [sound:Tate no Yuusha no Nariagari S3 - 10.mkv_118779.mp3] </span>
[sound:Gochuumon wa Usagi Desuka S01E09 9092049A.mkv_955687.289_958481.289.mp3]
```

:::

<video controls>
  <source src="/media/field-grouping-3.2.webm" type="video/webm" />
</video>

## Дополнительные правила

- Значение `data-group-id` должно быть положительным целым числом. Kiku RU сортирует группы по убыванию.
- Если `data-group-id` — [Unix-время](https://www.unixtimestamp.com/) между 2000 и 2100 годами, Kiku RU покажет его как дату.
- Каждое уникальное значение `data-group-id` создаёт новую страницу.
- Значения без `data-group-id` отображаются на одной странице.
- Поля **SentenceFurigana**, **SentenceTranslation** и **MiscInfo** тоже поддерживают группировку.

## Кнопка объединения контекста

Кнопка объединения контекста переносит поля из двух заметок в одну.
Она появляется в левом верхнем углу при переходе во вложенную заметку.

<video controls>
  <source src="/media/merge-context.mp4" type="video/mp4" />
</video>

- Нужен AnkiConnect. В настройках должен быть включён параметр **Предпочитать AnkiConnect**.
- Поля без группы из обеих заметок получат собственный NoteID в качестве `data-group-id`.
- Существующие значения `data-group-id` сохранятся.
- Объединяются поля **Picture**, **Sentence**, **SentenceFurigana**, **SentenceTranslation**, **SentenceAudio**, **MiscInfo** и **Tag**.
- Если в одной из заметок поле **SentenceFurigana** пустое, оно останется пустым и в итоговой заметке.
- Служебные теги `leech`, `marked` и `potential_leech` не переносятся в итоговую заметку.
- Если корневая заметка создана меньше суток назад, доступен параметр **Удалить корневую заметку**. Он удаляет корневую заметку после объединения.
