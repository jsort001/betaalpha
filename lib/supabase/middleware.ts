import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";
import { isLinkPreviewBot } from "@/lib/link-preview";

const PUBLIC_PREFIXES = [
  "/auth/callback",
  "/unauthorized",
  "/api/calendar",
  "/link-preview",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath =
    request.nextUrl.pathname === "/" ||
    PUBLIC_PREFIXES.some((path) => request.nextUrl.pathname.startsWith(path));

  // Preview-bot fetchers (iMessage, Slack, etc.) have no session, so they'd
  // otherwise always be redirected to the generic "/" — serve them a
  // page-specific metadata-only stub instead, never real page content.
  if (!isPublicPath && isLinkPreviewBot(request.headers.get("user-agent"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/link-preview";
    url.search = `?path=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.rewrite(url);
  }

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
