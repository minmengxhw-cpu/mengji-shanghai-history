import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const description = "面向第二届民盟传统教育基地讲解员比赛的上海盟史故事、人物、点位与现场线路资料库。";
  return {
    metadataBase: new URL(origin),
    title: "盟迹 · 上海民盟历史点位讲解员备赛资料库",
    description,
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "盟迹 · 上海民盟历史点位",
      description,
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1731, height: 909, alt: "盟迹 · 上海民盟历史点位讲解员备赛资料库" }],
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
