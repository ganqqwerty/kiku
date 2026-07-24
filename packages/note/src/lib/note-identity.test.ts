import { describe, expect, it } from "vitest";
import { ankiNoteTypeFilter, isSearchableNoteType, noteIdentity } from "./note-identity";

describe("Russian note identity", () => {
  it("uses the packaged model and card names", () => {
    expect(noteIdentity.noteType).toBe("Kiku RU");
    expect(noteIdentity.cardType).toBe("Майнинг");
  });

  it("searches Russian notes while keeping upstream compatibility", () => {
    expect(ankiNoteTypeFilter).toContain('"note:Kiku RU"');
    expect(isSearchableNoteType("Kiku RU")).toBe(true);
    expect(isSearchableNoteType("Kiku")).toBe(true);
    expect(isSearchableNoteType("Lapis")).toBe(true);
  });
});
