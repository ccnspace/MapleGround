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
  destroyReduction: number;
}

export class StarforceSimulator {
  private item: ItemEquipment;
  private costDiscount: number;
  private destroyReduction: number;
  private currentCost: number;
  private accumulatedCost: number;
  private probabilities: StarforceProbability;
  private result: StarforceResult | null;

  constructor(props: Constructor) {
    this.item = { ...props.item };
    this.costDiscount = props.costDiscount;
    this.destroyReduction = props.destroyReduction;

    const starforce = parseInt(this.item.starforce);
    const baseLevel = this.item.item_base_option.base_equipment_level;

    this.accumulatedCost = 0;
    this.currentCost = getStarforceCost(starforce, baseLevel);
    this.probabilities = getStarforceProbability(starforce);
    this.result = null;
  }

  applyCostDiscount(discount: number) {
    this.costDiscount = 1 - discount;
  }

  applyDestroyReduction(reduction: number) {
    this.destroyReduction = 1 - reduction;
  }

  simulate() {
    const cost = Math.floor(this.currentCost * this.costDiscount);
    const rate = this.probabilities;

    const adjustedDestroyRate = (rate.destroy || 0) * this.destroyReduction;
    const adjustedFailRate = rate.fail + (rate.destroy ? rate.destroy - adjustedDestroyRate : 0);

    const rand = Math.random();
    let result: StarforceResult;

    if (rand < rate.success) {
      result = "success";
      this.item.starforce = (parseInt(this.item.starforce) + 1).toString();
      this.applyOptionUpgrades(); // TODO: 옵션 업그레이드 로직 추가
    } else if (rand < rate.success + adjustedFailRate) {
      result = "fail";
    } else {
      result = "destroy";
      this.item.starforce = "12";
    }

    this.accumulatedCost += cost;
    this.currentCost = getStarforceCost(parseInt(this.item.starforce), this.item.item_base_option.base_equipment_level);
    this.probabilities = getStarforceProbability(parseInt(this.item.starforce));
    this.result = result;
  }

  getState() {
    return {
      cost: this.currentCost,
      probabilities: this.probabilities,
      accumulatedCost: this.accumulatedCost,
      item: this.item,
      result: this.result,
    };
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
