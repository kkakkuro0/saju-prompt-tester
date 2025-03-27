"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import NavLayout from "@/components/layout/NavLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "completed" | "archived">(
    "active"
  );
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

      // 상태를 설명에 포함시키기
      const descriptionWithStatus =
        status === "active" ? description : `${description} [${status}]`;

      const { error: insertError } = await supabase.from("projects").insert([
        {
          name,
          description: descriptionWithStatus,
          user_id: userData.user.id,
        },
      ]);

      if (insertError) throw insertError;

      router.push("/projects");
    } catch (err) {
      console.error("프로젝트 생성 실패:", err);
      setError("프로젝트 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 상태에 따른 아이콘 및 색상
  const statusOptions = [
    {
      value: "active",
      label: "진행 중",
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      value: "completed",
      label: "완료됨",
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      value: "archived",
      label: "보관됨",
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
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
  ];

  return (
    <NavLayout>
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 배너 */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-0">
            <Image
              src="/imgs/winter2.jpg"
              alt="New Project Banner"
              fill
              className="object-cover brightness-75"
              priority
            />
          </div>
          <div className="relative z-10 px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              새 프로젝트 만들기
            </h1>
            <p className="text-white text-lg max-w-2xl">
              새로운 사주 분석 프로젝트를 만들어 템플릿과 시스템 프롬프트를
              체계적으로 관리하세요.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  프로젝트 이름
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="프로젝트 이름을 입력하세요"
                />
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
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="프로젝트에 대한 설명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  프로젝트 상태
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {statusOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        status === option.value
                          ? `border-blue-500 ${option.bg}`
                          : "border-gray-200 hover:border-blue-200"
                      }`}
                      onClick={() =>
                        setStatus(
                          option.value as "active" | "completed" | "archived"
                        )
                      }
                    >
                      <div className={`p-2 rounded-full mr-3 ${option.bg}`}>
                        <span className={option.color}>{option.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium">{option.label}</p>
                      </div>
                    </div>
                  ))}
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
                  {loading ? "생성 중..." : "프로젝트 생성"}
                </Button>
              </div>
            </form>
          </Card>

          {/* 안내 섹션 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-l-4 border-blue-500">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                프로젝트란?
              </h3>
              <p className="text-gray-600 text-sm">
                여러 사주 분석 템플릿과 시스템 프롬프트를 조직화하는 방법입니다.
              </p>
            </Card>
            <Card className="p-6 border-l-4 border-green-500">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                효율적인 관리
              </h3>
              <p className="text-gray-600 text-sm">
                관련 템플릿과 프롬프트를 프로젝트로 그룹화하여 쉽게 찾고 관리할
                수 있습니다.
              </p>
            </Card>
            <Card className="p-6 border-l-4 border-purple-500">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                맞춤형 서비스
              </h3>
              <p className="text-gray-600 text-sm">
                고객별 또는 주제별로 프로젝트를 만들어 맞춤형 서비스를
                제공하세요.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </NavLayout>
  );
}
