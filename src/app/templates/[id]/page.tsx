"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  name: string;
}

interface SystemPrompt {
  id: string;
  name: string;
}

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  variables: string[];
  system_prompt_id: string | null;
  project_id: string;
  system_prompts?: SystemPrompt;
  project?: Project;
  created_at: string;
  updated_at: string;
}

export default function TemplatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [template, setTemplate] = useState<PromptTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplate();
  }, [params.id]);

  const fetchTemplate = async () => {
    try {
      const { data: template, error } = await supabase
        .from("prompt_templates")
        .select("*, system_prompts(name), projects(name)")
        .eq("id", params.id)
        .single();

      if (error) throw error;
      setTemplate(template);
    } catch (err) {
      console.error("템플릿 조회 실패:", err);
      setError("템플릿을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 템플릿을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("prompt_templates")
        .delete()
        .eq("id", params.id);

      if (error) throw error;

      router.push("/templates");
    } catch (err) {
      console.error("템플릿 삭제 실패:", err);
      setError("템플릿 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-5 w-5 text-primary-600"
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
          <span className="text-lg font-medium text-gray-900">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-700 text-sm font-medium">
            {error || "템플릿을 찾을 수 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
        <div className="flex items-center space-x-4">
          <Link
            href={`/templates/${template.id}/edit`}
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            수정
          </Link>
          <Link
            href="/templates"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
          >
            목록으로
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500">프로젝트</h2>
            <p className="mt-1 text-lg text-gray-900">
              {template.project?.name || "프로젝트 없음"}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">
              시스템 프롬프트
            </h2>
            <p className="mt-1 text-lg text-gray-900">
              {template.system_prompts?.name || "없음"}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">생성일</h2>
            <p className="mt-1 text-lg text-gray-900">
              {new Date(template.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">마지막 수정일</h2>
            <p className="mt-1 text-lg text-gray-900">
              {new Date(template.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-2">설명</h2>
          <p className="text-gray-900">{template.description || "설명 없음"}</p>
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-2">변수</h2>
          {template.variables.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {template.variables.map((variable, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700"
                >
                  {variable}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">변수 없음</p>
          )}
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-2">내용</h2>
          <pre className="p-4 bg-gray-50 rounded-lg overflow-x-auto font-mono text-sm text-gray-900">
            {template.content}
          </pre>
        </div>
      </div>
    </div>
  );
}
