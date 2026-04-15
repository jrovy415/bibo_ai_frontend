import { useEffect, useState } from "react";
import { Spin } from "antd";
import axios from "../../plugins/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../composables/useAuth";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');

html, body, #root {
  margin: 0 !important; padding: 0 !important;
  width: 100% !important; max-width: 100% !important;
  overflow-x: hidden !important; box-sizing: border-box !important;
}
*, *::before, *::after {
  box-sizing: border-box;
  font-family: 'Nunito', 'Comic Sans MS', cursive, sans-serif !important;
}

@keyframes popIn {
  0%   { transform: scale(0.5) rotate(-10deg); opacity: 0; }
  70%  { transform: scale(1.08) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes slideUp {
  from { transform: translateY(40px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  40%       { transform: translateY(-14px); }
  60%       { transform: translateY(-7px); }
}
@keyframes confettiFall {
  0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
@keyframes starPop {
  0%   { transform: scale(0) rotate(0); opacity: 0; }
  60%  { transform: scale(1.3) rotate(20deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px #ffd70088, 0 0 40px #ffd70044; }
  50%       { box-shadow: 0 0 40px #ffd700cc, 0 0 80px #ffd70066; }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
}
@keyframes rainbowText {
  0%   { color: #ff6b6b; }
  20%  { color: #ffa94d; }
  40%  { color: #ffd43b; }
  60%  { color: #69db7c; }
  80%  { color: #74c0fc; }
  100% { color: #ff6b6b; }
}
@keyframes levelReveal {
  0%   { transform: scale(0.5) rotate(-8deg); opacity: 0; }
  70%  { transform: scale(1.1) rotate(2deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes trophyBounce {
  0%,100% { transform: translateY(0) rotate(-3deg) scale(1); }
  30%      { transform: translateY(-20px) rotate(3deg) scale(1.05); }
  60%      { transform: translateY(-10px) rotate(-2deg) scale(1.02); }
}
@keyframes modalSlideIn {
  0%   { transform: scale(0.7) translateY(40px); opacity: 0; }
  70%  { transform: scale(1.03) translateY(-4px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
@keyframes backdropFade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes journeyCardIn {
  0%   { transform: translateY(30px) scale(0.92); opacity: 0; }
  70%  { transform: translateY(-4px) scale(1.01); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

.results-modal-backdrop {
  position: fixed; inset: 0; z-index: 8000;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  animation: backdropFade 0.25s ease both;
}
.results-modal {
  background: white; border-radius: 28px;
  width: 100%; max-width: 520px;
  max-height: 80vh; overflow-y: auto;
  padding: 28px 24px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.35);
  animation: modalSlideIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both;
  position: relative;
}
.results-modal::-webkit-scrollbar { width: 6px; }
.results-modal::-webkit-scrollbar-track { background: #f0f0f0; border-radius: 8px; }
.results-modal::-webkit-scrollbar-thumb { background: #ffd93d; border-radius: 8px; }
.answer-row {
  border-radius: 16px; padding: 12px 16px; margin-bottom: 10px;
  border: 2px solid transparent; transition: transform 0.15s ease;
}
.answer-row:hover { transform: translateX(4px); }
.answer-row.correct { background: linear-gradient(135deg,#ebfbee,#d3f9d8); border-color: #69db7c; }
.answer-row.wrong   { background: linear-gradient(135deg,#fff5f5,#ffe3e3); border-color: #ff6b6b; }
.pill-clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.pill-clickable:hover {
  transform: translateY(-4px) scale(1.04);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15) !important;
}
.confetti-piece {
  position: fixed; border-radius: 3px;
  pointer-events: none; z-index: 999;
  animation: confettiFall linear forwards;
}
.floating-star {
  position: fixed; pointer-events: none; z-index: 0;
  opacity: 0.25; font-size: clamp(20px,4vw,32px);
  animation: float ease-in-out infinite;
}

/* ── 2-column layout ── */
.finished-root {
  width: 100%; max-width: 100%;
  min-height: 100vh;
  background: linear-gradient(160deg,#e0f7fa 0%,#fce4ec 50%,#fff9c4 100%);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; position: relative;
  padding: 20px;
  gap: 20px;
}

/* Left column */
.left-col {
  width: 340px;
  flex-shrink: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 14px;
}

/* Right column */
.right-col {
  width: 420px;
  flex-shrink: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 14px;
}

/* Mobile: stack vertically */
@media (max-width: 800px) {
  .finished-root { flex-direction: column; min-height: 100vh; overflow-y: auto; padding: 16px; gap: 14px; }
  .left-col  { width: 100%; max-width: 420px; }
  .right-col { width: 100%; max-width: 420px; }
}

/* ── Cards ── */
.result-hero-card {
  animation: popIn 0.7s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
  width: 100%; border-radius: 28px;
  padding: 24px 20px; text-align: center;
  background: rgba(255,255,255,0.96);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12);
}
.result-hero-card.perfect {
  animation: popIn 0.7s cubic-bezier(0.175,0.885,0.32,1.275) forwards, glow 2s ease-in-out infinite;
  background: linear-gradient(135deg,#fff9c4,#ffd6e7,#c8f7ff);
}

.champion-card {
  animation: levelReveal 0.8s 0.3s cubic-bezier(0.175,0.885,0.32,1.275) both;
  width: 100%; border-radius: 24px;
  padding: 20px 16px; text-align: center;
}

.results-card {
  animation: journeyCardIn 0.7s 0.3s cubic-bezier(0.175,0.885,0.32,1.275) both;
  width: 100%; border-radius: 24px;
  padding: 20px;
  background: linear-gradient(135deg,#fff9c4,#ffd6e7,#c8f7ff);
  border: 4px solid #ffd700;
  box-shadow: 0 12px 40px rgba(255,215,0,0.25);
}

.action-btn {
  border: none; border-radius: 24px; color: white;
  font-family: 'Fredoka One', cursive !important;
  font-size: clamp(14px,3.5vw,18px);
  padding: clamp(10px,2.5vw,13px) clamp(20px,5vw,36px);
  cursor: pointer; transition: all 0.15s;
  display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;
}
.action-btn:hover  { transform: translateY(-3px); }
.action-btn:active { transform: translateY(2px); }
.btn-primary   { background: linear-gradient(90deg,#69db7c,#38d9a9); box-shadow: 0 6px 0 #2fbf71; }
.btn-orange    { background: linear-gradient(90deg,#ff6b6b,#ffa94d); box-shadow: 0 6px 0 #e05a5a; }
.btn-secondary { background: linear-gradient(90deg,#74c0fc,#a9e34b); box-shadow: 0 6px 0 #4a9fd4; }
.btn-posttest  { background: linear-gradient(90deg,#cc5de8,#845ef7); box-shadow: 0 6px 0 #9b3fc8; }
.btn-results   { background: linear-gradient(90deg,#ffd43b,#ff9f43); box-shadow: 0 6px 0 #d48806; }

.progress-bar-track {
  width: 100%; height: clamp(16px,3.5vw,22px);
  background: #f0f0f0; border-radius: 14px; overflow: hidden;
  box-shadow: inset 0 3px 6px rgba(0,0,0,0.1);
}
.progress-bar-fill {
  height: 100%; border-radius: 14px;
  transition: width 1.5s cubic-bezier(0.34,1.56,0.64,1);
  background-size: 200% auto;
  animation: shimmer 2s linear infinite;
  display: flex; align-items: center;
  justify-content: flex-end; padding-right: 8px;
  color: white; font-weight: 900;
  font-size: clamp(10px,2.5vw,12px);
}

.journey-level-pill {
  border-radius: 18px; padding: 10px 8px;
  display: flex; flex-direction: column;
  align-items: center; gap: 3px;
  flex: 1; min-width: 72px; max-width: 100px;
  text-align: center; transition: transform 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;
}
.journey-level-pill:hover { transform: translateY(-3px); }
`;

/* ─── helpers ─── */
const confettiColors = ["#ff6b6b","#ffa94d","#ffd43b","#69db7c","#74c0fc","#da77f2","#ff8787","#63e6be"];

const Confetti = () => {
    const pieces = Array.from({ length: 48 }, (_, i) => ({
        id: i, color: confettiColors[i % confettiColors.length],
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
        duration: `${3 + Math.random() * 3}s`,
        size: `${8 + Math.random() * 8}px`,
    }));
    return (
        <>
            {pieces.map(p => (
                <div key={p.id} className="confetti-piece" style={{
                    left: p.left, top: "-20px",
                    width: p.size, height: p.size,
                    backgroundColor: p.color,
                    animationDuration: p.duration,
                    animationDelay: p.delay,
                    borderRadius: Math.random() > 0.5 ? "50%" : "3px",
                }} />
            ))}
        </>
    );
};

const scoreWordByWord = (transcript, correctText, maxPoints) => {
    const normalize = (t) => (t||"").toLowerCase().replace(/[^a-z0-9\s]/g,"").trim().split(/\s+/).filter(Boolean);
    const spokenWords  = normalize(transcript);
    const correctWords = normalize(correctText);
    if (correctWords.length === 0) return 0;
    const pool = [...correctWords]; let matched = 0;
    for (const word of spokenWords) { const idx = pool.indexOf(word); if (idx !== -1) { matched++; pool.splice(idx,1); } }
    return Math.round((matched / correctWords.length) * maxPoints);
};

const getPlacementLevel = (pct) => {
    if (pct >= 80) return { level:"Expert", color:"#cc5de8", emoji:"🏆", label:"Advanced Reader" };
    if (pct >= 60) return { level:"Hard",   color:"#ff6b6b", emoji:"💎", label:"Grade Ready Reader" };
    if (pct >= 40) return { level:"Medium", color:"#ffa94d", emoji:"🔥", label:"Developing Reader" };
    return             { level:"Easy",   color:"#74c0fc", emoji:"⭐", label:"Low Reader" };
};

const DIFFICULTY_DISPLAY = {
    Introduction: { label:"Pre-Test",           color:"#69db7c", emoji:"🌱" },
    Easy:         { label:"Low Reader",          color:"#74c0fc", emoji:"⭐" },
    Medium:       { label:"Developing Reader",   color:"#ffa94d", emoji:"🔥" },
    Hard:         { label:"Grade Ready Reader",  color:"#ff6b6b", emoji:"💎" },
    Expert:       { label:"Advanced Reader",     color:"#cc5de8", emoji:"🏆" },
    PostTest:     { label:"Post-Test",           color:"#a9e34b", emoji:"🎓" },
};

const getStarCount = (pct) => {
    if (pct >= 95) return 5;
    if (pct >= 80) return 4;
    if (pct >= 60) return 3;
    if (pct >= 40) return 2;
    return 1;
};

const StarRow = ({ count, color, size = "clamp(20px,5vw,28px)" }) => (
    <div style={{ display:"flex", gap:4, justifyContent:"center", margin:"6px 0" }}>
        {[1,2,3,4,5].map(i => (
            <span key={i} style={{
                fontSize: size, opacity: i <= count ? 1 : 0.2,
                filter: i <= count ? `drop-shadow(0 0 6px ${color}88)` : "none",
                animation: i <= count ? `starPop 0.4s ${0.1*i}s cubic-bezier(0.175,0.885,0.32,1.275) both` : "none",
            }}>⭐</span>
        ))}
    </div>
);

/* ─── Results Modal ─── */
const ResultsModal = ({ attempt, onClose }) => {
    if (!attempt) return null;
    const { quiz, answers } = attempt;
    const diff    = quiz?.difficulty;
    const display = DIFFICULTY_DISPLAY[diff] || { label:diff, color:"#aaa", emoji:"📋" };
    const correct = (answers||[]).filter(a => a.is_correct).length;
    const total   = (answers||[]).length;

    return (
        <div className="results-modal-backdrop" onClick={onClose}>
            <div className="results-modal" onClick={e => e.stopPropagation()}>
                <div style={{ textAlign:"center", marginBottom:20 }}>
                    <div style={{ fontSize:40, marginBottom:4 }}>{display.emoji}</div>
                    <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(18px,5vw,24px)", color:display.color, margin:"0 0 4px" }}>
                        {display.label} — Results
                    </h2>
                    <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:"#888" }}>{quiz?.title}</div>
                    <div style={{ display:"inline-block", marginTop:8, background: correct===total ? "linear-gradient(135deg,#69db7c,#38d9a9)" : correct>total/2 ? "linear-gradient(135deg,#ffd43b,#ffa94d)" : "linear-gradient(135deg,#ff6b6b,#ff8787)", color:"white", borderRadius:50, padding:"4px 18px", fontFamily:"'Fredoka One',cursive", fontSize:15 }}>
                        ✅ {correct} / {total} Correct
                    </div>
                </div>
                <div style={{ borderTop:"2px dashed #f0f0f0", marginBottom:16 }} />
                {(answers||[]).map((ans, i) => {
                    const questionText  = ans.question?.question_text || "—";
                    const correctChoice = ans.question?.choices?.find(c => c.is_correct);
                    const correctText   = correctChoice?.choice_text || "—";
                    const spokenText    = ans.choice_string || "(no answer)";
                    const isOk          = ans.is_correct;
                    return (
                        <div key={ans.id} className={`answer-row ${isOk ? "correct" : "wrong"}`}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                                <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:12, color:"white", background:isOk?"#2f9e44":"#e03131", borderRadius:50, padding:"2px 10px", flexShrink:0 }}>{isOk ? "✓ Correct" : "✗ Wrong"}</span>
                                <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:13, color:"#888" }}>Q{i+1}</span>
                            </div>
                            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(13px,3vw,16px)", color:"#333", marginBottom:8, lineHeight:1.4 }}>📖 {questionText}</div>
                            <div style={{ display:"flex", gap:6, alignItems:"flex-start", marginBottom:4, flexWrap:"wrap" }}>
                                <span style={{ fontSize:11, fontWeight:800, color:"#2f9e44", background:"#d3f9d8", borderRadius:6, padding:"2px 8px", flexShrink:0 }}>✅ Should say</span>
                                <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13, color:"#2f9e44" }}>{correctText}</span>
                            </div>
                            <div style={{ display:"flex", gap:6, alignItems:"flex-start", flexWrap:"wrap" }}>
                                <span style={{ fontSize:11, fontWeight:800, color:isOk?"#2f9e44":"#e03131", background:isOk?"#d3f9d8":"#ffe3e3", borderRadius:6, padding:"2px 8px", flexShrink:0 }}>🎤 You said</span>
                                <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13, color:isOk?"#2f9e44":"#e03131", fontStyle:"italic" }}>"{spokenText}"</span>
                            </div>
                        </div>
                    );
                })}
                <button onClick={onClose} style={{ display:"block", width:"100%", marginTop:16, padding:"12px", borderRadius:50, border:"none", background:`linear-gradient(135deg,${display.color},${display.color}bb)`, color:"white", fontFamily:"'Fredoka One',cursive", fontSize:18, cursor:"pointer", boxShadow:`0 6px 0 ${display.color}88` }}>
                    ✕ Close
                </button>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const StudentFinishedQuiz = () => {
    const location  = useLocation();
    const navigate  = useNavigate();
    const { authUser, getUser } = useAuth();
    const { attemptId, isPostTest: isPostTestFromNav, quizDifficulty } = location.state || {};

    const [loading,       setLoading]       = useState(true);
    const [quizData,      setQuizData]      = useState(null);
    const [answers,       setAnswers]       = useState([]);
    const [score,         setScore]         = useState(0);
    const [progressWidth, setProgressWidth] = useState(0);
    const [journeyAttempts, setJourneyAttempts] = useState([]);
    const [journeyLoading,  setJourneyLoading]  = useState(false);
    const [actualNextQuiz,  setActualNextQuiz]  = useState(null);
    const [nextLoading,     setNextLoading]     = useState(false);
    const [isAllDone,       setIsAllDone]       = useState(false);
    const [modalAttempt,    setModalAttempt]    = useState(null);
    const [showFeedback,    setShowFeedback]    = useState(false);
    const [selectedFeeling, setSelectedFeeling] = useState(null);
    const [feedbackSent,    setFeedbackSent]    = useState(false);

    useEffect(() => { const init = async () => { try { await getUser(); } catch(e){} }; init(); }, []);

    useEffect(() => {
        if (!feedbackSent) {
            const t = setTimeout(() => setShowFeedback(true), 1800);
            return () => clearTimeout(t);
        }
    }, []);

    useEffect(() => {
        const fetchQuizResult = async () => {
            try {
                const res = await axios.get(`/quiz-attempts/${attemptId}`);
                const { quiz, answers, score } = res.data.data;
                setQuizData(quiz); setAnswers(answers??[]); setScore(score??(answers??[]).filter(a=>a.is_correct).length);
            } catch(err) { console.error(err); } finally { setLoading(false); }
        };
        if (attemptId) fetchQuizResult(); else setLoading(false);
    }, [attemptId]);

    useEffect(() => {
        if (!loading && quizData) {
            const isPreTest  = quizData.difficulty === "Introduction";
            const isPostTest = quizData.difficulty === "PostTest";
            if (!isPreTest && !isPostTest) {
                const fetchNextQuiz = async () => {
                    setNextLoading(true);
                    try {
                        const res = await axios.get("/quizzes/get-quiz");
                        const next = res.data.data;
                        if (next && next.questions) { setActualNextQuiz(next); setIsAllDone(false); }
                        else { setActualNextQuiz(null); setIsAllDone(true); }
                    } catch(err) { setActualNextQuiz(null); } finally { setNextLoading(false); }
                };
                fetchNextQuiz();
            }
        }
    }, [loading, quizData]);

    useEffect(() => {
        const fetchJourney = async () => {
            if (!authUser?.id) return;
            setJourneyLoading(true);
            try {
                const res = await axios.get(`/quiz-attempts/student-attempts/${authUser.id}`);
                const data = res.data?.data ?? [];
                setJourneyAttempts(Array.isArray(data) ? data : []);
            } catch(err) { console.error(err); } finally { setJourneyLoading(false); }
        };
        if (!loading && quizData?.difficulty === "PostTest") fetchJourney();
    }, [loading, quizData, authUser]);

    useEffect(() => {
        if (!loading && quizData) {
            const isPreTest  = quizData.difficulty === "Introduction";
            const isPostTest = quizData.difficulty === "PostTest";
            if (isPreTest) {
                let earned = 0, possible = 0;
                for (const q of quizData.questions??[]) {
                    const correctChoice = q.choices?.find(c=>c.is_correct);
                    const ans = answers.find(a=>a.question_id===q.id);
                    const pts = q.points??1; possible += pts;
                    if (correctChoice) { const spoken = ans?.choice_string||ans?.transcript||""; earned += scoreWordByWord(spoken,correctChoice.choice_text,pts); }
                }
                const pct = possible > 0 ? (earned/possible)*100 : 0;
                setTimeout(() => setProgressWidth(pct), 300); setScore(earned);
            } else {
                const totalPoints = (quizData.questions??[]).reduce((sum,q)=>sum+(q.points??1),0);
                const pct = totalPoints > 0 ? (score/totalPoints)*100 : 0;
                setTimeout(() => setProgressWidth(pct), 300);
            }
            if (isPostTest) setIsAllDone(true);
        }
    }, [loading, quizData, score]);

    if (loading) return (
        <><style>{styles}</style>
        <div style={{ width:"100%",height:"100vh",background:"linear-gradient(160deg,#a8edea,#fed6e3)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16 }}>
            <div style={{ fontSize:"clamp(48px,12vw,72px)",animation:"bounce 1s ease infinite" }}>⏳</div>
            <Spin size="large"/>
            <p style={{ fontFamily:"'Fredoka One',cursive",fontSize:"clamp(15px,4vw,20px)",color:"#ff6b6b" }}>Getting your results...</p>
        </div></>
    );

    if (!quizData) return (
        <><style>{styles}</style>
        <div style={{ textAlign:"center",marginTop:80,fontSize:"clamp(16px,4vw,22px)",fontFamily:"'Fredoka One',cursive",padding:"20px" }}>
            <div style={{ fontSize:"clamp(48px,12vw,72px)" }}>😕</div>Quiz data not found!
        </div></>
    );

    const isPreTest  = quizData.difficulty === "Introduction";
    const isPostTest = quizData.difficulty === "PostTest";
    const totalPoints = (quizData.questions??[]).reduce((sum,q)=>sum+(q.points??1),0);

    const normWords = (t) => (t||"").toLowerCase().replace(/[^a-z0-9\s]/g,"").trim().split(/\s+/).filter(Boolean);
    let pctNum = 0, displayScore = score;
    if (isPreTest || isPostTest) {
        let totalPct = 0, qCount = 0;
        for (const q of quizData.questions??[]) {
            const correctChoice = q.choices?.find(c=>c.is_correct);
            const ans = answers.find(a=>a.question_id===q.id);
            if (!correctChoice) continue;
            const spoken = ans?.choice_string||ans?.transcript||"";
            const sw = normWords(spoken); const cw = normWords(correctChoice.choice_text);
            if (cw.length===0) continue;
            const pool=[...cw]; let matched=0;
            for (const w of sw) { const i=pool.indexOf(w); if (i!==-1){matched++;pool.splice(i,1);} }
            totalPct += Math.round((matched/cw.length)*100); qCount++;
        }
        pctNum = qCount>0 ? totalPct/qCount : 0; displayScore = Math.round(pctNum);
    } else {
        pctNum = totalPoints>0 ? (displayScore/totalPoints)*100 : 0;
    }

    const percentage  = pctNum.toFixed(1);
    const isPerfect   = pctNum >= 100;
    const isGreat     = pctNum >= 75;
    const starCount   = getStarCount(pctNum);
    const placement   = isPreTest ? getPlacementLevel(pctNum) : null;
    const trophyEmoji = isPerfect ? "🏆" : isGreat ? "🥇" : pctNum >= 50 ? "🥈" : "⭐";
    const resultMessage = isPerfect ? "Perfect Score!" : isGreat ? "Awesome Job!" : pctNum >= 50 ? "Good Work!" : "Keep Trying!";
    const barColor = pctNum>=75 ? "linear-gradient(90deg,#69db7c,#a9e34b)" : pctNum>=50 ? "linear-gradient(90deg,#74c0fc,#a9e34b)" : "linear-gradient(90deg,#ff6b6b,#ffa94d)";
    const borderColor = isPerfect ? "#ffd700" : isPostTest ? "#a9e34b" : "#74c0fc";
    const nextDiff        = actualNextQuiz?.difficulty ?? null;
    const nextDiffDisplay = nextDiff ? DIFFICULTY_DISPLAY[nextDiff] : null;
    const isNextPostTest  = nextDiff === "PostTest";

    /* Journey (PostTest) */
    const JOURNEY_ORDER = ["Introduction","Easy","Medium","Hard","Expert","PostTest"];
    const journeyMap = {};
    for (const attempt of journeyAttempts) {
        const diff = attempt.difficulty||attempt.quiz?.difficulty;
        if (!diff) continue;
        if (!journeyMap[diff]||(attempt.score??0)>(journeyMap[diff].score??0)) journeyMap[diff]=attempt;
    }
    if (isPostTest && quizData) journeyMap["PostTest"]={ score:displayScore,difficulty:"PostTest",quiz:quizData };
    const READING_ASSESSMENT_DIFFS = ["Introduction","PostTest"];
    const journeyLevels = JOURNEY_ORDER.map(diff => {
        const attempt = journeyMap[diff];
        const display = DIFFICULTY_DISPLAY[diff];
        if (!attempt) return { diff,display,score:null,total:null,pct:null,isReadingPct:false };
        const isReadingPct = READING_ASSESSMENT_DIFFS.includes(diff);
        const total = attempt.quiz?.questions?.length??attempt.total_questions??null;
        const sc    = attempt.score??null;
        const pct   = sc!=null ? (isReadingPct ? Math.min(100,Math.round(sc)) : (total ? Math.round((sc/total)*100) : null)) : null;
        return { diff,display,score:sc,total,pct,isReadingPct };
    });
    const takenLevels       = journeyLevels.filter(l=>l.pct!=null);
    const journeyOverallPct = takenLevels.length>0 ? Math.round(takenLevels.reduce((s,l)=>s+l.pct,0)/takenLevels.length) : 0;

    const submitFeedback = async (feeling) => {
        if (!feeling||!authUser?.id||!quizData?.id) return;
        try { await axios.post("/quiz-feedbacks",{ student_id:authUser.id,quiz_id:quizData.id,quiz_attempt_id:attemptId||null,feeling }); }
        catch(e) { console.error(e); }
        finally { setFeedbackSent(true); setShowFeedback(false); setSelectedFeeling(null); }
    };

    return (
        <>
            <style>{styles}</style>
            {(isPerfect||isPreTest||isPostTest) && <Confetti/>}
            {modalAttempt && <ResultsModal attempt={modalAttempt} onClose={()=>setModalAttempt(null)}/>}

            {["⭐","🌟","✨","💫"].map((s,i)=>(
                <div key={i} className="floating-star" style={{ top:`${10+i*20}%`, [i%2===0?"left":"right"]:"2%", animationDuration:`${3+i}s`, animationDelay:`${i*0.5}s` }}>{s}</div>
            ))}

            <div className="finished-root">

                {/* ══ LEFT COLUMN ══ */}
                <div className="left-col">

                    {/* Congratulations badge */}
                    <div className={`result-hero-card${isPerfect?" perfect":""}`} style={{ border:`4px solid ${borderColor}` }}>
                        <div style={{ fontSize:"clamp(56px,15vw,80px)", marginBottom:4, display:"inline-block", animation:"trophyBounce 2.5s ease-in-out infinite" }}>
                            {isPostTest ? "🎓" : trophyEmoji}
                        </div>
                        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(20px,5vw,30px)", color:isPerfect?"#ff6b6b":"#5b4e75", marginBottom:4, animation:isPerfect?"rainbowText 2s linear infinite":"none" }}>
                            {isPostTest ? "Amazing! 🎉" : resultMessage}
                        </div>
                        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:"clamp(12px,2.5vw,14px)", color:"#888", marginBottom:12 }}>
                            {quizData.title}
                        </div>
                        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(40px,10vw,60px)", color:"#ff6b6b", lineHeight:1, marginBottom:4 }}>
                            {pctNum.toFixed(0)}<span style={{ fontSize:"clamp(20px,5vw,28px)", color:"#ccc" }}>%</span>
                        </div>
                        <StarRow count={starCount} color={isPerfect?"#ffd700":isPostTest?"#a9e34b":"#74c0fc"}/>
                        <div style={{ margin:"10px 0 4px" }}>
                            <div className="progress-bar-track">
                                <div className="progress-bar-fill" style={{ width:`${progressWidth}%`, background:barColor }}>
                                    {progressWidth>15 && `${pctNum.toFixed(0)}%`}
                                </div>
                            </div>
                        </div>
                        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(12px,3vw,15px)", color:"#888" }}>
                            {percentage}% — {isGreat?"Great job! 🌟":pctNum>=50?"Good effort! 💪":"Keep going! 🚀"}
                        </div>
                    </div>

                    {/* You're a Reading Champion (Post-Test) */}
                    {isPostTest && isAllDone && (
                        <div className="champion-card" style={{ background:"linear-gradient(135deg,#fff9c4,#ffd6e7,#c8f7ff)", border:"4px solid #ffd700", boxShadow:"0 8px 40px rgba(255,215,0,0.4)", animation:"popIn 0.7s cubic-bezier(0.175,0.885,0.32,1.275) forwards, glow 2s ease-in-out infinite" }}>
                            <div style={{ fontSize:"clamp(32px,8vw,52px)", marginBottom:6, animation:"trophyBounce 2.5s ease-in-out infinite" }}>🎓✨</div>
                            <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(14px,3.5vw,20px)", color:"#333", margin:"0 0 6px" }}>
                                <span style={{ animation:"rainbowText 2s linear infinite", display:"inline-block" }}>You're a Reading Champion!</span>
                            </h2>
                            <p style={{ fontSize:"clamp(11px,2.5vw,13px)", color:"#555", margin:"6px 0 0", fontWeight:700 }}>
                                You completed the whole reading journey! 🌟🏆
                            </p>
                        </div>
                    )}

                    {/* Level Placement (Pre-Test) */}
                    {isPreTest && placement && (
                        <div className="champion-card" style={{ background:`linear-gradient(135deg,${placement.color}22,${placement.color}11)`, border:`4px solid ${placement.color}`, boxShadow:`0 8px 32px ${placement.color}44` }}>
                            <div style={{ fontSize:"clamp(28px,7vw,44px)", marginBottom:6, animation:"bounce 2s ease infinite" }}>{placement.emoji}</div>
                            <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(12px,3vw,16px)", color:"#555", margin:"0 0 4px" }}>🎯 Your Reading Level!</h2>
                            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(18px,5vw,26px)", color:placement.color, margin:"6px 0", textShadow:`0 3px 12px ${placement.color}66` }}>
                                {placement.label}
                            </div>
                            <p style={{ fontSize:"clamp(11px,2.5vw,13px)", color:"#555", margin:"6px 0 0", fontWeight:700 }}>
                                Your quizzes will start at <strong style={{ color:placement.color }}>{placement.level}</strong> level. You've got this! 💪
                            </p>
                        </div>
                    )}
                </div>

                {/* ══ RIGHT COLUMN ══ */}
                <div className="right-col">

                    {/* Journey Summary (PostTest) */}
                    {isPostTest && isAllDone && (
                        <div className="results-card" style={{ maxWidth:460, width:"100%" }}>
                            <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(16px,4vw,22px)", color:"#333", textAlign:"center", margin:"0 0 14px" }}>
                                🗺️ Your Reading Journey
                            </h2>
                            {journeyLoading ? (
                                <div style={{ textAlign:"center", padding:20 }}><Spin/></div>
                            ) : (
                                <>
                                    <div style={{ display:"flex", gap:5, flexWrap:"wrap", justifyContent:"center", marginBottom:14 }}>
                                        {journeyLevels.map(({ diff,display,score:sc,total,pct,isReadingPct }) => {
                                            const pillAttempt = journeyAttempts.find(a=>(a.quiz?.difficulty||a.difficulty)===diff)||(diff==="PostTest"&&isPostTest?{quiz:quizData,answers,score:displayScore}:null);
                                            return (
                                                <div key={diff} className={`journey-level-pill${sc!=null?" pill-clickable":""}`}
                                                    onClick={()=>sc!=null&&pillAttempt&&setModalAttempt(pillAttempt)}
                                                    style={{ background:sc!=null?`linear-gradient(135deg,${display.color}22,${display.color}11)`:"#f8f8f8", border:`3px solid ${sc!=null?display.color:"#ddd"}`, opacity:sc!=null?1:0.5 }}>
                                                    <span style={{ fontSize:"clamp(14px,3vw,20px)",lineHeight:1 }}>{display.emoji}</span>
                                                    <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(8px,1.5vw,10px)", color:display.color, lineHeight:1.2, width:"100%", textAlign:"center" }}>
                                                        {diff==="Introduction"?"Pre-Test":diff==="PostTest"?"Post-Test":diff}
                                                    </span>
                                                    {sc!=null&&pct!=null ? (
                                                        <>
                                                            {isReadingPct ? (
                                                                <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(12px,2.5vw,15px)", color:"#333", lineHeight:1 }}>
                                                                    {pct}<span style={{ fontSize:"clamp(8px,1.5vw,10px)", color:"#aaa" }}>%</span>
                                                                </span>
                                                            ) : (
                                                                <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(12px,2.5vw,15px)", color:"#333", lineHeight:1 }}>
                                                                    {sc}<span style={{ fontSize:"clamp(8px,1.5vw,10px)", color:"#aaa" }}>/{total}</span>
                                                                </span>
                                                            )}
                                                            <span style={{ fontSize:"clamp(8px,1.5vw,10px)", fontWeight:800, color:pct>=75?"#2f9e44":pct>=50?"#e67300":"#c92a2a" }}>{pct}%</span>
                                                            <div style={{ display:"flex", gap:1, justifyContent:"center", width:"100%", overflow:"hidden" }}>
                                                                {[1,2,3,4,5].map(i=>(
                                                                    <span key={i} style={{ fontSize:"clamp(7px,1.5vw,10px)", opacity:i<=getStarCount(pct)?1:0.2, lineHeight:1 }}>⭐</span>
                                                                ))}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span style={{ fontSize:9, color:"#bbb", fontWeight:700 }}>Not taken</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ background:"white", border:"3px solid #ffd700", borderRadius:16, padding:"12px 16px", textAlign:"center", boxShadow:"0 4px 16px rgba(255,215,0,0.2)" }}>
                                        <p style={{ margin:"0 0 4px", fontWeight:800, color:"#888", fontSize:"clamp(11px,2vw,13px)" }}>🏅 Overall Performance</p>
                                        <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(24px,6vw,34px)", color:"#ff6b6b" }}>{journeyOverallPct}</span>
                                        <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(14px,3vw,20px)", color:"#aaa" }}>%</span>
                                        <p style={{ margin:"4px 0 6px", fontWeight:800, color:"#ffa94d", fontSize:"clamp(12px,2.5vw,15px)" }}>
                                            Average across {takenLevels.length} level{takenLevels.length!==1?"s":""}
                                        </p>
                                        <StarRow count={getStarCount(journeyOverallPct)} color="#ffd700" size="clamp(18px,4vw,24px)"/>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Next level card (regular quizzes) */}
                    {!isPreTest && !isPostTest && !nextLoading && actualNextQuiz && nextDiffDisplay && (
                        <div style={{ width:"100%", maxWidth:400, borderRadius:24, padding:"20px 16px", textAlign:"center", background:`linear-gradient(135deg,${nextDiffDisplay.color}22,${nextDiffDisplay.color}11)`, border:`4px solid ${nextDiffDisplay.color}`, boxShadow:`0 8px 32px ${nextDiffDisplay.color}44`, animation:"levelReveal 0.8s 0.3s cubic-bezier(0.175,0.885,0.32,1.275) both" }}>
                            <div style={{ fontSize:"clamp(32px,8vw,48px)", marginBottom:8, animation:"bounce 2s ease infinite" }}>{nextDiffDisplay.emoji}</div>
                            <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(13px,3vw,17px)", color:"#555", margin:"0 0 6px" }}>🚀 Level Complete! Next Up:</h2>
                            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(20px,5vw,28px)", color:nextDiffDisplay.color, margin:"8px 0" }}>
                                {isNextPostTest ? "🎓 Post-Test!" : `${nextDiff} Level!`}
                            </div>
                            <p style={{ fontSize:"clamp(11px,2.5vw,13px)", color:"#555", margin:"6px 0 0", fontWeight:700 }}>
                                {isNextPostTest ? "You finished all levels! Time for the final Post-Test! 🌟" : `Keep going — the ${nextDiff} level awaits! 💪`}
                            </p>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", zIndex:1 }}>
                        {isPreTest && (
                            <button className="action-btn btn-primary" onClick={()=>navigate("/student")}>🎯 Start My Journey!</button>
                        )}
                        {isPostTest && (
                            <button className="action-btn btn-results" onClick={()=>{ window.speechSynthesis?.cancel(); localStorage.removeItem('APP_STUDENT_TOKEN'); localStorage.removeItem('APP_STUDENT'); navigate("/student/logout"); }}>
                                🏁 Finish
                            </button>
                        )}
                        {!isPreTest && !isPostTest && (
                            <>
                                <button className="action-btn btn-orange" onClick={()=>navigate("/student/quiz")}>🔄 Try Again!</button>
                                {nextLoading && <button className="action-btn btn-secondary" disabled style={{ opacity:0.6 }}>⏳ Loading next…</button>}
                                {!nextLoading && actualNextQuiz && (
                                    <button className={`action-btn ${isNextPostTest?"btn-posttest":"btn-primary"}`} onClick={()=>navigate("/student")}>
                                        {isNextPostTest ? "🎓 Take Post-Test!" : `➡️ Go to ${nextDiff} Level!`}
                                    </button>
                                )}
                                {!nextLoading && !actualNextQuiz && (
                                    <button className="action-btn btn-secondary" onClick={()=>navigate("/student")}>🏠 Back to Dashboard</button>
                                )}
                            </>
                        )}
                    </div>

                    <p style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(13px,3vw,16px)", color:"#ff6b6b", textAlign:"center", zIndex:1, padding:"0 16px", margin:0 }}>
                        {isPostTest ? "You've completed your entire reading journey! 🌟🎓" : isPreTest ? "Great effort! Your reading journey starts now! 🌱✨" : "You can do it! Keep practicing! 💪🌟"}
                    </p>
                </div>
            </div>

            {/* Feedback Modal */}
            {showFeedback && (
                <div style={{ position:"fixed",inset:0,zIndex:10000,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
                    <div style={{ background:"linear-gradient(160deg,#a8edea,#fed6e3,#ffecd2)",borderRadius:32,padding:"32px 28px",maxWidth:380,width:"100%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.3)",animation:"popIn 0.4s cubic-bezier(.17,.67,.35,1.3) both" }}>
                        <div style={{ fontSize:52,marginBottom:8 }}>🎉</div>
                        <h2 style={{ fontFamily:"'Fredoka One',cursive",fontSize:"clamp(20px,5vw,26px)",color:"#5b4e75",margin:"0 0 6px" }}>Great job, Superstar!</h2>
                        <p style={{ fontSize:14,color:"#888",margin:"0 0 20px" }}>One quick question before you go...</p>
                        <p style={{ fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#5b4e75",margin:"0 0 20px" }}>How did this quiz feel?</p>
                        <div style={{ display:"flex",justifyContent:"center",gap:16,marginBottom:24 }}>
                            {[{key:"easy",emoji:"😊",label:"Easy!",bg:"#DCFCE7",border:"#86EFAC",color:"#15803D"},{key:"okay",emoji:"😐",label:"Okay",bg:"#FEF9C3",border:"#FDE047",color:"#A16207"},{key:"hard",emoji:"😔",label:"Hard",bg:"#FEE2E2",border:"#FCA5A5",color:"#B91C1C"}].map(f=>(
                                <button key={f.key} onClick={()=>setSelectedFeeling(f.key)} style={{ width:80,height:80,borderRadius:"50%",background:f.bg,border:`3px solid ${f.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,cursor:"pointer",outline:selectedFeeling===f.key?`4px solid #6C63FF`:"none",outlineOffset:3,transform:selectedFeeling===f.key?"scale(1.1)":"scale(1)",transition:"all 0.15s ease" }}>
                                    <span style={{ fontSize:32,lineHeight:1 }}>{f.emoji}</span>
                                    <span style={{ fontSize:10,fontWeight:800,color:f.color }}>{f.label}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={()=>submitFeedback(selectedFeeling)} disabled={!selectedFeeling} style={{ width:"100%",border:"none",borderRadius:50,padding:"14px 0",background:selectedFeeling?"linear-gradient(90deg,#ff6b6b,#ffa94d)":"#ddd",color:"white",fontFamily:"'Fredoka One',cursive",fontSize:18,cursor:selectedFeeling?"pointer":"not-allowed",boxShadow:selectedFeeling?"0 6px 0 #e05a5a":"none",transition:"all 0.2s" }}>
                            Send my answer! 🚀
                        </button>
                        <p onClick={()=>{setShowFeedback(false);setFeedbackSent(true);}} style={{ marginTop:12,fontSize:13,color:"#aaa",cursor:"pointer",textDecoration:"underline" }}>Skip for now</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default StudentFinishedQuiz;