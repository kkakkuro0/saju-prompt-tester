import "./globals.css";
import { Noto_Sans_KR } from "next/font/google";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
});

export const metadata = {
  title: "사주 프롬프트 테스터",
  description: "사주팔자 AI 프롬프트 테스트 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} font-sans`}>
        <div className="min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
