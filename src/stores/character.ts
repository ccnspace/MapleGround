import { getCharacterAttributes, type CharacterAttributes } from "@/apis/getCharacterAttributes";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type CharacterState = {
  fetchStatus: "success" | "error" | "idle" | "loading";
  characterAttributes: CharacterAttributes | null;
};

type CharacterAction = {
  setFetchStatus: (status: "success" | "error" | "idle" | "loading") => void;
  setCharacterAttributes: (data: CharacterAttributes) => void;
  resetCharacterData: () => void;
  fetchCharacterAttributes: (nickname: string) => Promise<void>;
};

const initialState: CharacterState = {
  fetchStatus: "idle",
  characterAttributes: null,
};

export const useCharacterStore = create<CharacterState & CharacterAction>()(
  devtools((set, get) => ({
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
    fetchCharacterAttributes: async (nickname: string) => {
      const { setFetchStatus, setCharacterAttributes, resetCharacterData } = get();
      try {
        setFetchStatus("loading");
        const response = await getCharacterAttributes(nickname);
        setCharacterAttributes(response);
        setFetchStatus("success");
      } catch {
        resetCharacterData();
        setFetchStatus("error");
      }
    },
  }))
);
