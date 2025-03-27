"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import NavLayout from "@/components/layout/NavLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

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
  description?: string;
}

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  variables: {
    category?: string;
    fields?: Array<{
      name: string;
      type: string;
      required: boolean;
    }>;
  };
  system_prompt_id: string | null;
  project_id: string;
  system_prompts?: SystemPrompt;
  created_at: string;
  updated_at: string;
}

// 상태 스타일 및 이미지
const statusStyles: Record<
  string,
  {
    color: string;
    bg: string;
    text: string;
    image: string;
    icon: React.ReactNode;
  }
> = {
  active: {
    color: "green",
    bg: "bg-green-100",
    text: "text-green-600",
    image: "/imgs/cheyoung2.webp",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  archived: {
    color: "gray",
    bg: "bg-gray-100",
    text: "text-gray-600",
    image: "/imgs/winter1.jpg",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
        <path
          fillRule="evenodd"
          d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  completed: {
    color: "blue",
    bg: "bg-blue-100",
    text: "text-blue-600",
    image: "/imgs/gyujin1.webp",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

// 카테고리 색상 및 이미지
const categoryStyles: Record<
  string,
  {
    color: string;
    bg: string;
    text: string;
    image: string;
  }
> = {
  연애운: {
    color: "pink",
    bg: "bg-pink-100",
    text: "text-pink-600",
    image: "/imgs/cheyoung2.webp",
  },
  사업운: {
    color: "blue",
    bg: "bg-blue-100",
    text: "text-blue-600",
    image: "/imgs/jijel1.jpg",
  },
  재물운: {
    color: "yellow",
    bg: "bg-yellow-100",
    text: "text-yellow-600",
    image: "/imgs/gyujin1.webp",
  },
  건강운: {
    color: "green",
    bg: "bg-green-100",
    text: "text-green-600",
    image: "/imgs/beak1.jpg",
  },
  종합운: {
    color: "purple",
    bg: "bg-purple-100",
    text: "text-purple-600",
    image: "/imgs/winter1.jpg",
  },
  기타: {
    color: "gray",
    bg: "bg-gray-100",
    text: "text-gray-600",
    image: "/imgs/yena1.jpg",
  },
};

export default function ProjectClient({ id }: { id: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectStatus, setProjectStatus] = useState<
    "active" | "archived" | "completed"
  >("active");

  const fetchProject = useCallback(async () => {
    try {
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!project) throw new Error("프로젝트를 찾을 수 없습니다.");

      setProject(project);
      setName(project.name);
      setDescription(project.description);

      // 설명에서 상태값 추출 (description에서 상태를 포함했다고 가정, 없으면 'active'로 기본값 설정)
      let status: "active" | "archived" | "completed" = "active";
      if (project.description) {
        if (project.description.toLowerCase().includes("completed")) {
          status = "completed";
        } else if (project.description.toLowerCase().includes("archived")) {
          status = "archived";
        }
      }
      setProjectStatus(status);
    } catch (err) {
      console.error("프로젝트 조회 실패:", err);
      setError("프로젝트를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchTemplates = useCallback(async () => {
    try {
      const { data: templates, error } = await supabase
        .from("prompt_templates")
        .select("*, system_prompts(name)")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(templates || []);
    } catch (err) {
      console.error("템플릿 목록 조회 실패:", err);
      setError("템플릿 목록을 불러오는데 실패했습니다.");
    }
  }, [id]);

  const fetchSystemPrompts = useCallback(async () => {
    try {
      const { data: systemPrompts, error } = await supabase
        .from("system_prompts")
        .select("id, name, description")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSystemPrompts(systemPrompts || []);
    } catch (err) {
      console.error("시스템 프롬프트 목록 조회 실패:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
    fetchTemplates();
    fetchSystemPrompts();
  }, [fetchProject, fetchTemplates, fetchSystemPrompts]);

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq("id", id);

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
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) throw error;

      router.push("/projects");
    } catch (err) {
      console.error("프로젝트 삭제 실패:", err);
      setError("프로젝트 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <NavLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <span className="text-lg font-medium text-blue-700">
              로딩 중...
            </span>
          </div>
        </div>
      </NavLayout>
    );
  }

  if (error || !project) {
    return (
      <NavLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto p-8 text-center">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <svg
                className="h-12 w-12"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              오류가 발생했습니다
            </h3>
            <p className="text-gray-600 mb-6">
              {error || "프로젝트를 찾을 수 없습니다."}
            </p>
            <Button onClick={() => router.push("/projects")}>
              프로젝트 목록으로
            </Button>
          </Card>
        </div>
      </NavLayout>
    );
  }

  const statusStyle = statusStyles[projectStatus];

  return (
    <NavLayout>
      <div className="container mx-auto px-4 py-8">
        {isEditing ? (
          <Card className="p-6 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              프로젝트 수정
            </h2>
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="프로젝트에 대한 설명을 입력하세요. 상태값을 포함하려면 'completed' 또는 'archived'를 설명에 추가하세요."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  취소
                </Button>
                <Button variant="primary" onClick={handleUpdate}>
                  저장
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* 헤더 배너 */}
            <div className="relative rounded-2xl overflow-hidden mb-8">
              <div className="absolute inset-0">
                <Image
                  src={statusStyle.image}
                  alt={project.name}
                  fill
                  className="object-cover brightness-75"
                  priority
                />
              </div>
              <div className="relative z-10 px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <h1 className="text-3xl md:text-4xl font-bold text-white mr-3">
                        {project.name}
                      </h1>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        <span className="mr-1">{statusStyle.icon}</span>
                        {projectStatus === "active"
                          ? "진행 중"
                          : projectStatus === "completed"
                          ? "완료됨"
                          : "보관됨"}
                      </span>
                    </div>
                    <p className="text-white text-lg max-w-2xl mb-2">
                      {project.description}
                    </p>
                    <div className="flex items-center">
                      <span className="text-white text-sm">
                        마지막 업데이트:{" "}
                        {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      onClick={() => setIsEditing(true)}
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
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/projects")}
                    >
                      목록으로
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDelete}
                      className="text-red-600 hover:bg-red-50 border-red-300"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      삭제
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 프로젝트 요약 통계 */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="p-4 border-t-4 border-blue-500">
                <p className="text-gray-500 text-sm">템플릿</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.length}
                </p>
              </Card>
              <Card className="p-4 border-t-4 border-indigo-500">
                <p className="text-gray-500 text-sm">시스템 프롬프트</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemPrompts.length}
                </p>
              </Card>
              <Card className="p-4 border-t-4 border-purple-500">
                <p className="text-gray-500 text-sm">생성일</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </Card>
            </div>

            {/* 주요 컨텐츠 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 좌측: 시스템 프롬프트 */}
              <div className="lg:col-span-1">
                <Card className="p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">시스템 프롬프트</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/system-prompts/new?project=${id}`)
                      }
                    >
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      추가
                    </Button>
                  </div>

                  {systemPrompts.length > 0 ? (
                    <div className="space-y-3">
                      {systemPrompts.map((prompt) => (
                        <div
                          key={prompt.id}
                          className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            router.push(`/system-prompts/${prompt.id}`)
                          }
                        >
                          <h3 className="font-medium text-gray-900">
                            {prompt.name}
                          </h3>
                          {prompt.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {prompt.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">
                        시스템 프롬프트가 없습니다
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-3"
                        onClick={() =>
                          router.push(`/system-prompts/new?project=${id}`)
                        }
                      >
                        새 시스템 프롬프트 만들기
                      </Button>
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    프로젝트 관리 팁
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-1">
                        템플릿 활용
                      </h3>
                      <p className="text-sm text-blue-700">
                        템플릿을 만들어 사주 분석 과정을 표준화하고
                        효율화하세요.
                      </p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h3 className="font-medium text-indigo-800 mb-1">
                        프롬프트 테스트
                      </h3>
                      <p className="text-sm text-indigo-700">
                        시스템 프롬프트와 템플릿을 조합하여 다양한 사례에
                        테스트해보세요.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 우측: 템플릿 목록 */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">템플릿 목록</h2>
                    <Button
                      variant="primary"
                      onClick={() =>
                        router.push(`/templates/new?project=${id}`)
                      }
                    >
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      새 템플릿
                    </Button>
                  </div>

                  {templates.length > 0 ? (
                    <div className="space-y-6">
                      {templates.map((template) => {
                        const category = template.variables?.category || "기타";
                        const categoryStyle =
                          categoryStyles[category] || categoryStyles["기타"];

                        return (
                          <div
                            key={template.id}
                            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() =>
                              router.push(`/templates/${template.id}`)
                            }
                          >
                            <div className="flex flex-col md:flex-row">
                              <div className="md:w-1/4 h-32 md:h-auto relative">
                                <Image
                                  src={categoryStyle.image}
                                  alt={template.name}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}
                                  >
                                    {category}
                                  </span>
                                </div>
                              </div>
                              <div className="p-4 md:w-3/4">
                                <div className="flex flex-col h-full">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {template.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {template.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between mt-4">
                                    <div className="text-xs text-gray-500">
                                      <span className="flex items-center">
                                        <svg
                                          className="h-4 w-4 mr-1 text-gray-400"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm1-6a1 1 0 11-2 0 1 1 0 012 0zm-1-4a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        마지막 업데이트:{" "}
                                        {new Date(
                                          template.updated_at
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                    {template.system_prompts && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        {template.system_prompts.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <svg
                        className="h-12 w-12 text-gray-400 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        아직 템플릿이 없습니다
                      </h3>
                      <p className="text-gray-500 mb-4">
                        새 템플릿을 만들어서 프로젝트를 시작해보세요!
                      </p>
                      <Button
                        variant="primary"
                        onClick={() =>
                          router.push(`/templates/new?project=${id}`)
                        }
                      >
                        첫 템플릿 만들기
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </NavLayout>
  );
}
