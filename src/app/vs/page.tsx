import { PlainBox } from "@/components/PlainBox";
import { InfoIcon } from "@/components/svg/InfoIcon";
import { CharacterCard } from "./CharacterCard";

export default function Page() {
  return (
    <div className="flex px-5 pt-8 w-full flex-col">
      <div className="flex flex-col gap-3">
        <p className="text-4xl font-bold">과거의 나와 대결!</p>
        <PlainBox>
          <p className="flex items-center gap-1 justify-center font-medium text-slate-700">
            <InfoIcon />
            사용 전 확인!
          </p>
        </PlainBox>
      </div>
      <div className="flex flex-row gap-3 mt-5">
        <CharacterCard type="first" direction="left" />
        <CharacterCard type="second" direction="right" />
      </div>
    </div>
  );
}
