"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import NavLayout from "@/components/layout/NavLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { User } from "@supabase/supabase-js";

interface Project {
  id: string;
  name: string;
  description: string;
  updated_at: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  updated_at: string;
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalPrompts: number;
  totalTemplates: number;
  lastWeekActivity: number;
}

// 샘플 알림
const sampleNotifications = [
  {
    id: 1,
    title: "프로젝트 완료",
    message: "여름 운세 프로젝트가 완료되었습니다.",
    time: "1시간 전",
    read: false,
  },
  {
    id: 2,
    title: "새 템플릿 추가",
    message: "새로운 사주 분석 템플릿이 추가되었습니다.",
    time: "3시간 전",
    read: false,
  },
  {
    id: 3,
    title: "시스템 업데이트",
    message: "시스템이 최신 버전으로 업데이트되었습니다.",
    time: "1일 전",
    read: true,
  },
];

export default function DashboardPage() {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recommendedTemplates, setRecommendedTemplates] = useState<Template[]>(
    []
  );
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalPrompts: 0,
    totalTemplates: 0,
    lastWeekActivity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 사용자 정보 가져오기
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user) {
          setUserData(user);

          // 최근 프로젝트
          const { data: projects, error: projectsError } = await supabase
            .from("projects")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(6);

          if (projectsError) throw projectsError;
          setRecentProjects(projects || []);

          // 추천 템플릿
          const { data: templates, error: templatesError } = await supabase
            .from("prompt_templates")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(3);

          if (templatesError) throw templatesError;
          setRecommendedTemplates(templates || []);

          // 통계 데이터
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

          // 모든 프로젝트 수
          const { count: totalProjects, error: projectsCountError } =
            await supabase
              .from("projects")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id);

          if (projectsCountError) throw projectsCountError;

          // 최근 1주일 활성화된 프로젝트 수
          const { count: activeProjects, error: activeProjectsError } =
            await supabase
              .from("projects")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id)
              .gt("updated_at", oneWeekAgo.toISOString());

          if (activeProjectsError) throw activeProjectsError;

          // 시스템 프롬프트 수
          const { count: totalPrompts, error: promptsCountError } =
            await supabase
              .from("system_prompts")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id);

          if (promptsCountError) throw promptsCountError;

          // 템플릿 수
          const { count: totalTemplates, error: templatesCountError } =
            await supabase
              .from("prompt_templates")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id);

          if (templatesCountError) throw templatesCountError;

          setStats({
            totalProjects: totalProjects || 0,
            activeProjects: activeProjects || 0,
            completedProjects: (totalProjects || 0) - (activeProjects || 0),
            totalPrompts: totalPrompts || 0,
            totalTemplates: totalTemplates || 0,
            lastWeekActivity: activeProjects || 0,
          });
        }
      } catch (err: unknown) {
        console.error("데이터 조회 실패:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "데이터를 불러오는데 실패했습니다.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <Card className="max-w-md mx-auto text-center p-8">
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
            <Button onClick={() => window.location.reload()}>다시 시도</Button>
          </Card>
        </div>
      </NavLayout>
    );
  }

  return (
    <NavLayout>
      <div className="container mx-auto px-4 py-8">
        {/* 환영 배너 */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-0">
            <Image
              src="/imgs/winter2.jpg"
              alt="Welcome banner"
              fill
              className="object-cover brightness-[0.7]"
              priority
            />
          </div>
          <div className="relative z-10 px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              안녕하세요, {userData?.user_metadata?.name || "사용자"}님!
            </h1>
            <p className="text-white text-lg max-w-2xl mb-6">
              사주 프롬프트 테스터에 오신 것을 환영합니다. 여기서 다양한 사주
              프롬프트 템플릿을 테스트하고, 결과를 분석해보세요.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => (window.location.href = "/projects/new")}
              >
                새 프로젝트 만들기
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/20 border-white text-white hover:bg-white/30"
                onClick={() => (window.location.href = "/templates")}
              >
                템플릿 둘러보기
              </Button>
            </div>
          </div>
        </div>

        {/* 대시보드 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 flex flex-col">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-4">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">총 프로젝트</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalProjects}
                </h3>
              </div>
            </div>
            <div className="mt-auto">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: stats.totalProjects > 0 ? "100%" : "0%" }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">완성된 프로젝트</p>
            </div>
          </Card>

          <Card className="p-6 flex flex-col">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">활성 프로젝트</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.activeProjects}
                </h3>
              </div>
            </div>
            <div className="mt-auto">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{
                    width:
                      stats.totalProjects > 0
                        ? `${
                            (stats.activeProjects / stats.totalProjects) * 100
                          }%`
                        : "0%",
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">최근 7일 활성화됨</p>
            </div>
          </Card>

          <Card className="p-6 flex flex-col">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">시스템 프롬프트</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalPrompts}
                </h3>
              </div>
            </div>
            <div className="mt-auto">
              <Link
                href="/system-prompts"
                className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center"
              >
                <span>모든 프롬프트 보기</span>
                <svg
                  className="h-4 w-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </Card>

          <Card className="p-6 flex flex-col">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-4">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">템플릿</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalTemplates}
                </h3>
              </div>
            </div>
            <div className="mt-auto">
              <Link
                href="/templates"
                className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center"
              >
                <span>모든 템플릿 보기</span>
                <svg
                  className="h-4 w-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </Card>
        </div>

        {/* 주요 섹션 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 최근 프로젝트 */}
          <div className="lg:col-span-2">
            <Card className="h-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  최근 프로젝트
                </h2>
                <Link
                  href="/projects"
                  className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                >
                  <span>모두 보기</span>
                  <svg
                    className="h-4 w-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>

              {recentProjects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    프로젝트가 없습니다
                  </h3>
                  <p className="text-gray-500 mb-6">
                    첫 번째 프로젝트를 만들어 보세요!
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/projects/new")}
                  >
                    새 프로젝트 만들기
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block"
                    >
                      <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {project.name}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                              {project.description || "설명 없음"}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(project.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* 알림 */}
          <div>
            <Card className="h-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">알림</h2>
                <button className="text-sm text-indigo-600 hover:text-indigo-800">
                  모두 읽음 표시
                </button>
              </div>

              <div className="space-y-4">
                {sampleNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg ${
                      notification.read
                        ? "bg-gray-50"
                        : "bg-indigo-50 border-l-4 border-indigo-500"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`flex-shrink-0 h-8 w-8 rounded-full ${
                          notification.read
                            ? "bg-gray-200 text-gray-500"
                            : "bg-indigo-200 text-indigo-600"
                        } flex items-center justify-center mr-3`}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            notification.read
                              ? "text-gray-500"
                              : "text-gray-900"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p
                          className={`text-sm ${
                            notification.read
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* 추천 템플릿 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">추천 템플릿</h2>
            <Link
              href="/templates"
              className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center"
            >
              <span>모두 보기</span>
              <svg
                className="h-4 w-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {recommendedTemplates.length === 0 ? (
            <Card className="text-center py-12">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                템플릿이 없습니다
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                첫 번째 템플릿을 만들어 프롬프트를 더 효율적으로 관리해보세요!
              </p>
              <Button onClick={() => (window.location.href = "/templates/new")}>
                새 템플릿 만들기
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedTemplates.map((template) => (
                <Link
                  key={template.id}
                  href={`/templates/${template.id}`}
                  className="block h-full"
                >
                  <Card className="p-6 h-full hover:shadow-md transition-shadow">
                    <div className="flex flex-col h-full">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4 flex-grow">
                        {template.description || "설명 없음"}
                      </p>
                      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          {new Date(template.updated_at).toLocaleDateString()}
                        </span>
                        <div className="inline-flex items-center text-sm text-indigo-600">
                          <span>사용하기</span>
                          <svg
                            className="h-4 w-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </NavLayout>
  );
}
