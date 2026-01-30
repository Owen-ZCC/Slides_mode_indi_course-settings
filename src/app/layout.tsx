import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "互动课件编辑器 - Enspeak",
  description: "创建互动式教学课件，支持AI生成、PPT导入、多种互动工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
