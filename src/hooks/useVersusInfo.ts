import { getCharacterAttributes } from "@/apis/getCharacterAttributes";
import { importantStats } from "@/components/Container/StatContainer";
import { useCharacterStore } from "@/stores/character";
import { useVersusStore } from "@/stores/versus";
import { ItemComparer, ItemComparisonResult } from "@/utils/ItemComparer";
import { openModal } from "@/utils/openModal";
import { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

const getWinner = (a: string, b: string) => {
  if (parseInt(a) > parseInt(b)) return "first";
  if (parseInt(a) < parseInt(b)) return "second";
  return "draw";
};

type VersusSimpleItem = {
  name: string;
  firstPerson: string;
  secondPerson: string;
  isWinner: "first" | "second" | "draw";
};

/** 전, 후 비교하여 수치가 가장 많이 바뀐 아이템 정보 */
type VersusDetailItem = {
  positiveScores: ItemComparisonResult[];
  negativeScores: ItemComparisonResult[];
};

export const useVersusInfo = () => {
  const [isLoading, setLoading] = useState(false);
  const [versusSimpleReport, setVersusSimpleReport] = useState<VersusSimpleItem[]>([]);
  const [versusDetailReport, setVersusDetailReport] = useState<VersusDetailItem>();
  const { firstPersonInfo, secondPersonInfo } = useVersusStore(
    useShallow((state) => ({
      firstPersonInfo: state.firstPersonInfo,
      secondPersonInfo: state.secondPersonInfo,
    }))
  );

  const isCharacterSuccessFetched = () => {
    const { characterAttributes } = useCharacterStore.getState();
    if (!characterAttributes) {
      openModal({ message: "먼저 왼쪽에서 캐릭터명을 검색해 주세요." });
      return false;
    }
    return true;
  };

  const isValidateDateInput = () => {
    const { firstPersonDate, secondPersonDate } = useVersusStore.getState();
    if (firstPersonDate >= secondPersonDate) {
      openModal({
        message: "첫 번째 캐릭터의 날짜를 \n두 번째 캐릭터보다 과거로 설정해 주세요.",
      });
      return false;
    }
    return true;
  };

  const validateReport = () => {
    if (!isCharacterSuccessFetched()) return false;
    if (!isValidateDateInput()) return false;
    return true;
  };

  const requestPersonData = async (nickname: string) => {
    setLoading(true);

    const { firstPersonDate, secondPersonDate, setPersonInfo } = useVersusStore.getState();

    const [firstPersonResponse, secondePersonResponse] = await Promise.all([
      getCharacterAttributes(nickname, firstPersonDate),
      getCharacterAttributes(nickname, secondPersonDate),
    ]);

    setPersonInfo("first", firstPersonResponse);
    setPersonInfo("second", secondePersonResponse);

    setLoading(false);

    compareCharacterInfo();
    getDetailReport();
  };

  const resetPersonData = useCallback(() => {
    const { setPersonInfo } = useVersusStore.getState();
    setPersonInfo("first", null);
    setPersonInfo("second", null);
    setVersusSimpleReport([]);
    setVersusDetailReport(undefined);
  }, []);

  const compareCharacterInfo = () => {
    const { firstPersonInfo, secondPersonInfo } = useVersusStore.getState();
    if (!firstPersonInfo || !secondPersonInfo) return;

    const { basic: firstBasic, stat: firstStat } = firstPersonInfo;
    const { basic: secondBasic, stat: secondStat } = secondPersonInfo;

    // (1) 전투력 비교
    const firstPersonCombatPower = firstStat.final_stat.find((stat) => stat.stat_name === "전투력")?.stat_value ?? "0";
    const secondPersonCombatPower = secondStat.final_stat.find((stat) => stat.stat_name === "전투력")?.stat_value ?? "0";
    setVersusSimpleReport((prev) => [
      ...prev,
      {
        name: "전투력",
        firstPerson: parseInt(firstPersonCombatPower).toLocaleString(),
        secondPerson: parseInt(secondPersonCombatPower).toLocaleString(),
        isWinner: getWinner(firstPersonCombatPower, secondPersonCombatPower),
      },
    ]);

    // (2) 레벨 비교
    const firstPersonLevel = firstBasic.character_level.toString() ?? "0";
    const secondPersonLevel = secondBasic.character_level.toString() ?? "0";
    setVersusSimpleReport((prev) => [
      ...prev,
      {
        name: "레벨",
        firstPerson: firstPersonLevel,
        secondPerson: secondPersonLevel,
        isWinner: getWinner(firstPersonLevel, secondPersonLevel),
      },
    ]);

    const strJobList = importantStats["STR"];
    const dexJobList = importantStats["DEX"];
    const intJobList = importantStats["INT"];
    const lukJobList = importantStats["LUK"];
    const hpJobList = importantStats["HP"];
    const attackJobList = importantStats["공격력"];
    const magicJobList = importantStats["마력"];

    const mainStat = (job: string) => {
      if (strJobList.includes(job)) return "STR";
      if (dexJobList.includes(job)) return "DEX";
      if (intJobList.includes(job)) return "INT";
      if (lukJobList.includes(job)) return "LUK";
      if (hpJobList.includes(job)) return "HP";
      return "STR";
    };

    const mainPower = (job: string) => {
      if (attackJobList.includes(job)) return "공격력";
      if (magicJobList.includes(job)) return "마력";
      return "공격력";
    };

    // (3) 주스탯 비교
    const firstPersonMainStat =
      firstStat.final_stat.find((stat) => stat.stat_name === mainStat(firstBasic.character_class))?.stat_value ?? "0";
    const secondPersonMainStat =
      secondStat.final_stat.find((stat) => stat.stat_name === mainStat(secondBasic.character_class))?.stat_value ?? "0";
    setVersusSimpleReport((prev) => [
      ...prev,
      {
        name: "주스탯",
        firstPerson: parseInt(firstPersonMainStat).toLocaleString(),
        secondPerson: parseInt(secondPersonMainStat).toLocaleString(),
        isWinner: getWinner(firstPersonMainStat, secondPersonMainStat),
      },
    ]);

    // (4) 공격력 혹은 마력 비교
    const firstPersonPower =
      firstStat.final_stat.find((stat) => stat.stat_name === mainPower(firstBasic.character_class))?.stat_value ?? "0";
    const secondPersonPower =
      secondStat.final_stat.find((stat) => stat.stat_name === mainPower(secondBasic.character_class))?.stat_value ?? "0";
    setVersusSimpleReport((prev) => [
      ...prev,
      {
        name: mainPower(firstBasic.character_class),
        firstPerson: parseInt(firstPersonPower).toLocaleString(),
        secondPerson: parseInt(secondPersonPower).toLocaleString(),
        isWinner: getWinner(firstPersonPower, secondPersonPower),
      },
    ]);

    // (4) 보스 몬스터 데미지 비교
    const firstPersonBossDamage = firstStat.final_stat.find((stat) => stat.stat_name === "보스 몬스터 데미지")?.stat_value ?? "0";
    const secondPersonBossDamage = secondStat.final_stat.find((stat) => stat.stat_name === "보스 몬스터 데미지")?.stat_value ?? "0";
    setVersusSimpleReport((prev) => [
      ...prev,
      {
        name: "보스 몬스터 데미지",
        firstPerson: `${firstPersonBossDamage}%`,
        secondPerson: `${secondPersonBossDamage}%`,
        isWinner: getWinner(firstPersonBossDamage, secondPersonBossDamage),
      },
    ]);

    // (6) 방어율 무시 비교
    const firstPersonIgnoreDefense = firstStat.final_stat.find((stat) => stat.stat_name === "방어율 무시")?.stat_value ?? "0";
    const secondPersonIgnoreDefense = secondStat.final_stat.find((stat) => stat.stat_name === "방어율 무시")?.stat_value ?? "0";
    setVersusSimpleReport((prev) => [
      ...prev,
      {
        name: "방어율 무시",
        firstPerson: `${firstPersonIgnoreDefense}%`,
        secondPerson: `${secondPersonIgnoreDefense}%`,
        isWinner: getWinner(firstPersonIgnoreDefense, secondPersonIgnoreDefense),
      },
    ]);

    // (8) 크리티컬 데미지 비교
    const firstPersonCriticalDamage = firstStat.final_stat.find((stat) => stat.stat_name === "크리티컬 데미지")?.stat_value ?? "0";
    const secondPersonCriticalDamage = secondStat.final_stat.find((stat) => stat.stat_name === "크리티컬 데미지")?.stat_value ?? "0";
    setVersusSimpleReport((prev) => [
      ...prev,
      {
        name: "크리티컬 데미지",
        firstPerson: `${firstPersonCriticalDamage}%`,
        secondPerson: `${secondPersonCriticalDamage}%`,
        isWinner: getWinner(firstPersonCriticalDamage, secondPersonCriticalDamage),
      },
    ]);
  };

  const resetVersusReport = () => {
    setVersusSimpleReport([]);
    setVersusDetailReport(undefined);
  };

  const getDetailReport = () => {
    const { firstPersonInfo, secondPersonInfo } = useVersusStore.getState();
    if (firstPersonInfo && secondPersonInfo) {
      const { positiveScores, negativeScores } = new ItemComparer(firstPersonInfo, secondPersonInfo).compareItems();
      setVersusDetailReport({
        positiveScores,
        negativeScores,
      });
    }
  };

  return {
    validateReport,
    requestPersonData,
    firstPersonInfo,
    secondPersonInfo,
    isLoading,
    resetPersonData,
    resetVersusReport,
    versusSimpleReport,
    versusDetailReport,
  };
};
