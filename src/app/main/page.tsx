"use client";

import { MainContainer } from "@/components/Container/MainContainer";
import { useCharacterStore } from "@/stores/character";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function MainPage() {
  const searchParams = useSearchParams();
  const characterAttributes = useCharacterStore((state) => state.characterAttributes);
  const fetchCharacterAttributes = useCharacterStore((state) => state.fetchCharacterAttributes);
  const nickname = searchParams.get("name");

  useEffect(() => {
    if (!nickname || characterAttributes) return;

    const abortController = new AbortController();
    fetchCharacterAttributes(nickname, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [nickname, characterAttributes, fetchCharacterAttributes]);

  return <MainContainer />;
}
