import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  // 보안상의 이유로 개발 환경에서만 작동하도록 설정
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Missing Supabase credentials" },
        { status: 500 }
      );
    }

    // 서비스 롤 키로 Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. 사용자 삭제 시도 (이미 존재할 경우)
    try {
      // 기존 사용자 목록 조회
      const { data: users } = await supabase.auth.admin.listUsers();
      
      // 기존 admin@example.com 계정 찾기
      const existingAdminUser = users?.users.find(
        (user) => user.email === "admin@example.com"
      );
      
      // 기존 계정이 있으면 삭제
      if (existingAdminUser) {
        await supabase.auth.admin.deleteUser(existingAdminUser.id);
      }
    } catch (error) {
      console.error("Failed to delete existing user:", error);
      // 계속 진행 (삭제 실패해도 새로 생성 시도)
    }

    // 2. 새 admin 계정 생성
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: "admin@example.com",
      password: "admin!23",
      email_confirm: true,
      user_metadata: {
        role: "admin",
        name: "Administrator",
      },
    });

    if (createError) {
      return NextResponse.json(
        { error: "Failed to create admin user: " + createError.message },
        { status: 500 }
      );
    }

    // 3. user_roles 테이블 생성
    try {
      await supabase.rpc("execute_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_roles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) NOT NULL,
            role TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
          );
          CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_id_key ON public.user_roles (user_id);
          ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
        `,
      });
    } catch (error) {
      console.error("Failed to create table:", error);
      // 계속 진행 (테이블 생성 실패해도 권한 설정 시도)
    }

    // 4. 관리자 권한 설정
    try {
      // 기존 설정 확인 및 삭제
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userData.user.id);

      // 새 권한 설정
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert([{ user_id: userData.user.id, role: "admin" }]);

      if (roleError) {
        console.error("Failed to set admin role:", roleError);
      }
    } catch (error) {
      console.error("Failed to set admin role:", error);
    }

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully",
      user: {
        id: userData.user.id,
        email: userData.user.email,
      },
    });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to create admin account: " + error.message },
      { status: 500 }
    );
  }
}
