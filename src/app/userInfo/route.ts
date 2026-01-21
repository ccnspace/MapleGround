import { NextRequest } from "next/server";
import { withAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const API_DOMAIN = "https://openid.nexon.com/oauth2/userinfo";

export const GET = withAuth(async (request: NextRequest, accessToken: string) => {
  const userInfo = await fetch(API_DOMAIN, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userInfo.ok) {
    return Response.json({ message: "사용자 정보 요청 실패" }, { status: 400 });
  }

  const userInfoData = await userInfo.json();
  return Response.json(userInfoData);
});
