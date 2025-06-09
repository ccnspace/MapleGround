"use client";

import Chart, { type Props } from "react-apexcharts";
import { useCharacterStore } from "@/stores/character";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useCharacterPowerStore } from "@/stores/characterPower";
import { useShallow } from "zustand/shallow";
import { Spinner } from "../svg/Spinner";
import { ContainerWrapper } from "./ContainerWrapper";
import { useNickname } from "@/hooks/useNickname";

export const ChartContainer = () => {
  const nickname = useNickname();
  const { fetchStatus, characterPower, fetchCharacterPower } = useCharacterPowerStore(
    useShallow((state) => ({
      fetchStatus: state.fetchStatus,
      characterPower: state.characterPower?.[nickname],
      fetchCharacterPower: state.fetchCharacterPower,
    }))
  );

  const [categories, setCategories] = useState<string[]>([]);
  const [seriesData, setSeriesData] = useState<number[]>([]);
  const { theme } = useTheme();
  const canShowChart = !!nickname && !!categories.length && !!seriesData.length;
  const spinnerColor = theme === "dark" ? "white" : "#616161";

  // 초기화
  useEffect(() => {
    if (!nickname && categories.length && seriesData.length) {
      setCategories([]);
      setSeriesData([]);
    }
  }, [nickname, categories, seriesData]);

  useEffect(() => {
    if (!nickname) return;

    const abortController = new AbortController();
    fetchCharacterPower(nickname, abortController.signal);
  }, [nickname]);

  useEffect(() => {
    if (!characterPower) return;

    setCategories((prev) => [...prev, ...Object.keys(characterPower.data)]);
    setSeriesData((prev) => [...prev, ...Object.values(characterPower.data)]);
  }, [characterPower]);

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
    <ContainerWrapper className="w-full min-h-[400px] gap-0.5 justify-center">
      <div className="flex flex-col h-32 justify-center">
        {canShowChart && (
          <>
            <p
              className="flex font-extrabold text-base mb-auto px-2 pt-0.5
                border-l-4 border-l-indigo-400
               "
            >
              전투력 추이
            </p>
            <Chart options={chartOptions} series={series} type="line" height="310" />
          </>
        )}
        {fetchStatus === "idle" && (
          <div className="flex items-center justify-center">
            <p className="font-bold text-sm text-slate-950/50 dark:text-white/60">여기에 캐릭터의 전투력 추이가 표시됩니다.</p>
          </div>
        )}
        {fetchStatus === "loading" && (
          <div className="flex items-center justify-center">
            <Spinner width="3em" height="3em" color={spinnerColor} />
          </div>
        )}
      </div>
    </ContainerWrapper>
  );
};
