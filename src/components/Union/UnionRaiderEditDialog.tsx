"use client";

import { useMemo, useState } from "react";
import { DimmedLayer } from "@/components/DimmedLayer";
import type { UnionRaider } from "@/types/Union";
import { UnionRaiderAutoPlacer } from "@/components/Union/UnionRaiderAutoPlacer";
import { UnionRaiderPresetEditor } from "@/components/Union/UnionRaiderPresetEditor";
import { getPresetData, type EditDialogTab } from "@/components/Union/unionRaiderDialogShared";

export type { EditDialogTab } from "@/components/Union/unionRaiderDialogShared";

type Props = {
  raider: UnionRaider;
  presetNo: number;
  initialTab?: EditDialogTab;
  onClose: () => void;
};

export const UnionRaiderEditDialog = ({ raider, presetNo, initialTab = "edit", onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<EditDialogTab>(initialTab);
  const presetData = useMemo(() => getPresetData(raider, presetNo), [raider, presetNo]);

  return (
    <>
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 overflow-auto">
        <div
          className="relative w-full max-w-[880px] my-auto flex flex-col gap-4
            bg-white dark:bg-[#2c2e38] rounded-2xl shadow-2xl
            border border-slate-200/80 dark:border-white/10
            p-5 max-h-[92vh] overflow-y-auto"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="font-extrabold text-lg">공격대 편집</p>
              <span
                className="text-[11px] font-semibold text-sky-600 dark:text-sky-400
                  bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-full"
              >
                {presetNo === 0 ? "기본 프리셋" : `프리셋 ${presetNo}`}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-sm font-bold bg-slate-400/20 hover:bg-slate-400/40
                dark:bg-white/10 dark:hover:bg-white/20 rounded-md px-3 py-1.5"
            >
              닫기
            </button>
          </div>

          {/* 탭 */}
          <div
            className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-color-950/60
              border border-slate-200 dark:border-white/5 self-start"
          >
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                activeTab === "edit"
                  ? "bg-white dark:bg-color-800 text-black dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              현재 프리셋 편집
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                activeTab === "new"
                  ? "bg-white dark:bg-color-800 text-black dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              유니온 자동 배치
            </button>
          </div>

          {/*
            탭 전환 시 상태(painted 셀, 로컬 블록 위치 등)가 유지돼야 하므로
            두 탭 컴포넌트를 항상 마운트해 두고, 비활성 탭은 `hidden` 으로만 가린다.
          */}
          <UnionRaiderPresetEditor presetData={presetData} hidden={activeTab !== "edit"} />
          <UnionRaiderAutoPlacer presetData={presetData} presetNo={presetNo} hidden={activeTab !== "new"} />
        </div>
      </div>

      <DimmedLayer style={{ zIndex: 10000 }} />
    </>
  );
};
