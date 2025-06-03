import { SideBar } from "@/components/SideBar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="root_container flex flex-row gap-4 justify-center">
      <SideBar />
      {children}
    </div>
  );
}
