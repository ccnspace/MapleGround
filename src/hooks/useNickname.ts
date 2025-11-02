import { openModal } from "@/utils/openModal";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCharacterStore } from "@/stores/character";

export const useNickname = (enable?: boolean) => {
  const searchParams = useSearchParams();
  const nickname = searchParams.get("name");
  const router = useRouter();
  const lastVisitedNickname = useCharacterStore((state) => state.lastVisitedNickname);

  if (!nickname && enable) {
    // throw new Error("Nickname is required");
    openModal({
      type: "alert",
      message: "설정된 닉네임이 없습니다.\n홈으로 돌아갑니다.",
      confirmCallback: () => router.push("/"),
    });
  }

  return nickname || (lastVisitedNickname as string);
};
