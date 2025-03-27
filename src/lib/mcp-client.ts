import { createClient } from "@supabase/supabase-js";

let supabaseMcpUrl = process.env.SUPABASE_MCP_SERVER_URL || '';

// 기본 URL 설정 (환경 변수가 없거나 유효하지 않은 경우)
if (!supabaseMcpUrl || supabaseMcpUrl === 'your_mcp_server_url') {
  console.warn('SUPABASE_MCP_SERVER_URL이 설정되지 않았거나 유효하지 않습니다. 기본 URL을 사용합니다.');
  supabaseMcpUrl = 'https://example.supabase.co'; // 기본 더미 URL
}

// URL 유효성 검사
try {
  new URL(supabaseMcpUrl);
} catch (e) {
  console.error('잘못된 SUPABASE_MCP_SERVER_URL:', supabaseMcpUrl, e);
  supabaseMcpUrl = 'https://example.supabase.co'; // 기본 더미 URL
}

export const mcpClient = createClient(
  supabaseMcpUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// 데이터베이스 연결 테스트 함수
export const testConnection = async () => {
  try {
    // URL이 기본값인 경우 실제로 연결을 시도하지 않음
    if (supabaseMcpUrl === 'https://example.supabase.co') {
      return { 
        success: false, 
        error: '유효한 SUPABASE_MCP_SERVER_URL이 설정되지 않았습니다.' 
      };
    }

    const { data, error } = await mcpClient
      .from("users")
      .select("count(*)")
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Database connection error:", error);
    return { success: false, error };
  }
};
