"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SupabaseFixPage() {
  const router = useRouter();
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fixLoading, setFixLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [fixResult, setFixResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
    runDiagnostic();
  }, []);

  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    } catch (err) {
      console.error("세션 확인 오류:", err);
    }
  };

  const runDiagnostic = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/supabase-diagnostic");
      const data = await response.json();
      setDiagnosticData(data);
    } catch (err) {
      console.error("진단 오류:", err);
      setError("Supabase 진단 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const runFix = async () => {
    if (!session?.user?.id && !diagnosticData?.authTest?.user?.id) {
      setError("로그인이 필요하거나 진단을 먼저 실행해주세요.");
      return;
    }

    try {
      setFixLoading(true);
      setError(null);
      setFixResult(null);

      // 표준 SQL을 사용하는 새 엔드포인트로 변경
      const userId = session?.user?.id || diagnosticData?.authTest?.user?.id;
      const email = session?.user?.email || diagnosticData?.authTest?.user?.email || 'admin@example.com';
      
      const response = await fetch("/api/fix-role-standard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          email
        }),
      });

      const data = await response.json();
      setFixResult(data);

      if (data.success) {
        // 진단 다시 실행
        await runDiagnostic();
      } else {
        setError(data.error || "권한 설정 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("권한 설정 오류:", err);
      setError("권한 설정 중 오류가 발생했습니다.");
    } finally {
      setFixLoading(false);
    }
  };

  const handleTryLogin = async () => {
    if (!diagnosticData?.adminCredentials) {
      return;
    }

    try {
      const { email, password } = diagnosticData.adminCredentials;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      window.location.href = "/admin"; // 페이지 새로고침
    } catch (err: any) {
      console.error("로그인 오류:", err);
      setError(`로그인 실패: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Supabase 문제 해결</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={runDiagnostic}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "진단 중..." : "진단 실행"}
        </button>

        <button
          onClick={runFix}
          disabled={fixLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {fixLoading ? "권한 설정 중..." : "관리자 권한 부여"}
        </button>

        {diagnosticData?.adminCredentials && (
          <button
            onClick={handleTryLogin}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            관리자 계정으로 로그인
          </button>
        )}

        <button
          onClick={() => router.push("/admin")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          관리자 페이지로 이동
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {fixResult?.success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700">{fixResult.message}</p>
        </div>
      )}

      {session ? (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h2 className="text-lg font-semibold mb-2">현재 로그인 정보</h2>
          <p>
            <strong>사용자 ID:</strong> {session.user.id}
          </p>
          <p>
            <strong>이메일:</strong> {session.user.email}
          </p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-700">
            로그인되지 않았습니다. 일부 기능이 제한될 수 있습니다.
          </p>
        </div>
      )}

      {diagnosticData && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">진단 결과</h2>

          <div className="space-y-4">
            <div className="p-4 rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">환경 변수</h3>
              <p>
                <span className="inline-block w-48">Supabase URL:</span>
                <span
                  className={
                    diagnosticData.environment.supabaseUrl
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {diagnosticData.environment.supabaseUrl
                    ? diagnosticData.environment.supabaseUrl
                    : "누락됨"}
                </span>
              </p>
              <p>
                <span className="inline-block w-48">Anon Key:</span>
                <span
                  className={
                    diagnosticData.environment.anonKeyExists
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {diagnosticData.environment.anonKeyExists ? "설정됨" : "누락됨"}
                </span>
              </p>
              <p>
                <span className="inline-block w-48">Service Role Key:</span>
                <span
                  className={
                    diagnosticData.environment.serviceKeyExists
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {diagnosticData.environment.serviceKeyExists
                    ? "설정됨"
                    : "누락됨"}
                </span>
              </p>
            </div>

            <div className="p-4 rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">연결 테스트</h3>
              <p
                className={
                  diagnosticData.connectionTest.success
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {diagnosticData.connectionTest.success
                  ? "연결 성공"
                  : `연결 실패: ${diagnosticData.connectionTest.error}`}
              </p>
            </div>

            <div className="p-4 rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">인증 테스트</h3>
              {diagnosticData.authTest.success ? (
                <div>
                  <p className="text-green-600">관리자 계정 확인 성공</p>
                  {diagnosticData.authTest.user && (
                    <div className="mt-2 pl-4 border-l-2 border-green-200">
                      <p>ID: {diagnosticData.authTest.user.id}</p>
                      <p>이메일: {diagnosticData.authTest.user.email}</p>
                      <p>
                        생성일:{" "}
                        {new Date(
                          diagnosticData.authTest.user.created_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-600">
                  관리자 계정 확인 실패: {diagnosticData.authTest.error}
                </p>
              )}
            </div>

            <div className="p-4 rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">테이블 테스트</h3>
              {diagnosticData.tablesTest.success ? (
                <div>
                  <p className="text-green-600 mb-2">테이블 확인 성공</p>
                  <div className="overflow-auto">
                    <pre className="text-xs bg-gray-100 p-2 rounded">
                      {JSON.stringify(diagnosticData.tablesTest.tables, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-red-600">
                  테이블 확인 실패: {diagnosticData.tablesTest.error}
                </p>
              )}
            </div>

            <div className="p-4 rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">역할 설정 테스트</h3>
              {diagnosticData.roleSetupTest.success ? (
                <p className="text-green-600">
                  관리자 역할 설정 성공 (테이블 생성: {diagnosticData.roleSetupTest.tableCreated
                    ? "성공"
                    : "실패"}, 역할 할당: {diagnosticData.roleSetupTest.roleAssigned
                    ? "성공"
                    : "실패"})
                </p>
              ) : (
                <p className="text-red-600">
                  관리자 역할 설정 실패: {diagnosticData.roleSetupTest.error}
                </p>
              )}
            </div>

            {diagnosticData.adminCredentials && (
              <div className="p-4 rounded-md bg-green-50">
                <h3 className="font-medium mb-2">관리자 계정 정보</h3>
                <p>이메일: {diagnosticData.adminCredentials.email}</p>
                <p>비밀번호: {diagnosticData.adminCredentials.password}</p>
                <button
                  onClick={handleTryLogin}
                  className="mt-2 px-4 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  이 계정으로 로그인
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-blue-500 hover:underline"
        >
          대시보드로 돌아가기
        </button>
      </div>
    </div>
  );
}
