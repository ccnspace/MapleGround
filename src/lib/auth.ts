import { NextRequest } from "next/server";
import { getSession, saveSession, type SessionData } from "@/lib/sessionStore";
import type { TokenData } from "@/app/callback/route";

const OPENID_TOKEN_URL = "https://openid.nexon.com/oauth2/token";

/**
 * Refresh token을 사용하여 새로운 액세스 토큰을 발급받습니다.
 */
export async function refreshAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<TokenData> {
  const response = await fetch(OPENID_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("토큰 갱신 실패");
  }

  return (await response.json()) as TokenData;
}

/**
 * 세션을 검증하고, 필요시 액세스 토큰을 갱신합니다.
 * @returns 유효한 액세스 토큰 또는 에러 Response
 */
export async function getValidAccessToken(request: NextRequest): Promise<{ accessToken: string } | Response> {
  // 1. 세션 ID 가져오기
  const sessionId = request.cookies.get("session_id")?.value;
  if (!sessionId) {
    return Response.json({ message: "세션 정보가 없습니다." }, { status: 401 });
  }

  // 2. 세션 데이터 가져오기
  const sessionData = await getSession(sessionId);
  if (!sessionData) {
    return Response.json({ message: "저장된 세션 데이터가 없습니다." }, { status: 401 });
  }

  // 3. 액세스 토큰 만료 확인 및 갱신
  if (sessionData.accessTokenExpiresAt < Date.now()) {
    const { refresh_token } = sessionData;
    const clientId = process.env.OPENID_CLIENT_ID;
    const clientSecret = process.env.OPENID_CLIENT_SECRET;

    if (!clientId || !clientSecret || !refresh_token) {
      return Response.json({ message: "클라이언트 정보가 없습니다." }, { status: 500 });
    }

    try {
      // refresh token을 사용하여 새로운 액세스 토큰 발급
      const newTokenData = await refreshAccessToken(clientId, clientSecret, refresh_token);

      // 세션 업데이트
      await saveSession({ sessionId, tokenData: newTokenData });

      return { accessToken: newTokenData.access_token };
    } catch (error) {
      return Response.json({ message: "액세스 토큰 갱신 실패" }, { status: 401 });
    }
  }

  // 4. 유효한 액세스 토큰 반환
  return { accessToken: sessionData.access_token };
}

/**
 * 인증이 필요한 API 요청을 보호하는 Higher-Order Function
 */
export function withAuth<T = any>(
  handler: (request: NextRequest, accessToken: string) => Promise<Response>
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest) => {
    try {
      const result = await getValidAccessToken(request);

      // Response 객체면 에러이므로 그대로 반환
      if (result instanceof Response) {
        return result;
      }

      // 유효한 토큰이면 원래 handler 실행
      return await handler(request, result.accessToken);
    } catch (error) {
      return Response.json({ message: "인증 과정에서 오류가 발생하였습니다." }, { status: 400 });
    }
  };
}
