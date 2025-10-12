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
  // const params = useParams();
  

  // console.log("🔍 All params:", params);
  // console.log("🔍 matchId param:", params.matchId);
  // console.log("🔍 location object:", location);

  // console.log("🔍 matchId from useParams:", matchId);
  // console.log("🔍 Current URL:", window.location.href);
  
  const [match, setMatch] = useState<Match | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check if current route is join route
  const isJoinRoute = location.pathname.includes('/join/');

  // Your existing data loading logic remains the same
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

  // Conditionally render different UI based on route
  return (
    
  <div style={{ padding: 16 }}>
    {/* Simple header - only show title */}
    <h1 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 600 }}>
      {isJoinRoute ? "Join Call" : "Video Conference"}
    </h1>
    
    {/* Minimal call info for join route */}
    {isJoinRoute && (
      <div style={{ marginBottom: 16, fontSize: 14, color: '#666' }}>
        <div>Call ID: {matchId}</div>
      </div>
    )}
    
    {/* VideoChat component handles the rest */}
    <VideoChat match={match} user={user} />
  </div>
);
}