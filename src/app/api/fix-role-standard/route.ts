import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    const { userId, email } = await request.json();
    
    if (!userId && !email) {
      return NextResponse.json({ 
        success: false, 
        error: "사용자 ID 또는 이메일이 필요합니다."
      }, { status: 400 });
    }

    // Supabase 서비스 롤 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let targetUserId = userId;
    
    // 이메일로 사용자 ID 조회 (userId가 없는 경우)
    if (!targetUserId && email) {
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        return NextResponse.json({ 
          success: false, 
          error: "사용자 목록 조회 실패: " + userError.message 
        }, { status: 500 });
      }
      
      const user = userData.users.find(u => u.email === email);
      if (!user) {
        return NextResponse.json({ 
          success: false, 
          error: "해당 이메일의 사용자를 찾을 수 없습니다: " + email 
        }, { status: 404 });
      }
      
      targetUserId = user.id;
    }

    // 1. 표준 SQL 쿼리로 user_roles 테이블 생성
    try {
      const { error: createTableError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_roles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            role TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
          );
        `
      });
      
      if (createTableError) {
        console.error("Table creation error:", createTableError);
        // 계속 진행 - 테이블이 이미 존재할 수 있음
      }
    } catch (error: any) {
      console.error("Table creation error:", error);
      // 계속 진행 - 테이블이 이미 존재할 수 있음
    }

    // 2. 표준 SQL로 인덱스 생성
    try {
      const { error: createIndexError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_id_key ON public.user_roles (user_id);
        `
      });
      
      if (createIndexError) {
        console.error("Index creation error:", createIndexError);
        // 계속 진행
      }
    } catch (error: any) {
      console.error("Index creation error:", error);
      // 계속 진행
    }

    // 3. 표준 SQL로 기존 역할 삭제 후 새 역할 삽입
    try {
      // 기존 역할 삭제 
      const { error: deleteError } = await supabase.rpc('execute_sql', {
        sql: `
          DELETE FROM public.user_roles WHERE user_id = '${targetUserId}';
        `
      });
      
      if (deleteError) {
        console.error("Role deletion error:", deleteError);
        // 계속 진행
      }
      
      // 새 역할 삽입
      const { error: insertError } = await supabase.rpc('execute_sql', {
        sql: `
          INSERT INTO public.user_roles (user_id, role) 
          VALUES ('${targetUserId}', 'admin');
        `
      });
      
      if (insertError) {
        return NextResponse.json({ 
          success: false, 
          error: "관리자 역할 할당 실패: " + insertError.message 
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
      userId: targetUserId 
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "서버 오류: " + error.message
    }, { status: 500 });
  }
}
