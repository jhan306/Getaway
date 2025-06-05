// app/auth/callback/route.ts

import { NextResponse } from "next/server";
// Use the special route‐handler helper from Supabase’s Next.js Auth Helpers:
import { createRouteHandlerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: Request) {
  // 1) Create a NextResponse so Supabase can attach cookies/sign‐in tokens to it:
  const response = NextResponse.next();

  // 2) Build a server‐side Supabase client that knows about this request/response:
  const supabase = createRouteHandlerSupabaseClient({ req: request, res: response });

  // 3) Pull “code”, “next”, and “type” from the URL (just like before):
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = searchParams.get("next") ?? "/";
  const type = searchParams.get("type");

  if (code) {
    try {
      // 4) Exchange the OAuth “code” for a session (and set cookies on `response`):
      //    The route helper’s `supabase.auth` object will handle reading/writing cookies.
      const { data, error } = await supabase.auth.exchangeCodeForSession({ code });

      if (!error && data?.user) {
        // 5) If this is a “signup” or “email_change” flow, upsert into your users table:
        if (type === "signup" || type === "email_change") {
          const { error: profileError } = await supabase
            .from("users")
            .upsert({
              id: data.user.id,
              email: data.user.email!,
              full_name: data.user.user_metadata?.full_name || null,
              avatar_url: data.user.user_metadata?.avatar_url || null,
            })
            .select(); // we only need to run an upsert; SELECT ensures it returns fields if you want them

          if (profileError) {
            console.error("Error upserting user profile:", profileError);
          }
        }

        // 6) Redirect the user back to either “/auth/welcome” (for signup) or “nextPath”:
        const redirectUrl =
          type === "signup"
            ? `${origin}/auth/welcome`
            : `${origin}${nextPath}`;

        return NextResponse.redirect(redirectUrl);
      }

      // If there was an error from exchangeCodeForSession, fall through to error‐redirect below:
    } catch (e) {
      console.error("Auth callback exception:", e);
      // fall through to error‐redirect below
    }
  }

  // 7) If we reach here, something went wrong (no code or an error), so send to the “auth-code-error” page:
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
