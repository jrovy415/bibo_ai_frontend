import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { speakText, cancelSpeech } from "../ttsUtil";

/* ── Styles ─────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { overflow: hidden; background: #080818; }

@keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
@keyframes wiggle   { 0%,100%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} }
@keyframes twinkle  { 0%,100%{opacity:.15;transform:scale(.7)} 50%{opacity:1;transform:scale(1.3)} }
@keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes bounceIn { 0%{transform:scale(.3);opacity:0} 60%{transform:scale(1.1)} 80%{transform:scale(.95)} 100%{transform:scale(1);opacity:1} }
@keyframes slideUp  { 0%{transform:translateY(30px);opacity:0} 100%{transform:translateY(0);opacity:1} }
@keyframes lockShake{ 0%,100%{transform:rotate(0)} 20%{transform:rotate(-12deg)} 40%{transform:rotate(12deg)} 60%{transform:rotate(-8deg)} 80%{transform:rotate(8deg)} }
@keyframes bubbleRise { 0%{transform:translateY(0);opacity:.5} 100%{transform:translateY(-110vh);opacity:0} }
@keyframes pulse    { 0%,100%{box-shadow:0 0 0 0 rgba(255,107,107,.6)} 50%{box-shadow:0 0 0 18px rgba(255,107,107,0)} }
@keyframes armSway  { 0%,100%{transform:rotate(0)} 50%{transform:rotate(10deg)} }
@keyframes mouthBounce { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.3)} }
`;

/* ── Star field ─────────────────────────────────────────── */
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

/* ── Floating bubbles ───────────────────────────────────── */
function Bubbles() {
    const b = useRef(Array.from({length:10},(_,i)=>({
        id:i, left:Math.random()*100,
        size:16+Math.random()*40,
        dur:5+Math.random()*6, delay:Math.random()*4,
        color:["#ff6b6b","#ffd93d","#6bcb77","#4d96ff","#da77f2"][i%5],
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

/* ── Sad Bibo ───────────────────────────────────────────── */
function SadBibo({ isSpeaking, size=180 }) {
    const [blink, setBlink] = useState(false);
    const [mouthOpen, setMouthOpen] = useState(false);
    const bRef = useRef(); const mRef = useRef();
    const sc = size/180;

    useEffect(() => {
        const sched = () => {
            bRef.current = setTimeout(() => {
                setBlink(true);
                setTimeout(() => { setBlink(false); sched(); }, 130);
            }, 2000+Math.random()*2500);
        };
        sched(); return () => clearTimeout(bRef.current);
    }, []);

    useEffect(() => {
        clearInterval(mRef.current);
        if (isSpeaking) {
            setMouthOpen(true);
            mRef.current = setInterval(() => setMouthOpen(p=>!p), 150);
        } else setMouthOpen(false);
        return () => clearInterval(mRef.current);
    }, [isSpeaking]);

    return (
        <svg width={180*sc} height={200*sc} viewBox="0 0 180 200" fill="none"
            style={{
                filter:"drop-shadow(0 0 24px rgba(255,107,107,.5))",
                animation:"float 3.5s ease-in-out infinite",
            }}>
            {/* Body */}
            <ellipse cx="90" cy="165" rx="42" ry="30" fill="url(#sb1)" opacity=".9"/>
            {/* Arms — drooping sadly */}
            <ellipse cx="42" cy="158" rx="14" ry="8" fill="#a5b4fc" transform="rotate(20 42 158)"
                style={{transformOrigin:"60px 148px",animation:"armSway 3s ease-in-out infinite"}}/>
            <ellipse cx="138" cy="158" rx="14" ry="8" fill="#a5b4fc" transform="rotate(-20 138 158)"
                style={{transformOrigin:"120px 148px",animation:"armSway 3s ease-in-out infinite reverse"}}/>
            {/* Face */}
            <circle cx="90" cy="100" r="62" fill="url(#sb2)"/>
            <circle cx="90" cy="100" r="62" fill="white" opacity=".07"/>
            {/* Sad cheeks */}
            <ellipse cx="52" cy="120" rx="13" ry="8" fill="#fda4af" opacity=".5"/>
            <ellipse cx="128" cy="120" rx="13" ry="8" fill="#fda4af" opacity=".5"/>
            {/* Sad eyes — drooping */}
            <ellipse cx="70" cy="98" rx="11" ry={blink?2:10} fill="#1e1b4b" style={{transition:"ry .07s"}}/>
            {!blink && <circle cx="73" cy="92" r="4" fill="white"/>}
            <ellipse cx="112" cy="98" rx="11" ry={blink?2:10} fill="#1e1b4b" style={{transition:"ry .07s"}}/>
            {!blink && <circle cx="115" cy="92" r="4" fill="white"/>}
            {/* Sad eyebrows */}
            <path d="M60 82 Q70 87 80 82" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M100 82 Q110 87 120 82" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none"/>
            {/* Tears */}
            <ellipse cx="63" cy="112" rx="3" ry="5" fill="#93c5fd" opacity=".8"/>
            <ellipse cx="117" cy="112" rx="3" ry="5" fill="#93c5fd" opacity=".8"/>
            {/* Antenna */}
            <line x1="90" y1="40" x2="90" y2="16" stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="90" cy="10" r="9" fill="url(#sb3)"/>
            {/* Sad mouth */}
            {mouthOpen ? (
                <ellipse cx="90" cy="128" rx="14" ry="9" fill="#1e1b4b"/>
            ) : (
                <path d="M72 128 Q90 116 108 128" stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round" fill="none"/>
            )}
            <defs>
                <radialGradient id="sb1" cx="50%" cy="40%"><stop offset="0%" stopColor="#818cf8"/><stop offset="100%" stopColor="#4f46e5"/></radialGradient>
                <radialGradient id="sb2" cx="40%" cy="35%"><stop offset="0%" stopColor="#ffe4e6"/><stop offset="100%" stopColor="#fecdd3"/></radialGradient>
                <radialGradient id="sb3" cx="40%" cy="35%"><stop offset="0%" stopColor="#fda4af"/><stop offset="100%" stopColor="#f43f5e"/></radialGradient>
            </defs>
        </svg>
    );
}

/* ── Lock icon ──────────────────────────────────────────── */
function LockIcon() {
    return (
        <div style={{
            fontSize:72, lineHeight:1,
            animation:"lockShake 1.5s ease-in-out infinite",
            filter:"drop-shadow(0 0 20px rgba(255,107,107,.7))",
        }}>🔒</div>
    );
}

/* ── Main ───────────────────────────────────────────────── */
export default function LockedScreen() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const navigate  = useNavigate();
    const location  = useLocation();
    const nickname  = location.state?.nickname;
    const spokenRef = useRef(false);

    useEffect(() => {
        if (spokenRef.current) return;
        spokenRef.current = true;

        setTimeout(() => {
            speakText(
                `Oh no! Your account is locked! Please ask your teacher to unlock it so you can start reading! Don't worry, you will be reading soon!`,
                {
                    rate: 0.85, pitch: 1.2,
                    onStart: () => setIsSpeaking(true),
                    onEnd:   () => setIsSpeaking(false),
                }
            );
        }, 800);

        return () => cancelSpeech();
    }, []);

    const handleLogout = () => {
        cancelSpeech();
        window.localStorage.removeItem("APP_STUDENT_TOKEN");
        navigate("/login");
    };

    return (
        <>
            <style>{STYLES}</style>
            <div style={{
                minHeight:"100vh", width:"100vw", overflow:"hidden",
                background:"radial-gradient(ellipse at 30% 20%,#2d0a1f 0%,#1a0a2e 45%,#050210 100%)",
                display:"flex", flexDirection:"column", alignItems:"center",
                justifyContent:"center", fontFamily:"'Nunito',sans-serif",
                position:"relative", gap:"1.4rem", padding:"1rem",
            }}>
                <StarField/>
                <Bubbles/>

                {/* Lock icon */}
                <div style={{ zIndex:1, animation:"bounceIn .6s cubic-bezier(.36,.07,.19,.97) both" }}>
                    <LockIcon/>
                </div>

                {/* Sad Bibo */}
                <div style={{ zIndex:1 }}>
                    <SadBibo isSpeaking={isSpeaking} size={170}/>
                </div>

                {/* Message card */}
                <div style={{
                    zIndex:1, maxWidth:420, width:"92%",
                    background:"rgba(255,255,255,.07)", backdropFilter:"blur(18px)",
                    border:"2px solid rgba(255,107,107,.35)",
                    borderRadius:28, padding:"24px 28px", textAlign:"center",
                    animation:"slideUp .5s ease both",
                    boxShadow:"0 20px 60px rgba(0,0,0,.5)",
                }}>
                    {/* Title */}
                    <h1 style={{
                        fontFamily:"'Fredoka One',cursive",
                        fontSize:"clamp(1.8rem,6vw,2.4rem)",
                        background:"linear-gradient(90deg,#ff6b6b,#ffd93d,#ff6b6b)",
                        backgroundSize:"200% auto",
                        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                        backgroundClip:"text",
                        animation:"shimmer 2.5s linear infinite",
                        margin:"0 0 10px", lineHeight:1.2,
                    }}>
                        Oops! Account Locked 🔒
                    </h1>

                    {/* Message */}
                    <p style={{
                        fontFamily:"'Nunito',sans-serif",
                        fontSize:"clamp(.95rem,2.8vw,1.1rem)",
                        fontWeight:700, color:"rgba(255,255,255,.85)",
                        lineHeight:1.7, margin:"0 0 20px",
                    }}>
                        {nickname ? `Hi ${nickname}! ` : ""}
                        Your account is currently <strong style={{color:"#ff6b6b"}}>locked</strong>. 😢<br/>
                        Please ask your <strong style={{color:"#ffd93d"}}>teacher</strong> to unlock it<br/>
                        so you can start reading! 📚
                    </p>

                    {/* Instruction pill */}
                    <div style={{
                        display:"inline-flex", alignItems:"center", gap:8,
                        background:"rgba(255,107,107,.15)",
                        border:"1.5px solid rgba(255,107,107,.4)",
                        borderRadius:50, padding:"8px 20px",
                        fontFamily:"'Fredoka One',cursive",
                        fontSize:"clamp(.85rem,2.5vw,1rem)",
                        color:"#fda4af", marginBottom:20,
                        animation:"pulse 2s ease-in-out infinite",
                    }}>
                        🙋 Ask your teacher to unlock your account!
                    </div>

                    {/* Back button */}
                    <button onClick={handleLogout} style={{
                        width:"100%", border:"none", borderRadius:50,
                        padding:"13px 0",
                        background:"linear-gradient(90deg,#ff6b6b,#ffa94d)",
                        color:"white",
                        fontFamily:"'Fredoka One',cursive",
                        fontSize:"1.1rem", cursor:"pointer",
                        boxShadow:"0 6px 0 #c0392b",
                        transition:"transform .15s",
                    }}
                        onMouseDown={e=>e.currentTarget.style.transform="scale(.97)"}
                        onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
                    >
                        🏠 Go Back
                    </button>
                </div>

                {/* Floating emojis */}
                {["😢","🔒","💔","😢","🔑","💔"].map((e,i)=>(
                    <div key={i} style={{
                        position:"fixed",
                        left: i%2===0 ? `${3+i*4}%` : `${85-i*4}%`,
                        top: `${10+i*13}%`,
                        fontSize: 22+i%3*8,
                        opacity:.25, pointerEvents:"none",
                        animation:`wiggle ${2+i*.4}s ${i*.3}s ease-in-out infinite`,
                        zIndex:0,
                    }}>{e}</div>
                ))}
            </div>
        </>
    );
}