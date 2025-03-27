import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: "Supabase 환경 변수가 필요합니다."
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
    
    // 서비스 롤 키로 supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 사용자 정보 업데이트
    const { data, error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', userId);
      
    if (error) {
      console.error("MCP 서버 수정 실패:", error);
      return NextResponse.json({
        success: false,
        error: "사용자 권한 업데이트 실패: " + error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: "사용자 권한이 성공적으로 업데이트되었습니다.",
      data
    });
  } catch (error: unknown) {
    console.error("API 요청 처리 오류:", error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json({
      success: false,
      error: "API 요청 처리 중 오류가 발생했습니다: " + errorMessage
    }, { status: 500 });
  }
}