import { createClient } from "@/lib/supabase/server"

export async function checkAdminAccess() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { isAdmin: false, user: null, error: "No authenticated user" }
  }

  // Check if user is in admin_users table
  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .eq("is_active", true)
    .single()

  if (adminError || !adminUser) {
    return { isAdmin: false, user, error: "User is not an admin" }
  }

  return { isAdmin: true, user, adminUser, error: null }
}

export async function requireAdminAccess() {
  const result = await checkAdminAccess()

  if (!result.isAdmin) {
    throw new Error(result.error || "Admin access required")
  }

  return result
}
