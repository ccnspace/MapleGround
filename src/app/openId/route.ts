import { NextRequest } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const scopeList = [
  "maplestory.characterlist",
  "maplestory.achievement",
  "maplestory.starforce",
  "maplestory.potential",
  "maplestory.cube",
] as const;

const OPENID_AUTH_URL = "https://openid.nexon.com/oauth2/authorize";

export async function GET() {
  try {
    const clientId = process.env.OPENID_CLIENT_ID;
    const redirectUri = process.env.OPENID_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      return Response.json({ message: "요청이 올바르지 않습니다." }, { status: 400 });
    }
    const scope = scopeList.join(",");
    const state = crypto.randomBytes(16).toString("hex");
    const authUrl = `${OPENID_AUTH_URL}?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`;
    return Response.json({ authUrl });
  } catch (e) {
    return Response.json({ message: "알 수 없는 오류가 발생하였습니다." }, { status: 400 });
  }
}
