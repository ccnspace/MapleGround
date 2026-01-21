import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // /main 경로로 접근하는 경우
  if (request.nextUrl.pathname === "/main") {
    // URL에서 name 파라미터 확인
    const name = request.nextUrl.searchParams.get("name");

    // name 파라미터가 없거나 빈 문자열인 경우 홈으로 리다이렉트
    if (!name?.trim()) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (request.nextUrl.pathname === "/my") {
    const cookie = request.headers.get("cookie") ?? "";
    const sessionId = cookie.match(/session_id=([^;]+)/)?.[1];
    if (!sessionId) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// 미들웨어를 적용할 경로 설정
export const config = {
  matcher: ["/main", "/my"],
};
