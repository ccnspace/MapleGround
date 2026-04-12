import { getUnionInfo, type UnionAttributes } from "@/apis/getUnionInfo";
import { MAX_FETCH_TIME } from "@/consts/fetch";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type UnionState = {
  fetchStatus: "success" | "error" | "idle" | "loading";
  unionAttributes: Record<string, UnionAttributes & { fetchDate: string }> | null;
};

type UnionAction = {
  setFetchStatus: (status: UnionState["fetchStatus"]) => void;
  setUnionAttributes: (data: UnionAttributes, nickname: string) => void;
  fetchUnionInfo: (nickname: string, signal?: AbortSignal) => Promise<void>;
};

const initialState: UnionState = {
  fetchStatus: "idle",
  unionAttributes: null,
};

export const useUnionStore = create<UnionState & UnionAction>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        setUnionAttributes: (unionAttributes, nickname) => {
          set({
            unionAttributes: {
              ...get().unionAttributes,
              [nickname]: { ...unionAttributes, fetchDate: new Date().toISOString() },
            },
          });
        },
        setFetchStatus: (fetchStatus) => {
          set({ fetchStatus });
        },
        fetchUnionInfo: async (nickname: string, signal?: AbortSignal) => {
          const { unionAttributes, setFetchStatus, setUnionAttributes } = get();

          if (unionAttributes?.[nickname]) {
            const currentTime = new Date();
            const fetchDate = new Date(unionAttributes[nickname].fetchDate);
            const timeDifference = currentTime.getTime() - fetchDate.getTime();
            if (timeDifference < MAX_FETCH_TIME) {
              setFetchStatus("success");
              return;
            }
          }

          try {
            setFetchStatus("loading");
            const response = await getUnionInfo(nickname, "", signal);
            setUnionAttributes(response, nickname);
            setFetchStatus("success");
          } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
              return;
            }
            setFetchStatus("error");
          }
        },
      }),
      {
        name: "union-attributes",
        partialize: (state) => ({
          unionAttributes: state.unionAttributes,
        }),
      }
    )
  )
);
