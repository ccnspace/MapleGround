import { CommonTitle } from "@/components/Container/CommonTitle";
import { CommonWrapper } from "@/components/Container/CommonWrapper";
import { TabItem } from "@/components/My/TabItem";
import { SideBar } from "@/components/SideBar";
import { Suspense } from "react";

export const tabList = [
  {
    title: "캐릭터 목록",
    src: "/my/characters",
  },
  {
    title: "스타포스 기록",
    src: "/my/starforce",
  },
  {
    title: "잠재능력 재설정 기록",
    src: "/my/potential",
  },
] as const satisfies { title: string; src: string }[];

export default function MyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      <div className="root_container flex flex-row gap-4 justify-center">
        <SideBar />
        <div className="flex gap-4">
          <CommonWrapper>
            <div className="flex max-[600px]:pt-0.5 px-2 w-[1366px] flex-col max-[600px]:w-full max-[600px]:px-0.5 gap-5">
              <div className="flex flex-col gap-4">
                <CommonTitle title="↗️ 마이메이플">
                  <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">UPDATED</span>
                </CommonTitle>
              </div>
              <div className="flex gap-4">
                {tabList.map((tab) => (
                  <TabItem key={tab.src} title={tab.title} src={tab.src} />
                ))}
              </div>
              {children}
            </div>
          </CommonWrapper>
        </div>
      </div>
    </Suspense>
  );
}
