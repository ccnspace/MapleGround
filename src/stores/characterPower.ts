import { getCharacterAttributes, type CharacterAttributes } from "@/apis/getCharacterAttributes";
import { getCharacterCombatPower } from "@/apis/getCharacterCombatPower";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type CharacterPowerState = {
  fetchStatus: "success" | "error" | "idle" | "loading";
  characterPower: Record<string, number> | undefined;
};

type CharacterPowerAction = {
  setFetchStatus: (status: "success" | "error" | "idle" | "loading") => void;
  fetchCharacterPower: (nickname: string, signal?: AbortSignal) => Promise<void>;
  setPower: (characterPower: Record<string, number>) => void;
  resetCharacterPower: () => void;
};

const initialState: CharacterPowerState = {
  fetchStatus: "idle",
  characterPower: undefined,
};

export const useCharacterPowerStore = create<CharacterPowerState & CharacterPowerAction>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        setFetchStatus: (fetchStatus) => {
          set({ fetchStatus });
        },
        fetchCharacterPower: async (nickname: string, signal?: AbortSignal) => {
          const { setFetchStatus, setPower } = get();
          try {
            setFetchStatus("loading");
            const response = await getCharacterCombatPower(nickname, signal);
            setPower(response);
            setFetchStatus("success");
          } catch (error) {
            // AbortError는 에러 처리하지 않음
            if (error instanceof Error && error.name === "AbortError") {
              return;
            }
            setFetchStatus("error");
          }
        },
        setPower: (characterPower) => {
          set({ characterPower });
        },
        resetCharacterPower: () => {
          set({ ...initialState });
        },
      }),
      {
        name: "character-power",
      }
    )
  )
);
