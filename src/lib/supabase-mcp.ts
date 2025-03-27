// Supabase MCP (Management Connection Protocol) 클라이언트
// 이 클라이언트는 기본 Supabase 클라이언트로 접근할 수 없는 관리 기능을 제공합니다.

interface UserMetadata {
  [key: string]: string | number | boolean | null | undefined;
}

interface ApiError {
  message?: string;
  [key: string]: unknown;
}

export async function connectToMCP() {
  const mcpServerUrl = process.env.SUPABASE_MCP_SERVER_URL;
  
  if (!mcpServerUrl) {
    throw new Error("SUPABASE_MCP_SERVER_URL 환경 변수가 설정되지 않았습니다.");
  }
  
  return {
    url: mcpServerUrl,
    async createUser(email: string, password: string, metadata: UserMetadata = {}) {
      try {
        const response = await fetch(`${mcpServerUrl}/auth/admin/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({
            email,
            password,
            email_confirm: true,
            user_metadata: metadata
          })
        });
        
        if (!response.ok) {
          const error = await response.json() as ApiError;
          throw new Error(error.message || '사용자 생성 실패');
        }
        
        return await response.json();
      } catch (error: unknown) {
        console.error('MCP 사용자 생성 오류:', error);
        throw error;
      }
    },
    
    async assignRole(userId: string, role: string) {
      try {
        // 1. user_roles 테이블 생성
        const createTableResponse = await fetch(`${mcpServerUrl}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({
            sql: `
              CREATE TABLE IF NOT EXISTS user_roles (
                user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
                role TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
            `
          })
        });
        
        if (!createTableResponse.ok) {
          const error = await createTableResponse.json() as ApiError;
          throw new Error(error.message || '테이블 생성 실패');
        }
        
        // 2. 역할 할당
        const assignRoleResponse = await fetch(`${mcpServerUrl}/rest/v1/user_roles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            user_id: userId,
            role: role,
            updated_at: new Date().toISOString()
          })
        });
        
        if (!assignRoleResponse.ok) {
          const error = await assignRoleResponse.json() as ApiError;
          throw new Error(error.message || '역할 할당 실패');
        }
        
        return await assignRoleResponse.json();
      } catch (error: unknown) {
        console.error('MCP 역할 할당 오류:', error);
        throw error;
      }
    }
  };
}