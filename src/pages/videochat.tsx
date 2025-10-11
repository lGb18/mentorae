import { useEffect, useRef, useState } from "react";
import Peer, { MediaConnection } from "peerjs";
import { supabase } from "@/lib/supabaseClient";

type Match = {
  id: string;
  tutor_id: string;
  student_id: string;
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
  const [inCall, setInCall] = useState(false); 
  const myVideo = useRef<HTMLVideoElement | null>(null);
  const remoteVideo = useRef<HTMLVideoElement | null>(null);

  // helper to safely get user media
  async function safeGetUserMedia() {
    try {
      return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      console.warn("Media device error:", err);
      try {
        return await navigator.mediaDevices.getUserMedia({ video: true });
      } catch {
        console.warn("Falling back to no media stream.");
        return new MediaStream();
      }
    }
  }

  // 1. Init PeerJS + save my Peer ID in Supabase
  useEffect(() => {
    if (!user) return;

    const newPeer = new Peer(); // PeerJS Cloud
    setPeer(newPeer);

    newPeer.on("open", async (id: string) => {
      setPeerId(id);
      console.log("My PeerJS ID:", id);

      if (user?.id) {
        await supabase.from("profiles").update({ peer_id: id }).eq("id", user.id);
      }
    });

    // Auto-answer incoming calls
    newPeer.on("call", async (call: MediaConnection) => {
      const stream = await safeGetUserMedia();

      if (myVideo.current) {
        myVideo.current.srcObject = stream;
        myVideo.current.play();
      }

      call.answer(stream);
      setInCall(true);
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

      const otherId = user.id === match.tutor_id ? match.student_id : match.tutor_id;
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
    if (!peer || !remotePeerId || inCall) return;
    const stream = await safeGetUserMedia();

    if (myVideo.current) {
      myVideo.current.srcObject = stream;
      myVideo.current.play();
    }

    const call = peer.call(remotePeerId, stream);
    if (call) {
      setInCall(true);
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

      {!inCall ? (
        <button onClick={callRemote} disabled={!remotePeerId}>
          Start Call
        </button>
      ) : (
        <button
          onClick={() => {
            // Stop all media tracks
            if (myVideo.current?.srcObject instanceof MediaStream) {
              myVideo.current.srcObject.getTracks().forEach((t) => t.stop());
              myVideo.current.srcObject = null;
            }
            if (remoteVideo.current?.srcObject instanceof MediaStream) {
              remoteVideo.current.srcObject.getTracks().forEach((t) => t.stop());
              remoteVideo.current.srcObject = null;
            }
            // Reset state
            setInCall(false);
          }}
          style={{ backgroundColor: "red", color: "white" }}
        >
          End Call
        </button>
      )}
    </div>
  );

}
