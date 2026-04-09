"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * URL 쿼리 `item`(상품 id)이 있으면 해당 카드로 스크롤합니다. 공유 맥락용.
 */
export function ScrollToProductOnQuery() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("item")?.trim();
    if (!id) return;
    const el = document.getElementById(`product-${id}`);
    if (!el) return;
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const prev = el.style.boxShadow;
      el.style.transition = "box-shadow 0.35s ease";
      el.style.boxShadow = "0 0 0 3px rgb(16 185 129)";
      window.setTimeout(() => {
        el.style.boxShadow = prev;
        el.style.transition = "";
      }, 2400);
    }, 100);
    return () => window.clearTimeout(t);
  }, [searchParams]);

  return null;
}
