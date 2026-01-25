"use client";

import { Suspense } from "react";
import { MainContainer } from "@/components/Container/MainContainer";
import { useNickname } from "@/hooks/useNickname";
import { useCharacterStore } from "@/stores/character";
import { useEffect } from "react";
import { LoadingContainer } from "@/components/Container/LoadingContainer";

const MainPageContent = () => {
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
};

export default function Page() {
  return (
    <Suspense fallback={<LoadingContainer />}>
      <MainPageContent />
    </Suspense>
  );
}
