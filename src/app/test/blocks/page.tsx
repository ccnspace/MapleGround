"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import warriorIcon from "@/images/warrior.png";
import magicianIcon from "@/images/magician.png";
import archerIcon from "@/images/archer.png";
import thiefIcon from "@/images/thief.png";
import pirateIcon from "@/images/pirate.png";
import maplemIcon from "@/images/maplem.png";
import {
  BLOCK_GRADES,
  BLOCK_GRADE_CELL_COUNT,
  UNION_BLOCK_SHAPES,
  flipShapeHorizontal,
  flipShapeVertical,
  rotateShapeClockwise,
  rotateShapeCounterClockwise,
  type BlockGrade,
  type BlockJobCategory,
} from "@/constants/unionBlockShapes";

type JobOption = {
  category: BlockJobCategory;
  label: string;
  icon: StaticImageData;
  overlay: string;
};

const JOB_OPTIONS: JobOption[] = [
  { category: "전사", label: "전사", icon: warriorIcon, overlay: "bg-red-500/40" },
  { category: "마법사", label: "마법사", icon: magicianIcon, overlay: "bg-blue-500/40" },
  { category: "궁수_메이플M", label: "궁수 / M", icon: archerIcon, overlay: "bg-green-500/40" },
  { category: "도적", label: "도적", icon: thiefIcon, overlay: "bg-purple-500/40" },
  { category: "해적", label: "해적", icon: pirateIcon, overlay: "bg-gray-700/40" },
];

const EXTRA_ICONS: Partial<Record<BlockJobCategory, StaticImageData>> = {
  궁수_메이플M: maplemIcon,
};

// 그리드 셀 픽셀 크기
const CELL_SIZE = 42;
// 프리뷰 캔버스는 최대 5x5까지 수용
const PREVIEW_SIZE = 5;

const TestBlocksPage = () => {
  const [job, setJob] = useState<BlockJobCategory>("전사");
  const [grade, setGrade] = useState<BlockGrade>("SSS");
  const [shape, setShape] = useState<string[]>(UNION_BLOCK_SHAPES["전사"]["SSS"]);

  // 직업/등급 변경 시 모양을 원본으로 초기화
  useEffect(() => {
    setShape(UNION_BLOCK_SHAPES[job][grade]);
  }, [job, grade]);

  const resetShape = () => setShape(UNION_BLOCK_SHAPES[job][grade]);

  const jobOption = JOB_OPTIONS.find((o) => o.category === job)!;

  // 아이콘은 모양의 첫 번째 "X" 위치에 얹음
  const iconPos = useMemo(() => {
    for (let r = 0; r < shape.length; r++) {
      const c = shape[r].indexOf("X");
      if (c >= 0) return { row: r, col: c };
    }
    return { row: 0, col: 0 };
  }, [shape]);

  const rows = shape.length;
  const cols = Math.max(...shape.map((r) => r.length));

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6 items-center bg-slate-100 dark:bg-color-950">
      <h1 className="text-xl font-extrabold tracking-tight">유니온 블록 모양 테스트</h1>

      {/* 직업 선택 */}
      <div className="flex flex-col gap-2 w-full max-w-[640px]">
        <p className="text-[12px] font-bold text-gray-500 dark:text-gray-400">직업</p>
        <div className="flex flex-wrap gap-2">
          {JOB_OPTIONS.map((opt) => {
            const isActive = opt.category === job;
            return (
              <button
                key={opt.category}
                onClick={() => setJob(opt.category)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[13px] font-semibold transition
                  ${
                    isActive
                      ? "bg-white dark:bg-color-800 border-sky-400 text-black dark:text-white shadow-sm"
                      : "bg-slate-200 dark:bg-color-900/60 border-transparent text-gray-600 dark:text-gray-300 hover:bg-slate-300/70 dark:hover:bg-color-800"
                  }`}
              >
                <Image src={opt.icon} alt={opt.label} width={16} height={16} unoptimized />
                {EXTRA_ICONS[opt.category] && (
                  <Image src={EXTRA_ICONS[opt.category]!} alt="" width={16} height={16} unoptimized />
                )}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 등급 선택 */}
      <div className="flex flex-col gap-2 w-full max-w-[640px]">
        <p className="text-[12px] font-bold text-gray-500 dark:text-gray-400">등급</p>
        <div className="flex flex-wrap gap-2">
          {BLOCK_GRADES.map((g) => {
            const isActive = g === grade;
            return (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`px-3 py-1.5 rounded-lg border text-[13px] font-bold transition min-w-[60px]
                  ${
                    isActive
                      ? "bg-white dark:bg-color-800 border-sky-400 text-black dark:text-white shadow-sm"
                      : "bg-slate-200 dark:bg-color-900/60 border-transparent text-gray-600 dark:text-gray-300 hover:bg-slate-300/70 dark:hover:bg-color-800"
                  }`}
              >
                {g}
                <span className="ml-1 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  ({BLOCK_GRADE_CELL_COUNT[g]}칸)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 변환 버튼 */}
      <div className="flex flex-col gap-2 w-full max-w-[640px]">
        <p className="text-[12px] font-bold text-gray-500 dark:text-gray-400">변환</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShape(flipShapeHorizontal(shape))}
            className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-[13px] font-semibold shadow-sm"
          >
            ↔ 좌우 대칭
          </button>
          <button
            onClick={() => setShape(flipShapeVertical(shape))}
            className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-[13px] font-semibold shadow-sm"
          >
            ↕ 상하 대칭
          </button>
          <button
            onClick={() => setShape(rotateShapeClockwise(shape))}
            className="px-3 py-1.5 rounded-lg bg-violet-500 hover:bg-violet-600 text-white text-[13px] font-semibold shadow-sm"
          >
            ↻ 시계 90°
          </button>
          <button
            onClick={() => setShape(rotateShapeCounterClockwise(shape))}
            className="px-3 py-1.5 rounded-lg bg-violet-500 hover:bg-violet-600 text-white text-[13px] font-semibold shadow-sm"
          >
            ↺ 반시계 90°
          </button>
          <button
            onClick={resetShape}
            className="px-3 py-1.5 rounded-lg bg-slate-500 hover:bg-slate-600 text-white text-[13px] font-semibold shadow-sm"
          >
            ⟲ 초기화
          </button>
        </div>
      </div>

      {/* 프리뷰 그리드 */}
      <div
        className="relative rounded-xl border border-[#3a3e48] bg-[#2e3038] p-3"
        style={{
          width: CELL_SIZE * PREVIEW_SIZE + 24,
          height: CELL_SIZE * PREVIEW_SIZE + 24,
        }}
      >
        <div
          className="grid gap-[2px]"
          style={{
            gridTemplateColumns: `repeat(${PREVIEW_SIZE}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${PREVIEW_SIZE}, ${CELL_SIZE}px)`,
          }}
        >
          {Array.from({ length: PREVIEW_SIZE * PREVIEW_SIZE }).map((_, i) => {
            const row = Math.floor(i / PREVIEW_SIZE);
            const col = i % PREVIEW_SIZE;
            const inShape = row < rows && col < cols && shape[row]?.[col] === "X";
            const isIcon = inShape && row === iconPos.row && col === iconPos.col;
            return (
              <div
                key={i}
                className={`relative rounded-[4px] ${
                  inShape ? "bg-[#bb996f]" : "bg-[#1f2128] opacity-40"
                }`}
              >
                {inShape && <div className={`absolute inset-0 rounded-[4px] ${jobOption.overlay}`} />}
                {isIcon && (
                  <div className="absolute inset-[4px] z-10 flex items-center justify-center">
                    <Image
                      src={jobOption.icon}
                      alt={jobOption.label}
                      width={24}
                      height={24}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 모양 디버그 문자열 */}
      <div className="flex flex-col gap-1 items-center">
        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
          {job} / {grade} — {BLOCK_GRADE_CELL_COUNT[grade]}칸
        </p>
        <pre className="text-[13px] leading-[1.1] font-mono bg-slate-200 dark:bg-color-900/60 px-3 py-2 rounded-md">
          {shape.join("\n")}
        </pre>
      </div>
    </div>
  );
};

export default TestBlocksPage;
