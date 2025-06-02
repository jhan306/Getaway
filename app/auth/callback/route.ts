import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"
  const type = searchParams.get("type")

  if (code) {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data.user) {
        // If this is an email confirmation, create/update user profile
        if (type === "signup" || type === "email_change") {
          const { error: profileError } = await supabase
            .from("users")
            .upsert({
              id: data.user.id,
              email: data.user.email!,
              full_name: data.user.user_metadata?.full_name || null,
              avatar_url: data.user.user_metadata?.avatar_url || null,
            })
            .select()

          if (profileError) {
            console.error("Error creating user profile:", profileError)
          }
        }

        // Redirect to success page or dashboard
        const redirectUrl = type === "signup" ? `${origin}/auth/welcome` : `${origin}${next}`

        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error("Auth callback error:", error)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
