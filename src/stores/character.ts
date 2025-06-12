import { getCharacterAttributes, type CharacterAttributes } from "@/apis/getCharacterAttributes";
import { MAX_FETCH_TIME } from "@/consts/fetch";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type CharacterState = {
  fetchStatus: "success" | "error" | "idle" | "loading";
  characterAttributes: Record<string, CharacterAttributes> | null;
};

type CharacterAction = {
  setFetchStatus: (status: "success" | "error" | "idle" | "loading") => void;
  setCharacterAttributes: (data: CharacterAttributes, nickname: string) => void;
  resetCharacterData: (nickname: string) => void;
  fetchCharacterAttributes: (nickname: string, signal?: AbortSignal) => Promise<void>;
};

const initialState: CharacterState = {
  fetchStatus: "idle",
  characterAttributes: null,
};

export const useCharacterStore = create<CharacterState & CharacterAction>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        setCharacterAttributes: (characterAttributes, nickname) => {
          set({
            characterAttributes: {
              ...get().characterAttributes,
              [nickname]: { ...characterAttributes, fetchDate: new Date().toISOString() },
            },
          });
        },
        setFetchStatus: (fetchStatus) => {
          set({ fetchStatus });
        },
        resetCharacterData: (nickname: string) => {
          const characterAttributesData = get().characterAttributes;
          if (!characterAttributesData) return;

          const { [nickname]: _, ...rest } = characterAttributesData;
          set({ characterAttributes: { ...rest } });
        },
        fetchCharacterAttributes: async (nickname: string, signal?: AbortSignal) => {
          const { characterAttributes, setFetchStatus, setCharacterAttributes, resetCharacterData } = get();

          if (characterAttributes?.[nickname]) {
            const currentTime = new Date();
            const fetchDate = new Date(characterAttributes[nickname].fetchDate);
            const timeDifference = currentTime.getTime() - fetchDate.getTime();
            if (timeDifference < MAX_FETCH_TIME) {
              setFetchStatus("success");
              return;
            }
          }

          try {
            setFetchStatus("loading");
            const response = await getCharacterAttributes(nickname, "", signal);
            setCharacterAttributes(response, nickname);
            setFetchStatus("success");
          } catch (error) {
            // AbortError는 에러 처리하지 않음
            if (error instanceof Error && error.name === "AbortError") {
              return;
            }
            setFetchStatus("error");
          }
        },
      }),
      {
        name: "character-attributes",
        partialize: (state) => ({
          characterAttributes: state.characterAttributes,
        }),
      }
    )
  )
);
