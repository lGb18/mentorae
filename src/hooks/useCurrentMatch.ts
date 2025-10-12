// hooks/useCurrentMatch.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useCurrentMatch() {
  const [matchId, setMatchId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentMatch = async () => {
    
      const { data: matchData } = await supabase
        .from("matches")
        .select("id")
        .eq("status", "active")
        .single();

      if (matchData?.id) setMatchId(matchData.id);
    };

    fetchCurrentMatch();
  }, []);

  return matchId;
}
