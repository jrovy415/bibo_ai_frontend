import { useEffect, useState } from "react";
import { Spin } from "antd";
import axios from "../../plugins/axios";
import { useLocation, useNavigate } from "react-router-dom";

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
        @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50%       { transform: scale(1.1); }
        }
        @keyframes popIn {
            0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
            70%  { transform: scale(1.12) rotate(2deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes shimmer {
            0%   { background-position: -200% center; }
            100% { background-position: 200% center; }
        }
        @keyframes gradientShift {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes confettiFall {
            0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes cloudDrift {
            0%   { transform: translateX(-150px); opacity: 0; }
            10%  { opacity: 0.5; }
            90%  { opacity: 0.5; }
            100% { transform: translateX(110vw); opacity: 0; }
        }
        @keyframes spinStar {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
        }
        @keyframes wiggle {
            0%, 100% { transform: rotate(-6deg); }
            50%       { transform: rotate(6deg); }
        }
        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255,200,50,0.6); }
            50%       { box-shadow: 0 0 0 18px rgba(255,200,50,0); }
        }
        @keyframes scoreCount {
            from { transform: scale(0.5); opacity: 0; }
            to   { transform: scale(1); opacity: 1; }
        }
        @keyframes rainbowBg {
            0%,100% { filter: hue-rotate(0deg); }
            50%     { filter: hue-rotate(30deg); }
        }

        .kid-btn-finish {
            font-family: 'Fredoka One', cursive !important;
            border: none !important;
            border-radius: 50px !important;
            cursor: pointer;
            transition: transform 0.15s ease, box-shadow 0.15s ease !important;
            outline: none;
        }
        .kid-btn-finish:hover {
            transform: scale(1.08) translateY(-3px) !important;
        }
        .kid-btn-finish:active {
            transform: scale(0.95) !important;
        }
        .answer-row-correct {
            background: linear-gradient(135deg, #f0fff4, #dcfce7) !important;
            border-left: 5px solid #22c55e !important;
            animation: slideUp 0.3s ease both;
        }
        .answer-row-wrong {
            background: linear-gradient(135deg, #fff1f2, #ffe4e6) !important;
            border-left: 5px solid #ef4444 !important;
            animation: slideUp 0.3s ease both;
        }
    `}</style>
);

/* ─────────────────────────────────────────────
   Confetti
───────────────────────────────────────────── */
const CONFETTI_COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF922B","#CC5DE8","#F06595","#FFD700"];
const Confetti = () => {
    const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 8 + Math.random() * 12,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
    }));
    return (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
            {pieces.map(p => (
                <div key={p.id} style={{
                    position: "absolute", left: `${p.left}%`, top: 0,
                    width: p.size, height: p.size,
                    backgroundColor: p.color,
                    borderRadius: Math.random() > 0.5 ? "50%" : "3px",
                    animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
                }} />
            ))}
        </div>
    );
};

/* ─────────────────────────────────────────────
   Clouds
───────────────────────────────────────────── */
const Clouds = () => {
    const clouds = [
        { top: "5%",  size: 90,  dur: 25, delay: 0  },
        { top: "20%", size: 110, dur: 30, delay: 6  },
        { top: "65%", size: 70,  dur: 20, delay: 3  },
        { top: "80%", size: 95,  dur: 28, delay: 11 },
    ];
    return (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
            {clouds.map((c, i) => (
                <div key={i} style={{
                    position: "absolute", top: c.top, left: 0,
                    width: c.size, height: c.size * 0.55,
                    background: "rgba(255,255,255,0.45)",
                    borderRadius: "50%",
                    animation: `cloudDrift ${c.dur}s ${c.delay}s linear infinite`,
                    filter: "blur(5px)",
                }} />
            ))}
        </div>
    );
};

/* ─────────────────────────────────────────────
   Score Ring
───────────────────────────────────────────── */
const ScoreRing = ({ score, total }) => {
    const pct         = total > 0 ? (score / total) * 100 : 0;
    const radius      = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDash  = (pct / 100) * circumference;

    const getColor = () => {
        if (pct >= 80) return "#22c55e";
        if (pct >= 50) return "#f59e0b";
        return "#ef4444";
    };

    const getEmoji = () => {
        if (pct === 100) return "🏆";
        if (pct >= 80)   return "⭐";
        if (pct >= 50)   return "😊";
        return "💪";
    };

    const getMessage = () => {
        if (pct === 100) return "PERFECT!";
        if (pct >= 80)   return "Excellent!";
        if (pct >= 50)   return "Great Job!";
        return "Keep Trying!";
    };

    return (
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={180} height={180} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={90} cy={90} r={radius}
                    fill="none" stroke="rgba(0,0,0,0.08)"
                    strokeWidth={16} />
                <circle cx={90} cy={90} r={radius}
                    fill="none"
                    stroke={getColor()}
                    strokeWidth={16}
                    strokeLinecap="round"
                    strokeDasharray={`${strokeDash} ${circumference}`}
                    style={{
                        transition: "stroke-dasharray 1.5s ease",
                        filter: `drop-shadow(0 0 8px ${getColor()}88)`,
                    }}
                />
            </svg>
            <div style={{
                position: "absolute",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
            }}>
                <span style={{ fontSize: 36, animation: "bounce 1.5s ease-in-out infinite" }}>
                    {getEmoji()}
                </span>
                <span style={{
                    fontFamily: "'Fredoka One', cursive",
                    fontSize: 28, color: getColor(),
                    lineHeight: 1,
                    animation: "scoreCount 0.6s 0.3s ease both",
                }}>
                    {score}/{total}
                </span>
                <span style={{
                    fontFamily: "'Fredoka One', cursive",
                    fontSize: 13, color: "#888",
                }}>
                    {getMessage()}
                </span>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Star Rating
───────────────────────────────────────────── */
const StarRating = ({ pct }) => {
    const stars = pct === 100 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
    return (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", margin: "8px 0" }}>
            {[0,1,2].map(i => (
                <span key={i} style={{
                    fontSize: 40,
                    filter: i < stars ? "none" : "grayscale(1) opacity(0.3)",
                    animation: i < stars ? `spinStar ${2 + i * 0.5}s linear infinite` : "none",
                    display: "inline-block",
                }}>⭐</span>
            ))}
        </div>
    );
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const StudentFinishedQuiz = () => {
    const location  = useLocation();
    const navigate  = useNavigate();
    const { attemptId } = location.state || {};

    const [loading,   setLoading]   = useState(true);
    const [quizData,  setQuizData]  = useState(null);
    const [answers,   setAnswers]   = useState([]);
    const [score,     setScore]     = useState(0);
    const [showAll,   setShowAll]   = useState(false);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res             = await axios.get(`/quiz-attempts/${attemptId}`);
                const { quiz, answers, score } = res.data.data;
                setQuizData(quiz);
                setAnswers(answers);
                setScore(score ?? answers.filter(a => a.is_correct).length);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [attemptId]);

    if (loading) return (
        <>
            <GlobalStyles />
            <div style={{
                width: "100vw", height: "100vh",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg,#a8edea,#fed6e3,#ffecd2)",
                backgroundSize: "400% 400%",
                animation: "gradientShift 8s ease infinite",
            }}>
                <div style={{ fontSize: 80, animation: "bounce 0.8s ease infinite" }}>🦉</div>
                <Spin size="large" style={{ marginTop: 20 }} />
                <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: "1.5rem", color: "#5b4e75", marginTop: 16 }}>
                    Loading your results…
                </p>
            </div>
        </>
    );

    if (!quizData) return (
        <>
            <GlobalStyles />
            <div style={{ textAlign: "center", marginTop: 80, fontFamily: "'Fredoka One', cursive", fontSize: "1.8rem", color: "#ff6b6b" }}>
                😕 Results not found!
            </div>
        </>
    );

    const totalPoints = quizData.questions?.reduce((s, q) => s + (q.points || 1), 0) || answers.length;
    const pct         = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const isPerfect   = score === totalPoints;
    const isIntro     = quizData.difficulty === "Introduction";

    const mappedAnswers = answers.map(a => ({
        key:      a.id,
        question: a.question?.question_text || "",
        yours:    a.choice_id !== null
                      ? a.choice?.choice_text
                      : a.choice_string || "No Answer",
        correct:  a.question?.choices?.find(c => c.is_correct)?.choice_text || "N/A",
        points:   a.is_correct ? (a.question?.points || 1) : 0,
        isCorrect: a.is_correct,
    }));

    const shown = showAll ? mappedAnswers : mappedAnswers.slice(0, 5);

    const getBgGradient = () => {
        if (pct === 100) return "linear-gradient(135deg,#667eea,#764ba2,#f093fb)";
        if (pct >= 70)   return "linear-gradient(135deg,#11998e,#38ef7d,#11998e)";
        if (pct >= 40)   return "linear-gradient(135deg,#f7971e,#ffd200,#f7971e)";
        return              "linear-gradient(135deg,#fc466b,#3f5efb,#fc466b)";
    };

    return (
        <>
            <GlobalStyles />
            {isPerfect && <Confetti />}

            <div style={{
                width: "100%", minHeight: "100vh",
                background: getBgGradient(),
                backgroundSize: "300% 300%",
                animation: "gradientShift 10s ease infinite",
                position: "relative", overflow: "hidden",
                paddingBottom: 60,
            }}>
                {/* Overlay */}
                <div style={{
                    position: "fixed", inset: 0,
                    background: "rgba(0,0,0,0.2)",
                    pointerEvents: "none", zIndex: 0,
                }} />
                <Clouds />

                {/* Floating emojis */}
                {["🎉","🌟","🎊","⭐","🎈","💫"].map((e, i) => (
                    <div key={i} style={{
                        position: "fixed",
                        top: `${10 + i * 14}%`,
                        left: i % 2 === 0 ? `${2 + i}%` : `${88 - i}%`,
                        fontSize: 28 + (i % 3) * 6,
                        animation: `floatY ${3 + i * 0.4}s ${i * 0.3}s ease-in-out infinite`,
                        opacity: 0.7, pointerEvents: "none", zIndex: 0,
                    }}>{e}</div>
                ))}

                <div style={{
                    position: "relative", zIndex: 1,
                    maxWidth: 780, margin: "0 auto",
                    padding: "40px 20px",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 24,
                }}>

                    {/* ── HERO RESULT CARD ── */}
                    <div style={{
                        width: "100%", borderRadius: 32,
                        background: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(20px)",
                        border: "3px solid rgba(255,255,255,0.4)",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                        padding: "40px 36px",
                        textAlign: "center",
                        animation: "popIn 0.6s ease both",
                        position: "relative", overflow: "hidden",
                    }}>
                        {/* Deco circles */}
                        <div style={{
                            position: "absolute", top: -50, right: -50,
                            width: 180, height: 180, borderRadius: "50%",
                            background: "rgba(255,255,255,0.1)",
                        }} />
                        <div style={{
                            position: "absolute", bottom: -40, left: -40,
                            width: 140, height: 140, borderRadius: "50%",
                            background: "rgba(255,255,255,0.08)",
                        }} />

                        {/* Quiz title */}
                        <h1 style={{
                            fontFamily: "'Fredoka One', cursive",
                            fontSize: "2.2rem", color: "white",
                            margin: "0 0 4px",
                            textShadow: "2px 3px 0 rgba(0,0,0,0.2)",
                        }}>
                            {isPerfect ? "🏆 Perfect Score! 🏆" : "🎉 Quiz Complete! 🎉"}
                        </h1>

                        <p style={{
                            fontFamily: "'Nunito', sans-serif",
                            fontSize: 16, color: "rgba(255,255,255,0.85)",
                            margin: "0 0 24px",
                        }}>
                            📚 {quizData.title} &nbsp;·&nbsp; ⚡ {quizData.difficulty}
                        </p>

                        {/* Score ring */}
                        <div style={{ margin: "0 auto 20px" }}>
                            <ScoreRing score={score} total={totalPoints} />
                        </div>

                        {/* Star rating */}
                        <StarRating pct={pct} />

                        {/* Percentage badge */}
                        <div style={{
                            display: "inline-block",
                            background: "rgba(255,255,255,0.25)",
                            border: "2px solid rgba(255,255,255,0.5)",
                            borderRadius: 50, padding: "6px 20px",
                            fontFamily: "'Fredoka One', cursive",
                            fontSize: 18, color: "white",
                            marginTop: 12,
                            backdropFilter: "blur(10px)",
                        }}>
                            {pct}% Correct!
                        </div>

                        {isPerfect && (
                            <div style={{
                                marginTop: 16,
                                background: "rgba(255,215,0,0.3)",
                                border: "2px solid rgba(255,215,0,0.6)",
                                borderRadius: 16, padding: "10px 20px",
                            }}>
                                <p style={{
                                    fontFamily: "'Fredoka One', cursive",
                                    fontSize: 16, color: "#FFD700",
                                    margin: 0, textShadow: "1px 1px 4px rgba(0,0,0,0.3)",
                                }}>
                                    🌟 AMAZING! You got everything right! You're a GENIUS! 🌟
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── STATS ROW ── */}
                    <div style={{
                        width: "100%", display: "flex",
                        gap: 16, flexWrap: "wrap",
                        justifyContent: "center",
                        animation: "slideUp 0.5s 0.2s ease both",
                    }}>
                        {[
                            { icon: "✅", label: "Correct",   value: mappedAnswers.filter(a => a.isCorrect).length,  color: "#22c55e", bg: "#f0fff4" },
                            { icon: "❌", label: "Wrong",     value: mappedAnswers.filter(a => !a.isCorrect).length, color: "#ef4444", bg: "#fff1f2" },
                            { icon: "🎯", label: "Score",     value: `${score}/${totalPoints}`,                      color: "#f59e0b", bg: "#fffbeb" },
                            { icon: "📊", label: "Accuracy",  value: `${pct}%`,                                      color: "#6366f1", bg: "#eef2ff" },
                        ].map((stat, i) => (
                            <div key={i} style={{
                                background: "rgba(255,255,255,0.92)",
                                borderRadius: 20, padding: "16px 24px",
                                textAlign: "center", flex: "1 1 120px",
                                boxShadow: `0 6px 20px ${stat.color}33`,
                                border: `2px solid ${stat.color}44`,
                                animation: `slideUp 0.4s ${0.1 * i + 0.3}s ease both`,
                            }}>
                                <div style={{ fontSize: 28, marginBottom: 4 }}>{stat.icon}</div>
                                <div style={{
                                    fontFamily: "'Fredoka One', cursive",
                                    fontSize: 22, color: stat.color,
                                }}>{stat.value}</div>
                                <div style={{ fontSize: 12, color: "#888" }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── ANSWERS REVIEW ── */}
                    <div style={{
                        width: "100%",
                        borderRadius: 28,
                        background: "rgba(255,255,255,0.92)",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
                        border: "3px solid rgba(255,255,255,0.8)",
                        overflow: "hidden",
                        animation: "slideUp 0.5s 0.4s ease both",
                    }}>
                        {/* Rainbow top bar */}
                        <div style={{
                            height: 8,
                            background: "linear-gradient(90deg,#FF6B6B,#FFD93D,#6BCB77,#4D96FF,#FF6B6B)",
                            backgroundSize: "200% auto",
                            animation: "shimmer 3s linear infinite",
                        }} />

                        <div style={{ padding: "24px 28px" }}>
                            <h2 style={{
                                fontFamily: "'Fredoka One', cursive",
                                fontSize: "1.6rem", color: "#333",
                                margin: "0 0 20px",
                                display: "flex", alignItems: "center", gap: 10,
                            }}>
                                📋 Question Review
                            </h2>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {shown.map((a, idx) => (
                                    <div
                                        key={a.key}
                                        className={a.isCorrect ? "answer-row-correct" : "answer-row-wrong"}
                                        style={{
                                            borderRadius: 16, padding: "16px 20px",
                                            animationDelay: `${idx * 0.06}s`,
                                        }}
                                    >
                                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                            {/* Number badge */}
                                            <div style={{
                                                width: 36, height: 36,
                                                borderRadius: "50%", flexShrink: 0,
                                                background: a.isCorrect
                                                    ? "linear-gradient(135deg,#22c55e,#16a34a)"
                                                    : "linear-gradient(135deg,#ef4444,#dc2626)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontFamily: "'Fredoka One', cursive",
                                                fontSize: 15, color: "white",
                                                boxShadow: a.isCorrect
                                                    ? "0 3px 10px rgba(34,197,94,0.4)"
                                                    : "0 3px 10px rgba(239,68,68,0.4)",
                                            }}>
                                                {a.isCorrect ? "✓" : `${idx + 1}`}
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                {/* Question */}
                                                <p style={{
                                                    fontFamily: "'Nunito', sans-serif",
                                                    fontWeight: 700, fontSize: 15,
                                                    color: "#333", margin: "0 0 8px",
                                                }}>
                                                    {a.question}
                                                </p>

                                                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                                    {/* Your answer */}
                                                    <div style={{
                                                        background: a.isCorrect
                                                            ? "rgba(34,197,94,0.1)"
                                                            : "rgba(239,68,68,0.1)",
                                                        borderRadius: 10, padding: "6px 12px",
                                                        border: `1.5px solid ${a.isCorrect ? "#22c55e44" : "#ef444444"}`,
                                                    }}>
                                                        <span style={{ fontSize: 12, color: "#888" }}>Your answer: </span>
                                                        <span style={{
                                                            fontFamily: "'Fredoka One', cursive",
                                                            fontSize: 14,
                                                            color: a.isCorrect ? "#16a34a" : "#dc2626",
                                                        }}>
                                                            {a.isCorrect ? "✅ " : "❌ "}{a.yours}
                                                        </span>
                                                    </div>

                                                    {/* Correct answer (only show if wrong) */}
                                                    {!a.isCorrect && (
                                                        <div style={{
                                                            background: "rgba(34,197,94,0.1)",
                                                            borderRadius: 10, padding: "6px 12px",
                                                            border: "1.5px solid #22c55e44",
                                                        }}>
                                                            <span style={{ fontSize: 12, color: "#888" }}>Correct: </span>
                                                            <span style={{
                                                                fontFamily: "'Fredoka One', cursive",
                                                                fontSize: 14, color: "#16a34a",
                                                            }}>
                                                                ✅ {a.correct}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Points */}
                                            <div style={{
                                                flexShrink: 0,
                                                background: a.isCorrect
                                                    ? "linear-gradient(135deg,#FFD700,#FF8C00)"
                                                    : "rgba(0,0,0,0.08)",
                                                borderRadius: 12, padding: "6px 12px",
                                                textAlign: "center",
                                            }}>
                                                <div style={{
                                                    fontFamily: "'Fredoka One', cursive",
                                                    fontSize: 16,
                                                    color: a.isCorrect ? "white" : "#aaa",
                                                }}>
                                                    {a.isCorrect ? `+${a.points}` : "0"}
                                                </div>
                                                <div style={{ fontSize: 10, color: a.isCorrect ? "rgba(255,255,255,0.8)" : "#bbb" }}>
                                                    pts
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Show more / less */}
                            {mappedAnswers.length > 5 && (
                                <button
                                    className="kid-btn-finish"
                                    onClick={() => setShowAll(p => !p)}
                                    style={{
                                        width: "100%", marginTop: 16,
                                        background: "linear-gradient(135deg,#667eea,#764ba2)",
                                        color: "white", padding: "12px",
                                        fontSize: "1rem",
                                        boxShadow: "0 4px 16px rgba(102,126,234,0.4)",
                                    }}
                                >
                                    {showAll
                                        ? "⬆️ Show Less"
                                        : `⬇️ Show All ${mappedAnswers.length} Questions`}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── ACTION BUTTONS ── */}
                    <div style={{
                        display: "flex", gap: 16, flexWrap: "wrap",
                        justifyContent: "center",
                        animation: "slideUp 0.5s 0.6s ease both",
                    }}>
                        {isPerfect || isIntro ? (
                            <button
                                className="kid-btn-finish"
                                onClick={() => navigate("/student")}
                                style={{
                                    background: "linear-gradient(135deg,#22c55e,#16a34a)",
                                    color: "white", padding: "16px 48px",
                                    fontSize: "1.4rem",
                                    boxShadow: "0 8px 0 #15803d, 0 12px 28px rgba(34,197,94,0.45)",
                                    animation: "pulse 1.5s ease infinite",
                                }}
                            >
                                🏠 Go to Dashboard!
                            </button>
                        ) : (
                            <>
                                <button
                                    className="kid-btn-finish"
                                    onClick={() => navigate("/student/quiz", { state: { quizId: quizData.id } })}
                                    style={{
                                        background: "linear-gradient(135deg,#FF9F43,#FF6B6B)",
                                        color: "white", padding: "16px 40px",
                                        fontSize: "1.3rem",
                                        boxShadow: "0 8px 0 #c0392b, 0 12px 28px rgba(255,107,107,0.45)",
                                    }}
                                >
                                    🔄 Try Again!
                                </button>
                                <button
                                    className="kid-btn-finish"
                                    onClick={() => navigate("/student")}
                                    style={{
                                        background: "linear-gradient(135deg,#667eea,#764ba2)",
                                        color: "white", padding: "16px 40px",
                                        fontSize: "1.3rem",
                                        boxShadow: "0 8px 0 #4c1d95, 0 12px 28px rgba(102,126,234,0.45)",
                                    }}
                                >
                                    🏠 Dashboard
                                </button>
                            </>
                        )}
                    </div>

                    {/* Encouragement footer */}
                    <div style={{ textAlign: "center", paddingBottom: 10 }}>
                        <p style={{
                            fontFamily: "'Fredoka One', cursive",
                            fontSize: "1.2rem",
                            color: "rgba(255,255,255,0.9)",
                            textShadow: "1px 2px 4px rgba(0,0,0,0.3)",
                            margin: 0,
                            animation: "bounce 3s ease-in-out infinite",
                        }}>
                            {isPerfect
                                ? "🌟 You are INCREDIBLE! 100% PERFECT! 🌟"
                                : pct >= 70
                                    ? "⭐ Awesome work! You're getting better every day! ⭐"
                                    : "💪 Don't give up! Practice makes perfect! 💪"}
                        </p>
                        <div style={{ fontSize: 24, marginTop: 8, animation: "wiggle 2s ease-in-out infinite" }}>
                            🐣 🌈 ⭐ 🎯 🎊
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default StudentFinishedQuiz;