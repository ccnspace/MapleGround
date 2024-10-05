import { CalendarIcon } from "@/components/svg/CalendarIcon";
import Image from "next/image";
import pesronShadow from "@/images/1.png";

type Props = {
  direction?: "left" | "right";
};
export const CharacterCard = ({ direction }: Props) => {
  const alignStyle = direction === "right" ? "ml-auto" : "";

  return (
    <div
      style={{
        background:
          "conic-gradient(#dfe6ee 25%, #e6ebf1 25% 50%, #dfe6ee 50% 75%, #e6ebf1 75%)",
        backgroundSize: "30px 30px",
      }}
      className="flex flex-col px-3 pt-3 pb-3 w-full h-full
   bg-slate-300 border-2 border-slate-400
   rounded-lg"
    >
      <div
        className={`flex rounded-lg bg-slate-400
    border border-slate-400 px-2 pt-3 pb-3 w-72 cursor-pointer
    hover:bg-slate-500 transition-colors ${alignStyle}`}
      >
        <CalendarIcon />
      </div>
      <Image
        className={alignStyle}
        style={direction === "left" ? { transform: "scale(-1, 1)" } : {}}
        src={pesronShadow}
        alt="person"
        unoptimized
        width={256}
      />
    </div>
  );
};
