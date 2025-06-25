"use client";

import { MainContainer } from "@/components/Container/MainContainer";
import { useNickname } from "@/hooks/useNickname";
import { useCharacterStore } from "@/stores/character";
import { useEffect } from "react";

export default function Page() {
  const nickname = useNickname();
  const fetchCharacterAttributes = useCharacterStore((state) => state.fetchCharacterAttributes);

  useEffect(() => {
    if (!nickname) return;

    const abortController = new AbortController();
    fetchCharacterAttributes(nickname, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [nickname, fetchCharacterAttributes]);

  return <MainContainer />;
}
