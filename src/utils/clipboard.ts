/**
 * クリップボード系は Electron のバージョン差で失敗することがあるので、
 * できるだけフォールバックを用意しておく。
 */

export async function writePlainText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    // 最後の砦（選択→execCommand）はここではやらない。Obsidian/ElectronではだいたいwriteTextが通る。
    throw e;
  }
}

export async function writeHtmlAndText(html: string, text: string) {
  // ClipboardItem が使える環境では HTML+text の同時書き込み
  try {
    // @ts-ignore: 型定義がない場合がある
    const item = new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([text], { type: "text/plain" }),
    });
    await navigator.clipboard.write([item]);
    return;
  } catch (_e) {
    // 失敗したら plain text にフォールバック
    await writePlainText(text);
  }
}
