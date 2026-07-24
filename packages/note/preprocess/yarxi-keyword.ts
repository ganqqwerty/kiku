const YARXI_MEANING_SEPARATOR = /\*_\*|\*/u;

export function normalizeYarxiKeyword(value: string) {
  return value
    .split(YARXI_MEANING_SEPARATOR)
    .map((meaning) => meaning.trim())
    .filter(Boolean)
    .join(", ");
}
