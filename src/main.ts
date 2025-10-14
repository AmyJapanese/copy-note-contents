import { App, Plugin, Notice } from "obsidian";
import { CopySettingsTab, DEFAULT_SETTINGS, type CopyNoteSettings } from "./settings";
import { copyCurrentNote } from "./features/copyNote";

export default class CopyNoteContentsPlugin extends Plugin {
  settings: CopyNoteSettings;

  async onload() {
    console.log("[CopyNote] plugin loaded");
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

    this.addRibbonIcon("copy", "Copy Note Contents", async () => {
      console.log("[CopyNote] ribbon clicked");
      try {
        await copyCurrentNote(this.app, this, this.settings);
      } catch (e) {
        console.error("[CopyNote] copy failed:", e);
        new Notice("Failed to copy note content.");
      }
    });

  this.addCommand({ //ホットキー
    id: "copy-current-note",
    name: "Copy current note contents",
    hotkeys: [{ modifiers: ["Mod"], key: "Shift+C" }],
    editorCallback: (editor, view) => {
      const content = editor.getValue();
      navigator.clipboard.writeText(content);
      new Notice("Note copied!");
    },
  });

    this.addSettingTab(new CopySettingsTab(this.app, this));
  }

  onunload() {
    console.log("[CopyNote] plugin unloaded");
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
