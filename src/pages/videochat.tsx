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

  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => {
      (async () => {
        const { data } = await supabase
          .from("profiles")
          .select("peer_id")
          .eq("id", user.id)
          .single();

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
    setAudioEnabled(true); 
    setVideoEnabled(true); 
  };

  return (
   <div>

  <div style={{ 
    marginBottom: 20, 
    fontSize: 11, 
    color: '#666',
    background: '#fafafa',
    padding: '8px 12px',
    border: '1px solid #e0e0e0',
    fontFamily: 'monospace'
  }}>
    <div style={{ display: 'flex', gap: 20 }}>
      <span><strong>My ID:</strong> {peerId}</span>
      <span><strong>Remote ID:</strong> {remotePeerId || "Waiting..."}</span>
    </div>
  </div>

 
  <div style={{ 
    display: "flex", 
    justifyContent: "center", 
    gap: 16, 
    marginBottom: 20,
    height: "400px",
    background: '#000',
    padding: 8
  }}>
    <video
      ref={myVideo}
      muted
      playsInline
      style={{ 
        width: "min(500px, 48%)", 
        height: "100%",
        background: "#000",
        objectFit: "cover",
        border: '2px solid #fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}
    />
    <video
      ref={remoteVideo}
      playsInline
      style={{ 
        width: "min(500px, 48%)", 
        height: "100%",
        background: "#000",
        objectFit: "cover",
        border: '2px solid #fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}
    />
  </div>

  <div style={{ 
    display: "flex", 
    gap: 12, 
    justifyContent: "center", 
    flexWrap: "wrap" 
  }}>
    {!inCall ? (
      <button 
        onClick={callRemote} 
        disabled={!remotePeerId}
        style={{ 
          padding: '10px 24px',
          border: '2px solid #000',
          background: remotePeerId ? '#000' : '#f5f5f5',
          color: remotePeerId ? '#fff' : '#999',
          cursor: remotePeerId ? 'pointer' : 'not-allowed',
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: '0.5px',
          transition: 'all 0.15s ease'
        }}
      >
        JOIN CALL
      </button>
    ) : (
      <>
        <button
          onClick={toggleAudio}
          style={{ 
            padding: '10px 20px',
            border: '2px solid #000',
            background: audioEnabled ? '#000' : '#fff',
            color: audioEnabled ? '#fff' : '#000',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: '0.5px',
            transition: 'all 0.15s ease'
          }}
        >
          {audioEnabled ? 'MUTE' : 'UNMUTE'}
        </button>
        <button
          onClick={toggleVideo}
          style={{ 
            padding: '10px 20px',
            border: '2px solid #000',
            background: videoEnabled ? '#000' : '#fff',
            color: videoEnabled ? '#fff' : '#000',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: '0.5px',
            transition: 'all 0.15s ease'
          }}
        >
          {videoEnabled ? 'CAMERA OFF' : 'CAMERA ON'}
        </button>
        <button
          onClick={() => {
            if (myVideo.current?.srcObject instanceof MediaStream) {
              myVideo.current.srcObject.getTracks().forEach((t) => t.stop());
              myVideo.current.srcObject = null;
            }
            if (remoteVideo.current?.srcObject instanceof MediaStream) {
              remoteVideo.current.srcObject.getTracks().forEach((t) => t.stop());
              remoteVideo.current.srcObject = null;
            }
            setInCall(false);
            setAudioEnabled(true);
            setVideoEnabled(true);
          }}
          style={{ 
            padding: '10px 20px',
            border: '2px solid #000',
            background: '#fff',
            color: '#000',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: '0.5px',
            transition: 'all 0.15s ease'
          }}
        >
          END CALL
        </button>
      </>
    )}
  </div>
</div>
);
}
