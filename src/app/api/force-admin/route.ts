import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    
    if (!supabaseUrl || !supabaseKey || !serviceKey) {
      return NextResponse.json(
        { error: "Missing environment variables" },
        { status: 500 }
      );
    }
    
    // Supabase 클라이언트 생성
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
    
    // Create admin client
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceKey
    );
    
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: "No authenticated session found" },
        { status: 401 }
      );
    }
    
    // 1. Create the user_roles table if it doesn't exist
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
    } catch (error) {
      console.error("Failed to create table:", error);
      // Continue anyway, might already exist
    }
    
    // 2. Check if user already has an admin role
    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
    
    if (existingRole) {
      // Update existing role
      const { error: updateError } = await supabaseAdmin
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('id', existingRole.id);
      
      if (updateError) {
        return NextResponse.json(
          { error: "Failed to update role: " + updateError.message },
          { status: 500 }
        );
      }
    } else {
      // Insert new role
      const { error: insertError } = await supabaseAdmin
        .from('user_roles')
        .insert([{ user_id: session.user.id, role: 'admin' }]);
      
      if (insertError) {
        return NextResponse.json(
          { error: "Failed to insert role: " + insertError.message },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Admin role assigned successfully",
      user: {
        id: session.user.id,
        email: session.user.email
      }
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: "Server error: " + errorMessage },
      { status: 500 }
    );
  }
}
