import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POS System | 收銀管理系統",
  description: "全通路零售 POS 系統 - 收銀、庫存、會員、報表一站搞定",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}