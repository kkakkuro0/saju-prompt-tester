"use client";

import { useState, useEffect } from "react";
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

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data: templates, error } = await supabase
        .from("prompt_templates")
        .select("*, system_prompts(name), projects(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(templates || []);
    } catch (err) {
      console.error("템플릿 목록 조회 실패:", err);
      setError("템플릿 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말로 이 템플릿을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("prompt_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTemplates((prev) => prev.filter((template) => template.id !== id));
    } catch (err) {
      console.error("템플릿 삭제 실패:", err);
      setError("템플릿 삭제에 실패했습니다.");
    }
  };

  // 프로젝트별로 템플릿 그룹화
  const templatesByProject = templates.reduce((acc, template) => {
    const projectId = template.project_id;
    if (!acc[projectId]) {
      acc[projectId] = [];
    }
    acc[projectId].push(template);
    return acc;
  }, {} as Record<string, PromptTemplate[]>);

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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">프롬프트 템플릿</h1>
        <Link
          href="/templates/new"
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
          새 템플릿
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {Object.entries(templatesByProject).map(
        ([projectId, projectTemplates]) => (
          <div
            key={projectId}
            className="bg-white rounded-2xl shadow-xl p-6 space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              {projectTemplates[0]?.project?.name || "프로젝트 없음"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-200"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-150 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="space-y-1 text-xs text-gray-500 mb-4">
                      <div className="flex items-center">
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
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        변수: {template.variables.length}개
                      </div>
                      {template.system_prompts && (
                        <div className="flex items-center">
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
                              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                            />
                          </svg>
                          시스템 프롬프트:{" "}
                          {template.system_prompts.name || "없음"}
                        </div>
                      )}
                      <div className="flex items-center">
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
                        {new Date(template.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        href={`/templates/${template.id}`}
                        className="flex-1 text-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-150"
                      >
                        상세보기
                      </Link>
                      <Link
                        href={`/templates/${template.id}/edit`}
                        className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-150"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {templates.length === 0 && (
        <div className="p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-center">
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
            아직 템플릿이 없습니다.
          </p>
          <p className="mt-1 text-gray-500">
            새 템플릿을 생성하여 시작해보세요.
          </p>
          <Link
            href="/templates/new"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
          >
            새 템플릿 만들기
          </Link>
        </div>
      )}
    </div>
  );
}
