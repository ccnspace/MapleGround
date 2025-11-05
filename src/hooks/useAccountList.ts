import { getCharacterList } from "@/apis/getCharacterList";
import type { AccountInfo } from "@/types/CharacterList";
import { useEffect, useState } from "react";

export const useAccountList = () => {
  const [accountList, setAccountList] = useState<AccountInfo[]>([]);
  const [fetchStatus, setFetchStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (fetchStatus !== "idle") return;
    setFetchStatus("loading");
    getCharacterList()
      .then((characterList) => {
        setAccountList(characterList);
        setFetchStatus("success");
      })
      .catch(() => {
        setFetchStatus("error");
      });
  }, []);

  return { accountList, fetchStatus };
};
