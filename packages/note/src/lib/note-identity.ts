export const noteIdentity = {
  noteType: "Kiku RU",
  cardType: "Майнинг",
  deck: "Kiku RU",
} as const;

export const searchableNoteTypes = [noteIdentity.noteType, "Kiku", "Lapis"] as const;

export const ankiNoteTypeFilter = `(${searchableNoteTypes
  .map((name) => `"note:${name}"`)
  .join(" OR ")})`;

export function isSearchableNoteType(modelName: string) {
  return (searchableNoteTypes as readonly string[]).includes(modelName);
}
