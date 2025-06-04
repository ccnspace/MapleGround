"use client";

import { getExpValue } from "@/utils/expUtils";
import { ContainerWrapper } from "./ContainerWrapper";
import { useCharacterStore } from "@/stores/character";

const formatExp = (exp: number) => {
  return exp.toLocaleString();
};

const formatExpRate = (exp: number, maxExp: number) => {
  return ((exp / maxExp) * 100).toFixed(3);
};

export const ExpContentContainer = () => {
  const characterAttributes = useCharacterStore((state) => state.characterAttributes);
  const { character_level } = characterAttributes?.basic || {};

  const characterMaxExp = getExpValue({ level: character_level || 0, type: "EXP" });
  const extremeMonpark = getExpValue({ level: character_level || 0, type: "EXTREME_MONPARK" });
  const anglerCompany = getExpValue({ level: character_level || 0, type: "ANGLER_COMPANY" });
  const highMountain = getExpValue({ level: character_level || 0, type: "HIGH_MOUNTAIN" });
  const expVouchers = getExpValue({ level: character_level || 0, type: "EXP_VOUCHERS" });
  const advancedExpVouchers = getExpValue({ level: character_level || 0, type: "ADVANCED_EXP_VOUCHERS" });

  return (
    <ContainerWrapper className="expContent_container min-h-72 overflow-y-auto">
      <div className="flex flex-col justify-center">
        <div className="flex justify-between mb-2">
          <p
            className="flex font-extrabold text-base mb-2 px-2 pb-0.5 pt-0.5 
              border-l-4 border-l-fuchsia-400/80
             "
          >
            경험치 효율
          </p>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-col space-y-2">
            {/* Normal EXP Voucher Section */}
            <div className="dark:bg-white/5 rounded-lg p-3 hover:bg-slate-300/30 dark:hover:bg-white/10 transition-all">
              <div className="text-md font-bold mb-2 text-sky-500 dark:text-sky-300">
                일반 EXP 쿠폰 <span className="text-xs font-normal">(레벨 200 이상 사용 가능)</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">1개</span>
                  <div className="text-right">
                    <div className="text-md text-sky-500 dark:text-sky-300 font-bold">{formatExpRate(expVouchers, characterMaxExp)}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(expVouchers)}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">1000개</span>
                  <div className="text-right">
                    <div className="text-md text-sky-500 dark:text-sky-300 font-bold">
                      {formatExpRate(expVouchers * 1000, characterMaxExp)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(expVouchers * 1000)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced EXP Voucher Section */}
            <div className="dark:bg-white/5 rounded-lg p-3 hover:bg-slate-300/30 dark:hover:bg-white/10 transition-all">
              <div className="text-md font-bold mb-2 text-blue-600 dark:text-blue-400">
                상급 EXP 쿠폰 <span className="text-xs font-normal">(레벨 260 이상 사용 가능)</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">1개</span>
                  <div className="text-right">
                    <div className="text-md text-blue-600 dark:text-blue-400 font-bold">
                      {formatExpRate(advancedExpVouchers, characterMaxExp)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(advancedExpVouchers)}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">1000개</span>
                  <div className="text-right">
                    <div className="text-md text-blue-600 dark:text-blue-400 font-bold">
                      {formatExpRate(advancedExpVouchers * 1000, characterMaxExp)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(advancedExpVouchers * 1000)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Extreme Monster Park Section */}
            <div className="dark:bg-white/5 rounded-lg p-3 hover:bg-slate-300/30 dark:hover:bg-white/10 transition-all">
              <div className="text-md font-semibold mb-2 text-fuchsia-600 dark:text-fuchsia-400">
                익스트림 몬스터파크 <span className="text-xs font-normal">(레벨 260 이상 참여 가능)</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">기본</span>
                  <div className="text-right">
                    <div className="text-md text-fuchsia-600 dark:text-fuchsia-400 font-bold">
                      {formatExpRate(extremeMonpark, characterMaxExp)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(extremeMonpark)}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">+50% 버프</span>
                  <div className="text-right">
                    <div className="text-md text-fuchsia-600 dark:text-fuchsia-400 font-bold">
                      {formatExpRate(extremeMonpark + extremeMonpark * 0.5, characterMaxExp)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(extremeMonpark + extremeMonpark * 0.5)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* High Mountain Section */}
            <div className="dark:bg-white/5 rounded-lg p-3 hover:bg-slate-300/30 dark:hover:bg-white/10 transition-all">
              <div className="text-md font-semibold mb-2 text-orange-600 dark:text-orange-400">
                하이 마운틴 <span className="text-xs font-normal">(레벨 260 이상 참여 가능)</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">기본</span>
                  <div className="text-right">
                    <div className="text-md text-orange-600 dark:text-orange-400 font-bold">
                      {formatExpRate(highMountain, characterMaxExp)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(highMountain)}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">4배</span>
                  <div className="text-right">
                    <div className="text-md text-orange-600 dark:text-orange-400 font-bold">
                      {formatExpRate(highMountain * 4, characterMaxExp)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(highMountain * 4)}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">9배</span>
                  <div className="text-right">
                    <div className="text-md text-orange-600 dark:text-orange-400 font-bold">
                      {formatExpRate(highMountain * 9, characterMaxExp)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(highMountain * 9)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Angler Company Section */}
            <div className="dark:bg-white/5 rounded-lg p-3 hover:bg-slate-300/30 dark:hover:bg-white/10 transition-all">
              <div className="text-md font-semibold mb-2 text-green-600 dark:text-green-400">
                앵글러 컴퍼니 <span className="text-xs font-normal">(레벨 270 이상 참여 가능)</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">기본</span>
                  <div className="text-right">
                    <div className="text-md text-green-600 dark:text-green-400 font-bold">
                      {formatExpRate(anglerCompany, characterMaxExp)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(anglerCompany)}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">4배</span>
                  <div className="text-right">
                    <div className="text-md text-green-600 dark:text-green-400 font-bold">
                      {formatExpRate(anglerCompany * 4, characterMaxExp)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(anglerCompany * 4)}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1.5 px-3 rounded-md bg-slate-300/50 dark:bg-white/5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">9배</span>
                  <div className="text-right">
                    <div className="text-md text-green-600 dark:text-green-400 font-bold">
                      {formatExpRate(anglerCompany * 9, characterMaxExp)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{formatExp(anglerCompany * 9)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContainerWrapper>
  );
};
