import { getSession, saveSession } from "@/lib/sessionStore";
import { NextRequest } from "next/server";
import type { TokenData } from "@/app/callback/route";

export const dynamic = "force-dynamic";

const API_DOMAIN = "https://openid.nexon.com/oauth2/userinfo";
const OPENID_TOKEN_URL = "https://openid.nexon.com/oauth2/token";

const refreshAccessToken = async (clientId: string, clientSecret: string, refreshToken: string) => {
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
  const tokenData = (await response.json()) as TokenData;
  return tokenData;
};

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session_id")?.value;
    if (!sessionId) return Response.json({ message: "세션 정보가 없습니다." }, { status: 400 });

    const sessionData = await getSession(sessionId);
    if (!sessionData) return Response.json({ message: "저장된 세션 데이터가 없습니다." }, { status: 400 });

    // 액세스 토큰 만료 시간이 지났으면 갱신한다.
    if (sessionData.accessTokenExpiresAt < Date.now()) {
      const { refresh_token } = sessionData;
      const clientId = process.env.OPENID_CLIENT_ID;
      const clientSecret = process.env.OPENID_CLIENT_SECRET;

      if (!clientId || !clientSecret || !refresh_token) {
        return Response.json({ message: "클라이언트 정보가 없습니다." }, { status: 400 });
      }

      // refresh token 을 사용하여 새로운 액세스 토큰을 발급받는다.
      const newAccessToken = await refreshAccessToken(clientId, clientSecret, sessionData.refresh_token);
      if (!newAccessToken) {
        return Response.json({ message: "액세스 토큰 갱신 실패" }, { status: 400 });
      }
      sessionData.access_token = newAccessToken.access_token;
      await saveSession({ sessionId, tokenData: newAccessToken });
    }

    const userInfo = await fetch(API_DOMAIN, {
      headers: {
        Authorization: `Bearer ${sessionData.access_token}`,
      },
    });
    if (!userInfo.ok) {
      return Response.json({ message: "사용자 정보 요청 실패" }, { status: 400 });
    }
    const userInfoData = await userInfo.json();
    return Response.json(userInfoData);
  } catch (e) {
    return Response.json({ message: "요청이 올바르지 않습니다." }, { status: 400 });
  }
}
