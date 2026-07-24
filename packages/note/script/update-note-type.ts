import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { paths } from "#/tools/paths.ts";
import { AnkiConnect, log } from "#/tools/util.js";
import { noteIdentity } from "#/src/lib/note-identity";
import { applyDefaultDataAttributes, applyDefaultStyleVariables } from "./model-template.ts";

class Script {
  NOTE_TYPE = noteIdentity.noteType;
  CARD_TYPE = noteIdentity.cardType;
  FRONT_PATH = paths["@/.anki-build/_kiku_front.html"];
  BACK_PATH = paths["@/.anki-build/_kiku_back.html"];
  STYLE_PATH = paths["@/.anki-build/_kiku_style.css"];

  async readTemplates() {
    const [front, back, style] = await Promise.all([
      readFile(this.FRONT_PATH, "utf8"),
      readFile(this.BACK_PATH, "utf8"),
      readFile(this.STYLE_PATH, "utf8"),
    ]);

    return { front, back, style };
  }

  async updateTemplates(frontSrc: string, backSrc: string) {
    const result = await AnkiConnect.call("updateModelTemplates", {
      model: {
        name: this.NOTE_TYPE,
        templates: {
          [this.CARD_TYPE]: {
            Front: frontSrc,
            Back: backSrc,
          },
        },
      },
    });

    log.gray(`updateModelTemplates: ${JSON.stringify(result)}`);
    console.log(
      `✅ Updated "${this.NOTE_TYPE}" Front/Back from ${basename(this.FRONT_PATH)} and ${basename(this.BACK_PATH)}`,
    );
  }

  async updateStyling(styleSrc: string) {
    const result = await AnkiConnect.call("updateModelStyling", {
      model: {
        name: this.NOTE_TYPE,
        css: styleSrc,
      },
    });

    log.gray(`updateModelStyling: ${JSON.stringify(result)}`);
    console.log(`✅ Updated "${this.NOTE_TYPE}" style from ${basename(this.STYLE_PATH)}`);
  }

  async run() {
    const { front, back, style } = await this.readTemplates();
    const frontTemplate = applyDefaultDataAttributes(front);
    const backTemplate = applyDefaultDataAttributes(back);
    const styleTemplate = applyDefaultStyleVariables(style);
    await this.updateTemplates(frontTemplate, backTemplate);
    await this.updateStyling(styleTemplate);
  }
}

const script = new Script();
script.run().catch((err) => {
  console.error("❌ Failed to update note type:", err);
  process.exit(1);
});
