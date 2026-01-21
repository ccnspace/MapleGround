import { saveSession } from "@/lib/sessionStore";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const OPENID_TOKEN_URL = "https://openid.nexon.com/oauth2/token";

export type TokenData = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
};

export async function GET(request: NextRequest) {
  try {
    const client_id = process.env.OPENID_CLIENT_ID;
    const code = request?.nextUrl?.searchParams.get("code"); // 완료 후 전달받는 code
    const client_secret = process.env.OPENID_CLIENT_SECRET; // server-side ONLY

    if (!client_id || !code || !client_secret) {
      return Response.json({ message: "요청이 올바르지 않습니다." }, { status: 400 });
    }

    const tokenResponse = await fetch(OPENID_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: client_id,
        client_secret: client_secret,
        code: code,
      }),
    });
    const tokenData = (await tokenResponse.json()) as TokenData;
    if (!tokenData?.access_token) {
      return Response.json({ message: "액세스 토큰 발급 실패" }, { status: 400 });
    }

    const sessionId = crypto.randomBytes(16).toString("hex");
    await saveSession({ sessionId, tokenData });

    // ✅ httpOnly 쿠키로 세션 ID 전달
    const res = NextResponse.redirect(`${process.env.PUBLIC_DOMAIN}`);
    res.cookies.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in ?? 3600,
    });
    return res;
  } catch (e) {
    return Response.json({ message: "알 수 없는 오류가 발생하였습니다." }, { status: 400 });
  }
}
