"use client";

import Chart, { type Props } from "react-apexcharts";
import { getCharacterCombatPower } from "@/apis/getCharacterCombatPower";
import { useCharacterStore } from "@/stores/character";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { InfoIcon } from "./svg/InfoIcon";

export const ChartContainer = () => {
  const nickname = useCharacterStore((state) => state.characterAttributes?.basic.character_name);
  const [categories, setCategories] = useState<string[]>([]);
  const [seriesData, setSeriesData] = useState<number[]>([]);

  const { theme } = useTheme();

  const canShowChart = nickname && categories.length && seriesData.length;

  // 초기화
  useEffect(() => {
    if (!nickname && categories.length && seriesData.length) {
      setCategories([]);
      setSeriesData([]);
    }
  }, [nickname, categories, seriesData]);

  useEffect(() => {
    if (!nickname) return;

    const fetchCharacterInfo = async () => {
      const power = await getCharacterCombatPower(nickname);
      setCategories((prev) => [...prev, ...Object.keys(power)]);
      setSeriesData((prev) => [...prev, ...Object.values(power)]);
    };
    fetchCharacterInfo();
  }, [nickname]);

  const chartOptions: Props["options"] = {
    chart: {
      id: "basic-bar",
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: "#616161",
          fontSize: "12px",
          fontFamily: "inherit",
          fontWeight: 400,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value: number) => {
          return value.toLocaleString();
        },
        style: {
          colors: "#616161",
          fontSize: "13px",
          fontFamily: "inherit",
          fontWeight: 400,
        },
      },
    },
    stroke: {
      lineCap: "round",
      curve: "smooth",
    },
    grid: {
      show: true,
      borderColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 5,
        right: 20,
      },
    },
    tooltip: {
      theme: theme === "dark" ? "dark" : "light",
    },
  };

  const series = [
    {
      name: "전투력",
      data: seriesData,
    },
  ];

  return (
    <div
      className="flex shrink-0 min-w-[640px] min-h-[400px] flex-col bg-slate-100 dark:bg-[#1f2024] px-3 pt-3 pb-3
        border-2 border-slate-200 dark:border-[#1f2024] rounded-lg gap-0.5 justify-center"
    >
      <div className="flex flex-col h-32 justify-center">
        {canShowChart ? (
          <>
            <p
              className="flex font-extrabold text-base mb-auto px-2 pt-0.5
                border-l-4 border-l-indigo-400
               "
            >
              전투력 추이
            </p>
            <Chart options={chartOptions} series={series} type="line" width="600" height="310" />
          </>
        ) : (
          <div className="flex items-center justify-center">
            <p className="font-bold text-sm text-slate-950/50 dark:text-white/60">여기에 캐릭터의 전투력 차트가 표시됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};
