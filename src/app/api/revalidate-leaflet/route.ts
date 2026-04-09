import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { LEAFLET_FETCH_CACHE_TAG } from "@/lib/constants";

/**
 * 전단 `fetch` 캐시를 비우고 루트를 다시 그립니다.
 * 운영에서 무분별 호출을 막으려면 `REVALIDATE_SECRET`을 두고
 * `x-revalidate-secret` 헤더로 검증한 뒤, 브라우저 대신 Cron에서만 호출하세요.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (secret) {
    const h = request.headers.get("x-revalidate-secret");
    if (h !== secret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  revalidateTag(LEAFLET_FETCH_CACHE_TAG, "default");
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
