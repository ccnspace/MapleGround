export type ApiErrorType = {
  name: keyof typeof ApiErrorMessages;
  message: (typeof ApiErrorMessages)[keyof typeof ApiErrorMessages];
  requestUrl: string;
};

export const ApiErrorMessages = {
  OPENAPI00010: "메이플스토리 점검 중입니다.\n점검이 끝나고 다시 시도해 주세요.",
  OPENAPI00007: "하루 호출량을 초과하였습니다.",
  OPENAPI00011: "Nexon Open API 서버 점검 중입니다.\n점검이 끝나고 다시 시도해 주세요.",
} as const;
