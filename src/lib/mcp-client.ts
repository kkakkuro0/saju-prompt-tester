import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_MCP_SERVER_URL) {
  throw new Error("Missing env.SUPABASE_MCP_SERVER_URL");
}

export const mcpClient = createClient(
  process.env.SUPABASE_MCP_SERVER_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// 데이터베이스 연결 테스트 함수
export const testConnection = async () => {
  try {
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
