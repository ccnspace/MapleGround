import { getCharacterAttributes, type CharacterAttributes } from "@/apis/getCharacterAttributes";
import { getCharacterCombatPower } from "@/apis/getCharacterCombatPower";
import { MAX_FETCH_TIME } from "@/consts/fetch";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type CharacterPowerState = {
  fetchStatus: "success" | "error" | "idle" | "loading";
  characterPower: Record<string, { data: Record<string, number>; fetchDate: string }> | undefined;
};

type CharacterPowerAction = {
  setFetchStatus: (status: "success" | "error" | "idle" | "loading") => void;
  fetchCharacterPower: (nickname: string, signal?: AbortSignal) => Promise<void>;
  setPower: (data: Record<string, number>, nickname: string) => void;
  resetCharacterPower: (nickname: string) => void;
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
          const { characterPower, setFetchStatus, setPower } = get();

          if (characterPower?.[nickname]) {
            const currentTime = new Date();
            const fetchDate = new Date(characterPower[nickname].fetchDate);
            const timeDifference = currentTime.getTime() - fetchDate.getTime();
            if (timeDifference < MAX_FETCH_TIME) {
              setFetchStatus("success");
              return;
            }
          }

          try {
            setFetchStatus("loading");
            const response = await getCharacterCombatPower(nickname, signal);
            setPower(response, nickname);
            setFetchStatus("success");
          } catch (error) {
            // AbortError는 에러 처리하지 않음
            if (error instanceof Error && error.name === "AbortError") {
              return;
            }
            setFetchStatus("error");
          }
        },
        setPower: (data, nickname) => {
          set({ characterPower: { ...get().characterPower, [nickname]: { data, fetchDate: new Date().toISOString() } } });
        },
        resetCharacterPower: (nickname: string) => {
          const characterPowerData = get().characterPower;
          if (!characterPowerData) return;

          const { [nickname]: _, ...rest } = characterPowerData;
          set({ characterPower: { ...rest } });
        },
      }),
      {
        name: "character-power",
        partialize: (state) => ({
          characterPower: state.characterPower,
        }),
      }
    )
  )
);
