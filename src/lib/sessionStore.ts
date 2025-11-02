// lib/sessionStore.ts

import type { TokenData } from "@/app/callback/route";
import { redis } from "@/lib/redis";

type Params = {
  sessionId: string;
  tokenData: TokenData;
};

export type SessionData = {
  access_token: string;
  refresh_token: string;
  accessTokenExpiresAt: number;
};

export async function saveSession({ sessionId, tokenData }: Params) {
  const { access_token, refresh_token, refresh_token_expires_in, expires_in } = tokenData;
  if (!redis.isOpen) {
    await redis.connect();
  }
  const sessionData = JSON.stringify({
    access_token,
    refresh_token,
    accessTokenExpiresAt: Date.now() + expires_in * 1000,
  });

  // refresh token 만료 시간 이후에서는 DB에서도 제거한다.
  await redis.set(`${sessionId}`, sessionData, { expiration: { type: "EX", value: refresh_token_expires_in } });
}

export async function getSession(sessionId: string) {
  if (!redis.isOpen) {
    await redis.connect();
  }
  try {
    const data = await redis.get(`${sessionId}`);
    const parsed = JSON.parse(data as string);
    return parsed as SessionData;
  } catch {
    return null;
  }
}

// 세션 삭제
export async function deleteSession(sessionId: string) {
  if (!redis.isOpen) {
    await redis.connect();
  }
  await redis.del(`${sessionId}`);
}
