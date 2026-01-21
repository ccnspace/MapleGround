import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/sessionStore";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") ?? "";
    const sessionId = cookie.match(/session_id=([^;]+)/)?.[1];

    if (sessionId) {
      await deleteSession(sessionId);
    }

    const res = NextResponse.redirect(`${process.env.PUBLIC_DOMAIN}`);
    res.cookies.set("session_id", "", { maxAge: 0 });
    return res;
  } catch (error) {
    return NextResponse.json({ message: "로그아웃 실패" }, { status: 500 });
  }
}
