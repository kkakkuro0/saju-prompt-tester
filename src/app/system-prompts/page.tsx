"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import NavLayout from "@/components/layout/NavLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

interface SystemPrompt {
  id: string;
  name: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
  usage_count: number;
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

export default function SystemPromptsPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"latest" | "popular">("latest");

  useEffect(() => {
    fetchSystemPrompts();
  }, []);

  const fetchSystemPrompts = async () => {
    try {
      setLoading(true);

      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      // 시스템 프롬프트 조회
      const { data, error } = await supabase
        .from("system_prompts")
        .select(
          `
          id,
          name,
          description,
          content,
          created_at,
          updated_at,
          project_id
        `
        )
        .eq("user_id", userData.user.id);

      if (error) throw error;

      // 데이터를 SystemPrompt 인터페이스에 맞게 변환
      const systemPrompts = data.map((prompt) => {
        // 설명에서 카테고리 추출 시도 (예: [분석역할] 형태로 시작하는 경우)
        let category = "기타";
        const description = prompt.description || "";

        // 카테고리 패턴 확인: [카테고리명] 또는 #카테고리명 형식
        const categoryPatternBracket = /^\[(.*?)\]/;
        const categoryPatternHash = /#(\w+)/;

        const bracketMatch = description.match(categoryPatternBracket);
        const hashMatch = description.match(categoryPatternHash);

        if (bracketMatch && bracketMatch[1]) {
          category = bracketMatch[1];
        } else if (hashMatch && hashMatch[1]) {
          category = hashMatch[1];
        } else {
          // 내용 기반 카테고리 추측
          const contentLower = prompt.content.toLowerCase();
          if (contentLower.includes("분석") || contentLower.includes("해석")) {
            category = "분석역할";
          } else if (
            contentLower.includes("상담") ||
            contentLower.includes("위로")
          ) {
            category = "상담역할";
          } else if (
            contentLower.includes("사주") ||
            contentLower.includes("운세")
          ) {
            category = "사주분석";
          } else if (
            contentLower.includes("전문가") ||
            contentLower.includes("specialist")
          ) {
            category = "전문가";
          } else if (
            contentLower.includes("대화") ||
            contentLower.includes("chat")
          ) {
            category = "기초대화";
          }
        }

        return {
          id: prompt.id,
          name: prompt.name,
          description: description,
          category: category,
          created_at: prompt.created_at,
          updated_at: prompt.updated_at,
          usage_count: 0, // 사용량은 별도로 저장되지 않으므로 기본값 0
        };
      });

      setPrompts(systemPrompts);
      console.log("시스템 프롬프트 로드 성공:", systemPrompts);
    } catch (err) {
      console.error("시스템 프롬프트 조회 실패:", err);
      setError("시스템 프롬프트를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 필터링 및 정렬된 프롬프트 목록 계산
  const filteredPrompts = prompts
    .filter((prompt) => {
      // 검색어 필터링
      if (
        searchQuery &&
        !prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !prompt.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // 카테고리 필터링
      if (selectedCategory && prompt.category !== selectedCategory) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // 정렬
      if (sortOrder === "latest") {
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      } else {
        return b.usage_count - a.usage_count;
      }
    });

  // 중복 없는 카테고리 목록 추출
  const categories = [...new Set(prompts.map((prompt) => prompt.category))];

  if (loading) {
    return (
      <NavLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-indigo-700 font-medium">로딩 중...</p>
          </div>
        </div>
      </NavLayout>
    );
  }

  if (error) {
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
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchSystemPrompts}>다시 시도</Button>
          </Card>
        </div>
      </NavLayout>
    );
  }

  return (
    <NavLayout>
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 배너 */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-0">
            <Image
              src="/imgs/winter1.jpg"
              alt="System Prompts banner"
              fill
              className="object-cover brightness-75"
              priority
            />
          </div>
          <div className="relative z-10 px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              시스템 프롬프트
            </h1>
            <p className="text-white text-lg max-w-2xl mb-8">
              AI와의 대화에 사용할 다양한 시스템 프롬프트를 관리하세요. 전문
              분야별로 특화된 프롬프트로 더 정확한 결과를 얻을 수 있습니다.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/system-prompts/new")}
            >
              새 시스템 프롬프트 만들기
            </Button>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="sr-only">
                  시스템 프롬프트 검색
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="프롬프트 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-shrink-0">
                <label htmlFor="sort" className="sr-only">
                  정렬 방식
                </label>
                <select
                  id="sort"
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "latest" | "popular")
                  }
                >
                  <option value="latest">최신순</option>
                  <option value="popular">사용량순</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    selectedCategory === null
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  전체
                </button>
                {categories.map((category) => {
                  const style =
                    categoryStyles[category] || categoryStyles["기타"];
                  return (
                    <button
                      key={category}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        selectedCategory === category
                          ? style.bg + " " + style.text
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* 프롬프트 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredPrompts.length > 0 ? (
            filteredPrompts.map((prompt) => {
              const categoryStyle =
                categoryStyles[prompt.category] || categoryStyles["기타"];
              return (
                <Card
                  key={prompt.id}
                  className="overflow-hidden h-full flex flex-col"
                >
                  <div className="h-32 relative">
                    <Image
                      src={categoryStyle.image}
                      alt={prompt.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}
                      >
                        {prompt.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {prompt.name}
                      </h3>
                      <div className="flex items-center bg-indigo-50 px-2 py-1 rounded-md">
                        <svg
                          className="h-4 w-4 text-indigo-500 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span className="text-xs font-medium text-indigo-600">
                          {prompt.usage_count}회 사용
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 flex-1">
                      {prompt.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-500">
                        업데이트:{" "}
                        {new Date(prompt.updated_at).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/system-prompts/${prompt.id}`)
                          }
                        >
                          상세보기
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            router.push(`/system-prompts/${prompt.id}/edit`)
                          }
                        >
                          편집
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-12">
              <Card className="text-center p-8">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-indigo-100 p-3 mb-4">
                    <svg
                      className="h-8 w-8 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    프롬프트를 찾을 수 없습니다
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    검색어나 필터를 조정해보세요
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(null);
                    }}
                  >
                    필터 초기화
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* 활용 팁 섹션 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            시스템 프롬프트 활용 팁
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-l-4 border-indigo-500">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                전문성 있는 표현
              </h3>
              <p className="text-gray-600 text-sm">
                시스템 프롬프트에 전문 용어와 표현을 포함하면 더 전문적인 답변을
                얻을 수 있습니다.
              </p>
            </Card>
            <Card className="p-6 border-l-4 border-green-500">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                다양한 카테고리 활용
              </h3>
              <p className="text-gray-600 text-sm">
                사주, 운세, 상담 등 다양한 카테고리별 시스템 프롬프트를 준비하면
                더 정확한 분석이 가능합니다.
              </p>
            </Card>
            <Card className="p-6 border-l-4 border-purple-500">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                프롬프트 조합하기
              </h3>
              <p className="text-gray-600 text-sm">
                여러 시스템 프롬프트의 장점을 조합하여 자신만의 특화된
                프롬프트를 만들어보세요.
              </p>
            </Card>
          </div>
        </div>

        {/* 추천 프롬프트 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            인기 시스템 프롬프트
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prompts
              .sort((a, b) => b.usage_count - a.usage_count)
              .slice(0, 2)
              .map((prompt) => {
                const categoryStyle =
                  categoryStyles[prompt.category] || categoryStyles["기타"];
                return (
                  <Card
                    key={prompt.id}
                    className="overflow-hidden border border-indigo-200 shadow-md"
                  >
                    <div className="flex flex-col md:flex-row h-full">
                      <div className="md:w-1/3 h-48 md:h-auto relative">
                        <Image
                          src={categoryStyle.image}
                          alt={prompt.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6 md:w-2/3">
                        <div className="flex items-center mb-2">
                          <h3 className="text-xl font-bold text-gray-900 mr-3">
                            {prompt.name}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}
                          >
                            {prompt.category}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                          {prompt.description}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <svg
                            className="h-4 w-4 mr-1 text-indigo-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          <span className="font-medium">
                            {prompt.usage_count}회 사용됨
                          </span>
                          <span className="mx-2">•</span>
                          <span>
                            마지막 업데이트:{" "}
                            {new Date(prompt.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                        <Button
                          variant="primary"
                          className="w-full"
                          onClick={() =>
                            router.push(`/system-prompts/${prompt.id}`)
                          }
                        >
                          지금 사용하기
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      </div>
    </NavLayout>
  );
}
