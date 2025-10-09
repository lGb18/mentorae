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

  // fetch logged in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  // fetch match details
  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) return;
      const { data } = await supabase
        .from("matches")
        .select("id, tutor_id, student_id")
        .eq("id", matchId)
        .single();
      if (data) setMatch(data);
    };
    fetchMatch();
  }, [matchId]);

  if (!match || !user) return <p>Loading video chat...</p>;

  return <VideoChat match={match} user={user} />;
}
