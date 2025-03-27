"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import NavLayout from "@/components/layout/NavLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
  popularity: number;
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

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"latest" | "popular">("latest");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);

      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      // 템플릿 조회 - prompt_templates 테이블 사용
      const { data, error } = await supabase
        .from("prompt_templates")
        .select(
          `
          id,
          name,
          description,
          content,
          created_at,
          updated_at,
          variables,
          project_id
        `
        )
        .eq("user_id", userData.user.id);

      if (error) throw error;

      // 데이터를 Template 인터페이스에 맞게 변환
      const templatesData = data.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description || "",
        category: template.variables?.category || "기타", // variables JSON에서 카테고리 추출
        created_at: template.created_at,
        updated_at: template.updated_at,
        popularity: 0, // 인기도는 별도로 저장되지 않으므로 기본값 0
      }));

      setTemplates(templatesData);
      console.log("템플릿 로드 성공:", templatesData);
    } catch (err) {
      console.error("템플릿 조회 실패:", err);
      setError("템플릿을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 필터링 및 정렬된 템플릿 목록 계산
  const filteredTemplates = templates
    .filter((template) => {
      // 검색어 필터링
      if (
        searchQuery &&
        !template.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !template.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // 카테고리 필터링
      if (selectedCategory && template.category !== selectedCategory) {
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
        return b.popularity - a.popularity;
      }
    });

  // 중복 없는 카테고리 목록 추출
  const categories = [
    ...new Set(templates.map((template) => template.category)),
  ];

  if (loading) {
    return (
      <NavLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-purple-700 font-medium">로딩 중...</p>
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
            <Button onClick={fetchTemplates}>다시 시도</Button>
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
              src="/imgs/winter3.jpg"
              alt="Templates banner"
              fill
              className="object-cover brightness-75"
              priority
            />
          </div>
          <div className="relative z-10 px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              프롬프트 템플릿
            </h1>
            <p className="text-white text-lg max-w-2xl mb-8">
              다양한 사주 분석 템플릿을 찾아보세요. 운세, 궁합, 재물, 건강 등
              여러 분야의 템플릿이 준비되어 있습니다.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/templates/new")}
            >
              새 템플릿 만들기
            </Button>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="sr-only">
                  템플릿 검색
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="템플릿 검색"
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
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "latest" | "popular")
                  }
                >
                  <option value="latest">최신순</option>
                  <option value="popular">인기순</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    selectedCategory === null
                      ? "bg-purple-100 text-purple-800"
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

        {/* 템플릿 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => {
              const categoryStyle =
                categoryStyles[template.category] || categoryStyles["기타"];
              return (
                <Card key={template.id} className="overflow-hidden">
                  <div className="h-48 relative">
                    <Image
                      src={categoryStyle.image}
                      alt={template.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}
                      >
                        {template.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      <div className="flex items-center">
                        <svg
                          className="h-4 w-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm text-gray-600">
                          {template.popularity.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-500">
                        업데이트:{" "}
                        {new Date(template.updated_at).toLocaleDateString()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/templates/${template.id}`)}
                      >
                        사용하기
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-12">
              <Card className="text-center p-8">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-purple-100 p-3 mb-4">
                    <svg
                      className="h-8 w-8 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    템플릿을 찾을 수 없습니다
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

        {/* 추천 템플릿 섹션 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">인기 템플릿</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates
              .sort((a, b) => b.popularity - a.popularity)
              .slice(0, 3)
              .map((template) => {
                const categoryStyle =
                  categoryStyles[template.category] || categoryStyles["기타"];
                return (
                  <Card
                    key={template.id}
                    className="overflow-hidden border border-purple-200 shadow-md"
                  >
                    <div className="h-48 relative">
                      <Image
                        src={categoryStyle.image}
                        alt={template.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white">
                          {template.name}
                        </h3>
                        <div className="flex items-center mt-1">
                          <svg
                            className="h-4 w-4 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-1 text-sm text-white">
                            {template.popularity.toFixed(1)}
                          </span>
                          <span
                            className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}
                          >
                            {template.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 text-sm mb-4">
                        {template.description}
                      </p>
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => router.push(`/templates/${template.id}`)}
                      >
                        사용하기
                      </Button>
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
