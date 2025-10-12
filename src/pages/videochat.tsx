import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
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

  // 1. Init PeerJS + reuse/save Peer ID in Supabase
  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => {
      (async () => {
        // ✅ Fetch or reuse peer_id for this user
        const { data } = await supabase
          .from("profiles")
          .select("peer_id")
          .eq("id", user.id)
          .single();

        // ✅ Reuse existing peer_id if available, otherwise generate new one
        const currentPeerId =
          data?.peer_id || `${user.id}-${crypto.randomUUID().slice(0, 6)}`;

        const newPeer = new Peer(currentPeerId, {
          host: "0.peerjs.com",
          secure: true,
          port: 443,
          config: {
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          },
        });

        setPeer(newPeer);
        setPeerId(currentPeerId);

        newPeer.on("open", async (id: string) => {
          console.log("My PeerJS ID:", id);
          // Only update if missing or changed
          if (!data?.peer_id || data.peer_id !== id) {
            await supabase.from("profiles").update({ peer_id: id }).eq("id", user.id);
          }
        });

        newPeer.on("error", (err) => {
          console.warn("PeerJS error:", err.type, err);
        });

        newPeer.on("call", async (call) => {
          try {
            const stream = await safeGetUserMedia();
            call.answer(stream);
            setInCall(true);

            call.on("stream", (remoteStream) => {
              if (remoteVideo.current) {
                remoteVideo.current.srcObject = remoteStream;
                try {
                  remoteVideo.current.play();
                } catch {}
              }
            });
          } catch {
            console.warn("No camera/mic found — continuing without media.");
          }
        });
      })();
    }, 800);

    return () => clearTimeout(timer);
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
const [audioEnabled, setAudioEnabled] = useState(true);
const [videoEnabled, setVideoEnabled] = useState(true);

  // Toggle functions
  const toggleAudio = () => {
    if (myVideo.current?.srcObject instanceof MediaStream) {
      const tracks = myVideo.current.srcObject.getAudioTracks();
      tracks.forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (myVideo.current?.srcObject instanceof MediaStream) {
      const tracks = myVideo.current.srcObject.getVideoTracks();
      tracks.forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  // Update your existing end call function to reset states
  const endCall = () => {
    if (myVideo.current?.srcObject instanceof MediaStream) {
      myVideo.current.srcObject.getTracks().forEach((t) => t.stop());
      myVideo.current.srcObject = null;
    }
    if (remoteVideo.current?.srcObject instanceof MediaStream) {
      remoteVideo.current.srcObject.getTracks().forEach((t) => t.stop());
      remoteVideo.current.srcObject = null;
    }
    setInCall(false);
    setAudioEnabled(true); // Reset for next call
    setVideoEnabled(true); // Reset for next call
  };

  return (
  <div>
    {/* Peer IDs info */}
    <div style={{ marginBottom: 16, fontSize: 14, color: '#666' }}>
      <div>My Peer ID: {peerId}</div>
      <div>Remote Peer ID: {remotePeerId || "Waiting..."}</div>
    </div>

    {/* Zoom-style video container */}
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      gap: 16, 
      marginBottom: 16,
      height: "400px"
    }}>
      <video
        ref={myVideo}
        muted
        playsInline
        style={{ 
          width: "min(500px, 48%)", 
          height: "100%",
          background: "#000",
          objectFit: "cover"
        }}
      />
      <video
        ref={remoteVideo}
        playsInline
        style={{ 
          width: "min(500px, 48%)", 
          height: "100%",
          background: "#000",
          objectFit: "cover"
        }}
      />
    </div>

    {/* Simple control buttons */}
    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
      {!inCall ? (
        <button 
          onClick={callRemote} 
          disabled={!remotePeerId}
          style={{ 
            padding: '8px 16px',
            border: '1px solid #000',
            background: '#fff',
            cursor: remotePeerId ? 'pointer' : 'not-allowed'
          }}
        >
          Start Call
        </button>
      ) : (
        <>
          <button
            onClick={toggleAudio}
            style={{ 
              padding: '8px 16px',
              border: '1px solid #000',
              background: audioEnabled ? '#fff' : '#ddd',
              cursor: 'pointer'
            }}
          >
            {audioEnabled ? 'Mute' : 'Unmute'}
          </button>
          <button
            onClick={toggleVideo}
            style={{ 
              padding: '8px 16px',
              border: '1px solid #000',
              background: videoEnabled ? '#fff' : '#ddd', 
              cursor: 'pointer'
            }}
          >
            {videoEnabled ? 'Video Off' : 'Video On'}
          </button>
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
              setAudioEnabled(true);
              setVideoEnabled(true);
            }}
            style={{ 
              padding: '8px 16px',
              border: '1px solid #000',
              background: '#000',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            End Call
          </button>
        </>
      )}
    </div>
  </div>
);
}
