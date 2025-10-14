import { App, MarkdownView, Notice } from "obsidian";
import type { CopyNoteSettings } from "../settings";
import { renderMarkdownToStrings } from "../utils/render";
import { writeHtmlAndText, writePlainText } from "../utils/clipboard";

export async function copyCurrentNote(app: App, component: any, settings: CopyNoteSettings) {
  console.log("[CopyNote] copyCurrentNote()", "mode=", settings.copyMode);
  const activeFile = app.workspace.getActiveFile();
  if (!activeFile) {
    new Notice("No active file to copy.");
    return;
  }

  // ── モード判定 ──
  let mode: "raw" | "reading";
  if (settings.copyMode === "auto") {
    const view = app.workspace.getActiveViewOfType(MarkdownView);
    mode = view && view.getMode() === "preview" ? "reading" : "raw";
  } else {
    mode = settings.copyMode;
  }

  const content = await app.vault.read(activeFile);

  if (mode === "raw") {
    await writePlainText(content);
    new Notice("Note content copied!");
    return;
  }

  // reading: Markdown → HTML/text
  const { html, text, cleanup } = await renderMarkdownToStrings(app, component, content, activeFile.path);
  try {
    if (settings.readingCopyOutput === "html") {
      await writeHtmlAndText(html, text);
    } else {
      await writePlainText(text);
    }
    new Notice("Note content copied!");
  } finally {
    cleanup();
  }
}
