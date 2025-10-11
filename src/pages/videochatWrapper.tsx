import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import VideoChat from "./videochat";

type Match = {
  id: string;
  tutor_id: string;
  student_id: string;
};

export default function VideoChatWrapper() {
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return setLoading(false);

      const { data: matchData } = await supabase
        .from("matches")
        .select("id, tutor_id, student_id")
        .eq("id", matchId)
        .single();

      if (matchData) setMatch(matchData);
      setUser(userData.user);
      setLoading(false);
    };
    loadData();
  }, [matchId]);

  if (loading) return <p>Loading video chat...</p>;
  if (!match || !user) return <p>Unable to load video chat.</p>;

  return (
    <div style={{ padding: "10px" }}>
      <h1>Video Conference</h1>
      <VideoChat match={match} user={user} />
    </div>
  );
}
