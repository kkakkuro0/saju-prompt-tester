import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
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
    
    // Create the user_roles table if it doesn't exist
    const { error: createTableError } = await supabase.rpc('create_user_roles_table');
    
    if (createTableError) {
      // Try to create the table manually if RPC function doesn't exist
      const { error: sqlError } = await supabase.from('user_roles').select('*').limit(1);
      
      if (sqlError) {
        // Create the table using raw SQL
        const { error: tableError } = await supabase.rpc('create_user_roles_table_sql');
        
        if (tableError) {
          return NextResponse.json(
            { error: "Failed to create tables: " + tableError.message },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      message: "Tables created successfully",
    });
  } catch (error) {
    console.error("Error creating tables:", error);
    return NextResponse.json(
      { error: "Failed to create tables" },
      { status: 500 }
    );
  }
}
