import { useCharacterStore } from "@/stores/character";
import { useModalStore } from "@/stores/modal";

export const apiFetcher = async <Response>(url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    useModalStore.getState().setModal({ type: "alert", message: "서버와의 통신 중 에러가 발생하였습니다." });
    useCharacterStore.getState().resetCharacterData();
    throw new Error("Api request error occured");
  }

  const data = await response.json();
  return data as Response;
};
