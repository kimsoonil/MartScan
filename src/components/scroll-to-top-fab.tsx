"use client";

import { useCallback, useEffect, useState } from "react";

export function ScrollToTopFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={goTop}
      className="fixed bottom-5 right-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-emerald-800 text-lg font-bold text-white shadow-lg ring-2 ring-white/30 transition hover:bg-emerald-900 hover:shadow-xl dark:bg-emerald-700 dark:hover:bg-emerald-600 md:bottom-6 md:right-6"
      aria-label="맨 위로"
    >
      ↑
    </button>
  );
}
