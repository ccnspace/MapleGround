"use client";

import { getExpValue } from "@/utils/expUtils";
import { useCharacterStore } from "@/stores/character";
import React from "react";
import Image from "next/image";

// Import images
import expIcon from "@/images/exp.png";
import expAdvanceIcon from "@/images/expAdvance.png";
import highIcon from "@/images/high.png";
import anglerIcon from "@/images/angler.png";
import monpaIcon from "@/images/monpa.png";
import vipRestIcon from "@/images/vip.png";
import nightmareIcon from "@/images/nightmare.png";

const MIN_LEVEL = 1;
const MAX_LEVEL = 299;

const formatExp = (exp: number) => {
  return exp.toLocaleString();
};

const formatExpRate = (exp: number, maxExp: number) => {
  return ((exp / maxExp) * 100).toFixed(3);
};

const ExpItemWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-slate-200 border border-slate-300 dark:border-slate-600 dark:bg-slate-600/80 rounded-lg p-3">{children}</div>;
};

const ExpDetailWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-white/50 dark:bg-black/50">{children}</div>;
};

const LevelInput = ({ value, onChange, characterLevel }: { value: string; onChange: (value: string) => void; characterLevel?: number }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "" || /^\d+$/.test(inputValue)) {
      const numValue = parseInt(inputValue);
      if (inputValue === "" || (numValue >= MIN_LEVEL && numValue <= MAX_LEVEL)) {
        onChange(inputValue);
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-300 dark:border-slate-600">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">캐릭터 레벨</label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={characterLevel ? String(characterLevel) : "레벨 입력"}
        className="w-24 px-3 py-2 text-center text-lg font-bold rounded-lg border-2 border-slate-400 dark:border-slate-500 
                   bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100
                   focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none transition-colors"
      />
      <span className="text-xs text-gray-500 dark:text-gray-400">
        ({MIN_LEVEL}~{MAX_LEVEL})
      </span>
    </div>
  );
};

export const ExpContentContainer = ({ nickname }: { nickname: string | null }) => {
  const characterAttributes = useCharacterStore((state) => state.characterAttributes?.[nickname ?? ""]);
  const { character_level } = characterAttributes?.basic || {};

  const [manualLevel, setManualLevel] = React.useState<string>("");
  const [normalVoucherCount, setNormalVoucherCount] = React.useState<string>("");
  const [advancedVoucherCount, setAdvancedVoucherCount] = React.useState<string>("");
  const [vipRestCount, setVipRestCount] = React.useState<string>("");

  // nickname이 있으면 캐릭터 레벨 사용, 없으면 직접 입력한 레벨 사용
  const currentLevel = nickname && character_level ? character_level : parseInt(manualLevel) || 0;
  const LEVEL_REQUIREMENTS = {
    NORMAL_EXP: 200,
    ADVANCED_EXP: 260,
    EXTREME_MONPARK: 260,
    HIGH_MOUNTAIN: 260,
    ANGLER: 270,
    VIP_REST: 101,
    NIGHTMARE: 280,
  };

  const characterMaxExp = getExpValue({ level: currentLevel, type: "EXP" });
  const extremeMonpark = getExpValue({ level: currentLevel, type: "EXTREME_MONPARK" });
  const anglerCompany = getExpValue({ level: currentLevel, type: "ANGLER_COMPANY" });
  const highMountain = getExpValue({ level: currentLevel, type: "HIGH_MOUNTAIN" });
  const expVouchers = getExpValue({ level: currentLevel, type: "EXP_VOUCHERS" });
  const advancedExpVouchers = getExpValue({ level: currentLevel, type: "ADVANCED_EXP_VOUCHERS" });
  const nightmare = getExpValue({ level: currentLevel, type: "NIGHTMARE" });

  // 5초마다 획득하는 vipRest 값임. vipRest 1개는 30분임. 30분은 1800초, 5초마다 획득하는 값은 1800 / 5 = 360임.
  const vipRest = getExpValue({ level: currentLevel, type: "VIP_REST" });
  const vipRestPerOneTicket = vipRest * 360;

  const handleVoucherCountChange = (e: React.ChangeEvent<HTMLInputElement>, setCount: React.Dispatch<React.SetStateAction<string>>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCount(value);
    }
  };

  const handleVipRestCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setVipRestCount(value);
    }
  };

  const calculateCustomVoucherExp = (count: string, baseExp: number) => {
    const numCount = parseInt(count) || 0;
    return {
      exp: baseExp * numCount,
      rate: formatExpRate(baseExp * numCount, characterMaxExp),
    };
  };

  const showLevelInput = !nickname || !character_level;

  return (
    <div className="w-full min-[600px]:mt-5">
      <div className="flex flex-col justify-center gap-5">
        {/* 레벨 입력 섹션 */}
        {showLevelInput && (
          <div className="min-[600px]:px-[120px]">
            <LevelInput value={manualLevel} onChange={setManualLevel} characterLevel={character_level} />
          </div>
        )}

        {/* 현재 레벨 표시 */}
        {currentLevel > 0 && (
          <div className="min-[600px]:px-[120px]">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              현재 기준 레벨: <span className="font-bold text-lg text-sky-600 dark:text-sky-400">Lv.{currentLevel}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col">
          <div className="grid grid-cols-1 min-[600px]:grid-cols-3 gap-4 min-[600px]:px-[120px]">
            {/* Normal EXP Voucher Section */}
            <ExpItemWrapper>
              <div className="text-md font-bold mb-2 text-sky-700 dark:text-sky-300 flex items-center gap-2">
                <Image src={expIcon} alt="EXP 쿠폰" width={32} height={32} unoptimized style={{ imageRendering: "pixelated" }} />
                일반 EXP 쿠폰 <span className="text-xs font-normal">(레벨 200 이상 사용 가능)</span>
              </div>
              {currentLevel >= LEVEL_REQUIREMENTS.NORMAL_EXP ? (
                <div className="space-y-1.5">
                  <ExpDetailWrapper>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">1000개</span>
                    <div className="text-right">
                      <div className="text-md text-sky-500 dark:text-sky-300 font-bold">
                        {formatExpRate(expVouchers * 1000, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(expVouchers * 1000)}</div>
                    </div>
                  </ExpDetailWrapper>
                  <ExpDetailWrapper>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">직접 입력</span>
                      <input
                        type="text"
                        value={normalVoucherCount}
                        onChange={(e) => handleVoucherCountChange(e, setNormalVoucherCount)}
                        className="w-24 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="개수 입력"
                      />
                    </div>
                    <div className="text-right min-w-[120px] max-w-[160px]">
                      <div className="text-md text-sky-500 dark:text-sky-300 font-bold truncate">
                        {calculateCustomVoucherExp(normalVoucherCount, expVouchers).rate}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {formatExp(calculateCustomVoucherExp(normalVoucherCount, expVouchers).exp)}
                      </div>
                    </div>
                  </ExpDetailWrapper>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">레벨 200 이상부터 사용할 수 있습니다.</p>
              )}
            </ExpItemWrapper>

            {/* Advanced EXP Voucher Section */}
            <ExpItemWrapper>
              <div className="text-md font-bold mb-2 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Image
                  src={expAdvanceIcon}
                  alt="상급 EXP 쿠폰"
                  width={32}
                  height={32}
                  unoptimized
                  style={{ imageRendering: "pixelated" }}
                />
                상급 EXP 쿠폰 <span className="text-xs font-normal">(레벨 260 이상 사용 가능)</span>
              </div>
              {currentLevel >= LEVEL_REQUIREMENTS.ADVANCED_EXP ? (
                <div className="space-y-1.5">
                  <ExpDetailWrapper>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">1000개</span>
                    <div className="text-right">
                      <div className="text-md text-blue-600 dark:text-blue-400 font-bold">
                        {formatExpRate(advancedExpVouchers * 1000, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(advancedExpVouchers * 1000)}</div>
                    </div>
                  </ExpDetailWrapper>
                  <ExpDetailWrapper>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">직접 입력</span>
                      <input
                        type="text"
                        value={advancedVoucherCount}
                        onChange={(e) => handleVoucherCountChange(e, setAdvancedVoucherCount)}
                        className="w-24 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="개수 입력"
                      />
                    </div>
                    <div className="text-right min-w-[120px] max-w-[160px]">
                      <div className="text-md text-blue-600 dark:text-blue-400 font-bold truncate">
                        {calculateCustomVoucherExp(advancedVoucherCount, advancedExpVouchers).rate}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {formatExp(calculateCustomVoucherExp(advancedVoucherCount, advancedExpVouchers).exp)}
                      </div>
                    </div>
                  </ExpDetailWrapper>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">레벨 260 이상부터 사용할 수 있습니다.</p>
              )}
            </ExpItemWrapper>

            {/* VIP REST Section */}
            <ExpItemWrapper>
              <div className="text-md font-bold mb-2 text-violet-600 dark:text-violet-400 flex items-center gap-2">
                <Image src={vipRestIcon} alt="VIP 사우나" width={32} height={32} unoptimized style={{ imageRendering: "pixelated" }} />
                VIP 사우나/MVP 리조트 <span className="text-xs font-normal">(레벨 101 이상 사용 가능)</span>
              </div>
              {currentLevel >= LEVEL_REQUIREMENTS.VIP_REST ? (
                <div className="space-y-1.5">
                  <ExpDetailWrapper>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">1개(30분)</span>
                    <div className="text-right">
                      <div className="text-md text-violet-600 dark:text-violet-400 font-bold">
                        {formatExpRate(vipRestPerOneTicket, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(vipRestPerOneTicket)}</div>
                    </div>
                  </ExpDetailWrapper>
                  <ExpDetailWrapper>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">직접 입력</span>
                      <input
                        type="text"
                        value={vipRestCount}
                        onChange={handleVipRestCountChange}
                        className="w-24 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="개수 입력"
                      />
                    </div>
                    <div className="text-right min-w-[120px] max-w-[160px]">
                      <div className="text-md text-violet-600 dark:text-violet-400 font-bold truncate">
                        {calculateCustomVoucherExp(vipRestCount, vipRestPerOneTicket).rate}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {formatExp(calculateCustomVoucherExp(vipRestCount, vipRestPerOneTicket).exp)}
                      </div>
                    </div>
                  </ExpDetailWrapper>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">레벨 101 이상부터 사용할 수 있습니다.</p>
              )}
            </ExpItemWrapper>

            {/* Extreme Monster Park Section */}
            <ExpItemWrapper>
              <div className="text-md font-semibold mb-2 text-teal-600 dark:text-teal-400 flex items-center gap-2">
                <Image
                  src={monpaIcon}
                  alt="익스트림 몬스터파크"
                  width={32}
                  height={32}
                  unoptimized
                  style={{ imageRendering: "pixelated" }}
                />
                익스트림 몬스터파크 <span className="text-xs font-normal">(레벨 260 이상 참여 가능)</span>
              </div>
              {currentLevel >= LEVEL_REQUIREMENTS.EXTREME_MONPARK ? (
                <div className="space-y-1.5">
                  <ExpDetailWrapper>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">기본</span>
                    <div className="text-right">
                      <div className="text-md text-teal-600 dark:text-teal-400 font-bold">
                        {formatExpRate(extremeMonpark, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(extremeMonpark)}</div>
                    </div>
                  </ExpDetailWrapper>
                  <ExpDetailWrapper>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">+50% 버프</span>
                    <div className="text-right">
                      <div className="text-md text-teal-600 dark:text-teal-400 font-bold">
                        {formatExpRate(extremeMonpark + extremeMonpark * 0.5, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(extremeMonpark + extremeMonpark * 0.5)}</div>
                    </div>
                  </ExpDetailWrapper>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">레벨 260 이상부터 참여할 수 있습니다.</p>
              )}
            </ExpItemWrapper>

            {/* High Mountain Section */}
            <ExpItemWrapper>
              <div className="text-md font-semibold mb-2 text-lime-600 dark:text-lime-400 flex items-center gap-2">
                <Image src={highIcon} alt="하이 마운틴" width={32} height={32} unoptimized style={{ imageRendering: "pixelated" }} />
                하이 마운틴 <span className="text-xs font-normal">(레벨 260 이상 참여 가능)</span>
              </div>
              {currentLevel >= LEVEL_REQUIREMENTS.HIGH_MOUNTAIN ? (
                <div className="space-y-1.5">
                  <ExpDetailWrapper>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">기본</span>
                    <div className="text-right">
                      <div className="text-md text-lime-600 dark:text-lime-400 font-bold">
                        {formatExpRate(highMountain, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(highMountain)}</div>
                    </div>
                  </ExpDetailWrapper>
                  <ExpDetailWrapper>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">5배(1단계 / 7,500 메포)</span>
                    <div className="text-right">
                      <div className="text-md text-lime-600 dark:text-lime-400 font-bold">
                        {formatExpRate(highMountain * 5, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(highMountain * 5)}</div>
                    </div>
                  </ExpDetailWrapper>
                  <ExpDetailWrapper>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">9배(2단계 / 30,000 메포)</span>
                    <div className="text-right">
                      <div className="text-md text-lime-600 dark:text-lime-400 font-bold">
                        {formatExpRate(highMountain * 9, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(highMountain * 9)}</div>
                    </div>
                  </ExpDetailWrapper>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">레벨 260 이상부터 참여할 수 있습니다.</p>
              )}
            </ExpItemWrapper>

            {/* Angler Company Section */}
            <ExpItemWrapper>
              <div className="text-md font-semibold mb-2 text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Image src={anglerIcon} alt="앵글러 컴퍼니" width={32} height={32} unoptimized style={{ imageRendering: "pixelated" }} />
                앵글러 컴퍼니 <span className="text-xs font-normal">(레벨 270 이상 참여 가능)</span>
              </div>
              {currentLevel >= LEVEL_REQUIREMENTS.ANGLER ? (
                <div className="space-y-1.5">
                  <ExpDetailWrapper>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">기본</span>
                    <div className="text-right">
                      <div className="text-md text-indigo-600 dark:text-indigo-400 font-bold">
                        {formatExpRate(anglerCompany, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(anglerCompany)}</div>
                    </div>
                  </ExpDetailWrapper>
                  <ExpDetailWrapper>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">5배(1단계 / 10,000 메포)</span>
                    <div className="text-right">
                      <div className="text-md text-indigo-600 dark:text-indigo-400 font-bold">
                        {formatExpRate(anglerCompany * 5, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(anglerCompany * 5)}</div>
                    </div>
                  </ExpDetailWrapper>
                  <ExpDetailWrapper>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">9배(2단계 / 40,000 메포)</span>
                    <div className="text-right">
                      <div className="text-md text-indigo-600 dark:text-indigo-400 font-bold">
                        {formatExpRate(anglerCompany * 9, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(anglerCompany * 9)}</div>
                    </div>
                  </ExpDetailWrapper>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">레벨 270 이상부터 참여할 수 있습니다.</p>
              )}
            </ExpItemWrapper>

            {/* Nightmare Section (악몽선경) */}
            <ExpItemWrapper>
              <div className="text-md font-semibold mb-2 text-rose-600 dark:text-rose-300 flex items-center gap-2">
                <Image src={nightmareIcon} alt="앵글러 컴퍼니" width={32} height={32} unoptimized style={{ imageRendering: "pixelated" }} />
                악몽선경 <span className="text-xs font-normal">(레벨 280 이상 참여 가능)</span>
              </div>
              {currentLevel >= LEVEL_REQUIREMENTS.NIGHTMARE ? (
                <div className="space-y-1.5">
                  <ExpDetailWrapper>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">기본</span>
                    <div className="text-right">
                      <div className="text-md text-rose-600 dark:text-rose-400 font-bold">{formatExpRate(nightmare, characterMaxExp)}%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(nightmare)}</div>
                    </div>
                  </ExpDetailWrapper>
                  <ExpDetailWrapper>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">5배(1단계 / 12,500 메포)</span>
                    <div className="text-right">
                      <div className="text-md text-rose-600 dark:text-rose-400 font-bold">
                        {formatExpRate(nightmare * 5, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(nightmare * 5)}</div>
                    </div>
                  </ExpDetailWrapper>
                  <ExpDetailWrapper>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">9배(2단계 / 50,000 메포)</span>
                    <div className="text-right">
                      <div className="text-md text-rose-600 dark:text-rose-400 font-bold">
                        {formatExpRate(nightmare * 9, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(nightmare * 9)}</div>
                    </div>
                  </ExpDetailWrapper>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">레벨 270 이상부터 참여할 수 있습니다.</p>
              )}
            </ExpItemWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};
