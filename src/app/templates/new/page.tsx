"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import NavLayout from "@/components/layout/NavLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Project {
  id: string;
  name: string;
}

export default function NewTemplatePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("");
  const [variables, setVariables] = useState<string[]>([]);
  const [newVariable, setNewVariable] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 프로젝트 목록 가져오기
  useEffect(() => {
    async function fetchProjects() {
      try {
        const { error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { data, error } = await supabase
          .from("projects")
          .select("id, name")
          .order("name");

        if (error) throw error;
        setProjects(data || []);
      } catch (err) {
        console.error("프로젝트 목록 가져오기 실패:", err);
        setError("프로젝트 목록을 가져오는데 실패했습니다.");
      } finally {
        setLoadingProjects(false);
      }
    }

    fetchProjects();
  }, []);

  // 변수 추가 함수
  const addVariable = () => {
    if (
      newVariable &&
      !variables.includes(newVariable) &&
      /^[a-zA-Z][a-zA-Z0-9_]*$/.test(newVariable)
    ) {
      setVariables([...variables, newVariable]);
      setNewVariable("");
    }
  };

  // 변수 삭제 함수
  const removeVariable = (variable: string) => {
    setVariables(variables.filter((v) => v !== variable));
  };

  // 새 템플릿 생성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      // 변수 형식 변환: 배열 대신 지정된 객체 구조 사용
      const formattedVariables = {
        category: "기타", // 기본 카테고리
        fields: variables.map((variableName) => ({
          name: variableName,
          type: "text",
          required: false,
        })),
      };

      const { error: insertError } = await supabase
        .from("prompt_templates")
        .insert([
          {
            name,
            description,
            content: template,
            variables: formattedVariables,
            project_id: selectedProject || null,
            user_id: userData.user.id,
          },
        ]);

      if (insertError) throw insertError;

      router.push("/templates");
    } catch (err) {
      console.error("템플릿 생성 실패:", err);
      setError("템플릿 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 변수 형식 체크
  const isValidVariableName = (name: string) => {
    return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name);
  };

  return (
    <NavLayout>
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 배너 */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-0">
            <Image
              src="/imgs/cheyoung3.jpg"
              alt="New Template Banner"
              fill
              className="object-cover brightness-75"
              priority
            />
          </div>
          <div className="relative z-10 px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              새 템플릿 만들기
            </h1>
            <p className="text-white text-lg max-w-2xl">
              프롬프트 작성을 위한 재사용 가능한 템플릿을 만드세요. 변수를
              활용해 다양한 상황에 맞게 커스터마이징할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    템플릿 이름
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="템플릿 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label
                    htmlFor="project"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    프로젝트 (선택사항)
                  </label>
                  <select
                    id="project"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">프로젝트 선택 (선택사항)</option>
                    {loadingProjects ? (
                      <option disabled>로딩 중...</option>
                    ) : (
                      projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  설명
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="템플릿에 대한 설명을 입력하세요"
                />
              </div>

              <div>
                <label
                  htmlFor="template"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  템플릿 내용
                </label>
                <textarea
                  id="template"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  rows={8}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                  placeholder="템플릿 내용을 입력하세요... 변수는 {{variable_name}} 형식으로 사용하세요."
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="variables"
                    className="block text-sm font-medium text-gray-700"
                  >
                    변수 목록
                  </label>
                  <span className="text-xs text-gray-500">
                    템플릿에서 &#123;&#123;변수명&#125;&#125; 형식으로 사용할 수
                    있습니다
                  </span>
                </div>

                <div className="flex mb-4">
                  <input
                    type="text"
                    id="newVariable"
                    value={newVariable}
                    onChange={(e) => setNewVariable(e.target.value)}
                    className={`block w-full rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      newVariable && !isValidVariableName(newVariable)
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    placeholder="새 변수 이름 (영문, 숫자, 언더스코어만 사용 가능)"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-l-none"
                    onClick={addVariable}
                    disabled={
                      !newVariable ||
                      !isValidVariableName(newVariable) ||
                      variables.includes(newVariable)
                    }
                  >
                    추가
                  </Button>
                </div>

                {newVariable && !isValidVariableName(newVariable) && (
                  <p className="mt-1 text-xs text-red-500">
                    변수명은 영문으로 시작하고 영문, 숫자, 언더스코어만 포함해야
                    합니다
                  </p>
                )}

                <div className="mt-3">
                  {variables.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      등록된 변수가 없습니다
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {variables.map((variable) => (
                        <div
                          key={variable}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-600"
                        >
                          <span className="mr-1 font-mono">
                            &#123;&#123;{variable}&#125;&#125;
                          </span>
                          <button
                            type="button"
                            onClick={() => removeVariable(variable)}
                            className="ml-1 text-blue-400 hover:text-blue-600"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                >
                  취소
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? "생성 중..." : "템플릿 생성"}
                </Button>
              </div>
            </form>
          </Card>

          {/* 안내 섹션 */}
          <div className="mt-8">
            <Card className="p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">
                템플릿 작성 팁
              </h3>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mt-0.5 mr-3">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-800">
                        변수 활용:
                      </span>{" "}
                      템플릿에서 변경될 가능성이 있는 부분을 변수로 지정하세요.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mt-0.5 mr-3">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-800">
                        예시 포함:
                      </span>{" "}
                      변수 사용 방법에 대한 예시를 설명에 포함하면 템플릿 사용이
                      더 쉬워집니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mt-0.5 mr-3">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-800">
                        변수명 명명법:
                      </span>{" "}
                      의미가 명확한 변수명을 사용하세요 (예: client_name,
                      birth_date).
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mt-0.5 mr-3">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-800">
                        템플릿 테스트:
                      </span>{" "}
                      생성 후 다양한 변수 값으로 템플릿을 테스트해보세요.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </NavLayout>
  );
}
