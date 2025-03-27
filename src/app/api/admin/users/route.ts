import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Creating a Supabase client with user's session
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    
    // Create a Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    
    // Create a client with the user's session cookie
    const supabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
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

    // 1. Get the current user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
    }
    
    // 2. Check if the user is an admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
      
    if (roleError || !roleData || roleData.role !== 'admin') {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }
    
    // 3. Get all users
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ users: users.users });
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    const errorMessage = error instanceof Error ? error.message : "사용자 목록을 가져오는데 실패했습니다.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
