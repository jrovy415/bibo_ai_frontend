import { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Typography, Tag, Card } from "antd";
import { PlayCircleOutlined, ReadOutlined, GlobalOutlined, StarFilled } from "@ant-design/icons";
import { speakText, cancelSpeech } from "../ttsUtil";

const { Title } = Typography;

const typeColors = {
  youtube: "#ff4757",
  story:   "#5352ed",
  link:    "#00d2d3",
};
const typeIcons = {
  youtube: <PlayCircleOutlined style={{ fontSize: '1.2em' }} />,
  story:   <ReadOutlined       style={{ fontSize: '1.2em' }} />,
  link:    <GlobalOutlined     style={{ fontSize: '1.2em' }} />,
};

// ── Extract YouTube video ID ──────────────────────────────────────────────────
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=)([^&\s]+)/,
    /(?:youtu\.be\/)([^?\s]+)/,
    /(?:youtube\.com\/embed\/)([^?\s]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

// ── Load YouTube IFrame API once globally ─────────────────────────────────────
const loadYouTubeAPI = () => {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) { resolve(); return; }
    const existing = document.getElementById("yt-iframe-api");
    if (!existing) {
      const tag = document.createElement("script");
      tag.id  = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    const check = setInterval(() => {
      if (window.YT && window.YT.Player) { clearInterval(check); resolve(); }
    }, 100);
  });
};

// ── Story Karaoke Reader ──────────────────────────────────────────────────────
const StoryKaraoke = ({ content, onFinished }) => {
  const [currentWordIdx, setCurrentWordIdx] = useState(-1);
  const [isSpeaking,     setIsSpeaking]     = useState(false);
  const [isDone,         setIsDone]         = useState(false);
  const storyBottomRef = useRef(null);
  const wordRefs       = useRef([]);

  // Use same split logic as ttsUtil.js: split by single space
  // This ensures word indices match what ttsUtil's onBoundary reports
  const rawTokens = (content || "").split(' ');
  // Each token is either a word or empty string (from double spaces/newlines)
  const tokens = rawTokens.map((w, idx) => ({
    type: w.trim() === '' ? 'space' : 'word',
    text: w,
    idx,
  }));

  // Auto-scroll to current word
  useEffect(() => {
    if (currentWordIdx >= 0 && wordRefs.current[currentWordIdx]) {
      wordRefs.current[currentWordIdx].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentWordIdx]);

  const startReading = useCallback(() => {
    if (isSpeaking || isDone || !content) return;
    setIsSpeaking(true);
    setCurrentWordIdx(0);

    speakText(content, {
      rate: 0.82,
      pitch: 1.15,
      onBoundary: (wordIndex) => {
        // ttsUtil already gives us the correct global word index (same split(' ') logic)
        setCurrentWordIdx(wordIndex);
      },
      onEnd: () => {
        setCurrentWordIdx(-1);
        setIsSpeaking(false);
        setIsDone(true);
        onFinished?.();
      },
    });
  }, [content, isSpeaking, isDone, onFinished]);

  // Auto-start when component mounts
  useEffect(() => {
    const t = setTimeout(() => startReading(), 600);
    return () => { clearTimeout(t); cancelSpeech(); };
  }, []);

  return (
    <div>
      {/* Status indicator */}
      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        {isDone ? (
          <div style={{
            background: "#ebfbee", border: "2px solid #69db7c",
            borderRadius: 50, padding: "8px 20px",
            fontFamily: "Comic Sans MS, cursive, sans-serif",
            fontSize: "1rem", color: "#2f9e44", fontWeight: "bold",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            ✅ Story finished! Quiz is now unlocked!
          </div>
        ) : isSpeaking ? (
          <div style={{
            background: "#e7f5ff", border: "2px solid #74c0fc",
            borderRadius: 50, padding: "8px 20px",
            fontFamily: "Comic Sans MS, cursive, sans-serif",
            fontSize: "1rem", color: "#1971c2",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#4096ff",
                animation: `speakPulse 0.7s ${i*0.18}s ease-in-out infinite`,
              }}/>
            ))}
            🔊 Reading the story for you…
          </div>
        ) : (
          <div style={{
            background: "#fff9db", border: "2px solid #ffd43b",
            borderRadius: 50, padding: "8px 20px",
            fontFamily: "Comic Sans MS, cursive, sans-serif",
            fontSize: "0.95rem", color: "#856404",
          }}>
            ⏳ Getting ready to read…
          </div>
        )}
      </div>

      {/* Story text with word highlights */}
      <div style={{
        maxHeight: 320, overflowY: "auto",
        background: "linear-gradient(135deg,#f8f9fa,#e9ecef)",
        borderRadius: 16, padding: "18px 22px",
        border: "2px dashed #74b9ff",
        boxShadow: "inset 0 2px 8px rgba(0,0,0,0.08)",
        lineHeight: 2.2, textAlign: "left",
        fontFamily: "Comic Sans MS, cursive, sans-serif",
        fontSize: "1.15rem", color: "#2d3436",
      }}>
        {tokens.map((token, i) => {
          if (token.type === "space") {
            return <span key={i}>{' '}</span>;
          }
          const isActive  = token.idx === currentWordIdx;
          const isPast    = isDone || token.idx < currentWordIdx;
          return (
            <span key={i}>
              <span
                ref={el => wordRefs.current[token.idx] = el}
                style={{
                  display: "inline",
                  background:   isActive ? "#ffd93d"   : isPast ? "#d3f9d8" : "transparent",
                  color:        isActive ? "#5b4e75"   : isPast ? "#2f9e44" : "#2d3436",
                  borderRadius: isActive ? 6           : isPast ? 4         : 0,
                  padding:      isActive ? "2px 6px"   : isPast ? "1px 4px" : "0",
                  fontWeight:   isActive ? "bold"      : "normal",
                  boxShadow:    isActive ? "0 2px 8px rgba(255,217,61,0.6)" : "none",
                  transition:   "all 0.15s ease",
                  fontSize:     isActive ? "1.2rem"    : "1.15rem",
                }}
              >
                {token.text}
              </span>
              {' '}
            </span>
          );
        })}
        <div ref={storyBottomRef} />
      </div>

      {/* Caption */}
      <div style={{
        marginTop: 10, textAlign: "center",
        color: "#636e72", fontFamily: "Comic Sans MS, cursive, sans-serif",
        fontSize: "0.85rem",
      }}>
        {isDone ? "📚 Great listening, little scholar! 🌟" : "👂 Listen carefully to the story!"}
      </div>

      <style>{`
        @keyframes speakPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(1.4); }
        }
      `}</style>
    </div>
  );
};

// ── Main QuizMaterial component ───────────────────────────────────────────────
const QuizMaterial = ({ visible, onClose, material, onVideoWatched, onStoryRead }) => {
  const [videoKey,  setVideoKey]  = useState(0);
  const playerRef = useRef(null);
  const divRef    = useRef(null);

  const videoId = material?.type === "youtube"
    ? getYouTubeVideoId(material.content)
    : null;

  // ── YouTube IFrame API ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible || material?.type !== "youtube" || !videoId) return;
    let player;
    loadYouTubeAPI().then(() => {
      if (!divRef.current) return;
      player = new window.YT.Player(divRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, controls: 1 },
        events: {
          onStateChange: (e) => {
            if (e.data === 0) onVideoWatched?.(); // 0 = ended
          },
        },
      });
      playerRef.current = player;
    });
    return () => {
      try { player?.destroy(); } catch (_) {}
      playerRef.current = null;
    };
  }, [visible, videoId, videoKey]);

  // ── Close handler ─────────────────────────────────────────────────────────────
  const handleClose = () => {
    try { playerRef.current?.stopVideo(); } catch (_) {}
    cancelSpeech();
    setVideoKey(k => k + 1);
    onClose();
  };

  const isYoutube = material?.type === "youtube";
  const isStory   = material?.type === "story";
  const isLink    = material?.type === "link";

  const modalTitle = (
    <span style={{ fontSize: "1.5rem", color: "#ff6b6b", fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
      📚 Learning Material
    </span>
  );

  // ── No material ───────────────────────────────────────────────────────────────
  if (!material) return (
    <Modal open={visible} onCancel={handleClose} footer={null}
      title={modalTitle} centered width={700}
      styles={{ mask: { backgroundColor: "rgba(0,0,0,0.3)" } }}>
      <div style={{ textAlign:"center", padding:"40px 20px", background:"linear-gradient(135deg,#ffeaa7,#fab1a0)", borderRadius:16, color:"#2d3436" }}>
        <div style={{ fontSize:"4rem", marginBottom:16 }}>📝</div>
        <p style={{ fontSize:"1.2rem", fontFamily:"Comic Sans MS,cursive,sans-serif", margin:0 }}>No learning material added yet!</p>
        <p style={{ fontSize:"1rem", opacity:.8, marginTop:8, fontFamily:"Comic Sans MS,cursive,sans-serif" }}>Ask your teacher to add some fun content! 🌟</p>
      </div>
    </Modal>
  );

  return (
    <Modal
      open={visible}
      onCancel={isYoutube ? undefined : handleClose}
      closable={!isYoutube}
      maskClosable={false}
      keyboard={!isYoutube}
      footer={
        isYoutube ? (
          <div style={{ textAlign:"center", padding:"8px 0 4px" }}>
            <div style={{ fontFamily:"Comic Sans MS,cursive,sans-serif", fontSize:13, color:"#888", background:"#fff8e1", borderRadius:8, padding:"8px 16px", display:"inline-block", border:"1px dashed #ffd93d" }}>
              🎬 Watch the full video to unlock the quiz!
            </div>
          </div>
        ) : null
      }
      title={modalTitle}
      centered
      width={isYoutube ? 800 : 700}
      styles={{
        mask: { backgroundColor: "rgba(0,0,0,0.65)" },
        body: { background: "linear-gradient(135deg,#ffecd2,#fcb69f)", borderRadius:16, padding:24 },
      }}
    >
      {/* Header */}
      {material.title && (
        <div style={{ marginBottom:24, textAlign:"center" }}>
          <Title level={2} style={{ color:"#2d3436", marginBottom:12, fontFamily:"Comic Sans MS,cursive,sans-serif", fontSize:"2rem" }}>
            ✨ {material.title} ✨
          </Title>
          <Tag icon={typeIcons[material.type]} color={typeColors[material.type] || "default"}
            style={{ fontSize:"1rem", padding:"8px 16px", borderRadius:20, fontFamily:"Comic Sans MS,cursive,sans-serif", fontWeight:"bold", border:"none", boxShadow:"0 4px 12px rgba(0,0,0,0.15)" }}>
            {material.type.toUpperCase()}
          </Tag>
        </div>
      )}

      {/* Content Card */}
      <Card style={{ background:"linear-gradient(135deg,#fff,#f8f9fa)", borderRadius:20, padding:20, textAlign:"center", boxShadow:"0 8px 32px rgba(0,0,0,0.12)", border:"3px solid #fdcb6e", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:10, right:10, color:"#fdcb6e", fontSize:"1.5rem" }}><StarFilled /></div>
        <div style={{ position:"absolute", top:10, left:10,  color:"#fd79a8", fontSize:"1.2rem" }}><StarFilled /></div>

        {/* ── YouTube ── */}
        {isYoutube && (
          <div>
            <div style={{ fontSize:"2rem", marginBottom:12 }}>🎬</div>
            {videoId ? (
              <>
                <div style={{ position:"relative", paddingBottom:"56.25%", height:0, borderRadius:16, overflow:"hidden", boxShadow:"0 6px 20px rgba(0,0,0,0.15)" }}>
                  <div ref={divRef} key={videoKey} style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%" }} />
                </div>
                <div style={{ marginTop:12, color:"#636e72", fontFamily:"Comic Sans MS,cursive,sans-serif", fontSize:"0.9rem" }}>
                  🍿 Watch the whole video then the quiz will unlock! 🍿
                </div>
              </>
            ) : (
              <div>
                <div style={{ fontSize:"3rem", marginBottom:16 }}>⚠️</div>
                <p style={{ fontFamily:"Comic Sans MS,cursive,sans-serif", color:"#636e72" }}>Could not load video. Please check the YouTube URL.</p>
                <a href={material.content} target="_blank" rel="noopener noreferrer"
                  style={{ color:"#5352ed", fontWeight:"bold", fontFamily:"Comic Sans MS,cursive,sans-serif" }}>
                  🔗 Open in YouTube
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── Story with AI Karaoke reading ── */}
        {isStory && visible && (
          <StoryKaraoke
            key={material.content}
            content={material.content}
            onFinished={() => {
              onStoryRead?.();
            }}
          />
        )}

        {/* ── Link ── */}
        {isLink && (
          <div>
            <div style={{ fontSize:"3rem", marginBottom:20, display:"inline-block", animation:"spin 3s linear infinite" }}>🌍</div>
            <div style={{ background:"linear-gradient(135deg,#00cec9,#55efc4)", padding:20, borderRadius:16, marginBottom:16 }}>
              <div style={{ fontSize:"1.4rem", color:"white", fontFamily:"Comic Sans MS,cursive,sans-serif", marginBottom:12, textShadow:"1px 1px 3px rgba(0,0,0,0.3)" }}>
                🚀 Ready for an adventure?
              </div>
              <a href={material.content} target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-block", fontSize:"1.2rem", color:"white", fontWeight:"bold", textDecoration:"none", background:"rgba(255,255,255,0.2)", padding:"12px 24px", borderRadius:25, fontFamily:"Comic Sans MS,cursive,sans-serif", boxShadow:"0 4px 15px rgba(0,0,0,0.2)", transition:"transform 0.2s ease" }}
                onMouseEnter={e => e.currentTarget.style.transform="scale(1.05)"}
                onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
              >
                🌐 Visit Cool Website! 🎉
              </a>
            </div>
            <div style={{ color:"#636e72", fontFamily:"Comic Sans MS,cursive,sans-serif", fontSize:"0.9rem" }}>
              🔍 Discover amazing things online! ✨
            </div>
          </div>
        )}
      </Card>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes spin   { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
      `}</style>
    </Modal>
  );
};

export default QuizMaterial;