const DIGIT: Record<string, number> = {
  영: 0,
  공: 0,
  일: 1,
  이: 2,
  삼: 3,
  사: 4,
  오: 5,
  육: 6,
  칠: 7,
  팔: 8,
  구: 9,
};

const UNIT: Record<string, number> = {
  십: 10,
  백: 100,
  천: 1000,
};

/**
 * 순수 한글 숫자 문자열만 파싱 (예: 이천칠백육십 → 2760). 접미사 `원`은 호출 전에 제거합니다.
 */
export function parseKoreanAmount(korean: string): number {
  const s = korean.trim();
  if (!s) return 0;

  let result = 0;
  let temp = 0;
  let num = 0;

  for (const char of s) {
    if (DIGIT[char] !== undefined) {
      num = DIGIT[char];
    } else if (UNIT[char]) {
      temp += (num === 0 ? 1 : num) * UNIT[char];
      num = 0;
    } else if (char === "만") {
      result += (temp + num) * 10000;
      temp = 0;
      num = 0;
    } else if (char === "억") {
      result = (result + temp + num) * 100000000;
      temp = 0;
      num = 0;
    } else {
      return 0;
    }
  }

  return result + temp + num;
}

const HANGUL_NUM_CLASS = /[일이삼사오육칠팔구영공십백천만억]/;

/**
 * `…이천칠백육십원` 형태를 `…2,760원`으로 치환합니다. (이마트식 아라비아 금액은 그대로 둡니다.)
 */
export function replaceHangulWonInText(text: string): string {
  return text.replace(
    /([일이삼사오육칠팔구영공십백천만억]+)원/g,
    (full, numPart: string) => {
      if (!numPart.split("").every((c) => HANGUL_NUM_CLASS.test(c))) {
        return full;
      }
      const n = parseKoreanAmount(numPart);
      if (n <= 0 || n > 999_999_999) return full;
      return `${n.toLocaleString("ko-KR")}원`;
    },
  );
}

/**
 * `오십퍼센트`·`오십퍼` 등을 `50%`로 치환합니다. 뒤에 이어지는 한글 글자가 있으면 제외(오인 방지).
 */
export function replaceHangulPercentInText(text: string): string {
  return text.replace(
    /([일이삼사오육칠팔구영공십백천]+)(?:퍼센트|퍼)(?![가-힣])/g,
    (full, numPart: string) => {
      if (!numPart.split("").every((c) => HANGUL_NUM_CLASS.test(c))) {
        return full;
      }
      const n = parseKoreanAmount(numPart);
      if (n < 0 || n > 1000) return full;
      if (n === 0 && numPart !== "영" && numPart !== "공") return full;
      return `${n}%`;
    },
  );
}

/** 용량·중량 등(만/억 제외 — 입·캔 등 소단위만) */
const MEAS_NUM_CLASS = /[일이삼사오육칠팔구영공십백천]/;

function replaceMeasureToken(
  text: string,
  suffix: string,
  format: (n: number) => string,
  max: number,
): string {
  const re = new RegExp(`([일이삼사오육칠팔구영공십백천]+)${suffix}`, "g");
  return text.replace(re, (full, numPart: string) => {
    if (!numPart.split("").every((c) => MEAS_NUM_CLASS.test(c))) {
      return full;
    }
    const n = parseKoreanAmount(numPart);
    if (n <= 0 || n > max) return full;
    return format(n);
  });
}

/**
 * `이백밀리리터 삼입` → `200m 3입`, `사백그램` → `400g`, `십칠리터` → `17L` 등.
 * `밀리리터`를 `리터`보다 먼저 처리합니다. `구입` 같은 단어는 앞에 공백이 없으면 치환하지 않습니다.
 */
export function replaceHangulMeasureInText(text: string): string {
  let s = text;
  s = replaceMeasureToken(s, "밀리리터", (n) => `${n}m`, 999_999);
  s = replaceMeasureToken(s, "킬로그램", (n) => `${n}kg`, 999_999);
  s = replaceMeasureToken(s, "그램", (n) => `${n}g`, 999_999);
  s = replaceMeasureToken(s, "리터", (n) => `${n}L`, 999_999);
  s = replaceMeasureToken(s, "캔", (n) => `${n}캔`, 9999);

  s = s.replace(/(^|[\s])([일이삼사오육칠팔구영공십백천]+)입/g, (full, pre: string, numPart: string) => {
    if (!numPart.split("").every((c: string) => MEAS_NUM_CLASS.test(c))) {
      return full;
    }
    const n = parseKoreanAmount(numPart);
    if (n <= 0 || n > 9999) return full;
    return `${pre}${n}입`;
  });

  return s;
}

/**
 * `사종`·`구종`·`십사종` 등 품목 수 → `4종`·`9종`·`14종`.
 * 접두가 한글 숫자(일~천)만인 경우에만 치환해 `품종` 등은 건드리지 않습니다.
 */
export function replaceHangulKindCountInText(text: string): string {
  return replaceMeasureToken(text, "종", (n) => `${n}종`, 9999);
}

/** 홈플러스 등 소매 안내: 한글 금액·퍼센트·용량/중량/입수·종 수를 아라비아 표기로 통일 */
export function normalizeKoreanRetailText(text: string): string {
  let s = replaceHangulWonInText(text);
  s = replaceHangulPercentInText(s);
  s = replaceHangulMeasureInText(s);
  s = replaceHangulKindCountInText(s);
  return s;
}
