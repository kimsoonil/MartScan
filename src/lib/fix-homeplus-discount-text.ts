/**
 * 음성/대체텍스트에서 `일만천원` 등이 `11,000원`으로 바뀌며
 * 실제 전단의「각 천원 할인」과 어긋나는 경우를 보정합니다.
 */
export function fixEachThousandWonAfterMultiBuy(text: string): string {
  let s = text;
  const multiBuy =
    "(?:두\\s*개\\s*이상\\s*구매\\s*시|두개이상\\s*구매\\s*시|이\\s*개\\s*이상\\s*구매\\s*시|이개이상\\s*구매\\s*시|\\d+\\s*개\\s*이상\\s*구매\\s*시)";

  s = s.replace(
    new RegExp(`(${multiBuy})\\s*(각\\s*)11,000원(\\s*할인)`, "gu"),
    (_m, multi: string, each: string, tail: string) => {
      return `${multi.trimEnd()} ${each.trimEnd()} 1,000원${tail}`;
    },
  );

  s = s.replace(
    new RegExp(`(${multiBuy})\\s*(각\\s*)일만천원(\\s*할인)`, "gu"),
    (_m, multi: string, each: string, tail: string) => {
      return `${multi.trimEnd()} ${each.trimEnd()} 1,000원${tail}`;
    },
  );

  return s;
}
