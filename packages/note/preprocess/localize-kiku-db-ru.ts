import { mkdtemp, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import * as tar from "tar";
import { paths } from "#/tools/paths.ts";
import keywordByKanji from "./data/kanji-keyword-yarxi.json" with { type: "json" };

type KikuKanjiCompact = [
  string[],
  string[],
  string,
  string[],
  string,
  { reading: string; percentage: string }[],
  string,
  string,
  string[],
  string[],
];

type KikuDbKanjiCompact = Record<string, KikuKanjiCompact>;

const KANJI_DB_FILE = "kiku_db_kanji_compact.json.gz";
const TERM_DB_FILE = "kiku_db_terms_compact.json.gz";

function translateFrequency(value: string) {
  if (/^Топ-\d+(?:–\d+)?$/.test(value) || value === "Редкий" || value === "Неизвестно") {
    return value;
  }
  const top = /^Top (\d+)(?:-(\d+))?$/.exec(value);
  if (top) return top[2] ? `Топ-${top[1]}–${top[2]}` : `Топ-${top[1]}`;
  if (value === "Uncommon") return "Редкий";
  if (value === "Unknown") return "Неизвестно";
  throw new Error(`Неизвестная категория частотности: ${value}`);
}

function translateKind(value: string) {
  if (/^(?:Хёгай|Дзиммэйё|Дзёё|Неизвестно|Кёику \(\d+-й класс\))$/.test(value)) {
    return value;
  }
  const grade = /^Kyōiku \((\d+)(?:st|nd|rd|th) grade\)$/.exec(value);
  if (grade) return `Кёику (${grade[1]}-й класс)`;

  const translations: Record<string, string> = {
    Hyōgai: "Хёгай",
    Jinmeiyō: "Дзиммэйё",
    Jōyō: "Дзёё",
    Unknown: "Неизвестно",
  };
  const translated = translations[value];
  if (!translated) throw new Error(`Неизвестная категория кандзи: ${value}`);
  return translated;
}

function localizeKanjiDb(db: KikuDbKanjiCompact) {
  let localized = 0;

  for (const [kanji, entry] of Object.entries(db)) {
    const keyword = keywordByKanji[kanji as keyof typeof keywordByKanji]?.trim() ?? "";
    entry[2] = keyword;
    entry[3] = keyword ? [keyword] : [];
    entry[4] = keyword;
    entry[6] = translateFrequency(entry[6]);
    entry[7] = translateKind(entry[7]);
    if (keyword) localized += 1;
  }

  if (localized !== Object.keys(keywordByKanji).length) {
    throw new Error(
      `В базу попало ${localized} из ${Object.keys(keywordByKanji).length} значений YARXI`,
    );
  }

  const visibleStrings = Object.values(db).flatMap((entry) => [
    entry[2],
    ...entry[3],
    entry[4],
    entry[6],
    entry[7],
  ]);
  const english = visibleStrings.filter((value) => /[A-Za-z]{2,}/.test(value));
  if (english.length) {
    throw new Error(`В русской базе остались английские значения: ${english.slice(0, 10)}`);
  }

  return localized;
}

async function writeManifest(kanjiSize: number, termSize: number) {
  const headerSize = 512;
  const padded = (size: number) => Math.ceil(size / 512) * 512;
  const kanjiStart = headerSize;
  const termStart = headerSize + padded(kanjiSize) + headerSize;
  const manifest = {
    files: {
      [KANJI_DB_FILE]: {
        start: kanjiStart,
        end: kanjiStart + kanjiSize - 1,
        size: kanjiSize,
      },
      [TERM_DB_FILE]: {
        start: termStart,
        end: termStart + termSize - 1,
        size: termSize,
      },
    },
  };
  await writeFile(paths["@/.db/_kiku_db_main_manifest.json"], JSON.stringify(manifest, null, 2));
}

async function verifyRangeManifest() {
  const [archive, manifestText] = await Promise.all([
    readFile(paths["@/.db/_kiku_db_main.tar"]),
    readFile(paths["@/.db/_kiku_db_main_manifest.json"], "utf8"),
  ]);
  const manifest = JSON.parse(manifestText) as {
    files: Record<string, { start: number; end: number; size: number }>;
  };

  for (const file of [KANJI_DB_FILE, TERM_DB_FILE]) {
    const range = manifest.files[file];
    if (!range) throw new Error(`В манифесте отсутствует ${file}`);
    const payload = archive.subarray(range.start, range.end + 1);
    if (payload.length !== range.size) throw new Error(`Неверный диапазон байтов для ${file}`);
    JSON.parse(gunzipSync(payload).toString("utf8"));
  }
}

async function run() {
  const workDir = await mkdtemp(join(tmpdir(), "kiku-ru-db-"));
  const outputTar = `${paths["@/.db/_kiku_db_main.tar"]}.ru.tmp`;

  try {
    await tar.extract({ file: paths["@/.db/_kiku_db_main.tar"], cwd: workDir });
    const kanjiGzipPath = join(workDir, KANJI_DB_FILE);
    const termGzipPath = join(workDir, TERM_DB_FILE);
    const db = JSON.parse(
      gunzipSync(await readFile(kanjiGzipPath)).toString("utf8"),
    ) as KikuDbKanjiCompact;

    const localized = localizeKanjiDb(db);
    await writeFile(kanjiGzipPath, gzipSync(JSON.stringify(db), { level: 9 }));
    await tar.create(
      {
        cwd: workDir,
        portable: true,
        file: outputTar,
      },
      [KANJI_DB_FILE, TERM_DB_FILE],
    );

    await rename(outputTar, paths["@/.db/_kiku_db_main.tar"]);
    const [kanjiStats, termStats] = await Promise.all([stat(kanjiGzipPath), stat(termGzipPath)]);
    await writeManifest(kanjiStats.size, termStats.size);
    await verifyRangeManifest();

    console.log(
      `Русская база Kiku собрана: ${localized} значений YARXI, ${Object.keys(db).length} записей.`,
    );
  } finally {
    await rm(outputTar, { force: true });
    await rm(workDir, { recursive: true, force: true });
  }
}

await run();
