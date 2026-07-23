import kanjiDataPlugin from "./_kiku-plugin-kanji-data.js";

export const plugin = {
  ...kanjiDataPlugin({
    defaultOpen: true,
    collapseTitle: "Дополнительная информация",
    showVisuallySimilar: false,
    showComposedOf: false,
    showUsedIn: false,
    showMeanings: false,
    showRelated: false,
  }),
};
