// 보스 "강렬한 힘의 결정" 판매가격 (메소) + 보스 이미지.
// 나중에 보스 수익 메뉴에서 (보스, 난이도) → 가격 / 이미지 조회에 사용한다.

import type { StaticImageData } from "next/image";
import cygnusImg from "@/images/시그너스.png";
import hillaImg from "@/images/힐라.png";
import pinkBeanImg from "@/images/카오스핑크빈.png";
import zakumImg from "@/images/자쿰.png";
import bloodyQueenImg from "@/images/블러디퀸.png";
import vanvanImg from "@/images/반반.png";
import pierreImg from "@/images/피에르.png";
import magnusImg from "@/images/매그너스.png";
import vonLeonImg from "@/images/벨룸.png";
import papulatusImg from "@/images/카오스파풀라투스.png";
import suuImg from "@/images/스우.png";
import damienImg from "@/images/데미안.png";
import gasImg from "@/images/가디언엔젤슬라임.png";
import lucidImg from "@/images/루시드.png";
import willImg from "@/images/윌.png";
import duskImg from "@/images/더스크.png";
import dunkelImg from "@/images/듄켈.png";
import jinHillaImg from "@/images/진힐라.png";
import serenImg from "@/images/세렌.png";
import kalosImg from "@/images/칼로스.png";
import kaneshiroImg from "@/images/대적자.png";
import karingImg from "@/images/카링.png";
import banshadowImg from "@/images/찬란한흉성.png";
import limboImg from "@/images/림보.png";
import baldrixImg from "@/images/발드릭스.png";
import jupiterImg from "@/images/유피테르.png";
import blackMageImg from "@/images/검은마법사.png";

export const BOSS_DIFFICULTIES = ["EASY", "NORMAL", "HARD", "CHAOS", "EXTREME"] as const;
export type BossDifficulty = (typeof BOSS_DIFFICULTIES)[number];

// 정규화 키 → 한글 라벨
export const BOSS_DIFFICULTY_LABEL: Record<BossDifficulty, string> = {
  EASY: "이지",
  NORMAL: "노멀",
  HARD: "하드",
  CHAOS: "카오스",
  EXTREME: "익스트림",
};

// 한글 라벨 → 정규화 키. 외부 데이터(API 응답 등) 를 내부 상수로 끌어올 때 사용.
export const BOSS_DIFFICULTY_BY_LABEL: Record<string, BossDifficulty> = {
  이지: "EASY",
  노멀: "NORMAL",
  하드: "HARD",
  카오스: "CHAOS",
  익스트림: "EXTREME",
};

// 보스별 (난이도 → 강렬한 힘의 결정 가격) 매핑.
// 등재되지 않은 난이도는 해당 보스가 그 난이도를 제공하지 않는다는 뜻.
export const BOSS_CRYSTAL_PRICES: Record<string, Partial<Record<BossDifficulty, number>>> = {
  자쿰: { CHAOS: 8_080_000 },
  블러디퀸: { CHAOS: 8_140_000 },
  반반: { CHAOS: 8_150_000 },
  피에르: { CHAOS: 8_170_000 },
  매그너스: { HARD: 8_560_000 },
  벨룸: { CHAOS: 9_280_000 },
  파풀라투스: { CHAOS: 13_100_000 },
  스우: { NORMAL: 16_700_000, HARD: 51_500_000, EXTREME: 574_000_000 },
  데미안: { NORMAL: 17_500_000, HARD: 48_900_000 },
  "가디언 엔젤 슬라임": { NORMAL: 25_500_000, CHAOS: 75_100_000 },
  루시드: { EASY: 29_800_000, NORMAL: 35_600_000, HARD: 62_900_000 },
  윌: { EASY: 32_300_000, NORMAL: 41_100_000, HARD: 77_100_000 },
  더스크: { NORMAL: 44_000_000, CHAOS: 69_800_000 },
  듄켈: { NORMAL: 47_500_000, HARD: 94_400_000 },
  "진 힐라": { NORMAL: 71_200_000, HARD: 106_000_000 },
  "선택받은 세렌": { NORMAL: 239_000_000, HARD: 356_000_000, EXTREME: 2_835_000_000 },
  "감시자 칼로스": { EASY: 280_000_000, NORMAL: 505_000_000, CHAOS: 1_273_000_000, EXTREME: 4_104_000_000 },
  "최초의 대적자": { EASY: 308_000_000, NORMAL: 560_000_000, HARD: 1_435_000_000, EXTREME: 4_712_000_000 },
  카링: { EASY: 377_000_000, NORMAL: 678_000_000, HARD: 1_739_000_000, EXTREME: 5_387_000_000 },
  "찬란한 흉성": { NORMAL: 625_000_000, HARD: 2_678_000_000 },
  림보: { NORMAL: 1_026_000_000, HARD: 2_385_000_000 },
  발드릭스: { NORMAL: 1_368_000_000, HARD: 3_078_000_000 },
  유피테르: { NORMAL: 1_615_000_000, HARD: 4_845_000_000 },
  "검은 마법사": { HARD: 665_000_000, EXTREME: 8_740_000_000 },
};

export type BossCrystalEntry = { boss: string; difficulty: BossDifficulty; price: number };

// (보스, 난이도, 가격) 플랫 리스트. 가격순 정렬 등 iteration 용도로 사용.
export const BOSS_CRYSTALS: ReadonlyArray<BossCrystalEntry> = Object.entries(BOSS_CRYSTAL_PRICES).flatMap(([boss, priceByDifficulty]) =>
  (Object.entries(priceByDifficulty) as Array<[BossDifficulty, number]>).map(([difficulty, price]) => ({
    boss,
    difficulty,
    price,
  }))
);

export const getBossCrystalPrice = (boss: string, difficulty: BossDifficulty): number | null => {
  return BOSS_CRYSTAL_PRICES[boss]?.[difficulty] ?? null;
};

// 인게임 보스별 파티원 수 상한. 등재되지 않은 보스는 기본값(`DEFAULT_MAX_PARTY_SIZE`) 적용.
// 일부 신규 보스(유피테르/발드릭스/림보/찬란한 흉성/카링/최초의 대적자) 는 인게임에서 3인까지만 입장 가능.
export const DEFAULT_MAX_PARTY_SIZE = 6;
export const BOSS_MAX_PARTY_SIZE_OVERRIDE: Record<string, number> = {
  "최초의 대적자": 3,
  카링: 3,
  "찬란한 흉성": 3,
  림보: 3,
  발드릭스: 3,
  유피테르: 3,
};

export const getBossMaxPartySize = (boss: string): number => BOSS_MAX_PARTY_SIZE_OVERRIDE[boss] ?? DEFAULT_MAX_PARTY_SIZE;

// 보스명 → 이미지. 키는 BOSS_CRYSTAL_PRICES 의 키와 1:1 대응.
// 핑크빈/파풀라투스 는 사용 가능한 에셋이 카오스 버전뿐이라 동일 이미지를 재사용한다.
export const BOSS_IMAGES: Record<string, StaticImageData> = {
  시그너스: cygnusImg,
  힐라: hillaImg,
  핑크빈: pinkBeanImg,
  자쿰: zakumImg,
  블러디퀸: bloodyQueenImg,
  반반: vanvanImg,
  피에르: pierreImg,
  매그너스: magnusImg,
  벨룸: vonLeonImg,
  파풀라투스: papulatusImg,
  스우: suuImg,
  데미안: damienImg,
  "가디언 엔젤 슬라임": gasImg,
  루시드: lucidImg,
  윌: willImg,
  더스크: duskImg,
  듄켈: dunkelImg,
  "진 힐라": jinHillaImg,
  "선택받은 세렌": serenImg,
  "감시자 칼로스": kalosImg,
  "최초의 대적자": kaneshiroImg,
  카링: karingImg,
  "찬란한 흉성": banshadowImg,
  림보: limboImg,
  발드릭스: baldrixImg,
  유피테르: jupiterImg,
  "검은 마법사": blackMageImg,
};

export const getBossImage = (boss: string): StaticImageData | null => BOSS_IMAGES[boss] ?? null;
