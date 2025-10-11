
import VideoChat from "@/pages/videochat";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function VideoCallPage() {
  const [user, setUser] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const match_id = params.get("match_id");
    const user_id = params.get("user_id");

    if (!match_id || !user_id) return;

    (async () => {
      const { data: userData } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user_id)
        .single();

      const { data: matchData } = await supabase
        .from("match_requests")
        .select("*")
        .eq("id", match_id)
        .single();

      if (userData) setUser(userData);
      if (matchData) setMatch(matchData);
    })();
  }, []);

  if (!match || !user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "10px" }}>
      <h1>Video Conference</h1>
      <VideoChat match={match} user={user} />
    </div>
  );
}
