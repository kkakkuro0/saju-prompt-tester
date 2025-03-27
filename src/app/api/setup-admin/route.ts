import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    // Supabase 클라이언트 생성 (서비스 역할 키 사용)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Supabase 환경 변수가 설정되지 않았습니다." },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. 어드민 계정 생성
    const adminEmail = "admin@example.com";
    const adminPassword = "admin!23";
    
    // 이미 계정이 있는지 확인
    let isUserExists = false;
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      isUserExists = data?.users.some(user => user.email === adminEmail) || false;
    } catch (e) {
      console.error("사용자 목록 조회 실패:", e);
    }
    
    let userId;
    
    if (!isUserExists) {
      // 사용자 생성
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });
      
      if (createError) {
        return NextResponse.json(
          { error: "어드민 계정 생성 실패: " + createError.message },
          { status: 500 }
        );
      }
      
      userId = userData.user.id;
      console.log("생성된 사용자 ID:", userId);
    } else {
      // 기존 사용자 ID 가져오기
      const { data, error } = await supabase.auth.admin.listUsers();
      const adminUser = data?.users.find(user => user.email === adminEmail);
      userId = adminUser?.id;
      console.log("기존 사용자 ID:", userId);
    }
    
    // 2. user_roles 테이블 생성 (없는 경우)
    try {
      const { error: sqlError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_roles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) NOT NULL,
            role TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
          );
          CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_id_key ON public.user_roles (user_id);
          ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
        `
      });
      
      if (sqlError) {
        console.log("테이블 생성 실패, 이미 존재할 수 있음:", sqlError);
      }
    } catch (error) {
      console.log("테이블 생성 중 오류:", error);
    }
    
    // 3. 어드민 권한 설정
    if (userId) {
      try {
        // 먼저 기존 권한이 있는지 확인
        const { data: existingRole, error: roleCheckError } = await supabase
          .from('user_roles')
          .select()
          .eq('user_id', userId)
          .maybeSingle();
          
        if (existingRole) {
          // 이미 권한이 있으면 업데이트
          const { error: updateError } = await supabase
            .from('user_roles')
            .update({ role: 'admin' })
            .eq('user_id', userId);
            
          if (updateError) {
            console.log("권한 업데이트 실패:", updateError);
          }
        } else {
          // 권한이 없으면 추가
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert([{ user_id: userId, role: 'admin' }]);
            
          if (insertError) {
            console.log("권한 추가 실패:", insertError);
          }
        }
      } catch (error) {
        console.log("권한 설정 중 오류:", error);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "어드민 계정 설정 완료",
      admin: {
        email: adminEmail,
        password: adminPassword
      }
    });
    
  } catch (error) {
    console.error("서버 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
