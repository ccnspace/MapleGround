import { SideBar } from "@/components/SideBar";
import { Suspense } from "react";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      <div className="root_container flex flex-row gap-4 justify-center">
        <SideBar />
        {children}
      </div>
    </Suspense>
  );
}
