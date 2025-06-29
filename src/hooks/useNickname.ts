import { openModal } from "@/utils/openModal";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export const useNickname = () => {
  const searchParams = useSearchParams();
  const nickname = searchParams.get("name");
  const router = useRouter();

  if (!nickname) {
    // throw new Error("Nickname is required");
    openModal({
      type: "alert",
      message: "설정된 닉네임이 없습니다.\n홈으로 돌아갑니다.",
      confirmCallback: () => router.push("/"),
    });
  }

  return nickname as string;
};
