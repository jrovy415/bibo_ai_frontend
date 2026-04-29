import { useEffect, useRef, useState, useCallback } from "react";
import { Spin, message } from "antd";
import { AudioOutlined, SoundOutlined, PauseOutlined } from "@ant-design/icons";
import axios, { nonApi } from "../../plugins/axios";
import { useAuth } from "../../composables/useAuth";
import { useNavigate } from "react-router-dom";
import QuizMaterial from "../components/QuizMaterial";
import { speakText, cancelSpeech } from "../ttsUtil";

const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; font-family: 'Nunito', sans-serif; }

        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(-2deg); }
            50%       { transform: translateY(-18px) rotate(2deg); }
        }
        @keyframes floatB {
            0%, 100% { transform: translateY(0px) rotate(3deg); }
            50%       { transform: translateY(-12px) rotate(-3deg); }
        }
        @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50%       { transform: scale(1.08); }
        }
        @keyframes pop {
            0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
            70%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255,200,0,0.7); }
            50%       { box-shadow: 0 0 0 18px rgba(255,200,0,0); }
        }
        @keyframes listeningRing {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255,80,80,0.6); }
            50%       { box-shadow: 0 0 0 20px rgba(255,80,80,0); }
        }
        @keyframes confettiFall {
            0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes rainbowBg {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes cloudDrift {
            0%   { transform: translateX(-120px); opacity: 0; }
            10%  { opacity: 0.8; }
            90%  { opacity: 0.8; }
            100% { transform: translateX(110vw); opacity: 0; }
        }
        @keyframes timerPulse {
            0%, 100% { transform: scale(1); }
            50%       { transform: scale(1.12); }
        }
        @keyframes timerShake {
            0%, 100% { transform: translateX(0); }
            20%       { transform: translateX(-4px); }
            40%       { transform: translateX(4px); }
            60%       { transform: translateX(-4px); }
            80%       { transform: translateX(4px); }
        }
        @keyframes countdownPop {
            0%   { transform: scale(0.7); opacity: 0; }
            60%  { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }

        .kid-btn {
            font-family: 'Fredoka One', cursive !important;
            font-size: 1.4rem !important;
            border: none !important;
            border-radius: 50px !important;
            cursor: pointer;
            transition: transform 0.15s ease, box-shadow 0.15s ease !important;
            letter-spacing: 0.5px;
        }
        .kid-btn:not(:disabled):hover  { transform: scale(1.07) translateY(-2px) !important; }
        .kid-btn:not(:disabled):active { transform: scale(0.95) !important; }
        .kid-btn:disabled { opacity: 0.5 !important; cursor: not-allowed !important; }

        .question-card { animation: pop 0.5s cubic-bezier(.17,.67,.35,1.3) both; }
        .listening-indicator { animation: listeningRing 1s ease infinite; }
        .start-btn-glow { animation: pulse 1.5s ease infinite; }
        .mascot-float  { animation: float  3s ease-in-out infinite; }
        .mascot-floatB { animation: floatB 4s ease-in-out infinite; }
    `}</style>
);

const CONFETTI_COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF922B","#CC5DE8","#F06595"];
const ConfettiBlast = () => {
    const pieces = Array.from({ length: 30 }, (_, i) => ({
        id: i, left: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 8 + Math.random() * 10,
        delay: Math.random() * 1.5,
        duration: 2.5 + Math.random() * 2,
    }));
    return (
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9999 }}>
            {pieces.map(p => (
                <div key={p.id} style={{
                    position:"absolute", left:`${p.left}%`, top:0,
                    width:p.size, height:p.size, backgroundColor:p.color,
                    borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                    animation:`confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
                }} />
            ))}
        </div>
    );
};

const Clouds = () => {
    const clouds = [
        { top:"8%",  size:80,  dur:22, delay:0  },
        { top:"18%", size:110, dur:30, delay:8  },
        { top:"55%", size:70,  dur:18, delay:4  },
        { top:"72%", size:95,  dur:26, delay:14 },
        { top:"35%", size:60,  dur:20, delay:10 },
    ];
    return (
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
            {clouds.map((c, i) => (
                <div key={i} style={{
                    position:"absolute", top:c.top, left:0,
                    width:c.size, height:c.size * 0.6,
                    background:"rgba(255,255,255,0.55)", borderRadius:"50%",
                    animation:`cloudDrift ${c.dur}s ${c.delay}s linear infinite`,
                    filter:"blur(4px)",
                }} />
            ))}
        </div>
    );
};

const Stars = () => {
    const items = ["⭐","🌟","✨","💫","⭐","🌟","✨"];
    return (
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
            {items.map((s, i) => (
                <div key={i} style={{
                    position:"absolute",
                    top:`${10 + i * 12}%`,
                    left: i % 2 === 0 ? `${3 + i * 2}%` : `${85 - i * 2}%`,
                    fontSize: 22 + (i % 3) * 8,
                    animation:`float ${3 + i * 0.4}s ease-in-out infinite`,
                    animationDelay:`${i * 0.3}s`,
                    opacity:0.7,
                }}>{s}</div>
            ))}
        </div>
    );
};

const ProgressStars = ({ current, total }) => (
    <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap", marginBottom:16 }}>
        {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
                fontSize: i < current ? 28 : 22,
                filter: i < current ? "none" : "grayscale(1) opacity(0.4)",
                transition: "all 0.3s ease",
                transform: i === current - 1 ? "scale(1.3)" : "scale(1)",
            }}>
                {i < current ? "⭐" : "☆"}
            </div>
        ))}
    </div>
);

const CountdownTimer = ({ totalSeconds, onExpire, paused }) => {
    const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
    const intervalRef = useRef(null);

    useEffect(() => { setSecondsLeft(totalSeconds); }, [totalSeconds]);

    useEffect(() => {
        clearInterval(intervalRef.current);
        if (paused) return;
        if (secondsLeft <= 0) { onExpire?.(); return; }
        intervalRef.current = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) { clearInterval(intervalRef.current); onExpire?.(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [totalSeconds, paused]);

    const mins   = Math.floor(secondsLeft / 60);
    const secs   = secondsLeft % 60;
    const pct    = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
    const isLow  = secondsLeft <= 60;
    const isCrit = secondsLeft <= 30;

    const barColor = isCrit
        ? "linear-gradient(90deg,#ff4444,#ff6b6b)"
        : isLow ? "linear-gradient(90deg,#ffa94d,#ffd43b)"
        : "linear-gradient(90deg,#69db7c,#38d9a9)";

    return (
        <div style={{
            width:"100%", maxWidth:640,
            background:"rgba(255,255,255,0.92)", borderRadius:20,
            padding:"10px 20px", marginBottom:10, zIndex:2,
            boxShadow: isCrit ? "0 4px 20px rgba(255,68,68,0.35)" : "0 4px 16px rgba(0,0,0,0.1)",
            border: isCrit ? "3px solid #ff4444" : "3px solid rgba(255,179,71,0.4)",
            transition:"border 0.3s, box-shadow 0.3s",
        }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontFamily:"'Fredoka One', cursive", fontSize:"1rem", color:"#5b4e75" }}>⏱ Time Remaining</span>
                <span style={{
                    fontFamily:"'Fredoka One', cursive",
                    fontSize: isCrit ? "1.6rem" : "1.3rem",
                    color: isCrit ? "#ff4444" : isLow ? "#ffa94d" : "#2f9e44",
                    animation: isCrit ? "timerShake 0.5s ease infinite" : isLow ? "timerPulse 1s ease infinite" : "none",
                    minWidth:72, textAlign:"right",
                }}>
                    {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
                </span>
            </div>
            <div style={{ width:"100%", height:12, background:"#f0f0f0", borderRadius:8, overflow:"hidden", boxShadow:"inset 0 2px 4px rgba(0,0,0,0.1)" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:barColor, borderRadius:8, transition:"width 1s linear, background 0.5s ease" }} />
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   WORD-BY-WORD SCORING HELPER
───────────────────────────────────────────── */
const scoreWordByWord = (transcript, correctText, maxPoints) => {
    const normalize = (t) =>
        t.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().split(/\s+/).filter(Boolean);
    const spokenWords  = normalize(transcript || "");
    const correctWords = normalize(correctText || "");
    if (correctWords.length === 0) return 0;
    const pool = [...correctWords];
    let matched = 0;
    for (const word of spokenWords) {
        const idx = pool.indexOf(word);
        if (idx !== -1) { matched++; pool.splice(idx, 1); }
    }
    return Math.round((matched / correctWords.length) * maxPoints);
};

// Returns 0-100 percentage for storing as word_score in reading assessments
// This avoids rounding errors when maxPoints is small (e.g. 1 point)
const scoreWordByWordPct = (transcript, correctText) => {
    const normalize = (t) =>
        t.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().split(/\s+/).filter(Boolean);
    const spokenWords  = normalize(transcript || "");
    const correctWords = normalize(correctText || "");
    if (correctWords.length === 0) return 0;
    const pool = [...correctWords];
    let matched = 0;
    for (const word of spokenWords) {
        const idx = pool.indexOf(word);
        if (idx !== -1) { matched++; pool.splice(idx, 1); }
    }
    return Math.round((matched / correctWords.length) * 100); // 0-100
};

/* ─────────────────────────────────────────────
   EXACT MATCH SCORING HELPER
───────────────────────────────────────────── */
const scoreExactMatch = (transcript, correctText, maxPoints) => {
    const norm = (t) => (t || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
    return norm(transcript) === norm(correctText) ? maxPoints : 0;
};

/* ─────────────────────────────────────────────
   COMPUTE WORD SCORE PER QUESTION
   Reads use_word_scoring from the question object.
───────────────────────────────────────────── */
const computeWordScore = (transcript, question, forceWordByWord = false) => {
    const correctChoice = question?.choices?.find(c => c.is_correct);
    if (!correctChoice) return null;
    const pts = question.points ?? 1;
    if (forceWordByWord) {
        // Reading assessment: store as 0-100 percentage to avoid rounding errors
        // e.g. 53% match on 1-point question → store 53, not Math.round(0.53*1)=1
        return scoreWordByWordPct(transcript, correctChoice.choice_text);
    } else if (question.use_word_scoring) {
        return scoreWordByWord(transcript, correctChoice.choice_text, pts);
    } else {
        return scoreExactMatch(transcript, correctChoice.choice_text, pts);
    }
};

const getPlacementLevel = (pct) => {
    if (pct >= 80) return "Expert";
    if (pct >= 60) return "Hard";
    if (pct >= 40) return "Medium";
    return "Easy";
};

// New difficulty sequence — each level has its own Post-Test
const DIFFICULTY_SEQUENCE = [
    "Easy", "EasyPostTest",
    "Medium", "MediumPostTest",
    "Hard", "HardPostTest",
    "Expert", "ExpertPostTest",
];

// Post-Test difficulties — these are terminal (quiz ends after)
const POST_TEST_DIFFICULTIES = ["EasyPostTest","MediumPostTest","HardPostTest","ExpertPostTest","PostTest"];

const isLevelPostTest = (diff) => POST_TEST_DIFFICULTIES.includes(diff);

const AutoNextCountdown = ({ seconds, isPrePost }) => (
    <div style={{ position:"fixed", inset:0, zIndex:8000, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
        <div style={{
            background: isPrePost ? "linear-gradient(135deg,#a9e34b,#2f9e44)" : "linear-gradient(135deg,#ff9f43,#ff6b6b)",
            borderRadius:"50%", width:120, height:120,
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            boxShadow:"0 8px 40px rgba(0,0,0,0.25)",
            animation:"countdownPop 0.4s cubic-bezier(.17,.67,.35,1.3) both",
        }}>
            <span style={{ fontFamily:"'Fredoka One', cursive", fontSize:"3rem", color:"white", lineHeight:1 }}>{seconds}</span>
            <span style={{ fontFamily:"'Fredoka One', cursive", fontSize:"0.75rem", color:"rgba(255,255,255,0.85)" }}>next up!</span>
        </div>
    </div>
);

const KaraokeDisplay = ({ correctText, spokenText, isListening, maxPoints }) => {
    const normalize = (t) =>
        (t || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().split(/\s+/).filter(Boolean);

    const correctWords = normalize(correctText);
    const spokenWords  = normalize(spokenText);

    const pool = [...correctWords];
    const matchedCorrectIdx = new Set();
    spokenWords.forEach((w) => {
        const i = pool.indexOf(w);
        if (i !== -1) { matchedCorrectIdx.add(i); pool[i] = null; }
    });

    const matched   = matchedCorrectIdx.size;
    const earnedPts = correctWords.length > 0 ? Math.round((matched / correctWords.length) * maxPoints) : 0;
    const pct       = correctWords.length > 0 ? Math.round((matched / correctWords.length) * 100) : 0;
    const hasSpoken = spokenWords.length > 0;

    const scorePillColor = pct >= 75
        ? { bg:"#EAF3DE", color:"#27500A" }
        : pct >= 40 ? { bg:"#FAEEDA", color:"#633806" }
        : { bg:"#FCEBEB", color:"#791F1F" };

    return (
        <div style={{
            width:"100%", background:"rgba(255,255,255,0.97)",
            borderRadius:20, padding:"16px 20px",
            border:`3px solid ${isListening ? "#ff6b6b" : "rgba(255,179,71,0.5)"}`,
            boxShadow: isListening ? "0 0 0 4px rgba(255,107,107,0.2)" : "none",
            transition:"border 0.3s, box-shadow 0.3s",
        }}>
            <div style={{
                fontFamily:"'Fredoka One', cursive",
                fontSize:"clamp(1.1rem, 2.5vw, 1.4rem)",
                color:"#5b4e75", lineHeight:1.6, textAlign:"center",
                background:"linear-gradient(135deg,rgba(255,255,255,0.8),rgba(255,249,220,0.8))",
                borderRadius:14, padding:"12px 16px", marginBottom:14,
                border:"2px dashed rgba(91,78,117,0.2)",
            }}>
                📖 {correctText}
            </div>

            <div style={{ fontFamily:"'Fredoka One', cursive", fontSize:11, color:"#888", letterSpacing:"0.08em", marginBottom:8, textTransform:"uppercase" }}>
                🗣️ Say each word — follow along!
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16, minHeight:48, alignItems:"center" }}>
                {correctWords.map((word, i) => {
                    let bg, color;
                    if (!hasSpoken)                    { bg = "rgba(0,0,0,0.06)"; color = "#888"; }
                    else if (matchedCorrectIdx.has(i)) { bg = "#EAF3DE";          color = "#27500A"; }
                    else                               { bg = "#FCEBEB";          color = "#791F1F"; }
                    return (
                        <span key={i} style={{ fontFamily:"'Fredoka One', cursive", fontSize:22, padding:"4px 14px", borderRadius:10, background:bg, color, transition:"background 0.3s, color 0.3s" }}>
                            {word}
                        </span>
                    );
                })}
                {correctWords.length === 0 && <span style={{ fontSize:14, color:"#aaa", fontStyle:"italic" }}>No correct answer text found</span>}
            </div>

            <div style={{ borderTop:"1px dashed rgba(0,0,0,0.1)", marginBottom:12 }} />

            <div style={{ fontFamily:"'Fredoka One', cursive", fontSize:11, color:"#888", letterSpacing:"0.08em", marginBottom:8, textTransform:"uppercase", display:"flex", alignItems:"center", gap:6 }}>
                {isListening && <span style={{ width:8, height:8, borderRadius:"50%", background:"#E24B4A", display:"inline-block", animation:"listeningRing 0.8s ease infinite" }} />}
                You said
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, minHeight:42, alignItems:"center" }}>
                {!hasSpoken ? (
                    <span style={{ fontSize:14, color:"#aaa", fontStyle:"italic" }}>
                        {isListening ? "Listening… speak now!" : "Waiting for your answer…"}
                    </span>
                ) : (
                    spokenWords.map((word, i) => {
                        const poolCopy = [...correctWords];
                        let matched2 = false;
                        for (let k = 0; k < spokenWords.length; k++) {
                            const ci = poolCopy.indexOf(spokenWords[k]);
                            if (ci !== -1) { if (k === i) matched2 = true; poolCopy[ci] = null; }
                        }
                        return (
                            <span key={i} style={{ fontFamily:"'Fredoka One', cursive", fontSize:18, padding:"4px 12px", borderRadius:8, background: matched2 ? "#EAF3DE" : "#FCEBEB", color: matched2 ? "#27500A" : "#791F1F", transition:"background 0.25s" }}>
                                {word}
                            </span>
                        );
                    })
                )}
            </div>

            {hasSpoken && !isListening && (
                <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontFamily:"'Fredoka One', cursive", fontSize:14, padding:"4px 16px", borderRadius:20, background:scorePillColor.bg, color:scorePillColor.color }}>
                        {earnedPts}/{maxPoints} pts — {pct}% matched
                    </span>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const StudentQuiz = () => {
    const [quiz,           setQuiz]           = useState(null);
    const [loading,        setLoading]        = useState(true);
    const [started,        setStarted]        = useState(false);
    const [currentIndex,   setCurrentIndex]   = useState(0);
    const [recStatus,      setRecStatus]      = useState("idle");
    const [transcript,     setTranscript]     = useState("");
    const [answers,        setAnswers]        = useState({});
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [startDisabled,  setStartDisabled]  = useState(true);
    const [showConfetti,   setShowConfetti]   = useState(false);
    const [attemptId,      setAttemptId]      = useState(null);
    const [showMaterials,  setShowMaterials]  = useState(false);
    const [quizUnlocked,   setQuizUnlocked]   = useState(false);
    const [materialDone,   setMaterialDone]   = useState(false);
    const [isSpeaking,     setIsSpeaking]     = useState(false);
    const [ttsEnabled,     setTtsEnabled]     = useState(true);
    const [timerKey,       setTimerKey]       = useState(0);
    const [timerStarted,   setTimerStarted]   = useState(false);
    const [timerPaused,    setTimerPaused]    = useState(true);
    const [autoNextCountdown, setAutoNextCountdown] = useState(null);

    const timerExpiredRef    = useRef(false);
    const recognitionRef     = useRef(null);
    const backgroundAudioRef = useRef(null);
    const autoNextRef        = useRef(null);

    const answersRef = useRef({});
    useEffect(() => { answersRef.current = answers; }, [answers]);

    const { authUser, getUser } = useAuth();
    const navigate = useNavigate();

    const isPreTest  = quiz?.difficulty === "Introduction";
    const isPostTest = isLevelPostTest(quiz?.difficulty);

    const speak = useCallback((text, callback) => {
        if (!ttsEnabled || !text) return;
        speakText(text, {
            rate: 0.85, pitch: 1.25,
            onStart: () => setIsSpeaking(true),
            onEnd:   () => { setIsSpeaking(false); callback?.(); },
        });
    }, [ttsEnabled]);

    const stopSpeaking = useCallback(() => { cancelSpeech(); setIsSpeaking(false); }, []);
    const toggleTTS    = useCallback(() => { if (isSpeaking) stopSpeaking(); setTtsEnabled(p => !p); }, [isSpeaking, stopSpeaking]);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                await getUser();
                const res = await axios.get("/quizzes/get-quiz");
                const fetchedQuiz = res.data.data || null;
                setQuiz(fetchedQuiz);
                // If no material or material is a link → auto-unlock
                const mat = fetchedQuiz?.material;
                const needsUnlock = mat && (mat.title || mat.content) && mat.type !== 'link';
                if (!needsUnlock) setQuizUnlocked(true);
            } catch (err) { console.error(err); navigate("/student"); }
            finally { setLoading(false); }
        };
        fetchQuiz();
        return () => cancelSpeech();
    }, []);

    useEffect(() => {
        if (!quiz || started) return;
        stopSpeaking();
        if (!ttsEnabled) { setTimeout(() => setStartDisabled(false), 1000); return; }
        let introText;
        if (isPreTest)       introText = `Hello there! Welcome to ${quiz.title}! This is your Pre-Test! Just do your best and I will find the perfect reading level for you! Finish the Learning Materials First!`;
        else if (isPostTest) introText = `Amazing! You have reached the Post-Test! This is your final quiz! Show everything you have learned! You are a superstar! Press the big button when you are ready!`;
        else                 introText = `Hello there! Welcome to ${quiz.title}! This is a ${quiz.difficulty} level quiz. Take your time and press the big button when you are ready! You are going to do amazing!`;
        setTimeout(() => speak(introText, () => setStartDisabled(false)), 1500);
    }, [quiz, started, ttsEnabled]);

    const questions       = quiz?.questions || [];
    const currentQuestion = questions[currentIndex];
    const totalSeconds    = (quiz?.time_limit || 0) * 60;

    useEffect(() => {
        if (!started || !currentQuestion) return;
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) { setRecStatus("error"); return; }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        let captured = false;
        let silenceTimer = null;
        let finalText = "";
        let lastFinalIndex = -1; // tracks last processed result to prevent duplicates

        recognition.continuous     = true;
        recognition.interimResults = true;
        recognition.lang           = "en-US";
        recognition.onstart  = () => {
            setRecStatus("listening");
            setTimerStarted(true);
            setTimerPaused(false);
        };
        recognition.onresult = (event) => {
            // Only process NEW final results (track lastFinalIndex to avoid duplicates)
            let newFinals = "";
            for (let i = lastFinalIndex + 1; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    newFinals += event.results[i][0].transcript + " ";
                    lastFinalIndex = i;
                }
            }

            // Current interim result (not yet final)
            const lastResult = event.results[event.results.length - 1];
            const interim = !lastResult.isFinal ? lastResult[0].transcript : "";

            // Append only NEW finals to accumulator
            if (newFinals.trim()) {
                finalText = (finalText + " " + newFinals).trim();
            }

            // Show accumulated finals + current interim in real time
            const displayText = (finalText + (interim ? " " + interim : "")).trim();
            if (displayText) setTranscript(displayText);

            // Reset silence timer — capture after 2s of no new speech
            if (silenceTimer) clearTimeout(silenceTimer);
            silenceTimer = setTimeout(() => {
                if (!captured && finalText) {
                    captured = true;
                    recognition.stop();
                    setRecStatus("idle");
                    setTimerPaused(true);
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 3000);
                    const capturedText = finalText;
                    let count = 3;
                    setAutoNextCountdown(count);
                    const countInterval = setInterval(() => {
                        count -= 1;
                        if (count <= 0) { clearInterval(countInterval); setAutoNextCountdown(null); autoNextRef.current?.(capturedText); }
                        else { setAutoNextCountdown(count); }
                    }, 1000);
                }
            }, 2000);
        };
        recognition.onerror = () => setRecStatus("error");
        // Only restart when nothing heard yet — prevents echo/ambient looping
        recognition.onend   = () => { if (!captured && finalText === "") setTimeout(() => recognition.start(), 300); };
        recognitionRef.current = recognition;
        setTranscript("");
        return () => { captured = true; if (silenceTimer) clearTimeout(silenceTimer); recognition.stop(); };
    }, [currentIndex, started, currentQuestion]);

    const startQuiz = async () => {
        stopSpeaking();
        if (!backgroundAudioRef.current) {
            const bg = new Audio("/quiz-bg-music.mp3");
            bg.loop = true; bg.volume = 0.09; bg.play().catch(() => {});
            backgroundAudioRef.current = bg;
        }
        setStarted(true); setTimerKey(k => k + 1);
        try {
            const res = await axios.post("/quiz-attempts", { quiz_id: quiz.id, started_at: new Date().toISOString(), score: 0 });
            const id = res.data.data.id;
            setAttemptId(id);
            let startMsg;
            if (isPreTest)       startMsg = "Yay! The Pre-Test is starting! Just say your answer out loud. Do your best, superstar!";
            else if (isPostTest) startMsg = "The final Post-Test is starting! You have learned so much! Show what you know, champion!";
            else                 startMsg = "Yay! The quiz is starting! Read each question and say your answer out loud. You can do it, superstar!";
            if (ttsEnabled) speak(startMsg, () => { recognitionRef.current?.start(); });
            else recognitionRef.current?.start();
        } catch (err) { console.error(err); }
    };

    const handleTimerExpire = useCallback(() => {
        if (timerExpiredRef.current) return;
        timerExpiredRef.current = true;
        message.warning("⏰ Time's up! Submitting your quiz...");
        handleFinish(true, null);
    }, [attemptId, answers, currentIndex, questions]);

    // ── Save answer ─────────────────────────────────────────────────────────
    // Reads use_word_scoring from each question to decide scoring method.
    // If use_word_scoring is true  → partial credit per correct word spoken.
    // If use_word_scoring is false → full points only if transcript matches exactly.
    const saveAnswer = async (overrideTranscript) => {
        if (!currentQuestion || !attemptId) return;
        const finalTranscript = overrideTranscript ?? transcript;
        const updated = { ...answersRef.current, [currentQuestion.id]: finalTranscript };
        setAnswers(updated);
        answersRef.current = updated;

        const wordScore = computeWordScore(finalTranscript, currentQuestion, isPreTest || isPostTest);

        try {
            await axios.post("/answers", {
                question_id: currentQuestion.id, student_id: authUser?.id,
                attempt_id: attemptId, choice_id: null, transcript: finalTranscript || "",
                ...(wordScore !== null ? { word_score: wordScore } : {}),
            });
        } catch (err) { console.error(err); }
    };

    const handleFinish = async (fromTimer = false, finalAnswers = null) => {
        if (backgroundAudioRef.current) {
            backgroundAudioRef.current.pause();
            backgroundAudioRef.current.currentTime = 0;
            backgroundAudioRef.current = null;
        }
        stopSpeaking();
        recognitionRef.current?.stop();
        if (fromTimer) await saveAnswer("");

        message.success("Quiz finished! Great job! 🎉");
        setButtonDisabled(false);
        setShowConfetti(true);

        let finishMsg;
        if (isPostTest)     finishMsg = "Incredible! You finished the Post-Test! You are an absolute champion! Well done!";
        else if (isPreTest) finishMsg = "Fantastic! You finished the Pre-Test! I will now find the perfect level for you!";
        else                finishMsg = "Fantastic! You finished the quiz! You are a superstar! Well done!";
        if (ttsEnabled) speak(finishMsg);

        try {
            // Flush all answers to DB before PATCH so word_scores are saved
            const answersToFlush = finalAnswers ?? answersRef.current;
            await Promise.all(
                (questions ?? []).map((q) => {
                    const transcript = answersToFlush[q.id] ?? "";
                    const wordScore = computeWordScore(transcript, q, isPreTest || isPostTest);
                    return axios.post("/answers", {
                        question_id: q.id,
                        student_id: authUser?.id,
                        attempt_id: attemptId,
                        choice_id: null,
                        transcript: transcript || "",
                        ...(wordScore !== null ? { word_score: wordScore } : {}),
                    }).catch(console.error);
                })
            );

            await axios.patch(`/quiz-attempts/${attemptId}`);

            if (isPreTest && authUser?.id) {
                const answersToUse = finalAnswers ?? answersRef.current;

               let totalPct = 0, count = 0;
for (const q of questions) {
    const spokenAnswer = answersToUse[q.id] ?? "";
    const pct = computeWordScore(spokenAnswer, q, true); // 0-100 na siya
    if (pct !== null) { totalPct += pct; count++; }
}
const percentage = count > 0 ? totalPct / count : 0;
                const newLevel   = getPlacementLevel(percentage);
                console.log(`Pre-test placement: ${percentage.toFixed(1)}% → ${newLevel}`);

                try {
                    await axios.patch(`/students/${authUser.id}`, { difficulty: newLevel });
                } catch (levelErr) { console.error("Level update failed:", levelErr); }
            }

            navigate("/student/finished-quiz", {
                state: {
                    attemptId,
                    answers: finalAnswers ?? answersRef.current,
                    isPostTest,
                    quizDifficulty: quiz?.difficulty,
                }
            });
        } catch (err) { console.error(err); }
    };

    const handleNext = () => {
        setButtonDisabled(true);
        setAutoNextCountdown(null);
        stopSpeaking();
        saveAnswer();
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
            setTranscript("");
            setTimeout(() => { recognitionRef.current?.start(); setButtonDisabled(false); }, 500);
        } else {
            handleFinish(false, null);
        }
    };

    // ── Auto-next ────────────────────────────────────────────────────────────
    // Same scoring logic as saveAnswer — reads use_word_scoring per question.
    const handleAutoNext = useCallback((capturedText) => {
        if (buttonDisabled) return;
        setButtonDisabled(true);
        stopSpeaking();

        const updatedAnswers = { ...answersRef.current, [currentQuestion.id]: capturedText };
        setAnswers(updatedAnswers);
        answersRef.current = updatedAnswers;

        if (currentQuestion && attemptId) {
            const wordScore = computeWordScore(capturedText, currentQuestion, isPreTest || isPostTest);
            axios.post("/answers", {
                question_id: currentQuestion.id, student_id: authUser?.id,
                attempt_id: attemptId, choice_id: null, transcript: capturedText || "",
                ...(wordScore !== null ? { word_score: wordScore } : {}),
            }).catch(console.error);
        }

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
            setTranscript("");
            setTimeout(() => { recognitionRef.current?.start(); setButtonDisabled(false); }, 500);
        } else {
            handleFinish(false, updatedAnswers);
        }
    }, [buttonDisabled, currentQuestion, attemptId, currentIndex, questions.length,
        isPreTest, isPostTest, authUser, stopSpeaking]);

    useEffect(() => { autoNextRef.current = handleAutoNext; }, [handleAutoNext]);

    const bgStyle = {
        background: "linear-gradient(135deg, #a8edea, #fed6e3, #ffecd2, #a8edea)",
        backgroundSize: "400% 400%",
        animation: "rainbowBg 10s ease infinite",
    };

    if (loading) return (
        <>
            <GlobalStyles />
            <div style={{ width:"100vw", height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", ...bgStyle }}>
                <div style={{ fontSize:80, animation:"bounce 0.8s ease infinite" }}>🦉</div>
                <Spin size="large" style={{ marginTop:20 }} />
                <p style={{ fontFamily:"'Fredoka One', cursive", fontSize:"1.6rem", color:"#5b4e75", marginTop:16 }}>Loading your quiz…</p>
            </div>
        </>
    );

    if (!quiz) return (
        <>
            <GlobalStyles />
            <div style={{ textAlign:"center", marginTop:80, fontFamily:"'Fredoka One', cursive", fontSize:"1.8rem", color:"#ff6b6b" }}>
                😕 No quiz found. Ask your teacher!
            </div>
        </>
    );

    if (!started) return (
        <>
            <GlobalStyles />
            {showConfetti && <ConfettiBlast />}
            <QuizMaterial
                visible={showMaterials}
                onClose={() => setShowMaterials(false)}
                material={quiz?.material && (quiz.material.title || quiz.material.content) ? quiz.material : null}
                onVideoWatched={() => { setQuizUnlocked(true); setMaterialDone(true); setShowMaterials(false); }}
                onStoryRead={() => { setQuizUnlocked(true); setMaterialDone(true); setShowMaterials(false); }}
            />
            <div style={{ width:"100vw", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20, position:"relative", overflow:"hidden", ...bgStyle }}>
                <Clouds /><Stars />
                <div style={{ position:"absolute", top:20, right:20, zIndex:10, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                    <button className="kid-btn" onClick={toggleTTS} style={{ background: ttsEnabled ? "linear-gradient(135deg,#56d364,#2ea043)" : "linear-gradient(135deg,#ff6b6b,#ee1818)", color:"white", padding:"10px 20px", boxShadow:"0 4px 12px rgba(0,0,0,0.2)", display:"flex", alignItems:"center", gap:8, fontSize:"1rem" }}>
                        {isSpeaking ? <PauseOutlined /> : <SoundOutlined />}
                        {isSpeaking ? "Speaking…" : ttsEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
                    </button>
                </div>
                <div style={{ position:"relative", zIndex:2, background:"rgba(255,255,255,0.92)", borderRadius:32, padding:"40px 50px", boxShadow:"0 12px 48px rgba(0,0,0,0.18), 0 0 0 6px rgba(255,179,71,0.5)", display:"flex", flexDirection:"column", alignItems:"center", gap:20, maxWidth:520, width:"100%", animation:"pop 0.5s cubic-bezier(.17,.67,.35,1.3) both" }}>
                    <div style={{ position:"absolute", top:-50, left:-50 }}>
                        <div className="mascot-float" style={{ fontSize:80 }}>{isPostTest ? "🏆" : isPreTest ? "📝" : "🦉"}</div>
                    </div>
                    <div style={{ position:"absolute", top:-40, right:-40 }}>
                        <div className="mascot-floatB" style={{ fontSize:64 }}>{isPostTest ? "🎓" : "🌟"}</div>
                    </div>
                    <h1 style={{ fontFamily:"'Fredoka One', cursive", fontSize:"2.4rem", color:"#5b4e75", margin:0, textShadow:"2px 2px 0 rgba(255,179,71,0.4)", textAlign:"center" }}>
                        {quiz.title} {isPostTest ? "🎓" : "🎉"}
                    </h1>
                    <div style={{ background: isPostTest ? "linear-gradient(135deg,#a9e34b,#2f9e44)" : isPreTest ? "linear-gradient(135deg,#74c0fc,#4dabf7)" : "linear-gradient(135deg,#ffd93d,#ff6b6b)", color:"white", fontFamily:"'Fredoka One', cursive", fontSize:"1.1rem", padding:"8px 24px", borderRadius:50, boxShadow:"0 3px 10px rgba(0,0,0,0.15)" }}>
                        {isPostTest ? "🎓 Post-Test" : isPreTest ? "📝 Pre-Test" : `⚡ Level: ${quiz.difficulty}`}
                    </div>
                    <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
                        <div style={{ display:"flex", gap:6, alignItems:"center", fontFamily:"'Nunito', sans-serif", fontWeight:700, fontSize:"1rem", color:"#5b4e75" }}>📋 {questions.length} Questions</div>
                        {quiz.time_limit > 0 && <div style={{ display:"flex", gap:6, alignItems:"center", fontFamily:"'Nunito', sans-serif", fontWeight:700, fontSize:"1rem", color:"#5b4e75" }}>⏱ {quiz.time_limit} min</div>}
                    </div>
                    {isPreTest && (
                        <div style={{ background:"linear-gradient(135deg,#e7f5ff,#d0ebff)", border:"2px solid #74c0fc", borderRadius:16, padding:"12px 20px", fontFamily:"'Nunito', sans-serif", fontWeight:700, fontSize:"0.95rem", color:"#1971c2", textAlign:"center", width:"100%" }}>
                            📝 This is your <strong>Pre-Test</strong>! Your answers will help us find the perfect reading level for you. Just do your best! 🌟
                        </div>
                    )}
                    {isPostTest && (
                        <div style={{ background:"linear-gradient(135deg,#ebfbee,#d3f9d8)", border:"2px solid #69db7c", borderRadius:16, padding:"12px 20px", fontFamily:"'Nunito', sans-serif", fontWeight:700, fontSize:"0.95rem", color:"#2f9e44", textAlign:"center", width:"100%" }}>
                            🏆 This is the <strong>Post-Test</strong>! You have completed all reading levels! This is your final challenge! Show everything you have learned! 🎓
                        </div>
                    )}
                    <button
                        className="kid-btn"
                        onClick={() => !materialDone && setShowMaterials(true)}
                        disabled={materialDone}
                        style={{
                            background: materialDone
                                ? "linear-gradient(135deg,#ccc,#aaa)"
                                : "linear-gradient(135deg,#4096ff,#1677ff)",
                            color:"white", padding:"14px 36px",
                            boxShadow: materialDone ? "none" : "0 6px 0 #1053a0, 0 8px 16px rgba(64,150,255,0.4)",
                            width:"100%", fontSize:"1.2rem",
                            cursor: materialDone ? "not-allowed" : "pointer",
                        }}
                    >
                        {materialDone
                            ? (quiz?.material?.type === "story" ? "✅ Story Read!" : "✅ Video Watched!")
                            : "📘 View Study Materials"}
                    </button>
                    <button
                        className={`kid-btn ${!(isSpeaking || startDisabled) && quizUnlocked ? "start-btn-glow" : ""}`}
                        onClick={startQuiz} disabled={isSpeaking || startDisabled || !quizUnlocked}
                        style={{ background: (isSpeaking || startDisabled || !quizUnlocked) ? "linear-gradient(135deg,#ccc,#aaa)" : isPostTest ? "linear-gradient(135deg,#a9e34b,#2f9e44)" : "linear-gradient(135deg,#ff9f43,#ff6b6b)", color:"white", padding:"18px 48px", boxShadow: (isSpeaking || startDisabled || !quizUnlocked) ? "none" : isPostTest ? "0 8px 0 #1e7a34, 0 12px 30px rgba(46,164,68,0.5)" : "0 8px 0 #c0392b, 0 12px 30px rgba(255,107,107,0.5)", width:"100%", fontSize:"1.6rem", marginTop:4 }}
                    >
                        {isSpeaking ? "🔊 Speaking…" : startDisabled ? "⏳ Getting ready…" : !quizUnlocked ? "🔒 Watch the video first!" : isPostTest ? "🎓 START POST-TEST!" : "🚀 START QUIZ!"}
                    </button>
                </div>
                <div style={{ marginTop:30, fontSize:32, display:"flex", gap:12, zIndex:2, animation:"bounce 2s ease infinite" }}>🐱 🌈 🎮 ⭐ 🎯</div>
            </div>
        </>
    );

    const isNextDisabled = recStatus === "listening" || isSpeaking || buttonDisabled;

    return (
        <>
            <GlobalStyles />
            {showConfetti && <ConfettiBlast />}
            {autoNextCountdown !== null && <AutoNextCountdown seconds={autoNextCountdown} isPrePost={isPreTest || isPostTest} />}

            <div style={{ width:"100vw", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 16px", position:"relative", overflow:"hidden", ...bgStyle }}>
                <Clouds /><Stars />

                <div style={{ position:"absolute", top:16, right:16, zIndex:10, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                    <button className="kid-btn" onClick={toggleTTS} style={{ background: ttsEnabled ? "linear-gradient(135deg,#56d364,#2ea043)" : "linear-gradient(135deg,#ff6b6b,#ee1818)", color:"white", padding:"8px 16px", boxShadow:"0 4px 12px rgba(0,0,0,0.2)", display:"flex", alignItems:"center", gap:6, fontSize:"0.9rem" }}>
                        {isSpeaking ? <PauseOutlined /> : <SoundOutlined />}
                        {isSpeaking ? "Speaking…" : ttsEnabled ? "🔊 ON" : "🔇 OFF"}
                    </button>
                </div>

                <div style={{ zIndex:2, textAlign:"center", marginBottom:8 }}>
                    <h1 style={{ fontFamily:"'Fredoka One', cursive", fontSize:"1.8rem", color:"#5b4e75", margin:0, textShadow:"2px 2px 0 rgba(255,179,71,0.4)" }}>
                        {quiz.title} {isPostTest ? "🎓" : "🦉"}
                    </h1>
                    <div style={{ display:"inline-block", background: isPostTest ? "linear-gradient(135deg,#a9e34b,#2f9e44)" : "linear-gradient(135deg,#ffd93d,#ff6b6b)", color:"white", fontFamily:"'Fredoka One', cursive", fontSize:"0.95rem", padding:"4px 16px", borderRadius:50, marginTop:4 }}>
                        {isPostTest ? "🎓 Post-Test · Final Challenge" : `⚡ ${quiz.difficulty}${isPreTest ? " · Pre-Test 📝" : ""}`}
                    </div>
                </div>

                {timerStarted && totalSeconds > 0 && (
                    <CountdownTimer key={timerKey} totalSeconds={totalSeconds} onExpire={handleTimerExpire} paused={timerPaused} />
                )}

                <div style={{ zIndex:2, width:"100%", maxWidth:640, marginBottom:4 }}>
                    <ProgressStars current={currentIndex + 1} total={questions.length} />
                    <div style={{ background:"rgba(255,255,255,0.5)", borderRadius:50, height:18, overflow:"hidden", boxShadow:"inset 0 2px 6px rgba(0,0,0,0.1)" }}>
                        <div style={{ height:"100%", width:`${((currentIndex + 1) / questions.length) * 100}%`, background: isPostTest ? "linear-gradient(90deg,#a9e34b,#2f9e44)" : "linear-gradient(90deg,#ffd93d,#ff6b6b)", borderRadius:50, transition:"width 0.5s ease", boxShadow:"0 2px 8px rgba(255,107,107,0.5)" }} />
                    </div>
                    <p style={{ fontFamily:"'Fredoka One', cursive", color:"#5b4e75", textAlign:"center", fontSize:"1rem", margin:"4px 0 0" }}>
                        Question {currentIndex + 1} of {questions.length}
                    </p>
                </div>

                <div key={currentIndex} className="question-card" style={{ zIndex:2, background:"rgba(255,255,255,0.95)", borderRadius:28, padding:"28px 32px", boxShadow:"0 10px 40px rgba(0,0,0,0.15), 0 0 0 5px rgba(255,179,71,0.45)", width:"100%", maxWidth:640, display:"flex", flexDirection:"column", alignItems:"center", gap:16, marginBottom:16 }}>
                    {currentQuestion?.photo && (
                        <img src={`${nonApi}/${currentQuestion.photo}`} alt="Question" style={{ maxWidth:320, maxHeight:220, width:"100%", height:"auto", objectFit:"contain", borderRadius:16, boxShadow:"0 6px 20px rgba(0,0,0,0.15)", border:"4px solid #ffd93d" }} />
                    )}

                    {!isPreTest && !isPostTest && (
                        <div style={{ fontFamily:"'Fredoka One', cursive", fontSize: currentQuestion?.photo ? "1.5rem" : "1.9rem", color:"#5b4e75", textAlign:"center", lineHeight:1.3 }}>
                            {currentQuestion?.question_text}
                        </div>
                    )}

                    <div style={{ minHeight:56, display:"flex", alignItems:"center", justifyContent:"center", width:"100%" }}>
                        {isSpeaking ? (
                            <div style={{ background:"linear-gradient(135deg,#4096ff,#1677ff)", color:"white", borderRadius:50, padding:"10px 24px", fontFamily:"'Fredoka One', cursive", fontSize:"1.1rem", display:"flex", alignItems:"center", gap:8, boxShadow:"0 4px 12px rgba(64,150,255,0.4)", animation:"bounce 0.8s ease infinite" }}>
                                🔊 Reading question…
                            </div>
                        ) : recStatus === "error" ? (
                            <div style={{ background:"#fff3cd", color:"#856404", borderRadius:50, padding:"10px 24px", fontFamily:"'Nunito', sans-serif", fontWeight:700, fontSize:"1rem" }}>
                                😕 Mic not found. Check permissions!
                            </div>
                        ) : recStatus === "listening" && !isPreTest && !isPostTest ? (
                            <div className="listening-indicator" style={{ background:"linear-gradient(135deg,#ff6b6b,#ee1818)", color:"white", borderRadius:50, padding:"12px 28px", fontFamily:"'Fredoka One', cursive", fontSize:"1.2rem", display:"flex", alignItems:"center", gap:10, boxShadow:"0 4px 16px rgba(255,107,107,0.5)" }}>
                                <AudioOutlined style={{ fontSize:"1.4rem" }} /> 🎤 Listening… Speak now!
                            </div>
                        ) : transcript && recStatus === "idle" && !isPreTest && !isPostTest ? (
                            <div style={{ background:"linear-gradient(135deg,#56d364,#2ea043)", color:"white", borderRadius:50, padding:"12px 28px", fontFamily:"'Fredoka One', cursive", fontSize:"1.2rem", display:"flex", alignItems:"center", gap:10, boxShadow:"0 4px 16px rgba(86,211,100,0.5)" }}>
                                🎉 Got it! Great answer!
                            </div>
                        ) : null}
                    </div>

                    {(isPreTest || isPostTest) && !isSpeaking && (() => {
                        const correctChoice = currentQuestion?.choices?.find(c => c.is_correct);
                        if (!correctChoice) return null;
                        return (
                            <KaraokeDisplay
                                correctText={correctChoice.choice_text}
                                spokenText={transcript}
                                isListening={recStatus === "listening"}
                                maxPoints={currentQuestion.points ?? 1}
                            />
                        );
                    })()}

                    {transcript && recStatus === "idle" && !isPreTest && !isPostTest && (
                        <div style={{ background:"linear-gradient(135deg,#f8f9fa,#e9ecef)", border:"3px dashed #ffd93d", borderRadius:16, padding:"12px 20px", fontFamily:"'Nunito', sans-serif", fontWeight:700, fontSize:"1.1rem", color:"#5b4e75", textAlign:"center", width:"100%" }}>
                            💬 You said: "<em>{transcript}</em>"
                        </div>
                    )}
                </div>

                <button
                    className="kid-btn" onClick={handleNext} disabled={isNextDisabled}
                    style={{ zIndex:2, background: isNextDisabled ? "linear-gradient(135deg,#ccc,#aaa)" : isPostTest ? "linear-gradient(135deg,#a9e34b,#2f9e44)" : "linear-gradient(135deg,#ff9f43,#ff6b6b)", color:"white", padding:"14px 40px", fontSize:"1.2rem", boxShadow: isNextDisabled ? "none" : isPostTest ? "0 6px 0 #1e7a34, 0 10px 24px rgba(46,164,68,0.45)" : "0 6px 0 #c0392b, 0 10px 24px rgba(255,107,107,0.45)", marginBottom:16, opacity: transcript ? 0.6 : 1 }}
                >
                    {isSpeaking               ? "🔊 Speaking…"  :
                     recStatus === "listening" ? "🎤 Listening…" :
                     transcript
                        ? (currentIndex === questions.length - 1 ? (isPostTest ? "🎓 Finish Now!" : "🏆 Finish Now!") : "⏭️ Skip")
                        : (currentIndex === questions.length - 1 ? (isPostTest ? "🎓 Finish!" : "🏆 Finish Quiz!") : "⏭️ Skip")}
                </button>

                <div style={{ zIndex:2, display:"flex", gap:16, fontSize:28, animation:"bounce 2s ease infinite" }}>🐣 🌈 ⭐ 🎯 🎊</div>
            </div>
        </>
    );
};

export default StudentQuiz;