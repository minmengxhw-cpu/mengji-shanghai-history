import type { Metadata } from "next";
import "./globals.css";

export function generateMetadata(): Metadata {
  const origin = process.env.GITHUB_PAGES === "true"
    ? "https://minmengxhw-cpu.github.io/mengji-shanghai-history"
    : "https://mengji-shanghai-history.minmengxhw.chatgpt.site";
  const description = "收录66处上海民盟历史点位、16处传统教育基地，以及相关人物、事件与完整故事。";
  return {
    metadataBase: new URL(origin),
    title: "盟迹 · 上海民盟历史知识库",
    description,
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "盟迹 · 上海民盟历史点位",
      description,
      type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "盟迹 · 上海民盟历史知识库" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "盟迹 · 上海民盟历史点位",
      description,
      images: ["/og.png"],
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
