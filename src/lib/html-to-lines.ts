import * as cheerio from "cheerio";

/**
 * 전단 문자열에 섞인 `<span>…</span>` 등 HTML 태그를 제거합니다.
 * 태그 자리에 공백을 넣어 `</del><span>`처럼 붙은 마크업에서 숫자가 이어 붙지 않게 합니다.
 */
export function stripHtmlFragmentToPlainText(fragment: string): string {
  const s = fragment.trim();
  if (!s.includes("<")) {
    return s.replace(/\s+/g, " ").trim();
  }
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 전단 `<p>` HTML을 줄 단위 텍스트로 변환(줄바꿈·엔티티 디코딩).
 */
export function htmlParagraphToLines(html: string): string[] {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?p>/gi, "\n");

  const $ = cheerio.load(`<root>${withBreaks}</root>`);
  const text = $("root").text();
  return text
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/**
 * 섹션 제목만 있는 줄은 다음 '행사기간' 줄과 합칩니다.
 */
export function mergeLeafletContinuationLines(lines: string[]): string[] {
  const merged: string[] = [];
  let buffer = "";

  for (const line of lines) {
    if (line.includes("행사기간")) {
      merged.push(buffer ? `${buffer} ${line}` : line);
      buffer = "";
    } else {
      buffer = buffer ? `${buffer} ${line}` : line;
    }
  }

  return merged.filter((l) => l.includes("행사기간"));
}
