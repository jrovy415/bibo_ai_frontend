import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { speakText, cancelSpeech } from "./ttsUtil";

/* ═══════════════════════════════════════════════════════════
   GameClick — Arcade Carnival / Word Party
   NO modal popup — speech bubble appears inline below Bibo,
   exactly like HiClick photo 3.
═══════════════════════════════════════════════════════════ */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Boogaloo&family=Nunito:wght@400;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{overflow:hidden;background:#050210;}

@keyframes twinkle{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:1;transform:scale(1.3)}}
@keyframes bubbleRise{0%{transform:translateY(0) scale(1);opacity:.5}100%{transform:translateY(-110vh) scale(1.4);opacity:0}}
@keyframes floatUpDown{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
@keyframes bounceUp{0%,100%{transform:translateY(0) scale(1)}35%{transform:translateY(-34px) scale(1.07)}70%{transform:translateY(-12px) scale(1.03)}}
@keyframes waveArm{0%{transform:rotate(0deg)}100%{transform:rotate(-50deg)}}
@keyframes armSway{0%,100%{transform:rotate(0deg)}50%{transform:rotate(12deg)}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes slideUp{0%{transform:translateY(28px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes titleFloat{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-10px) rotate(1deg)}}
@keyframes ringExpand{0%{transform:scale(.8);opacity:.8}100%{transform:scale(2.2);opacity:0}}
@keyframes bubblePop{0%{opacity:0;transform:scale(.85) translateY(12px)}65%{transform:scale(1.03) translateY(-3px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes neonPulse{0%,100%{text-shadow:0 0 20px currentColor,0 0 40px currentColor}50%{text-shadow:0 0 40px currentColor,0 0 80px currentColor}}
`;

// ── Star field ───────────────────────────────────────────────
function StarField() {
  const stars = useRef(Array.from({length:28},(_,i)=>({
    id:i, x:Math.random()*100, y:Math.random()*100,
    size:.35+Math.random()*.85, delay:Math.random()*4, dur:1.8+Math.random()*2.5,
  }))).current;
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
      {stars.map(s=>(
        <div key={s.id} style={{
          position:"absolute",left:`${s.x}%`,top:`${s.y}%`,
          width:`${s.size}rem`,height:`${s.size}rem`,borderRadius:"50%",
          background:"radial-gradient(circle,rgba(255,255,255,.95),rgba(196,181,253,.25))",
          animation:`twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          boxShadow:"0 0 8px rgba(196,181,253,.8)",
        }}/>
      ))}
    </div>
  );
}

// ── Floating bubbles ─────────────────────────────────────────
function Bubbles() {
  const b = useRef(Array.from({length:12},(_,i)=>({
    id:i, left:Math.random()*100,
    size:16+Math.random()*44,
    dur:5+Math.random()*7, delay:Math.random()*5,
    color:["#f472b6","#818cf8","#38bdf8","#34d399","#fbbf24","#fb923c"][i%6],
  }))).current;
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
      {b.map(x=>(
        <div key={x.id} style={{
          position:"absolute",bottom:"-60px",left:`${x.left}%`,
          width:x.size,height:x.size,borderRadius:"50%",
          border:`2px solid ${x.color}44`,background:`${x.color}0a`,
          animation:`bubbleRise ${x.dur}s ${x.delay}s ease-in infinite`,
        }}/>
      ))}
    </div>
  );
}

// ── Bibo Character ───────────────────────────────────────────
function BiboCharacter({isSpeaking,isWaving,isHappy,size=160}) {
  const [mouthOpen,setMouthOpen]=useState(false);
  const [blink,setBlink]=useState(false);
  const mRef=useRef(); const bRef=useRef();
  const sc=size/180;

  useEffect(()=>{
    clearInterval(mRef.current);
    if(isSpeaking){setMouthOpen(true);mRef.current=setInterval(()=>setMouthOpen(p=>!p),145);}
    else setMouthOpen(false);
    return()=>clearInterval(mRef.current);
  },[isSpeaking]);

  useEffect(()=>{
    const s=()=>{bRef.current=setTimeout(()=>{setBlink(true);setTimeout(()=>{setBlink(false);s();},130);},2200+Math.random()*2800);};
    s();return()=>clearTimeout(bRef.current);
  },[]);

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
      <svg width={180*sc} height={200*sc} viewBox="0 0 180 200" fill="none"
        style={{
          filter:"drop-shadow(0 0 28px rgba(139,92,246,.7)) drop-shadow(0 10px 28px rgba(99,102,241,.5))",
          animation:isWaving?"bounceUp .6s ease":"floatUpDown 3.5s ease-in-out infinite",
        }}>
        <ellipse cx="90" cy="165" rx="42" ry="30" fill="url(#gc1)" opacity=".95"/>
        <ellipse cx="48" cy="152" rx="15" ry="9" fill="#a5b4fc" transform="rotate(-30 48 152)"
          style={{transformOrigin:"62px 145px",animation:"armSway 3s ease-in-out infinite"}}/>
        <ellipse cx="132" cy="148" rx="15" ry="9" fill="#a5b4fc" transform="rotate(30 132 148)"
          style={{transformOrigin:"118px 145px",animation:isWaving?"waveArm .35s ease-in-out 6 alternate":"armSway 3s ease-in-out infinite reverse"}}/>
        <circle cx="90" cy="105" r="62" fill="url(#gc2)"/>
        <circle cx="90" cy="105" r="62" fill="white" opacity=".07"/>
        <ellipse cx="52" cy="121" rx="14" ry="9" fill="#fb7185" opacity={isHappy?.8:.4}/>
        <ellipse cx="128" cy="121" rx="14" ry="9" fill="#fb7185" opacity={isHappy?.8:.4}/>
        <ellipse cx="70" cy="100" rx="12" ry={blink?2:isHappy?9:13} fill="#1e1b4b" style={{transition:"ry .07s"}}/>
        {!blink&&<circle cx="74" cy="94" r="4.5" fill="white"/>}
        <ellipse cx="112" cy="100" rx="12" ry={blink?2:isHappy?9:13} fill="#1e1b4b" style={{transition:"ry .07s"}}/>
        {!blink&&<circle cx="116" cy="94" r="4.5" fill="white"/>}
        <line x1="90" y1="46" x2="90" y2="20" stroke="#c4b5fd" strokeWidth="5" strokeLinecap="round"/>
        <circle cx="90" cy="14" r="11" fill="url(#gc3)"/>
        <circle cx="88" cy="11" r="5" fill="white" opacity=".7"/>
        {mouthOpen?<>
          <ellipse cx="90" cy="127" rx="18" ry="12" fill="#1e1b4b"/>
          <ellipse cx="90" cy="134" rx="10" ry="7" fill="#f87171"/>
          <circle cx="79" cy="122" r="3.8" fill="white"/>
          <circle cx="101" cy="122" r="3.8" fill="white"/>
        </>:isHappy?(
          <path d="M68 120 Q90 144 112 120" stroke="#1e1b4b" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
        ):(
          <path d="M73 123 Q90 138 107 123" stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round" fill="none"/>
        )}
        <ellipse cx="70" cy="70" rx="21" ry="14" fill="white" opacity=".13" transform="rotate(-20 70 70)"/>
        <defs>
          <radialGradient id="gc1" cx="50%" cy="40%"><stop offset="0%" stopColor="#818cf8"/><stop offset="100%" stopColor="#4f46e5"/></radialGradient>
          <radialGradient id="gc2" cx="40%" cy="35%"><stop offset="0%" stopColor="#f0e6ff"/><stop offset="100%" stopColor="#c4b5fd"/></radialGradient>
          <radialGradient id="gc3" cx="40%" cy="35%"><stop offset="0%" stopColor="#fb7185"/><stop offset="100%" stopColor="#e11d48"/></radialGradient>
        </defs>
      </svg>
      {/* BiboAI label */}
      <div style={{
        background:"linear-gradient(135deg,#818cf8,#ec4899)",
        color:"white",fontWeight:800,
        fontSize:".78rem",fontFamily:"'Boogaloo',cursive",
        padding:"4px 16px",borderRadius:"2rem",
        boxShadow:"0 4px 16px rgba(129,140,248,.55)",
        letterSpacing:".06em",
        animation:"neonPulse 2s ease-in-out infinite",
      }}>🤖 BiboAI</div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────
const MESSAGE = "Hi there! In this game, we will learn new words together! When you see the words on the screen, say them clearly and loudly. Let's practice speaking and have fun!";
const WORDS   = MESSAGE.split(" ");

export default function GameClick() {
  const [hlIndex,    setHlIndex]    = useState(-1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isWaving,   setIsWaving]   = useState(false);
  const [isHappy,    setIsHappy]    = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const spokenRef = useRef(false);
  const navigate  = useNavigate();

  const wave  = useCallback(()=>{ setIsWaving(true); setTimeout(()=>setIsWaving(false),1400); },[]);
  const happy = useCallback(()=>{ setIsHappy(true);  setTimeout(()=>setIsHappy(false), 1200); },[]);

  useEffect(()=>{
    if(spokenRef.current) return;
    spokenRef.current = true;

    setTimeout(()=>{
      setShowBubble(true);
      wave(); happy();

      speakText(MESSAGE, {
        onStart:    ()=> setIsSpeaking(true),
        onBoundary: (i)=> setHlIndex(i),
        onEnd: ()=>{
          setIsSpeaking(false);
          setHlIndex(-1);
          happy();
          setTimeout(()=>{ setShowBubble(false); navigate("/login"); }, 700);
        },
      });
    }, 500);

    return () => cancelSpeech();
  }, []);

  return (
    <>
      <style>{STYLES}</style>
      <div style={{
        minHeight:"100vh", width:"100vw", overflow:"hidden",
        background:"radial-gradient(ellipse at 30% 10%,#1a0540 0%,#0a0225 45%,#030110 100%)",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        fontFamily:"'Nunito',sans-serif", position:"relative", gap:"1.2rem", padding:"1rem",
      }}>
        <StarField/><Bubbles/>

        {/* ── Title header ── */}
        <div style={{
          position:"fixed", top:0, left:0, right:0, zIndex:100,
          padding:"14px 24px",
          background:"rgba(5,2,16,.6)", backdropFilter:"blur(16px)",
          borderBottom:"1px solid rgba(196,181,253,.12)",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <div style={{position:"absolute",left:"8%",width:55,height:55,borderRadius:"50%",border:"2px solid #f472b622",animation:"ringExpand 3s ease-out infinite"}}/>
          <div style={{position:"absolute",right:"8%",width:45,height:45,borderRadius:"50%",border:"2px solid #38bdf822",animation:"ringExpand 3s 1.2s ease-out infinite"}}/>
          <h1 style={{
            fontFamily:"'Boogaloo',cursive",
            fontSize:"clamp(1.4rem,5vw,2.2rem)",
            background:"linear-gradient(90deg,#f9a8d4,#fde68a,#a5f3fc,#86efac,#c4b5fd)",
            backgroundSize:"250% auto",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            animation:"shimmer 2.5s linear infinite, titleFloat 4s ease-in-out infinite",
            margin:0,
          }}>🎮 Word Adventure!</h1>
        </div>

        {/* ── Character ── */}
        <div style={{ zIndex:1, marginTop:"5rem" }}>
          <BiboCharacter isSpeaking={isSpeaking} isWaving={isWaving} isHappy={isHappy} size={170}/>
        </div>

        {/* ── Speech bubble — inline below character, no modal ── */}
        {showBubble && (
          <div style={{
            position:"relative", zIndex:1,
            width:"100%", maxWidth:480,
            animation:"bubblePop .4s cubic-bezier(.34,1.56,.64,1) both",
          }}>
            {/* Tail pointing up toward Bibo */}
            <div style={{
              width:0, height:0,
              borderLeft:"14px solid transparent",
              borderRight:"14px solid transparent",
              borderBottom:"16px solid rgba(196,181,253,.18)",
              margin:"0 auto",
            }}/>
            <div style={{
              background:"rgba(255,255,255,.06)",
              backdropFilter:"blur(18px)",
              border:"1.5px solid rgba(196,181,253,.25)",
              borderRadius:24, padding:"20px 24px",
              boxShadow:"0 20px 60px rgba(0,0,0,.5)",
            }}>
              {/* BiboAI label + speaking dots */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <div style={{
                  background:"linear-gradient(135deg,#818cf8,#ec4899)",
                  borderRadius:20, padding:"3px 14px",
                  fontSize:".8rem", fontFamily:"'Boogaloo',cursive",
                  color:"white", letterSpacing:".05em",
                  boxShadow:"0 4px 14px rgba(236,72,153,.4)",
                }}>🤖 BiboAI</div>
                {isSpeaking && (
                  <div style={{display:"flex",gap:4,alignItems:"center"}}>
                    {[0,1,2].map(i=>(
                      <div key={i} style={{
                        width:7,height:7,borderRadius:"50%",
                        background:"#a5f3fc",
                        animation:`twinkle .55s ${i*.15}s ease-in-out infinite`,
                      }}/>
                    ))}
                  </div>
                )}
              </div>

              {/* Word-highlighted message — same style as HiClick intro */}
              <div style={{
                fontSize:"1.05rem", lineHeight:1.95,
                color:"rgba(255,255,255,.92)", fontWeight:600,
              }}>
                {WORDS.map((w,i) => (
                  <span key={i} style={{
                    display:"inline-block", marginRight:4,
                    background: i===hlIndex ? "linear-gradient(135deg,#fde68a,#f9a8d4)" : "transparent",
                    color: i===hlIndex ? "#1e1b4b" : "inherit",
                    borderRadius:6, padding:"0 4px",
                    transform: i===hlIndex ? "scale(1.14) translateY(-1px)" : "scale(1)",
                    transition:"all .12s ease",
                    fontWeight: i===hlIndex ? 900 : 600,
                    boxShadow: i===hlIndex ? "0 2px 12px rgba(253,230,138,.5)" : "none",
                  }}>{w}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hint when not yet speaking */}
        {!showBubble && (
          <p style={{
            color:"rgba(196,181,253,.75)", fontSize:"1rem", fontWeight:700,
            textAlign:"center", animation:"slideUp .5s ease both", zIndex:1,
          }}>
            Get ready to learn and speak clearly! 🗣️
          </p>
        )}
      </div>
    </>
  );
}