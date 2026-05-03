import { useState, useEffect, useRef } from "react";
import { CONFETTI_COLORS } from "./dashboardConstants";

export const TutorialConfetti = () => {
  const pieces = Array.from({ length:30 }, (_,i) => ({
    id: i,
    left: Math.random()*100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 7 + Math.random()*8,
    delay: Math.random()*1,
    duration: 2 + Math.random()*1.5,
  }));
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9999 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:"absolute", left:`${p.left}%`, top:0,
          width:p.size, height:p.size, backgroundColor:p.color,
          borderRadius: Math.random()>0.5 ? "50%" : "2px",
          animation:`confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
        }}/>
      ))}
    </div>
  );
};

export function TutorialBibo({ isSpeaking, isHappy, size=90 }) {
  const [mouthOpen, setMouthOpen] = useState(false);
  const [blink,     setBlink]     = useState(false);
  const mRef = useRef(); const bRef = useRef();
  const sc = size / 180;

  useEffect(() => {
    clearInterval(mRef.current);
    if (isSpeaking) {
      setMouthOpen(true);
      mRef.current = setInterval(() => setMouthOpen(p => !p), 150);
    } else {
      setMouthOpen(false);
    }
    return () => clearInterval(mRef.current);
  }, [isSpeaking]);

  useEffect(() => {
    const s = () => {
      bRef.current = setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); s(); }, 120);
      }, 2000 + Math.random()*2500);
    };
    s();
    return () => clearTimeout(bRef.current);
  }, []);

  return (
    <svg width={180*sc} height={200*sc} viewBox="0 0 180 200" fill="none"
      style={{ filter:"drop-shadow(0 6px 18px rgba(99,102,241,0.45))", animation:"floatUpDown 3s ease-in-out infinite" }}>
      <ellipse cx="90" cy="165" rx="38" ry="26" fill="url(#tb1)" opacity=".9"/>
      <ellipse cx="50" cy="152" rx="13" ry="8" fill="#a5b4fc" transform="rotate(-30 50 152)"
        style={{ transformOrigin:"62px 145px", animation:"armSway 3s ease-in-out infinite" }}/>
      <ellipse cx="130" cy="148" rx="13" ry="8" fill="#a5b4fc" transform="rotate(30 130 148)"
        style={{ transformOrigin:"118px 145px", animation:"waveArm .4s ease-in-out 6 alternate" }}/>
      <circle cx="90" cy="105" r="60" fill="url(#tb2)"/>
      <ellipse cx="54"  cy="120" rx="13" ry="8" fill="#fda4af" opacity={isHappy ? .8 : .4}/>
      <ellipse cx="126" cy="120" rx="13" ry="8" fill="#fda4af" opacity={isHappy ? .8 : .4}/>
      <ellipse cx="70"  cy="100" rx="11" ry={blink ? 2 : isHappy ? 8 : 12} fill="#1e1b4b" style={{ transition:"ry .07s" }}/>
      {!blink && <circle cx="73" cy="94" r="4" fill="white"/>}
      <ellipse cx="112" cy="100" rx="11" ry={blink ? 2 : isHappy ? 8 : 12} fill="#1e1b4b" style={{ transition:"ry .07s" }}/>
      {!blink && <circle cx="115" cy="94" r="4" fill="white"/>}
      <line x1="90" y1="47" x2="90" y2="22" stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="90" cy="16" r="9" fill="url(#tb3)"/>
      {mouthOpen
        ? <><ellipse cx="90" cy="126" rx="16" ry="10" fill="#1e1b4b"/><ellipse cx="90" cy="132" rx="8" ry="5.5" fill="#f87171"/><circle cx="80" cy="121" r="3" fill="white"/><circle cx="100" cy="121" r="3" fill="white"/></>
        : isHappy
          ? <path d="M70 119 Q90 140 110 119" stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round" fill="none"/>
          : <path d="M74 122 Q90 136 106 122" stroke="#1e1b4b" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      }
      <defs>
        <radialGradient id="tb1" cx="50%" cy="40%"><stop offset="0%" stopColor="#818cf8"/><stop offset="100%" stopColor="#4f46e5"/></radialGradient>
        <radialGradient id="tb2" cx="40%" cy="35%"><stop offset="0%" stopColor="#ede9fe"/><stop offset="100%" stopColor="#c7d2fe"/></radialGradient>
        <radialGradient id="tb3" cx="40%" cy="35%"><stop offset="0%" stopColor="#f9a8d4"/><stop offset="100%" stopColor="#ec4899"/></radialGradient>
      </defs>
    </svg>
  );
}
