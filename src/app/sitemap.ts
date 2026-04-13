import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

// 배포 환경의 베이스 URL. `.env` 에 NEXT_PUBLIC_SITE_URL 을 지정해 사용한다.
// Vercel 자동 주입 VERCEL_URL 을 폴백으로 사용하고, 로컬 개발 환경에서는 localhost 로 떨어진다.
const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

type Entry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

// src/app 의 정적 페이지 (page.tsx 가 실제로 존재하는 경로) 만 포함한다.
// /equip/**/[name], /user/**/[name] 처럼 동적 파라미터가 필요한 루트와 route.ts 핸들러(API) 는 제외.
const ENTRIES: Entry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/main", changeFrequency: "weekly", priority: 0.9 },
  { path: "/main/exp", changeFrequency: "weekly", priority: 0.8 },
  { path: "/main/union", changeFrequency: "weekly", priority: 0.8 },
  { path: "/main/vs", changeFrequency: "weekly", priority: 0.8 },
  { path: "/main/weapon", changeFrequency: "weekly", priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ENTRIES.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
