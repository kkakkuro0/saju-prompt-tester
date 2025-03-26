"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_id: string;
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
  created_at: string;
  updated_at: string;
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
    fetchTemplates();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;
      if (!project) throw new Error("프로젝트를 찾을 수 없습니다.");

      setProject(project);
      setName(project.name);
      setDescription(project.description);
    } catch (err) {
      console.error("프로젝트 조회 실패:", err);
      setError("프로젝트를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data: templates, error } = await supabase
        .from("prompt_templates")
        .select("*, system_prompts(name)")
        .eq("project_id", params.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(templates || []);
    } catch (err) {
      console.error("템플릿 목록 조회 실패:", err);
      setError("템플릿 목록을 불러오는데 실패했습니다.");
    }
  };

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq("id", params.id);

      if (error) throw error;

      setIsEditing(false);
      fetchProject();
    } catch (err) {
      console.error("프로젝트 수정 실패:", err);
      setError("프로젝트 수정에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", params.id);

      if (error) throw error;

      router.push("/projects");
    } catch (err) {
      console.error("프로젝트 삭제 실패:", err);
      setError("프로젝트 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error || "프로젝트를 찾을 수 없습니다."}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {isEditing ? (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                프로젝트 이름
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                설명
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <div className="space-x-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  삭제
                </button>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6">
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {project.description}
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      생성일
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(project.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      마지막 수정일
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* 템플릿 목록 */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  템플릿 목록
                </h2>
                <a
                  href="/templates/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  새 템플릿
                </a>
              </div>
              <div className="border-t border-gray-200">
                {templates.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {templates.map((template) => (
                      <li
                        key={template.id}
                        className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <a
                              href={`/templates/${template.id}`}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-900 truncate"
                            >
                              {template.name}
                            </a>
                            <p className="mt-1 text-sm text-gray-500 truncate">
                              {template.description}
                            </p>
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                변수: {template.variables.length}개
                              </span>
                              {template.system_prompts && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  시스템 프롬프트:{" "}
                                  {template.system_prompts.name}
                                </span>
                              )}
                              <span className="ml-2">
                                수정일:{" "}
                                {new Date(
                                  template.updated_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex space-x-2">
                            <a
                              href={`/templates/${template.id}/edit`}
                              className="text-sm text-gray-500 hover:text-gray-900"
                            >
                              수정
                            </a>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">
                      아직 템플릿이 없습니다.
                    </p>
                    <a
                      href="/templates/new"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      새 템플릿 만들기
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
