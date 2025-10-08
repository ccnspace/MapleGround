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
import { useNickname } from "@/hooks/useNickname";

const formatExp = (exp: number) => {
  return exp.toLocaleString();
};

const formatExpRate = (exp: number, maxExp: number) => {
  return ((exp / maxExp) * 100).toFixed(3);
};

export const ExpContentContainer = () => {
  const nickname = useNickname();
  const characterAttributes = useCharacterStore((state) => state.characterAttributes?.[nickname]);
  const { character_level } = characterAttributes?.basic || {};
  const [normalVoucherCount, setNormalVoucherCount] = React.useState<string>("");
  const [advancedVoucherCount, setAdvancedVoucherCount] = React.useState<string>("");
  const [vipRestCount, setVipRestCount] = React.useState<string>("");

  const currentLevel = character_level || 0;
  const LEVEL_REQUIREMENTS = {
    NORMAL_EXP: 200,
    ADVANCED_EXP: 260,
    EXTREME_MONPARK: 260,
    HIGH_MOUNTAIN: 260,
    ANGLER: 270,
    VIP_REST: 101,
  };

  const characterMaxExp = getExpValue({ level: currentLevel, type: "EXP" });
  const extremeMonpark = getExpValue({ level: currentLevel, type: "EXTREME_MONPARK" });
  const anglerCompany = getExpValue({ level: currentLevel, type: "ANGLER_COMPANY" });
  const highMountain = getExpValue({ level: currentLevel, type: "HIGH_MOUNTAIN" });
  const expVouchers = getExpValue({ level: currentLevel, type: "EXP_VOUCHERS" });
  const advancedExpVouchers = getExpValue({ level: currentLevel, type: "ADVANCED_EXP_VOUCHERS" });

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

  return (
    <div className="w-full">
      <div className="flex flex-col justify-center">
        <div className="flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Normal EXP Voucher Section */}
            <div className="bg-slate-200/60 dark:bg-white/5 rounded-lg p-3 hover:bg-slate-300/50 dark:hover:bg-white/10 transition-all">
              <div className="text-md font-bold mb-2 text-sky-500 dark:text-sky-300 flex items-center gap-2">
                <Image src={expIcon} alt="EXP 쿠폰" width={24} height={24} />
                일반 EXP 쿠폰 <span className="text-xs font-normal">(레벨 200 이상 사용 가능)</span>
              </div>
              {currentLevel >= LEVEL_REQUIREMENTS.NORMAL_EXP ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">1000개</span>
                    <div className="text-right">
                      <div className="text-md text-sky-500 dark:text-sky-300 font-bold">
                        {formatExpRate(expVouchers * 1000, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(expVouchers * 1000)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
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
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">레벨 200 이상부터 사용할 수 있습니다.</p>
              )}
            </div>

            {/* Advanced EXP Voucher Section */}
            <div className="bg-slate-200/60 dark:bg-white/5 rounded-lg p-3 hover:bg-slate-300/50 dark:hover:bg-white/10 transition-all">
              <div className="text-md font-bold mb-2 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Image src={expAdvanceIcon} alt="상급 EXP 쿠폰" width={24} height={24} />
                상급 EXP 쿠폰 <span className="text-xs font-normal">(레벨 260 이상 사용 가능)</span>
              </div>
              {currentLevel >= LEVEL_REQUIREMENTS.ADVANCED_EXP ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">1000개</span>
                    <div className="text-right">
                      <div className="text-md text-blue-600 dark:text-blue-400 font-bold">
                        {formatExpRate(advancedExpVouchers * 1000, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(advancedExpVouchers * 1000)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
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
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">레벨 260 이상부터 사용할 수 있습니다.</p>
              )}
            </div>

            {/* VIP REST Section */}
            <div className="bg-slate-200/60 dark:bg-white/5 rounded-lg p-3 hover:bg-slate-300/50 dark:hover:bg-white/10 transition-all">
              <div className="text-md font-bold mb-2 text-violet-600 dark:text-violet-400 flex items-center gap-2">
                <Image src={vipRestIcon} alt="VIP 사우나" width={24} height={24} />
                VIP 사우나/MVP 리조트 <span className="text-xs font-normal">(레벨 101 이상 사용 가능)</span>
              </div>
              {currentLevel >= LEVEL_REQUIREMENTS.VIP_REST ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">1개(30분)</span>
                    <div className="text-right">
                      <div className="text-md text-violet-600 dark:text-violet-400 font-bold">
                        {formatExpRate(vipRestPerOneTicket, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(vipRestPerOneTicket)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
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
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">레벨 101 이상부터 사용할 수 있습니다.</p>
              )}
            </div>

            {/* Extreme Monster Park Section */}
            <div className="bg-slate-200/60 dark:bg-white/5 rounded-lg p-3 hover:bg-slate-300/50 dark:hover:bg-white/10 transition-all">
              <div className="text-md font-semibold mb-2 text-teal-600 dark:text-teal-400 flex items-center gap-2">
                <Image src={monpaIcon} alt="익스트림 몬스터파크" width={24} height={24} />
                익스트림 몬스터파크 <span className="text-xs font-normal">(레벨 260 이상 참여 가능)</span>
              </div>
              {currentLevel >= LEVEL_REQUIREMENTS.EXTREME_MONPARK ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">기본</span>
                    <div className="text-right">
                      <div className="text-md text-teal-600 dark:text-teal-400 font-bold">
                        {formatExpRate(extremeMonpark, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(extremeMonpark)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">+50% 버프</span>
                    <div className="text-right">
                      <div className="text-md text-teal-600 dark:text-teal-400 font-bold">
                        {formatExpRate(extremeMonpark + extremeMonpark * 0.5, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(extremeMonpark + extremeMonpark * 0.5)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">레벨 260 이상부터 참여할 수 있습니다.</p>
              )}
            </div>

            {/* High Mountain Section */}
            <div className="bg-slate-200/60 dark:bg-white/5 rounded-lg p-3 hover:bg-slate-300/50 dark:hover:bg-white/10 transition-all">
              <div className="text-md font-semibold mb-2 text-lime-600 dark:text-lime-400 flex items-center gap-2">
                <Image src={highIcon} alt="하이 마운틴" width={24} height={24} />
                하이 마운틴 <span className="text-xs font-normal">(레벨 260 이상 참여 가능)</span>
              </div>
              {currentLevel >= LEVEL_REQUIREMENTS.HIGH_MOUNTAIN ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">기본</span>
                    <div className="text-right">
                      <div className="text-md text-lime-600 dark:text-lime-400 font-bold">
                        {formatExpRate(highMountain, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(highMountain)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">5배(1단계)</span>
                    <div className="text-right">
                      <div className="text-md text-lime-600 dark:text-lime-400 font-bold">
                        {formatExpRate(highMountain * 5, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(highMountain * 5)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">9배(2단계)</span>
                    <div className="text-right">
                      <div className="text-md text-lime-600 dark:text-lime-400 font-bold">
                        {formatExpRate(highMountain * 9, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(highMountain * 9)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">레벨 260 이상부터 참여할 수 있습니다.</p>
              )}
            </div>

            {/* Angler Company Section */}
            <div className="bg-slate-200/60 dark:bg-white/5 rounded-lg p-3 hover:bg-slate-300/50 dark:hover:bg-white/10 transition-all">
              <div className="text-md font-semibold mb-2 text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Image src={anglerIcon} alt="앵글러 컴퍼니" width={24} height={24} />
                앵글러 컴퍼니 <span className="text-xs font-normal">(레벨 270 이상 참여 가능)</span>
              </div>
              {currentLevel >= LEVEL_REQUIREMENTS.ANGLER ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">기본</span>
                    <div className="text-right">
                      <div className="text-md text-indigo-600 dark:text-indigo-400 font-bold">
                        {formatExpRate(anglerCompany, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(anglerCompany)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">5배(1단계)</span>
                    <div className="text-right">
                      <div className="text-md text-indigo-600 dark:text-indigo-400 font-bold">
                        {formatExpRate(anglerCompany * 5, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(anglerCompany * 5)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">9배(2단계)</span>
                    <div className="text-right">
                      <div className="text-md text-indigo-600 dark:text-indigo-400 font-bold">
                        {formatExpRate(anglerCompany * 9, characterMaxExp)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(anglerCompany * 9)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">레벨 270 이상부터 참여할 수 있습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
