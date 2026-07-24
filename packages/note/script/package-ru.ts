import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import { DatabaseSync } from "node:sqlite";
import extractZip from "extract-zip";
import { defaultConfig } from "#/src/lib/default-config";
import { noteIdentity } from "#/src/lib/note-identity";
import { paths } from "#/tools/paths.ts";
import { getVersion } from "#/tools/util.ts";
import { applyDefaultDataAttributes, applyDefaultStyleVariables } from "./model-template.ts";

const execFileAsync = promisify(execFile);
const fontsDirectory = join(paths["@/"], ".fonts");

const downloadableMedia = {
  "_kiku_noto_sans_jp.ttf": {
    url: "https://raw.githubusercontent.com/google/fonts/295d98a7a0c17c68f1341eaeea354e7960ea70d3/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf",
    sha256: "c2f3b4d463500a2ddcd3849cded1fceeb9fd6d1c32e6cbecd568453ba50fc68f",
  },
  "_kiku_noto_serif_jp.ttf": {
    url: "https://raw.githubusercontent.com/google/fonts/8a7c74854f766ae441c7584925cc0ec626fc5aa6/ofl/notoserifjp/NotoSerifJP%5Bwght%5D.ttf",
    sha256: "2fd527ba12b6a44ec30d796d633360da0aeba6c5d4af1304ce12bb4dc15a7dfc",
  },
  "_kiku_noto_sans_jp_OFL.txt": {
    url: "https://raw.githubusercontent.com/google/fonts/295d98a7a0c17c68f1341eaeea354e7960ea70d3/ofl/notosansjp/OFL.txt",
    sha256: "1c05c68c34f9708415aada51f17e1b0092d2cea709bf4a94cd38114f9e73d7d9",
  },
  "_kiku_noto_serif_jp_OFL.txt": {
    url: "https://raw.githubusercontent.com/google/fonts/8a7c74854f766ae441c7584925cc0ec626fc5aa6/ofl/notoserifjp/OFL.txt",
    sha256: "5e0da210fb04058a8c0087985d2d456b931c2579811a49655721d3cf0c36b6d6",
  },
} as const;

type Model = {
  name: string;
  css: string;
  tmpls: { name: string; qfmt: string; afmt: string }[];
  flds: { name: string; ord: number }[];
};

type Deck = {
  name: string;
};

const mediaSources: Record<string, string> = {
  "_kiku_config.json": paths["@/.anki-build/_kiku_config.json"],
  "_kiku.js": paths["@/dist/_kiku.js"],
  "_kiku_lazy.js": paths["@/dist/_kiku_lazy.js"],
  "_kiku_libs.js": paths["@/dist/_kiku_libs.js"],
  "_kiku_shared.js": paths["@/dist/_kiku_shared.js"],
  "_kiku_worker.js": paths["@/dist/_kiku_worker.js"],
  "_kiku.css": paths["@/dist/_kiku.css"],
  "_kiku_front.html": paths["@/.anki-build/_kiku_front.html"],
  "_kiku_back.html": paths["@/.anki-build/_kiku_back.html"],
  "_kiku_style.css": paths["@/.anki-build/_kiku_style.css"],
  "_kiku_plugin.js": paths["@/.anki-build/_kiku_plugin.js"],
  "_kiku_plugin.css": paths["@/.anki-build/_kiku_plugin.css"],
  "_kiku_db_main.tar": paths["@/.db/_kiku_db_main.tar"],
  "_kiku_db_main_manifest.json": paths["@/.db/_kiku_db_main_manifest.json"],
  ...Object.fromEntries(
    Object.keys(downloadableMedia).map((name) => [name, join(fontsDirectory, name)]),
  ),
};

function sha256(data: Uint8Array) {
  return createHash("sha256").update(data).digest("hex");
}

async function ensureDownloadableMedia() {
  await mkdir(fontsDirectory, { recursive: true });

  for (const [name, source] of Object.entries(downloadableMedia)) {
    const destination = join(fontsDirectory, name);
    const cached = await readFile(destination).catch(() => null);
    if (cached && sha256(cached) === source.sha256) continue;

    const response = await fetch(source.url);
    if (!response.ok) {
      throw new Error(`Не удалось загрузить ${name}: HTTP ${response.status}`);
    }
    const data = new Uint8Array(await response.arrayBuffer());
    const actualHash = sha256(data);
    if (actualHash !== source.sha256) {
      throw new Error(`Контрольная сумма ${name} не совпадает: ${actualHash}`);
    }
    await writeFile(destination, data);
  }
}

async function prepareGeneratedMedia() {
  await writeFile(
    paths["@/.anki-build/_kiku_config.json"],
    `${JSON.stringify(defaultConfig, null, 2)}\n`,
  );
}

function setField(values: string[], fieldIndex: Map<string, number>, field: string, value: string) {
  const index = fieldIndex.get(field);
  if (index === undefined) throw new Error(`В типе заметки отсутствует поле ${field}`);
  values[index] = value;
}

function localizeSampleNotes(database: DatabaseSync, modelId: string, model: Model) {
  const fieldIndex = new Map(model.flds.map((field) => [field.name, field.ord]));
  const rows = database
    .prepare("SELECT id, flds FROM notes WHERE mid = ?")
    .all(Number(modelId)) as { id: number; flds: string }[];
  const update = database.prepare("UPDATE notes SET flds = ?, tags = ?, mod = ? WHERE id = ?");
  const now = Math.floor(Date.now() / 1000);

  for (const row of rows) {
    const fields = row.flds.split("\x1f");
    const expression = fields[fieldIndex.get("Expression") ?? -1];
    const translations: Record<string, { definition: string; sentence: string }> = {
      恐れる: {
        definition: "бояться; страшиться; опасаться",
        sentence: "Это значит — не бояться смерти.",
      },
      貢献: {
        definition: "вклад; содействие; служение общему делу",
        sentence:
          '<span data-group-id="11">Интересно, смогу ли я так хоть немного помочь миру.</span>' +
          '<span data-group-id="10">В любом случае, если мы поможем поймать героя…</span>' +
          "Чтобы помочь этому магазину…",
      },
    };
    const translation = translations[expression ?? ""];
    if (!translation) throw new Error(`Нет русского текста для демонстрационной заметки ${row.id}`);

    setField(
      fields,
      fieldIndex,
      "MainDefinition",
      `<ol><li data-dictionary="Яркси">${translation.definition}</li></ol>`,
    );
    setField(fields, fieldIndex, "SelectionText", "");
    setField(fields, fieldIndex, "Glossary", "");
    setField(fields, fieldIndex, "SentenceTranslation", translation.sentence);
    setField(fields, fieldIndex, "Frequency", "");
    setField(fields, fieldIndex, "MiscInfo", "");
    setField(fields, fieldIndex, "Hint", "");

    update.run(fields.join("\x1f"), " демо ", now, row.id);
  }
}

async function updateCollection(collectionPath: string) {
  const [front, back, style] = await Promise.all([
    readFile(paths["@/.anki-build/_kiku_front.html"], "utf8"),
    readFile(paths["@/.anki-build/_kiku_back.html"], "utf8"),
    readFile(paths["@/.anki-build/_kiku_style.css"], "utf8"),
  ]);
  const database = new DatabaseSync(collectionPath);

  try {
    const row = database.prepare("SELECT models, decks FROM col LIMIT 1").get() as {
      models: string;
      decks: string;
    };
    const models = JSON.parse(row.models) as Record<string, Model>;
    const decks = JSON.parse(row.decks) as Record<string, Deck>;
    const modelEntry = Object.entries(models).find(([, model]) => model.name === "Kiku");
    const deckEntry = Object.entries(decks).find(([, deck]) => deck.name === "Kiku");
    if (!modelEntry || !deckEntry) throw new Error("В исходном пакете не найден Kiku");

    const [modelId, model] = modelEntry;
    model.name = noteIdentity.noteType;
    model.css = applyDefaultStyleVariables(style);
    const template = model.tmpls[0];
    if (!template) throw new Error("В исходном типе заметки отсутствует шаблон карточки");
    template.name = noteIdentity.cardType;
    template.qfmt = applyDefaultDataAttributes(front);
    template.afmt = applyDefaultDataAttributes(back);
    deckEntry[1].name = noteIdentity.deck;

    localizeSampleNotes(database, modelId, model);
    database
      .prepare("UPDATE col SET models = ?, decks = ?, mod = ?, scm = ?")
      .run(JSON.stringify(models), JSON.stringify(decks), Date.now(), Date.now());
    const integrity = database.prepare("PRAGMA integrity_check").get() as {
      integrity_check: string;
    };
    if (integrity.integrity_check !== "ok") {
      throw new Error(`SQLite сообщает об ошибке: ${integrity.integrity_check}`);
    }
  } finally {
    database.close();
  }
}

async function replaceMediaFiles(directory: string) {
  const media = JSON.parse(await readFile(join(directory, "media"), "utf8")) as Record<
    string,
    string
  >;
  const mediaIdByName = new Map(Object.entries(media).map(([id, name]) => [name, id]));
  let nextMediaId = Math.max(-1, ...Object.keys(media).map(Number)) + 1;

  for (const [name, source] of Object.entries(mediaSources)) {
    let mediaId = mediaIdByName.get(name);
    if (mediaId === undefined) {
      mediaId = String(nextMediaId++);
      media[mediaId] = name;
      mediaIdByName.set(name, mediaId);
    }
    await copyFile(source, join(directory, mediaId));
  }

  await writeFile(join(directory, "media"), JSON.stringify(media));
}

async function downloadBasePackage(destination: string, version: string) {
  const localPackage = process.env.KIKU_BASE_APKG;
  if (localPackage) {
    await copyFile(localPackage, destination);
    return;
  }

  const url = `https://github.com/youyoumu/kiku/releases/download/v${version}/Kiku_v${version}.apkg`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Не удалось загрузить исходный пакет: HTTP ${response.status}`);
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

async function run() {
  const version = await getVersion();
  const workDir = await mkdtemp(join(tmpdir(), "kiku-ru-apkg-"));
  const sourcePackage = join(workDir, "Kiku.apkg");
  const unpacked = join(workDir, "unpacked");
  const output = join(paths["@/.release/"], `Kiku_RU_v${version}.apkg`);

  try {
    await mkdir(unpacked, { recursive: true });
    await mkdir(paths["@/.release/"], { recursive: true });
    await ensureDownloadableMedia();
    await prepareGeneratedMedia();
    await downloadBasePackage(sourcePackage, version);
    await extractZip(sourcePackage, { dir: unpacked });
    await replaceMediaFiles(unpacked);
    await updateCollection(join(unpacked, "collection.anki21"));
    await rm(output, { force: true });
    await execFileAsync("zip", ["-q", "-X", "-r", output, "."], { cwd: unpacked });
    await execFileAsync("unzip", ["-t", output]);
    console.log(`Готов пакет ${basename(output)}: ${output}`);
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

await run();
