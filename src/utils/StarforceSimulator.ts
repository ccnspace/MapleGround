import { ItemEquipment } from "@/types/Equipment";
import { getStarforceCost, getStarforceProbability, StarforceProbability, roundToTens, roundToHundred } from "./starforceUtils";
export type StarforceResult = "success" | "fail" | "destroy";

interface Item {
  level: number;
  starforce: number;
  options: ItemEquipment;
}

interface Constructor {
  item: ItemEquipment;
}

interface DiscountInfo {
  sundayDiscount: number;
  pcDiscount: number;
  mvpDiscount: number;
}

const DESTROY_REDUCTION_RATE = 0.3;
export class StarforceSimulator {
  private item: ItemEquipment;
  private discountInfo: DiscountInfo;
  private currentCost: number;
  private accumulatedCost: number;
  private probabilities: StarforceProbability;
  private result: StarforceResult | null;
  private attempts: number;
  private destroyCount: number;
  private destroyReduction: number;
  private successRateIncrease: number;
  private destroyEvent: { isDestroyProtection: boolean; isShiningStarforce: boolean };

  constructor(props: Constructor) {
    this.item = { ...props.item };
    this.discountInfo = { sundayDiscount: 0, pcDiscount: 0, mvpDiscount: 0 };

    this.accumulatedCost = 0;
    this.attempts = 0;
    this.destroyCount = 0;
    this.destroyReduction = 0;
    this.successRateIncrease = 0;
    this.destroyEvent = { isDestroyProtection: false, isShiningStarforce: false };
    this.currentCost = this.getRealCost();
    this.probabilities = this.getRealProbabilities();
    this.result = null;
  }

  applyCostDiscount(discountInfo: DiscountInfo) {
    this.discountInfo = discountInfo;
    this.currentCost = this.getRealCost();
  }

  applySuccessRateIncrease(increase: number) {
    this.successRateIncrease = increase;
    this.probabilities = this.getRealProbabilities();
  }

  setShiningStarforce(isSet: boolean) {
    this.destroyEvent.isShiningStarforce = isSet;
    this.probabilities = this.getRealProbabilities();
  }

  setDestroyProtection(isSet: boolean) {
    this.destroyEvent.isDestroyProtection = isSet;
    this.probabilities = this.getRealProbabilities();
    this.currentCost = this.getRealCost();
  }

  private isShiningStarforceEnabled() {
    return this.destroyEvent.isShiningStarforce && parseInt(this.item.starforce) < 22;
  }

  private isDestroyProtectionEnabled() {
    return this.destroyEvent.isDestroyProtection && parseInt(this.item.starforce) >= 15 && parseInt(this.item.starforce) <= 17;
  }

  private getRealCost() {
    const baseCost = roundToHundred(getStarforceCost(parseInt(this.item.starforce), this.item.item_base_option.base_equipment_level));
    const discountCost = baseCost * this.getCostDiscountRatio();
    return roundToTens(discountCost + (this.isDestroyProtectionEnabled() ? baseCost : 0));
  }

  private getRealProbabilities() {
    const baseProbabilities = getStarforceProbability(parseInt(this.item.starforce));

    if (this.isShiningStarforceEnabled()) {
      this.destroyReduction = DESTROY_REDUCTION_RATE;
    } else {
      this.destroyReduction = 0;
    }

    if (this.isDestroyProtectionEnabled()) {
      this.destroyReduction = 1;
    }

    const adjustedSuccessRate = (baseProbabilities.success || 0) * (1 + this.successRateIncrease);
    const remainRate = 1 - adjustedSuccessRate;

    const destroyRate = (baseProbabilities.destroy || 0) * (1 - this.destroyReduction);
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

  private getCostDiscountRatio() {
    const { sundayDiscount, pcDiscount, mvpDiscount } = this.discountInfo;

    const isPcDiscountEnabled = parseInt(this.item.starforce) <= 17;
    const isMvpDiscountEnabled = parseInt(this.item.starforce) <= 17;
    const realPcDiscount = isPcDiscountEnabled ? pcDiscount : 0;
    const realMvpDiscount = isMvpDiscountEnabled ? mvpDiscount : 0;
    return (1 - (realPcDiscount + realMvpDiscount)) * (1 - sundayDiscount);
  }

  simulate() {
    const cost = this.getRealCost();
    const rate = this.probabilities;
    const rand = Math.random();

    // console.log("[simulate] : ", rate, "/ [rand]: ", rand);
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

    this.currentCost = this.getRealCost();
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
      discountInfo: this.discountInfo,
      discountRatio: this.getCostDiscountRatio(),
    };
  }

  setStarforce(starforce: number) {
    this.item.starforce = starforce.toString();
    this.currentCost = this.getRealCost();
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
