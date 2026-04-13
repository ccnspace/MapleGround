"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import { MAX_BOSS_PRESETS, selectionsEqual, useBossIncomeStore } from "@/stores/bossIncome";
import { openModal } from "@/utils/openModal";

type SaveState = "noSelection" | "unsaved" | "synced" | "modified";

// 저장 상태별 스타일 — "현재 프리셋" 배너 전체 배경색/테두리색 + 큼직한 뱃지 색을 동시에 결정.
const STATUS_STYLES: Record<SaveState, { label: string; banner: string; badge: string; nameClass: string }> = {
  noSelection: {
    label: "선택 없음",
    banner: "bg-slate-100 dark:bg-white/5 border-slate-300 dark:border-white/10",
    badge: "bg-slate-500 text-white",
    nameClass: "text-gray-400 dark:text-gray-500",
  },
  unsaved: {
    label: "● 저장 전",
    banner: "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60",
    badge: "bg-amber-500 text-white",
    nameClass: "text-gray-400 dark:text-gray-500",
  },
  synced: {
    label: "✓ 저장 완료됨",
    banner: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60",
    badge: "bg-emerald-500 text-white",
    nameClass: "text-emerald-700 dark:text-emerald-200",
  },
  modified: {
    label: "● 변경됨 (저장 전)",
    banner: "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60",
    badge: "bg-amber-500 text-white",
    nameClass: "text-amber-700 dark:text-amber-200",
  },
};

export const BossPresetManager = () => {
  const { presets, current, activePresetId, savePreset, updateActivePreset, loadPreset, deletePreset } = useBossIncomeStore(
    useShallow((s) => ({
      presets: s.presets,
      current: s.current,
      activePresetId: s.activePresetId,
      savePreset: s.savePreset,
      updateActivePreset: s.updateActivePreset,
      loadPreset: s.loadPreset,
      deletePreset: s.deletePreset,
    }))
  );

  const activePreset = useMemo(() => presets.find((p) => p.id === activePresetId) ?? null, [presets, activePresetId]);
  const hasSelections = useMemo(() => Object.values(current).some((s) => s.enabled), [current]);
  const isDirty = useMemo(() => {
    if (!activePreset) return hasSelections; // 활성 프리셋 없음 + 선택 있음 = 아직 저장 안 됨
    return !selectionsEqual(current, activePreset.selections);
  }, [activePreset, current, hasSelections]);

  const status: SaveState = !hasSelections && !activePreset ? "noSelection" : activePreset ? (isDirty ? "modified" : "synced") : "unsaved";

  const atLimit = presets.length >= MAX_BOSS_PRESETS;

  // 저장 폼 노출 토글
  const [isSaveFormOpen, setIsSaveFormOpen] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSaveFormOpen) inputRef.current?.focus();
  }, [isSaveFormOpen]);

  const trimmed = name.trim();
  const duplicateName = presets.some((p) => p.name === trimmed);
  const canSubmitSave = hasSelections && trimmed.length > 0 && !duplicateName && !atLimit;

  const openSaveForm = () => {
    setName("");
    setIsSaveFormOpen(true);
  };
  const closeSaveForm = () => {
    setIsSaveFormOpen(false);
    setName("");
  };

  const handleSubmitSave = () => {
    if (!canSubmitSave) return;
    const saved = savePreset(trimmed);
    if (saved) closeSaveForm();
  };

  const handleOverwrite = () => {
    if (!activePreset || !isDirty) return;
    openModal({
      type: "confirm",
      message: `"${activePreset.name}" 프리셋에 현재 선택을 덮어쓸까요?`,
      confirmCallback: () => {
        updateActivePreset();
      },
    });
  };

  const handleLoad = (id: string, presetName: string) => {
    if (id === activePresetId && !isDirty) return; // 이미 동일한 프리셋이 그대로 로드돼 있음
    if (!isDirty && !hasSelections) {
      loadPreset(id);
      return;
    }
    openModal({
      type: "confirm",
      message: `"${presetName}" 프리셋을 불러올까요?\n현재 ${isDirty ? "저장되지 않은 변경이" : "선택이"} 사라집니다.`,
      confirmCallback: () => loadPreset(id),
    });
  };

  const handleDelete = (id: string, presetName: string) => {
    openModal({
      type: "confirm",
      message: `"${presetName}" 프리셋을 삭제할까요?`,
      confirmCallback: () => deletePreset(id),
    });
  };

  const statusStyle = STATUS_STYLES[status];
  const saveHint = atLimit
    ? `최대 ${MAX_BOSS_PRESETS}개까지 저장할 수 있습니다`
    : !hasSelections
    ? "먼저 보스를 선택해야 저장할 수 있습니다"
    : trimmed.length === 0
    ? "프리셋 이름을 입력해 주세요"
    : duplicateName
    ? "같은 이름의 프리셋이 이미 있습니다"
    : "새 프리셋으로 저장";

  return (
    <div
      className="flex flex-col gap-2.5 p-3 rounded-xl border
        border-slate-200/80 dark:border-white/10
        bg-slate-50 dark:bg-color-950/40 h-full"
    >
      {/* 카드 타이틀 */}
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="text-[15px] font-bold text-gray-700 dark:text-gray-200">💾 프리셋</p>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums border leading-none
            ${
              atLimit
                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800/60"
                : "bg-white/80 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-slate-200 dark:border-white/10"
            }`}
          title={`최대 ${MAX_BOSS_PRESETS}개까지 저장 가능`}
        >
          {presets.length}
          <span className="mx-0.5 opacity-60">/</span>
          {MAX_BOSS_PRESETS}
        </span>
      </div>

      {/* 현재 프리셋 배너 — 상태에 따라 배경색·뱃지 색이 함께 변해 한눈에 들어오게. */}
      <div className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border-2 transition-colors ${statusStyle.banner}`}>
        <div className="flex flex-col min-w-0 leading-tight">
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 tracking-wider">현재 선택중인 프리셋</span>
          <span className={`text-lg max-[600px]:text-base font-extrabold truncate ${statusStyle.nameClass}`}>
            {activePreset ? activePreset.name : "— 저장되지 않음 —"}
          </span>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-extrabold shadow-sm whitespace-nowrap shrink-0 ${statusStyle.badge}`}
        >
          {statusStyle.label}
        </span>
      </div>

      {/* 액션 버튼 — 덮어쓰기 / 새 프리셋 저장 토글 */}
      <div className="flex items-center gap-2 flex-wrap px-1">
        {activePreset && (
          <button
            type="button"
            onClick={handleOverwrite}
            disabled={!isDirty}
            title={isDirty ? "현재 프리셋에 덮어쓰기" : "변경된 내용이 없습니다"}
            className="px-3 py-1 rounded-md text-[12px] font-bold whitespace-nowrap transition-colors
              bg-emerald-500 hover:bg-emerald-600 text-white
              disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-600"
          >
            💾 현재 프리셋에 저장
          </button>
        )}
        <button
          type="button"
          onClick={isSaveFormOpen ? closeSaveForm : openSaveForm}
          disabled={atLimit || (!hasSelections && !isSaveFormOpen)}
          title={
            atLimit
              ? `최대 ${MAX_BOSS_PRESETS}개까지 저장 가능합니다`
              : !hasSelections && !isSaveFormOpen
              ? "먼저 보스를 선택해야 저장할 수 있습니다"
              : isSaveFormOpen
              ? "저장 취소"
              : "새 이름으로 저장"
          }
          className={`px-3 py-1 rounded-md text-[12px] font-bold whitespace-nowrap transition-colors
            ${
              isSaveFormOpen
                ? "bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200"
                : "bg-sky-500 hover:bg-sky-600 text-white"
            }
            disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-600`}
        >
          {isSaveFormOpen ? "✕ 취소" : "＋ 새 이름으로 저장"}
        </button>
      </div>

      {/* 저장 폼 (토글로 노출) */}
      {isSaveFormOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitSave();
          }}
          className="flex items-center gap-2 px-1"
        >
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="프리셋 이름 (예: 캐릭터명)"
            maxLength={24}
            className="flex-1 min-w-0 px-3 py-1.5 rounded-md text-sm
              bg-white dark:bg-color-900
              border border-slate-300 dark:border-white/10
              text-gray-700 dark:text-gray-200
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-600"
          />
          <button
            type="submit"
            disabled={!canSubmitSave}
            title={saveHint}
            className="px-3 py-1.5 rounded-md text-sm font-bold whitespace-nowrap
              bg-sky-500 hover:bg-sky-600 text-white
              disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-600
              transition-colors"
          >
            저장
          </button>
        </form>
      )}

      {/* 프리셋 목록 */}
      {presets.length === 0 ? (
        <p className="px-1 py-1 text-[12px] text-gray-500 dark:text-gray-400">
          저장된 프리셋이 없습니다. 보스를 선택한 뒤 <span className="font-bold">＋ 새 이름으로 저장</span> 을 눌러 보세요.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5 px-1">
          {presets.map((preset) => {
            const enabledCount = Object.values(preset.selections).filter((s) => s.enabled).length;
            const isActive = preset.id === activePresetId;
            return (
              <div
                key={preset.id}
                className={`inline-flex items-stretch rounded-md border overflow-hidden
                  ${
                    isActive
                      ? "border-sky-400 dark:border-sky-500/70 bg-sky-50 dark:bg-sky-900/30 ring-1 ring-sky-300/60 dark:ring-sky-600/40"
                      : "border-slate-200 dark:border-white/10 bg-white dark:bg-color-900"
                  }`}
              >
                <button
                  type="button"
                  onClick={() => handleLoad(preset.id, preset.name)}
                  title={`${preset.name} · ${enabledCount}개 선택 · ${new Date(preset.savedAt).toLocaleString()}${
                    isActive ? " (현재 활성)" : " — 클릭하여 불러오기"
                  }`}
                  className={`px-2.5 py-1 text-sm font-semibold transition-colors
                    ${
                      isActive
                        ? "text-sky-700 dark:text-sky-200"
                        : "text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/30"
                    }`}
                >
                  <span>{preset.name}</span>
                  <span className="ml-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">({enabledCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(preset.id, preset.name)}
                  title="삭제"
                  aria-label={`${preset.name} 삭제`}
                  className="px-1.5 text-gray-400 hover:text-red-500
                    hover:bg-red-50 dark:hover:bg-red-900/20
                    border-l border-slate-200 dark:border-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
