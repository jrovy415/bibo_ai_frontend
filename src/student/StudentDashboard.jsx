import { Spin, Progress, message } from "antd";
import { useAuth } from "../../composables/useAuth";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../plugins/axios";
import { speakText } from "../ttsUtil";
import React from "react";

import {
  floatKeyframes, TUTORIAL_STEPS,
  difficultyEmojis, difficultyColors, difficultyLabels, difficultyOrder,
  isPostTestDifficulty, getStarCount, StarRow,
} from "./dashboard/dashboardConstants";
import { TutorialConfetti, TutorialBibo } from "./dashboard/TutorialBibo";
import HistorySection from "./dashboard/HistorySection";

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const StudentDashboard = () => {
  const navigate = useNavigate();
  const { authUser, getUser } = useAuth();

  const [loading,           setLoading]           = useState(true);
  const [currentDifficulty, setCurrentDifficulty] = useState("Introduction");
  const [availableQuiz,     setAvailableQuiz]     = useState(null);
  const [allQuizzes,        setAllQuizzes]        = useState(null);
  const [showAllQuizzes,    setShowAllQuizzes]    = useState(false);
  const [allLevelsComplete, setAllLevelsComplete] = useState(false);
  const [showHistory,       setShowHistory]       = useState(false);
  const [dashboardAttempts, setDashboardAttempts] = useState([]);

  const [showTutorial,     setShowTutorial]     = useState(false);
  const [tutorialStep,     setTutorialStep]     = useState(0);
  const [tutorialWordIndex,setTutorialWordIndex]= useState(-1);
  const [isTutSpeaking,    setIsTutSpeaking]    = useState(false);
  const [tutConfetti,      setTutConfetti]      = useState(false);
  const [isHappy,          setIsHappy]          = useState(false);
  const [autoProgress,     setAutoProgress]     = useState(0);

  const autoNextTimerRef  = useRef(null);
  const autoProgressRef   = useRef(null);

  useEffect(() => { const init = async () => { try { await getUser(); } catch(e) { console.error(e); } }; init(); }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!authUser?.id) return;
      setLoading(true);
      try {
        // Single request replacing 4 separate API calls
        const res      = await axios.get("/dashboard");
        const { difficulty, quiz, attempts } = res.data.data;

        const diff     = difficulty || "Introduction";
        const attList  = Array.isArray(attempts) ? attempts : [];
        setCurrentDifficulty(diff);
        setDashboardAttempts(attList);

        const hasCompletedPostTest = attList.some(a => {
          const d = a.difficulty || a.quiz?.difficulty;
          return isPostTestDifficulty(d) && a.completed_at != null;
        });

        if (diff === 'Introduction' && hasCompletedPostTest) {
          setAllLevelsComplete(true); setAvailableQuiz(null); setShowAllQuizzes(false);
          return;
        }

        if (quiz?.questions) {
          const latestAttempt   = quiz.latest_quiz_attempt;
          const isOwnAttempt    = latestAttempt?.student_id === authUser.id;
          const latestIntroAttempt = attList
            .filter(a => (a.difficulty || a.quiz?.difficulty) === 'Introduction' && a.completed_at)
            .sort((a,b) => new Date(b.completed_at) - new Date(a.completed_at))[0];
          const latestIntroDate = latestIntroAttempt?.completed_at ? new Date(latestIntroAttempt.completed_at) : null;
          const postTestDate    = latestAttempt?.completed_at      ? new Date(latestAttempt.completed_at)      : null;

          const isPostTestCompleted =
            isPostTestDifficulty(quiz.difficulty) &&
            isOwnAttempt && postTestDate != null &&
            diff === quiz.difficulty &&
            (latestIntroDate === null || postTestDate > latestIntroDate);

          if (isPostTestCompleted) { setAllLevelsComplete(true); setAvailableQuiz(null); setShowAllQuizzes(false); }
          else { setAvailableQuiz(quiz); setShowAllQuizzes(false); setAllLevelsComplete(false); }
        } else {
          setAvailableQuiz(null); setShowAllQuizzes(true);
          setAllQuizzes(quiz || {}); setAllLevelsComplete(false);
        }
      } catch(e) {
        console.error(e);
        setCurrentDifficulty("Introduction"); setAvailableQuiz(null); setShowAllQuizzes(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [authUser]);

  useEffect(() => {
    if (!loading && authUser) {
      const t = setTimeout(() => setShowTutorial(true), 700);
      return () => clearTimeout(t);
    }
  }, [loading, authUser]);

  const speakTutorialStep = (step) => {
    const text   = TUTORIAL_STEPS[step].speakText;
    const isLast = step >= TUTORIAL_STEPS.length - 1;
    clearTimeout(autoNextTimerRef.current); clearInterval(autoProgressRef.current); setAutoProgress(0);
    window.speechSynthesis?.cancel(); setTutorialWordIndex(-1); setIsTutSpeaking(true);
    if (TUTORIAL_STEPS[step].confetti) { setTutConfetti(true); setTimeout(() => setTutConfetti(false), 2500); }
    setIsHappy(true); setTimeout(() => setIsHappy(false), 1200);
    speakText(text, { rate:0.85, pitch:1.15, onBoundary:(i) => setTutorialWordIndex(i), onEnd:() => {
      setTutorialWordIndex(-1); setIsTutSpeaking(false);
      if (isLast) {
        autoNextTimerRef.current = setTimeout(() => { setShowTutorial(false); setTutorialStep(0); }, 2000);
      } else {
        const DURATION = 1500; const INTERVAL = 30; let elapsed = 0;
        autoProgressRef.current = setInterval(() => {
          elapsed += INTERVAL;
          setAutoProgress(Math.min(100, (elapsed / DURATION) * 100));
          if (elapsed >= DURATION) { clearInterval(autoProgressRef.current); setAutoProgress(0); setTutorialStep(s => s+1); }
        }, INTERVAL);
      }
    }});
  };

  useEffect(() => {
    if (!showTutorial) {
      window.speechSynthesis?.cancel();
      clearTimeout(autoNextTimerRef.current); clearInterval(autoProgressRef.current);
      setTutorialWordIndex(-1); setIsTutSpeaking(false); setAutoProgress(0);
      return;
    }
    speakTutorialStep(tutorialStep);
    return () => { clearTimeout(autoNextTimerRef.current); clearInterval(autoProgressRef.current); };
  }, [showTutorial, tutorialStep]);

  const skipTutorial  = () => { window.speechSynthesis?.cancel(); clearTimeout(autoNextTimerRef.current); clearInterval(autoProgressRef.current); setShowTutorial(false); setTutorialStep(0); setAutoProgress(0); };
  const handleReplay  = () => { clearTimeout(autoNextTimerRef.current); clearInterval(autoProgressRef.current); setAutoProgress(0); speakTutorialStep(tutorialStep); };
  const isHighlighted = (field) => showTutorial && TUTORIAL_STEPS[tutorialStep].highlight === field;

  const levelBadgeRef = useRef(null); const quizCardRef = useRef(null); const startBtnRef = useRef(null);
  const highlightRefs = { levelBadge:levelBadgeRef, quizCard:quizCardRef, startBtn:startBtnRef };
  const [pointerPos,  setPointerPos]  = useState(null);
  const currentTut  = TUTORIAL_STEPS[tutorialStep];
  const tutWords    = currentTut.description.split(" ");

  useEffect(() => {
    if (!showTutorial) { setPointerPos(null); return; }
    const highlight = TUTORIAL_STEPS[tutorialStep].highlight; if (!highlight) { setPointerPos(null); return; }
    const ref = highlightRefs[highlight]; if (!ref?.current) { setPointerPos(null); return; }
    const rect = ref.current.getBoundingClientRect();
    setPointerPos({ top:rect.top+window.scrollY, left:rect.left+rect.width/2, width:rect.width, height:rect.height, rectTop:rect.top });
  }, [tutorialStep, showTutorial, availableQuiz]);

  const startSpecificQuiz = async (quizId) => {
    try {
      await axios.post("/quiz-attempts", { quiz_id:quizId, started_at:new Date().toISOString(), score:0 });
      navigate("/student/quiz");
    } catch { message.error("Oops! Couldn't start quiz. Try again! 🙈"); }
  };

  const handleRetake = async () => {
    try {
      await axios.patch(`/students/${authUser.id}/difficulty`, { difficulty:'Introduction' });
      // Navigate directly to quiz — bypass dashboard re-render to avoid stale PostTest history
      navigate("/student/quiz");
    } catch(e) { message.error("Oops! Couldn't start retake. Try again! 🙈"); }
  };

  const renderQuizCard = (quiz, difficulty) => {
    const latestAttempt  = quiz.latest_quiz_attempt;
    const totalQuestions = quiz.questions?.length || 0;
    const score          = latestAttempt?.score ?? 0;
    const progressPct    = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const hasAttempted   = !!latestAttempt;
    const isCompleted    = !!latestAttempt?.completed_at;
    const isPerfected    = isCompleted && progressPct === 100;
    const color  = difficultyColors[difficulty] || "#aaa";
    const emoji  = difficultyEmojis[difficulty] || "📋";
    const label  = difficultyLabels[difficulty] || difficulty;
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
            {isCompleted ? "🔄 Again!" : hasAttempted ? "▶️ Resume!" : "🚀 Take Quiz!"}
          </button>
        </div>
      </div>
    );
  };

  if (loading || !authUser) return (
    <><style>{floatKeyframes}</style>
    <div style={{ width:"100%", height:"100vh", background:"linear-gradient(160deg,#a8edea,#fed6e3,#ffecd2)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
      <div style={{ fontSize:"clamp(48px,12vw,72px)", animation:"bounce 1s ease infinite" }}>🎓</div>
      <Spin size="large"/>
      <p style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(16px,4vw,22px)", color:"#ff6b6b" }}>Loading your adventure...</p>
    </div></>
  );

  const currentIsPostTest = isPostTestDifficulty(availableQuiz?.difficulty);

  return (
    <><style>{floatKeyframes}</style>
    {tutConfetti && <TutorialConfetti/>}

    {[{emoji:"🌟",top:"8%",left:"2%",anim:"float 4s ease-in-out infinite"},{emoji:"🦋",top:"18%",right:"2%",anim:"float2 5s ease-in-out infinite"},{emoji:"🎈",top:"45%",left:"1%",anim:"float 6s ease-in-out infinite 1s"},{emoji:"🌈",bottom:"25%",right:"2%",anim:"float2 4.5s ease-in-out infinite 0.5s"},{emoji:"⭐",bottom:"15%",left:"2%",anim:"wiggle 3s ease-in-out infinite"}].map((item,i) => (
      <div key={i} className="floating-emoji" style={{ top:item.top, left:item.left, right:item.right, bottom:item.bottom, animation:item.anim }}>{item.emoji}</div>
    ))}

    {/* Tutorial spotlight overlay */}
    {showTutorial && pointerPos && (
      <>
        <div style={{ position:"fixed", inset:0, zIndex:998, pointerEvents:"none", background:"rgba(0,0,0,0.55)", WebkitMaskImage:`radial-gradient(ellipse ${pointerPos.width+48}px ${pointerPos.height+48}px at ${pointerPos.left}px ${pointerPos.rectTop+pointerPos.height/2}px, transparent 60%, black 100%)`, maskImage:`radial-gradient(ellipse ${pointerPos.width+48}px ${pointerPos.height+48}px at ${pointerPos.left}px ${pointerPos.rectTop+pointerPos.height/2}px, transparent 60%, black 100%)` }}/>
        <div style={{ position:"fixed", top:pointerPos.rectTop-10, left:pointerPos.left-pointerPos.width/2-10, width:pointerPos.width+20, height:pointerPos.height+20, borderRadius:20, border:"4px solid #ffd43b", zIndex:999, pointerEvents:"none", animation:"spotlightPulse 1.2s ease-in-out infinite" }}/>
        <div style={{ position:"fixed", top:Math.max(10,pointerPos.rectTop-120), left:pointerPos.left-70, zIndex:1000, display:"flex", flexDirection:"column", alignItems:"center", animation:"pointerTeleport 0.35s cubic-bezier(.36,.07,.19,.97) both", pointerEvents:"none" }}>
          <svg width="70" height="78" viewBox="0 0 180 200" fill="none" style={{ filter:"drop-shadow(0 4px 16px rgba(99,102,241,0.6))", animation:"bounceUp 1s ease-in-out infinite" }}>
            <ellipse cx="90" cy="165" rx="38" ry="26" fill="url(#pp1)" opacity=".9"/>
            <circle cx="90" cy="105" r="60" fill="url(#pp2)"/>
            <ellipse cx="70"  cy="100" rx="11" ry="11" fill="#1e1b4b"/><circle cx="73"  cy="94" r="4" fill="white"/>
            <ellipse cx="112" cy="100" rx="11" ry="11" fill="#1e1b4b"/><circle cx="115" cy="94" r="4" fill="white"/>
            <line x1="90" y1="47" x2="90" y2="22" stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="90" cy="16" r="9" fill="url(#pp3)"/>
            <path d="M70 119 Q90 140 110 119" stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round" fill="none"/>
            <defs>
              <radialGradient id="pp1" cx="50%" cy="40%"><stop offset="0%" stopColor="#818cf8"/><stop offset="100%" stopColor="#4f46e5"/></radialGradient>
              <radialGradient id="pp2" cx="40%" cy="35%"><stop offset="0%" stopColor="#ede9fe"/><stop offset="100%" stopColor="#c7d2fe"/></radialGradient>
              <radialGradient id="pp3" cx="40%" cy="35%"><stop offset="0%" stopColor="#f9a8d4"/><stop offset="100%" stopColor="#ec4899"/></radialGradient>
            </defs>
          </svg>
          <div style={{ background:"linear-gradient(135deg,#818cf8,#ec4899)", color:"white", fontFamily:"'Fredoka One',cursive", fontSize:"0.75rem", padding:"3px 12px", borderRadius:20, marginTop:2 }}>🤖 BiboAI</div>
          <div style={{ fontSize:"1.8rem", animation:"arrowBounce 0.7s ease-in-out infinite", marginTop:2 }}>👇</div>
        </div>
      </>
    )}

    {/* Tutorial speech bubble */}
    {showTutorial && (
      <div style={{ position:"fixed", top:"50%", left:"5%", transform:"translateY(-50%)", zIndex:1000, width:"min(300px,38vw)", pointerEvents:"auto" }}>
        <div style={{ background:`linear-gradient(145deg,${currentTut.color}ee,${currentTut.color}aa)`, borderRadius:28, padding:"18px 18px 14px", boxShadow:`0 0 60px ${currentTut.color}66, 0 20px 60px rgba(0,0,0,0.35)`, border:"3px solid rgba(255,255,255,0.55)", animation:"tutorialSlideIn 0.45s cubic-bezier(.36,.07,.19,.97)", textAlign:"center", position:"relative" }}>
          {[{top:"10px",left:"14px"},{top:"10px",right:"14px"},{bottom:"50px",left:"14px"},{bottom:"50px",right:"14px"}].map((pos,i) => (
            <span key={i} style={{ position:"absolute",...pos, fontSize:"1rem", animation:`twinkle ${1+i*.35}s ease-in-out infinite`, animationDelay:`${i*.2}s` }}>✦</span>
          ))}
          <div style={{ position:"absolute", right:"-18px", top:"50%", width:0, height:0, borderTop:"18px solid transparent", borderBottom:"18px solid transparent", borderLeft:`18px solid ${currentTut.color}ee` }}/>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:4 }}><TutorialBibo isSpeaking={isTutSpeaking} isHappy={isHappy} size={88}/></div>
          <div style={{ fontSize:"1.8rem", marginBottom:4 }}>{currentTut.emoji}</div>
          <h2 style={{ margin:"0 0 8px", fontFamily:"'Fredoka One',cursive", fontSize:"clamp(14px,3.5vw,18px)", color:"white", textShadow:"0 3px 10px rgba(0,0,0,0.3)", lineHeight:1.2 }}>{currentTut.title}</h2>
          <p style={{ margin:"0 0 10px", fontSize:"clamp(12px,2.8vw,14px)", color:"white", lineHeight:1.7, fontWeight:700 }}>
            {tutWords.map((word, i) => (
              <React.Fragment key={i}>
                <span style={{ display:"inline", background:i===tutorialWordIndex?"rgba(255,255,255,0.55)":"transparent", color:i===tutorialWordIndex?"#333":"white", borderRadius:"5px", padding:i===tutorialWordIndex?"1px 5px":"0", fontWeight:i===tutorialWordIndex?900:700, transition:"all 0.12s ease" }}>{word}</span>{" "}
              </React.Fragment>
            ))}
          </p>
          {isTutSpeaking ? (
            <div style={{ display:"flex", justifyContent:"center", gap:5, marginBottom:10, height:20, alignItems:"center" }}>
              {[0,1,2].map(i => <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"rgba(255,255,255,.9)", animation:`speakingPulse 0.7s ${i*.18}s ease-in-out infinite` }}/>)}
            </div>
          ) : autoProgress > 0 ? (
            <div style={{ marginBottom:10 }}>
              <div style={{ height:6, background:"rgba(255,255,255,.2)", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${autoProgress}%`, background:"rgba(255,255,255,.85)", borderRadius:99 }}/>
              </div>
            </div>
          ) : <div style={{ height:20, marginBottom:10 }}/>}
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:12 }}>
            {TUTORIAL_STEPS.map((_,i) => <div key={i} style={{ width:i===tutorialStep?28:10, height:10, borderRadius:5, background:i<tutorialStep?"rgba(255,255,255,.9)":i===tutorialStep?"white":"rgba(255,255,255,.3)", transition:"all 0.3s cubic-bezier(.34,1.56,.64,1)" }}/>)}
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
            <button onClick={handleReplay} disabled={isTutSpeaking} style={{ background:"rgba(255,255,255,.18)", border:"2px solid rgba(255,255,255,.55)", borderRadius:50, padding:"6px 16px", color:"white", fontSize:"clamp(12px,2.8vw,13px)", fontWeight:800, cursor:isTutSpeaking?"not-allowed":"pointer", fontFamily:"'Nunito',sans-serif", opacity:isTutSpeaking?.5:1 }}>
              {isTutSpeaking ? "🔊 Speaking…" : "🔁 Replay"}
            </button>
            <button onClick={skipTutorial} style={{ background:"rgba(255,255,255,.18)", color:"white", border:"2px solid rgba(255,255,255,.45)", borderRadius:50, padding:"6px 18px", fontSize:"clamp(12px,2.8vw,13px)", fontWeight:800, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>Skip ✕</button>
          </div>
        </div>
      </div>
    )}

    <div className="dashboard-root">

      {/* ── Welcome card ─────────────────────────────────────── */}
      <div className="welcome-card">
        <div style={{ fontSize:"clamp(40px,10vw,64px)", marginBottom:6, animation:"bounce 2s ease infinite" }}>🎓</div>
        <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(20px,5.5vw,32px)", color:"#333", margin:"0 0 6px", lineHeight:1.2 }}>Hey, {authUser.nickname || "Superstar"}! 👋</h1>
        {authUser.grade_level && authUser.section && (
          <p style={{ fontSize:"clamp(12px,3vw,15px)", color:"#666", margin:"0 0 10px", fontWeight:700 }}>{authUser.grade_level} — Section {authUser.section}</p>
        )}
        <div id="level-badge" ref={levelBadgeRef} style={{ display:"inline-block", background:`${difficultyColors[currentDifficulty]||"#aaa"}22`, border:`3px solid ${difficultyColors[currentDifficulty]||"#aaa"}`, borderRadius:16, padding:"7px 20px", transition:"box-shadow 0.3s ease", ...(isHighlighted("levelBadge") ? { boxShadow:`0 0 0 4px #ffd43b, 0 0 28px 8px rgba(255,211,75,0.55)`, borderColor:"#ffd43b", animation:"glowPulse 1.4s ease-in-out infinite" } : {}) }}>
          <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(14px,3.5vw,18px)", color:difficultyColors[currentDifficulty]||"#aaa" }}>
            {difficultyEmojis[currentDifficulty]||"📋"} Level: {difficultyLabels[currentDifficulty]||currentDifficulty}
          </span>
        </div>
      </div>

      <div className="quiz-area">

        {/* ── All levels complete ───────────────────────────── */}
        {allLevelsComplete && (
          <>
            <div className="all-done-card">
              <div style={{ fontSize:"clamp(48px,14vw,80px)", marginBottom:12, animation:"bounce 2s ease infinite" }}>🎓🏆</div>
              <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(20px,6vw,32px)", color:"#333", margin:"0 0 10px" }}>You're a Reading Champion!</h2>
              <p style={{ color:"#666", fontStyle:"italic", marginBottom:20, fontSize:"clamp(13px,3vw,15px)" }}>You completed the entire reading journey! Amazing work! 🌟</p>
              <button onClick={() => setShowHistory(h => !h)}
                style={{ background:"linear-gradient(90deg,#74c0fc,#4dabf7)", border:"none", borderRadius:20, color:"white", fontFamily:"'Fredoka One',cursive", fontSize:"clamp(13px,3vw,16px)", padding:"10px 28px", cursor:"pointer", boxShadow:"0 4px 0 #339af0", marginBottom:16, display:"block", margin:"0 auto 16px" }}>
                {showHistory ? "🙈 Hide History" : "📚 See My History"}
              </button>
              <button onClick={handleRetake} className="retake-btn">🔄 Take Again from Pre-Test!</button>
              <p style={{ fontSize:"clamp(11px,2.5vw,13px)", color:"#888", marginTop:8, fontStyle:"italic" }}>Starting over will let you improve your scores! 💪</p>
            </div>
            {showHistory && <HistorySection attempts={dashboardAttempts}/>}
          </>
        )}

        {/* ── Post-Test card ────────────────────────────────── */}
        {!allLevelsComplete && !showAllQuizzes && availableQuiz && currentIsPostTest && (
          <div className="posttest-challenge-card" id="quizCard" ref={quizCardRef} style={{ ...(isHighlighted("quizCard") ? { boxShadow:"0 0 0 4px #ffd43b, 0 0 28px 8px rgba(255,211,75,0.55)", animation:"glowPulse 1.4s ease-in-out infinite" } : {}), transition:"box-shadow 0.3s ease" }}>
            <div style={{ fontSize:"clamp(40px,12vw,70px)", marginBottom:10, animation:"float 4s ease-in-out infinite" }}>🎓</div>
            <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(18px,5vw,26px)", color:"#333", margin:"0 0 4px" }}>Post-Test Time! 🎉</h2>
            <div style={{ background:"linear-gradient(135deg,#ebfbee,#d3f9d8)", border:"2px solid #69db7c", borderRadius:12, padding:"10px 16px", marginBottom:12, fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:"clamp(12px,3vw,14px)", color:"#2f9e44" }}>
              🏆 You finished your reading level! Time for the Post-Test!
            </div>
            <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(15px,4vw,20px)", color:"#2f9e44", margin:"0 0 10px", wordBreak:"break-word" }}>📚 {availableQuiz.title}</h3>
            <p style={{ color:"#666", fontStyle:"italic", marginBottom:16, fontSize:"clamp(12px,3vw,14px)", wordBreak:"break-word" }}>{availableQuiz.instructions}</p>
            <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap", marginBottom:24 }}>
              <span style={{ background:"white", borderRadius:12, padding:"5px 14px", fontWeight:800, color:difficultyColors[availableQuiz.difficulty]||"#aaa", border:`2px solid ${difficultyColors[availableQuiz.difficulty]||"#aaa"}`, fontSize:"clamp(11px,2.5vw,14px)" }}>{difficultyEmojis[availableQuiz.difficulty]||"📋"} {difficultyLabels[availableQuiz.difficulty]||availableQuiz.difficulty}</span>
              <span style={{ background:"white", borderRadius:12, padding:"5px 14px", fontWeight:800, color:"#aaa", border:"2px solid #aaa", fontSize:"clamp(11px,2.5vw,14px)" }}>❓ {availableQuiz.questions?.length||0} Questions</span>
              <span style={{ background:"white", borderRadius:12, padding:"5px 14px", fontWeight:800, color:"#aaa", border:"2px solid #aaa", fontSize:"clamp(11px,2.5vw,14px)" }}>⏱ {availableQuiz.time_limit} min</span>
            </div>
            <button ref={startBtnRef} className="start-btn-posttest" onClick={() => startSpecificQuiz(availableQuiz.id)}>🎓 Start Post-Test!</button>
          </div>
        )}

        {/* ── Regular quiz card ─────────────────────────────── */}
        {!allLevelsComplete && !showAllQuizzes && availableQuiz && !currentIsPostTest && (
          <div className="quiz-challenge-card" id="quizCard" ref={quizCardRef} style={{ ...(isHighlighted("quizCard") ? { boxShadow:"0 0 0 4px #ffd43b, 0 0 28px 8px rgba(255,211,75,0.55)", animation:"glowPulse 1.4s ease-in-out infinite" } : {}), transition:"box-shadow 0.3s ease" }}>
            <div style={{ fontSize:"clamp(40px,12vw,70px)", marginBottom:10, animation:"float 4s ease-in-out infinite" }}>🎯</div>
            <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(18px,5vw,26px)", color:"#333", margin:"0 0 4px" }}>Your Next Challenge!</h2>
            <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(15px,4vw,20px)", color:"#ff6b6b", margin:"0 0 10px", wordBreak:"break-word" }}>📚 {availableQuiz.title}</h3>
            <p style={{ color:"#666", fontStyle:"italic", marginBottom:16, fontSize:"clamp(12px,3vw,14px)", wordBreak:"break-word" }}>{availableQuiz.instructions}</p>
            <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap", marginBottom:24 }}>
              <span style={{ background:"white", borderRadius:12, padding:"5px 14px", fontWeight:800, color:difficultyColors[availableQuiz.difficulty]||"#aaa", border:`2px solid ${difficultyColors[availableQuiz.difficulty]||"#aaa"}`, fontSize:"clamp(11px,2.5vw,14px)" }}>{difficultyEmojis[availableQuiz.difficulty]||"📋"} {difficultyLabels[availableQuiz.difficulty]||availableQuiz.difficulty}</span>
              <span style={{ background:"white", borderRadius:12, padding:"5px 14px", fontWeight:800, color:"#aaa", border:"2px solid #aaa", fontSize:"clamp(11px,2.5vw,14px)" }}>❓ {availableQuiz.questions?.length||0} Questions</span>
              <span style={{ background:"white", borderRadius:12, padding:"5px 14px", fontWeight:800, color:"#aaa", border:"2px solid #aaa", fontSize:"clamp(11px,2.5vw,14px)" }}>⏱ {availableQuiz.time_limit} min</span>
            </div>
            <button ref={startBtnRef} className="start-btn" id="startBtn" onClick={() => startSpecificQuiz(availableQuiz.id)}>🚀 Let's Go!</button>
          </div>
        )}

        {/* ── All quizzes list (fallback) ───────────────────── */}
        {!allLevelsComplete && showAllQuizzes && (
          <div className="all-quizzes-card">
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:"clamp(40px,10vw,60px)", marginBottom:8, animation:"bounce 2s ease infinite" }}>📚</div>
              <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(18px,5vw,26px)", color:"#333", margin:"0 0 4px" }}>All Quizzes</h2>
              <p style={{ color:"#888", fontSize:"clamp(12px,3vw,14px)", margin:0 }}>Pick one and show what you know! 💪</p>
            </div>
            {allQuizzes && difficultyOrder.map(difficulty => {
              const quizzesInDiff = allQuizzes[difficulty];
              if (!quizzesInDiff || quizzesInDiff.length === 0) return null;
              const color = difficultyColors[difficulty]||"#aaa";
              const emoji = difficultyEmojis[difficulty]||"📋";
              const label = difficultyLabels[difficulty]||difficulty;
              return (
                <div key={difficulty} style={{ marginBottom:24 }}>
                  <div className="difficulty-badge" style={{ background:`linear-gradient(135deg,${color},${color}cc)`, color:"white", boxShadow:`0 4px 12px ${color}55` }}>
                    <span>{emoji}</span><span>{label}</span>
                    <span style={{ background:"rgba(255,255,255,0.3)", borderRadius:8, padding:"1px 10px", fontSize:"clamp(11px,2.5vw,13px)", marginLeft:"auto" }}>{quizzesInDiff.length} quiz{quizzesInDiff.length!==1?"zes":""}</span>
                  </div>
                  {quizzesInDiff.map(quiz => renderQuizCard(quiz, difficulty))}
                </div>
              );
            })}
            {availableQuiz && (
              <div style={{ textAlign:"center", marginTop:12 }}>
                <button onClick={() => setShowAllQuizzes(false)} style={{ background:"linear-gradient(90deg,#ff6b6b,#ffa94d)", border:"none", borderRadius:20, color:"white", fontFamily:"'Fredoka One',cursive", fontSize:"clamp(13px,3vw,16px)", padding:"10px 28px", cursor:"pointer", boxShadow:"0 4px 0 #e05a5a" }}>← Back to My Quiz</button>
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
