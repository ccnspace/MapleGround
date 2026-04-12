"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import Image from "next/image";
import type { UnionRaider, UnionRaiderPreset } from "@/types/Union";
import { UnionRaiderEditDialog, type EditDialogTab } from "@/components/Union/UnionRaiderEditDialog";
import warriorIcon from "@/images/warrior.png";
import magicianIcon from "@/images/magician.png";
import archerIcon from "@/images/archer.png";
import thiefIcon from "@/images/thief.png";
import pirateIcon from "@/images/pirate.png";
import hybridIcon from "@/images/hybrid.png";
import maplemIcon from "@/images/maplem.png";
import type { StaticImageData } from "next/image";

const BLOCK_ICONS: Record<string, StaticImageData> = {
  전사: warriorIcon,
  마법사: magicianIcon,
  궁수: archerIcon,
  도적: thiefIcon,
  해적: pirateIcon,
  하이브리드: hybridIcon,
  "메이플 M 캐릭터": maplemIcon,
};

// 그리드 범위
const MIN_X = -11;
const MAX_X = 10;
const MIN_Y = -9;
const MAX_Y = 10;
const COLS = MAX_X - MIN_X + 1;
const ROWS = MAX_Y - MIN_Y + 1;

// 중심점 (4칸 중앙)
const CENTER_X = -0.5;
const CENTER_Y = 0.5;

// 내부 영역 (빨간 네모, 12x10)
const INNER_MIN_X = -6;
const INNER_MAX_X = 5;
const INNER_MIN_Y = -4;
const INNER_MAX_Y = 5;

const isInnerArea = (x: number, y: number) => x >= INNER_MIN_X && x <= INNER_MAX_X && y >= INNER_MIN_Y && y <= INNER_MAX_Y;

// 내부 8분할 (각도 기반, 11시부터 시계방향 0~7)
// 중심점에서의 각도로 sector 결정 → 그리드 위에서 자연스러운 계단형 경계
const getInnerRegion = (x: number, y: number): number | null => {
  if (!isInnerArea(x, y)) return null;
  // 중심 4칸 고정 배정
  if (x === -1 && y === 1) return 0;
  if (x === 0 && y === 1) return 1;
  if (x === -1 && y === 0) return 5;
  if (x === 0 && y === 0) return 4;

  const dx = x - CENTER_X;
  let adjustedY: number;
  if (x <= -1) {
    adjustedY = y - 1; // 좌측: 대각선 하단 보정
  } else {
    adjustedY = y > 0 ? y + 1 : y; // 우측: 상단 대각선만 하단 보정
  }
  const dy = adjustedY - CENTER_Y;
  const mathAngle = Math.atan2(dy, dx) * (180 / Math.PI);
  const clockAngle = (90 - mathAngle + 360) % 360;
  const sectorAngle = (clockAngle - 315 + 360) % 360;
  let sector = Math.floor(sectorAngle / 45);
  // 좌측 수평 경계 보정: y=0에서 sector 6→7
  // 좌측 수평 경계 보정: sector 6→7
  if (x <= -1 && (y === 3 || y === 2 || y === 1) && sector === 6) sector = 7;
  // 9시-11시 대각 경계 보정: y == -x 인 셀을 sector 0으로 (경계 하단 이동)
  if (x <= -1 && y === -x && sector === 7) sector = 0;
  return sector;
};

// 외부 영역 sector 계산 (내부와 동일한 각도 기반)
const getOuterRegion = (x: number, y: number): number | null => {
  if (isInnerArea(x, y)) return null;
  const dx = x - CENTER_X;
  let adjustedY: number;
  if (x <= -1) {
    adjustedY = y - 1;
  } else {
    adjustedY = y > 0 ? y + 1 : y;
  }
  const dy = adjustedY - CENTER_Y;
  const mathAngle = Math.atan2(dy, dx) * (180 / Math.PI);
  const clockAngle = (90 - mathAngle + 360) % 360;
  const sectorAngle = (clockAngle - 315 + 360) % 360;
  let sector = Math.floor(sectorAngle / 45);
  if (x <= -1 && (y === 3 || y === 2 || y === 1) && sector === 6) sector = 7;
  if (x <= -1 && y === -x && sector === 7) sector = 0;
  return sector;
};

// 내부 영역 라벨 위치 (각 sector 중앙 부근)
const INNER_LABEL_POS: Record<number, { x: number; y: number }> = {
  0: { x: -2, y: 4 }, // 11시 (STR)
  1: { x: 1, y: 4 }, // 1시 (DEX)
  2: { x: 4, y: 2 }, // 3시 (INT)
  3: { x: 4, y: -2 }, // 5시 (LUK)
  4: { x: 1, y: -3 }, // 6시 (공격력)
  5: { x: -2, y: -3 }, // 7시 (마력)
  6: { x: -5, y: -2 }, // 9시 (HP)
  7: { x: -5, y: 2 }, // 10시 (MP)
};

// 외부 고정 라벨 (stat_field_id 0~7 순서와 동일)
const OUTER_LABELS: { name: string; x: number; y: number }[] = [
  { name: "상태이상내성", x: -5, y: 8 }, // 0 (11시)
  { name: "획득경험치", x: 4, y: 8 }, // 1 (1시)
  { name: "크리티컬 확률", x: 8, y: 4 }, // 2 (3시)
  { name: "보스데미지", x: 8, y: -4 }, // 3 (5시)
  { name: "일반데미지", x: 3, y: -7 }, // 4 (6시)
  { name: "버프지속시간", x: -5, y: -7 }, // 5 (7시)
  { name: "방어율무시", x: -9, y: -4 }, // 6 (9시)
  { name: "크리티컬 데미지", x: -9, y: 4 }, // 7 (10시)
];

// 블록 베이스 색상 (베이지-금색)
const BLOCK_BASE = "bg-[#bb996f]";

// block_type별 오버레이 색상 + 아이콘 도트 색상
const BLOCK_TYPE_STYLES: Record<string, { overlay: string; dot: string }> = {
  전사: { overlay: "bg-red-500/30", dot: "bg-red-500" },
  마법사: { overlay: "bg-blue-500/30", dot: "bg-blue-500" },
  궁수: { overlay: "bg-green-500/30", dot: "bg-green-500" },
  도적: { overlay: "bg-purple-500/30", dot: "bg-purple-500" },
  해적: { overlay: "bg-gray-700/30", dot: "bg-gray-700" },
  하이브리드: { overlay: "bg-cyan-500/30", dot: "bg-cyan-500" },
  "메이플 M 캐릭터": { overlay: "bg-orange-500/30", dot: "bg-orange-500" },
};

// 범례용 색상 (도트 색상과 동일)
const BLOCK_COLORS: Record<string, { bg: string }> = {
  전사: { bg: "bg-red-500" },
  마법사: { bg: "bg-blue-500" },
  궁수: { bg: "bg-green-500" },
  도적: { bg: "bg-purple-500" },
  해적: { bg: "bg-gray-700" },
  하이브리드: { bg: "bg-cyan-500" },
  "메이플 M 캐릭터": { bg: "bg-pink-500" },
};

const getBlockStyle = (blockType: string) => BLOCK_TYPE_STYLES[blockType] ?? { overlay: "bg-slate-500/30", dot: "bg-slate-500" };
const getBlockColor = (blockType: string) => BLOCK_COLORS[blockType] ?? { bg: "bg-[#c8b078]" };

type CellInfo = {
  blockType: string;
  blockClass: string;
  blockLevel: string;
  blockIndex: number;
} | null;

// 프리셋 번호로 데이터 가져오기 (0 = 현재 적용 중)
const getPresetData = (raider: UnionRaider, presetNo: number) => {
  if (presetNo === 0) {
    return {
      union_raider_stat: raider.union_raider_stat,
      union_occupied_stat: raider.union_occupied_stat,
      union_inner_stat: raider.union_inner_stat,
      union_block: raider.union_block,
    };
  }
  const preset = raider[`union_raider_preset_${presetNo}` as keyof UnionRaider] as UnionRaiderPreset | undefined;
  if (!preset) return null;
  return {
    union_raider_stat: preset.union_raider_stat,
    union_occupied_stat: preset.union_occupied_stat,
    union_inner_stat: preset.union_inner_stat,
    union_block: preset.union_block,
  };
};

type Props = { raider: UnionRaider };

export const UnionRaiderGrid = ({ raider }: Props) => {
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [editDialogTab, setEditDialogTab] = useState<EditDialogTab | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleSaveImage = useCallback(async () => {
    if (!gridRef.current) return;
    try {
      const dataUrl = await toPng(gridRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "union-raider.png";
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("이미지 저장 실패", e);
    }
  }, []);

  const presetData = useMemo(() => getPresetData(raider, selectedPreset), [raider, selectedPreset]);

  const innerStatMap = useMemo(() => {
    if (!presetData) return new Map<number, string>();
    const map = new Map<number, string>();
    presetData.union_inner_stat.forEach((s) => map.set(parseInt(s.stat_field_id), s.stat_field_effect.replace("유니온 ", "")));
    return map;
  }, [presetData]);

  const { grid, blocks, allLabels, iconCells } = useMemo(() => {
    const cellMap = new Map<string, CellInfo>();
    const labels = new Map<string, string>();
    const icons = new Set<string>();
    const blockList = presetData?.union_block ?? [];

    blockList.forEach((block, blockIndex) => {
      if (!block.block_position) return;
      block.block_position.forEach((pos) => {
        cellMap.set(`${pos.x},${pos.y}`, {
          blockType: block.block_type,
          blockClass: block.block_class,
          blockLevel: block.block_level,
          blockIndex,
        });
      });
      const pos = block.block_position[block.block_position.length - 1];
      icons.add(`${pos.x},${pos.y}`);
    });

    // 내부 영역 라벨 (union_inner_stat)
    for (const [regionId, pos] of Object.entries(INNER_LABEL_POS)) {
      const effect = innerStatMap.get(parseInt(regionId));
      if (effect) labels.set(`${pos.x},${pos.y}`, effect);
    }

    // 외부 고정 라벨
    OUTER_LABELS.forEach((l) => labels.set(`${l.x},${l.y}`, l.name));

    return { grid: cellMap, blocks: blockList, allLabels: labels, iconCells: icons };
  }, [presetData, innerStatMap]);

  const rows = useMemo(() => {
    const r: number[] = [];
    for (let y = MAX_Y; y >= MIN_Y; y--) r.push(y);
    return r;
  }, []);

  const cols = useMemo(() => {
    const c: number[] = [];
    for (let x = MIN_X; x <= MAX_X; x++) c.push(x);
    return c;
  }, []);

  // 경계선 사전 계산 (리렌더 시 재계산 방지)
  const borderStyles = useMemo(() => {
    const map = new Map<string, React.CSSProperties>();
    const sectorLine = "2px dashed rgba(200,210,220,0.5)";
    const outerLine = "2px dashed rgba(200,210,220,0.5)";

    for (let y = MIN_Y; y <= MAX_Y; y++) {
      for (let x = MIN_X; x <= MAX_X; x++) {
        const style: React.CSSProperties = {};

        if (isInnerArea(x, y)) {
          const myRegion = getInnerRegion(x, y);
          if (x < INNER_MAX_X && isInnerArea(x + 1, y) && getInnerRegion(x + 1, y) !== myRegion) {
            style.borderRight = sectorLine;
          }
          if (y > INNER_MIN_Y && isInnerArea(x, y - 1) && getInnerRegion(x, y - 1) !== myRegion) {
            style.borderBottom = sectorLine;
          }
          if (x === INNER_MIN_X) style.borderLeft = outerLine;
          if (x === INNER_MAX_X) style.borderRight = outerLine;
          if (y === INNER_MAX_Y) style.borderTop = outerLine;
          if (y === INNER_MIN_Y) style.borderBottom = outerLine;
        } else {
          const mySector = getOuterRegion(x, y);
          if (x < MAX_X && !isInnerArea(x + 1, y)) {
            const rightSector = getOuterRegion(x + 1, y);
            if (mySector !== rightSector) style.borderRight = sectorLine;
          }
          if (y > MIN_Y && !isInnerArea(x, y - 1)) {
            const belowSector = getOuterRegion(x, y - 1);
            if (mySector !== belowSector) style.borderBottom = sectorLine;
          }
        }

        if (Object.keys(style).length > 0) {
          map.set(`${x},${y}`, style);
        }
      }
    }
    return map;
  }, []);

  const hoveredBlockInfo = hoveredBlock !== null ? blocks[hoveredBlock] : null;

  return (
    <div className="flex flex-col gap-4">
      {/* 프리셋 선택 */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 p-1 rounded-lg bg-slate-200 dark:bg-color-950/50 border border-slate-200 dark:border-white/5">
          {[0, 1, 2, 3, 4, 5].map((no) => (
            <button
              key={no}
              onClick={() => {
                setSelectedPreset(no);
                setHoveredBlock(null);
              }}
              className={`px-3 py-1 rounded-md text-[12px] font-semibold transition-all ${
                selectedPreset === no
                  ? "bg-white dark:bg-color-800 text-black dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {no === 0 ? "적용 중" : `${no}`}
            </button>
          ))}
        </div>
        {selectedPreset === 0 && <span className="text-[11px] text-gray-400 dark:text-gray-500">(프리셋 {raider.use_preset_no})</span>}
        <button
          onClick={handleSaveImage}
          className="ml-auto px-3 py-1 rounded-md text-[12px] font-semibold text-gray-500 dark:text-gray-400
            bg-slate-200 dark:bg-color-950/50 border border-slate-200 dark:border-white/5
            hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          이미지 저장
        </button>
      </div>

      {editDialogTab && (
        <UnionRaiderEditDialog
          raider={raider}
          presetNo={selectedPreset}
          initialTab={editDialogTab}
          onClose={() => setEditDialogTab(null)}
        />
      )}

      <div className="flex justify-center" ref={gridRef}>
        <div
          className="relative w-full max-w-[624px] grid border border-[#c0c4cc] dark:border-[#3a3e48] rounded-lg overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          }}
        >
          {rows.map((y) =>
            cols.map((x) => {
              const key = `${x},${y}`;
              const cell = grid.get(key);
              const isCenter = (x === 0 && y === 0) || (x === -1 && y === 0) || (x === 0 && y === 1) || (x === -1 && y === 1);
              const isHovered = cell && cell.blockIndex === hoveredBlock;
              const borderStyle = borderStyles.get(key) ?? {};
              const label = allLabels.get(key);
              return (
                <div
                  key={key}
                  className={`relative aspect-square border border-[rgba(255,255,255,0.06)]
                    ${cell ? `${BLOCK_BASE} cursor-pointer` : ""}
                    ${!cell && isCenter ? "bg-[#4a5060]" : ""}
                    ${!cell && !isCenter ? "bg-[#2e3038]" : ""}
                  `}
                  style={borderStyle}
                  onMouseEnter={() => cell && setHoveredBlock(cell.blockIndex)}
                  onMouseLeave={() => setHoveredBlock(null)}
                >
                  {cell && isHovered && (
                    <div className={`absolute inset-0 ${getBlockStyle(cell.blockType).overlay} z-20 pointer-events-none`} />
                  )}
                  {cell && iconCells.has(key) && BLOCK_ICONS[cell.blockType] && (
                    <div className="absolute inset-[3px] max-[600px]:inset-[2px] pointer-events-none z-10 flex items-center justify-center">
                      <Image
                        src={BLOCK_ICONS[cell.blockType]}
                        alt={cell.blockType}
                        width={18}
                        height={18}
                        className="w-full h-full object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                  {label && (
                    <span
                      className="absolute z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap
                      text-[11px] max-[600px]:text-[8px] font-bold text-white pointer-events-none
                      bg-black/30 px-1.5 rounded-md opacity-80"
                    >
                      {label}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 호버 정보 or 범례 */}
      {hoveredBlockInfo ? (
        <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-color-950/50 border border-slate-200/80 dark:border-white/5">
          <div className="flex items-center gap-1.5">
            {BLOCK_ICONS[hoveredBlockInfo.block_type] && (
              <Image src={BLOCK_ICONS[hoveredBlockInfo.block_type]} alt={hoveredBlockInfo.block_type} width={18} height={18} unoptimized />
            )}
            <span className="font-bold text-sm">{hoveredBlockInfo.block_class}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Lv.{hoveredBlockInfo.block_level}</span>
            <span className="text-sm text-gray-400 dark:text-gray-500">{hoveredBlockInfo.block_type}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-color-950/50 border border-slate-200/80 dark:border-white/5">
          {Object.keys(BLOCK_ICONS).map((type) => (
            <div key={type} className="flex items-center gap-1.5">
              <Image src={BLOCK_ICONS[type]} alt={type} width={16} height={16} unoptimized />
              <span className="text-sm text-gray-600 dark:text-gray-400">{type}</span>
            </div>
          ))}
        </div>
      )}

      {/* 유니온 편집 / 자동 배치 진입 버튼 */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setEditDialogTab("new")}
          className="px-5 py-2.5 rounded-lg text-[14px] font-extrabold text-white transition-all
            bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600
            shadow-md shadow-sky-500/30 hover:-translate-y-0.5"
        >
          ⚡ 유니온 자동 배치
        </button>
        <button
          type="button"
          onClick={() => setEditDialogTab("edit")}
          className="px-5 py-2.5 rounded-lg text-[14px] font-bold
            bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20
            text-gray-700 dark:text-gray-100 transition-colors"
        >
          현재 유니온 편집
        </button>
      </div>

      {/* 공격대원 효과 + 점령 효과 */}
      <div className="grid grid-cols-1 min-[600px]:grid-cols-2 gap-4">
        {(presetData?.union_raider_stat?.length ?? 0) > 0 && (
          <div className="flex flex-col bg-slate-50 dark:bg-color-950/50 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-white/5 overflow-hidden max-h-[320px]">
            <div className="px-4 pt-3.5 pb-2 shrink-0">
              <p className="font-bold text-sm text-sky-600 dark:text-sky-400">공격대원 효과</p>
            </div>
            <div className="overflow-y-auto">
              {presetData?.union_raider_stat.map((stat, i) => (
                <div
                  key={i}
                  className={`flex items-center text-[13px] px-4 py-2 ${
                    i < presetData?.union_raider_stat.length - 1 ? "border-b border-slate-100 dark:border-white/5" : ""
                  }`}
                >
                  <span className="font-medium">{stat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(presetData?.union_occupied_stat?.length ?? 0) > 0 && (
          <div className="flex flex-col bg-slate-50 dark:bg-color-950/50 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-white/5 overflow-hidden max-h-[320px]">
            <div className="px-4 pt-3.5 pb-2 shrink-0">
              <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">점령 효과</p>
            </div>
            <div className="overflow-y-auto">
              {presetData?.union_occupied_stat.map((stat, i) => (
                <div
                  key={i}
                  className={`flex items-center text-[13px] px-4 py-2 ${
                    i < presetData?.union_occupied_stat.length - 1 ? "border-b border-slate-100 dark:border-white/5" : ""
                  }`}
                >
                  <span className="font-medium">{stat}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
