import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { Header } from "@/components/Header";
import { pretendard } from "./fonts/pretendard";
import { Modal } from "@/components/Modal";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { NoticeModal } from "@/components/NoticeModal";
import Image from "next/image";
import MainBackgroundImg from "@/images/main_background.png";

export const metadata: Metadata = {
  title: "MapleGround: 메이플그라운드",
  description:
    "메이플 캐릭터 정보, 경험치 효율 비교, 잠재능력 시뮬레이션, 스타포스 시뮬레이션, 제네시스 해방 날짜 계산, 데스티니 해방 날짜 계산",
  openGraph: {
    title: "MapleGround: 메이플그라운드",
    description: "메이플 캐릭터 정보, 잠재능력-스타포스 시뮬레이션, 경험치 효율 비교, 제네시스-데스티니 해방 날짜 계산",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <meta name="naver-site-verification" content="101f51f334f08a591bbe05f2cabd51ae4bd382d1" />
      <body className={`${pretendard.variable} font-pretendard bg-white dark:bg-[#131313] min-h-screen flex flex-col`}>
        {/* 공통 배경 이미지 */}
        <div className="fixed inset-0 w-full h-full -z-50">
          <Image src={MainBackgroundImg} alt="background" fill priority className="object-cover" unoptimized />
          {/* 배경 오버레이 */}
          <div className="absolute inset-0 bg-black/10 dark:bg-black/50" />
        </div>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Header />
          <Modal />
          <NoticeModal />
          <main className="flex-1">{children}</main>
          <footer className="flex justify-center items-center py-4">
            <div className="footer flex gap-1 text-sm text-white dark:text-slate-400">
              <p>© 2025 메이플그라운드. All rights reserved.</p>
              <p className="text-sky-400">
                Data based on <span className="font-bold">NEXON Open API</span>
              </p>
            </div>
          </footer>
        </ThemeProvider>
        <Analytics />
        <Script src="https://openapi.nexon.com/js/analytics.js?app_id=208681" />
      </body>
    </html>
  );
}
