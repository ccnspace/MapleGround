import { getCharacterAttributes, type CharacterAttributes } from "@/apis/getCharacterAttributes";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type CharacterState = {
  fetchStatus: "success" | "error" | "idle" | "loading";
  characterAttributes: CharacterAttributes | null;
};

type CharacterAction = {
  setFetchStatus: (status: "success" | "error" | "idle" | "loading") => void;
  setCharacterAttributes: (data: CharacterAttributes) => void;
  resetCharacterData: () => void;
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
        setCharacterAttributes: (characterAttributes) => {
          set({ characterAttributes });
        },
        setFetchStatus: (fetchStatus) => {
          set({ fetchStatus });
        },
        resetCharacterData: () => {
          set({ ...initialState });
        },
        fetchCharacterAttributes: async (nickname: string, signal?: AbortSignal) => {
          const { setFetchStatus, setCharacterAttributes, resetCharacterData } = get();
          try {
            setFetchStatus("loading");
            const response = await getCharacterAttributes(nickname, "", signal);
            setCharacterAttributes(response);
            setFetchStatus("success");
          } catch (error) {
            // AbortError는 에러 처리하지 않음
            if (error instanceof Error && error.name === "AbortError") {
              return;
            }
            resetCharacterData();
            setFetchStatus("error");
          }
        },
      }),
      {
        name: "character-attributes",
      }
    )
  )
);
