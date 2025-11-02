/**
 * pathname에서 쿼리 스트링과 해시를 제거합니다.
 * @example "/my/page?id=1#section" => "/my/page"
 */
export const normalizePathname = (path: string): string => {
  const withoutQuery = path.split("?")[0];
  const withoutHash = withoutQuery.split("#")[0];
  return withoutHash;
};

/**
 * 두 경로가 같은지 비교합니다 (서버/클라이언트 모두 사용 가능)
 */
export const isSamePath = (path1: string, path2: string): boolean => {
  return normalizePathname(path1) === normalizePathname(path2);
};

/**
 * 현재 경로가 특정 경로로 시작하는지 확인합니다
 */
export const isPathStartsWith = (currentPath: string, targetPath: string): boolean => {
  const normalized = normalizePathname(currentPath);
  const normalizedTarget = normalizePathname(targetPath);
  return normalized.startsWith(normalizedTarget);
};
