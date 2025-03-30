import { convertItemLevel } from "./convertItemLevel";
import { getAdditionalOptionPool, getItemOptionPool, getPotentialCubeCost } from "./potentialUtils";

export type ItemGrade = "레어" | "에픽" | "유니크" | "레전드리";
export type CubeType = "additional" | "potential";
type Option = { name: string; probability: number };

type Constructor = {
  itemType: string; // 예: 무기, 엠블렘, ...
  itemLevel: number;
  initItemGrade: ItemGrade;
  initAdditionalGrade: ItemGrade;
  initItemOptions: string[];
  initAdditionalOptions: string[];
  cubeType: CubeType;
};

const adjustOptions = (lineOptions: Option[], optionName: string) => {
  const targetOptions = lineOptions.filter((option) => option.name.includes(optionName));

  const probSum = targetOptions.reduce((acc, cur) => {
    acc = acc + cur.probability;
    return acc;
  }, 0);

  const adjustedLineOptions = lineOptions
    .filter((option) => !option.name.includes(optionName))
    .map((option) => ({
      ...option,
      probability: option.probability / (1 - probSum),
    })) as Option[];

  return adjustedLineOptions;
};

export class CubeSimulator {
  private grades: ItemGrade[];
  private gradeUpInfo: { chance: number; guarantee: number }[];
  private gradeIndex = 0;
  private failedAttempts = [0, 0, 0, 0];
  private cubeType: CubeType = "potential";

  private currentAttempt = 0;
  private currentGuarantee = 0;
  private mesoCost = 0;

  // 전, 후 옵션 저장
  private currentOptions = ["", "", ""];
  private prevOptions = ["", "", ""];

  private currentGrade: ItemGrade = "레어";
  private prevGrade: ItemGrade = "레어";

  private initItemGrade: ItemGrade;
  private initAdditionalGrade: ItemGrade;

  private initItemOptions = ["", "", ""];
  private initAdditionalOptions = ["", "", ""];
  private itemType = "";
  private itemLevel = "0";

  constructor(params: Constructor) {
    const { initItemGrade, initItemOptions, initAdditionalGrade, initAdditionalOptions, itemType, itemLevel, cubeType } = params;
    this.grades = ["레어", "에픽", "유니크", "레전드리"];
    this.itemType = itemType;
    this.cubeType = cubeType;
    this.gradeUpInfo = this.getGradeUpInfo();
    this.itemLevel = convertItemLevel(itemLevel);
    this.initItemGrade = initItemGrade;
    this.initAdditionalGrade = initAdditionalGrade;
    this.initItemOptions = initItemOptions;
    this.initAdditionalOptions = initAdditionalOptions;

    this.init();
  }

  private init() {
    const itemGrade = this.cubeType === "potential" ? this.initItemGrade : this.initAdditionalGrade;
    const itemOptions = this.cubeType === "potential" ? this.initItemOptions : this.initAdditionalOptions;

    this.prevGrade = itemGrade;
    this.currentGrade = itemGrade;
    this.gradeIndex = this.grades.indexOf(itemGrade);
    this.failedAttempts = [0, 0, 0, 0]; // 각 등급별 시도도 횟수
    this.prevOptions = itemOptions ?? ["", "", ""]; // 옵션 초기화
    this.currentOptions = itemOptions ?? ["", "", ""]; // 옵션 초기화
    this.currentGuarantee = this.gradeUpInfo[this.gradeIndex]?.guarantee ?? 0;
  }

  private assignOptions() {
    const optionPool = this.getOptionPool();
    let secondOptionPool: Option[] = [];
    let thirdOptionPool: Option[] = [];

    let firstOption: string;
    let secondOption: string;
    let thirdOption: string;

    do {
      firstOption = this.getRandomOption(optionPool.firstLine);

      // 첫 번째 옵션에서 피격 후 무적시간/쓸만한 등장 시, 두-세번째 옵션에서는 나오지 않게 filter
      if (firstOption.includes("피격 후 무적시간")) {
        secondOptionPool = adjustOptions(optionPool.secondLine, "피격 후 무적시간");
        thirdOptionPool = adjustOptions(optionPool.thirdLine, "피격 후 무적시간");
      } else if (firstOption.includes("쓸만한")) {
        secondOptionPool = adjustOptions(optionPool.secondLine, "쓸만한");
        thirdOptionPool = adjustOptions(optionPool.thirdLine, "쓸만한");
      } else {
        secondOptionPool = optionPool.secondLine;
        thirdOptionPool = optionPool.thirdLine;
      }

      // 두 번째 옵션에서 피격 후 무적시간/쓸만한 등장 시, 세 번째 옵션에서는 나오지 않게 filter
      secondOption = this.getRandomOption(secondOptionPool);

      if (secondOption.includes("피격 후 무적시간")) {
        thirdOptionPool = adjustOptions(thirdOptionPool, "피격 후 무적시간");
      } else if (secondOption.includes("쓸만한")) {
        thirdOptionPool = adjustOptions(thirdOptionPool, "쓸만한");
      }

      // 첫, 두 번째 옵션에서 피격 시 일정 확률로 데미지 % 무시, 일정 확률로 몇 초간 무적 나오면 세 번째 옵션에서는 나오지 않게 filter
      const excludeOptions = ["확률로 데미지의", "초간 무적"];
      for (const option of excludeOptions) {
        if (firstOption.includes(option) || secondOption.includes(option)) {
          thirdOptionPool = adjustOptions(thirdOptionPool, option);
        }
      }

      thirdOption = this.getRandomOption(thirdOptionPool);
    } while (this.prevOptions[0] === firstOption && this.prevOptions[1] === secondOption && this.prevOptions[2] === thirdOption);

    this.currentOptions = [firstOption, secondOption, thirdOption];
  }

  private getOptionPool() {
    switch (this.cubeType) {
      case "potential":
        return getItemOptionPool(this.itemType, this.grades[this.gradeIndex], this.itemLevel);
      case "additional":
        return getAdditionalOptionPool(this.itemType, this.grades[this.gradeIndex], this.itemLevel);
      default:
        throw new Error("CubeType is invalid");
    }
  }

  private getRandomOption(optionPool: Option[]) {
    const roll = Math.random();
    let cumulativeProbability = 0;

    for (const option of optionPool) {
      cumulativeProbability += option.probability;
      if (roll < cumulativeProbability) {
        return option.name;
      }
    }
    return "";
  }

  private getGradeUpInfo() {
    if (this.cubeType === "potential") {
      return [
        { chance: 0.150000001275, guarantee: 10 }, // 레어 -> 에픽
        { chance: 0.035, guarantee: 42 }, // 에픽 -> 유니크
        { chance: 0.014, guarantee: 107 }, // 유니크 -> 레전드리
      ];
    }
    // 에디셔널
    return [
      { chance: 0.02381, guarantee: 62 }, // 레어 -> 에픽
      { chance: 0.009804, guarantee: 152 }, // 에픽 -> 유니크
      { chance: 0.007, guarantee: 214 }, // 유니크 -> 레전드리
    ];
  }

  rollCube() {
    // 등급 성장 시 편의상 강제로 옵션 선택
    if (this.prevGrade !== this.currentGrade) {
      this.prevOptions = this.currentOptions;
    }
    this.prevGrade = this.grades[this.gradeIndex];

    this.mesoCost += getPotentialCubeCost(this.currentGrade, parseInt(this.itemLevel), this.cubeType);

    const roll = Math.random();

    if (this.gradeIndex < this.grades.length - 1) {
      const gradeUpInfo = this.gradeUpInfo[this.gradeIndex];

      if (roll < gradeUpInfo.chance || this.failedAttempts[this.gradeIndex] >= gradeUpInfo.guarantee) {
        this.gradeIndex++;
      } else {
        this.failedAttempts[this.gradeIndex]++;
      }
    } else {
      this.failedAttempts[this.gradeIndex]++;
    }

    this.currentGrade = this.grades[this.gradeIndex];
    this.currentAttempt = this.failedAttempts[this.gradeIndex];
    this.currentGuarantee = this.gradeUpInfo[this.gradeIndex]?.guarantee ?? 0;

    this.assignOptions();
  }

  getItemState() {
    return {
      prevGrade: this.prevGrade,
      currentGrade: this.currentGrade,
      prevOptions: this.prevOptions,
      currentOptions: this.currentOptions,
      failedAttempts: this.failedAttempts,
      currentAttempt: this.currentAttempt,
      currentGuarantee: this.currentGuarantee,
      mesoCost: this.mesoCost,
    };
  }

  setMiracleTime(isSet: boolean) {
    if (isSet) {
      const updatedGradeUpInfo = this.gradeUpInfo.map((item) => ({ ...item, chance: item.chance * 2 }));
      this.gradeUpInfo = updatedGradeUpInfo;
    } else {
      this.gradeUpInfo = this.getGradeUpInfo();
    }
  }

  setPrevOptions(options: string[]) {
    this.prevOptions = options;
  }

  setCurrentAttempt(attempt: number) {
    this.failedAttempts[this.gradeIndex] = attempt;
  }

  getCurrentGradeUpInfo() {
    return this.gradeUpInfo;
  }

  setMesoCost(cost: number) {
    this.mesoCost = cost;
  }
}
