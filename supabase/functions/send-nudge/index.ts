import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL")!;
const APP_URL = "https://betaalpha.vercel.app";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Beta Alpha Project Manager <${RESEND_FROM_EMAIL}>`,
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    console.error(`Resend error for ${to}: ${res.status} ${await res.text()}`);
  }
  return res.ok;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only alumni may trigger this. The gateway already verified the
  // caller's JWT (default verify_jwt); resolve who they are with it,
  // then check their role via the trusted service-role client.
  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
  );
  const {
    data: { user: caller },
  } = await anonClient.auth.getUser();
  if (!caller) return json({ error: "Unauthorized" }, 401);

  const { data: callerRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", caller.id)
    .single();
  if (callerRow?.role !== "alumni") return json({ error: "Forbidden" }, 403);

  const [{ data: allowlist, error: allowlistError }, { data: users, error: usersError }] =
    await Promise.all([
      supabase.from("allowlist").select("email, name"),
      supabase.from("users").select("email"),
    ]);
  if (allowlistError) return json({ error: allowlistError.message }, 500);
  if (usersError) return json({ error: usersError.message }, 500);

  const signedUpEmails = new Set((users ?? []).map((u) => u.email));
  const notSignedUp = (allowlist ?? []).filter((a) => !signedUpEmails.has(a.email));

  let sentCount = 0;
  for (const person of notSignedUp) {
    const ok = await sendEmail(
      person.email,
      "Reminder: sign in to Beta Alpha Project Manager",
      `
        <p>Hi ${person.name},</p>
        <p>You've been added to Beta Alpha Project Manager but haven't signed in yet.
        Sign in with the Google account an officer added for you to see your tasks:</p>
        <p><a href="${APP_URL}">Sign in to Beta Alpha Project Manager</a></p>
      `
    );
    if (ok) sentCount++;
  }

  return json({ sent: sentCount, total: notSignedUp.length });
});
