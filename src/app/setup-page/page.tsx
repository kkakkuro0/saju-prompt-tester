"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/setup-admin");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Setup error:", error);
      setResult({ error: "설정 중 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">관리자 계정 설정</h1>

      <p className="mb-4 text-gray-600">
        이 페이지는 Supabase와 연결하여 관리자 계정을 생성합니다.
        계정이 성공적으로 생성되면 Supabase 인증을 통해 로그인할 수 있습니다.
      </p>

      <div className="mb-6">
        <button
          onClick={handleSetup}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 w-full"
        >
          {loading ? "처리 중..." : "관리자 계정 설정"}
        </button>
      </div>

      {result && (
        <div className={`p-4 border rounded ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h2 className="text-lg font-semibold mb-2">결과:</h2>
          {result.success ? (
            <div>
              <p className="text-green-700 mb-2">{result.message}</p>
              <div className="bg-gray-100 p-3 rounded">
                <p>이메일: {result.admin.email}</p>
                <p>비밀번호: {result.admin.password}</p>
              </div>
              <button
                onClick={() => router.push("/login")}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
              >
                로그인 페이지로 이동
              </button>
            </div>
          ) : (
            <p className="text-red-700">{result.error}</p>
          )}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => router.push("/login")}
          className="text-blue-500 hover:underline"
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}
