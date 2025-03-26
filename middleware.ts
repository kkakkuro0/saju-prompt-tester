import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    // 응답 객체 생성
    const res = NextResponse.next();

    // Supabase 클라이언트 생성
    const supabase = createMiddlewareClient({ req: request, res });

    // 세션 확인
    const { data: { session } } = await supabase.auth.getSession();

    // 현재 경로
    const path = request.nextUrl.pathname;

    // 공개 경로 목록
    const publicPaths = ["/login", "/signup", "/"];
    const isPublicPath = publicPaths.includes(path);

    // 로그인되어 있고 공개 경로에 접근하는 경우
    if (session && isPublicPath) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 로그인되어 있지 않고 보호된 경로에 접근하는 경우
    if (!session && !isPublicPath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
