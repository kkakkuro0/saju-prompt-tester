import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 이 API 엔드포인트는 user_roles 테이블을 생성하고 현재 로그인한 사용자에게 관리자 권한을 부여합니다.
export async function POST(request: Request) {
  try {
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        success: false, 
        error: "Supabase 환경 변수가 설정되지 않았습니다."
      }, { status: 500 });
    }

    // 요청 본문에서 사용자 ID 가져오기
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "사용자 ID가 필요합니다."
      }, { status: 400 });
    }

    // Supabase 서비스 롤 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 1. user_roles 테이블이 존재하는지 확인하고 없으면 생성
    try {
      await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_roles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            role TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
          );
          CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_id_key ON public.user_roles (user_id);
          ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
        `
      });
    } catch (error: any) {
      return NextResponse.json({ 
        success: false, 
        error: "테이블 생성 실패: " + error.message
      }, { status: 500 });
    }

    // 2. 모든 RLS 정책을 삭제하고 완전히 열린 정책으로 대체
    try {
      await supabase.rpc('execute_sql', {
        sql: `
          -- 기존 정책 삭제
          DROP POLICY IF EXISTS "Anyone can select user_roles" ON public.user_roles;
          DROP POLICY IF EXISTS "Authenticated users can insert their own role" ON public.user_roles;
          DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;
          DROP POLICY IF EXISTS "Users can delete their own role" ON public.user_roles;
          
          -- 새 정책 추가 (모든 작업 허용)
          CREATE POLICY "Allow all operations" ON public.user_roles
            USING (true)
            WITH CHECK (true);
        `
      });
    } catch (error: any) {
      console.error("정책 설정 실패:", error);
      // 계속 진행합니다 - 정책이 이미 삭제되었을 수 있음
    }

    // 3. 지정된 사용자에게 관리자 권한 부여
    try {
      // 기존 역할 삭제
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      // 새 역할 생성
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'admin' }]);
      
      if (roleError) {
        return NextResponse.json({ 
          success: false, 
          error: "관리자 역할 할당 실패: " + roleError.message
        }, { status: 500 });
      }
    } catch (error: any) {
      return NextResponse.json({ 
        success: false, 
        error: "역할 설정 실패: " + error.message
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "관리자 권한이 성공적으로 할당되었습니다.", 
      userId 
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "서버 오류: " + error.message
    }, { status: 500 });
  }
}
