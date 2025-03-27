"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import NavLayout from "@/components/layout/NavLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived" | "completed";
  created_at: string;
  updated_at: string;
  template_count: number;
  prompt_count: number;
}

// 상태 스타일 및 이미지
const statusStyles: Record<
  string,
  {
    color: string;
    bg: string;
    text: string;
    image: string;
    icon: React.ReactNode;
  }
> = {
  active: {
    color: "green",
    bg: "bg-green-100",
    text: "text-green-600",
    image: "/imgs/cheyoung2.webp",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  archived: {
    color: "gray",
    bg: "bg-gray-100",
    text: "text-gray-600",
    image: "/imgs/winter1.jpg",
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
  },
  completed: {
    color: "blue",
    bg: "bg-blue-100",
    text: "text-blue-600",
    image: "/imgs/gyujin1.webp",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"latest" | "name">("latest");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from("projects")
        .select(
          `
          id,
          name,
          description,
          created_at,
          updated_at
        `
        )
        .eq("user_id", userData.user.id);

      if (error) throw error;

      // 각 프로젝트와 연결된 템플릿 및 시스템 프롬프트 수 가져오기
      const projectsWithCount = await Promise.all(
        data.map(async (project) => {
          // 프로젝트에 연결된 템플릿 수 조회
          const { count: templateCount } = await supabase
            .from("prompt_templates")
            .select("id", { count: "exact", head: true })
            .eq("project_id", project.id);

          // 프로젝트에 연결된 시스템 프롬프트 수 조회
          const { count: promptCount } = await supabase
            .from("system_prompts")
            .select("id", { count: "exact", head: true })
            .eq("project_id", project.id);

          // 상태값 추출 (description에서 상태를 포함했다고 가정, 없으면 'active'로 기본값 설정)
          let status: "active" | "archived" | "completed" = "active";
          if (project.description) {
            if (project.description.toLowerCase().includes("completed")) {
              status = "completed";
            } else if (project.description.toLowerCase().includes("archived")) {
              status = "archived";
            }
          }

          return {
            id: project.id,
            name: project.name,
            description: project.description || "",
            status: status,
            created_at: project.created_at,
            updated_at: project.updated_at,
            template_count: templateCount || 0,
            prompt_count: promptCount || 0,
          };
        })
      );

      setProjects(projectsWithCount);
      console.log("프로젝트 로드 성공:", projectsWithCount);
    } catch (err) {
      console.error("프로젝트 조회 실패:", err);
      setError("프로젝트를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 필터링 및 정렬된 프로젝트 목록 계산
  const filteredProjects = projects
    .filter((project) => {
      // 검색어 필터링
      if (
        searchQuery &&
        !project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !project.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // 상태 필터링
      if (selectedStatus && project.status !== selectedStatus) {
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
        return a.name.localeCompare(b.name);
      }
    });

  // 중복 없는 상태 목록 추출
  const statuses = [...new Set(projects.map((project) => project.status))];

  // 프로젝트 통계 계산
  const projectStats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    archived: projects.filter((p) => p.status === "archived").length,
    templates: projects.reduce((acc, p) => acc + p.template_count, 0),
    prompts: projects.reduce((acc, p) => acc + p.prompt_count, 0),
  };

  if (loading) {
    return (
      <NavLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-blue-700 font-medium">로딩 중...</p>
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
            <Button onClick={fetchProjects}>다시 시도</Button>
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
              src="/imgs/jijel1.jpg"
              alt="Projects banner"
              fill
              className="object-cover brightness-75"
              priority
            />
          </div>
          <div className="relative z-10 px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              프로젝트
            </h1>
            <p className="text-white text-lg max-w-2xl mb-8">
              사주 및 운세 분석 프로젝트를 효율적으로 관리하세요. 템플릿과
              시스템 프롬프트를 조합하여 맞춤형 분석 서비스를 구축할 수
              있습니다.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/projects/new")}
            >
              새 프로젝트 만들기
            </Button>
          </div>
        </div>

        {/* 프로젝트 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4 border-t-4 border-blue-500">
            <p className="text-gray-500 text-sm">전체 프로젝트</p>
            <p className="text-2xl font-bold text-gray-900">
              {projectStats.total}
            </p>
          </Card>
          <Card className="p-4 border-t-4 border-green-500">
            <p className="text-gray-500 text-sm">진행 중</p>
            <p className="text-2xl font-bold text-gray-900">
              {projectStats.active}
            </p>
          </Card>
          <Card className="p-4 border-t-4 border-blue-500">
            <p className="text-gray-500 text-sm">완료됨</p>
            <p className="text-2xl font-bold text-gray-900">
              {projectStats.completed}
            </p>
          </Card>
          <Card className="p-4 border-t-4 border-gray-500">
            <p className="text-gray-500 text-sm">보관됨</p>
            <p className="text-2xl font-bold text-gray-900">
              {projectStats.archived}
            </p>
          </Card>
          <Card className="p-4 border-t-4 border-purple-500">
            <p className="text-gray-500 text-sm">전체 템플릿</p>
            <p className="text-2xl font-bold text-gray-900">
              {projectStats.templates}
            </p>
          </Card>
          <Card className="p-4 border-t-4 border-indigo-500">
            <p className="text-gray-500 text-sm">전체 프롬프트</p>
            <p className="text-2xl font-bold text-gray-900">
              {projectStats.prompts}
            </p>
          </Card>
        </div>

        {/* 필터 및 검색 */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="sr-only">
                  프로젝트 검색
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="프로젝트 검색"
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
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "latest" | "name")
                  }
                >
                  <option value="latest">최신순</option>
                  <option value="name">이름순</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    selectedStatus === null
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedStatus(null)}
                >
                  전체
                </button>
                {statuses.map((status) => {
                  const style = statusStyles[status] || statusStyles["active"];
                  return (
                    <button
                      key={status}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${
                        selectedStatus === status
                          ? style.bg + " " + style.text
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                      onClick={() => setSelectedStatus(status)}
                    >
                      <span className={`mr-1.5 ${style.text}`}>
                        {style.icon}
                      </span>
                      {status === "active"
                        ? "진행 중"
                        : status === "completed"
                        ? "완료됨"
                        : "보관됨"}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* 프로젝트 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => {
              const statusStyle = statusStyles[project.status];
              return (
                <Card
                  key={project.id}
                  className="overflow-hidden h-full flex flex-col"
                >
                  <div className="h-40 relative">
                    <Image
                      src={statusStyle.image}
                      alt={project.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white">
                        {project.name}
                      </h3>
                      <div className="flex items-center mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          <span className="mr-1">{statusStyle.icon}</span>
                          {project.status === "active"
                            ? "진행 중"
                            : project.status === "completed"
                            ? "완료됨"
                            : "보관됨"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-gray-600 text-sm mb-4 flex-1">
                      {project.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <p className="text-blue-700 font-semibold">
                          {project.template_count}
                        </p>
                        <p className="text-xs text-gray-500">템플릿</p>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-2 text-center">
                        <p className="text-indigo-700 font-semibold">
                          {project.prompt_count}
                        </p>
                        <p className="text-xs text-gray-500">프롬프트</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>
                        생성:{" "}
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        업데이트:{" "}
                        {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      상세보기
                    </Button>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-12">
              <Card className="text-center p-8">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-blue-100 p-3 mb-4">
                    <svg
                      className="h-8 w-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    프로젝트를 찾을 수 없습니다
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    검색어나 필터를 조정해보세요
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedStatus(null);
                    }}
                  >
                    필터 초기화
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* 신규 프로젝트 생성 안내 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            <div className="p-8 md:w-2/3">
              <h2 className="text-2xl font-bold text-white mb-4">
                새로운 프로젝트를 시작할 준비가 되셨나요?
              </h2>
              <p className="text-blue-100 mb-6">
                맞춤형 템플릿과 시스템 프롬프트를 활용하여 사주 분석 서비스를
                효율적으로 관리하세요. 클라이언트별 맞춤 설정, 템플릿 재사용,
                결과 추적이 모두 가능합니다.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push("/projects/new")}
              >
                지금 시작하기
              </Button>
            </div>
            <div className="md:w-1/3 relative hidden md:block">
              <div className="absolute inset-0">
                <Image
                  src="/imgs/yena1.jpg"
                  alt="Start new project"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </NavLayout>
  );
}
