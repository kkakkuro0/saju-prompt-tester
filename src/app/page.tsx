"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ImageSlider from "@/components/ui/ImageSlider";
import NavLayout from "@/components/layout/NavLayout";

// 이미지 경로 설정
const profileImages = {
  yena: ["/imgs/yena1.jpg", "/imgs/yena2.jpg", "/imgs/yena3.jpg"],
  jijel: ["/imgs/jijel1.jpg", "/imgs/jijel2.jpg", "/imgs/jijel3.webp"],
  cheyoung: [
    "/imgs/cheyoung1.jpg",
    "/imgs/cheyoung2.webp",
    "/imgs/cheyoung3.webp",
  ],
  winter: ["/imgs/winter1.jpg", "/imgs/winter2.jpg", "/imgs/winter3.jpg"],
  beak: ["/imgs/beak1.jpg", "/imgs/beak2.jpg", "/imgs/beak3.jpg"],
  gyujin: ["/imgs/gyujin1.webp", "/imgs/gyujin2.jpg"],
  julli: ["/imgs/julli1.jpg", "/imgs/julli2.jpg"],
};

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          router.push("/dashboard");
          return;
        }

        // 인증 체크 후 로딩 상태 변경
        setLoading(false);
      } catch (error) {
        console.error("Supabase auth check error:", error);
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleProfileSelect = (profile: string) => {
    setSelectedProfile(profile);
  };

  const handleLogin = () => {
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-700 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <NavLayout>
      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* 히어로 섹션 */}
          <section className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-purple-900 mb-6">
              AI로 사주팔자 분석을 해보세요
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              최첨단 AI 기술을 활용하여 당신의 사주를 분석하고 미래를
              예측해보세요. 간단한 정보만 입력하면 상세한 운세를 확인할 수
              있습니다.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleLogin}
              className="px-8"
            >
              지금 시작하기
            </Button>
          </section>

          {/* 프로필 섹션 */}
          <section className="mb-16">
            <h3 className="text-2xl font-bold text-purple-800 mb-6 text-center">
              프로필 선택
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Object.entries(profileImages).map(([name, images]) => (
                <Card
                  key={name}
                  className={`cursor-pointer ${
                    selectedProfile === name ? "ring-2 ring-purple-500" : ""
                  }`}
                  onClick={() => handleProfileSelect(name)}
                >
                  <div className="aspect-w-1 aspect-h-1 mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={images[0]}
                      alt={`${name} 프로필`}
                      className="object-cover w-full h-full"
                      width={300}
                      height={300}
                    />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 capitalize">
                    {name}
                  </h4>
                </Card>
              ))}
            </div>
          </section>

          {/* 선택된 프로필 상세 */}
          {selectedProfile && (
            <section className="mb-16">
              <h3 className="text-2xl font-bold text-purple-800 mb-6 text-center capitalize">
                {selectedProfile} 프로필
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-[400px]">
                  <ImageSlider
                    images={
                      profileImages[
                        selectedProfile as keyof typeof profileImages
                      ]
                    }
                    className="h-full"
                  />
                </div>
                <Card>
                  <h4 className="text-xl font-bold text-purple-900 mb-4 capitalize">
                    {selectedProfile}의 사주 분석
                  </h4>
                  <p className="text-gray-700 mb-4">
                    {selectedProfile}님의 사주팔자를 AI가 분석해드립니다. 자세한
                    내용을 확인하려면 로그인이 필요합니다.
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">운세 적중률</span>
                      <span className="font-medium">95%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">궁합 분석</span>
                      <span className="font-medium">가능</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">상세 분석</span>
                      <span className="font-medium">프리미엄</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleLogin}
                    >
                      분석 결과 확인하기
                    </Button>
                  </div>
                </Card>
              </div>
            </section>
          )}

          {/* 기능 소개 섹션 */}
          <section className="mb-16">
            <h3 className="text-2xl font-bold text-purple-800 mb-8 text-center">
              주요 기능
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">
                    개인 운세 분석
                  </h4>
                </div>
                <p className="text-gray-600">
                  생년월일과 시간을 바탕으로 개인 맞춤형 사주팔자를 분석하여
                  운세를 제공합니다.
                </p>
              </Card>
              <Card>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">
                    월별/연간 운세
                  </h4>
                </div>
                <p className="text-gray-600">
                  월별, 연간 운세를 제공하여 중요한 결정을 내릴 때 참고할 수
                  있는 정보를 제공합니다.
                </p>
              </Card>
              <Card>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">
                    궁합 분석
                  </h4>
                </div>
                <p className="text-gray-600">
                  두 사람의 사주를 비교 분석하여 연애, 결혼, 사업 등 다양한
                  관계의 궁합을 확인할 수 있습니다.
                </p>
              </Card>
            </div>
          </section>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-purple-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">사주 프롬프트 테스터</h2>
              <p className="text-purple-200 mt-2">©2024 모든 권리 보유</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-purple-200 hover:text-white">
                이용약관
              </a>
              <a href="#" className="text-purple-200 hover:text-white">
                개인정보처리방침
              </a>
              <a href="#" className="text-purple-200 hover:text-white">
                고객센터
              </a>
            </div>
          </div>
        </div>
      </footer>
    </NavLayout>
  );
}
