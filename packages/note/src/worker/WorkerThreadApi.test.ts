import { describe, expect, it, vi } from "vitest";
import { constants } from "#/src/lib/contants";
import { defaultConfig } from "#/src/lib/default-config";
import { emptyNotesManifest } from "#/src/lib/notes-manifest";
import type { MainThreadApi } from "./MainThreadApi";
import type { NexRemote } from "./nex";
import { WorkerThreadApi } from "./WorkerThreadApi";

function createApi(fetchJson: (url: string) => Promise<unknown>) {
  const api = new WorkerThreadApi();
  api.main = {
    fetchJson: vi.fn(fetchJson),
    fetchArrayBuffer: vi.fn(),
    log: vi.fn(),
  } as unknown as NexRemote<MainThreadApi>;
  api.init({
    assetsPath: "http://127.0.0.1:40001",
    constants,
    config: defaultConfig,
    preferAnkiConnect: false,
    allowAnkiConnect: false,
  });
  return api;
}

describe("WorkerThreadApi Android fallback", () => {
  it("uses the packaged empty notes manifest without contacting AnkiConnect", async () => {
    const fetchJson = vi.fn(async () => emptyNotesManifest);
    const api = createApi(fetchJson);

    const result = await api.query({
      kanjiList: ["日"],
      readingList: ["にち"],
      expressionList: ["日本"],
    });

    expect(result).toMatchObject({
      kanjiListResult: {},
      readingListResult: {},
      expressionListResult: {},
      newNotes: [],
      isNotesCache: true,
    });
    expect(fetchJson).toHaveBeenCalledOnce();
    expect(fetchJson).toHaveBeenCalledWith("http://127.0.0.1:40001/_kiku_notes_manifest.json", {
      cache: "no-store",
    });
  });

  it("does not request the AnkiConnect root when the notes cache is unavailable", async () => {
    const fetchJson = vi.fn(async () => {
      throw new Error("missing media");
    });
    const api = createApi(fetchJson);

    const result = await api.query({
      kanjiList: ["日"],
      readingList: [],
      expressionList: [],
    });

    expect(result.isNotesCache).toBe(true);
    expect(result.kanjiListResult).toEqual({});
    expect(fetchJson).toHaveBeenCalledOnce();
    expect(fetchJson).not.toHaveBeenCalledWith(defaultConfig.ankiConnectAddress, expect.anything());
  });
});
