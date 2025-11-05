import icon_1 from "@/images/icon_1.png";
import icon_2 from "@/images/icon_2.png";
import icon_3 from "@/images/icon_3.png";
import icon_4 from "@/images/icon_4.png";
import icon_5 from "@/images/icon_5.png";
import icon_6 from "@/images/icon_6.png";
import icon_7 from "@/images/icon_7.png";
import icon_8 from "@/images/icon_8.png";
import icon_9 from "@/images/icon_9.png";
import icon_10 from "@/images/icon_10.png";
import icon_11 from "@/images/icon_11.png";
import icon_12 from "@/images/icon_12.png";
import icon_13 from "@/images/icon_13.png";
import icon_14 from "@/images/icon_14.png";
import icon_15 from "@/images/icon_15.png";
import { StaticImageData } from "next/image";

export const WORLDS: Record<string, StaticImageData> = {
  오로라: icon_1,
  레드: icon_2,
  이노시스: icon_3,
  유니온: icon_4,
  스카니아: icon_5,
  루나: icon_6,
  제니스: icon_7,
  크로아: icon_8,
  베라: icon_9,
  엘리시움: icon_10,
  아케인: icon_11,
  노바: icon_12,
  챌린저스: icon_13,
  에오스: icon_14,
  핼리오스: icon_15,
} as const;

export const getWorldIcon = (world: string) => WORLDS[world as keyof typeof WORLDS] ?? null;
