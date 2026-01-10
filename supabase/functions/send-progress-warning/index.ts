// @ts-ignore
import { serve } from "https://deno.land/std/http/server.ts"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const MAILERSEND_API_KEY = Deno.env.get("MAILERSEND_API_KEY")!

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req : any) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }
  try {
    const { studentId, subjectName, gradeLevel } = await req.json()

    if (!studentId || !subjectName || !gradeLevel) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400, headers: corsHeaders
      })
    }

    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${studentId}&select=email`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
      }
    )

    const [profile] = await profileRes.json()
    if (!profile?.email) {
      return new Response(JSON.stringify({ error: "Email not found" }), {
        status: 404, headers: corsHeaders
      })
    }

    const res = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MAILERSEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: "notifications@test-68zxl27e8om4j905.mlsender.net", 
        name: "Mentorae" },
        to: [{ email: profile.email }],
        subject: `Progress Alert — ${subjectName}`,
        html: `<p>Your progress in ${subjectName} (${gradeLevel}) needs attention.</p>`,
      }),
    })

    if (!res.ok) {
      return new Response(await res.text(), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders })
  }
})
