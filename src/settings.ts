import { App, PluginSettingTab, Setting } from "obsidian";
import type CopyNoteContentsPlugin from "./main";

export interface CopyNoteSettings {
  copyMode: "raw" | "reading" | "auto";
  livePreviewCopyMode: "raw" | "reading";
  readingCopyOutput: "text" | "html"; // RTF削除
}

export const DEFAULT_SETTINGS: CopyNoteSettings = {
  copyMode: "auto",
  livePreviewCopyMode: "reading",
  readingCopyOutput: "text",
};

export class CopySettingsTab extends PluginSettingTab {
  plugin: CopyNoteContentsPlugin;

  constructor(app: App, plugin: CopyNoteContentsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Copy Note Contents Settings" });

    new Setting(containerEl)
      .setName("Default Copy Mode")
      .setDesc("raw = include Markdown syntax; reading = plain text/HTML; auto = mode-dependent")
      .addDropdown((drop) =>
        drop
          .addOption("raw", "raw")
          .addOption("reading", "reading")
          .addOption("auto", "auto")
          .setValue(this.plugin.settings.copyMode)
          .onChange(async (value: "raw" | "reading" | "auto") => {
            this.plugin.settings.copyMode = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Reading Copy Output")
      .setDesc("Choose whether reading mode copies plain text or HTML.")
      .addDropdown((drop) =>
        drop
          .addOption("text", "plain text")
          .addOption("html", "HTML")
          .setValue(this.plugin.settings.readingCopyOutput)
          .onChange(async (value: "text" | "html") => {
            this.plugin.settings.readingCopyOutput = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
