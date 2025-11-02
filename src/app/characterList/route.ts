import { NextRequest } from "next/server";
import { withAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (_request: NextRequest, accessToken: string) => {
  const userInfo = await fetch(`${process.env.NEXON_API_DOMAIN}/character/list`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userInfo.ok) {
    return Response.json({ message: "사용자 정보 요청 실패" }, { status: 400 });
  }

  const userInfoData = await userInfo.json();
  return Response.json(userInfoData);
});
