import { CharacterAttributes } from "@/apis/getCharacterAttributes";
import { ItemEquipment } from "@/types/Equipment";
import { JOB_STAT } from "@/consts/jobStat";

export interface RefinedItemData {
  str: string;
  dex: string;
  int: string;
  luk: string;
  max_hp: string;
  max_hp_rate: string;
  starforce: string;
  item_icon: string;
  magic_power: string;
  attack_power: string;
  str_rate: string;
  dex_rate: string;
  int_rate: string;
  luk_rate: string;
  allstat_rate: string;
  ignore_monster_armor: string;
  magic_power_rate: string;
  attack_power_rate: string;
  critical_damage_rate: string;
  boss_damage_rate: string;
}

export interface ItemComparisonResult {
  itemSlot: string;
  firstPersonItemIcon: string;
  secondPersonItemIcon: string;
  comparison: {
    // 공통 필드 (모든 직업에 필수)
    starforce: number;
    ignore_monster_armor: number;
    critical_damage_rate: number;
    boss_damage_rate: number;
    // 직업별 필드 (옵셔널)
    str?: number;
    dex?: number;
    int?: number;
    luk?: number;
    max_hp?: number;
    max_hp_rate?: number;
    magic_power?: number;
    attack_power?: number;
    str_rate?: number;
    dex_rate?: number;
    int_rate?: number;
    luk_rate?: number;
    allstat_rate?: number;
    magic_power_rate?: number;
    attack_power_rate?: number;
  };
  score: number;
}

export interface SortedComparisonResults {
  positiveScores: ItemComparisonResult[]; // 양수 점수, 내림차순 정렬
  negativeScores: ItemComparisonResult[]; // 음수 점수, 오름차순 정렬
}

export class ItemComparer {
  private character_class: string;
  private firstPersonItem: ItemEquipment[];
  private secondPersonItem: ItemEquipment[];

  constructor(private firstPersonInfo: CharacterAttributes, private secondPersonInfo: CharacterAttributes) {
    this.firstPersonItem = firstPersonInfo.normalEquip.item_equipment;
    this.secondPersonItem = secondPersonInfo.normalEquip.item_equipment;
    this.character_class = firstPersonInfo.basic.character_class;
  }

  /**
   * 같은 item_equipment_slot을 가진 아이템들을 비교하여 차이값을 반환합니다.
   */
  compareItems(): SortedComparisonResults {
    const allResults: ItemComparisonResult[] = [];

    // 첫 번째 사람의 아이템을 기준으로 순회
    this.firstPersonItem.forEach((firstItem) => {
      const slot = firstItem.item_equipment_slot;

      // 두 번째 사람의 아이템 중 같은 slot을 찾기
      const secondItem = this.secondPersonItem.find((item) => item.item_equipment_slot === slot);

      // 같은 slot을 가진 아이템이 있다면 비교 결과 생성
      if (secondItem) {
        const firstRefined = this.refineItemData(firstItem);
        const secondRefined = this.refineItemData(secondItem);
        const comparison = this.calculateDifference(firstRefined, secondRefined);

        const comparisonResult: ItemComparisonResult = {
          itemSlot: slot,
          firstPersonItemIcon: firstRefined.item_icon,
          secondPersonItemIcon: secondRefined.item_icon,
          comparison,
          score: this.calculateScore(comparison),
        };

        allResults.push(comparisonResult);
      }
    });

    // 양수 점수와 음수 점수 분리 및 정렬
    const positiveScores = allResults.filter((result) => result.score > 0).sort((a, b) => b.score - a.score); // 내림차순 정렬 (높은 점수 우선)

    const negativeScores = allResults.filter((result) => result.score < 0).sort((a, b) => a.score - b.score); // 오름차순 정렬 (낮은 점수 우선)

    return {
      positiveScores,
      negativeScores,
    };
  }

  /**
   * 두 아이템 간의 차이값을 계산하고 직업에 맞는 스탯만 필터링합니다.
   */
  private calculateDifference(first: RefinedItemData, second: RefinedItemData): ItemComparisonResult["comparison"] {
    const jobStat = JOB_STAT[this.character_class];
    if (!jobStat) {
      throw new Error(`Unknown character class: ${this.character_class}`);
    }

    const fullComparison = {
      str: parseInt(second.str) - parseInt(first.str),
      dex: parseInt(second.dex) - parseInt(first.dex),
      int: parseInt(second.int) - parseInt(first.int),
      luk: parseInt(second.luk) - parseInt(first.luk),
      max_hp: parseInt(second.max_hp) - parseInt(first.max_hp),
      max_hp_rate: parseInt(second.max_hp_rate) - parseInt(first.max_hp_rate),
      starforce: parseInt(second.starforce) - parseInt(first.starforce),
      magic_power: parseInt(second.magic_power) - parseInt(first.magic_power),
      attack_power: parseInt(second.attack_power) - parseInt(first.attack_power),
      str_rate: parseInt(second.str_rate) - parseInt(first.str_rate),
      dex_rate: parseInt(second.dex_rate) - parseInt(first.dex_rate),
      int_rate: parseInt(second.int_rate) - parseInt(first.int_rate),
      luk_rate: parseInt(second.luk_rate) - parseInt(first.luk_rate),
      allstat_rate: parseInt(second.allstat_rate) - parseInt(first.allstat_rate),
      ignore_monster_armor: parseInt(second.ignore_monster_armor) - parseInt(first.ignore_monster_armor),
      magic_power_rate: parseInt(second.magic_power_rate) - parseInt(first.magic_power_rate),
      attack_power_rate: parseInt(second.attack_power_rate) - parseInt(first.attack_power_rate),
      critical_damage_rate: parseInt(second.critical_damage_rate) - parseInt(first.critical_damage_rate),
      boss_damage_rate: parseInt(second.boss_damage_rate) - parseInt(first.boss_damage_rate),
    };

    // 공통으로 중요한 필드들 (모든 직업에 필수)
    const filteredComparison: ItemComparisonResult["comparison"] = {
      starforce: fullComparison.starforce,
      ignore_monster_armor: fullComparison.ignore_monster_armor,
      critical_damage_rate: fullComparison.critical_damage_rate,
      boss_damage_rate: fullComparison.boss_damage_rate,
    } as ItemComparisonResult["comparison"];

    // 직업별 mainStat에 따른 필드 추가
    if (jobStat.mainStat === "str") {
      filteredComparison.str = fullComparison.str;
      filteredComparison.str_rate = fullComparison.str_rate;
    } else if (jobStat.mainStat === "dex") {
      filteredComparison.dex = fullComparison.dex;
      filteredComparison.dex_rate = fullComparison.dex_rate;
    } else if (jobStat.mainStat === "int") {
      filteredComparison.int = fullComparison.int;
      filteredComparison.int_rate = fullComparison.int_rate;
    } else if (jobStat.mainStat === "luk") {
      filteredComparison.luk = fullComparison.luk;
      filteredComparison.luk_rate = fullComparison.luk_rate;
    } else if (jobStat.mainStat === "hp") {
      filteredComparison.max_hp = fullComparison.max_hp;
      filteredComparison.max_hp_rate = fullComparison.max_hp_rate;
    } else if (jobStat.mainStat === "str+dex+luk") {
      filteredComparison.str = fullComparison.str;
      filteredComparison.dex = fullComparison.dex;
      filteredComparison.luk = fullComparison.luk;
      filteredComparison.str_rate = fullComparison.str_rate;
      filteredComparison.dex_rate = fullComparison.dex_rate;
      filteredComparison.luk_rate = fullComparison.luk_rate;
    }

    if (jobStat.mainStat !== "hp") {
      filteredComparison.allstat_rate = fullComparison.allstat_rate;
    }

    // 직업별 mainPower에 따른 필드 추가
    if (jobStat.mainPower === "공격력") {
      filteredComparison.attack_power = fullComparison.attack_power;
      filteredComparison.attack_power_rate = fullComparison.attack_power_rate;
    } else if (jobStat.mainPower === "마력") {
      filteredComparison.magic_power = fullComparison.magic_power;
      filteredComparison.magic_power_rate = fullComparison.magic_power_rate;
    }

    return filteredComparison;
  }

  /**
   * ItemEquipment에서 필요한 데이터를 추출하고 정제합니다.
   */
  private refineItemData(item: ItemEquipment): RefinedItemData {
    const potentialOptions = [
      item.potential_option_1,
      item.potential_option_2,
      item.potential_option_3,
      item.additional_potential_option_1,
      item.additional_potential_option_2,
      item.additional_potential_option_3,
    ].filter((option) => option && option !== "");

    const refinedData: RefinedItemData = {
      str: item.item_total_option.str,
      dex: item.item_total_option.dex,
      int: item.item_total_option.int,
      luk: item.item_total_option.luk,
      max_hp: item.item_total_option.max_hp,
      max_hp_rate: item.item_total_option.max_hp_rate,
      starforce: item.starforce,
      item_icon: item.item_icon,
      magic_power: item.item_total_option.magic_power,
      attack_power: item.item_total_option.attack_power,
      str_rate: "0",
      dex_rate: "0",
      int_rate: "0",
      luk_rate: "0",
      allstat_rate: item.item_total_option.all_stat,
      ignore_monster_armor: item.item_total_option.ignore_monster_armor,
      magic_power_rate: "0",
      attack_power_rate: "0",
      critical_damage_rate: "0",
      boss_damage_rate: item.item_total_option.boss_damage,
    };

    // Potential 옵션들을 파싱하여 값들을 계산
    potentialOptions.forEach((option) => {
      // 마력 +* (고정값)
      const magicPowerMatch = option.match(/마력 \+(\d+)/);
      if (magicPowerMatch) {
        const currentValue = parseInt(refinedData.magic_power) || 0;
        const newValue = parseInt(magicPowerMatch[1]) || 0;
        refinedData.magic_power = (currentValue + newValue).toString();
      }

      // 공격력 +* (고정값)
      const attackPowerMatch = option.match(/공격력 \+(\d+)/);
      if (attackPowerMatch) {
        const currentValue = parseInt(refinedData.attack_power) || 0;
        const newValue = parseInt(attackPowerMatch[1]) || 0;
        refinedData.attack_power = (currentValue + newValue).toString();
      }

      // STR +*%
      const strRateMatch = option.match(/STR \+(\d+)%/);
      if (strRateMatch) {
        const currentValue = parseInt(refinedData.str_rate) || 0;
        const newValue = parseInt(strRateMatch[1]) || 0;
        refinedData.str_rate = (currentValue + newValue).toString();
      }

      // DEX +*%
      const dexRateMatch = option.match(/DEX \+(\d+)%/);
      if (dexRateMatch) {
        const currentValue = parseInt(refinedData.dex_rate) || 0;
        const newValue = parseInt(dexRateMatch[1]) || 0;
        refinedData.dex_rate = (currentValue + newValue).toString();
      }

      // INT +*%
      const intRateMatch = option.match(/INT \+(\d+)%/);
      if (intRateMatch) {
        const currentValue = parseInt(refinedData.int_rate) || 0;
        const newValue = parseInt(intRateMatch[1]) || 0;
        refinedData.int_rate = (currentValue + newValue).toString();
      }

      // LUK +*%
      const lukRateMatch = option.match(/LUK \+(\d+)%/);
      if (lukRateMatch) {
        const currentValue = parseInt(refinedData.luk_rate) || 0;
        const newValue = parseInt(lukRateMatch[1]) || 0;
        refinedData.luk_rate = (currentValue + newValue).toString();
      }

      // 모든 스탯 +*%
      const allstatRateMatch = option.match(/올스탯 \+(\d+)%/);
      if (allstatRateMatch) {
        const currentValue = parseInt(refinedData.allstat_rate) || 0;
        const newValue = parseInt(allstatRateMatch[1]) || 0;
        refinedData.allstat_rate = (currentValue + newValue).toString();
      }

      // 몬스터 방어율 무시 +*%
      const ignoreArmorMatch = option.match(/몬스터 방어율 무시 \+(\d+)%/);
      if (ignoreArmorMatch) {
        const currentValue = parseInt(refinedData.ignore_monster_armor) || 0;
        const newValue = parseInt(ignoreArmorMatch[1]) || 0;
        refinedData.ignore_monster_armor = (currentValue + newValue).toString();
      }

      // 마력 +*%
      const magicPowerRateMatch = option.match(/마력 \+(\d+)%/);
      if (magicPowerRateMatch) {
        const currentValue = parseInt(refinedData.magic_power_rate) || 0;
        const newValue = parseInt(magicPowerRateMatch[1]) || 0;
        refinedData.magic_power_rate = (currentValue + newValue).toString();
      }

      // 공격력 +*%
      const attackPowerRateMatch = option.match(/공격력 \+(\d+)%/);
      if (attackPowerRateMatch) {
        const currentValue = parseInt(refinedData.attack_power_rate) || 0;
        const newValue = parseInt(attackPowerRateMatch[1]) || 0;
        refinedData.attack_power_rate = (currentValue + newValue).toString();
      }

      // 크리티컬 데미지 +*%
      const criticalDamageMatch = option.match(/크리티컬 데미지 \+(\d+)%/);
      if (criticalDamageMatch) {
        const currentValue = parseInt(refinedData.critical_damage_rate) || 0;
        const newValue = parseInt(criticalDamageMatch[1]) || 0;
        refinedData.critical_damage_rate = (currentValue + newValue).toString();
      }

      // 보스 몬스터 데미지 +*% 혹은 보스 공격 시 몬스터 데미지 +*
      const bossDamageMatch_1 = option.match(/보스 몬스터 데미지 \+(\d+)%/);
      const bossDamageMatch_2 = option.match(/보스 공격 시 몬스터 데미지 \+(\d+)%/);
      const realBossDamage = parseInt(bossDamageMatch_1?.[1] ?? "0") + parseInt(bossDamageMatch_2?.[1] ?? "0");
      if (realBossDamage) {
        const currentValue = parseInt(refinedData.boss_damage_rate) || 0;
        const newValue = realBossDamage || 0;
        refinedData.boss_damage_rate = (currentValue + newValue).toString();
      }
    });

    // "0"인 필드들을 제거 (실제로는 "0"으로 유지하되, 필요시 필터링 가능)
    return refinedData;
  }

  /**
   * ItemEquipment에서 필요한 데이터를 추출합니다.
   */
  private extractItemData(item: ItemEquipment) {
    return {
      // item_total_option에서 추출
      str: item.item_total_option.str,
      dex: item.item_total_option.dex,
      int: item.item_total_option.int,
      luk: item.item_total_option.luk,
      max_hp: item.item_total_option.max_hp,
      attack_power: item.item_total_option.attack_power,
      magic_power: item.item_total_option.magic_power,
      boss_damage: item.item_total_option.boss_damage,
      ignore_monster_armor: item.item_total_option.ignore_monster_armor,
      all_stat: item.item_total_option.all_stat,
      max_hp_rate: item.item_total_option.max_hp_rate,

      // starforce 필드
      starforce: item.starforce,

      // potential options
      potential_option_1: item.potential_option_1,
      potential_option_2: item.potential_option_2,
      potential_option_3: item.potential_option_3,
      additional_potential_option_1: item.additional_potential_option_1,
      additional_potential_option_2: item.additional_potential_option_2,
      additional_potential_option_3: item.additional_potential_option_3,
      item_icon: item.item_icon,
    };
  }

  /**
   * 아이템 비교 결과에 대한 점수를 계산합니다.
   */
  private calculateScore(comparison: ItemComparisonResult["comparison"]): number {
    const jobStat = JOB_STAT[this.character_class];
    if (!jobStat) return 0;

    let score = 0;

    // 공통 필드들 (모든 직업에 중요)
    score += comparison.boss_damage_rate * 1.2;
    score += comparison.critical_damage_rate * 3.5;
    score += comparison.ignore_monster_armor * 0.5;
    score += comparison.starforce * 4;

    // mainStat에 따른 가중치 적용
    switch (jobStat.mainStat) {
      case "str":
        score += (comparison.str || 0) * 0.5; // 주스탯 1
        score += (comparison.str_rate || 0) * 4.5; // 주스탯 1% = 주스탯 1 * 10
        break;
      case "dex":
        score += (comparison.dex || 0) * 0.5;
        score += (comparison.dex_rate || 0) * 4.5;
        break;
      case "int":
        score += (comparison.int || 0) * 0.5;
        score += (comparison.int_rate || 0) * 4.5;
        break;
      case "luk":
        score += (comparison.luk || 0) * 0.5;
        score += (comparison.luk_rate || 0) * 4.5;
        break;
      case "hp":
        score += (comparison.max_hp || 0) * 0.5;
        score += (comparison.max_hp_rate || 0) * 4.5;
        break;
      case "str+dex+luk":
        score += (comparison.str || 0) * 0.5;
        score += (comparison.dex || 0) * 0.5;
        score += (comparison.luk || 0) * 0.5;
        score += (comparison.str_rate || 0) * 3.5;
        score += (comparison.dex_rate || 0) * 3.5;
        score += (comparison.luk_rate || 0) * 3.5;
        break;
    }

    // 올스탯은 hp가 mainStat인 직업을 제외하고 모두 더한다.
    if (jobStat.mainStat !== "hp") {
      score += (comparison.allstat_rate || 0) * 4.7;
    }

    // mainPower에 따른 가중치 적용
    switch (jobStat.mainPower) {
      case "공격력":
        score += (comparison.attack_power || 0) * 1.6;
        score += (comparison.attack_power_rate || 0) * 15;
        break;
      case "마력":
        score += (comparison.magic_power || 0) * 1.6;
        score += (comparison.magic_power_rate || 0) * 15;
        break;
    }
    return Math.round(score * 100) / 100; // 소수점 둘째 자리까지 반올림
  }
}
