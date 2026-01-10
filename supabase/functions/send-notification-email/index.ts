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

serve(async (req:any) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders })
  }
  if (!SUPABASE_URL || !SERVICE_KEY || !MAILERSEND_API_KEY) {
  return new Response(
    JSON.stringify({
      error: "Missing environment variables",
      hasSUPABASE_URL: !!SUPABASE_URL,
      hasSERVICE_KEY: !!SERVICE_KEY,
      hasMAILERSEND_API_KEY: !!MAILERSEND_API_KEY,
    }),
    { status: 500, headers: corsHeaders }
  )
}
  try {
    const { type, studentId, subjectName, tutorName, message } = await req.json()

    if (!type || !studentId) {
      return new Response(
        JSON.stringify({ error: "Missing fields" }),
        { status: 400, headers: corsHeaders }
      )
    }

    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${studentId}&select=email,display_name`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
      }
    )
    if (!profileRes.ok) {
  const text = await profileRes.text()
  return new Response(
    JSON.stringify({
      error: "Failed to fetch profile",
      status: profileRes.status,
      details: text,
    }),
    { status: 500, headers: corsHeaders }
  )
}
    const [profile] = await profileRes.json()

    if (!profile?.email) {
      return new Response(
        JSON.stringify({ error: "Student email not found" }),
        { status: 404 , headers: corsHeaders}
      )
    }

    // 2. Message templates
    let subject = ""
    let html = ""

    if (type === "class_reminder") {
  subject = `Class Reminder — ${subjectName}`

  const safeMessage =
    message?.trim() ||
    `This is a reminder for your ${subjectName} class with ${tutorName}.
    Please make sure you're ready for the session.`

      html = `
      <div style="
        max-width: 520px;
        margin: 0 auto;
        padding: 24px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      ">
        <h2 style="margin: 0 0 12px; font-size: 18px; color: #111827;">
          Class Reminder
        </h2>

        <p style="margin: 0 0 12px; font-size: 14px; color: #374151;">
          Hi ${profile.display_name || "Student"},
        </p>

        <p style="margin: 0 0 12px; font-size: 14px; color: #374151;">
          <strong>Subject:</strong> ${subjectName}<br/>
          <strong>Tutor:</strong> ${tutorName}
        </p>

        <div style="
          white-space: pre-wrap;
          background: #f9fafb;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          color: #111827;
          margin-bottom: 16px;
        ">
    ${safeMessage}
        </div>

        <p style="margin: 0; font-size: 12px; color: #6b7280;">
          — Mentorae
        </p>
      </div>
      `
    }

 else {
      return new Response(
        JSON.stringify({ error: "Unknown notification type" }),
        { status: 400, headers: corsHeaders }
      )
    }

    // 3. Send email
    const res = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MAILERSEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: {
          email: "notifications@test-68zxl27e8om4j905.mlsender.net",
          name: "Mentorae",
        },
        to: [{ email: profile.email }],
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return new Response(
        JSON.stringify({
          error: "MailerSend request failed",
          status: res.status,
          details: text,
        }),
        { status: 500, headers: corsHeaders }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: corsHeaders }
    )
  } catch (e) {
  const err =
    e instanceof Error
      ? { message: e.message, stack: e.stack }
      : { message: String(e) }

  return new Response(JSON.stringify({ error: "Unhandled exception", ...err }), {
    status: 500,
    headers: corsHeaders,
  })
}
})
