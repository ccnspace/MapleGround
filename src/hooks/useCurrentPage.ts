import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { normalizePathname } from "@/lib/pathname";

type Params = {
  src: string;
  comparisonFn?: (pathname: string, currentPage: string) => boolean;
};

/**
 * 현재 페이지 경로와 대상 경로를 비교합니다.
 *
 * @remarks
 * - `usePathname`은 클라이언트 전용이므로 SSR 문제 없음
 * - 경로 정규화로 쿼리 스트링/해시 무시
 * - `useMemo`로 최적화하여 불필요한 연산 방지
 *
 * @example
 * ```tsx
 * // 정확한 경로 매칭
 * const isActive = useCurrentPage({ src: "/my/profile" });
 *
 * // 커스텀 비교 (접두사 매칭)
 * const isActive = useCurrentPage({
 *   src: "/my",
 *   comparisonFn: (pathname, target) => pathname.startsWith(target)
 * });
 * ```
 */
export const useCurrentPage = ({ src, comparisonFn }: Params): boolean => {
  const pathname = usePathname();

  // src의 pathname만 추출 (useMemo로 캐싱)
  const normalizedSrc = useMemo(() => normalizePathname(src), [src]);

  return comparisonFn ? comparisonFn(pathname, normalizedSrc) : pathname === normalizedSrc;
};
