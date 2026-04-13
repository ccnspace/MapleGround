import type { MetadataRoute } from "next";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 캐릭터명 기반 동적 route.ts(API) 및 정적 페이지가 없는 경로는 크롤링 대상에서 제외.
        disallow: ["/equip/cash/", "/equip/normal/", "/equip/symbol/", "/user/", "/notice/", "/sound/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
