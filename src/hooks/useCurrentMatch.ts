// hooks/useCurrentMatch.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useCurrentMatch() {
  const [matchId, setMatchId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentMatch = async () => {
      // Adjust this query if your table/column names differ
      const { data: matchData } = await supabase
        .from("matches")
        .select("id")
        .eq("status", "active") // example: fetch the active/current match
        .single();

      if (matchData?.id) setMatchId(matchData.id);
    };

    fetchCurrentMatch();
  }, []);

  return matchId;
}
