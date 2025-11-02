import { CommonWrapper } from "@/components/Container/CommonWrapper";
import { CommonTitle } from "@/components/Container/CommonTitle";

export default function Page() {
  return (
    <div>
      <CommonWrapper>
        <div className="flex max-[600px]:pt-0.5 px-2 w-[1366px] flex-col max-[600px]:w-full max-[600px]:px-0.5 gap-5">
          <div className="flex flex-col gap-4">
            <CommonTitle title="↗️ 마이메이플">
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">UPDATED</span>
            </CommonTitle>
          </div>
        </div>
      </CommonWrapper>
    </div>
  );
}
