"use client";

import { Suspense } from "react";
import dynamic from 'next/dynamic';
import AuthLayout from "@/components/layout/AuthLayout";

// 동적으로 LoginForm 컴포넌트 가져오기
const LoginForm = dynamic(() => import('@/components/auth/LoginForm'), {
  loading: () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  ),
});

// 랜덤으로 배경 이미지 선택
const getRandomBackgroundImage = () => {
  const images = [
    "/imgs/winter1.jpg",
    "/imgs/winter2.jpg", 
    "/imgs/winter3.jpg",
    "/imgs/cheyoung2.webp",
    "/imgs/cheyoung3.webp",
    "/imgs/julli1.jpg",
    "/imgs/julli2.jpg",
    "/imgs/beak2.jpg",
    "/imgs/beak3.jpg"
  ];
  return images[Math.floor(Math.random() * images.length)];
};

export default function LoginPage() {
  const backgroundImage = getRandomBackgroundImage();

  return (
    <AuthLayout 
      title="환영합니다"
      subtitle="사주 프롬프트 테스트 시스템에 로그인하세요" 
      backgroundImage={backgroundImage}
    >
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
