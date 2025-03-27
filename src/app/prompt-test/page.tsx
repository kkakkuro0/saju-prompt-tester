"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import NavLayout from "@/components/layout/NavLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  description: string;
  category: string;
}

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  promptCost: number;
  completionCost: number;
  totalCost: number;
}

export default function PromptTestPage() {
  const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<SystemPrompt | null>(
    null
  );
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);

  // GPT-4 비용 (1K 토큰당)
  const GPT4_PROMPT_COST = 0.03; // USD
  const GPT4_COMPLETION_COST = 0.06; // USD
  const USD_TO_KRW = 1350; // 환율 (예상)

  // 카테고리별 스타일
  const categoryStyles: Record<
    string,
    { color: string; bg: string; textColor: string; image: string }
  > = {
    기초대화: {
      color: "blue",
      bg: "bg-blue-100",
      textColor: "text-blue-600",
      image: "/imgs/cheyoung1.jpg",
    },
    분석역할: {
      color: "purple",
      bg: "bg-purple-100",
      textColor: "text-purple-600",
      image: "/imgs/cheyoung2.webp",
    },
    상담역할: {
      color: "pink",
      bg: "bg-pink-100",
      textColor: "text-pink-600",
      image: "/imgs/cheyoung3.jpg",
    },
    사주분석: {
      color: "yellow",
      bg: "bg-yellow-100",
      textColor: "text-yellow-600",
      image: "/imgs/winter1.jpg",
    },
    전문가: {
      color: "green",
      bg: "bg-green-100",
      textColor: "text-green-600",
      image: "/imgs/winter2.jpg",
    },
    기타: {
      color: "gray",
      bg: "bg-gray-100",
      textColor: "text-gray-600",
      image: "/imgs/winter3.jpg",
    },
  };

  // 시스템 프롬프트 가져오기
  useEffect(() => {
    async function fetchSystemPrompts() {
      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError) throw userError;

        const { data, error } = await supabase
          .from("system_prompts")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("name");

        if (error) throw error;

        // 데이터 가공 - 카테고리 추가
        const promptsWithCategory = data.map((prompt) => {
          // 설명에서 카테고리 추출 시도
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
            if (
              contentLower.includes("분석") ||
              contentLower.includes("해석")
            ) {
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
            ...prompt,
            category: category,
          };
        });

        setSystemPrompts(promptsWithCategory);
        console.log("시스템 프롬프트 로드 성공:", promptsWithCategory);
      } catch (err) {
        console.error("시스템 프롬프트 가져오기 실패:", err);
        setError("시스템 프롬프트를 가져오는데 실패했습니다.");
      } finally {
        setLoadingPrompts(false);
      }
    }

    fetchSystemPrompts();
  }, []);

  // 토큰수 계산 (GPT3/4 토크나이저의 근사값)
  const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
  };

  // 비용 계산
  const calculateCost = (
    promptTokens: number,
    completionTokens: number
  ): TokenUsage => {
    const promptCost = (promptTokens / 1000) * GPT4_PROMPT_COST;
    const completionCost = (completionTokens / 1000) * GPT4_COMPLETION_COST;
    const totalCost = promptCost + completionCost;

    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      promptCost,
      completionCost,
      totalCost,
    };
  };

  const handleTest = async () => {
    if (!selectedPrompt) {
      setError("시스템 프롬프트를 선택해주세요.");
      return;
    }

    if (!userInput.trim()) {
      setError("사용자 입력을 작성해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setOutput("");
    setTokenUsage(null);

    try {
      /* 임시 대체 처리 (API 엔드포인트 없을 경우)
      setTimeout(() => {
        // 샘플 응답
        const sampleResponse = `안녕하세요! 사주팔자 분석을 도와드리겠습니다.

${userInput}에 대한 분석 결과입니다:

1. 종합운세: 당신은 ${Math.random() > 0.5 ? '물' : '불'} 기운이 강한 사주를 가지고 있습니다. 
   이는 창의적이고 직관적인 성향을 나타냅니다.

2. 연애운: 올해는 특히 ${Math.random() > 0.5 ? '좋은' : '도전적인'} 시기입니다. 
   새로운 만남의 기회가 ${Math.random() > 0.5 ? '많을' : '적을'} 것으로 보입니다.

3. 재물운: ${Math.random() > 0.7 ? '매우 좋음' : Math.random() > 0.4 ? '보통' : '주의 필요'}
   특히 ${Math.random() > 0.5 ? '6월과 9월' : '3월과 11월'}에 주목할 필요가 있습니다.

4. 건강운: 전반적으로 ${Math.random() > 0.6 ? '양호' : '주의 필요'}합니다.
   ${Math.random() > 0.5 ? '소화기' : '호흡기'} 관리에 신경 쓰는 것이 좋겠습니다.

5. 조언: 당신의 사주는 ${Math.random() > 0.5 ? '물과 나무' : '흙과 금속'} 기운을 보강하면 좋습니다.
   ${Math.random() > 0.5 ? '푸른색과 검은색' : '노란색과 갈색'}을 일상에 활용해보세요.`;
        
        setOutput(sampleResponse);
        
        // 토큰 사용량 추정 및 비용 계산
        const promptTokens = estimateTokens(selectedPrompt.content + userInput);
        const completionTokens = estimateTokens(sampleResponse);
        
        setTokenUsage(calculateCost(promptTokens, completionTokens));
        setLoading(false);
      }, 2000);
      */

      // 실제 API 사용
      const response = await fetch("/api/test-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemPrompt: selectedPrompt.content,
          userInput,
        }),
      });

      if (!response.ok) {
        throw new Error("API 요청 실패");
      }

      const data = await response.json();
      setOutput(data.output);

      // API에서 반환한 실제 토큰 사용량 사용
      if (data.usage) {
        const { promptTokens, completionTokens } = data.usage;
        setTokenUsage(calculateCost(promptTokens, completionTokens));
      } else {
        // 토큰 정보가 없는 경우 추정치 사용
        const promptTokens = estimateTokens(selectedPrompt.content + userInput);
        const completionTokens = estimateTokens(data.output);
        setTokenUsage(calculateCost(promptTokens, completionTokens));
      }
    } catch (err) {
      console.error("프롬프트 테스트 실패:", err);
      setError("프롬프트 테스트에 실패했습니다. 다시 시도해주세요.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryStyle = (category: string) => {
    return categoryStyles[category] || categoryStyles["기타"];
  };

  return (
    <NavLayout>
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 배너 */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-0">
            <Image
              src="/imgs/cheyoung2.webp"
              alt="Prompt Test Banner"
              fill
              className="object-cover brightness-75"
              priority
            />
          </div>
          <div className="relative z-10 px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              프롬프트 테스트
            </h1>
            <p className="text-white text-lg max-w-2xl">
              시스템 프롬프트가 어떻게 작동하는지 테스트해보세요. 다양한
              입력으로 프롬프트의 효과를 확인하고 개선할 수 있습니다.
            </p>
          </div>
        </div>

        {loadingPrompts ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error && !selectedPrompt ? (
          <Card className="p-6 my-8 bg-red-50 border-red-200">
            <p className="text-red-500">{error}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 좌측: 프롬프트 선택 영역 */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="p-6 bg-white shadow-md rounded-xl border-0">
                <h2 className="font-bold text-lg mb-4 text-indigo-700">
                  시스템 프롬프트 선택
                </h2>

                <div className="space-y-4 max-h-[calc(100vh-380px)] overflow-y-auto pr-2 custom-scrollbar">
                  {systemPrompts.length === 0 ? (
                    <p className="text-gray-500">
                      사용 가능한 시스템 프롬프트가 없습니다.
                    </p>
                  ) : (
                    systemPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className={`p-4 rounded-lg ${
                          selectedPrompt?.id === prompt.id
                            ? `border-2 border-${
                                getCategoryStyle(prompt.category).color
                              }-500 ${
                                getCategoryStyle(prompt.category).bg
                              } shadow-md`
                            : "border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        } cursor-pointer transition-all`}
                        onClick={() => setSelectedPrompt(prompt)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{prompt.name}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              getCategoryStyle(prompt.category).bg
                            } ${getCategoryStyle(prompt.category).textColor}`}
                          >
                            {prompt.category}
                          </span>
                        </div>
                        {prompt.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {prompt.description}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {selectedPrompt && (
                <Card className="p-6 bg-white shadow-md rounded-xl border-0">
                  <h2 className="font-bold text-lg mb-4 text-indigo-700">
                    선택된 프롬프트 정보
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        이름:
                      </span>
                      <p className="font-medium">{selectedPrompt.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        카테고리:
                      </span>
                      <p
                        className={`inline-block ml-2 text-sm px-2 py-1 rounded-full ${
                          getCategoryStyle(selectedPrompt.category).bg
                        } ${
                          getCategoryStyle(selectedPrompt.category).textColor
                        }`}
                      >
                        {selectedPrompt.category}
                      </p>
                    </div>
                    {selectedPrompt.description && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          설명:
                        </span>
                        <p className="text-sm mt-1">
                          {selectedPrompt.description}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        프롬프트 내용:
                      </span>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar border border-gray-100">
                        {selectedPrompt.content}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* 우측: 테스트 영역 */}
            <div className="lg:col-span-9 space-y-6">
              <Card className="p-6 bg-white shadow-md rounded-xl border-0">
                <h2 className="font-bold text-lg mb-4 text-indigo-700">
                  사용자 입력
                </h2>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  rows={6}
                  placeholder="테스트하고 싶은 내용을 입력하세요. 예: '내 사주를 분석해줘. 내 생년월일은 1990년 5월 15일 오후 3시야.'"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm resize-none"
                />

                {userInput && (
                  <div className="mt-3 flex items-center justify-end bg-blue-50 p-2 rounded-lg">
                    <div className="flex items-center text-sm text-blue-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium">예상 토큰 수:</span>
                      <span className="ml-1">
                        {estimateTokens(userInput).toLocaleString()} 토큰
                      </span>
                      <span className="mx-2">|</span>
                      <span className="font-medium">예상 비용:</span>
                      <span className="ml-1">
                        $
                        {(
                          (estimateTokens(userInput) / 1000) *
                          GPT4_PROMPT_COST
                        ).toFixed(5)}
                        (₩
                        {Math.ceil(
                          (estimateTokens(userInput) / 1000) *
                            GPT4_PROMPT_COST *
                            USD_TO_KRW
                        ).toLocaleString()}
                        )
                      </span>
                    </div>
                  </div>
                )}

                {error && userInput && (
                  <div className="mt-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm border border-red-100">
                    <div className="flex">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleTest}
                    disabled={loading || !selectedPrompt}
                    className="px-8 py-2.5 text-base rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        처리 중...
                      </span>
                    ) : (
                      "테스트 실행"
                    )}
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-white shadow-md rounded-xl border-0">
                <h2 className="font-bold text-lg mb-4 text-indigo-700">결과</h2>
                {output ? (
                  <div>
                    <div className="p-5 bg-gray-50 rounded-lg whitespace-pre-wrap mb-4 border border-gray-100 text-gray-800">
                      {output}
                    </div>

                    {tokenUsage && (
                      <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                        <h3 className="font-bold text-indigo-800 mb-3 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          토큰 및 비용 정보
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="text-sm font-bold text-indigo-700 mb-3 pb-2 border-b border-indigo-100">
                              토큰 사용량
                            </h4>
                            <ul className="space-y-2">
                              <li className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  프롬프트:
                                </span>
                                <span className="text-sm font-medium">
                                  {tokenUsage.promptTokens.toLocaleString()}{" "}
                                  토큰
                                </span>
                              </li>
                              <li className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  응답:
                                </span>
                                <span className="text-sm font-medium">
                                  {tokenUsage.completionTokens.toLocaleString()}{" "}
                                  토큰
                                </span>
                              </li>
                              <li className="flex justify-between items-center pt-2 border-t border-gray-100">
                                <span className="text-sm font-bold text-gray-700">
                                  합계:
                                </span>
                                <span className="text-sm font-bold text-indigo-700">
                                  {tokenUsage.totalTokens.toLocaleString()} 토큰
                                </span>
                              </li>
                            </ul>
                          </div>

                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="text-sm font-bold text-indigo-700 mb-3 pb-2 border-b border-indigo-100">
                              비용 정보
                            </h4>
                            <ul className="space-y-2">
                              <li className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  프롬프트:
                                </span>
                                <span className="text-sm font-medium">
                                  ${tokenUsage.promptCost.toFixed(5)}
                                  <span className="text-xs text-gray-500 ml-1">
                                    (₩
                                    {Math.ceil(
                                      tokenUsage.promptCost * USD_TO_KRW
                                    ).toLocaleString()}
                                    )
                                  </span>
                                </span>
                              </li>
                              <li className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  응답:
                                </span>
                                <span className="text-sm font-medium">
                                  ${tokenUsage.completionCost.toFixed(5)}
                                  <span className="text-xs text-gray-500 ml-1">
                                    (₩
                                    {Math.ceil(
                                      tokenUsage.completionCost * USD_TO_KRW
                                    ).toLocaleString()}
                                    )
                                  </span>
                                </span>
                              </li>
                              <li className="flex justify-between items-center pt-2 border-t border-gray-100">
                                <span className="text-sm font-bold text-gray-700">
                                  합계:
                                </span>
                                <span className="text-sm font-bold text-indigo-700">
                                  ${tokenUsage.totalCost.toFixed(5)}
                                  <span className="text-sm text-indigo-600 ml-1">
                                    (₩
                                    {Math.ceil(
                                      tokenUsage.totalCost * USD_TO_KRW
                                    ).toLocaleString()}
                                    )
                                  </span>
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-10 text-center text-gray-400 bg-gray-50 rounded-lg">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-300 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p className="text-lg">
                      {selectedPrompt
                        ? "테스트 실행 버튼을 클릭하면 결과가 여기에 표시됩니다"
                        : "먼저 좌측에서 시스템 프롬프트를 선택해주세요"}
                    </p>
                  </div>
                )}
              </Card>

              {/* 사용 팁 */}
              <Card className="p-6 bg-white shadow-md rounded-xl border-0">
                <h2 className="font-bold text-lg mb-4 text-indigo-700 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  프롬프트 테스트 팁
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                        <span className="text-xs font-bold">1</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        다양한 사례로 테스트해보세요. 사주분석 프롬프트라면
                        다양한 생년월일과 시간으로 테스트해보세요.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                        <span className="text-xs font-bold">2</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        오류를 발견하면 프롬프트를 수정하고 다시 테스트해보세요.
                        점진적으로 개선하는 것이 좋습니다.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                        <span className="text-xs font-bold">3</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        특정 응답 형식을 얻기 위해서는 프롬프트에 명확한 지시를
                        포함시키세요.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                        <span className="text-xs font-bold">4</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        토큰 사용량을 고려하세요. 너무 긴 프롬프트는 비용이
                        증가할 수 있습니다. 핵심 지시사항을 간결하게 작성하는
                        것이 좋습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c7d2fe;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a5b4fc;
        }
      `}</style>
    </NavLayout>
  );
}
