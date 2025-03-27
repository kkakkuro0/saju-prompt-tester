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
  project?: Project;
  created_at: string;
  updated_at: string;
}

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

export default function TemplateClient({ id }: { id: string }) {
  const router = useRouter();
  const [template, setTemplate] = useState<PromptTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplate = useCallback(async () => {
    try {
      const { data: template, error } = await supabase
        .from("prompt_templates")
        .select("*, system_prompts(name), projects(name)")
        .eq("id", id)
        .single();

      if (error) throw error;
      setTemplate(template);
    } catch (err) {
      console.error("템플릿 조회 실패:", err);
      setError("템플릿을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 템플릿을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("prompt_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      router.push("/templates");
    } catch (err) {
      console.error("템플릿 삭제 실패:", err);
      setError("템플릿 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <NavLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            <span className="text-lg font-medium text-purple-700">
              로딩 중...
            </span>
          </div>
        </div>
      </NavLayout>
    );
  }

  if (error || !template) {
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
              {error || "템플릿을 찾을 수 없습니다."}
            </p>
            <Button onClick={() => router.push("/templates")}>
              템플릿 목록으로
            </Button>
          </Card>
        </div>
      </NavLayout>
    );
  }

  const categoryStyle = categoryStyles[template.variables?.category || "기타"];
  const variableFields = template.variables?.fields || [];

  return (
    <NavLayout>
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 배너 */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-0">
            <Image
              src={categoryStyle.image}
              alt={template.name}
              fill
              className="object-cover brightness-75"
              priority
            />
          </div>
          <div className="relative z-10 px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {template.name}
                </h1>
                <p className="text-white text-lg max-w-2xl mb-2">
                  {template.description}
                </p>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text} mr-2`}
                  >
                    {template.variables?.category || "기타"}
                  </span>
                  <span className="text-white text-sm">
                    마지막 업데이트:{" "}
                    {new Date(template.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  onClick={() => router.push(`/templates/${template.id}/edit`)}
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
                  onClick={() => router.push("/templates")}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측: 메타데이터 */}
          <div className="lg:col-span-1">
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">템플릿 정보</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    프로젝트
                  </h3>
                  <p className="mt-1 font-medium">
                    {template.project?.name || "프로젝트 없음"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    시스템 프롬프트
                  </h3>
                  <p className="mt-1 font-medium">
                    {template.system_prompts?.name || "없음"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    카테고리
                  </h3>
                  <p
                    className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}
                  >
                    {template.variables?.category || "기타"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">생성일</h3>
                  <p className="mt-1">
                    {new Date(template.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    마지막 수정일
                  </h3>
                  <p className="mt-1">
                    {new Date(template.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {variableFields.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">입력 변수</h2>
                <div className="space-y-3">
                  {variableFields.map((field, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{field.name}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            field.required
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {field.required ? "필수" : "선택"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        타입: {field.type}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* 우측: 주요 콘텐츠 */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">템플릿 내용</h2>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <pre className="whitespace-pre-wrap text-sm font-mono text-gray-700">
                  {template.content}
                </pre>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">템플릿 활용</h2>
              <p className="text-gray-600 mb-6">
                이 템플릿을 사용하여 쉽고 빠르게 프롬프트를 생성할 수 있습니다.
                변수 값만 입력하면 사용자 맞춤형 프롬프트를 자동으로 만들어
                드립니다.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="h-5 w-5 text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-purple-700">
                    중괄호(&#123;&#123;name&#125;&#125;)로 둘러싸인 부분이
                    변수입니다. 변수 값을 대체하여 완성된 프롬프트를 만들 수
                    있습니다.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => router.push("/prompt-test")}
                >
                  프롬프트 테스트하기
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </NavLayout>
  );
}
