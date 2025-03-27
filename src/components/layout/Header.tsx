"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      // Supabase 로그아웃
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
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
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sm text-gray-700 hover:text-gray-900 disabled:opacity-50"
            >
              {loggingOut ? "로그아웃 중..." : "로그아웃"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
