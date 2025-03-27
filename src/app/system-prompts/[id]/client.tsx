"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import NavLayout from "@/components/layout/NavLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface SystemPrompt {
  id: string;
  name: string;
  description: string;
  content: string;
  project_id: string | null;
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
  기초대화: {
    color: "blue",
    bg: "bg-blue-100",
    text: "text-blue-600",
    image: "/imgs/yena1.jpg",
  },
  분석역할: {
    color: "purple",
    bg: "bg-purple-100",
    text: "text-purple-600",
    image: "/imgs/jijel1.jpg",
  },
  상담역할: {
    color: "pink",
    bg: "bg-pink-100",
    text: "text-pink-600",
    image: "/imgs/cheyoung2.webp",
  },
  사주분석: {
    color: "yellow",
    bg: "bg-yellow-100",
    text: "text-yellow-600",
    image: "/imgs/gyujin1.webp",
  },
  전문가: {
    color: "green",
    bg: "bg-green-100",
    text: "text-green-600",
    image: "/imgs/beak1.jpg",
  },
  기타: {
    color: "gray",
    bg: "bg-gray-100",
    text: "text-gray-600",
    image: "/imgs/winter1.jpg",
  },
};

export default function SystemPromptClient({ id }: { id: string }) {
  const router = useRouter();
  const [systemPrompt, setSystemPrompt] = useState<SystemPrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("기타");

  const fetchSystemPrompt = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("system_prompts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setSystemPrompt(data);

      // 설명에서 카테고리 추출 시도 (예: [분석역할] 형태로 시작하는 경우)
      if (data.description) {
        const categoryPatternBracket = /^\[(.*?)\]/;
        const categoryPatternHash = /#(\w+)/;

        const bracketMatch = data.description.match(categoryPatternBracket);
        const hashMatch = data.description.match(categoryPatternHash);

        if (bracketMatch && bracketMatch[1]) {
          setCategory(bracketMatch[1]);
        } else if (hashMatch && hashMatch[1]) {
          setCategory(hashMatch[1]);
        } else {
          // 내용 기반 카테고리 추측
          const contentLower = data.content.toLowerCase();
          if (contentLower.includes("분석") || contentLower.includes("해석")) {
            setCategory("분석역할");
          } else if (
            contentLower.includes("상담") ||
            contentLower.includes("위로")
          ) {
            setCategory("상담역할");
          } else if (
            contentLower.includes("사주") ||
            contentLower.includes("운세")
          ) {
            setCategory("사주분석");
          } else if (
            contentLower.includes("전문가") ||
            contentLower.includes("specialist")
          ) {
            setCategory("전문가");
          } else if (
            contentLower.includes("대화") ||
            contentLower.includes("chat")
          ) {
            setCategory("기초대화");
          }
        }
      }
    } catch (err) {
      console.error("시스템 프롬프트 조회 실패:", err);
      setError("시스템 프롬프트를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSystemPrompt();
  }, [fetchSystemPrompt]);

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 시스템 프롬프트를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("system_prompts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      router.push("/system-prompts");
    } catch (err) {
      console.error("시스템 프롬프트 삭제 실패:", err);
      setError("시스템 프롬프트 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <NavLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <span className="text-lg font-medium text-indigo-700">
              로딩 중...
            </span>
          </div>
        </div>
      </NavLayout>
    );
  }

  if (error || !systemPrompt) {
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
              {error || "시스템 프롬프트를 찾을 수 없습니다."}
            </p>
            <Button onClick={() => router.push("/system-prompts")}>
              프롬프트 목록으로
            </Button>
          </Card>
        </div>
      </NavLayout>
    );
  }

  const categoryStyle = categoryStyles[category] || categoryStyles["기타"];

  return (
    <NavLayout>
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 배너 */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-0">
            <Image
              src={categoryStyle.image}
              alt={systemPrompt.name}
              fill
              className="object-cover brightness-75"
              priority
            />
          </div>
          <div className="relative z-10 px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {systemPrompt.name}
                </h1>
                <p className="text-white text-lg max-w-2xl mb-2">
                  {systemPrompt.description}
                </p>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text} mr-2`}
                  >
                    {category}
                  </span>
                  <span className="text-white text-sm">
                    마지막 업데이트:{" "}
                    {new Date(systemPrompt.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  onClick={() =>
                    router.push(`/system-prompts/${systemPrompt.id}/edit`)
                  }
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
                  onClick={() => router.push("/system-prompts")}
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
              <h2 className="text-xl font-semibold mb-4">프롬프트 정보</h2>
              <div className="space-y-4">
                {systemPrompt.project_id && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      프로젝트
                    </h3>
                    <p className="mt-1 font-medium">연결된 프로젝트</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    카테고리
                  </h3>
                  <p
                    className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}
                  >
                    {category}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">생성일</h3>
                  <p className="mt-1">
                    {new Date(systemPrompt.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    마지막 수정일
                  </h3>
                  <p className="mt-1">
                    {new Date(systemPrompt.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">활용 팁</h2>
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-medium text-indigo-800 mb-2">
                    AI 성격 정의
                  </h3>
                  <p className="text-sm text-indigo-700">
                    이 시스템 프롬프트는 AI의 역할과 성격을 정의합니다. 사용자
                    질문에 맞게 AI가 어떻게 반응할지 결정합니다.
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-800 mb-2">
                    프롬프트 테스트
                  </h3>
                  <p className="text-sm text-purple-700">
                    프롬프트 테스트 페이지에서 다양한 입력을 제공하여 시스템
                    프롬프트의 성능을 확인해보세요.
                  </p>
                </div>

                <div className="mt-4">
                  <Button
                    variant="primary"
                    onClick={() => router.push("/prompt-test")}
                  >
                    프롬프트 테스트하기
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* 우측: 프롬프트 콘텐츠 */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">프롬프트 내용</h2>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <pre className="whitespace-pre-wrap text-sm font-mono text-gray-700">
                  {systemPrompt.content}
                </pre>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="h-5 w-5 text-yellow-400"
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
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      효과적인 시스템 프롬프트 작성 방법
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>명확한 역할과 지시사항을 포함하세요</li>
                        <li>필요한 제약조건이나 스타일 가이드를 명시하세요</li>
                        <li>구체적인 예시를 포함하면 더 좋습니다</li>
                        <li>너무 길거나 복잡한 지시는 피하세요</li>
                      </ul>
                    </div>
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
