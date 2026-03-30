import { Button, Card, Spin, Layout, Typography, message, Row, Col, Progress, Badge } from "antd";
import { useAuth } from "../../composables/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../plugins/axios";

const { Content } = Layout;
const { Title, Text } = Typography;

/* ─────────────────────────────────────────────
   Global Styles + Animations
───────────────────────────────────────────── */
const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; font-family: 'Nunito', sans-serif; }

        @keyframes floatY {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-14px); }
        }
        @keyframes floatX {
            0%, 100% { transform: translateX(0px) rotate(-3deg); }
            50%       { transform: translateX(12px) rotate(3deg); }
        }
        @keyframes spinStar {
            from { transform: rotate(0deg) scale(1); }
            to   { transform: rotate(360deg) scale(1.15); }
        }
        @keyframes popIn {
            0%   { transform: scale(0) rotate(-8deg); opacity: 0; }
            70%  { transform: scale(1.1) rotate(2deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes shimmer {
            0%   { background-position: -200% center; }
            100% { background-position: 200% center; }
        }
        @keyframes rainbowBg {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes wiggle {
            0%, 100% { transform: rotate(-5deg); }
            50%       { transform: rotate(5deg); }
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0px) scale(1); }
            50%       { transform: translateY(-8px) scale(1.05); }
        }
        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255,200,50,0.6); }
            50%       { box-shadow: 0 0 0 16px rgba(255,200,50,0); }
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes confettiFall {
            0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes cloudDrift {
            0%   { transform: translateX(-150px); opacity: 0; }
            10%  { opacity: 0.6; }
            90%  { opacity: 0.6; }
            100% { transform: translateX(110vw); opacity: 0; }
        }
        @keyframes gradientShift {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .dash-card-enter {
            animation: slideUp 0.5s ease both;
        }
        .quiz-card-hover {
            transition: transform 0.2s ease, box-shadow 0.2s ease !important;
            cursor: pointer;
        }
        .quiz-card-hover:hover {
            transform: translateY(-6px) scale(1.02) !important;
            box-shadow: 0 16px 40px rgba(0,0,0,0.2) !important;
        }
        .kid-btn-dash {
            font-family: 'Fredoka One', cursive !important;
            border: none !important;
            border-radius: 50px !important;
            cursor: pointer;
            transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .kid-btn-dash:hover {
            transform: scale(1.07) translateY(-2px) !important;
        }
        .kid-btn-dash:active {
            transform: scale(0.95) !important;
        }
        .level-badge {
            animation: pulse 2s ease infinite;
        }
        .star-spin {
            animation: spinStar 4s linear infinite;
        }
        .float-anim {
            animation: floatY 3s ease-in-out infinite;
        }
        .wiggle-anim {
            animation: wiggle 2s ease-in-out infinite;
        }
        .bounce-anim {
            animation: bounce 2s ease-in-out infinite;
        }
        .shimmer-text {
            background: linear-gradient(90deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #FF6B6B);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: shimmer 3s linear infinite;
        }
    `}</style>
);

/* ─────────────────────────────────────────────
   Decorative floating clouds
───────────────────────────────────────────── */
const Clouds = () => {
    const clouds = [
        { top: "5%",  size: 90,  dur: 25, delay: 0  },
        { top: "15%", size: 120, dur: 32, delay: 7  },
        { top: "60%", size: 75,  dur: 20, delay: 3  },
        { top: "75%", size: 100, dur: 28, delay: 12 },
        { top: "40%", size: 65,  dur: 22, delay: 9  },
    ];
    return (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
            {clouds.map((c, i) => (
                <div key={i} style={{
                    position: "absolute", top: c.top, left: 0,
                    width: c.size, height: c.size * 0.55,
                    background: "rgba(255,255,255,0.5)",
                    borderRadius: "50%",
                    animation: `cloudDrift ${c.dur}s ${c.delay}s linear infinite`,
                    filter: "blur(5px)",
                }} />
            ))}
        </div>
    );
};

/* ─────────────────────────────────────────────
   Floating emoji decorations
───────────────────────────────────────────── */
const FloatingEmojis = () => {
    const emojis = [
        { e: "⭐", top: "8%",  left: "3%",  size: 32, dur: 3.2, delay: 0   },
        { e: "🌟", top: "20%", left: "92%", size: 28, dur: 4.1, delay: 0.5 },
        { e: "✨", top: "45%", left: "2%",  size: 24, dur: 3.6, delay: 1   },
        { e: "💫", top: "70%", left: "94%", size: 30, dur: 4.5, delay: 0.8 },
        { e: "🎯", top: "85%", left: "4%",  size: 26, dur: 3.9, delay: 1.5 },
        { e: "🎪", top: "12%", left: "88%", size: 28, dur: 3.3, delay: 0.3 },
        { e: "🌈", top: "55%", left: "96%", size: 30, dur: 4.2, delay: 1.2 },
        { e: "🎠", top: "35%", left: "1%",  size: 26, dur: 3.7, delay: 0.7 },
    ];
    return (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
            {emojis.map((item, i) => (
                <div key={i} style={{
                    position: "absolute",
                    top: item.top, left: item.left,
                    fontSize: item.size,
                    animation: `floatY ${item.dur}s ${item.delay}s ease-in-out infinite`,
                    opacity: 0.75,
                }}>{item.e}</div>
            ))}
        </div>
    );
};

/* ─────────────────────────────────────────────
   Level progress indicator
───────────────────────────────────────────── */
const LevelRoadmap = ({ currentDifficulty }) => {
    const levels = [
        { name: "Introduction", emoji: "🌱", color: "#52C41A" },
        { name: "Easy",         emoji: "😊", color: "#1890FF" },
        { name: "Medium",       emoji: "🔥", color: "#FA8C16" },
        { name: "Hard",         emoji: "🏆", color: "#F5222D" },
    ];
    const currentIdx = levels.findIndex(l => l.name === currentDifficulty);

    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 0, width: "100%", maxWidth: 500, margin: "0 auto",
        }}>
            {levels.map((level, i) => {
                const isDone    = i < currentIdx;
                const isCurrent = i === currentIdx;
                return (
                    <div key={level.name} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                        <div style={{
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                            flex: "0 0 auto",
                        }}>
                            <div style={{
                                width: isCurrent ? 56 : 44,
                                height: isCurrent ? 56 : 44,
                                borderRadius: "50%",
                                background: isDone
                                    ? `linear-gradient(135deg, ${level.color}, ${level.color}cc)`
                                    : isCurrent
                                        ? `linear-gradient(135deg, ${level.color}, ${level.color}88)`
                                        : "rgba(255,255,255,0.3)",
                                border: isCurrent ? `4px solid ${level.color}` : "3px solid rgba(255,255,255,0.5)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: isCurrent ? 26 : 20,
                                boxShadow: isCurrent ? `0 4px 16px ${level.color}88` : "none",
                                animation: isCurrent ? "bounce 1.5s ease-in-out infinite" : "none",
                                transition: "all 0.3s ease",
                            }}>
                                {isDone ? "✅" : level.emoji}
                            </div>
                            <span style={{
                                fontFamily: "'Fredoka One', cursive",
                                fontSize: isCurrent ? 13 : 11,
                                color: isCurrent ? level.color : "rgba(255,255,255,0.7)",
                                fontWeight: isCurrent ? "bold" : "normal",
                                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                            }}>{level.name}</span>
                        </div>
                        {i < levels.length - 1 && (
                            <div style={{
                                flex: 1, height: 6, margin: "0 4px",
                                marginBottom: 20,
                                background: i < currentIdx
                                    ? `linear-gradient(90deg, ${level.color}, ${levels[i+1].color})`
                                    : "rgba(255,255,255,0.3)",
                                borderRadius: 3,
                                boxShadow: i < currentIdx ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                            }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

/* ─────────────────────────────────────────────
   Confetti
───────────────────────────────────────────── */
const CONFETTI_COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF922B","#CC5DE8","#F06595"];
const Confetti = () => {
    const pieces = Array.from({ length: 35 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 8 + Math.random() * 10,
        delay: Math.random() * 2,
        duration: 2.5 + Math.random() * 2,
    }));
    return (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
            {pieces.map(p => (
                <div key={p.id} style={{
                    position: "absolute", left: `${p.left}%`, top: 0,
                    width: p.size, height: p.size,
                    backgroundColor: p.color,
                    borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                    animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
                }} />
            ))}
        </div>
    );
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const StudentDashboard = () => {
    const navigate = useNavigate();
    const { authUser, getUser } = useAuth();

    const [loading, setLoading]                   = useState(true);
    const [currentDifficulty, setCurrentDifficulty] = useState("Introduction");
    const [availableQuiz, setAvailableQuiz]         = useState(null);
    const [allQuizzes, setAllQuizzes]               = useState(null);
    const [showAllQuizzes, setShowAllQuizzes]       = useState(false);
    const [showConfetti, setShowConfetti]           = useState(false);

    const difficultyOrder  = ["Introduction", "Easy", "Medium", "Hard"];
    const difficultyConfig = {
        Introduction: { color: "#52C41A", bg: "linear-gradient(135deg,#52C41A,#389E0D)", emoji: "🌱", label: "Beginner"  },
        Easy:         { color: "#1890FF", bg: "linear-gradient(135deg,#1890FF,#096DD9)", emoji: "😊", label: "Easy"      },
        Medium:       { color: "#FA8C16", bg: "linear-gradient(135deg,#FA8C16,#D46B08)", emoji: "🔥", label: "Medium"    },
        Hard:         { color: "#F5222D", bg: "linear-gradient(135deg,#F5222D,#A8071A)", emoji: "🏆", label: "Champion!" },
    };

    useEffect(() => {
        const init = async () => {
            try { await getUser(); }
            catch (err) { console.error("Error fetching user:", err); }
        };
        init();
    }, []);

    useEffect(() => {
        const fetchDifficultyAndQuiz = async () => {
            if (!authUser?.id) return;
            setLoading(true);
            try {
                const diffRes = await axios.get(`/students/${authUser.id}/difficulty`);
                const diff    = diffRes.data.data?.difficulty || "Introduction";
                setCurrentDifficulty(diff);

                const quizRes = await axios.get("/quizzes/get-quiz");

                if (!quizRes.data.data) {
                    setAvailableQuiz(null);
                    setShowAllQuizzes(true);
                    setAllQuizzes([]);
                    return;
                }

                if (quizRes.data.data.questions) {
                    setAvailableQuiz(quizRes.data.data);
                    if (diff === "Hard") {
                        setShowAllQuizzes(true);
                        setShowConfetti(true);
                        setTimeout(() => setShowConfetti(false), 4000);
                    } else {
                        setShowAllQuizzes(false);
                    }
                    if (!diff || diff === "Introduction") {
                        message.info("You are starting with the Introduction quiz.");
                        navigate("/student/quiz");
                    }
                } else {
                    setAvailableQuiz(null);
                    setShowAllQuizzes(true);
                    setAllQuizzes(quizRes.data.data);
                }
            } catch (err) {
                console.error("Error:", err);
                setCurrentDifficulty("Introduction");
                setAvailableQuiz(null);
                setShowAllQuizzes(true);
            } finally {
                setLoading(false);
            }
        };
        fetchDifficultyAndQuiz();
    }, [authUser]);

    const startSpecificQuiz = async (quizId) => {
        try {
            const res       = await axios.post("/quiz-attempts", {
                quiz_id: quizId, started_at: new Date().toISOString(), score: 0,
            });
            const attemptId = res.data.data.id;
            console.log("Quiz attempt ID:", attemptId);
            navigate("/student/quiz", { state: { quizId } });
        } catch (err) {
            console.error("Error starting quiz:", err);
            message.error("Failed to start quiz. Please try again.");
        }
    };

    const cfg = difficultyConfig[currentDifficulty] || difficultyConfig["Introduction"];

    /* ── Quiz Card ── */
    const renderQuizCard = (quiz, difficulty) => {
        const dcfg          = difficultyConfig[difficulty] || difficultyConfig["Easy"];
        const latestAttempt = quiz.latest_quiz_attempt;
        const totalQ        = quiz.questions?.length || 0;
        const score         = latestAttempt?.score ?? 0;
        const pct           = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;
        const isCompleted   = !!latestAttempt?.completed_at;
        const isPerfect     = pct === 100;

        return (
            <div
                key={quiz.id}
                className="quiz-card-hover"
                style={{
                    marginBottom: 16,
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.95)",
                    border: `3px solid ${dcfg.color}44`,
                    boxShadow: `0 6px 24px ${dcfg.color}22`,
                    overflow: "hidden",
                    animation: "slideUp 0.4s ease both",
                }}
            >
                {/* Top accent bar */}
                <div style={{ height: 6, background: dcfg.bg }} />

                <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                <span style={{ fontSize: 22 }}>📚</span>
                                <span style={{
                                    fontFamily: "'Fredoka One', cursive",
                                    fontSize: 18, color: "#333",
                                }}>
                                    {quiz.title}
                                </span>
                                {isPerfect && (
                                    <span style={{
                                        background: "linear-gradient(135deg,#FFD700,#FF8C00)",
                                        color: "white", borderRadius: 20,
                                        padding: "2px 10px", fontSize: 11,
                                        fontFamily: "'Fredoka One', cursive",
                                        boxShadow: "0 2px 8px rgba(255,215,0,0.5)",
                                    }}>⭐ Perfect!</span>
                                )}
                                {isCompleted && !isPerfect && (
                                    <span style={{
                                        background: "linear-gradient(135deg,#52C41A,#389E0D)",
                                        color: "white", borderRadius: 20,
                                        padding: "2px 10px", fontSize: 11,
                                        fontFamily: "'Fredoka One', cursive",
                                    }}>✅ Done</span>
                                )}
                            </div>

                            {quiz.instructions && (
                                <p style={{
                                    color: "#888", fontSize: 13, margin: "0 0 10px",
                                    fontStyle: "italic", lineHeight: 1.4,
                                }}>{quiz.instructions}</p>
                            )}

                            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: isCompleted ? 10 : 0 }}>
                                <span style={{ fontSize: 13, color: "#555" }}>
                                    ❓ <strong>{totalQ}</strong> questions
                                </span>
                                {quiz.time_limit && (
                                    <span style={{ fontSize: 13, color: "#555" }}>
                                        ⏱ <strong>{quiz.time_limit}</strong> min
                                    </span>
                                )}
                                {latestAttempt?.score != null && (
                                    <span style={{ fontSize: 13, color: dcfg.color, fontWeight: 700 }}>
                                        🎯 Score: {score}/{totalQ}
                                    </span>
                                )}
                            </div>

                            {isCompleted && (
                                <div style={{ marginTop: 8 }}>
                                    <div style={{
                                        height: 10, borderRadius: 10,
                                        background: "rgba(0,0,0,0.08)",
                                        overflow: "hidden",
                                    }}>
                                        <div style={{
                                            height: "100%",
                                            width: `${pct}%`,
                                            background: isPerfect
                                                ? "linear-gradient(90deg,#FFD700,#FF8C00)"
                                                : dcfg.bg,
                                            borderRadius: 10,
                                            transition: "width 1s ease",
                                            boxShadow: `0 2px 6px ${dcfg.color}66`,
                                        }} />
                                    </div>
                                    <span style={{ fontSize: 12, color: "#888", marginTop: 4, display: "block" }}>
                                        {pct}% correct
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            className="kid-btn-dash"
                            onClick={() => startSpecificQuiz(quiz.id)}
                            style={{
                                background: isCompleted
                                    ? "linear-gradient(135deg,#722ED1,#531DAB)"
                                    : dcfg.bg,
                                color: "white",
                                padding: "12px 20px",
                                fontSize: "1rem",
                                boxShadow: `0 4px 12px ${dcfg.color}55`,
                                flexShrink: 0,
                            }}
                        >
                            {isCompleted ? "🔄 Retake" : "🚀 Start!"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    /* ── Loading ── */
    if (loading || !authUser) {
        return (
            <>
                <GlobalStyles />
                <div style={{
                    width: "100vw", height: "100vh",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg,#a8edea,#fed6e3,#ffecd2,#a8edea)",
                    backgroundSize: "400% 400%",
                    animation: "rainbowBg 8s ease infinite",
                }}>
                    <div style={{ fontSize: 80, animation: "bounce 0.8s ease infinite" }}>🦉</div>
                    <Spin size="large" style={{ marginTop: 20 }} />
                    <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: "1.5rem", color: "#5b4e75", marginTop: 16 }}>
                        Loading your adventure…
                    </p>
                </div>
            </>
        );
    }

    /* ── Main render ── */
    return (
        <>
            <GlobalStyles />
            {showConfetti && <Confetti />}

            <div style={{
                width: "100%", minHeight: "100vh",
                background: "linear-gradient(135deg,#667eea 0%,#764ba2 25%,#f093fb 50%,#f5576c 75%,#fda085 100%)",
                backgroundSize: "400% 400%",
                animation: "gradientShift 12s ease infinite",
                position: "relative",
                overflow: "hidden",
                paddingBottom: 60,
            }}>
                {/* Background overlay for readability */}
                <div style={{
                    position: "fixed", inset: 0,
                    background: "rgba(0,0,0,0.25)",
                    pointerEvents: "none", zIndex: 0,
                }} />

                <Clouds />
                <FloatingEmojis />

                <div style={{
                    position: "relative", zIndex: 1,
                    maxWidth: 820, margin: "0 auto",
                    padding: "40px 20px",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 28,
                }}>

                    {/* ── WELCOME HERO CARD ── */}
                    <div
                        className="dash-card-enter"
                        style={{
                            width: "100%",
                            borderRadius: 32,
                            background: "rgba(255,255,255,0.15)",
                            backdropFilter: "blur(20px)",
                            border: "3px solid rgba(255,255,255,0.4)",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                            padding: "36px 40px",
                            textAlign: "center",
                            position: "relative",
                            overflow: "hidden",
                            animationDelay: "0s",
                        }}
                    >
                        {/* Decorative circles */}
                        <div style={{
                            position: "absolute", top: -40, right: -40,
                            width: 160, height: 160, borderRadius: "50%",
                            background: "rgba(255,255,255,0.1)",
                        }} />
                        <div style={{
                            position: "absolute", bottom: -30, left: -30,
                            width: 120, height: 120, borderRadius: "50%",
                            background: "rgba(255,255,255,0.08)",
                        }} />

                        {/* Avatar / Level Badge */}
                        <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                            <div style={{
                                width: 100, height: 100, borderRadius: "50%",
                                background: cfg.bg,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 48, margin: "0 auto",
                                boxShadow: `0 8px 32px ${cfg.color}88`,
                                border: "5px solid rgba(255,255,255,0.6)",
                                animation: "bounce 2s ease-in-out infinite",
                            }}>
                                {cfg.emoji}
                            </div>
                            <div className="level-badge" style={{
                                position: "absolute", bottom: -4, right: -8,
                                background: "linear-gradient(135deg,#FFD700,#FF8C00)",
                                borderRadius: 20, padding: "3px 10px",
                                fontFamily: "'Fredoka One', cursive",
                                fontSize: 12, color: "white",
                                border: "2px solid white",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                            }}>
                                LVL {difficultyOrder.indexOf(currentDifficulty) + 1}
                            </div>
                        </div>

                        <h1 style={{
                            fontFamily: "'Fredoka One', cursive",
                            fontSize: "2.6rem", margin: "0 0 4px",
                            color: "white",
                            textShadow: "2px 3px 0px rgba(0,0,0,0.2)",
                        }}>
                            Hi, {authUser.nickname || authUser.name || "Superstar"}! 👋
                        </h1>

                        {authUser.grade_level && authUser.section && (
                            <p style={{
                                fontFamily: "'Nunito', sans-serif",
                                fontSize: 16, color: "rgba(255,255,255,0.85)",
                                margin: "0 0 16px",
                            }}>
                                🏫 {authUser.grade_level} — Section {authUser.section}
                            </p>
                        )}

                        {/* Current level pill */}
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            background: cfg.bg,
                            borderRadius: 50, padding: "8px 24px",
                            boxShadow: `0 4px 16px ${cfg.color}66`,
                            border: "2px solid rgba(255,255,255,0.4)",
                            marginBottom: 24,
                        }}>
                            <span style={{ fontSize: 20 }}>{cfg.emoji}</span>
                            <span style={{
                                fontFamily: "'Fredoka One', cursive",
                                fontSize: 16, color: "white",
                            }}>
                                Current Level: {currentDifficulty}
                            </span>
                        </div>

                        {/* Hard level congratulations */}
                        {currentDifficulty === "Hard" && (
                            <div style={{
                                background: "linear-gradient(135deg,rgba(255,215,0,0.3),rgba(255,140,0,0.3))",
                                border: "2px solid rgba(255,215,0,0.6)",
                                borderRadius: 16, padding: "12px 20px",
                                marginBottom: 20,
                            }}>
                                <p style={{
                                    fontFamily: "'Fredoka One', cursive",
                                    fontSize: 16, color: "#FFD700",
                                    margin: 0,
                                    textShadow: "1px 1px 4px rgba(0,0,0,0.3)",
                                }}>
                                    🏆 WOW! You reached HARD level! You're a CHAMPION! 🏆
                                </p>
                            </div>
                        )}

                        {/* Level roadmap */}
                        <LevelRoadmap currentDifficulty={currentDifficulty} />
                    </div>

                    {/* ── NEXT QUIZ CARD ── */}
                    {!showAllQuizzes && availableQuiz ? (
                        <div
                            className="dash-card-enter"
                            style={{
                                width: "100%",
                                borderRadius: 32,
                                background: "rgba(255,255,255,0.92)",
                                boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
                                border: "4px solid rgba(255,255,255,0.8)",
                                overflow: "hidden",
                                animationDelay: "0.15s",
                            }}
                        >
                            {/* Rainbow top bar */}
                            <div style={{
                                height: 10,
                                background: "linear-gradient(90deg,#FF6B6B,#FFD93D,#6BCB77,#4D96FF,#FF6B6B)",
                                backgroundSize: "200% auto",
                                animation: "shimmer 3s linear infinite",
                            }} />

                            <div style={{ padding: "32px 36px", textAlign: "center" }}>
                                <div style={{ fontSize: 72, marginBottom: 8, animation: "floatY 3s ease-in-out infinite" }}>
                                    🎯
                                </div>

                                <h2 style={{
                                    fontFamily: "'Fredoka One', cursive",
                                    fontSize: "1.8rem", color: "#333", margin: "0 0 4px",
                                }}>
                                    Your Next Quest!
                                </h2>

                                <div style={{
                                    display: "inline-block",
                                    background: cfg.bg,
                                    borderRadius: 50, padding: "4px 18px",
                                    fontFamily: "'Fredoka One', cursive",
                                    fontSize: 14, color: "white",
                                    marginBottom: 16,
                                    boxShadow: `0 3px 10px ${cfg.color}55`,
                                }}>
                                    ⚡ {currentDifficulty} Level
                                </div>

                                <h3 style={{
                                    fontFamily: "'Fredoka One', cursive",
                                    fontSize: "1.4rem", color: "#444", margin: "0 0 8px",
                                }}>
                                    📚 {availableQuiz.title}
                                </h3>

                                {availableQuiz.instructions && (
                                    <p style={{
                                        color: "#888", fontSize: 15, marginBottom: 20,
                                        fontStyle: "italic", maxWidth: 420, margin: "0 auto 20px",
                                    }}>
                                        {availableQuiz.instructions}
                                    </p>
                                )}

                                <div style={{
                                    display: "flex", gap: 16, justifyContent: "center",
                                    flexWrap: "wrap", marginBottom: 28,
                                }}>
                                    <div style={{
                                        background: "#f0f9ff",
                                        borderRadius: 16, padding: "12px 20px",
                                        border: "2px solid #bae6fd",
                                    }}>
                                        <div style={{ fontSize: 24, marginBottom: 4 }}>❓</div>
                                        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: "#0369a1" }}>
                                            {availableQuiz.questions?.length || 0}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#888" }}>Questions</div>
                                    </div>
                                    {availableQuiz.time_limit && (
                                        <div style={{
                                            background: "#fef9c3",
                                            borderRadius: 16, padding: "12px 20px",
                                            border: "2px solid #fde047",
                                        }}>
                                            <div style={{ fontSize: 24, marginBottom: 4 }}>⏱</div>
                                            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: "#a16207" }}>
                                                {availableQuiz.time_limit}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#888" }}>Minutes</div>
                                        </div>
                                    )}
                                    <div style={{
                                        background: "#fdf4ff",
                                        borderRadius: 16, padding: "12px 20px",
                                        border: "2px solid #e9d5ff",
                                    }}>
                                        <div style={{ fontSize: 24, marginBottom: 4 }}>{cfg.emoji}</div>
                                        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 14, color: "#7c3aed" }}>
                                            {cfg.label}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#888" }}>Difficulty</div>
                                    </div>
                                </div>

                                <button
                                    className="kid-btn-dash"
                                    onClick={() => startSpecificQuiz(availableQuiz.id)}
                                    style={{
                                        background: "linear-gradient(135deg,#FF9F43,#FF6B6B)",
                                        color: "white",
                                        padding: "16px 52px",
                                        fontSize: "1.5rem",
                                        boxShadow: "0 8px 0 #c0392b, 0 12px 30px rgba(255,107,107,0.45)",
                                        animation: "pulse 1.5s ease infinite",
                                    }}
                                >
                                    🚀 Let's Go!
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* ── ALL QUIZZES / GRADES VIEW ── */
                        <div
                            className="dash-card-enter"
                            style={{
                                width: "100%",
                                borderRadius: 32,
                                background: "rgba(255,255,255,0.92)",
                                boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
                                border: "4px solid rgba(255,255,255,0.8)",
                                overflow: "hidden",
                                animationDelay: "0.15s",
                            }}
                        >
                            <div style={{
                                height: 10,
                                background: "linear-gradient(90deg,#FF6B6B,#FFD93D,#6BCB77,#4D96FF,#FF6B6B)",
                                backgroundSize: "200% auto",
                                animation: "shimmer 3s linear infinite",
                            }} />

                            <div style={{ padding: "32px 36px" }}>
                                <div style={{ textAlign: "center", marginBottom: 32 }}>
                                    <div style={{ fontSize: 64, marginBottom: 12, animation: "floatY 3s ease-in-out infinite" }}>
                                        {currentDifficulty === "Hard" ? "🏆" : "📚"}
                                    </div>
                                    <h2 style={{
                                        fontFamily: "'Fredoka One', cursive",
                                        fontSize: "1.9rem", color: "#333", margin: "0 0 8px",
                                    }}>
                                        {currentDifficulty === "Hard" ? "Your Grades & Results!" : "All Quizzes"}
                                    </h2>
                                    <p style={{ color: "#888", fontSize: 15, margin: 0 }}>
                                        {currentDifficulty === "Hard"
                                            ? "See how amazing you did! 🌟 Review your answers and scores!"
                                            : "Pick a quiz and show what you know! 💪"}
                                    </p>
                                </div>

                                {allQuizzes && difficultyOrder.map((difficulty, dIdx) => {
                                    const quizzesInDiff = allQuizzes[difficulty];
                                    if (!quizzesInDiff || quizzesInDiff.length === 0) return null;
                                    const dcfg = difficultyConfig[difficulty];

                                    return (
                                        <div key={difficulty} style={{ marginBottom: 32, animation: `slideUp 0.4s ${dIdx * 0.1}s ease both` }}>
                                            {/* Section header */}
                                            <div style={{
                                                display: "flex", alignItems: "center", gap: 12,
                                                marginBottom: 16, padding: "14px 20px",
                                                background: dcfg.bg,
                                                borderRadius: 16,
                                                boxShadow: `0 4px 16px ${dcfg.color}44`,
                                            }}>
                                                <span style={{ fontSize: 28 }}>{dcfg.emoji}</span>
                                                <div>
                                                    <h3 style={{
                                                        fontFamily: "'Fredoka One', cursive",
                                                        fontSize: 18, color: "white", margin: 0,
                                                    }}>
                                                        {difficulty} Level
                                                    </h3>
                                                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                                                        {quizzesInDiff.length} quiz{quizzesInDiff.length !== 1 ? "zes" : ""}
                                                    </span>
                                                </div>
                                            </div>

                                            {quizzesInDiff.map(quiz => renderQuizCard(quiz, difficulty))}
                                        </div>
                                    );
                                })}

                                {availableQuiz && currentDifficulty !== "Hard" && (
                                    <div style={{ textAlign: "center", marginTop: 8 }}>
                                        <button
                                            className="kid-btn-dash"
                                            onClick={() => setShowAllQuizzes(false)}
                                            style={{
                                                background: "linear-gradient(135deg,#667eea,#764ba2)",
                                                color: "white", padding: "12px 32px",
                                                fontSize: "1rem",
                                                boxShadow: "0 4px 16px rgba(102,126,234,0.5)",
                                            }}
                                        >
                                            ← Back to Next Quiz
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── FOOTER ENCOURAGEMENT ── */}
                    <div style={{ textAlign: "center", paddingBottom: 20 }}>
                        <p style={{
                            fontFamily: "'Fredoka One', cursive",
                            fontSize: "1.3rem",
                            color: "rgba(255,255,255,0.9)",
                            textShadow: "1px 2px 4px rgba(0,0,0,0.3)",
                            margin: 0,
                            animation: "bounce 3s ease-in-out infinite",
                        }}>
                            {currentDifficulty === "Hard"
                                ? "🌟 You're a SUPERSTAR! Keep shining! 🌟"
                                : "💪 You're doing AMAZING! Keep going! 🚀"}
                        </p>
                        <div style={{ fontSize: 28, marginTop: 8, animation: "wiggle 2s ease-in-out infinite" }}>
                            🐣 🌈 ⭐ 🎯 🎊
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default StudentDashboard;