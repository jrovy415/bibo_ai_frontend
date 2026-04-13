import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { speakText, cancelSpeech } from "./ttsUtil";

/* ═══════════════════════════════════════════════════════════
   DESIGN DIRECTION: Candy-Neon Wonderland
   Blazing neon on deep cosmic navy. Every element glows.
   Fonts: Boogaloo (bubbly display) + Nunito (warm body).
   The countdown is HUGE and synced to TTS boundary events.
═══════════════════════════════════════════════════════════ */

// ── Keyframes ─────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Boogaloo&family=Nunito:wght@400;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{overflow:hidden;background:#080818;}

@keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}
@keyframes floatReward{0%{transform:translateY(0) scale(.4);opacity:1}80%{opacity:1}100%{transform:translateY(-200px) scale(1.5);opacity:0}}
@keyframes twinkle{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:1;transform:scale(1.3)}}
@keyframes floatUpDown{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
@keyframes bounceUp{0%,100%{transform:translateY(0) scale(1)}35%{transform:translateY(-34px) scale(1.07)}70%{transform:translateY(-12px) scale(1.03)}}
@keyframes waveArm{0%{transform:rotate(0deg)}100%{transform:rotate(-50deg)}}
@keyframes armSway{0%,100%{transform:rotate(0deg)}50%{transform:rotate(12deg)}}
@keyframes countPop{0%{transform:scale(.2) rotate(-15deg);opacity:0}55%{transform:scale(1.35) rotate(6deg);opacity:1}80%{transform:scale(.95) rotate(-2deg)}100%{transform:scale(1) rotate(0deg);opacity:1}}
@keyframes countExit{0%{transform:scale(1);opacity:1}100%{transform:scale(2.5);opacity:0}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 30px 6px #f472b688,0 10px 40px #6366f188;transform:scale(1)}50%{box-shadow:0 0 60px 18px #fb923c99,0 14px 50px #a855f799;transform:scale(1.05)}}
@keyframes badgePop{0%{transform:scale(0) rotate(-20deg)}65%{transform:scale(1.25) rotate(5deg)}100%{transform:scale(1) rotate(0deg)}}
@keyframes starPop{0%{transform:scale(0) rotate(-15deg);opacity:0}65%{transform:scale(1.3) rotate(8deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
@keyframes ringPulse{0%{transform:scale(.9);opacity:.7}100%{transform:scale(1.9);opacity:0}}
@keyframes slideUp{0%{transform:translateY(30px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes xpFill{from{width:0}to{width:var(--xp-width)}}
@keyframes sparkleOut{0%{opacity:1;transform:rotate(var(--angle)) translateX(0) scale(.5)}100%{opacity:0;transform:rotate(var(--angle)) translateX(90px) scale(1.8)}}
@keyframes neonFlicker{0%,100%{opacity:1}92%{opacity:.85}95%{opacity:.4}97%{opacity:1}}
@keyframes orbitSpin{from{transform:rotate(0deg) translateX(90px)}to{transform:rotate(360deg) translateX(90px)}}
`;

// ── Confetti ──────────────────────────────────────────────
const PALETTE = ["#ff6b6b","#ffd93d","#6bcb77","#4d96ff","#ff922b","#f06595","#a29bfe","#fd79a8","#55efc4","#fdcb6e"];
function Confetti({ active }) {
  const pieces = useRef(Array.from({ length: 70 }, (_, i) => ({
    id: i, color: PALETTE[i % PALETTE.length],
    x: Math.random() * 100, delay: Math.random() * 1.2,
    dur: 1.6 + Math.random() * 1.8,
    shape: ["circle","square","ribbon"][i % 3],
    size: 8 + Math.random() * 10,
  }))).current;
  if (!active) return null;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9999 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:"absolute", left:`${p.x}%`, top:"-20px",
          width: p.shape==="ribbon" ? p.size/2 : p.size,
          height: p.shape==="ribbon" ? p.size*2.5 : p.size,
          background: p.color,
          borderRadius: p.shape==="circle" ? "50%" : p.shape==="square" ? 3 : 2,
          animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
          transform: `rotate(${Math.random()*360}deg)`,
        }} />
      ))}
    </div>
  );
}

// ── Floating reward emojis ────────────────────────────────
function FloatingReward({ emoji, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1800); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position:"fixed",
      left:`${15 + Math.random()*70}%`,
      bottom:"25%",
      fontSize:"2.8rem",
      animation:"floatReward 1.8s ease-out forwards",
      zIndex:9998, pointerEvents:"none",
      filter:"drop-shadow(0 0 12px currentColor)",
    }}>{emoji}</div>
  );
}

// ── Twinkling stars ────────────────────────────────────────
function StarField() {
  const stars = useRef(Array.from({ length: 30 }, (_, i) => ({
    id:i, x:Math.random()*100, y:Math.random()*100,
    size:.4+Math.random()*.9, delay:Math.random()*4, dur:1.8+Math.random()*2.5,
  }))).current;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position:"absolute", left:`${s.x}%`, top:`${s.y}%`,
          width:`${s.size}rem`, height:`${s.size}rem`, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(255,255,255,.95),rgba(196,181,253,.3))",
          animation:`twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          boxShadow:"0 0 10px rgba(196,181,253,.9)",
        }} />
      ))}
    </div>
  );
}

// ── Orbiting sparkles around character ───────────────────
function OrbitSparkles({ active }) {
  if (!active) return null;
  const sparks = ["✨","🌟","💫","⭐","✨","🌟"];
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:5 }}>
      {sparks.map((s,i) => (
        <div key={i} style={{
          position:"absolute", top:"50%", left:"50%",
          fontSize:"1.4rem",
          animation:`orbitSpin ${1.4+i*.15}s ${i*.1}s linear infinite`,
          transformOrigin:"-45px 0",
        }}>{s}</div>
      ))}
    </div>
  );
}

// ── Bibo Character ────────────────────────────────────────
function BiboCharacter({ isSpeaking, isWaving, isHappy, size=200 }) {
  const [mouthOpen, setMouthOpen] = useState(false);
  const [blink, setBlink] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const mRef = useRef(); const bRef = useRef();
  const sc = size/180;

  useEffect(() => {
    clearInterval(mRef.current);
    if (isSpeaking) { setMouthOpen(true); mRef.current = setInterval(() => setMouthOpen(p=>!p), 140); }
    else setMouthOpen(false);
    return () => clearInterval(mRef.current);
  }, [isSpeaking]);

  useEffect(() => {
    const sched = () => { bRef.current = setTimeout(() => { setBlink(true); setTimeout(() => { setBlink(false); sched(); }, 130); }, 2200+Math.random()*2800); };
    sched(); return () => clearTimeout(bRef.current);
  }, []);

  useEffect(() => {
    if (!isHappy) return;
    setSparkles(Array.from({length:7},(_,i)=>({ id:Date.now()+i, angle:(i/7)*360, e:["✨","⭐","💫","🌟","🎉","💥","🔥"][i] })));
    setTimeout(() => setSparkles([]), 1200);
  }, [isHappy]);

  return (
    <div style={{ position:"relative", display:"inline-block" }}>
      {sparkles.map(s => (
        <div key={s.id} style={{
          position:"absolute", top:"50%", left:"50%",
          fontSize:"1.6rem", pointerEvents:"none", zIndex:10,
          animation:"sparkleOut .9s ease-out forwards",
          "--angle":`${s.angle}deg`,
          transform:`rotate(${s.angle}deg) translateX(${75*sc}px)`,
        }}>{s.e}</div>
      ))}
      <svg width={180*sc} height={200*sc} viewBox="0 0 180 200" fill="none"
        style={{
          filter:"drop-shadow(0 0 24px rgba(139,92,246,.6)) drop-shadow(0 12px 32px rgba(99,102,241,.5))",
          animation: isWaving?"bounceUp .6s ease":"floatUpDown 3.5s ease-in-out infinite",
        }}>
        <ellipse cx="90" cy="165" rx="42" ry="30" fill="url(#bg1)" opacity=".95"/>
        <ellipse cx="48" cy="152" rx="15" ry="9" fill="#a5b4fc" transform="rotate(-30 48 152)"
          style={{transformOrigin:"62px 145px",animation:"armSway 3s ease-in-out infinite"}}/>
        <ellipse cx="132" cy="148" rx="15" ry="9" fill="#a5b4fc" transform="rotate(30 132 148)"
          style={{transformOrigin:"118px 145px",animation:isWaving?"waveArm .35s ease-in-out 6 alternate":"armSway 3s ease-in-out infinite reverse"}}/>
        <circle cx="90" cy="105" r="62" fill="url(#bg2)"/>
        <circle cx="90" cy="105" r="62" fill="white" opacity=".07"/>
        {/* cheeks */}
        <ellipse cx="52" cy="121" rx="14" ry="9" fill="#fb7185" opacity={isHappy?.8:.4}/>
        <ellipse cx="128" cy="121" rx="14" ry="9" fill="#fb7185" opacity={isHappy?.8:.4}/>
        {/* eyes */}
        <ellipse cx="70" cy="100" rx="12" ry={blink?2:isHappy?9:13} fill="#1e1b4b" style={{transition:"ry .07s"}}/>
        {!blink&&<circle cx="74" cy="94" r="4.5" fill="white"/>}
        {!blink&&<circle cx="71" cy="92" r="1.8" fill="white" opacity=".6"/>}
        <ellipse cx="112" cy="100" rx="12" ry={blink?2:isHappy?9:13} fill="#1e1b4b" style={{transition:"ry .07s"}}/>
        {!blink&&<circle cx="116" cy="94" r="4.5" fill="white"/>}
        {!blink&&<circle cx="113" cy="92" r="1.8" fill="white" opacity=".6"/>}
        {/* antenna */}
        <line x1="90" y1="46" x2="90" y2="20" stroke="#c4b5fd" strokeWidth="5" strokeLinecap="round"/>
        <circle cx="90" cy="14" r="11" fill="url(#bg3)"/>
        <circle cx="88" cy="11" r="5" fill="white" opacity=".7"/>
        {/* mouth */}
        {mouthOpen ? <>
          <ellipse cx="90" cy="127" rx="18" ry="12" fill="#1e1b4b"/>
          <ellipse cx="90" cy="134" rx="10" ry="7" fill="#f87171"/>
          <circle cx="79" cy="122" r="3.8" fill="white"/>
          <circle cx="101" cy="122" r="3.8" fill="white"/>
        </> : isHappy ? (
          <path d="M68 120 Q90 144 112 120" stroke="#1e1b4b" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
        ) : (
          <path d="M73 123 Q90 138 107 123" stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round" fill="none"/>
        )}
        <ellipse cx="70" cy="70" rx="21" ry="14" fill="white" opacity=".14" transform="rotate(-20 70 70)"/>
        <defs>
          <radialGradient id="bg1" cx="50%" cy="40%"><stop offset="0%" stopColor="#818cf8"/><stop offset="100%" stopColor="#4f46e5"/></radialGradient>
          <radialGradient id="bg2" cx="40%" cy="35%"><stop offset="0%" stopColor="#f0e6ff"/><stop offset="100%" stopColor="#c4b5fd"/></radialGradient>
          <radialGradient id="bg3" cx="40%" cy="35%"><stop offset="0%" stopColor="#fb7185"/><stop offset="100%" stopColor="#e11d48"/></radialGradient>
        </defs>
      </svg>
    </div>
  );
}

// ── XP Bar ─────────────────────────────────────────────────
function XPBar({ xp }) {
  const pct = Math.min(100, xp);
  return (
    <div style={{ width:"100%", maxWidth:300 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'Boogaloo',cursive", fontSize:".85rem", color:"#c4b5fd", marginBottom:5 }}>
        <span>⚡ XP Progress</span><span>{xp}/100</span>
      </div>
      <div style={{ height:16, background:"rgba(167,139,250,.15)", borderRadius:99, overflow:"hidden", border:"1.5px solid rgba(196,181,253,.3)" }}>
        <div style={{
          height:"100%", width:`${pct}%`,
          background:"linear-gradient(90deg,#f472b6,#a78bfa,#38bdf8,#34d399)",
          borderRadius:99, transition:"width .7s cubic-bezier(.34,1.56,.64,1)",
          boxShadow:"0 0 16px rgba(167,139,250,.7)",
          backgroundSize:"200% auto", animation:"shimmer 2s linear infinite",
        }}/>
      </div>
    </div>
  );
}

// ── Badge chip ─────────────────────────────────────────────
function BadgeChip({ emoji, label, unlocked }) {
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center", gap:3,
      opacity: unlocked?1:.25, filter: unlocked?"none":"grayscale(1)",
      animation: unlocked?"badgePop .5s cubic-bezier(.34,1.56,.64,1) both":"none",
    }}>
      <div style={{
        width:48, height:48, borderRadius:14,
        background: unlocked?"linear-gradient(135deg,#fde68a,#fb923c)":"rgba(255,255,255,.08)",
        border:`2px solid ${unlocked?"#fbbf24":"rgba(255,255,255,.15)"}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:"1.6rem",
        boxShadow: unlocked?"0 0 18px #fbbf2488":"none",
      }}>{emoji}</div>
      <div style={{ fontFamily:"'Boogaloo',cursive", fontSize:".62rem", color: unlocked?"#fde68a":"#6b7280", textAlign:"center", lineHeight:1.2 }}>{label}</div>
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────
// ── Font preloader hook ───────────────────────────────────
function useFontReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Wait for Boogaloo font to load before showing countdown
    if (document.fonts && document.fonts.load) {
      document.fonts.load('1em Boogaloo').then(() => setReady(true)).catch(() => setReady(true));
      setTimeout(() => setReady(true), 1500); // fallback timeout
    } else {
      setTimeout(() => setReady(true), 800);
    }
  }, []);
  return ready;
}

export default function HiClick() {
  const fontReady = useFontReady();
  const [phase,       setPhase]       = useState("idle");
  // countdown: 3 | 2 | 1 | "GO!" — driven by TTS word boundaries
  const [countNum,    setCountNum]    = useState(3);
  const [countExiting,setCountExiting]= useState(false);
  const [hlIndex,     setHlIndex]     = useState(-1);
  const [isSpeaking,  setIsSpeaking]  = useState(false);
  const [isWaving,    setIsWaving]    = useState(false);
  const [isHappy,     setIsHappy]     = useState(false);
  const [xp,          setXp]          = useState(0);
  const [showConfetti,setShowConfetti]= useState(false);
  const [rewards,     setRewards]     = useState([]);
  const [badges,      setBadges]      = useState({ greeter:false, listener:false, explorer:false });
  const [showStars,   setShowStars]   = useState(false);
  const [btnPulse,    setBtnPulse]    = useState(true);
  const navigate = useNavigate();
  const rId = useRef(0);

  const addReward = useCallback(e => {
    const id = rId.current++;
    setRewards(r => [...r, { id, emoji:e }]);
  }, []);

  const wave  = useCallback(() => { setIsWaving(true); setTimeout(() => setIsWaving(false), 1400); }, []);
  const happy = useCallback(() => { setIsHappy(true);  setTimeout(() => setIsHappy(false),  1200); }, []);

  useEffect(() => {
    wave();
    speakText("Hi there! I'm so excited to see you! Tap the big button to start our adventure!", {
      rate:.88,
      onStart: () => setIsSpeaking(true),
      onEnd:   () => setIsSpeaking(false),
    });
    return () => cancelSpeech();
  }, []);

  // ── THE FIX: countdown is controlled entirely by TTS word boundaries ──
  // We speak "Get ready! Three! Two! One! Go!" and map word indices to numbers.
  // Word 2="Three!"→show 3, word 3="Two!"→show 2, word 4="One!"→show 1, word 5="Go!"→show GO
  // This guarantees perfect sync between voice and visual.
  const handleStart = () => {
    if (phase !== "idle") return;
    cancelSpeech();
    setBtnPulse(false);
    happy(); addReward("🎉"); setXp(10);
    setPhase("countdown");
    setCountNum(3); setCountExiting(false);

    // Word index map: "Get(0) ready(1) Three(2) Two(3) One(4) Go(5)"
    const countdownWords = { 2:3, 3:2, 4:1, 5:"GO!" };

    speakText("Get ready! Three! Two! One! Go!", {
      rate: .78,
      onStart: () => setIsSpeaking(true),
      onBoundary: (wordIndex) => {
        if (countdownWords[wordIndex] !== undefined) {
          // Animate old number out, new number in
          setCountExiting(true);
          setTimeout(() => {
            setCountNum(countdownWords[wordIndex]);
            setCountExiting(false);
          }, 160);
        }
      },
      onEnd: () => {
        setIsSpeaking(false);
        setPhase("intro");
        startIntro();
      },
    });
  };

  const MODAL_TEXT  = "Woohoo! I'm BiboAI, your super smart buddy! I can listen and understand everything you say! Let's go on an amazing adventure and learn together!";
  const MODAL_WORDS = MODAL_TEXT.split(" ");

  const startIntro = () => {
    wave(); happy();
    setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3500);
    addReward("⭐"); setXp(45);
    setBadges(b => ({ ...b, greeter:true }));

    speakText(MODAL_TEXT, {
      pitch:1.4, rate:.74,
      onStart: () => setIsSpeaking(true),
      onBoundary: (i) => setHlIndex(i),
      onEnd: () => {
        setIsSpeaking(false); setHlIndex(-1);
        setXp(100);
        setBadges(b => ({ ...b, listener:true, explorer:true }));
        setShowStars(true); happy(); addReward("🏆");
        setTimeout(() => { setPhase("done"); navigate("/gameclick"); }, 2200);
      },
    });
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>
      <div style={{
        minHeight:"100vh", width:"100vw", overflow:"hidden",
        background:"radial-gradient(ellipse at 20% 20%,#1a0a3b 0%,#0d0520 40%,#050210 100%)",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        fontFamily:"'Nunito',sans-serif", position:"relative", gap:"1rem",
      }}>
        <StarField/>
        <Confetti active={showConfetti}/>
        {rewards.map(r => <FloatingReward key={r.id} emoji={r.emoji} onDone={() => setRewards(rs=>rs.filter(x=>x.id!==r.id))}/>)}

        {/* ── HUD top ── */}
        <div style={{
          position:"fixed", top:16, left:"50%", transform:"translateX(-50%)",
          width:"90%", maxWidth:380, zIndex:100,
          background:"rgba(255,255,255,.05)", backdropFilter:"blur(14px)",
          border:"1px solid rgba(196,181,253,.2)", borderRadius:20, padding:"14px 20px",
          display:"flex", flexDirection:"column", gap:10,
        }}>
          <XPBar xp={xp}/>
          <div style={{ display:"flex", justifyContent:"center", gap:"1.4rem" }}>
            <BadgeChip emoji="👋" label="Greeter"  unlocked={badges.greeter}/>
            <BadgeChip emoji="👂" label="Listener" unlocked={badges.listener}/>
            <BadgeChip emoji="🚀" label="Explorer" unlocked={badges.explorer}/>
          </div>
        </div>

        {/* ── Character ── */}
        <div style={{ position:"relative", zIndex:1, marginTop:"8rem" }}>
          <OrbitSparkles active={isHappy}/>
          <BiboCharacter isSpeaking={isSpeaking} isWaving={isWaving} isHappy={isHappy} size={210}/>
        </div>

        {/* ══ IDLE ══ */}
        {phase==="idle" && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"1.1rem", zIndex:1, animation:"slideUp .5s ease both" }}>
            <h1 style={{
              fontFamily:"'Boogaloo',cursive",
              fontSize:"clamp(2.2rem,7vw,3.4rem)",
              background:"linear-gradient(90deg,#f9a8d4,#fde68a,#a5f3fc,#86efac,#c4b5fd,#f9a8d4)",
              backgroundSize:"250% auto",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              animation:"shimmer 2.5s linear infinite",
              textAlign:"center", lineHeight:1.15,
              filter:"drop-shadow(0 0 30px rgba(249,168,212,.5))",
            }}>
              Hi there, Superstar! 🌟
            </h1>
            <p style={{ color:"rgba(196,181,253,.85)", fontSize:"1rem", fontWeight:700, textAlign:"center" }}>
              Your epic adventure is waiting…
            </p>

            {/* Pulsing ring around button */}
            <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {btnPulse && <>
                <div style={{ position:"absolute", width:190, height:190, borderRadius:"50%", border:"3px solid #f472b655", animation:"ringPulse 1.8s ease-out infinite" }}/>
                <div style={{ position:"absolute", width:190, height:190, borderRadius:"50%", border:"3px solid #a78bfa44", animation:"ringPulse 1.8s .6s ease-out infinite" }}/>
              </>}
              <button onClick={handleStart} style={{
                background:"linear-gradient(135deg,#f472b6,#a78bfa,#38bdf8)",
                border:"none", borderRadius:60,
                padding:"20px 58px",
                fontSize:"1.6rem", fontFamily:"'Boogaloo',cursive",
                color:"white", cursor:"pointer",
                animation: btnPulse?"pulseGlow 2s ease-in-out infinite":"none",
                boxShadow:"0 10px 40px rgba(167,139,250,.55)",
                letterSpacing:".04em", position:"relative", zIndex:1,
                transition:"transform .1s",
              }}
                onMouseDown={e=>e.currentTarget.style.transform="scale(.95)"}
                onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
              >
                🚀 Let's Go!
              </button>
            </div>
            <div style={{
              background:"rgba(255,255,255,.1)", backdropFilter:"blur(8px)",
              borderRadius:40, padding:"6px 18px", border:"1px solid rgba(255,255,255,.2)",
              fontFamily:"'Boogaloo',cursive", color:"#fde68a", fontSize:".9rem",
              animation:"twinkle 2s ease-in-out infinite",
            }}>👆 Tap the button!</div>
          </div>
        )}

        {/* ══ COUNTDOWN ══ — perfectly synced to TTS */}
        {phase==="countdown" && (
          <div style={{ zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"1rem" }}>
            {/* Number rendered as colored circle to avoid font-loading rect bug */}
            <div style={{
              position:"relative",
              display:"flex", alignItems:"center", justifyContent:"center",
              animation: countExiting
                ? "countExit .16s ease-in forwards"
                : "countPop .5s cubic-bezier(.34,1.56,.64,1) both",
            }}>
              {/* Glow ring behind number */}
              <div style={{
                position:"absolute",
                width: countNum==="GO!" ? 260 : 220,
                height: countNum==="GO!" ? 260 : 220,
                borderRadius:"50%",
                background: countNum==="GO!"
                  ? "radial-gradient(circle,#34d39944,transparent 70%)"
                  : countNum===3 ? "radial-gradient(circle,#38bdf844,transparent 70%)"
                  : countNum===2 ? "radial-gradient(circle,#fbbf2444,transparent 70%)"
                  : "radial-gradient(circle,#f472b644,transparent 70%)",
                animation:"ringPulse 1s ease-out infinite",
              }}/>
              {/* Number circle */}
              <div style={{
                width: countNum==="GO!" ? "auto" : 180,
                height: countNum==="GO!" ? "auto" : 180,
                padding: countNum==="GO!" ? "20px 36px" : 0,
                borderRadius: countNum==="GO!" ? 60 : "50%",
                background: countNum==="GO!"
                  ? "linear-gradient(135deg,#34d399,#a3e635)"
                  : countNum===3 ? "linear-gradient(135deg,#38bdf8,#818cf8)"
                  : countNum===2 ? "linear-gradient(135deg,#fbbf24,#fb923c)"
                  : "linear-gradient(135deg,#f472b6,#fb7185)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow: countNum==="GO!"
                  ? "0 0 50px #34d39966, 0 20px 60px rgba(0,0,0,.5)"
                  : "0 0 50px rgba(167,139,250,.5), 0 20px 60px rgba(0,0,0,.5)",
                border:"4px solid rgba(255,255,255,.25)",
              }}>
                <span style={{
                  fontFamily:"'Boogaloo',cursive,sans-serif",
                  fontSize: countNum==="GO!" ? "clamp(2.5rem,8vw,4rem)" : "clamp(5rem,18vw,9rem)",
                  fontWeight:400,
                  color:"white",
                  lineHeight:1,
                  textShadow:"0 4px 20px rgba(0,0,0,.4)",
                  display:"block",
                  letterSpacing: countNum==="GO!" ? ".05em" : "-.02em",
                }}>
                  {countNum==="GO!" ? "🚀 GO!" : countNum}
                </span>
              </div>
            </div>
            <div style={{
              fontFamily:"'Boogaloo',cursive,sans-serif",
              fontSize:"1.1rem", color:"rgba(196,181,253,.7)",
              letterSpacing:".1em", textTransform:"uppercase",
            }}>
              Get Ready!
            </div>
          </div>
        )}

        {/* ══ INTRO ══ */}
        {phase==="intro" && (
          <div style={{
            background:"rgba(255,255,255,.06)", backdropFilter:"blur(18px)",
            border:"2px solid rgba(196,181,253,.3)",
            borderRadius:28, padding:"22px 26px",
            maxWidth:430, width:"92%", zIndex:1,
            animation:"slideUp .4s ease both",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{
                background:"linear-gradient(135deg,#818cf8,#ec4899)",
                borderRadius:20, padding:"3px 14px",
                fontSize:".8rem", fontFamily:"'Boogaloo',cursive",
                color:"white", letterSpacing:".05em",
                boxShadow:"0 4px 14px rgba(236,72,153,.4)",
              }}>🤖 BiboAI</div>
              {isSpeaking && (
                <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{
                      width:7, height:7, borderRadius:"50%", background:"#a5f3fc",
                      animation:`twinkle .55s ${i*.15}s ease-in-out infinite`,
                    }}/>
                  ))}
                </div>
              )}
            </div>
            <div style={{ fontSize:"1.05rem", lineHeight:1.9, color:"rgba(255,255,255,.92)", fontWeight:600 }}>
              {MODAL_WORDS.map((w,i) => (
                <span key={i} style={{
                  display:"inline-block", marginRight:3,
                  background: i===hlIndex ? "linear-gradient(135deg,#fde68a,#f9a8d4)" : "transparent",
                  color: i===hlIndex ? "#1e1b4b" : "inherit",
                  borderRadius:6, padding:"0 3px",
                  transform: i===hlIndex ? "scale(1.14)" : "scale(1)",
                  transition:"all .12s ease",
                  fontWeight: i===hlIndex ? 900 : 600,
                  boxShadow: i===hlIndex ? "0 2px 12px rgba(253,230,138,.5)" : "none",
                }}>{w}</span>
              ))}
            </div>
            {showStars && (
              <div style={{ marginTop:16, textAlign:"center" }}>
                <div style={{ display:"flex", justifyContent:"center", gap:8 }}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{ fontSize:"2.2rem", animation:`starPop .4s ${i*.15}s both cubic-bezier(.34,1.56,.64,1)` }}>⭐</div>
                  ))}
                </div>
                <p style={{ color:"#fde68a", fontFamily:"'Boogaloo',cursive", fontSize:"1.1rem", marginTop:8 }}>
                  Amazing! You earned 3 stars! 🎉
                </p>
              </div>
            )}
          </div>
        )}

        {phase==="done" && (
          <div style={{ fontSize:"1.6rem", fontFamily:"'Boogaloo',cursive", color:"#fde68a", textAlign:"center", animation:"slideUp .4s ease both", zIndex:1 }}>
            🎮 Loading your game…
          </div>
        )}
      </div>
    </>
  );
}