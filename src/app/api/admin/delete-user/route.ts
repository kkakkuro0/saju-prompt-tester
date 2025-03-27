import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function DELETE(request: Request) {
  try {
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
    
    // 3. Get the user ID to delete
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다." },
        { status: 400 }
      );
    }
    
    // 4. Delete the user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      message: "사용자가 삭제되었습니다."
    });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    const errorMessage = error instanceof Error ? error.message : "사용자 삭제에 실패했습니다.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
