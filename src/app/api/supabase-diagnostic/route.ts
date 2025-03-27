import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: "필요한 환경 변수가 설정되지 않았습니다.",
        missingVars: {
          supabaseUrl: !supabaseUrl,
          supabaseAnonKey: !supabaseAnonKey,
          supabaseServiceKey: !supabaseServiceKey
        }
      });
    }
    
    // 일반 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 서비스 롤 클라이언트 생성
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // 1. 연결 테스트 - 간단한 쿼리 실행
    let connectionTest = { success: false, error: null };
    try {
      const { error } = await supabase.from('projects').select('count(*)', { count: 'exact' }).limit(0);
      connectionTest.success = !error;
      connectionTest.error = error ? error.message : null;
    } catch (err: any) {
      connectionTest.error = err.message;
    }
    
    // 2. 인증 테스트 - 어드민 계정 생성 시도
    let authTest = { success: false, error: null, user: null };
    try {
      // 기존 admin@example.com 사용자 찾기 시도
      const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        authTest.error = `사용자 목록 조회 실패: ${listError.message}`;
      } else {
        const existingAdmin = existingUsers.users.find(u => u.email === 'admin@example.com');
        
        if (existingAdmin) {
          authTest.success = true;
          authTest.user = {
            id: existingAdmin.id,
            email: existingAdmin.email,
            created_at: existingAdmin.created_at
          };
        } else {
          // admin@example.com 계정 생성 시도
          const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: 'admin@example.com',
            password: 'admin!23',
            email_confirm: true
          });
          
          if (createError) {
            authTest.error = `관리자 계정 생성 실패: ${createError.message}`;
          } else {
            authTest.success = true;
            authTest.user = {
              id: userData.user.id,
              email: userData.user.email,
              created_at: userData.user.created_at
            };
          }
        }
      }
    } catch (err: any) {
      authTest.error = `인증 테스트 실패: ${err.message}`;
    }
    
    // 3. 테이블 확인
    let tablesTest = { success: false, error: null, tables: {} };
    try {
      // 테이블 목록 가져오기
      const { data: tablesData, error: tablesError } = await supabaseAdmin.rpc('get_tables_info');
      
      if (tablesError) {
        tablesTest.error = `테이블 정보 조회 실패: ${tablesError.message}`;
        
        // 직접 기존 테이블 확인
        const tables = ['users', 'projects', 'system_prompts', 'prompt_templates', 'user_roles'];
        const tableResults: Record<string, any> = {};
        
        for (const table of tables) {
          try {
            const { count, error } = await supabaseAdmin
              .from(table)
              .select('*', { count: 'exact', head: true });
            
            tableResults[table] = {
              exists: !error,
              count: count || 0,
              error: error ? error.message : null
            };
          } catch (e: any) {
            tableResults[table] = {
              exists: false,
              error: e.message
            };
          }
        }
        
        tablesTest.tables = tableResults;
        tablesTest.success = Object.values(tableResults).some(t => t.exists);
      } else {
        tablesTest.tables = tablesData;
        tablesTest.success = true;
      }
    } catch (err: any) {
      tablesTest.error = `테이블 테스트 실패: ${err.message}`;
    }
    
    // 4. user_roles 테이블 생성 및 관리자 권한 설정
    let roleSetupTest = { success: false, error: null, tableCreated: false, roleAssigned: false };
    try {
      if (authTest.success && authTest.user) {
        // user_roles 테이블 생성 시도
        try {
          await supabaseAdmin.rpc('execute_sql', {
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
          roleSetupTest.tableCreated = true;
        } catch (e: any) {
          roleSetupTest.error = `user_roles 테이블 생성 실패: ${e.message}`;
          // 계속 진행 (테이블이 이미 존재할 수 있음)
        }
        
        // 관리자 역할 할당 시도
        try {
          // 기존 역할 삭제
          await supabaseAdmin
            .from('user_roles')
            .delete()
            .eq('user_id', authTest.user.id);
            
          // 새 역할 추가
          const { error: insertError } = await supabaseAdmin
            .from('user_roles')
            .insert([{ user_id: authTest.user.id, role: 'admin' }]);
            
          if (insertError) {
            roleSetupTest.error = `admin 역할 할당 실패: ${insertError.message}`;
          } else {
            roleSetupTest.roleAssigned = true;
            roleSetupTest.success = true;
          }
        } catch (e: any) {
          if (!roleSetupTest.error) {
            roleSetupTest.error = `admin 역할 할당 실패: ${e.message}`;
          }
        }
      } else {
        roleSetupTest.error = '사용자 생성 실패로 역할 설정을 건너뜁니다.';
      }
    } catch (err: any) {
      roleSetupTest.error = `역할 설정 실패: ${err.message}`;
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl,
        anonKeyExists: !!supabaseAnonKey,
        serviceKeyExists: !!supabaseServiceKey
      },
      connectionTest,
      authTest,
      tablesTest,
      roleSetupTest,
      adminCredentials: {
        email: 'admin@example.com',
        password: 'admin!23'
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `진단 중 오류 발생: ${error.message}`
    }, { status: 500 });
  }
}
