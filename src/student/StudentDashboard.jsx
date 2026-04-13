import { Spin, Progress, message } from "antd";
import { useAuth } from "../../composables/useAuth";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../plugins/axios";
import { speakText } from "../ttsUtil";
import React from "react";

/* ─── Styles ─────────────────────────────────────────────── */
const floatKeyframes = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');
html, body, #root {
  margin: 0 !important; padding: 0 !important;
  width: 100% !important; max-width: 100% !important;
  overflow-x: hidden !important; box-sizing: border-box !important;
}
*, *::before, *::after { box-sizing: border-box; font-family: 'Nunito', 'Comic Sans MS', cursive, sans-serif !important; }

@keyframes float       { 0%,100%{transform:translateY(0px) rotate(-2deg)} 50%{transform:translateY(-12px) rotate(2deg)} }
@keyframes float2      { 0%,100%{transform:translateY(0px) rotate(3deg)}  50%{transform:translateY(-8px) rotate(-3deg)} }
@keyframes wiggle      { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
@keyframes pop         { 0%{transform:scale(0.8);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
@keyframes rainbowBorder { 0%{border-color:#ff6b6b} 16%{border-color:#ffa94d} 33%{border-color:#ffd43b} 50%{border-color:#69db7c} 66%{border-color:#74c0fc} 83%{border-color:#da77f2} 100%{border-color:#ff6b6b} }
@keyframes bounce      { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-10px)} 60%{transform:translateY(-5px)} }
@keyframes shimmer     { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes twinkle     { 0%,100%{opacity:0.25;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.4)} }
@keyframes glowPulse   { 0%,100%{box-shadow:0 0 12px rgba(255,255,255,0.15)} 50%{box-shadow:0 0 32px rgba(255,255,255,0.5)} }
@keyframes speakingPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.65;transform:scale(1.06)} }
@keyframes floatUpDown { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-14px)} }
@keyframes bounceUp    { 0%,100%{transform:translateY(0) scale(1)} 40%{transform:translateY(-28px) scale(1.05)} 60%{transform:translateY(-10px) scale(1.02)} }
@keyframes waveArm     { 0%{transform:rotate(0deg)} 100%{transform:rotate(-45deg)} }
@keyframes armSway     { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(10deg)} }
@keyframes tutorialSlideIn { 0%{transform:translateY(20px);opacity:0} 70%{transform:translateY(-4px);opacity:1} 100%{transform:translateY(0);opacity:1} }
@keyframes countdownPop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.2);opacity:1} 100%{transform:scale(1);opacity:1} }
@keyframes confettiFall { 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
@keyframes autoNextBar  { from{width:0%} to{width:100%} }
@keyframes biboPointerBounce { 0%,100%{transform:translateY(0) rotate(-10deg)} 50%{transform:translateY(-10px) rotate(-10deg)} }
@keyframes spotlightPulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,211,75,0.9),0 0 0 8px rgba(255,211,75,0.5),0 0 0 18px rgba(255,211,75,0.2)} 50%{box-shadow:0 0 0 6px rgba(255,211,75,0.9),0 0 0 18px rgba(255,211,75,0.5),0 0 0 36px rgba(255,211,75,0.15)} }
@keyframes arrowBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes pointerTeleport { 0%{opacity:0;transform:scale(0.5)} 60%{opacity:1;transform:scale(1.1)} 100%{opacity:1;transform:scale(1)} }

.dashboard-root {
  width: 100%; max-width: 100%; min-height: 100vh;
  background: linear-gradient(160deg,#a8edea 0%,#fed6e3 50%,#ffecd2 100%);
  display: flex; flex-direction: column; align-items: center;
  padding: 24px 16px 80px; overflow-x: hidden; position: relative;
}
.floating-emoji { position: fixed; font-size: clamp(20px,4vw,36px); pointer-events: none; z-index: 0; opacity: 0.35; user-select: none; }
.welcome-card {
  animation: pop 0.6s ease-out forwards, rainbowBorder 4s linear infinite;
  width: 100%; max-width: 600px; border-radius: 24px; border: 4px solid #ff6b6b;
  background: linear-gradient(135deg,#fff9c4 0%,#ffd6e7 50%,#c8f7ff 100%);
  box-shadow: 0 12px 32px rgba(0,0,0,0.12); padding: 28px 20px; text-align: center;
  position: relative; overflow: hidden; z-index: 1; margin-bottom: 24px;
}
.quiz-area { width: 100%; max-width: 600px; z-index: 1; position: relative; }
.quiz-challenge-card { border-radius: 24px; border: 4px solid #ffa94d; background: linear-gradient(135deg,#fffde7,#ffe0ec,#e8f8ff); box-shadow: 0 12px 32px rgba(0,0,0,0.1); padding: 28px 20px; text-align: center; }
.posttest-challenge-card { border-radius: 24px; border: 4px solid #a9e34b; background: linear-gradient(135deg,#f3ffe3,#fffde7,#e8f8ff); box-shadow: 0 12px 32px rgba(169,227,75,0.3); padding: 28px 20px; text-align: center; }
.all-quizzes-card { border-radius: 24px; border: 4px solid #74c0fc; background: linear-gradient(135deg,#fffde7,#e8f8ff); box-shadow: 0 12px 32px rgba(0,0,0,0.1); padding: 24px 16px; }
.all-done-card { border-radius: 24px; border: 4px solid #ffd700; background: linear-gradient(135deg,#fff9c4,#ffd6e7,#c8f7ff); box-shadow: 0 12px 40px rgba(255,215,0,0.3); padding: 28px 20px; text-align: center; }
.difficulty-badge { border-radius: 12px; padding: 10px 16px; font-family: 'Fredoka One', cursive !important; font-size: clamp(14px,3.5vw,18px); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.quiz-item-card { margin-bottom: 12px; border-radius: 16px; background: rgba(255,255,255,0.95); padding: 14px 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.07); transition: transform 0.2s; }
.quiz-item-card:hover { transform: translateY(-2px); }
.go-btn { border: none; border-radius: 14px; color: white; font-family: 'Fredoka One', cursive !important; font-size: clamp(13px,3vw,15px); padding: 10px 20px; cursor: pointer; transition: all 0.15s; white-space: nowrap; flex-shrink: 0; }
.go-btn:hover { transform: translateY(-2px); }
.go-btn:active { transform: translateY(1px); }
.start-btn { border: none; border-radius: 24px; color: white; font-family: 'Fredoka One', cursive !important; font-size: clamp(17px,4vw,22px); padding: clamp(12px,3vw,16px) clamp(36px,8vw,56px); cursor: pointer; background: linear-gradient(90deg,#ff6b6b,#ffa94d); box-shadow: 0 6px 0 #e05a5a, 0 8px 20px rgba(255,107,107,0.4); transition: all 0.15s; }
.start-btn:hover { transform: translateY(-3px); box-shadow: 0 9px 0 #e05a5a; }
.start-btn:active { transform: translateY(2px); }
.start-btn-posttest { border: none; border-radius: 24px; color: white; font-family: 'Fredoka One', cursive !important; font-size: clamp(17px,4vw,22px); padding: clamp(12px,3vw,16px) clamp(36px,8vw,56px); cursor: pointer; background: linear-gradient(90deg,#a9e34b,#2f9e44); box-shadow: 0 6px 0 #1e7a34, 0 8px 20px rgba(46,164,68,0.4); transition: all 0.15s; }
.start-btn-posttest:hover { transform: translateY(-3px); box-shadow: 0 9px 0 #1e7a34; }
.start-btn-posttest:active { transform: translateY(2px); }
.motivational-text { margin-top: 32px; font-size: clamp(14px,3.5vw,18px); font-weight: 800; text-align: center; background: linear-gradient(90deg,#ff6b6b,#ffa94d,#ffd43b,#69db7c,#74c0fc); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 3s linear infinite; padding: 0 16px; z-index: 1; }
`;

/* ─── Confetti ────────────────────────────────────────────── */
const CONFETTI_COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF922B","#CC5DE8","#F06595"];
const TutorialConfetti = () => {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i, left: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 7 + Math.random() * 8,
    delay: Math.random() * 1,
    duration: 2 + Math.random() * 1.5,
  }));
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9999 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:"absolute", left:`${p.left}%`, top:0,
          width:p.size, height:p.size, backgroundColor:p.color,
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          animation:`confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
        }}/>
      ))}
    </div>
  );
};

/* ─── Mini BiboAI for tutorial ───────────────────────────── */
function TutorialBibo({ isSpeaking, isHappy, size = 90 }) {
  const [mouthOpen, setMouthOpen] = useState(false);
  const [blink, setBlink] = useState(false);
  const mRef = useRef(); const bRef = useRef();
  const sc = size / 180;

  useEffect(() => {
    clearInterval(mRef.current);
    if (isSpeaking) { setMouthOpen(true); mRef.current = setInterval(() => setMouthOpen(p => !p), 150); }
    else setMouthOpen(false);
    return () => clearInterval(mRef.current);
  }, [isSpeaking]);

  useEffect(() => {
    const sched = () => { bRef.current = setTimeout(() => { setBlink(true); setTimeout(() => { setBlink(false); sched(); }, 120); }, 2000 + Math.random() * 2500); };
    sched(); return () => clearTimeout(bRef.current);
  }, []);

  return (
    <svg width={180*sc} height={200*sc} viewBox="0 0 180 200" fill="none"
      style={{
        filter:"drop-shadow(0 6px 18px rgba(99,102,241,0.45))",
        animation: "floatUpDown 3s ease-in-out infinite",
      }}>
      <ellipse cx="90" cy="165" rx="38" ry="26" fill="url(#tb1)" opacity=".9"/>
      <ellipse cx="50" cy="152" rx="13" ry="8" fill="#a5b4fc" transform="rotate(-30 50 152)"
        style={{ transformOrigin:"62px 145px", animation:"armSway 3s ease-in-out infinite" }}/>
      <ellipse cx="130" cy="148" rx="13" ry="8" fill="#a5b4fc" transform="rotate(30 130 148)"
        style={{ transformOrigin:"118px 145px", animation:"waveArm .4s ease-in-out 6 alternate" }}/>
      <circle cx="90" cy="105" r="60" fill="url(#tb2)"/>
      <ellipse cx="54" cy="120" rx="13" ry="8" fill="#fda4af" opacity={isHappy ? .8 : .4}/>
      <ellipse cx="126" cy="120" rx="13" ry="8" fill="#fda4af" opacity={isHappy ? .8 : .4}/>
      <ellipse cx="70" cy="100" rx="11" ry={blink ? 2 : isHappy ? 8 : 12} fill="#1e1b4b" style={{ transition:"ry .07s" }}/>
      {!blink && <circle cx="73" cy="94" r="4" fill="white"/>}
      <ellipse cx="112" cy="100" rx="11" ry={blink ? 2 : isHappy ? 8 : 12} fill="#1e1b4b" style={{ transition:"ry .07s" }}/>
      {!blink && <circle cx="115" cy="94" r="4" fill="white"/>}
      <line x1="90" y1="47" x2="90" y2="22" stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="90" cy="16" r="9" fill="url(#tb3)"/>
      {mouthOpen ? <>
        <ellipse cx="90" cy="126" rx="16" ry="10" fill="#1e1b4b"/>
        <ellipse cx="90" cy="132" rx="8" ry="5.5" fill="#f87171"/>
        <circle cx="80" cy="121" r="3" fill="white"/>
        <circle cx="100" cy="121" r="3" fill="white"/>
      </> : isHappy ? (
        <path d="M70 119 Q90 140 110 119" stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round" fill="none"/>
      ) : (
        <path d="M74 122 Q90 136 106 122" stroke="#1e1b4b" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      )}
      <defs>
        <radialGradient id="tb1" cx="50%" cy="40%"><stop offset="0%" stopColor="#818cf8"/><stop offset="100%" stopColor="#4f46e5"/></radialGradient>
        <radialGradient id="tb2" cx="40%" cy="35%"><stop offset="0%" stopColor="#ede9fe"/><stop offset="100%" stopColor="#c7d2fe"/></radialGradient>
        <radialGradient id="tb3" cx="40%" cy="35%"><stop offset="0%" stopColor="#f9a8d4"/><stop offset="100%" stopColor="#ec4899"/></radialGradient>
      </defs>
    </svg>
  );
}

/* ─── Tutorial steps ─────────────────────────────────────── */
const TUTORIAL_STEPS = [
  { title:"Welcome to your Dashboard! 🎓", description:"Welcome to your Dashboard! This is where all your quizzes live! I'll show you how everything works. Just follow along!", speakText:"Welcome to your Dashboard! This is where all your quizzes live! I'll show you how everything works. Just follow along!", highlight:null, emoji:"🌟", color:"#a78bfa", confetti:true },
  { title:"Your Level Badge 🏅", description:"See this colourful badge? It shows your current level. As you complete quizzes you will level up and unlock new challenges!", speakText:"See this colourful badge? It shows your current level! As you complete quizzes, you will level up and unlock new challenges!", highlight:"levelBadge", emoji:"📊", color:"#34d399", confetti:false },
  { title:"Your Quiz Card 🎯", description:"This card shows the next quiz waiting for you! You can see the title, how many questions, and how much time you get!", speakText:"This card shows the next quiz waiting for you! You can see the title, how many questions, and how much time you get!", highlight:"quizCard", emoji:"📋", color:"#fb923c", confetti:false },
  { title:"Press the Button! 🚀", description:"When you are ready, press the big button and start your quiz! You can do it! Give it your absolute best shot! You are amazing!", speakText:"When you are ready, press the big button and start your quiz! You can do it! Give it your absolute best shot! You are amazing!", highlight:"startBtn", emoji:"🎉", color:"#f472b6", confetti:true },
];

const difficultyEmojis = { Introduction:"🌱", Easy:"⭐", Medium:"🔥", Hard:"💎", Expert:"🏆", PostTest:"🎓" };
const difficultyColors = { Introduction:"#69db7c", Easy:"#74c0fc", Medium:"#ffa94d", Hard:"#ff6b6b", Expert:"#cc5de8", PostTest:"#a9e34b" };
const difficultyOrder  = ["Introduction","Easy","Medium","Hard","Expert","PostTest"];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const StudentDashboard = () => {
  const navigate = useNavigate();
  const { authUser, getUser } = useAuth();

  const [loading,           setLoading]           = useState(true);
  const [currentDifficulty, setCurrentDifficulty] = useState("Introduction");
  const [availableQuiz,     setAvailableQuiz]      = useState(null);
  const [allQuizzes,        setAllQuizzes]         = useState(null);
  const [showAllQuizzes,    setShowAllQuizzes]     = useState(false);
  const [allLevelsComplete, setAllLevelsComplete]  = useState(false);

  // Tutorial state
  const [showTutorial,      setShowTutorial]      = useState(false);
  const [tutorialStep,      setTutorialStep]      = useState(0);
  const [tutorialWordIndex, setTutorialWordIndex] = useState(-1);
  const [isTutSpeaking,    setIsTutSpeaking]     = useState(false);
  const [tutConfetti,      setTutConfetti]        = useState(false);
  const [isHappy,          setIsHappy]            = useState(false);
  // Auto-next progress bar (0–100)
  const [autoProgress,     setAutoProgress]       = useState(0);

  const autoNextTimerRef  = useRef(null);
  const autoProgressRef   = useRef(null);
  const isSpeakingRef     = useRef(false);

  useEffect(() => { const init = async () => { try { await getUser(); } catch(e) { console.error(e); } }; init(); }, []);

  useEffect(() => {
    const fetchDifficultyAndQuiz = async () => {
      if (!authUser?.id) return;
      setLoading(true);
      try {
        const diffRes = await axios.get(`/students/${authUser.id}/difficulty`);
        const diff    = diffRes.data.data?.difficulty || "Introduction";
        setCurrentDifficulty(diff);
        const quizRes = await axios.get("/quizzes/get-quiz");
        if (!quizRes.data.data) { setAvailableQuiz(null); setShowAllQuizzes(true); setAllQuizzes({}); return; }
        if (quizRes.data.data.questions) {
          const fetchedQuiz = quizRes.data.data;
          const isPostTestCompleted = fetchedQuiz.difficulty === "PostTest" && fetchedQuiz.latest_quiz_attempt?.completed_at != null;
          if (isPostTestCompleted) { setAllLevelsComplete(true); setAvailableQuiz(null); setShowAllQuizzes(false); }
          else { setAvailableQuiz(fetchedQuiz); setShowAllQuizzes(false); setAllLevelsComplete(false); }
        } else { setAvailableQuiz(null); setShowAllQuizzes(true); setAllQuizzes(quizRes.data.data); setAllLevelsComplete(false); }
      } catch(e) { console.error(e); setCurrentDifficulty("Introduction"); setAvailableQuiz(null); setShowAllQuizzes(true); }
      finally { setLoading(false); }
    };
    fetchDifficultyAndQuiz();
  }, [authUser]);

  // ── Start tutorial after load ──
  useEffect(() => {
    if (!loading && authUser) { const t = setTimeout(() => setShowTutorial(true), 700); return () => clearTimeout(t); }
  }, [loading, authUser]);

  // ── Speak + auto-advance tutorial ──────────────────────────────────────────
  const speakTutorialStep = (step) => {
    const text   = TUTORIAL_STEPS[step].speakText;
    const isLast = step >= TUTORIAL_STEPS.length - 1;

    // Clear any pending auto-next
    clearTimeout(autoNextTimerRef.current);
    clearInterval(autoProgressRef.current);
    setAutoProgress(0);

    window.speechSynthesis?.cancel();
    setTutorialWordIndex(-1);
    setIsTutSpeaking(true);
    isSpeakingRef.current = true;

    if (TUTORIAL_STEPS[step].confetti) { setTutConfetti(true); setTimeout(() => setTutConfetti(false), 2500); }
    setIsHappy(true); setTimeout(() => setIsHappy(false), 1200);

    speakText(text, {
      rate: 0.85, pitch: 1.15,
      onBoundary: (i) => setTutorialWordIndex(i),
      onEnd: () => {
        setTutorialWordIndex(-1);
        setIsTutSpeaking(false);
        isSpeakingRef.current = false;

        if (isLast) {
          // Last step: close after 2s
          autoNextTimerRef.current = setTimeout(() => {
            setShowTutorial(false); setTutorialStep(0);
          }, 2000);
        } else {
          // Auto-next after 1.5s with progress bar
          const DURATION = 1500;
          const INTERVAL = 30;
          let elapsed = 0;
          autoProgressRef.current = setInterval(() => {
            elapsed += INTERVAL;
            setAutoProgress(Math.min(100, (elapsed / DURATION) * 100));
            if (elapsed >= DURATION) {
              clearInterval(autoProgressRef.current);
              setAutoProgress(0);
              setTutorialStep(s => s + 1);
            }
          }, INTERVAL);
        }
      },
    });
  };

  // Re-speak whenever step changes (or tutorial opens)
  useEffect(() => {
    if (!showTutorial) {
      window.speechSynthesis?.cancel();
      clearTimeout(autoNextTimerRef.current);
      clearInterval(autoProgressRef.current);
      setTutorialWordIndex(-1); setIsTutSpeaking(false); setAutoProgress(0);
      return;
    }
    speakTutorialStep(tutorialStep);
    return () => { clearTimeout(autoNextTimerRef.current); clearInterval(autoProgressRef.current); };
  }, [showTutorial, tutorialStep]);

  const skipTutorial = () => {
    window.speechSynthesis?.cancel();
    clearTimeout(autoNextTimerRef.current); clearInterval(autoProgressRef.current);
    setShowTutorial(false); setTutorialStep(0); setAutoProgress(0);
  };

  const handleReplay = () => {
    clearTimeout(autoNextTimerRef.current); clearInterval(autoProgressRef.current);
    setAutoProgress(0);
    speakTutorialStep(tutorialStep);
  };

  const isHighlighted = (field) => showTutorial && TUTORIAL_STEPS[tutorialStep].highlight === field;

  // Refs for measuring element positions for the pointer
  const levelBadgeRef = useRef(null);
  const quizCardRef   = useRef(null);
  const startBtnRef   = useRef(null);

  const highlightRefs = { levelBadge: levelBadgeRef, quizCard: quizCardRef, startBtn: startBtnRef };
  const [pointerPos, setPointerPos] = useState(null);

  // Recompute pointer position whenever step changes
  useEffect(() => {
    if (!showTutorial) { setPointerPos(null); return; }
    const highlight = TUTORIAL_STEPS[tutorialStep].highlight;
    if (!highlight) { setPointerPos(null); return; }
    const ref = highlightRefs[highlight];
    if (!ref?.current) { setPointerPos(null); return; }
    const rect = ref.current.getBoundingClientRect();
    setPointerPos({
      top:  rect.top + window.scrollY,
      left: rect.left + rect.width / 2,
      width: rect.width,
      height: rect.height,
      rectTop: rect.top,
    });
  }, [tutorialStep, showTutorial, availableQuiz]);
  const currentTut    = TUTORIAL_STEPS[tutorialStep];
  const tutWords      = currentTut.description.split(" ");

  const startSpecificQuiz = async (quizId) => {
    try { await axios.post("/quiz-attempts", { quiz_id: quizId, started_at: new Date().toISOString(), score: 0 }); navigate("/student/quiz"); }
    catch { message.error("Oops! Couldn't start quiz. Try again! 🙈"); }
  };

  const renderQuizCard = (quiz, difficulty) => {
    const latestAttempt  = quiz.latest_quiz_attempt;
    const totalQuestions = quiz.questions?.length || 0;
    const score          = latestAttempt?.score ?? 0;
    const progressPct    = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const hasAttempted   = !!latestAttempt;
    const isCompleted    = !!latestAttempt?.completed_at;
    const isPerfected    = isCompleted && progressPct === 100;
    const color          = difficultyColors[difficulty];
    const emoji          = difficultyEmojis[difficulty];
    return (
      <div key={quiz.id} className="quiz-item-card" style={{ border:`3px solid ${color}`, boxShadow:`0 4px 0 ${color}66` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:4 }}>
              <span>{emoji}</span>
              <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(14px,3.5vw,18px)", color:"#333" }}>{quiz.title}</span>
              {isPerfected && <span style={{ background:"linear-gradient(90deg,#69db7c,#a9e34b)", color:"white", borderRadius:20, padding:"1px 10px", fontSize:12, fontWeight:800 }}>⭐ Perfect!</span>}
              {isCompleted && !isPerfected && <span style={{ background:"linear-gradient(90deg,#74c0fc,#a9e34b)", color:"white", borderRadius:20, padding:"1px 10px", fontSize:12, fontWeight:800 }}>✅ Done!</span>}
            </div>
            <p style={{ color:"#777", fontSize:"clamp(11px,2.5vw,13px)", margin:"0 0 6px", fontStyle:"italic", wordBreak:"break-word" }}>{quiz.instructions}</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5, fontSize:"clamp(11px,2.5vw,13px)", marginBottom:isCompleted?6:0 }}>
              <span style={{ background:"#f0f0f0", borderRadius:8, padding:"2px 8px" }}>❓ {totalQuestions} q's</span>
              <span style={{ background:"#f0f0f0", borderRadius:8, padding:"2px 8px" }}>⏱ {quiz.time_limit} min</span>
              {isCompleted && latestAttempt?.score != null && <span style={{ background:"#fff0f6", borderRadius:8, padding:"2px 8px", color, fontWeight:700 }}>🏅 {score}/{totalQuestions}</span>}
            </div>
            {isCompleted && <Progress percent={progressPct} size="small" strokeColor={isPerfected?'#69db7c':color} trailColor="#eee"/>}
          </div>
          <button onClick={() => startSpecificQuiz(quiz.id)} className="go-btn"
            style={{ background:isCompleted?`linear-gradient(135deg,${color},${color}bb)`:"linear-gradient(135deg,#ff6b6b,#ffa94d)", boxShadow:`0 4px 0 ${color}99` }}>
            {isCompleted?"🔄 Again!":hasAttempted?"▶️ Resume!":"🚀 Take Quiz!"}
          </button>
        </div>
      </div>
    );
  };

  if (loading || !authUser) return (
    <>
      <style>{floatKeyframes}</style>
      <div style={{ width:"100%", height:"100vh", background:"linear-gradient(160deg,#a8edea,#fed6e3,#ffecd2)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
        <div style={{ fontSize:"clamp(48px,12vw,72px)", animation:"bounce 1s ease infinite" }}>🎓</div>
        <Spin size="large"/>
        <p style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(16px,4vw,22px)", color:"#ff6b6b" }}>Loading your adventure...</p>
      </div>
    </>
  );

  return (
    <>
      <style>{floatKeyframes}</style>
      {tutConfetti && <TutorialConfetti/>}

      {/* Floating emojis */}
      {[{emoji:"🌟",top:"8%",left:"2%",anim:"float 4s ease-in-out infinite"},{emoji:"🦋",top:"18%",right:"2%",anim:"float2 5s ease-in-out infinite"},{emoji:"🎈",top:"45%",left:"1%",anim:"float 6s ease-in-out infinite 1s"},{emoji:"🌈",bottom:"25%",right:"2%",anim:"float2 4.5s ease-in-out infinite 0.5s"},{emoji:"⭐",bottom:"15%",left:"2%",anim:"wiggle 3s ease-in-out infinite"}].map((item,i) => (
        <div key={i} className="floating-emoji" style={{ top:item.top, left:item.left, right:item.right, bottom:item.bottom, animation:item.anim }}>{item.emoji}</div>
      ))}

      {/* ══ Spotlight + BiboAI Pointer overlay ══ */}
      {showTutorial && pointerPos && (
        <>
          {/* Dark overlay with hole around highlighted element */}
          <div style={{
            position:"fixed", inset:0, zIndex:998, pointerEvents:"none",
            background:"rgba(0,0,0,0.55)",
            WebkitMaskImage:`radial-gradient(ellipse ${pointerPos.width+48}px ${pointerPos.height+48}px at ${pointerPos.left}px ${pointerPos.rectTop + pointerPos.height/2}px, transparent 60%, black 100%)`,
            maskImage:`radial-gradient(ellipse ${pointerPos.width+48}px ${pointerPos.height+48}px at ${pointerPos.left}px ${pointerPos.rectTop + pointerPos.height/2}px, transparent 60%, black 100%)`,
          }}/>

          {/* Golden pulsing spotlight ring around element */}
          <div style={{
            position:"fixed",
            top: pointerPos.rectTop - 10,
            left: pointerPos.left - pointerPos.width/2 - 10,
            width:  pointerPos.width + 20,
            height: pointerPos.height + 20,
            borderRadius: 20,
            border:"4px solid #ffd43b",
            zIndex:999,
            pointerEvents:"none",
            animation:"spotlightPulse 1.2s ease-in-out infinite",
          }}/>

          {/* BiboAI floating pointer above element */}
          <div style={{
            position:"fixed",
            top:  Math.max(10, pointerPos.rectTop - 120),
            left: pointerPos.left - 70,
            zIndex:1000,
            display:"flex", flexDirection:"column", alignItems:"center",
            animation:"pointerTeleport 0.35s cubic-bezier(.36,.07,.19,.97) both",
            pointerEvents:"none",
          }}>
            {/* Mini Bibo */}
            <div style={{ position:"relative" }}>
              <svg width="70" height="78" viewBox="0 0 180 200" fill="none"
                style={{ filter:"drop-shadow(0 4px 16px rgba(99,102,241,0.6))", animation:"biboPointerBounce 1s ease-in-out infinite" }}>
                <ellipse cx="90" cy="165" rx="38" ry="26" fill="url(#pp1)" opacity=".9"/>
                <circle cx="90" cy="105" r="60" fill="url(#pp2)"/>
                <ellipse cx="54" cy="120" rx="13" ry="8" fill="#fda4af" opacity=".7"/>
                <ellipse cx="126" cy="120" rx="13" ry="8" fill="#fda4af" opacity=".7"/>
                <ellipse cx="70" cy="100" rx="11" ry="11" fill="#1e1b4b"/>
                <circle cx="73" cy="94" r="4" fill="white"/>
                <ellipse cx="112" cy="100" rx="11" ry="11" fill="#1e1b4b"/>
                <circle cx="115" cy="94" r="4" fill="white"/>
                <line x1="90" y1="47" x2="90" y2="22" stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="90" cy="16" r="9" fill="url(#pp3)"/>
                <path d="M70 119 Q90 140 110 119" stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round" fill="none"/>
                <defs>
                  <radialGradient id="pp1" cx="50%" cy="40%"><stop offset="0%" stopColor="#818cf8"/><stop offset="100%" stopColor="#4f46e5"/></radialGradient>
                  <radialGradient id="pp2" cx="40%" cy="35%"><stop offset="0%" stopColor="#ede9fe"/><stop offset="100%" stopColor="#c7d2fe"/></radialGradient>
                  <radialGradient id="pp3" cx="40%" cy="35%"><stop offset="0%" stopColor="#f9a8d4"/><stop offset="100%" stopColor="#ec4899"/></radialGradient>
                </defs>
              </svg>
            </div>
            {/* Label chip */}
            <div style={{
              background:"linear-gradient(135deg,#818cf8,#ec4899)",
              color:"white", fontFamily:"'Fredoka One',cursive",
              fontSize:"0.75rem", padding:"3px 12px", borderRadius:20,
              boxShadow:"0 4px 12px rgba(236,72,153,0.5)",
              marginTop:2,
            }}>🤖 BiboAI</div>
            {/* Bouncing arrow pointing down */}
            <div style={{ fontSize:"1.8rem", animation:"arrowBounce 0.7s ease-in-out infinite", marginTop:2 }}>👇</div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════
          TUTORIAL OVERLAY — Bibo + speech bubble
      ══════════════════════════════════════════ */}
      {showTutorial && (
        <div style={{
          position:"fixed", top:"50%", left:"5%",
          transform:"translateY(-50%)",
          zIndex:1000, width:"min(300px,38vw)",
          pointerEvents:"auto",
        }}>
          <div style={{
            background:`linear-gradient(145deg,${currentTut.color}ee,${currentTut.color}aa)`,
            borderRadius:28, padding:"18px 18px 14px",
            boxShadow:`0 0 60px ${currentTut.color}66, 0 20px 60px rgba(0,0,0,0.35)`,
            border:"3px solid rgba(255,255,255,0.55)",
            animation:"tutorialSlideIn 0.45s cubic-bezier(.36,.07,.19,.97)",
            textAlign:"center", position:"relative",
          }}>
            {/* Corner sparkles */}
            {[{top:"10px",left:"14px"},{top:"10px",right:"14px"},{bottom:"50px",left:"14px"},{bottom:"50px",right:"14px"}].map((pos,i) => (
              <span key={i} style={{ position:"absolute",...pos, fontSize:"1rem", animation:`twinkle ${1+i*.35}s ease-in-out infinite`, animationDelay:`${i*.2}s` }}>✦</span>
            ))}

            {/* Arrow pointing right toward dashboard */}
            <div style={{
              position:"absolute", right:"-18px", top:"50%",
              width:0, height:0,
              borderTop:"18px solid transparent", borderBottom:"18px solid transparent",
              borderLeft:`18px solid ${currentTut.color}ee`,
              filter:`drop-shadow(2px 0 6px ${currentTut.color}88)`,
            }}/>

            {/* Bibo character */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:4 }}>
              <TutorialBibo isSpeaking={isTutSpeaking} isHappy={isHappy} size={88}/>
            </div>

            {/* Step emoji + title */}
            <div style={{ fontSize:"1.8rem", marginBottom:4 }}>{currentTut.emoji}</div>
            <h2 style={{ margin:"0 0 8px", fontFamily:"'Fredoka One',cursive", fontSize:"clamp(14px,3.5vw,18px)", color:"white", textShadow:"0 3px 10px rgba(0,0,0,0.3)", lineHeight:1.2 }}>
              {currentTut.title}
            </h2>

            {/* Word-highlighted description */}
            <p style={{ margin:"0 0 10px", fontSize:"clamp(12px,2.8vw,14px)", color:"white", lineHeight:1.7, fontWeight:700 }}>
              {tutWords.map((word, i) => (
                <React.Fragment key={i}>
                  <span style={{
                    display:"inline",
                    background: i===tutorialWordIndex ? "rgba(255,255,255,0.55)" : "transparent",
                    color:       i===tutorialWordIndex ? "#333" : "white",
                    borderRadius:"5px", padding: i===tutorialWordIndex ? "1px 5px" : "0",
                    fontWeight:  i===tutorialWordIndex ? 900 : 700,
                    transition:  "all 0.12s ease",
                  }}>{word}</span>{" "}
                </React.Fragment>
              ))}
            </p>

            {/* Speaking indicator / auto-next bar */}
            {isTutSpeaking ? (
              <div style={{ display:"flex", justifyContent:"center", gap:5, marginBottom:10, height:20, alignItems:"center" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"rgba(255,255,255,.9)", animation:`speakingPulse 0.7s ${i*.18}s ease-in-out infinite` }}/>
                ))}
              </div>
            ) : (
              /* Auto-next progress bar */
              autoProgress > 0 ? (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.7)", fontWeight:700, marginBottom:4 }}>
                    Next up in a moment…
                  </div>
                  <div style={{ height:6, background:"rgba(255,255,255,.2)", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${autoProgress}%`, background:"rgba(255,255,255,.85)", borderRadius:99, transition:"width .03s linear" }}/>
                  </div>
                </div>
              ) : (
                <div style={{ height:20, marginBottom:10 }}/>
              )
            )}

            {/* Progress dots */}
            <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:12 }}>
              {TUTORIAL_STEPS.map((_,i) => (
                <div key={i} style={{
                  width: i===tutorialStep ? 28 : 10, height:10, borderRadius:5,
                  background: i<tutorialStep ? "rgba(255,255,255,.9)" : i===tutorialStep ? "white" : "rgba(255,255,255,.3)",
                  transition:"all 0.3s cubic-bezier(.34,1.56,.64,1)",
                  boxShadow: i===tutorialStep ? "0 0 12px rgba(255,255,255,.8)" : "none",
                }}/>
              ))}
            </div>

            {/* Buttons — Replay + Skip (no manual Next) */}
            <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
              <button onClick={handleReplay} disabled={isTutSpeaking} style={{
                background:"rgba(255,255,255,.18)", border:"2px solid rgba(255,255,255,.55)",
                borderRadius:50, padding:"6px 16px", color:"white",
                fontSize:"clamp(12px,2.8vw,13px)", fontWeight:800, cursor:isTutSpeaking?"not-allowed":"pointer",
                fontFamily:"'Nunito',sans-serif", opacity:isTutSpeaking?.5:1,
                animation:isTutSpeaking?"speakingPulse .8s ease-in-out infinite":"none",
              }}>
                {isTutSpeaking ? "🔊 Speaking…" : "🔁 Replay"}
              </button>
              <button onClick={skipTutorial} style={{
                background:"rgba(255,255,255,.18)", color:"white",
                border:"2px solid rgba(255,255,255,.45)", borderRadius:50,
                padding:"6px 18px", fontSize:"clamp(12px,2.8vw,13px)", fontWeight:800,
                cursor:"pointer", fontFamily:"'Nunito',sans-serif",
              }}>
                Skip ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Dashboard content ══ */}
      <div className="dashboard-root">

        {/* Welcome card */}
        <div className="welcome-card">
          <div style={{ position:"absolute", top:-24, left:-24, width:100, height:100, borderRadius:"50%", background:"rgba(255,107,107,0.1)" }}/>
          <div style={{ position:"absolute", bottom:-16, right:-16, width:80, height:80, borderRadius:"50%", background:"rgba(116,192,252,0.12)" }}/>
          <div style={{ fontSize:"clamp(40px,10vw,64px)", marginBottom:6, animation:"bounce 2s ease infinite" }}>🎓</div>
          <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(20px,5.5vw,32px)", color:"#333", margin:"0 0 6px", lineHeight:1.2 }}>Hey, {authUser.nickname||"Superstar"}! 👋</h1>
          {authUser.grade_level && authUser.section && (
            <p style={{ fontSize:"clamp(12px,3vw,15px)", color:"#666", margin:"0 0 10px", fontWeight:700 }}>{authUser.grade_level} — Section {authUser.section}</p>
          )}
          <div id="level-badge" ref={levelBadgeRef}
            style={{ display:"inline-block", background:`${difficultyColors[currentDifficulty]}22`, border:`3px solid ${difficultyColors[currentDifficulty]}`, borderRadius:16, padding:"7px 20px", transition:"box-shadow 0.3s ease",
              ...(isHighlighted("levelBadge") ? { boxShadow:`0 0 0 4px #ffd43b, 0 0 28px 8px rgba(255,211,75,0.55)`, borderColor:"#ffd43b", animation:"glowPulse 1.4s ease-in-out infinite" } : {}),
            }}>
            <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(14px,3.5vw,18px)", color:difficultyColors[currentDifficulty] }}>
              {difficultyEmojis[currentDifficulty]} Level: {currentDifficulty==="PostTest"?"Post-Test 🎓":currentDifficulty}
            </span>
          </div>

          {/* Level journey */}
          <div style={{ marginTop:12, display:"flex", gap:4, justifyContent:"center", flexWrap:"wrap" }}>
            {["Easy","Medium","Hard","Expert","PostTest"].map(level => {
              const order      = ["Introduction","Easy","Medium","Hard","Expert","PostTest"];
              const levelIdx   = order.indexOf(level);
              const currentIdx = order.indexOf(currentDifficulty);
              const isDone     = currentIdx > levelIdx;
              const isCurrent  = currentIdx === levelIdx;
              const isActive   = isDone || isCurrent;
              return (
                <div key={level} style={{ fontSize:11, fontWeight:800, padding:"3px 10px", borderRadius:20, background:isActive?difficultyColors[level]:"#f0f0f0", color:isActive?"white":"#aaa", border:`2px solid ${isActive?difficultyColors[level]:"#ddd"}`, outline:isCurrent?`3px solid ${difficultyColors[level]}`:"none", outlineOffset:"2px", transition:"all 0.3s ease" }}>
                  {isDone?"✓":difficultyEmojis[level]} {level==="PostTest"?"Post":level}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Quiz area ── */}
        <div className="quiz-area">

          {allLevelsComplete && (
            <div className="all-done-card">
              <div style={{ fontSize:"clamp(48px,14vw,80px)", marginBottom:12, animation:"bounce 2s ease infinite" }}>🎓🏆</div>
              <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(20px,6vw,32px)", color:"#333", margin:"0 0 10px" }}>You're a Reading Champion!</h2>
              <p style={{ color:"#666", fontStyle:"italic", marginBottom:16, fontSize:"clamp(13px,3vw,15px)" }}>You completed the entire reading journey! Amazing work! 🌟</p>
              <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginBottom:20 }}>
                {["Easy","Medium","Hard","Expert"].map(lvl=>(
                  <span key={lvl} style={{ background:difficultyColors[lvl], color:"white", borderRadius:20, padding:"4px 14px", fontFamily:"'Fredoka One',cursive", fontSize:"clamp(12px,3vw,14px)" }}>✓ {difficultyEmojis[lvl]} {lvl}</span>
                ))}
                <span style={{ background:difficultyColors["PostTest"], color:"white", borderRadius:20, padding:"4px 14px", fontFamily:"'Fredoka One',cursive", fontSize:"clamp(12px,3vw,14px)" }}>🎓 Post-Test</span>
              </div>
            </div>
          )}

          {!allLevelsComplete && !showAllQuizzes && availableQuiz && availableQuiz.difficulty==="PostTest" && (
            <div className="posttest-challenge-card"
              style={{ ...(isHighlighted("quizCard")?{boxShadow:"0 0 0 4px #ffd43b, 0 0 28px 8px rgba(255,211,75,0.55)",animation:"glowPulse 1.4s ease-in-out infinite"}:{}), transition:"box-shadow 0.3s ease" }}>
              <div style={{ fontSize:"clamp(40px,12vw,70px)", marginBottom:10, animation:"float 4s ease-in-out infinite" }}>🎓</div>
              <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(18px,5vw,26px)", color:"#333", margin:"0 0 4px" }}>Final Challenge!</h2>
              <div style={{ background:"linear-gradient(135deg,#ebfbee,#d3f9d8)", border:"2px solid #69db7c", borderRadius:12, padding:"10px 16px", marginBottom:12, fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:"clamp(12px,3vw,14px)", color:"#2f9e44" }}>
                🏆 You've completed all reading levels! Time for the Post-Test to show everything you've learned!
              </div>
              <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(15px,4vw,20px)", color:"#2f9e44", margin:"0 0 10px", wordBreak:"break-word" }}>📚 {availableQuiz.title}</h3>
              <p style={{ color:"#666", fontStyle:"italic", marginBottom:16, fontSize:"clamp(12px,3vw,14px)", wordBreak:"break-word" }}>{availableQuiz.instructions}</p>
              <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap", marginBottom:24 }}>
                {[{label:"🎓 Post-Test",color:difficultyColors["PostTest"]},{label:`❓ ${availableQuiz.questions?.length||0} Questions`,color:"#aaa"},{label:`⏱ ${availableQuiz.time_limit} min`,color:"#aaa"}].map((tag,i)=>(
                  <span key={i} style={{ background:"white", borderRadius:12, padding:"5px 14px", fontWeight:800, color:tag.color, border:`2px solid ${tag.color}`, fontSize:"clamp(11px,2.5vw,14px)" }}>{tag.label}</span>
                ))}
              </div>
              <button className={`start-btn-posttest${isHighlighted("startBtn")?" tutorial-highlight":""}`} onClick={()=>startSpecificQuiz(availableQuiz.id)}
                style={{ ...(isHighlighted("startBtn")?{boxShadow:"0 0 0 4px #ffd43b, 0 0 28px 8px rgba(255,211,75,0.55)",animation:"glowPulse 1.4s ease-in-out infinite"}:{}) }}>
                🎓 Start Post-Test!
              </button>
            </div>
          )}

          {!allLevelsComplete && !showAllQuizzes && availableQuiz && availableQuiz.difficulty!=="PostTest" && (
            <div className="quiz-challenge-card" id="quizCard" ref={quizCardRef}
              style={{ ...(isHighlighted("quizCard")?{boxShadow:"0 0 0 4px #ffd43b, 0 0 28px 8px rgba(255,211,75,0.55)",animation:"glowPulse 1.4s ease-in-out infinite"}:{}), transition:"box-shadow 0.3s ease" }}>
              <div style={{ fontSize:"clamp(40px,12vw,70px)", marginBottom:10, animation:"float 4s ease-in-out infinite" }}>🎯</div>
              <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(18px,5vw,26px)", color:"#333", margin:"0 0 4px" }}>Your Next Challenge!</h2>
              <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(15px,4vw,20px)", color:"#ff6b6b", margin:"0 0 10px", wordBreak:"break-word" }}>📚 {availableQuiz.title}</h3>
              <p style={{ color:"#666", fontStyle:"italic", marginBottom:16, fontSize:"clamp(12px,3vw,14px)", wordBreak:"break-word" }}>{availableQuiz.instructions}</p>
              <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap", marginBottom:24 }}>
                {[{label:`${difficultyEmojis[availableQuiz.difficulty]} ${availableQuiz.difficulty}`,color:difficultyColors[availableQuiz.difficulty]},{label:`❓ ${availableQuiz.questions?.length||0} Questions`,color:"#aaa"},{label:`⏱ ${availableQuiz.time_limit} min`,color:"#aaa"}].map((tag,i)=>(
                  <span key={i} style={{ background:"white", borderRadius:12, padding:"5px 14px", fontWeight:800, color:tag.color, border:`2px solid ${tag.color}`, fontSize:"clamp(11px,2.5vw,14px)" }}>{tag.label}</span>
                ))}
              </div>
              <button ref={startBtnRef} className="start-btn" id="startBtn" onClick={()=>startSpecificQuiz(availableQuiz.id)}
                style={{ ...(isHighlighted("startBtn")?{boxShadow:"0 0 0 4px #ffd43b, 0 0 28px 8px rgba(255,211,75,0.55)",animation:"glowPulse 1.4s ease-in-out infinite"}:{}) }}>
                🚀 Let's Go!
              </button>
            </div>
          )}

          {!allLevelsComplete && showAllQuizzes && (
            <div className="all-quizzes-card">
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div style={{ fontSize:"clamp(40px,10vw,60px)", marginBottom:8, animation:"bounce 2s ease infinite" }}>📚</div>
                <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(18px,5vw,26px)", color:"#333", margin:"0 0 4px" }}>All Quizzes</h2>
                <p style={{ color:"#888", fontSize:"clamp(12px,3vw,14px)", margin:0 }}>Pick one and show what you know! 💪</p>
              </div>
              {allQuizzes && difficultyOrder.map(difficulty => {
                const quizzesInDiff = allQuizzes[difficulty];
                if (!quizzesInDiff || quizzesInDiff.length===0) return null;
                const color = difficultyColors[difficulty]; const emoji = difficultyEmojis[difficulty];
                return (
                  <div key={difficulty} style={{ marginBottom:24 }}>
                    <div className="difficulty-badge" style={{ background:`linear-gradient(135deg,${color},${color}cc)`, color:"white", boxShadow:`0 4px 12px ${color}55` }}>
                      <span>{emoji}</span><span>{difficulty==="PostTest"?"Post-Test":`${difficulty} Level`}</span>
                      <span style={{ background:"rgba(255,255,255,0.3)", borderRadius:8, padding:"1px 10px", fontSize:"clamp(11px,2.5vw,13px)", marginLeft:"auto" }}>{quizzesInDiff.length} quiz{quizzesInDiff.length!==1?"zes":""}</span>
                    </div>
                    {quizzesInDiff.map(quiz => renderQuizCard(quiz, difficulty))}
                  </div>
                );
              })}
              {availableQuiz && (
                <div style={{ textAlign:"center", marginTop:12 }}>
                  <button onClick={()=>setShowAllQuizzes(false)} style={{ background:"linear-gradient(90deg,#ff6b6b,#ffa94d)", border:"none", borderRadius:20, color:"white", fontFamily:"'Fredoka One',cursive", fontSize:"clamp(13px,3vw,16px)", padding:"10px 28px", cursor:"pointer", boxShadow:"0 4px 0 #e05a5a" }}>
                    ← Back to My Quiz
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="motivational-text">
          {allLevelsComplete ? "✨ You did it! You're a Reading Champion! 🏆🎓" : "✨ You're amazing! Keep learning and growing! 🌟"}
        </p>
      </div>
    </>
  );
};

export default StudentDashboard;