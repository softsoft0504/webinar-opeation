import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workshop Q&A",
  description: "워크숍 Q&A 대기열 타이머 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
