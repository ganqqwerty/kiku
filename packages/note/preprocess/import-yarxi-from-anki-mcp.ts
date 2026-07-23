import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const ANKI_MCP_URL = process.env.ANKI_MCP_URL ?? "http://127.0.0.1:3141/";
const DECK_NAME = process.env.YARXI_DECK_NAME ?? "Retired decks::000ClassicRTK";
const MODEL_NAME = process.env.YARXI_MODEL_NAME ?? "Japanese Kanji AnkiWeb";
const OUTPUT_PATH = join(import.meta.dirname, "data", "kanji-keyword-yarxi.json");

type McpResponse = {
  result?: {
    content?: { type: string; text?: string }[];
    isError?: boolean;
  };
  error?: {
    code: number;
    message: string;
  };
};

type FindNotesResult = {
  noteIds: number[];
  total: number;
  hasMore: boolean;
};

type NotesInfoResult = {
  notes: {
    noteId: number;
    fields: {
      Kanji?: { value: string };
      Keyword_YARXI?: { value: string };
    };
  }[];
};

function parseSseResponse(body: string): McpResponse {
  const messages = body
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data: "))
    .map((line) => JSON.parse(line.slice("data: ".length)) as McpResponse);
  const response = messages.at(-1);
  if (!response) throw new Error("Anki MCP returned no SSE message");
  return response;
}

async function callTool<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const response = await fetch(ANKI_MCP_URL, {
    method: "POST",
    headers: {
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `${name}-${Date.now()}`,
      method: "tools/call",
      params: { name, arguments: args },
    }),
  });
  if (!response.ok) {
    throw new Error(`Anki MCP ${name} failed with HTTP ${response.status}`);
  }

  const payload = parseSseResponse(await response.text());
  if (payload.error) throw new Error(payload.error.message);
  const text = payload.result?.content?.find((item) => item.type === "text")?.text;
  if (payload.result?.isError || !text) {
    throw new Error(text ?? `Anki MCP ${name} returned no text result`);
  }
  return JSON.parse(text) as T;
}

async function findAllNoteIds() {
  const query = `deck:"${DECK_NAME}" note:"${MODEL_NAME}"`;
  const noteIds: number[] = [];
  const limit = 500;

  for (let offset = 0; ; offset += limit) {
    const page = await callTool<FindNotesResult>("find_notes", { query, limit, offset });
    noteIds.push(...page.noteIds);
    console.log(`Найдено заметок: ${noteIds.length}/${page.total}`);
    if (!page.hasMore) break;
  }

  return noteIds;
}

async function readYarxiKeywords(noteIds: number[]) {
  const keywordByKanji: Record<string, string> = {};
  const skipped: { noteId: number; kanji: string; keyword: string }[] = [];
  const chunkSize = 100;

  for (let offset = 0; offset < noteIds.length; offset += chunkSize) {
    const ids = noteIds.slice(offset, offset + chunkSize);
    const page = await callTool<NotesInfoResult>("notes_info", {
      notes: ids,
      include_fields: ["Kanji", "Keyword_YARXI"],
    });

    for (const note of page.notes) {
      const kanji = note.fields.Kanji?.value.trim() ?? "";
      const keyword = note.fields.Keyword_YARXI?.value.trim() ?? "";
      if ([...kanji].length !== 1 || !keyword) {
        skipped.push({ noteId: note.noteId, kanji, keyword });
        continue;
      }
      keywordByKanji[kanji] = keyword;
    }

    console.log(
      `Загружено полей: ${Math.min(offset + chunkSize, noteIds.length)}/${noteIds.length}`,
    );
  }

  return { keywordByKanji, skipped };
}

async function run() {
  const noteIds = await findAllNoteIds();
  const { keywordByKanji, skipped } = await readYarxiKeywords(noteIds);
  const sorted = Object.fromEntries(
    Object.entries(keywordByKanji).sort(([left], [right]) => left.localeCompare(right, "ja")),
  );

  if (Object.keys(sorted).length < 2_000) {
    throw new Error(
      `Получено только ${Object.keys(sorted).length} значений YARXI; ожидалось не менее 2000`,
    );
  }

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`Записано ${Object.keys(sorted).length} русских значений: ${OUTPUT_PATH}`);
  if (skipped.length) {
    console.warn(`Пропущено заметок без однозначной пары кандзи/значение: ${skipped.length}`);
  }
}

await run();
