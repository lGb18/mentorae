import { supabase } from "@/lib/supabaseClient"

export async function endMatch(matchId: string) {
  const { error } = await supabase
    .from("matches")
    .update({ status: "completed" })
    .eq("id", matchId)

  if (error) {
    console.error("Failed to end match:", error)
    throw error
  } else {
    console.log("Match ended:", matchId)
  }
}
