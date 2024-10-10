import type { AndroidEquipment } from "@/types/AndroidEquipment";
import { ItemEquipment } from "@/types/Equipment";
import Image from "next/image";
import { StarIcon } from "../svg/StarIcon";
import { SymbolOption } from "@/types/SymbolEquipment";
import { memo, MouseEvent } from "react";
import { CharacterEquipments } from "@/hooks/useCharacterInfo";

const ItemIcon = ({ item }: { item: ItemEquipment }) => (
  <Image
    src={item?.item_icon}
    alt={item?.item_equipment_part}
    unoptimized
    width={52}
    height={60}
    style={{ width: "auto", height: "auto" }}
  />
);

const AndroidIcon = ({ icon }: { icon: AndroidEquipment["android_icon"] }) => (
  <Image
    src={icon as string}
    alt={"안드로이드"}
    unoptimized
    width={52}
    height={60}
    style={{ width: "auto", height: "auto" }}
  />
);

const StarForceBadge = ({ item }: { item: ItemEquipment }) => {
  const starforce = parseInt(item?.starforce);
  const isAmazingForce = item?.starforce_scroll_flag === "사용";

  if (!item?.starforce || (!isAmazingForce && starforce < 17)) return null;

  const forceKey = (() => {
    if (isAmazingForce) return "amazing";
    if (starforce >= 17 && starforce < 22) return "17+";
    if (starforce === 22) return "22";
    if (starforce === 23) return "23";
    if (starforce === 24) return "24";
    return "25";
  })();

  const starforceStyle = {
    amazing: "bg-slate-500 text-blue-200",
    "17+": "bg-blue-500",
    "22": "bg-lime-600",
    "23": "bg-purple-900",
    "24": "bg-pink-800",
    "25": "bg-slate-800",
  };

  return (
    <div
      className={`absolute flex items-center shadow top-0 left-0 font-medium text-white rounded-sm
          text-xs px-0.5 pt-0.25 pb-0.25 ${starforceStyle[forceKey]}`}
    >
      <StarIcon size={"size-3"} isAmazingForce={isAmazingForce} />
      {`${starforce}`}
    </div>
  );
};

const potentialStyle: Record<string, string> = {
  레전드리: "border-2 border-lime-400",
  유니크: "border-2 border-yellow-400",
  에픽: "border-2 border-purple-500",
  레어: "border-2 border-sky-400",
};

const commonEquipStyle =
  "flex relative justify-center items-center bg-slate-300 dark:bg-[#4f515a] w-16 h-16 rounded-md cursor-pointer";

type EquipItemProps = {
  name: string;
  equipData: Record<string, ItemEquipment> | undefined;
  customClass?: string;
};
const Equipment = ({ name, equipData, customClass }: EquipItemProps) => {
  const getPotentialStyle = (name: string) => {
    const potentialTitle = equipData?.[name]?.potential_option_grade;
    return equipData && potentialTitle && potentialStyle[potentialTitle];
  };
  return (
    <div
      id={name}
      className={`${getPotentialStyle(
        name
      )} ${commonEquipStyle} ${customClass}`}
    >
      {equipData?.[name] && (
        <>
          <StarForceBadge item={equipData[name]} />
          <ItemIcon item={equipData[name]} />
        </>
      )}
    </div>
  );
};

const AndroidEquipment = ({
  equipData,
}: {
  equipData: AndroidEquipment | undefined;
}) => {
  return (
    <div id={"안드로이드"} className={`${commonEquipStyle}`}>
      {equipData?.android_icon && <AndroidIcon icon={equipData.android_icon} />}
    </div>
  );
};

const SymbolEquipment = ({
  symbol,
  type,
}: {
  symbol: SymbolOption | undefined;
  type: "arcane" | "authentic";
}) => {
  const symbolLevel = symbol?.symbol_level ?? 0;
  const isMaxLevel =
    type === "arcane" ? symbolLevel === 20 : symbolLevel === 11;

  return (
    <div
      id={symbol?.symbol_name}
      className={`flex flex-col justify-center items-center gap-1 w-[50px] cursor-pointer
      px-2 pt-1 pb-1 rounded-md bg-slate-300 dark:bg-[#4f515a] ${
        isMaxLevel ? "border-2 border-purple-300" : ""
      }`}
    >
      {!!symbol?.symbol_icon && (
        <>
          <Image
            src={symbol.symbol_icon}
            unoptimized
            width={30}
            height={30}
            alt={symbol?.symbol_name ?? ""}
          />
          <p
            className={`rounded-sm font-bold px-0.5 pt-0.25 pb-0.25
            text-xs text-slate-800 dark:text-white `}
          >
            {`LV.${symbol?.symbol_level}`}
          </p>
        </>
      )}
    </div>
  );
};

type Props = {
  equipments?: CharacterEquipments;
  setSelectedEquipName: (name: string) => void;
};
export const EquipInventory = memo((props: Props) => {
  const { equipments, setSelectedEquipName } = props;
  const {
    normal,
    android,
    arcaneSymbol = {},
    authenticSymbol = {},
  } = equipments || {};

  const arcaneSymbolList = Object.values(arcaneSymbol);
  const authenticSymbolList = Object.values(authenticSymbol);
  const hasSymbol = !!arcaneSymbolList.length || !!authenticSymbolList.length;

  const handleClickIcon = (e: MouseEvent) => {
    const target = e.target as Element;
    const id = target.id || target.parentElement?.id;
    if (!id) return;
    setSelectedEquipName(id);
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div
        onClick={handleClickIcon}
        className="grid grid-cols-5 grid-flow-row gap-2"
      >
        <Equipment name="반지4" equipData={normal} />
        <Equipment
          name="모자"
          equipData={normal}
          customClass="col-start-3 col-end-5"
        />
        <Equipment name="엠블렘" equipData={normal} />
        <Equipment name="반지3" equipData={normal} />
        <Equipment name="펜던트2" equipData={normal} />
        <Equipment
          name="얼굴장식"
          equipData={normal}
          customClass="col-start-3 col-end-5"
        />
        <Equipment name="뱃지" equipData={normal} />
        <Equipment name="반지2" equipData={normal} />
        <Equipment name="펜던트" equipData={normal} />
        <Equipment name="눈장식" equipData={normal} />
        <Equipment name="귀고리" equipData={normal} />
        <Equipment name="훈장" equipData={normal} />

        <Equipment name="반지1" equipData={normal} />
        <Equipment name="무기" equipData={normal} />
        <Equipment name="상의" equipData={normal} />
        <Equipment name="어깨장식" equipData={normal} />
        <Equipment name="보조무기" equipData={normal} />

        <Equipment name="포켓 아이템" equipData={normal} />
        <Equipment name="벨트" equipData={normal} />
        <Equipment name="하의" equipData={normal} />
        <Equipment name="장갑" equipData={normal} />
        <Equipment name="망토" equipData={normal} />
        <Equipment name="신발" equipData={normal} customClass="col-start-3" />
        <AndroidEquipment equipData={android} />
        <Equipment name="기계 심장" equipData={normal} />
      </div>
      {hasSymbol && (
        <div className="flex mr-auto">
          <p
            className="flex font-bold text-sm px-2 pb-1 pt-1
         border-l-4 border-l-purple-300"
          >
            심볼 아이템
          </p>
        </div>
      )}
      <div
        onClick={handleClickIcon}
        className="flex flex-col mt-3 items-start gap-2"
      >
        <div className="flex flex-row gap-1.5">
          {Object.values(arcaneSymbol)?.map((item) => (
            <SymbolEquipment
              key={item.symbol_name}
              symbol={item}
              type="arcane"
            />
          ))}
        </div>
        <div className="flex flex-row gap-1.5">
          {Object.values(authenticSymbol)?.map((item) => (
            <SymbolEquipment
              key={item.symbol_name}
              symbol={item}
              type="authentic"
            />
          ))}
        </div>
      </div>
    </div>
  );
});
EquipInventory.displayName = "EquipInventory";
