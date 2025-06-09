import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Header } from "@/components/Header";
import { pretendard } from "./fonts/pretendard";
import { Modal } from "@/components/Modal";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "MapleGround: 메이플그라운드",
  description: "메이플 캐릭터 정보, 경험치 효율 비교, 잠재능력 시뮬레이션, 스타포스 시뮬레이션",
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
      <body className={`${pretendard.variable} font-pretendard bg-white dark:bg-[#131313] min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Header />
          <Modal />
          <main className="flex-1">{children}</main>
          <footer className="flex justify-center items-center py-4 border-t border-slate-200 dark:border-white/10">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2025 메이플그라운드. All rights reserved. | Data based on <span className="font-bold">NEXON Open API</span>
            </p>
          </footer>
        </ThemeProvider>
        <Script src="https://openapi.nexon.com/js/analytics.js?app_id=208681" />
      </body>
    </html>
  );
}
