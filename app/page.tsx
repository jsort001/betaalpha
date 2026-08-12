import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignInButton } from "@/components/sign-in-button";

async function checkSupabaseReachable() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`,
      {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
        cache: "no-store",
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export default async function Home() {
  const supabase = await createClient();

  const [{ data: { user } }, connected] = await Promise.all([
    supabase.auth.getUser(),
    checkSupabaseReachable(),
  ]);

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <Image
          src="/logo.png"
          alt="Beta Alpha crest"
          width={96}
          height={107}
          className="h-24 w-auto"
          priority
        />
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Beta Alpha Chapter
        </h1>
        <p className="text-muted-foreground">
          Task and project management for the Beta Alpha chapter of La
          Unidad Latina, Lambda Upsilon Lambda Fraternity, Incorporated
        </p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-base">System status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Supabase</span>
          <Badge variant={connected ? "default" : "destructive"}>
            {connected ? "Connected" : "Unreachable"}
          </Badge>
        </CardContent>
      </Card>

      <SignInButton />

      <p className="max-w-sm text-center text-xs text-muted-foreground">
        Access is limited to allowlisted chapter members. Sign in with the
        Google account an officer has added for you.
      </p>
    </div>
  );
}
