"use client";

import Chart, { type Props } from "react-apexcharts";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ContainerWrapper } from "./ContainerWrapper";
import { useNickname } from "@/hooks/useNickname";

export const ExpContainer = () => {
  const nickname = useNickname();
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

    // const fetchCharacterInfo = async () => {
    //   const power = await getCharacterCombatPower(nickname);
    //   setCategories((prev) => [...prev, ...Object.keys(power)]);
    //   setSeriesData((prev) => [...prev, ...Object.values(power)]);
    // };
    // fetchCharacterInfo();
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
    <ContainerWrapper className="exp_container justify-center">
      <div className="flex flex-col h-32 justify-center">
        <div className="flex items-center justify-center">
          <p className="font-bold text-sm text-slate-950/50 dark:text-white/60">Coming Soon</p>
        </div>
      </div>
    </ContainerWrapper>
  );
};
