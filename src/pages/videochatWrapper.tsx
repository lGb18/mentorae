import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import VideoChat from "./videochat";

type Match = {
  id: string;
  tutor_id: string;
  student_id: string;
};

export default function VideoChatWrapper() {
  const { matchId } = useParams<{ matchId: string }>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
 
  const [match, setMatch] = useState<Match | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isJoinRoute = location.pathname.includes('/join/');

  useEffect(() => {
    const loadData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return setLoading(false);

      const { data: matchData, error } = await supabase
        .from("matches")
        .select("id, tutor_id, student_id, status")
        .eq("id", matchId)
        .single();

      if (error) {
        console.error("Error loading match:", error);
        setErrorMsg("Error loading match.");
      } else if (!matchData) {
        setErrorMsg("Match not found.");
      } else if (matchData.status !== "active") {
        setErrorMsg("This match is no longer active.");
      } else {
        setMatch(matchData);
      }
      setUser(userData.user);
      setLoading(false);
    };
    loadData();
  }, [matchId]);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ margin: "0 0 16px 0", fontSize: 20, fontWeight: 600 }}>
        {isJoinRoute ? "Join Call" : "Video Conference"}
      </h1>

      {isJoinRoute && (
        <div style={{ marginBottom: 16, fontSize: 14, color: "#666" }}>
          <div>Call ID: {matchId}</div>
        </div>
      )}

      {errorMsg ? (
        <div
          style={{
            background: "#000000ff",
            color: "#ffffffff",
            padding: "12px 16px",
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          {errorMsg}
        </div>
      ) : (
        <VideoChat match={match} user={user} />
      )}
    </div>
  );
}