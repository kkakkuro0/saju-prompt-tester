import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    
    // Create a regular client with the user's session cookie
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          detectSessionInUrl: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Cookie: cookieStore.toString(),
          },
        },
      }
    );
    
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 400 });
    }
    
    if (!session) {
      return NextResponse.json({ 
        error: "No session found", 
        session: null,
        auth_status: "not_authenticated" 
      });
    }
    
    // Now check if user has admin role
    const adminStatus = {
      is_admin_by_email: session.user.email === 'admin@example.com',
      role_check_result: null as { role: string } | null,
      role_check_error: null as string | null
    };
    
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      if (roleError) {
        adminStatus.role_check_error = roleError.message;
      } else {
        adminStatus.role_check_result = roleData;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
      adminStatus.role_check_error = errorMessage;
    }
    
    // Get service role client to check if user_roles table exists
    const supabaseAdmin = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );
    
    // Check if user_roles table exists
    let tableInfo = null;
    let tableError = null;
    
    try {
      const { data, error } = await supabaseAdmin.rpc('check_table_exists', {
        table_name: 'user_roles'
      });
      
      tableInfo = data;
      tableError = error ? error.message : null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
      tableError = errorMessage;
      
      // Fallback check
      try {
        const { data, error } = await supabaseAdmin
          .from('user_roles')
          .select('count(*)')
          .limit(1);
          
        tableInfo = { exists: !error, row_count: data?.length || 0 };
      } catch (e) {
        tableInfo = { exists: false, error: e };
      }
    }
    
    return NextResponse.json({
      auth_status: "authenticated",
      session: {
        user: {
          id: session.user.id,
          email: session.user.email,
          created_at: session.user.created_at
        },
      },
      admin_status: adminStatus,
      table_info: tableInfo,
      table_error: tableError
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
