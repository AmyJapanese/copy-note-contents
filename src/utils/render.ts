import { App, MarkdownRenderer } from "obsidian";

/**
 * 隠しコンテナにMarkdownを描画して、HTMLとplain textを取得。
 * 呼び出し側で必ず cleanup() を呼ぶこと。
 */
export async function renderMarkdownToStrings(
  app: App,
  component: any,
  markdown: string,
  sourcePath: string
): Promise<{ html: string; text: string; cleanup: () => void }> {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";
  container.style.left = "-99999px";
  document.body.appendChild(container);

  await MarkdownRenderer.renderMarkdown(markdown, container, sourcePath, component);

  const html = container.innerHTML;
  const text = container.innerText;

  const cleanup = () => {
    if (container.parentElement) container.parentElement.removeChild(container);
  };

  return { html, text, cleanup };
}
