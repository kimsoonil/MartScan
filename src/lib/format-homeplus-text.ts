/**
 * 홈플러스 전단 대체텍스트(한 덩어리)를 카드용 제목·본문 줄로 나눕니다.
 */

import { fixEachThousandWonAfterMultiBuy } from "./fix-homeplus-discount-text";
import { normalizeKoreanRetailText } from "./hangul-won";

const ORDINAL_PREFIX = /^[가-힣]+번째 상품입니다\.\s*/;

/** 공백 정규화(원문 해시·분류용) */
export function normalizeHomeplusBlob(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function splitSentences(text: string): string[] {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return [];

  const parts = t.split(/\.\s+/).map((p) => p.trim()).filter((p) => p.length > 0);

  return parts.map((p) => (p.endsWith(".") ? p : `${p}.`));
}

function normalizeLead(s: string): string {
  return s.trim().replace(/\.$/, "").replace(/\s+/g, " ").trim();
}

/**
 * 첫 문장이 행사 헤더만 담은 경우(상품명 아님). 이어지는 문장에서 `…을/를 N원` 패턴으로 제목을 찾습니다.
 */
function isPromoOnlyLeadTitle(s: string): boolean {
  const t = normalizeLead(s);
  if (!t) return false;
  if (/^(신상품|행사상품)$/u.test(t)) return true;
  if (/^하나사면\s*하나\s*더/u.test(t)) return true;
  if (/^두개이상\s*구매\s*시|^두\s*개\s*이상\s*구매\s*시/u.test(t)) return true;
  if (
    /^(?:두|세|네|다섯|여섯|일곱|여덟|아홉|열)\s*개\s*이상\s*구매\s*시/u.test(t)
  ) {
    return true;
  }
  return false;
}

/** `하나사면 하나 더 비타파워를` → `비타파워` */
function stripLeadingPromoFromProductCandidate(cand: string): string {
  let t = cand.trim().replace(/\s+/g, " ");
  t = t.replace(/^하나사면\s*하나\s*더\s+/u, "");
  t = t.replace(/^두\s*개\s*이상\s*구매\s*시[^,，]*[,，]\s*/u, "");
  t = t.replace(/^두개이상\s*구매\s*시[^,，]*[,，]\s*/u, "");
  t = t.replace(/^(?:두|세|네|다섯)\s*개\s*이상\s*구매\s*시[^,，]*[,，]\s*/u, "");
  t = t.replace(/^(신상품|행사상품)\s+/u, "");
  return t.trim();
}

const BEFORE_WON_RE =
  /(.+?)(?:을|를)\s+(?:각\s+)?(?:\d{1,3}(?:,\d{3})*|\d+)\s*원/gu;

/** `…을 판매합니다`(가격 없이) — `N원에 판매` 앞은 BEFORE_WON_RE가 처리 */
const BEFORE_PANMAE_RE = /(.+?)(?:을|를)\s+판매합니다/gu;

function isJunkProductCandidate(cand: string): boolean {
  return /^(교차|취급|행사|점포|조기|상품별|멤버|한정)/u.test(cand);
}

/**
 * 텍스트 안에서 첫 번째 `상품명을/를 (각) N원` 패턴의 상품명(행사 접두 제거 후).
 */
function extractFirstProductNameBeforeWon(text: string): string | null {
  for (const m of text.matchAll(BEFORE_WON_RE)) {
    let cand = m[1].trim().replace(/\s+/g, " ");
    cand = stripLeadingPromoFromProductCandidate(cand);
    if (cand.length < 2 || cand.length > 100) continue;
    if (isPromoOnlyLeadTitle(cand)) continue;
    if (isJunkProductCandidate(cand)) continue;
    return cand;
  }
  return null;
}

function extractFirstProductNameBeforePanmae(text: string): string | null {
  for (const m of text.matchAll(BEFORE_PANMAE_RE)) {
    let cand = m[1].trim().replace(/\s+/g, " ");
    cand = stripLeadingPromoFromProductCandidate(cand);
    if (cand.length < 2 || cand.length > 100) continue;
    if (isPromoOnlyLeadTitle(cand)) continue;
    if (isJunkProductCandidate(cand)) continue;
    return cand;
  }
  return null;
}

function extractProductTitleAfterPromoLead(text: string): string | null {
  return (
    extractFirstProductNameBeforeWon(text) ??
    extractFirstProductNameBeforePanmae(text)
  );
}

function clampTitle(s: string): string {
  const t = s.trim();
  if (t.length <= 96) return t;
  return `${t.slice(0, 93).trim()}…`;
}

/**
 * 첫 문장에서 상품명 후보: '…을/를 [가격·행사]…' 앞까지, 없으면 길이 제한.
 */
function titleFromFirstSentence(sentence: string): string {
  const s = sentence.trim().replace(/\.$/, "");
  const m = s.match(/^(.{6,95}?)(?:을|를)(?=\s)/);
  if (m && m[1].trim().length >= 4) {
    return m[1].trim();
  }
  if (s.length <= 96) return s;
  return `${s.slice(0, 93).trim()}…`;
}

export type FormattedHomeplusText = {
  /** 카드 제목 */
  title: string;
  /** 가격·원산지·유의사항 등 나머지 문장 */
  detailLines: string[];
  /** id·해시용 정규화 전문 */
  normalizedFull: string;
};

export function formatHomeplusProductBlock(rawChunk: string): FormattedHomeplusText {
  const normalizedFull = fixEachThousandWonAfterMultiBuy(
    normalizeKoreanRetailText(normalizeHomeplusBlob(rawChunk)),
  );
  const body = normalizedFull.replace(ORDINAL_PREFIX, "").trim();
  const sentences = splitSentences(body);

  if (sentences.length === 0) {
    return {
      title: normalizedFull.slice(0, 80) || "상품",
      detailLines: [],
      normalizedFull,
    };
  }

  const leadSentence = sentences[0];
  let title = titleFromFirstSentence(leadSentence);
  const leadNorm = normalizeLead(leadSentence);

  if (isPromoOnlyLeadTitle(leadNorm) || isPromoOnlyLeadTitle(title)) {
    let productTitle: string | null = null;
    for (let i = 1; i < sentences.length; i++) {
      productTitle = extractProductTitleAfterPromoLead(sentences[i]);
      if (productTitle) break;
    }
    if (!productTitle) {
      productTitle = extractProductTitleAfterPromoLead(body);
    }
    if (productTitle) {
      title = clampTitle(productTitle);
    }
  }

  const detailLines = sentences.slice(1).map((line) => line.trim());

  return {
    title: clampTitle(title),
    detailLines,
    normalizedFull,
  };
}
