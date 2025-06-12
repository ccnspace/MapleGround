import { useSearchParams } from "next/navigation";

export const useNickname = () => {
  const searchParams = useSearchParams();
  const nickname = searchParams.get("name");

  if (!nickname) {
    throw new Error("Nickname is required");
  }

  return nickname;
};
