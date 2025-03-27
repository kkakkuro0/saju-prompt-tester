"use client";

import Image from 'next/image';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

export default function AuthLayout({ children, title, subtitle, backgroundImage = "/imgs/winter1.jpg" }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col sm:flex-row">
      {/* 왼쪽 이미지 영역 */}
      <div className="hidden sm:block sm:w-1/2 relative">
        <Image
          src={backgroundImage}
          alt="Background image"
          fill
          style={{ objectFit: 'cover' }}
          priority
          className="brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent flex flex-col justify-center px-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            사주 프롬프트 테스터
          </h1>
          <p className="text-xl text-white/80">
            AI와 함께하는 사주팔자 분석
          </p>
        </div>
      </div>

      {/* 오른쪽 콘텐츠 영역 */}
      <div className="w-full sm:w-1/2 bg-white flex flex-col justify-center items-center px-4 py-12 sm:py-0">
        <div className="w-full max-w-md">
          {/* 모바일에서만 보이는 로고 */}
          <div className="flex justify-center mb-8 sm:hidden">
            <div className="relative w-16 h-16 rounded-full overflow-hidden">
              <Image 
                src="/imgs/cheyoung1.jpg" 
                alt="Logo"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h2>
          
          {subtitle && (
            <p className="text-base text-gray-600 text-center mb-8">
              {subtitle}
            </p>
          )}

          {/* 실제 컨텐츠 (로그인 폼 등) */}
          {children}
        </div>
      </div>
    </div>
  );
}
