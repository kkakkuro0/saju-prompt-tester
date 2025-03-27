"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DebugAdminPage() {
  const router = useRouter();
  const [authData, setAuthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [forceLoading, setForceLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuthData();
  }, []);

  const fetchAuthData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug-auth');
      const data = await response.json();
      setAuthData(data);
    } catch (err) {
      console.error("Error fetching auth data:", err);
      setError("인증 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };
  
  const createAdminAccount = async () => {
    try {
      setForceLoading(true);
      setMessage(null);
      setError(null);
      
      const response = await fetch('/api/create-admin-account');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "관리자 계정 생성에 실패했습니다.");
      }
      
      setMessage("관리자 계정이 성공적으로 생성되었습니다. 다시 로그인해주세요.");
    } catch (err: any) {
      console.error("Error creating admin account:", err);
      setError(err.message || "관리자 계정 생성에 실패했습니다.");
    } finally {
      setForceLoading(false);
    }
  };

  const handleForceAdmin = async () => {
    try {
      setForceLoading(true);
      setMessage(null);
      setError(null);
      
      const response = await fetch('/api/force-admin', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "관리자 권한 설정에 실패했습니다.");
      }
      
      setMessage("관리자 권한이 성공적으로 설정되었습니다.");
      fetchAuthData(); // Refresh auth data
    } catch (err: any) {
      console.error("Error forcing admin:", err);
      setError(err.message || "관리자 권한 설정에 실패했습니다.");
    } finally {
      setForceLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">관리자 권한 디버깅</h1>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={fetchAuthData}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "로딩 중..." : "인증 상태 확인"}
        </button>
        
        <button
          onClick={handleForceAdmin}
          disabled={forceLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {forceLoading ? "처리 중..." : "관리자 권한 부여"}
        </button>
        
        <button
          onClick={createAdminAccount}
          disabled={forceLoading}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          {forceLoading ? "처리 중..." : "관리자 계정 초기화"}
        </button>
        
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          로그인 페이지
        </button>
        
        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          관리자 페이지로 이동
        </button>
      </div>
      
      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700">{message}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {authData ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">인증 상태</h2>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h3 className="font-medium mb-2">로그인 상태:</h3>
            <p className={authData.auth_status === "authenticated" ? "text-green-600" : "text-red-600"}>
              {authData.auth_status === "authenticated" ? "로그인됨" : "로그인되지 않음"}
            </p>
          </div>
          
          {authData.session && (
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="font-medium mb-2">사용자 정보:</h3>
              <p>ID: {authData.session.user.id}</p>
              <p>이메일: {authData.session.user.email}</p>
              <p>생성일: {new Date(authData.session.user.created_at).toLocaleString()}</p>
            </div>
          )}
          
          {authData.admin_status && (
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="font-medium mb-2">관리자 상태:</h3>
              <p className={authData.admin_status.is_admin_by_email ? "text-green-600" : "text-gray-600"}>
                이메일로 관리자 확인: {authData.admin_status.is_admin_by_email ? "예" : "아니오"}
              </p>
              
              <div className="mt-2">
                <h4 className="font-medium">DB 역할 확인 결과:</h4>
                {authData.admin_status.role_check_error ? (
                  <p className="text-red-600">오류: {authData.admin_status.role_check_error}</p>
                ) : (
                  <>
                    {authData.admin_status.role_check_result ? (
                      <p className="text-green-600">
                        역할: {authData.admin_status.role_check_result.role}
                      </p>
                    ) : (
                      <p className="text-gray-600">역할 정보 없음</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">테이블 정보:</h3>
            {authData.table_error ? (
              <p className="text-red-600">오류: {authData.table_error}</p>
            ) : (
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(authData.table_info, null, 2)}
              </pre>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">인증 데이터를 불러오는 중</h2>
          <p>로그인 상태를 확인 중입니다.</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            로그인 페이지로 이동
          </button>
        </div>
      )}
      
      <div className="mt-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-500 hover:underline"
        >
          대시보드로 돌아가기
        </button>
      </div>
    </div>
  );
}
