import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(request: Request) {
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
    
    // 3. Get the request body
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "아이디와 비밀번호가 필요합니다." },
        { status: 400 }
      );
    }
    
    // 이메일 형식이 아닌 경우 가상 도메인 추가
    const emailForAuth = email.includes('@') ? email : `${email}@example.com`;
    
    // 4. Create the user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: emailForAuth,
      password,
      email_confirm: true
    });
    
    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      message: "사용자가 생성되었습니다.",
      user: userData.user
    });
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    const errorMessage = error instanceof Error ? error.message : "사용자 생성에 실패했습니다.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
