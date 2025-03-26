"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function SystemPromptPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [prompt, setPrompt] = useState<SystemPrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemPrompt();
  }, [params.id]);

  const fetchSystemPrompt = async () => {
    try {
      const { data: prompt, error } = await supabase
        .from("system_prompts")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;
      if (!prompt) throw new Error("시스템 프롬프트를 찾을 수 없습니다.");

      setPrompt(prompt);
    } catch (err) {
      console.error("시스템 프롬프트 조회 실패:", err);
      setError("시스템 프롬프트를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 시스템 프롬프트를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("system_prompts")
        .delete()
        .eq("id", params.id);

      if (error) throw error;

      router.push("/system-prompts");
    } catch (err) {
      console.error("시스템 프롬프트 삭제 실패:", err);
      setError("시스템 프롬프트 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error || "시스템 프롬프트를 찾을 수 없습니다."}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{prompt.name}</h1>
          <div className="space-x-4">
            <Link
              href={`/system-prompts/${prompt.id}/edit`}
              className="inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              수정
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              삭제
            </button>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {prompt.description}
            </p>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              프롬프트 내용
            </h3>
            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto font-mono text-sm whitespace-pre-wrap">
              {prompt.content}
            </pre>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">생성일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(prompt.created_at).toLocaleDateString()}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  마지막 수정일
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(prompt.updated_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
