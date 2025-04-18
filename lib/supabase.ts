import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a single supabase client for the entire app
//const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
//const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a single supabase client for the entire app
const supabaseUrl = "https://iutobpulcadrdofozcgy.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1dG9icHVsY2FkcmRvZm96Y2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzg2MTEsImV4cCI6MjA1ODc1NDYxMX0.ZK8PFrCQiTlj0bMN5SJ1NPnPIHPbVtuhtVKlQzUWGeI"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1dG9icHVsY2FkcmRvZm96Y2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzE3ODYxMSwiZXhwIjoyMDU4NzU0NjExfQ.I3FhOftIW8agulm5iuMIT4SM9D1v9jML1HHVghoZBow"

// Public client with anonymous key (limited permissions)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Admin client with service role key (bypasses RLS)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)

