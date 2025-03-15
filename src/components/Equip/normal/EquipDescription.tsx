import Image from "next/image";

type Props = {
  item_icon: string;
  item_name: string;
  baseLevel?: number;
};

// TODO: 추옵 정보/주흔 작 등 다양한 정보를 간략화하여 제공
export const EquipDescription = ({ item_icon, item_name, baseLevel }: Props) => {
  return (
    <>
      <p className="flex justify-center text-white text-base font-medium">{item_name}</p>
      <div className="flex flex-row items-center gap-2">
        <div
          className="flex items-center justify-center rounded-lg
          min-w-[72px] min-h-[72px]
        bg-gray-600 dark:bg-gray-800 mt-1 pt-3 pb-3 px-3"
        >
          <Image
            src={item_icon}
            unoptimized
            style={{
              height: "42px",
              width: "auto",
            }}
            width={42}
            height={42}
            alt={item_name}
          />
        </div>
        {!!baseLevel && <div className="flex items-start text-xs text-white">· reqLevel: {baseLevel}</div>}
      </div>
    </>
  );
};
