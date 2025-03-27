import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Environment variables are missing. Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set in your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Admin account details
const adminEmail = 'admin@example.com' // 실제 이메일 형식으로 변경
const adminPassword = 'admin!23'

async function createAdminUser() {
  try {
    // 1. Create the user first
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto confirm the email
      user_metadata: { 
        role: 'admin',
        name: 'Administrator' 
      }
    })

    if (userError) {
      console.error('Error creating admin user:', userError.message)
      return
    }

    console.log('Admin user created successfully:', userData)

    // 2. Create a record in the 'user_roles' table (if you have one)
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([
        { user_id: userData.user.id, role: 'admin' }
      ])

    if (roleError) {
      console.error('Error adding user role:', roleError.message)
      return
    }

    console.log('Admin role assigned successfully')
    console.log('\nAdmin credentials:')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log('\nYou can now log in with these credentials.')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createAdminUser()
