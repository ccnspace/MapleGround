import { useModalStore } from "@/stores/modal";

export const apiFetcher = async <T>(url: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    useModalStore.getState().setModal({
      type: "alert",
      message: "서버와의 통신 중 에러가 발생하였습니다.",
      confirmCallback: () => {
        window.location.href = "/";
      },
    });
    throw new Error("API request failed");
  }

  return response.json();
};
