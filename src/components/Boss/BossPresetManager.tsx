"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import { MAX_BOSS_PRESETS, selectionsEqual, useBossIncomeStore } from "@/stores/bossIncome";
import { openModal } from "@/utils/openModal";

type SaveState = "noSelection" | "unsaved" | "synced" | "modified";

// 상태별 작은 뱃지 스타일. 배너 자체는 항상 중성(슬레이트) 톤이고, 강조는 이 뱃지에서만 발생.
const STATUS_BADGE: Record<SaveState, { label: string; className: string }> = {
  noSelection: {
    label: "선택 없음",
    className: "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-gray-300",
  },
  unsaved: {
    label: "● 저장 전",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  },
  synced: {
    label: "✓ 저장됨",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  modified: {
    label: "● 변경됨",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  },
};

export const BossPresetManager = () => {
  const { presets, current, activePresetId, savePreset, updateActivePreset, renamePreset, loadPreset, deletePreset } = useBossIncomeStore(
    useShallow((s) => ({
      presets: s.presets,
      current: s.current,
      activePresetId: s.activePresetId,
      savePreset: s.savePreset,
      updateActivePreset: s.updateActivePreset,
      renamePreset: s.renamePreset,
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

  const [isSaveFormOpen, setIsSaveFormOpen] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 프리셋 이름 인라인 수정 상태.
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSaveFormOpen) inputRef.current?.focus();
  }, [isSaveFormOpen]);

  useEffect(() => {
    if (editingPresetId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingPresetId]);

  const editingTrimmed = editingName.trim();
  const editingDuplicate = presets.some((p) => p.id !== editingPresetId && p.name === editingTrimmed);
  const canSubmitRename = editingTrimmed.length > 0 && !editingDuplicate;

  const startRename = (id: string, currentName: string) => {
    setEditingPresetId(id);
    setEditingName(currentName);
  };
  const cancelRename = () => {
    setEditingPresetId(null);
    setEditingName("");
  };
  const submitRename = () => {
    if (!editingPresetId || !canSubmitRename) return;
    if (renamePreset(editingPresetId, editingTrimmed)) cancelRename();
  };

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

  const handleRevert = () => {
    if (!activePreset || !isDirty) return;
    openModal({
      type: "confirm",
      message: `변경사항을 되돌릴까요?\n"${activePreset.name}" 프리셋의 마지막 저장 상태로 돌아갑니다.`,
      confirmCallback: () => loadPreset(activePreset.id),
    });
  };

  const handleLoad = (id: string, presetName: string) => {
    if (id === activePresetId && !isDirty) return;
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

  const badge = STATUS_BADGE[status];
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
      className="flex flex-col gap-3 p-3 rounded-xl border
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

      {/* 현재 프리셋 배너 — 배경은 중성 톤으로 고정, 상태는 작은 뱃지로만 표시. */}
      <div
        className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg
          bg-white dark:bg-color-900/60
          border border-slate-200 dark:border-white/10"
      >
        <div className="flex flex-col min-w-0 leading-tight">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 tracking-wider">현재 선택중인 프리셋</span>
          <span
            className={`text-lg max-[600px]:text-base font-extrabold truncate
              ${activePreset ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}
          >
            {activePreset ? activePreset.name : "— 저장되지 않음 —"}
          </span>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap shrink-0 ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      {/* 액션 버튼 — 활성 프리셋 + 변경 상태에 따라 노출 분기. */}
      <div className="flex items-center gap-1.5 flex-wrap px-1">
        {activePreset && (
          <>
            <button
              type="button"
              onClick={handleOverwrite}
              disabled={!isDirty}
              title={isDirty ? "현재 프리셋에 덮어쓰기" : "변경된 내용이 없습니다"}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-[12px] font-bold whitespace-nowrap transition-colors
                bg-emerald-500 hover:bg-emerald-600 text-white
                disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-white/10
                disabled:text-gray-500 dark:disabled:text-gray-500"
            >
              <SaveIcon /> 저장
            </button>
            <button
              type="button"
              onClick={handleRevert}
              disabled={!isDirty}
              title={isDirty ? "마지막 저장 상태로 되돌리기" : "변경된 내용이 없습니다"}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-[12px] font-bold whitespace-nowrap transition-colors
                bg-white hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10
                text-gray-600 dark:text-gray-300
                border border-slate-200 dark:border-white/10
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RevertIcon /> 되돌리기
            </button>
          </>
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
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-[12px] font-bold whitespace-nowrap transition-colors
            ${
              isSaveFormOpen
                ? "bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200"
                : activePreset
                ? "bg-white hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 border border-slate-200 dark:border-white/10"
                : "bg-sky-500 hover:bg-sky-600 text-white"
            }
            disabled:opacity-40 disabled:cursor-not-allowed`}
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
              disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-white/10
              disabled:text-gray-500 dark:disabled:text-gray-500
              transition-colors"
          >
            저장
          </button>
        </form>
      )}

      {/* 프리셋 목록 — 활성 프리셋만 sky 액센트, 나머지는 중성 톤. */}
      {presets.length === 0 ? (
        <p className="px-1 py-1 text-[12px] text-gray-500 dark:text-gray-400">
          저장된 프리셋이 없습니다. 보스를 선택한 뒤 <span className="font-bold">＋ 새 이름으로 저장</span> 을 눌러 보세요.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5 px-1">
          {presets.map((preset) => {
            const enabledCount = Object.values(preset.selections).filter((s) => s.enabled).length;
            const isActive = preset.id === activePresetId;
            const isEditing = preset.id === editingPresetId;

            if (isEditing) {
              return (
                <form
                  key={preset.id}
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitRename();
                  }}
                  className="inline-flex items-stretch rounded-md border overflow-hidden
                    border-sky-400 dark:border-sky-500/70 bg-white dark:bg-color-900
                    ring-1 ring-sky-300/60 dark:ring-sky-600/40"
                  title={editingDuplicate ? "같은 이름의 프리셋이 이미 있습니다" : ""}
                >
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        cancelRename();
                      }
                    }}
                    maxLength={24}
                    aria-label={`${preset.name} 새 이름`}
                    className={`px-2.5 py-1 text-sm font-semibold w-[140px] max-[600px]:w-[110px]
                      bg-transparent text-gray-800 dark:text-gray-100
                      placeholder:text-gray-400 dark:placeholder:text-gray-500
                      focus:outline-none
                      ${editingDuplicate ? "text-rose-600 dark:text-rose-300" : ""}`}
                  />
                  <button
                    type="submit"
                    disabled={!canSubmitRename}
                    title={editingDuplicate ? "같은 이름의 프리셋이 이미 있습니다" : "이름 저장"}
                    aria-label="이름 저장"
                    className="px-1.5 text-emerald-600 hover:text-white hover:bg-emerald-500
                      dark:text-emerald-400 dark:hover:text-white dark:hover:bg-emerald-500
                      border-l border-slate-200 dark:border-white/10 transition-colors
                      disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-emerald-600 dark:disabled:hover:text-emerald-400"
                  >
                    <CheckIcon />
                  </button>
                  <button
                    type="button"
                    onClick={cancelRename}
                    title="취소 (Esc)"
                    aria-label="이름 변경 취소"
                    className="px-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                      hover:bg-slate-100 dark:hover:bg-white/10
                      border-l border-slate-200 dark:border-white/10 transition-colors"
                  >
                    ✕
                  </button>
                </form>
              );
            }

            return (
              <div
                key={preset.id}
                className={`inline-flex items-stretch rounded-md border overflow-hidden transition-colors
                  ${
                    isActive
                      ? "border-sky-400 dark:border-sky-500/70 bg-sky-50 dark:bg-sky-900/30"
                      : "border-slate-200 dark:border-white/10 bg-white dark:bg-color-900/60"
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
                        : "text-gray-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                >
                  <span>{preset.name}</span>
                  <span className="ml-1 text-[11px] font-medium text-gray-400 dark:text-gray-500">({enabledCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => startRename(preset.id, preset.name)}
                  title="이름 변경"
                  aria-label={`${preset.name} 이름 변경`}
                  className="px-1.5 text-gray-400 hover:text-sky-600 dark:hover:text-sky-300
                    hover:bg-sky-50 dark:hover:bg-sky-900/30
                    border-l border-slate-200 dark:border-white/10 transition-colors"
                >
                  <PencilIcon />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(preset.id, preset.name)}
                  title="삭제"
                  aria-label={`${preset.name} 삭제`}
                  className="px-1.5 text-gray-400 hover:text-rose-500
                    hover:bg-rose-50 dark:hover:bg-rose-900/20
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

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75H5.25A1.5 1.5 0 0 0 3.75 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V7.5L16.5 3.75Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75v5.25h7.5V3.75M7.5 20.25v-6.75h9v6.75" />
  </svg>
);

const RevertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
  </svg>
);

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.862 4.487Zm0 0L19.5 7.125"
    />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);
