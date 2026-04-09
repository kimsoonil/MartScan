import type { ProductCategory } from "@/types/leaflet";

type Rule = { category: ProductCategory; keywords: string[] };

/** 길이 짧은 키워드는 다른 규칙 이후에 두어 오탐을 줄입니다. */
const RULES: Rule[] = [
  {
    category: "other",
    keywords: [
      "Mac ",
      "맥북",
      "갤럭시북",
      "SSD",
      "이어폰",
      "안마의자",
      "밥솥",
      "선풍기",
      "프라이팬",
      "멀티탭",
      "샴푸",
      "치약",
      "생리대",
      "플레이모빌",
      "다리미",
    ],
  },
  {
    category: "meat_fish",
    keywords: [
      "삼겹",
      "돼지",
      "소고기",
      "와규",
      "불고기",
      "등심",
      "안창",
      "갈비",
      "닭",
      "치킨",
      "닭강정",
      "참치",
      "오징어",
      "새우",
      "꽃게",
      "쭈꾸미",
      "낙지",
      "꼼장어",
      "골뱅이",
      "버거",
      "만두",
      "해동",
      "육",
      "고기",
    ],
  },
  {
    category: "produce",
    keywords: [
      "딸기",
      "바나나",
      "사과",
      "오렌지",
      "포도",
      "만다린",
      "귤",
      "수박",
      "참외",
      "블루베리",
      "단호박",
      "호두",
      "나물",
      "채소",
      "샐러드",
    ],
  },
  {
    category: "dairy",
    keywords: ["치즈", "우유", "요거", "요거트", "버터", "크림"],
  },
  {
    category: "quick_meal",
    keywords: [
      "볶음밥",
      "부대찌개",
      "볶음",
      "라면",
      "컵라면",
      "용기",
      "피자",
      "냉동",
    ],
  },
  {
    category: "staple",
    keywords: ["간장", "참기름", "식용유", "쌀", "계란", "달걀"],
  },
  {
    category: "beverage_snack",
    keywords: [
      "펩시",
      "콜라",
      "제로",
      "커피",
      "모카",
      "초콜릿",
      "과자",
      "주스",
    ],
  },
];

export function categorizeProductName(name: string): ProductCategory {
  const n = name.toLowerCase();
  for (const { category, keywords } of RULES) {
    for (const kw of keywords) {
      if (n.includes(kw.toLowerCase())) return category;
    }
  }
  return "other";
}
