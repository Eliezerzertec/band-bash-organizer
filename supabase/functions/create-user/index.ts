import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { email, password, name, phone } = await req.json()

    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, password, name" }),
        { status: 400 }
      )
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing environment variables")
      return new Response(
        JSON.stringify({ error: "Server configuration missing" }),
        { status: 500 }
      )
    }

    // Import Supabase client
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2")
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("Auth error:", authError)
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400 }
      )
    }

    const userId = authData.user.id

    // Create or update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          email,
          name,
          phone: phone || null,
        },
        { onConflict: "user_id" }
      )

    if (profileError) {
      console.error("Profile error:", profileError)
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ user_id: userId }),
      { status: 200 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    console.error("Function error:", error)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500 }
    )
  }
})
