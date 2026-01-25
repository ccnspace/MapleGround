import { openModal } from "@/utils/openModal";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export const useNickname = ({ isEnableErrorModal = true }: { isEnableErrorModal?: boolean } = {}) => {
  const searchParams = useSearchParams();
  const nickname = searchParams.get("name");
  const router = useRouter();

  if (!nickname) {
    if (isEnableErrorModal) {
      openModal({
        type: "alert",
        message: "설정된 닉네임이 없습니다.\n홈으로 돌아갑니다.",
        confirmCallback: () => router.push("/"),
      });
    }
    return null;
  }

  return nickname as string;
};
