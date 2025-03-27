import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // This route should only be accessible in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This route is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Missing Supabase credentials in environment variables" },
        { status: 500 }
      );
    }

    // Create admin Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Admin account details
    const adminEmail = "admin@example.com"; // 실제 이메일 형식으로 변경
    const adminPassword = "admin!23";

    // 기존 계정 확인 생략 - 새로운 계정 강제 생성

    // Create the admin user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto confirm the email
      user_metadata: { 
        role: "admin",
        name: "Administrator" 
      }
    });

    if (userError) {
      return NextResponse.json(
        { error: "Failed to create admin user: " + userError.message },
        { status: 500 }
      );
    }

    // Create a record in user_roles table
    if (userData.user) {
      // Check if user_roles table exists
      const { error: tableError } = await supabase
        .from("user_roles")
        .insert([
          { user_id: userData.user.id, role: "admin" }
        ]);

      if (tableError) {
        // Create the table if it doesn't exist
        const createTableQuery = await fetch("/api/admin/create-tables", {
          method: "POST",
        });

        if (!createTableQuery.ok) {
          console.error("Failed to create tables");
        } else {
          // Try adding the role again
          await supabase
            .from("user_roles")
            .insert([
              { user_id: userData.user.id, role: "admin" }
            ]);
        }
      }
    }

    return NextResponse.json({
      message: "Admin account created successfully",
      admin: {
        email: adminEmail,
        password: adminPassword,
      },
    });
  } catch (error) {
    console.error("Error initializing admin:", error);
    return NextResponse.json(
      { error: "Failed to initialize admin account" },
      { status: 500 }
    );
  }
}
