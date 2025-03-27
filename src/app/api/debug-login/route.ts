import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호가 필요합니다." },
        { status: 400 }
      );
    }
    
    // 콘솔에 디버그 정보 기록
    console.log(`로그인 시도: ${email}`);
    
    // 일반 Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 로그인 시도
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("로그인 오류:", error);
      return NextResponse.json(
        { 
          error: error.message,
          status: error.status,
          details: error
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session
    });
  } catch (error: any) {
    console.error("예상치 못한 오류:", error);
    return NextResponse.json(
      { error: error.message || "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
