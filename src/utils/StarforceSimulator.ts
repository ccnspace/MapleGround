import { ItemEquipment } from "@/types/Equipment";
import { getStarforceCost, getStarforceProbability, StarforceProbability } from "./starforceUtils";
export type StarforceResult = "success" | "fail" | "destroy";

interface Item {
  level: number;
  starforce: number;
  options: ItemEquipment;
}

interface Constructor {
  item: ItemEquipment;
  costDiscount: number;
}

export class StarforceSimulator {
  private item: ItemEquipment;
  private costDiscount: number;
  private currentCost: number;
  private accumulatedCost: number;
  private probabilities: StarforceProbability;
  private result: StarforceResult | null;
  private attempts: number;
  private destroyCount: number;
  private destroyReduction: number;
  private successRateIncrease: number;

  constructor(props: Constructor) {
    this.item = { ...props.item };
    this.costDiscount = props.costDiscount;

    const starforce = parseInt(this.item.starforce);
    const baseLevel = this.item.item_base_option.base_equipment_level;

    this.accumulatedCost = 0;
    this.attempts = 0;
    this.destroyCount = 0;
    this.destroyReduction = 0;
    this.successRateIncrease = 0;
    this.currentCost = getStarforceCost(starforce, baseLevel);
    this.probabilities = this.getRealProbabilities();
    this.result = null;
  }

  applyCostDiscount(discount: number) {
    this.costDiscount = 1 - discount;
  }

  applyDestroyReduction(reduction: number) {
    this.destroyReduction = reduction;
    this.probabilities = this.getRealProbabilities();
  }

  applySuccessRateIncrease(increase: number) {
    this.successRateIncrease = increase;
    this.probabilities = this.getRealProbabilities();
  }

  getRealProbabilities() {
    const baseProbabilities = getStarforceProbability(parseInt(this.item.starforce));

    // 22성 이상은 파괴 확률 감소 적용 안됨
    let destroyReduction = this.destroyReduction;
    if (parseInt(this.item.starforce) >= 22) {
      destroyReduction = 0;
    }

    const adjustedSuccessRate = (baseProbabilities.success || 0) * (1 + this.successRateIncrease);
    const remainRate = 1 - adjustedSuccessRate;

    const destroyRate = (baseProbabilities.destroy || 0) * (1 - destroyReduction);
    const failRate = baseProbabilities.fail + (baseProbabilities.destroy ? baseProbabilities.destroy - destroyRate : 0);

    const adjustedFailDestroySum = (failRate || 0) + (destroyRate || 0);
    const destroyRatio = (destroyRate || 0) / adjustedFailDestroySum;
    const failRatio = (failRate || 0) / adjustedFailDestroySum;

    const adjustedDestroyRate = remainRate * destroyRatio;
    const adjustedFailRate = remainRate * failRatio;

    return {
      ...baseProbabilities,
      success: adjustedSuccessRate,
      fail: adjustedFailRate,
      destroy: adjustedDestroyRate,
    } satisfies StarforceProbability;
  }

  simulate() {
    const cost = Math.floor(this.currentCost * this.costDiscount);
    const rate = this.probabilities;
    const rand = Math.random();

    console.log("[simulate] : ", rate, "/ [rand]: ", rand);
    let result: StarforceResult;

    if (rand < rate.success) {
      result = "success";
      this.item.starforce = (parseInt(this.item.starforce) + 1).toString();
      this.applyOptionUpgrades(); // TODO: 옵션 업그레이드 로직 추가
    } else if (rand < rate.success + rate.fail) {
      result = "fail";
    } else {
      result = "destroy";
      this.item.starforce = "12";
      this.destroyCount++;
    }

    this.accumulatedCost += cost;
    this.currentCost = getStarforceCost(parseInt(this.item.starforce), this.item.item_base_option.base_equipment_level);
    this.probabilities = this.getRealProbabilities();
    this.result = result;
    this.attempts++;
  }

  getState() {
    return {
      cost: this.currentCost,
      probabilities: this.probabilities,
      accumulatedCost: this.accumulatedCost,
      item: this.item,
      result: this.result,
      attempts: this.attempts,
      destroyCount: this.destroyCount,
    };
  }

  setStarforce(starforce: number) {
    this.item.starforce = starforce.toString();
    this.currentCost = getStarforceCost(starforce, this.item.item_base_option.base_equipment_level);
    this.probabilities = this.getRealProbabilities();
  }

  resetAttempts() {
    this.attempts = 0;
  }

  resetAccumulatedCost() {
    this.accumulatedCost = 0;
  }

  resetDestroyCount() {
    this.destroyCount = 0;
  }

  private applyOptionUpgrades() {
    // if (this.optionUpgrades[this.item.type]) {
    //   const newOptions = this.optionUpgrades[this.item.type](this.item.starforce);
    //   Object.keys(newOptions).forEach((key) => {
    //     this.item.options[key] = (this.item.options[key] || 0) + newOptions[key];
    //   });
    // }
  }
}
