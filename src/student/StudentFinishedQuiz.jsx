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
@keyframes nextLevelReveal {
  0%   { transform: scale(0.3) rotate(-15deg); opacity: 0; }
  60%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes journeyCardIn {
  0%   { transform: translateY(30px) scale(0.92); opacity: 0; }
  70%  { transform: translateY(-4px) scale(1.01); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
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
.answer-row.correct {
  background: linear-gradient(135deg,#ebfbee,#d3f9d8);
  border-color: #69db7c;
}
.answer-row.wrong {
  background: linear-gradient(135deg,#fff5f5,#ffe3e3);
  border-color: #ff6b6b;
}
.pill-clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.pill-clickable:hover {
  transform: translateY(-4px) scale(1.04);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15) !important;
}
.finished-root {
  width: 100%; max-width: 100%; min-height: 100vh;
  background: linear-gradient(160deg, #e0f7fa 0%, #fce4ec 50%, #fff9c4 100%);
  display: flex; flex-direction: column;
  align-items: center; padding: 24px 16px 80px;
  overflow-x: hidden; position: relative;
}
.confetti-piece {
  position: fixed; border-radius: 3px;
  pointer-events: none; z-index: 999;
  animation: confettiFall linear forwards;
}
.floating-star {
  position: fixed; pointer-events: none; z-index: 0;
  opacity: 0.25; font-size: clamp(20px, 4vw, 32px);
  animation: float ease-in-out infinite;
}

/* ── Main result card ── */
.result-hero-card {
  animation: popIn 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  width: 100%; max-width: 480px; border-radius: 32px;
  padding: 36px 28px; text-align: center;
  margin-bottom: 24px; z-index: 1;
  background: rgba(255,255,255,0.96);
  box-shadow: 0 16px 48px rgba(0,0,0,0.13);
}
.result-hero-card.perfect {
  animation: popIn 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, glow 2s ease-in-out infinite;
  background: linear-gradient(135deg,#fff9c4,#ffd6e7,#c8f7ff);
}

/* ── Level placement card ── */
.level-reveal-card {
  animation: levelReveal 0.8s 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  width: 100%; max-width: 480px; border-radius: 24px;
  padding: 24px 20px; text-align: center;
  margin-bottom: 24px; z-index: 1;
}
.next-level-card {
  animation: nextLevelReveal 0.8s 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  width: 100%; max-width: 480px; border-radius: 24px;
  padding: 24px 20px; text-align: center;
  margin-bottom: 24px; z-index: 1;
}
.journey-card {
  animation: journeyCardIn 0.7s 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  width: 100%; max-width: 560px; border-radius: 24px;
  padding: 24px 20px;
  margin-bottom: 24px; z-index: 1;
  background: linear-gradient(135deg, #fff9c4, #ffd6e7, #c8f7ff);
  border: 4px solid #ffd700;
  box-shadow: 0 12px 40px rgba(255,215,0,0.25);
}

.action-btn {
  border: none; border-radius: 24px; color: white;
  font-family: 'Fredoka One', cursive !important;
  font-size: clamp(15px, 4vw, 20px);
  padding: clamp(10px, 3vw, 14px) clamp(24px, 6vw, 44px);
  cursor: pointer; transition: all 0.15s;
  display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;
}
.action-btn:hover  { transform: translateY(-3px); }
.action-btn:active { transform: translateY(2px); }
.btn-primary   { background: linear-gradient(90deg, #69db7c, #38d9a9); box-shadow: 0 6px 0 #2fbf71; }
.btn-orange    { background: linear-gradient(90deg, #ff6b6b, #ffa94d); box-shadow: 0 6px 0 #e05a5a; }
.btn-secondary { background: linear-gradient(90deg, #74c0fc, #a9e34b); box-shadow: 0 6px 0 #4a9fd4; }
.btn-posttest  { background: linear-gradient(90deg, #cc5de8, #845ef7); box-shadow: 0 6px 0 #9b3fc8; }
.btn-results   { background: linear-gradient(90deg, #ffd43b, #ff9f43); box-shadow: 0 6px 0 #d48806; }

.progress-bar-track {
  width: 100%; height: clamp(18px, 4vw, 26px);
  background: #f0f0f0; border-radius: 14px; overflow: hidden;
  box-shadow: inset 0 3px 6px rgba(0,0,0,0.1);
}
.progress-bar-fill {
  height: 100%; border-radius: 14px;
  transition: width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  background-size: 200% auto;
  animation: shimmer 2s linear infinite;
  display: flex; align-items: center;
  justify-content: flex-end; padding-right: 8px;
  color: white; font-weight: 900;
  font-size: clamp(10px, 2.5vw, 13px);
}

.journey-level-pill {
  border-radius: 18px;
  padding: 10px 8px;
  display: flex; flex-direction: column;
  align-items: center; gap: 3px;
  flex: 1; min-width: 80px; max-width: 110px;
  text-align: center;
  transition: transform 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}
.journey-level-pill:hover { transform: translateY(-3px); }
.pill-stars {
  display: flex; gap: 2px; justify-content: center;
  flex-wrap: nowrap; width: 100%;
}
.pill-stars span {
  font-size: clamp(10px, 2.5vw, 14px) !important;
  animation: none !important;
  filter: none !important;
}
`;

/* ─── helpers ──────────────────────────────── */
const confettiColors = ["#ff6b6b","#ffa94d","#ffd43b","#69db7c","#74c0fc","#da77f2","#ff8787","#63e6be"];

const Confetti = () => {
    const pieces = Array.from({ length: 48 }, (_, i) => ({
        id: i,
        color: confettiColors[i % confettiColors.length],
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

/* ─── Word-by-word scoring ── */
const scoreWordByWord = (transcript, correctText, maxPoints) => {
    const normalize = (t) =>
        (t || "").toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    const spokenWords  = normalize(transcript);
    const correctWords = normalize(correctText);
    if (correctWords.length === 0) return 0;

    const pool = [...correctWords];
    let matched = 0;
    for (const word of spokenWords) {
        const idx = pool.indexOf(word);
        if (idx !== -1) { matched++; pool.splice(idx, 1); }
    }
    return Math.round((matched / correctWords.length) * maxPoints);
};

const getPlacementLevel = (pct) => {
    // Placement thresholds:
    // 80–100% → Expert (Advanced Reader)
    // 60–79%  → Hard   (Grade Ready Reader)
    // 40–59%  → Medium (Developing Reader)
    // 0–39%   → Easy   (Low Reader)
    if (pct >= 80) return { level: "Expert", color: "#cc5de8", emoji: "🏆", label: "Advanced Reader" };
    if (pct >= 60) return { level: "Hard",   color: "#ff6b6b", emoji: "💎", label: "Grade Ready Reader" };
    if (pct >= 40) return { level: "Medium", color: "#ffa94d", emoji: "🔥", label: "Developing Reader" };
    return             { level: "Easy",   color: "#74c0fc", emoji: "⭐", label: "Low Reader" };
};

const DIFFICULTY_DISPLAY = {
    Introduction: { label: "Pre-Test",            color: "#69db7c", emoji: "🌱" },
    Easy:         { label: "Low Reader",           color: "#74c0fc", emoji: "⭐" },
    Medium:       { label: "Developing Reader",    color: "#ffa94d", emoji: "🔥" },
    Hard:         { label: "Grade Ready Reader",   color: "#ff6b6b", emoji: "💎" },
    Expert:       { label: "Advanced Reader",      color: "#cc5de8", emoji: "🏆" },
    PostTest:     { label: "Post-Test",            color: "#a9e34b", emoji: "🎓" },
};

const difficultyColors = {
    Introduction: "#69db7c", Easy: "#74c0fc",
    Medium: "#ffa94d",       Hard: "#ff6b6b",
    Expert: "#cc5de8",       PostTest: "#a9e34b",
};

const getStarCount = (pct) => {
    if (pct >= 95) return 5;
    if (pct >= 80) return 4;
    if (pct >= 60) return 3;
    if (pct >= 40) return 2;
    return 1;
};

const StarRow = ({ count, color }) => (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "8px 0" }}>
        {[1,2,3,4,5].map(i => (
            <span key={i} style={{
                fontSize: "clamp(22px,6vw,32px)",
                opacity: i <= count ? 1 : 0.2,
                filter: i <= count ? `drop-shadow(0 0 6px ${color}88)` : "none",
                animation: i <= count ? `starPop 0.4s ${0.1*i}s cubic-bezier(0.175,0.885,0.32,1.275) both` : "none",
            }}>⭐</span>
        ))}
    </div>
);

/* ─── Results Modal ────────────────────────── */
const ResultsModal = ({ attempt, onClose }) => {
    if (!attempt) return null;
    const { quiz, answers } = attempt;
    const diff    = quiz?.difficulty;
    const display = {
        Introduction: { label:"Pre-Test",          color:"#69db7c", emoji:"🌱" },
        Easy:         { label:"Low Reader",         color:"#74c0fc", emoji:"⭐" },
        Medium:       { label:"Developing Reader",  color:"#ffa94d", emoji:"🔥" },
        Hard:         { label:"Grade Ready Reader", color:"#ff6b6b", emoji:"💎" },
        Expert:       { label:"Advanced Reader",    color:"#cc5de8", emoji:"🏆" },
        PostTest:     { label:"Post-Test",          color:"#a9e34b", emoji:"🎓" },
    }[diff] || { label: diff, color:"#aaa", emoji:"📋" };

    const correct = (answers || []).filter(a => a.is_correct).length;
    const total   = (answers || []).length;

    return (
        <div className="results-modal-backdrop" onClick={onClose}>
            <div className="results-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ textAlign:"center", marginBottom:20 }}>
                    <div style={{ fontSize:40, marginBottom:4 }}>{display.emoji}</div>
                    <h2 style={{
                        fontFamily:"'Fredoka One', cursive",
                        fontSize:"clamp(18px,5vw,24px)",
                        color: display.color, margin:"0 0 4px",
                    }}>
                        {display.label} — Results
                    </h2>
                    <div style={{ fontFamily:"'Nunito', sans-serif", fontWeight:800, fontSize:13, color:"#888" }}>
                        {quiz?.title}
                    </div>
                    <div style={{
                        display:"inline-block", marginTop:8,
                        background: correct === total
                            ? "linear-gradient(135deg,#69db7c,#38d9a9)"
                            : correct > total / 2
                            ? "linear-gradient(135deg,#ffd43b,#ffa94d)"
                            : "linear-gradient(135deg,#ff6b6b,#ff8787)",
                        color:"white", borderRadius:50,
                        padding:"4px 18px",
                        fontFamily:"'Fredoka One', cursive", fontSize:15,
                    }}>
                        ✅ {correct} / {total} Correct
                    </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop:"2px dashed #f0f0f0", marginBottom:16 }} />

                {/* Answer rows */}
                {(answers || []).map((ans, i) => {
                    const questionText  = ans.question?.question_text || "—";
                    const correctChoice = ans.question?.choices?.find(c => c.is_correct);
                    const correctText   = correctChoice?.choice_text || "—";
                    const spokenText    = ans.choice_string || "(no answer)";
                    const isOk          = ans.is_correct;

                    return (
                        <div key={ans.id} className={`answer-row ${isOk ? "correct" : "wrong"}`}>
                            {/* Question number + icon */}
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                                <span style={{
                                    fontFamily:"'Fredoka One', cursive",
                                    fontSize:12, color:"white",
                                    background: isOk ? "#2f9e44" : "#e03131",
                                    borderRadius:50, padding:"2px 10px",
                                    flexShrink:0,
                                }}>
                                    {isOk ? "✓ Correct" : "✗ Wrong"}
                                </span>
                                <span style={{ fontFamily:"'Fredoka One', cursive", fontSize:13, color:"#888" }}>
                                    Q{i + 1}
                                </span>
                            </div>

                            {/* Sentence to read */}
                            <div style={{
                                fontFamily:"'Fredoka One', cursive",
                                fontSize:"clamp(13px,3vw,16px)",
                                color:"#333", marginBottom:8, lineHeight:1.4,
                            }}>
                                📖 {questionText}
                            </div>

                            {/* Correct answer */}
                            <div style={{ display:"flex", gap:6, alignItems:"flex-start", marginBottom:4, flexWrap:"wrap" }}>
                                <span style={{ fontSize:11, fontWeight:800, color:"#2f9e44", background:"#d3f9d8", borderRadius:6, padding:"2px 8px", flexShrink:0 }}>
                                    ✅ Should say
                                </span>
                                <span style={{ fontFamily:"'Nunito', sans-serif", fontWeight:700, fontSize:13, color:"#2f9e44" }}>
                                    {correctText}
                                </span>
                            </div>

                            {/* Student's answer */}
                            <div style={{ display:"flex", gap:6, alignItems:"flex-start", flexWrap:"wrap" }}>
                                <span style={{ fontSize:11, fontWeight:800, color: isOk ? "#2f9e44" : "#e03131", background: isOk ? "#d3f9d8" : "#ffe3e3", borderRadius:6, padding:"2px 8px", flexShrink:0 }}>
                                    🎤 You said
                                </span>
                                <span style={{ fontFamily:"'Nunito', sans-serif", fontWeight:700, fontSize:13, color: isOk ? "#2f9e44" : "#e03131", fontStyle:"italic" }}>
                                    "{spokenText}"
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        display:"block", width:"100%", marginTop:16,
                        padding:"12px", borderRadius:50, border:"none",
                        background:`linear-gradient(135deg,${display.color},${display.color}bb)`,
                        color:"white", fontFamily:"'Fredoka One', cursive",
                        fontSize:18, cursor:"pointer",
                        boxShadow:`0 6px 0 ${display.color}88`,
                        transition:"transform 0.15s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                    ✕ Close
                </button>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════
   COMPONENT
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

    // ── NEW: actual next quiz fetched from backend ──
    const [actualNextQuiz, setActualNextQuiz] = useState(null);
    const [nextLoading,    setNextLoading]    = useState(false);

    const [isAllDone, setIsAllDone] = useState(false);

    // ── Results modal state ──
    const [modalAttempt, setModalAttempt] = useState(null);

    useEffect(() => {
        const init = async () => { try { await getUser(); } catch (e) { console.error(e); } };
        init();
    }, []);

    useEffect(() => {
        const fetchQuizResult = async () => {
            try {
                const res = await axios.get(`/quiz-attempts/${attemptId}`);
                const { quiz, answers, score } = res.data.data;
                setQuizData(quiz);
                setAnswers(answers ?? []);
                setScore(score ?? (answers ?? []).filter(a => a.is_correct).length);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (attemptId) fetchQuizResult();
        else setLoading(false);
    }, [attemptId]);

    // ── Fetch actual next quiz from backend ──────────────────────────────────
    // This is the KEY change: instead of guessing the next level on the frontend,
    // we ask the backend directly. The backend auto-advances the student's
    // difficulty in getQuiz() step 5, so whatever it returns IS the correct next.
    // Works for ALL difficulty levels:
    //   Easy → Post-Test, Medium → Post-Test, Hard → Post-Test, Expert → Post-Test
    useEffect(() => {
        if (!loading && quizData) {
            const isPreTest  = quizData.difficulty === "Introduction";
            const isPostTest = quizData.difficulty === "PostTest";

            // Only fetch next quiz for regular (non-pre, non-post) quizzes
            if (!isPreTest && !isPostTest) {
                const fetchNextQuiz = async () => {
                    setNextLoading(true);
                    try {
                        const res = await axios.get("/quizzes/get-quiz");
                        const next = res.data.data;
                        // Backend returns a quiz object with `questions` when there's a next quiz.
                        // If it returns grouped quizzes or null, there's nothing next.
                        if (next && next.questions) {
                            setActualNextQuiz(next);
                            setIsAllDone(false);
                        } else {
                            setActualNextQuiz(null);
                            setIsAllDone(true);
                        }
                    } catch (err) {
                        console.error("Could not fetch next quiz:", err);
                        setActualNextQuiz(null);
                    } finally {
                        setNextLoading(false);
                    }
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
            } catch (err) {
                console.error("Could not load journey:", err);
            } finally {
                setJourneyLoading(false);
            }
        };
        if (!loading && quizData?.difficulty === "PostTest") fetchJourney();
    }, [loading, quizData, authUser]);

    useEffect(() => {
        if (!loading && quizData) {
            const difficulty = quizData.difficulty;
            const isPreTest  = difficulty === "Introduction";
            const isPostTest = difficulty === "PostTest";

            if (isPreTest) {
                // Always word-by-word for Pre-Test — partial credit per correct word
                let earned = 0, possible = 0;
                for (const q of quizData.questions ?? []) {
                    const correctChoice = q.choices?.find(c => c.is_correct);
                    const ans = answers.find(a => a.question_id === q.id);
                    const pts = q.points ?? 1;
                    possible += pts;
                    if (correctChoice) {
                        const spoken = ans?.choice_string || ans?.transcript || "";
                        earned += scoreWordByWord(spoken, correctChoice.choice_text, pts);
                    }
                }
                const pct = possible > 0 ? (earned / possible) * 100 : 0;
                setTimeout(() => setProgressWidth(pct), 300);
                setScore(earned);
            } else {
                const totalPoints = (quizData.questions ?? []).reduce((sum, q) => sum + (q.points ?? 1), 0); // used for non-pretest display
                const pct = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
                setTimeout(() => setProgressWidth(pct), 300);
            }

            if (isPostTest) {
                setIsAllDone(true);
            }
        }
    }, [loading, quizData, score]);

    /* ── loading ── */
    if (loading) return (
        <>
            <style>{styles}</style>
            <div style={{ width:"100%", height:"100vh", background:"linear-gradient(160deg,#a8edea,#fed6e3)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
                <div style={{ fontSize:"clamp(48px,12vw,72px)", animation:"bounce 1s ease infinite" }}>⏳</div>
                <Spin size="large" />
                <p style={{ fontFamily:"'Fredoka One', cursive", fontSize:"clamp(15px,4vw,20px)", color:"#ff6b6b" }}>Getting your results...</p>
            </div>
        </>
    );

    if (!quizData) return (
        <>
            <style>{styles}</style>
            <div style={{ textAlign:"center", marginTop:80, fontSize:"clamp(16px,4vw,22px)", fontFamily:"'Fredoka One', cursive", padding:"20px" }}>
                <div style={{ fontSize:"clamp(48px,12vw,72px)" }}>😕</div>
                Quiz data not found!
            </div>
        </>
    );

    /* ── derived values ── */
    const isPreTest  = quizData.difficulty === "Introduction";
    const isPostTest = quizData.difficulty === "PostTest";
    const totalPoints = (quizData.questions ?? []).reduce((sum, q) => sum + (q.points ?? 1), 0); // used for non-pretest display

    // ── Compute pctNum (0-100) ──────────────────────────────────────────────
    // For Pre/Post-Test: average word-match % per question
    // For other quizzes: raw score / total points * 100
    let pctNum = 0;
    let displayScore = score;

    const normWords = (t) =>
        (t || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().split(/\s+/).filter(Boolean);

    if (isPreTest || isPostTest) {
        let totalPct = 0, qCount = 0;
        for (const q of quizData.questions ?? []) {
            const correctChoice = q.choices?.find(c => c.is_correct);
            const ans = answers.find(a => a.question_id === q.id);
            if (!correctChoice) continue;
            const spoken = ans?.choice_string || ans?.transcript || "";
            const sw = normWords(spoken);
            const cw = normWords(correctChoice.choice_text);
            if (cw.length === 0) continue;
            const pool = [...cw]; let matched = 0;
            for (const w of sw) { const i = pool.indexOf(w); if (i !== -1) { matched++; pool.splice(i, 1); } }
            totalPct += Math.round((matched / cw.length) * 100);
            qCount++;
        }
        pctNum       = qCount > 0 ? totalPct / qCount : 0;
        displayScore = Math.round(pctNum);
    } else {
        pctNum       = totalPoints > 0 ? (displayScore / totalPoints) * 100 : 0;
    }

    const percentage  = pctNum.toFixed(1);
    const isPerfect   = pctNum >= 100;
    const isGreat     = pctNum >= 75;
    const starCount   = getStarCount(pctNum);
    const placement   = isPreTest ? getPlacementLevel(pctNum) : null;

    const trophyEmoji = isPerfect ? "🏆" : isGreat ? "🥇" : pctNum >= 50 ? "🥈" : "⭐";
    const resultMessage = isPerfect
        ? "Perfect Score!"
        : isGreat
            ? "Awesome Job!"
            : pctNum >= 50
                ? "Good Work!"
                : "Keep Trying!";

    const barColor = pctNum >= 75
        ? "linear-gradient(90deg,#69db7c,#a9e34b)"
        : pctNum >= 50
            ? "linear-gradient(90deg,#74c0fc,#a9e34b)"
            : "linear-gradient(90deg,#ff6b6b,#ffa94d)";

    const borderColor = isPerfect ? "#ffd700" : isPostTest ? "#a9e34b" : "#74c0fc";

    // ── Next quiz display info (from actual backend response) ──
    const nextDiff        = actualNextQuiz?.difficulty ?? null;
    const nextDiffDisplay = nextDiff ? DIFFICULTY_DISPLAY[nextDiff] : null;
    const isNextPostTest  = nextDiff === "PostTest";

    /* ── Journey summary (PostTest only) ── */
    const JOURNEY_ORDER = ["Introduction", "Easy", "Medium", "Hard", "Expert", "PostTest"];
    const journeyMap = {};
    for (const attempt of journeyAttempts) {
        const diff = attempt.difficulty || attempt.quiz?.difficulty;
        if (!diff) continue;
        if (!journeyMap[diff] || (attempt.score ?? 0) > (journeyMap[diff].score ?? 0)) journeyMap[diff] = attempt;
    }
    if (isPostTest && quizData) {
        journeyMap["PostTest"] = { score: displayScore, difficulty: "PostTest", quiz: quizData };
    }
    const READING_ASSESSMENT_DIFFS = ["Introduction", "PostTest"];
    const journeyLevels = JOURNEY_ORDER.map(diff => {
        const attempt = journeyMap[diff];
        const display = DIFFICULTY_DISPLAY[diff];
        if (!attempt) return { diff, display, score: null, total: null, pct: null, isReadingPct: false };
        const isReadingPct = READING_ASSESSMENT_DIFFS.includes(diff);
        const total = attempt.quiz?.questions?.length ?? attempt.total_questions ?? null;
        const sc    = attempt.score ?? null;
        // For Pre/Post-Test: score is already 0-100 percentage — use it directly as pct
        // For other levels: score is raw points, calculate percentage normally
        const pct   = sc != null
            ? (isReadingPct ? Math.min(100, Math.round(sc)) : (total ? Math.round((sc / total) * 100) : null))
            : null;
        return { diff, display, score: sc, total, pct, isReadingPct };
    });
    // For overall total: use pct values averaged (avoids mixing % and raw points)
    const takenLevels       = journeyLevels.filter(l => l.pct != null);
    const journeyOverallPct = takenLevels.length > 0
        ? Math.round(takenLevels.reduce((s, l) => s + l.pct, 0) / takenLevels.length)
        : 0;

    return (
        <>
            <style>{styles}</style>
            {(isPerfect || isPreTest || isPostTest) && <Confetti />}

            {/* ── Results Modal ── */}
            {modalAttempt && (
                <ResultsModal
                    attempt={modalAttempt}
                    onClose={() => setModalAttempt(null)}
                />
            )}

            {["⭐","🌟","✨","💫"].map((s, i) => (
                <div key={i} className="floating-star" style={{
                    top:`${10 + i * 20}%`,
                    [i % 2 === 0 ? "left" : "right"]: "2%",
                    animationDuration:`${3 + i}s`,
                    animationDelay:`${i * 0.5}s`,
                }}>{s}</div>
            ))}

            <div className="finished-root">

                {/* ══ HERO RESULT CARD ══ */}
                <div className={`result-hero-card${isPerfect ? " perfect" : ""}`} style={{
                    border: `4px solid ${borderColor}`,
                }}>
                    <div style={{
                        fontSize: "clamp(72px,20vw,110px)",
                        marginBottom: 4,
                        display: "inline-block",
                        animation: "trophyBounce 2.5s ease-in-out infinite",
                    }}>
                        {isPostTest ? "🎓" : trophyEmoji}
                    </div>

                    <div style={{
                        fontFamily: "'Fredoka One', cursive",
                        fontSize: "clamp(24px,7vw,40px)",
                        color: isPerfect ? "#ff6b6b" : "#5b4e75",
                        marginBottom: 6,
                        animation: isPerfect ? "rainbowText 2s linear infinite" : "none",
                    }}>
                        {isPostTest ? "Amazing! 🎉" : resultMessage}
                    </div>

                    <div style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 800,
                        fontSize: "clamp(13px,3vw,16px)",
                        color: "#888",
                        marginBottom: 16,
                    }}>
                        {quizData.title}
                    </div>

                    <div style={{
                        fontFamily: "'Fredoka One', cursive",
                        fontSize: "clamp(52px,14vw,80px)",
                        color: "#ff6b6b",
                        lineHeight: 1,
                        marginBottom: 4,
                    }}>
                        {pctNum.toFixed(0)}
                        <span style={{ fontSize: "clamp(24px,6vw,36px)", color: "#ccc" }}>
                            %
                        </span>
                    </div>

                    <StarRow count={starCount} color={isPerfect ? "#ffd700" : isPostTest ? "#a9e34b" : "#74c0fc"} />

                    <div style={{ margin: "12px 0 6px" }}>
                        <div className="progress-bar-track">
                            <div className="progress-bar-fill" style={{ width:`${progressWidth}%`, background:barColor }}>
                                {progressWidth > 15 && `${pctNum.toFixed(0)}%`}
                            </div>
                        </div>
                    </div>
                    <div style={{
                        fontFamily: "'Fredoka One', cursive",
                        fontSize: "clamp(14px,3.5vw,18px)",
                        color: "#888",
                    }}>
                        {percentage}% — {isGreat ? "Great job! 🌟" : pctNum >= 50 ? "Good effort! 💪" : "Keep going! 🚀"}
                    </div>
                </div>

                {/* ══ Level Placement (Pre-Test only) ══ */}
                {isPreTest && placement && (
                    <div className="level-reveal-card" style={{
                        background:`linear-gradient(135deg, ${placement.color}22, ${placement.color}11)`,
                        border:`4px solid ${placement.color}`,
                        boxShadow:`0 8px 32px ${placement.color}44`,
                    }}>
                        <div style={{ fontSize:"clamp(36px,10vw,56px)", marginBottom:8, animation:"bounce 2s ease infinite" }}>
                            {placement.emoji}
                        </div>
                        <h2 style={{ fontFamily:"'Fredoka One', cursive", fontSize:"clamp(14px,3.5vw,18px)", color:"#555", margin:"0 0 6px" }}>
                            🎯 Your Reading Level!
                        </h2>
                        <div style={{
                            fontFamily:"'Fredoka One', cursive",
                            fontSize:"clamp(24px,7vw,36px)",
                            color:placement.color,
                            margin:"8px 0",
                            textShadow:`0 3px 12px ${placement.color}66`,
                        }}>
                            {placement.label}
                        </div>
                        <p style={{ fontSize:"clamp(12px,3vw,14px)", color:"#555", margin:"8px 0 0", fontWeight:700 }}>
                            Your quizzes will start at <strong style={{ color:placement.color }}>{placement.level}</strong> level. You've got this! 💪
                        </p>
                    </div>
                )}

                {/* ══ Next Level Card ══
                    Uses actualNextQuiz from backend — works for ALL levels:
                    Easy → PostTest, Medium → PostTest, Hard → PostTest, Expert → PostTest
                ══ */}
                {!isPreTest && !isPostTest && (
                    <>
                        {nextLoading && (
                            <div className="next-level-card" style={{
                                background:"rgba(255,255,255,0.8)",
                                border:"4px solid #ddd",
                                display:"flex", flexDirection:"column", alignItems:"center", gap:12,
                            }}>
                                <Spin size="large" />
                                <p style={{ fontFamily:"'Fredoka One', cursive", color:"#aaa", fontSize:"1rem", margin:0 }}>
                                    Finding your next challenge…
                                </p>
                            </div>
                        )}

                        {!nextLoading && actualNextQuiz && nextDiffDisplay && (
                            <div className="next-level-card" style={{
                                background:`linear-gradient(135deg, ${nextDiffDisplay.color}22, ${nextDiffDisplay.color}11)`,
                                border:`4px solid ${nextDiffDisplay.color}`,
                                boxShadow:`0 8px 32px ${nextDiffDisplay.color}44`,
                            }}>
                                <div style={{ fontSize:"clamp(36px,10vw,52px)", marginBottom:8, animation:"bounce 2s ease infinite" }}>
                                    {nextDiffDisplay.emoji}
                                </div>
                                <h2 style={{ fontFamily:"'Fredoka One', cursive", fontSize:"clamp(14px,3.5vw,18px)", color:"#555", margin:"0 0 6px" }}>
                                    🚀 Level Complete! Next Up:
                                </h2>
                                <div style={{
                                    fontFamily:"'Fredoka One', cursive",
                                    fontSize:"clamp(22px,6vw,32px)",
                                    color:nextDiffDisplay.color,
                                    margin:"8px 0",
                                }}>
                                    {isNextPostTest ? "🎓 Post-Test!" : `${nextDiff} Level!`}
                                </div>
                                <p style={{ fontSize:"clamp(12px,3vw,14px)", color:"#555", margin:"8px 0 0", fontWeight:700 }}>
                                    {isNextPostTest
                                        ? "Natapos mo na ang lahat ng levels! Time for the final Post-Test! 🌟"
                                        : `Keep going — the ${nextDiff} level awaits! 💪`
                                    }
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* ══ Journey Summary (PostTest completed) ══ */}
                {isPostTest && isAllDone && (
                    <>
                        <div className="level-reveal-card" style={{
                            background:"linear-gradient(135deg,#fff9c4,#ffd6e7,#c8f7ff)",
                            border:"4px solid #ffd700",
                            boxShadow:"0 8px 40px rgba(255,215,0,0.4)",
                            animation:"popIn 0.7s cubic-bezier(0.175,0.885,0.32,1.275) forwards, glow 2s ease-in-out infinite",
                        }}>
                            <div style={{ fontSize:"clamp(40px,12vw,64px)", marginBottom:8, animation:"trophyBounce 2.5s ease-in-out infinite" }}>
                                🎓✨
                            </div>
                            <h2 style={{ fontFamily:"'Fredoka One', cursive", fontSize:"clamp(16px,4vw,22px)", color:"#333", margin:"0 0 6px" }}>
                                <span style={{ animation:"rainbowText 2s linear infinite", display:"inline-block" }}>
                                    You're a Reading Champion!
                                </span>
                            </h2>
                            <p style={{ fontSize:"clamp(12px,3vw,15px)", color:"#555", margin:"8px 0 0", fontWeight:700 }}>
                                You completed the whole reading journey! 🌟🏆
                            </p>
                        </div>

                        <div className="journey-card">
                            <h2 style={{ fontFamily:"'Fredoka One', cursive", fontSize:"clamp(18px,5vw,26px)", color:"#333", textAlign:"center", margin:"0 0 16px" }}>
                                🗺️ Your Reading Journey
                            </h2>
                            {journeyLoading ? (
                                <div style={{ textAlign:"center", padding:20 }}><Spin /></div>
                            ) : (
                                <>
                                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center", marginBottom:20 }}>
                                        {journeyLevels.map(({ diff, display, score: sc, total, pct, isReadingPct }) => {
                                            // Find the matching attempt for this difficulty
                                            const pillAttempt = journeyAttempts.find(
                                                a => (a.quiz?.difficulty || a.difficulty) === diff
                                            ) || (diff === "PostTest" && isPostTest ? { quiz: quizData, answers, score: displayScore } : null);

                                            return (
                                            <div
                                                key={diff}
                                                className={`journey-level-pill${sc != null ? " pill-clickable" : ""}`}
                                                title={sc != null ? `Click to see ${display.label} results` : "Not taken yet"}
                                                onClick={() => sc != null && pillAttempt && setModalAttempt(pillAttempt)}
                                                style={{
                                                    background: sc != null
                                                        ? `linear-gradient(135deg, ${display.color}22, ${display.color}11)`
                                                        : "#f8f8f8",
                                                    border: `3px solid ${sc != null ? display.color : "#ddd"}`,
                                                    opacity: sc != null ? 1 : 0.5,
                                                }}>
                                                <span style={{ fontSize:"clamp(16px,3.5vw,22px)", lineHeight:1 }}>
                                                    {display.emoji}
                                                </span>
                                                <span style={{
                                                    fontFamily:"'Fredoka One', cursive",
                                                    fontSize:"clamp(9px,1.8vw,11px)",
                                                    color:display.color, lineHeight:1.2,
                                                    width:"100%", textAlign:"center",
                                                }}>
                                                    {diff === "Introduction" ? "Pre-Test" : diff === "PostTest" ? "Post-Test" : diff}
                                                </span>
                                                {sc != null && pct != null ? (
                                                    <>
                                                        {/* Pre/Post-Test: show % only. Others: show score/total */}
                                                        {isReadingPct ? (
                                                            <span style={{
                                                                fontFamily:"'Fredoka One', cursive",
                                                                fontSize:"clamp(13px,3vw,17px)",
                                                                color:"#333", lineHeight:1,
                                                            }}>
                                                                {pct}<span style={{ fontSize:"clamp(9px,1.8vw,11px)", color:"#aaa" }}>%</span>
                                                            </span>
                                                        ) : (
                                                            <span style={{
                                                                fontFamily:"'Fredoka One', cursive",
                                                                fontSize:"clamp(13px,3vw,17px)",
                                                                color:"#333", lineHeight:1,
                                                            }}>
                                                                {sc}<span style={{ fontSize:"clamp(9px,1.8vw,11px)", color:"#aaa" }}>/{total}</span>
                                                            </span>
                                                        )}
                                                        <span style={{
                                                            fontSize:"clamp(9px,1.8vw,11px)",
                                                            fontWeight:800,
                                                            color: pct >= 75 ? "#2f9e44" : pct >= 50 ? "#e67300" : "#c92a2a",
                                                        }}>
                                                            {pct}%
                                                        </span>
                                                        <div style={{ display:"flex", gap:1, justifyContent:"center", width:"100%", overflow:"hidden" }}>
                                                            {[1,2,3,4,5].map(i => (
                                                                <span key={i} style={{
                                                                    fontSize:"clamp(8px,1.8vw,11px)",
                                                                    opacity: i <= getStarCount(pct) ? 1 : 0.2,
                                                                    lineHeight:1,
                                                                }}>⭐</span>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span style={{ fontSize:10, color:"#bbb", fontWeight:700 }}>Not taken</span>
                                                )}
                                            </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{
                                        background:"white", border:"3px solid #ffd700",
                                        borderRadius:18, padding:"14px 20px", textAlign:"center",
                                        boxShadow:"0 4px 16px rgba(255,215,0,0.2)",
                                    }}>
                                        <p style={{ margin:"0 0 4px", fontWeight:800, color:"#888", fontSize:"clamp(12px,2.5vw,14px)" }}>
                                            🏅 Overall Performance
                                        </p>
                                        <span style={{ fontFamily:"'Fredoka One', cursive", fontSize:"clamp(28px,8vw,38px)", color:"#ff6b6b" }}>
                                            {journeyOverallPct}
                                        </span>
                                        <span style={{ fontFamily:"'Fredoka One', cursive", fontSize:"clamp(16px,4vw,22px)", color:"#aaa" }}>
                                            %
                                        </span>
                                        <p style={{ margin:"4px 0 8px", fontWeight:800, color:"#ffa94d", fontSize:"clamp(14px,3.5vw,18px)" }}>
                                            Average across {takenLevels.length} level{takenLevels.length !== 1 ? "s" : ""}
                                        </p>
                                        <StarRow count={getStarCount(journeyOverallPct)} color="#ffd700" />
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}

                {/* ── Action Buttons ── */}
                <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", zIndex:1 }}>

                    {/* Pre-Test done → Start Journey */}
                    {isPreTest && (
                        <button className="action-btn btn-primary" onClick={() => navigate("/student")}>
                            🎯 Start My Journey!
                        </button>
                    )}

                    {/* Post-Test done → Finish → logout/login */}
                    {isPostTest && (
                        <button className="action-btn btn-results" onClick={() => {
                            window.speechSynthesis?.cancel();
                            localStorage.removeItem('APP_STUDENT_TOKEN');
                            localStorage.removeItem('APP_STUDENT');
                            navigate("/student/logout");
                        }}>
                            🏁 Finish
                        </button>
                    )}

                    {/* Regular quiz done → Try Again + Next Level/PostTest */}
                    {!isPreTest && !isPostTest && (
                        <>
                            {/* Try Again — always visible */}
                            <button
                                className="action-btn btn-orange"
                                onClick={() => navigate("/student/quiz")}
                            >
                                🔄 Try Again!
                            </button>

                            {/* Loading next quiz */}
                            {nextLoading && (
                                <button className="action-btn btn-secondary" disabled style={{ opacity:0.6 }}>
                                    ⏳ Loading next…
                                </button>
                            )}

                            {/* Next quiz available (PostTest or another level) */}
                            {!nextLoading && actualNextQuiz && (
                                <button
                                    className={`action-btn ${isNextPostTest ? "btn-posttest" : "btn-primary"}`}
                                    onClick={() => navigate("/student")}
                                >
                                    {isNextPostTest
                                        ? "🎓 Take Post-Test!"
                                        : `➡️ Go to ${nextDiff} Level!`
                                    }
                                </button>
                            )}

                            {/* No next quiz (edge case) */}
                            {!nextLoading && !actualNextQuiz && (
                                <button className="action-btn btn-secondary" onClick={() => navigate("/student")}>
                                    🏠 Back to Dashboard
                                </button>
                            )}
                        </>
                    )}
                </div>

                <p style={{ marginTop:24, fontFamily:"'Fredoka One', cursive", fontSize:"clamp(14px,3.5vw,18px)", color:"#ff6b6b", textAlign:"center", zIndex:1, padding:"0 16px" }}>
                    {isPostTest
                        ? "You've completed your entire reading journey! 🌟🎓"
                        : isPreTest
                            ? "Great effort! Your reading journey starts now! 🌱✨"
                            : "You can do it! Keep practicing! 💪🌟"
                    }
                </p>
            </div>
        </>
    );
};

export default StudentFinishedQuiz;