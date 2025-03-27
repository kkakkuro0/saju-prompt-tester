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
    
    // 공개 경로 목록 (signup 제거됨)
    const publicPaths = ["/login", "/setup-page", "/debug-admin", "/supabase-fix"];
    const isPublicPath = publicPaths.includes(path);
    
    // 루트 경로를 명시적으로 처리
    if (path === "/" && !session) {
      return NextResponse.redirect(new URL("/simple-login", request.url));
    }
    
    // 로컬 스토리지 기반 인증도 확인
    // (미들웨어는 서버 사이드에서 실행되므로 여기서는 직접 확인 불가)
    // 대신 클라이언트 측에서 체크하도록 수정했음

    // 로그인되어 있고 공개 경로에 접근하는 경우
    if (session && isPublicPath) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    
    // 관리자 페이지 접근 제한
    if (path.startsWith("/admin")) {
      // 로그인하지 않은 경우
      if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      
      // 로그인한 경우 관리자 권한 확인
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      if (error || !data || data.role !== 'admin') {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // 로그인되어 있지 않고 보호된 경로에 접근하는 경우
    if (!session && !isPublicPath) {
      // 회원가입 페이지 접근 차단
      if (path === "/signup") {
        return NextResponse.redirect(new URL("/simple-login", request.url));
      }
      return NextResponse.redirect(new URL("/simple-login", request.url));
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
    "/"  // 루트 경로를 명시적으로 매칭
  ],
};
