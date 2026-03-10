import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─── Speech Helper ────────────────────────────────────────────────────────────
function useSpeech() {
  const speak = useCallback((text, { onStart, onBoundary, onEnd, pitch = 1.4, rate = 0.72 } = {}) => {
    window.speechSynthesis.cancel();
    const go = () => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.pitch = pitch;
      utter.rate = rate;
      const voices = window.speechSynthesis.getVoices();
      const voice =
        voices.find((v) => /(Google UK English Female|Google US English Female|Microsoft Zira|Samantha)/i.test(v.name)) ||
        voices.find((v) => /(female|child|girl|kid|young)/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];
      if (voice) utter.voice = voice;
      utter.onstart = () => onStart?.();
      utter.onboundary = (e) => onBoundary?.(e);
      utter.onend = () => onEnd?.();
      utter.onerror = () => onEnd?.();
      window.speechSynthesis.speak(utter);
    };
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.onvoiceschanged = null; setTimeout(go, 80); };
    } else { setTimeout(go, 80); }
  }, []);
  const cancel = useCallback(() => window.speechSynthesis.cancel(), []);
  return { speak, cancel };
}

// ─── Animated Background Stars ────────────────────────────────────────────────
function BackgroundStars() {
  const stars = useRef(Array.from({ length: 24 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: 0.5 + Math.random() * 1.2,
    delay: Math.random() * 4,
    duration: 2 + Math.random() * 3,
  }))).current;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.size}rem`, height: `${s.size}rem`,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.9), rgba(196,181,253,0.4))",
          animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
          boxShadow: "0 0 8px rgba(196,181,253,0.8)",
        }} />
      ))}
    </div>
  );
}

// ─── Floating Bubbles ─────────────────────────────────────────────────────────
function FloatingBubbles() {
  const bubbles = useRef(Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 20 + Math.random() * 50,
    duration: 6 + Math.random() * 6,
    delay: Math.random() * 4,
  }))).current;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {bubbles.map(b => (
        <div key={b.id} style={{
          position: "absolute",
          bottom: "-80px",
          left: `${b.left}%`,
          width: b.size, height: b.size,
          borderRadius: "50%",
          border: "2px solid rgba(196,181,253,0.35)",
          background: "rgba(167,139,250,0.08)",
          animation: `bubbleRise ${b.duration}s ${b.delay}s ease-in infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── BiboAI Character ─────────────────────────────────────────────────────────
function BiboCharacter({ isSpeaking, isWaving, isHappy, size = 130 }) {
  const [mouthOpen, setMouthOpen] = useState(false);
  const [blinkState, setBlinkState] = useState(false);
  const mouthRef = useRef(null);
  const blinkRef = useRef(null);
  const scale = size / 180;

  useEffect(() => {
    clearInterval(mouthRef.current);
    if (isSpeaking) {
      setMouthOpen(true);
      mouthRef.current = setInterval(() => setMouthOpen((p) => !p), 150);
    } else setMouthOpen(false);
    return () => clearInterval(mouthRef.current);
  }, [isSpeaking]);

  useEffect(() => {
    const scheduleBlink = () => {
      blinkRef.current = setTimeout(() => {
        setBlinkState(true);
        setTimeout(() => { setBlinkState(false); scheduleBlink(); }, 130);
      }, 2200 + Math.random() * 2800);
    };
    scheduleBlink();
    return () => clearTimeout(blinkRef.current);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg
        width={180 * scale} height={200 * scale}
        viewBox="0 0 180 200" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(0 12px 32px rgba(99,102,241,0.35))",
          animation: isWaving ? "bounceUp 0.6s ease" : "floatUpDown 3.5s ease-in-out infinite",
        }}
      >
        <ellipse cx="90" cy="165" rx="42" ry="30" fill="url(#bodyGradG)" opacity="0.9" />
        <ellipse cx="48" cy="152" rx="15" ry="9" fill="#a5b4fc" transform="rotate(-30 48 152)"
          style={{ transformOrigin: "62px 145px", animation: "armSway 3s ease-in-out infinite" }} />
        <ellipse cx="132" cy="148" rx="15" ry="9" fill="#a5b4fc" transform="rotate(30 132 148)"
          style={{
            transformOrigin: "118px 145px",
            animation: isWaving ? "waveArm 0.35s ease-in-out 5 alternate" : "armSway 3s ease-in-out infinite reverse",
          }} />
        <circle cx="90" cy="105" r="60" fill="url(#faceGradG)" />
        <circle cx="90" cy="105" r="60" fill="white" opacity="0.06" />
        <ellipse cx="53" cy="120" rx="13" ry="8" fill="#fda4af" opacity={isHappy ? 0.75 : 0.45} />
        <ellipse cx="127" cy="120" rx="13" ry="8" fill="#fda4af" opacity={isHappy ? 0.75 : 0.45} />
        <ellipse cx="70" cy="100" rx="11" ry={blinkState ? 2 : isHappy ? 8 : 12} fill="#1e1b4b" style={{ transition: "ry 0.07s" }} />
        {!blinkState && <circle cx="73.5" cy="95" r="4" fill="white" />}
        <ellipse cx="112" cy="100" rx="11" ry={blinkState ? 2 : isHappy ? 8 : 12} fill="#1e1b4b" style={{ transition: "ry 0.07s" }} />
        {!blinkState && <circle cx="115.5" cy="95" r="4" fill="white" />}
        {isHappy && !blinkState && <>
          <circle cx="68" cy="107" r="2" fill="white" opacity="0.8" />
          <circle cx="110" cy="107" r="2" fill="white" opacity="0.8" />
        </>}
        <line x1="90" y1="47" x2="90" y2="22" stroke="#a5b4fc" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="90" cy="16" r="10" fill="url(#antennaBallG)" />
        <circle cx="90" cy="16" r="5" fill="white" opacity="0.6" />
        {mouthOpen ? (
          <>
            <ellipse cx="90" cy="126" rx="17" ry="11" fill="#1e1b4b" />
            <ellipse cx="90" cy="133" rx="9" ry="6" fill="#f87171" />
            <circle cx="80" cy="121" r="3.5" fill="white" />
            <circle cx="100" cy="121" r="3.5" fill="white" />
          </>
        ) : isHappy ? (
          <path d="M70 119 Q90 140 110 119" stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M74 122 Q90 136 106 122" stroke="#1e1b4b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        )}
        <ellipse cx="70" cy="70" rx="20" ry="13" fill="white" opacity="0.15" transform="rotate(-20 70 70)" />
        <defs>
          <radialGradient id="bodyGradG" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </radialGradient>
          <radialGradient id="faceGradG" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#ede9fe" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </radialGradient>
          <radialGradient id="antennaBallG" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#f9a8d4" />
            <stop offset="100%" stopColor="#ec4899" />
          </radialGradient>
        </defs>
      </svg>

      {/* Name tag */}
      <div style={{
        background: "linear-gradient(135deg, #818cf8, #ec4899)",
        color: "white", fontWeight: 800,
        fontSize: "0.8rem", fontFamily: "'Fredoka One', cursive",
        padding: "4px 14px", borderRadius: "2rem",
        boxShadow: "0 4px 14px rgba(129,140,248,0.5)",
        marginTop: "-2px", letterSpacing: "0.05em",
      }}>
        🤖 BiboAI
      </div>

      <style>{`
        @keyframes waveArm { 0% { transform: rotate(0deg); } 100% { transform: rotate(-45deg); } }
        @keyframes armSway { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(10deg); } }
        @keyframes bounceUp { 0%, 100% { transform: translateY(0) scale(1); } 40% { transform: translateY(-28px) scale(1.05); } 70% { transform: translateY(-10px) scale(1.02); } }
        @keyframes floatUpDown { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }
      `}</style>
    </div>
  );
}

// ─── Message ──────────────────────────────────────────────────────────────────
const MESSAGE = "Hi there! In this game, we will learn new words together! When you see the words on the screen, say them clearly and loudly. Let's practice speaking and have fun!";
const MESSAGE_WORDS = MESSAGE.split(" ");

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GameClick() {
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const spokenRef = useRef(false);
  const navigate = useNavigate();
  const { speak, cancel } = useSpeech();

  const triggerWave = useCallback(() => {
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 1400);
  }, []);

  useEffect(() => {
    if (spokenRef.current) return;
    spokenRef.current = true;

    // Small entry delay so page renders first
    setTimeout(() => {
      setIsModalOpen(true);
      triggerWave();
      setIsHappy(true);
      setTimeout(() => setIsHappy(false), 1200);

      speak(MESSAGE, {
        onStart: () => setIsSpeaking(true),
        onBoundary: (e) => {
          if (e.charIndex !== undefined) {
            let total = 0;
            for (let i = 0; i < MESSAGE_WORDS.length; i++) {
              total += MESSAGE_WORDS[i].length + 1;
              if (e.charIndex < total) { setHighlightIndex(i); break; }
            }
          }
        },
        onEnd: () => {
          setIsSpeaking(false);
          setHighlightIndex(-1);
          setIsHappy(true);
          setTimeout(() => setIsHappy(false), 1200);
          setTimeout(() => {
            setIsModalOpen(false);
            navigate("/login");
          }, 600);
        },
      });
    }, 400);

    return () => cancel();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes bubbleRise {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-110vh) scale(1.3); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalPop {
          0% { opacity: 0; transform: scale(0.85) translateY(20px); }
          70% { transform: scale(1.02) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes readyPop {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh", width: "100vw",
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #6d28d9 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "'Nunito', sans-serif",
        position: "relative", overflow: "hidden",
        gap: "1rem",
      }}>
        <BackgroundStars />
        <FloatingBubbles />

        {/* Header */}
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          zIndex: 100, textAlign: "center",
        }}>
          <h1 style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: "clamp(1.5rem, 5vw, 2.2rem)",
            background: "linear-gradient(90deg, #f9a8d4, #fde68a, #a5f3fc, #c4b5fd)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shimmer 3s linear infinite",
          }}>
            🎮 Word Adventure!
          </h1>
        </div>

        {/* Character always visible */}
        <div style={{ zIndex: 1, marginTop: "3rem" }}>
          <BiboCharacter isSpeaking={isSpeaking} isWaving={isWaving} isHappy={isHappy} size={150} />
        </div>

        {/* Subtitle shown when not in modal */}
        {!isModalOpen && (
          <p style={{
            color: "rgba(196,181,253,0.9)", fontSize: "1rem",
            fontWeight: 700, textAlign: "center",
            fontFamily: "'Nunito', sans-serif",
            animation: "fadeSlideUp 0.6s ease both",
            zIndex: 1,
          }}>
            Get ready to learn and speak clearly! 🗣️
          </p>
        )}

        {/* Intro modal */}
        {isModalOpen && (
          <div style={{
            position: "fixed", inset: 0,
            background: "rgba(10,5,30,0.6)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, padding: "1rem",
          }}>
            <div style={{
              background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)",
              border: "2px solid rgba(196,181,253,0.35)",
              borderRadius: 28, padding: "28px 32px",
              maxWidth: 440, width: "100%",
              animation: "modalPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem",
            }}>
              {/* Bibo inside modal */}
              <BiboCharacter isSpeaking={isSpeaking} isWaving={isWaving} isHappy={isHappy} size={120} />

              {/* BiboAI label + sound dots */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  background: "linear-gradient(135deg, #818cf8, #ec4899)",
                  borderRadius: 20, padding: "3px 14px",
                  fontSize: "0.8rem", fontFamily: "'Fredoka One', cursive",
                  color: "white", letterSpacing: "0.05em",
                }}>🤖 BiboAI</div>
                {isSpeaking && (
                  <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#a5f3fc",
                        animation: `twinkle 0.6s ${i * 0.15}s ease-in-out infinite`,
                      }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Word-highlighted text */}
              <div style={{
                fontSize: "1.05rem", lineHeight: 1.9,
                color: "rgba(255,255,255,0.92)", fontWeight: 600,
                textAlign: "center",
              }}>
                {MESSAGE_WORDS.map((word, i) => (
                  <span key={i} style={{
                    display: "inline-block",
                    background: i === highlightIndex ? "linear-gradient(135deg,#fde68a,#f9a8d4)" : "transparent",
                    color: i === highlightIndex ? "#1e1b4b" : "inherit",
                    borderRadius: 6, padding: "0 3px",
                    transform: i === highlightIndex ? "scale(1.12)" : "scale(1)",
                    transition: "all 0.12s ease",
                    fontWeight: i === highlightIndex ? 800 : 600,
                    marginRight: 3,
                  }}>
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}