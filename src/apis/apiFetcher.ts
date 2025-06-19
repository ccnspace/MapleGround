import { useModalStore } from "@/stores/modal";
import { ApiErrorMessages, ApiErrorType } from "@/types/Api";

export const apiFetcher = async <T>(url: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    const result = (await response.json()) as ApiErrorType;
    const errorMessage = ApiErrorMessages[result.name] ?? "서버와의 통신 중 에러가 발생하였습니다.";

    useModalStore.getState().setModal({
      type: "alert",
      message: errorMessage,
      confirmCallback: () => {
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      },
    });
    throw new Error("API request failed");
  }

  return response.json();
};
