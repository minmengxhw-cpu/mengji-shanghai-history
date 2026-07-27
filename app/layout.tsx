import type { Metadata } from "next";
import "./globals.css";

export function generateMetadata(): Metadata {
  const origin = process.env.GITHUB_PAGES === "true"
    ? "https://minmengxhw-cpu.github.io/mengji-shanghai-history"
    : "https://mengji-shanghai-history.minmengxhw.chatgpt.site";
  const description = "收录51处上海民盟历史点位、16处传统教育基地及其人物、事件与完整故事的知识库。";
  return {
    metadataBase: new URL(origin),
    title: "盟迹 · 上海民盟历史知识库",
    description,
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "盟迹 · 上海民盟历史点位",
      description,
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1731, height: 909, alt: "盟迹 · 51处上海民盟历史点位数字索引" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "盟迹 · 上海民盟历史点位",
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
