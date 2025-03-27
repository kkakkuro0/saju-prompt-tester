"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import NavLayout from "@/components/layout/NavLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function NewSystemPromptPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("기초대화");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      // 카테고리를 설명에 포함시키기
      const descriptionWithCategory = `[${category}] ${description}`;

      const { error: insertError } = await supabase
        .from("system_prompts")
        .insert([
          {
            name,
            description: descriptionWithCategory,
            content,
            user_id: userData.user.id,
          },
        ]);

      if (insertError) throw insertError;

      router.push("/system-prompts");
    } catch (err) {
      console.error("시스템 프롬프트 생성 실패:", err);
      setError("시스템 프롬프트 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 옵션
  const categoryOptions = [
    {
      value: "기초대화",
      label: "기초대화",
      color: "bg-blue-100 text-blue-600",
    },
    {
      value: "분석역할",
      label: "분석역할",
      color: "bg-purple-100 text-purple-600",
    },
    {
      value: "상담역할",
      label: "상담역할",
      color: "bg-pink-100 text-pink-600",
    },
    {
      value: "사주분석",
      label: "사주분석",
      color: "bg-yellow-100 text-yellow-600",
    },
    { value: "전문가", label: "전문가", color: "bg-green-100 text-green-600" },
    { value: "기타", label: "기타", color: "bg-gray-100 text-gray-600" },
  ];

  return (
    <NavLayout>
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 배너 */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-0">
            <Image
              src="/imgs/cheyoung1.jpg"
              alt="New System Prompt Banner"
              fill
              className="object-cover brightness-75"
              priority
            />
          </div>
          <div className="relative z-10 px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              새 시스템 프롬프트 만들기
            </h1>
            <p className="text-white text-lg max-w-2xl">
              AI와의 대화를 위한 새로운 시스템 프롬프트를 생성하세요. 전문적인
              사주 분석을 위한 프롬프트를 작성해보세요.
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
                    프롬프트 이름
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="프롬프트 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    카테고리
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categoryOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`p-2 rounded-lg text-center cursor-pointer text-sm transition-colors ${
                          category === option.value
                            ? option.color + " font-medium"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => setCategory(option.value)}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
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
                  placeholder="프롬프트에 대한 설명을 입력하세요"
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  시스템 프롬프트 내용
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                  placeholder="시스템 프롬프트 내용을 입력하세요..."
                  required
                />
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
                  {loading ? "생성 중..." : "프롬프트 생성"}
                </Button>
              </div>
            </form>
          </Card>

          {/* 안내 섹션 */}
          <div className="mt-8">
            <Card className="p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">
                시스템 프롬프트 작성 팁
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
                        명확한 역할 설정:
                      </span>{" "}
                      "너는 사주명리학 전문가로서..."와 같이 AI의 역할을 명확히
                      정의하세요.
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
                        전문 용어 활용:
                      </span>{" "}
                      사주명리학의 전문 용어(천간, 지지, 오행 등)를 적절히
                      활용하세요.
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
                        응답 형식 지정:
                      </span>{" "}
                      "답변은 다음 형식으로 제공하세요: 1) 종합 운세, 2) 연애운,
                      3) 재물운..."과 같이 형식을 지정하면 일관된 결과를 얻을 수
                      있습니다.
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
                        제한사항 설정:
                      </span>{" "}
                      "미신적이거나 과학적 근거가 부족한 내용은 피하고, 실용적인
                      조언을 제공하세요."와 같은 제한을 두는 것이 좋습니다.
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
