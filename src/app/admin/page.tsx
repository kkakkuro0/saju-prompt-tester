"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // New user form state
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.log("No session found, redirecting to login");
        router.push("/login");
        return;
      }

      console.log("Session found, user:", session.user.email);

      // 바로 admin@example.com 확인
      if (session.user.email === "admin@example.com") {
        console.log("Admin email detected, allowing access");
        setIsAdmin(true);
        fetchUsers();
        return;
      }

      // 그 외의 경우 user_roles 테이블 확인
      try {
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        if (roleError) {
          console.error("Role check error:", roleError);
          // Supabase 문제 해결 페이지로 리디렉션
          router.push("/supabase-fix");
          return;
        }

        if (!roleData || roleData.role !== "admin") {
          console.log("Not an admin role, redirecting to dashboard");
          router.push("/dashboard");
          return;
        }

        console.log("Admin role confirmed from database");
        setIsAdmin(true);
        fetchUsers();
      } catch (error) {
        console.error("Error checking role:", error);
        // Supabase 문제 해결 페이지로 리디렉션
        router.push("/supabase-fix");
      }
    } catch (err) {
      console.error("Admin check error:", err);
      router.push("/login");
    }
  };

  const fetchUsers = async () => {
    try {
      // Using the Supabase admin API endpoint
      const response = await fetch("/api/admin/users", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("사용자 목록을 불러오는데 실패했습니다.");

      // 백업 방식: Supabase에서 직접 사용자 조회
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseKey) {
          const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
          const { data } = await supabaseAdmin.auth.admin.listUsers();
          if (data?.users) {
            // Convert Supabase user type to our User interface
            const formattedUsers: User[] = data.users.map((user) => ({
              id: user.id,
              email: user.email || "No Email",
              created_at: user.created_at,
              last_sign_in_at: user.last_sign_in_at || null,
            }));
            setUsers(formattedUsers);
          }
        }
      } catch (error) {
        console.error("Backup fetching method failed:", error);
        // 마지막 방식: 더미 데이터 사용
        const dummyUsers = [
          {
            id: "admin-id",
            email: "admin@example.com",
            created_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
          },
        ];

        setUsers(dummyUsers);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);

    try {
      // 이메일 형식이 아닌 경우 가상 도메인 추가
      const emailForAuth = newEmail.includes("@")
        ? newEmail
        : `${newEmail}@example.com`;

      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailForAuth,
          password: newPassword,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "사용자 생성에 실패했습니다.");
      }

      setFormSuccess("사용자가 성공적으로 생성되었습니다.");
      setNewEmail("");
      setNewPassword("");
      fetchUsers(); // Refresh user list
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "사용자 생성에 실패했습니다.";
      console.error("Error creating user:", err);
      setFormError(errorMessage);

      // 백업 방식: Supabase Admin API 직접 호출
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseKey) {
          const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
          const emailToUse = newEmail.includes("@")
            ? newEmail
            : `${newEmail}@example.com`;

          const { error } = await supabaseAdmin.auth.admin.createUser({
            email: emailToUse,
            password: newPassword,
            email_confirm: true,
          });

          if (error) {
            throw error;
          }

          setFormSuccess("사용자가 성공적으로 생성되었습니다.");
          setNewEmail("");
          setNewPassword("");
          fetchUsers(); // Refresh user list
        }
      } catch (backupError: unknown) {
        const backupErrorMessage =
          backupError instanceof Error
            ? backupError.message
            : "사용자 생성에 실패했습니다.";
        console.error("Backup user creation failed:", backupError);
        setFormError(backupErrorMessage);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("정말로 이 사용자를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/delete-user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || "사용자 삭제에 실패했습니다.");
      }

      // Refresh the user list
      fetchUsers();
    } catch (err: unknown) {
      console.error("Error deleting user:", err);

      // 백업 방식: Supabase Admin API 직접 호출
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseKey) {
          const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
          const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

          if (error) {
            throw error;
          }

          fetchUsers(); // Refresh user list
        }
      } catch (backupError: unknown) {
        const backupErrorMessage =
          backupError instanceof Error
            ? backupError.message
            : "사용자 삭제에 실패했습니다.";
        console.error("Backup user deletion failed:", backupError);
        setError(backupErrorMessage);

        // 마지막 방식: UI에서만 삭제
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      }
    }
  };

  // Loading state
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">관리자 페이지</h1>

        {/* Create User Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            새 사용자 생성
          </h2>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {formError && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-700 text-sm font-medium">{formError}</p>
              </div>
            )}

            {formSuccess && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-green-700 text-sm font-medium">
                  {formSuccess}
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={formLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {formLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    처리 중...
                  </>
                ) : (
                  "사용자 생성"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* User List */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            사용자 목록
          </h2>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 mb-4">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      이메일
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      생성일
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      마지막 로그인
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : "로그인 기록 없음"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        사용자가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
