"use client";

import { Suspense } from "react";
import SimpleLoginForm from "@/components/auth/SimpleLoginForm";

export default function SimpleLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            GPT 프롬프트 테스터
          </h1>
          <p className="text-lg text-gray-600">
            사내용 GPT 프롬프트 테스트 플랫폼
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          }
        >
          <SimpleLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
