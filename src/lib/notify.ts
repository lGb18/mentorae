import { supabase } from "@/lib/supabaseClient"

export async function sendEmailNotification({
  to,
  title,
  message,
}: {
  to: string
  title: string
  message: string
}) {
  const { error } = await supabase.functions.invoke(
    "send-notification-email",
    {
      body: { to, title, message },
    }
  )

  if (error) throw error
}
