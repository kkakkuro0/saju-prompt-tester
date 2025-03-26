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

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [variables, setVariables] = useState<string[]>([]);
  const [systemPromptId, setSystemPromptId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchSystemPrompts();
    fetchProjects();
  }, []);

  const checkAuth = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      if (!session) {
        router.push("/login");
        return;
      }
    } catch (err) {
      console.error("인증 확인 실패:", err);
      setError("인증에 실패했습니다. 다시 로그인해주세요.");
      router.push("/login");
    }
  };

  const fetchSystemPrompts = async () => {
    try {
      const { data: prompts, error } = await supabase
        .from("system_prompts")
        .select("*")
        .order("name");

      if (error) throw error;
      setSystemPrompts(prompts || []);
    } catch (err) {
      console.error("시스템 프롬프트 목록 조회 실패:", err);
      setError("시스템 프롬프트 목록을 불러오는데 실패했습니다.");
    }
  };

  const fetchProjects = async () => {
    try {
      const { data: projects, error } = await supabase
        .from("projects")
        .select("*")
        .order("name");

      if (error) throw error;
      setProjects(projects || []);
    } catch (err) {
      console.error("프로젝트 목록 조회 실패:", err);
      setError("프로젝트 목록을 불러오는데 실패했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!projectId) {
      setError("프로젝트를 선택해주세요.");
      setLoading(false);
      return;
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: template, error } = await supabase
        .from("prompt_templates")
        .insert([
          {
            name,
            description,
            content,
            variables: variables.filter(Boolean),
            system_prompt_id: systemPromptId,
            project_id: projectId,
            user_id: session.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      router.push(`/templates/${template.id}`);
    } catch (err) {
      console.error("템플릿 생성 실패:", err);
      setError("템플릿 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">새 프롬프트 템플릿</h1>
        <Link
          href="/templates"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
        >
          취소
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="project"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              프로젝트 <span className="text-red-500">*</span>
            </label>
            <select
              id="project"
              value={projectId || ""}
              onChange={(e) => setProjectId(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150 ease-in-out"
              required
            >
              <option value="">프로젝트 선택</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150 ease-in-out"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              설명
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150 ease-in-out"
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150 ease-in-out"
              required
            />
          </div>

          <div>
            <label
              htmlFor="variables"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              변수 (쉼표로 구분)
            </label>
            <input
              type="text"
              id="variables"
              value={variables.join(", ")}
              onChange={(e) =>
                setVariables(e.target.value.split(",").map((v) => v.trim()))
              }
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150 ease-in-out"
            />
          </div>

          <div>
            <label
              htmlFor="systemPrompt"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              시스템 프롬프트
            </label>
            <select
              id="systemPrompt"
              value={systemPromptId || ""}
              onChange={(e) => setSystemPromptId(e.target.value || null)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150 ease-in-out"
            >
              <option value="">시스템 프롬프트 선택</option>
              {systemPrompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  생성 중...
                </>
              ) : (
                "생성"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
