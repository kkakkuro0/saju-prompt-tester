"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface SystemPrompt {
  id: string;
  name: string;
  description: string;
  content: string;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

export default function SystemPromptsPage() {
  const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemPrompts();
  }, []);

  const fetchSystemPrompts = async () => {
    try {
      const { data: prompts, error } = await supabase
        .from("system_prompts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSystemPrompts(prompts || []);
    } catch (err) {
      console.error("시스템 프롬프트 목록 조회 실패:", err);
      setError("시스템 프롬프트 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말로 이 시스템 프롬프트를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("system_prompts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSystemPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
    } catch (err) {
      console.error("시스템 프롬프트 삭제 실패:", err);
      setError("시스템 프롬프트 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
        <div className="flex items-center space-x-2 text-primary-600">
          <svg
            className="animate-spin h-5 w-5"
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
          <span className="text-lg font-medium">로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              시스템 프롬프트
            </h1>
            <Link
              href="/system-prompts/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              새 시스템 프롬프트
            </Link>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-200"
              >
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-150 mb-2">
                    {prompt.name}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {prompt.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    마지막 수정:{" "}
                    {new Date(prompt.updated_at).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-3">
                    <Link
                      href={`/system-prompts/${prompt.id}`}
                      className="flex-1 text-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-150"
                    >
                      상세보기
                    </Link>
                    <Link
                      href={`/system-prompts/${prompt.id}/edit`}
                      className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(prompt.id)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-150"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {systemPrompts.length === 0 && (
              <div className="col-span-full p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <p className="mt-4 text-gray-900 font-medium">
                  아직 시스템 프롬프트가 없습니다.
                </p>
                <p className="mt-1 text-gray-500">
                  새 시스템 프롬프트를 생성하여 시작해보세요.
                </p>
                <Link
                  href="/system-prompts/new"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
                >
                  새 시스템 프롬프트 만들기
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
