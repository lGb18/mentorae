import { useEffect, useRef, useState } from "react";
import Peer, { MediaConnection } from "peerjs";
import { supabase } from "@/lib/supabaseClient";

type Match = {
  id: string;
  tutorId: string;
  studentId: string;
};

type User = {
  id: string;
};

type VideoChatProps = {
  match: Match | null;
  user: User | null;
};

export default function VideoChat({ match, user }: VideoChatProps) {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [peer, setPeer] = useState<Peer | null>(null);

  const myVideo = useRef<HTMLVideoElement | null>(null);
  const remoteVideo = useRef<HTMLVideoElement | null>(null);

  // 1. Init PeerJS + save my Peer ID in Supabase
  useEffect(() => {
    if (!user) return;

    const newPeer = new Peer(); // PeerJS Cloud
    setPeer(newPeer);

    newPeer.on("open", async (id: string) => {
      setPeerId(id);
      console.log("My PeerJS ID:", id);

      if (user?.id) {
        await supabase
          .from("profiles")
          .update({ peer_id: id })
          .eq("id", user.id);
      }
    });

    // Auto-answer incoming calls
    newPeer.on("call", async (call: MediaConnection) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (myVideo.current) {
        myVideo.current.srcObject = stream;
        myVideo.current.play();
      }

      call.answer(stream);

      call.on("stream", (remoteStream: MediaStream) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
          remoteVideo.current.play();
        }
      });
    });

    return () => newPeer.destroy();
  }, [user]);

  // 2. Get remote peer_id once matchmaking is ready
  useEffect(() => {
    const fetchRemotePeer = async () => {
      if (!match || !user) return;

      // decide who is the "other" user
      const otherId = user.id === match.tutorId ? match.studentId : match.tutorId;
      if (!otherId) return;

      const { data } = await supabase
        .from("profiles")
        .select("peer_id")
        .eq("id", otherId)
        .single();

      if (data?.peer_id) {
        setRemotePeerId(data.peer_id);
      }
    };

    fetchRemotePeer();
  }, [match, user]);

  // 3. Start call if remotePeerId is found
  const callRemote = async () => {
    if (!peer || !remotePeerId) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (myVideo.current) {
      myVideo.current.srcObject = stream;
      myVideo.current.play();
    }

    const call = peer.call(remotePeerId, stream);
    if (call) {
      call.on("stream", (remoteStream: MediaStream) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
          remoteVideo.current.play();
        }
      });
    }
  };

  return (
    <div>
      <h2>Video Chat Demo</h2>
      <p>My Peer ID: {peerId}</p>
      <p>Matched Peer ID: {remotePeerId || "Waiting..."}</p>

      <div style={{ display: "flex", gap: "1rem" }}>
        <video
          ref={myVideo}
          muted
          playsInline
          style={{ width: "200px", background: "#000" }}
        />
        <video
          ref={remoteVideo}
          playsInline
          style={{ width: "200px", background: "#000" }}
        />
      </div>

      <button onClick={callRemote} disabled={!remotePeerId}>
        Start Call
      </button>
    </div>
  );
}
