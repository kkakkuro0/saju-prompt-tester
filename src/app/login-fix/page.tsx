"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginFixPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin!23");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleTest = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/debug-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Login test error:", error);
      setResult({ error: "요청 실패" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      // 서비스 역할 키로 슈퍼 어드민 생성
      const response = await fetch("/api/init-admin", {
        method: "GET",
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Admin creation error:", error);
      setResult({ error: "요청 실패" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">로그인 디버거</h1>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이메일
          </label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleTest}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "처리 중..." : "로그인 테스트"}
        </button>

        <button
          onClick={handleCreateAdmin}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "처리 중..." : "어드민 계정 생성"}
        </button>
      </div>

      {result && (
        <div className="p-4 border rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">결과:</h2>
          <pre className="text-xs overflow-auto whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => router.push("/login")}
          className="text-blue-500 hover:underline"
        >
          정상 로그인 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}
