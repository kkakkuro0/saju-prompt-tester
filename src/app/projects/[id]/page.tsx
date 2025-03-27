import ProjectClient from "./client"; // 클라이언트 컴포넌트 import

// 이 함수는 서버 컴포넌트입니다 (기본적으로 Next.js 13+ App Router의 페이지는 서버 컴포넌트)
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectClient id={id} />;
}
