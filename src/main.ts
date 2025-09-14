import {
  App,
  Plugin,
  MarkdownRenderer,
  MarkdownView,
  PluginSettingTab,
  Setting,
  Notice,
} from "obsidian";


interface CopyNoteSettings {
  copyMode: "raw" | "reading" | "auto";
  livePreviewCopyMode: "raw" | "reading";
  readingCopyOutput: "text" | "html" | "rtf";
}

const DEFAULT_SETTINGS: CopyNoteSettings = {
  copyMode: "auto",
  livePreviewCopyMode: "reading",
  readingCopyOutput: "text",
};

export default class CopyNoteContentsPlugin extends Plugin {
  settings: CopyNoteSettings;

  async onload() {
    console.log("[CopyNote] plugin loaded");
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

    this.addRibbonIcon("copy", "Copy Note Contents", () => {
      console.log("[CopyNote] ribbon clicked");
      this.copyCurrentNote();
    });

    this.addSettingTab(new CopySettingsTab(this.app, this));
  }

  onunload() {
    console.log("[CopyNote] plugin unloaded");
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async copyCurrentNote() {
    console.log("[CopyNote] copyCurrentNote()", "mode=", this.settings.copyMode);
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice("No active file to copy.");
      return;
    }

    // ── モード判定 ──
    let mode = this.settings.copyMode;
    if (mode === "auto") {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (view && view.getMode() === "preview") {
        mode = "reading";
      } else {
        mode = "raw";
      }
    }

    const content = await this.app.vault.read(activeFile);

    try {
      if (mode === "raw") {
        // Markdownそのままコピー
        await navigator.clipboard.writeText(content);
      } else {
        // Readingモード: MarkdownをHTMLに変換
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.opacity = "0";
        document.body.appendChild(container);

        await MarkdownRenderer.renderMarkdown(
          content,
          container,
          activeFile.path,
          this
        );

        const html = container.innerHTML;
        const text = container.innerText;


          if (this.settings.readingCopyOutput === "html") {
            const htmlBlob = new Blob([html], { type: "text/html" });
            const textBlob = new Blob([text], { type: "text/plain" });

            await navigator.clipboard.write([
              new ClipboardItem({
                "text/html": htmlBlob,
                "text/plain": textBlob,
          }),
        ]);
        //今後rtf復活したときのためにコメントアウト
        //} else if (this.settings.readingCopyOutput === "rtf") {
        //const rtf = htmlToRtf.convertHtmlToRtf(html);
        // Electron clipboard を window.require で呼ぶ
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        //const { clipboard } = (window as any).require("electron");
        //clipboard.write({ rtf });
        } else {
          // plain text
          await navigator.clipboard.writeText(text);
        }

        document.body.removeChild(container);
      }
      new Notice("Note content copied!");
    } catch (err) {
      console.error("[CopyNote] copy failed:", err);
      new Notice("Failed to copy note content.");
    }
  }
}

class CopySettingsTab extends PluginSettingTab {
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
      .setDesc(
        "raw = include Markdown syntax; reading = plain text/HTML/RTF; auto = mode-dependent"
      )
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
      .setDesc("Choose whether reading mode copies plain text, HTML, or RTF(WIP).")
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
