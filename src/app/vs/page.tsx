import { PlainBox } from "@/components/PlainBox";
import { InfoIcon } from "@/components/svg/InfoIcon";
import { ReportContainer } from "./Report";

export default function Page() {
  return (
    <div className="flex px-5 pt-8 w-full flex-col">
      <div className="flex flex-col gap-3">
        <p className="text-2xl font-bold">과거의 나와 대결</p>
        <PlainBox>
          <div className="flex flex-col gap-2">
            <p className="flex gap-1 items-center font-bold text-slate-700">
              <InfoIcon />
              사용 전 확인!
            </p>
            <p className="font-medium">
              {"• 왼쪽에서 캐릭터명을 검색한 뒤,"}{" "}
              <span className="underline underline-offset-4 decoration-2 decoration-sky-600">
                내 캐릭터가 설정되어 있는 상태
              </span>
              여야 합니다.
            </p>
            <p className="-mt-1 font-medium">
              {"• 첫 번째 캐릭터의 날짜를 두 번째보다 "}
              <span className="underline underline-offset-4 decoration-2 decoration-sky-600">
                과거로 설정
              </span>
              {"해 주세요."}
            </p>
          </div>
        </PlainBox>
      </div>
      <ReportContainer />
    </div>
  );
}
