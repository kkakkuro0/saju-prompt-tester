import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "GPT 프롬프트 테스터",
  description: "사내용 GPT 프롬프트 테스트 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* 헤더 */}
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Link href="/" className="text-xl font-bold text-gray-900">
                    GPT 프롬프트 테스터
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/profile"
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    프로필
                  </Link>
                  <button className="text-sm text-gray-700 hover:text-gray-900">
                    로그아웃
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="flex">
            {/* 사이드바 */}
            <aside className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)] sticky top-16">
              <nav className="px-4 py-6 space-y-1">
                <Link
                  href="/dashboard"
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-50"
                >
                  <svg
                    className="w-5 h-5 mr-3 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  대시보드
                </Link>
                <Link
                  href="/projects"
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-50"
                >
                  <svg
                    className="w-5 h-5 mr-3 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  프로젝트
                </Link>
                <Link
                  href="/templates"
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-50"
                >
                  <svg
                    className="w-5 h-5 mr-3 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                  템플릿
                </Link>
                <Link
                  href="/system-prompts"
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-50"
                >
                  <svg
                    className="w-5 h-5 mr-3 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                  시스템 프롬프트
                </Link>
                <Link
                  href="/prompt-test"
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-50"
                >
                  <svg
                    className="w-5 h-5 mr-3 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  프롬프트 테스터
                </Link>
              </nav>
            </aside>

            {/* 메인 콘텐츠 */}
            <main className="flex-1 py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
