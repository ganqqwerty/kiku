---
outline: deep
---

# Конфетти

Нажимайте `2`, `3` или `4`, чтобы запустить конфетти. С каждым нажатием эффект становится сильнее. Нажмите `1`, чтобы встряхнуть выражение и сбросить серию.

<video controls playsinline width="100%">
  <source src="https://i.imgur.com/fNMrMLh.mp4" type="video/mp4">
</video>

## Установка

Скопируйте файлы плагина в каталог `collection.media`.

::: code-group

<!-- prettier-ignore -->
<<< ../../../packages/note/plugins/confetti/_kiku_plugin.js [_kiku_plugin.js]
<<< ../../../packages/note/plugins/confetti/_kiku_plugin.css [_kiku_plugin.css]
<<< ../../../packages/note/plugins/confetti/_kiku-plugin-confetti.js [_kiku-plugin-confetti.js]
:::

Звуковые файлы:

- [\_confetti.mp3](https://github.com/ganqqwerty/kiku/blob/main/packages/note/plugins/confetti/_confetti.mp3)
- [\_fail.mp3](https://github.com/ganqqwerty/kiku/blob/main/packages/note/plugins/confetti/_fail.mp3)
- [\_fail2.mp3](https://github.com/ganqqwerty/kiku/blob/main/packages/note/plugins/confetti/_fail2.mp3)
- [\_fireworks.mp3](https://github.com/ganqqwerty/kiku/blob/main/packages/note/plugins/confetti/_fireworks.mp3)

## Система серий

- Каждый успешный ответ увеличивает серию. Число частиц, скорость, сила тяжести и разброс растут до значения `maxCombo` (10).
- На каждой отметке `fireworksCheckpoints` запускаются фейерверк и звёзды.
- Четыре ошибки подряд запускают вспышку из роз.
