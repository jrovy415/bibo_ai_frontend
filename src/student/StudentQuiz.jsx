import { useEffect, useRef, useState, useCallback } from "react";
import { Spin } from "antd";
import { AudioOutlined, SoundOutlined, PauseOutlined } from "@ant-design/icons";
import axios, { nonApi } from "../../plugins/axios";
import { useAuth } from "../../composables/useAuth";
import { useNavigate } from "react-router-dom";
import QuizMaterial from "../components/QuizMaterial";
import bgAudio from "../../plugins/bgAudio";

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
        @keyframes wiggle {
            0%, 100% { transform: rotate(-4deg); }
            50%       { transform: rotate(4deg); }
        }
        @keyframes pop {
            0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
            70%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes starSpin {
            from { transform: rotate(0deg) scale(1); }
            to   { transform: rotate(360deg) scale(1.2); }
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
            50%       { transform: scale(1.06); }
        }
        @keyframes timerShake {
            0%, 100% { transform: translateX(0); }
            20%       { transform: translateX(-4px); }
            40%       { transform: translateX(4px); }
            60%       { transform: translateX(-3px); }
            80%       { transform: translateX(3px); }
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
        .kid-btn:not(:disabled):hover {
            transform: scale(1.07) translateY(-2px) !important;
        }
        .kid-btn:not(:disabled):active {
            transform: scale(0.95) !important;
        }
        .kid-btn:disabled {
            opacity: 0.5 !important;
            cursor: not-allowed !important;
        }

        .star-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 44px; height: 44px;
            background: #FFD700;
            border-radius: 50%;
            font-size: 1.5rem;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            animation: starSpin 3s linear infinite;
        }

        .question-card {
            animation: pop 0.5s cubic-bezier(.17,.67,.35,1.3) both;
        }

        .listening-indicator {
            animation: listeningRing 1s ease infinite;
        }

        .start-btn-glow {
            animation: pulse 1.5s ease infinite;
        }

        .mascot-float {
            animation: float 3s ease-in-out infinite;
        }
        .mascot-floatB {
            animation: floatB 4s ease-in-out infinite;
        }

        .timer-urgent {
            animation: timerShake 0.4s ease infinite;
        }
        .timer-warning {
            animation: timerPulse 0.8s ease infinite;
        }
    `}</style>
);

const CONFETTI_COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF922B","#CC5DE8","#F06595"];
const ConfettiBlast = () => {
    const pieces = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 8 + Math.random() * 10,
        delay: Math.random() * 1.5,
        duration: 2.5 + Math.random() * 2,
    }));
    return (
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9999 }}>
            {pieces.map(p => (
                <div key={p.id} style={{
                    position:"absolute",
                    left: `${p.left}%`,
                    top: 0,
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                    animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
                }} />
            ))}
        </div>
    );
};

const Clouds = () => {
    const clouds = [
        { top:"8%",  size:80,  dur:22, delay:0   },
        { top:"18%", size:110, dur:30, delay:8   },
        { top:"55%", size:70,  dur:18, delay:4   },
        { top:"72%", size:95,  dur:26, delay:14  },
        { top:"35%", size:60,  dur:20, delay:10  },
    ];
    return (
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
            {clouds.map((c, i) => (
                <div key={i} style={{
                    position:"absolute",
                    top: c.top,
                    left: 0,
                    width: c.size,
                    height: c.size * 0.6,
                    background: "rgba(255,255,255,0.55)",
                    borderRadius: "50%",
                    animation: `cloudDrift ${c.dur}s ${c.delay}s linear infinite`,
                    filter: "blur(4px)",
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
                    top: `${10 + i * 12}%`,
                    left: i % 2 === 0 ? `${3 + i * 2}%` : `${85 - i * 2}%`,
                    fontSize: 22 + (i % 3) * 8,
                    animation: `float ${3 + i * 0.4}s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                    opacity: 0.7,
                }}>{s}</div>
            ))}
        </div>
    );
};

const OwlMascot = ({ size = 80, style = {} }) => (
    <div style={{ fontSize: size, lineHeight: 1, ...style }}>🦉</div>
);
const StarMascot = ({ size = 80, style = {} }) => (
    <div style={{ fontSize: size, lineHeight: 1, ...style }}>🌟</div>
);

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

// ── Timer display component ──────────────────────────────────────────────────
const QuizTimer = ({ secondsLeft, totalSeconds }) => {
    if (totalSeconds == null || totalSeconds <= 0) return null;

    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    const display = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    const pct = secondsLeft / totalSeconds;

    const isUrgent  = secondsLeft <= 10;
    const isWarning = secondsLeft <= 30 && !isUrgent;

    const bgColor  = isUrgent  ? "linear-gradient(135deg,#ff4444,#cc0000)"
                   : isWarning ? "linear-gradient(135deg,#ff9f43,#ff6b6b)"
                               : "linear-gradient(135deg,#56d364,#2ea043)";

    const emoji = isUrgent ? "🚨" : isWarning ? "⏰" : "⏱️";

    return (
        <div
            className={isUrgent ? "timer-urgent" : isWarning ? "timer-warning" : ""}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: bgColor,
                color: "white",
                borderRadius: 50,
                padding: "10px 22px",
                fontFamily: "'Fredoka One', cursive",
                fontSize: "1.5rem",
                boxShadow: isUrgent
                    ? "0 0 0 4px rgba(255,68,68,0.4), 0 4px 16px rgba(255,68,68,0.5)"
                    : "0 4px 16px rgba(0,0,0,0.2)",
                letterSpacing: 1,
                minWidth: 130,
                justifyContent: "center",
                transition: "background 0.5s ease",
                userSelect: "none",
            }}
        >
            <span style={{ fontSize: "1.2rem" }}>{emoji}</span>
            {display}
        </div>
    );
};

const StudentQuiz = () => {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [started, setStarted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [recStatus, setRecStatus] = useState("idle");
    const [transcript, setTranscript] = useState("");
    const [answers, setAnswers] = useState({});
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [startDisabled, setStartDisabled] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    const [attemptId, setAttemptId] = useState(null);
    const [showMaterials, setShowMaterials] = useState(false);

    const [isSpeaking, setIsSpeaking] = useState(true);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [friendlyVoice, setFriendlyVoice] = useState(null);

    // ── Timer state ──────────────────────────────────────────────────────────
    const [timeLeft, setTimeLeft]   = useState(null); // seconds remaining
    const [totalTime, setTotalTime] = useState(null); // original total seconds
    const timerRef = useRef(null);

    const recognitionRef = useRef(null);
    const finishCalledRef = useRef(false); // guard against double-finish

    const { authUser, getUser } = useAuth();
    const navigate = useNavigate();

    // ── Load voice ──────────────────────────────────────────────────────────
    useEffect(() => {
        const loadVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) return;
            const zira = voices.find(v => v.name.toLowerCase().includes('zira'));
            if (zira) { setFriendlyVoice(zira); return; }
            const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
            const mobileFallbacks = isMobile
                ? ['Samantha','Karen','Tessa','Veena','Moira','Alex']
                : [];
            for (const name of mobileFallbacks) {
                const v = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
                if (v) { setFriendlyVoice(v); return; }
            }
            const generalFallbacks = [
                'Karen','Samantha','Alice','Susan','Victoria','Allison',
                v => v.name.toLowerCase().includes('female') && v.lang.startsWith('en'),
                v => v.lang.startsWith('en-US'),
                v => v.lang.startsWith('en'),
            ];
            for (const fb of generalFallbacks) {
                const v = typeof fb === 'string'
                    ? voices.find(v => v.name.toLowerCase().includes(fb.toLowerCase()))
                    : voices.find(fb);
                if (v) { setFriendlyVoice(v); return; }
            }
            if (voices.length > 0) setFriendlyVoice(voices[0]);
        };
        loadVoice();
        window.speechSynthesis.onvoiceschanged = () => setTimeout(loadVoice, 100);
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    // ── TTS helpers ─────────────────────────────────────────────────────────
    const speak = (text, callback) => {
        if (!ttsEnabled || !text) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.85; u.pitch = 1.15; u.volume = 0.9;
        if (friendlyVoice) u.voice = friendlyVoice;
        u.onstart = () => setIsSpeaking(true);
        u.onend   = () => { setIsSpeaking(false); if (callback) callback(); };
        u.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
    };
    const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };
    const toggleTTS = () => { if (isSpeaking) stopSpeaking(); setTtsEnabled(p => !p); };

    // ── Fetch quiz ──────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                await getUser();
                const res = await axios.get("/quizzes/get-quiz");
                setQuiz(res.data.data || null);
            } catch (err) {
                console.error(err);
                navigate("/student");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, []);

    // ── Intro TTS ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (quiz && !started && ttsEnabled && friendlyVoice) {
            stopSpeaking();
            const introText = `Hello there! Welcome to ${quiz.title}! This is a ${quiz.difficulty} level quiz. Take your time and press the big button when you are ready! You are going to do amazing!`;
            setTimeout(() => speak(introText, () => setStartDisabled(false)), 1500);
        } else if (quiz && !started && !ttsEnabled) {
            setTimeout(() => setStartDisabled(false), 1000);
        }
    }, [quiz, started, ttsEnabled, friendlyVoice]);

    const questions       = quiz?.questions || [];
    const currentQuestion = questions[currentIndex];

    // ── Speech recognition ──────────────────────────────────────────────────
    useEffect(() => {
        if (!started || !currentQuestion) return;
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            setRecStatus("error"); return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        let captured = false;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.onstart  = () => setRecStatus("listening");
        recognition.onresult = (event) => {
            const last = event.results[event.results.length - 1];
            const text = last[0].transcript.trim();
            if (text && last.isFinal && !captured) {
                captured = true;
                setTranscript(text);
                recognition.stop();
                setRecStatus("idle");
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
            }
        };
        recognition.onerror = () => setRecStatus("error");
        recognition.onend   = () => { if (!captured) setTimeout(() => recognition.start(), 500); };
        recognitionRef.current = recognition;
        setTranscript("");
        return () => { captured = true; recognition.stop(); };
    }, [currentIndex, started, currentQuestion]);

    // ── Handle finish (wrapped in useCallback to use in timer) ───────────────
    const handleFinish = useCallback(async (isTimedOut = false) => {
        if (finishCalledRef.current) return;
        finishCalledRef.current = true;

        // Stop timer
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

        if (bgAudio.instance) {
            bgAudio.instance.pause();
            bgAudio.instance.currentTime = 0;
            bgAudio.instance = null;
        }

        stopSpeaking();
        recognitionRef.current?.stop();
        setButtonDisabled(false);
        setShowConfetti(true);

        const isHardLevel = quiz?.difficulty === 'Hard';

        if (ttsEnabled) {
            if (isTimedOut) {
                speak("Time is up! Great effort! Check your grades on the dashboard!");
            } else if (isHardLevel) {
                speak("Fantastic! You finished the Hard level quiz! You are an absolute superstar! Check your grades on the dashboard!");
            } else {
                speak("Fantastic! You finished the quiz! You are a superstar! Well done!");
            }
        }

        try {
            await axios.patch(`/quiz-attempts/${attemptId}`);

            if (isHardLevel) {
                setTimeout(() => navigate("/student"), 2500);
            } else {
                navigate("/student/finished-quiz", { state: { attemptId, answers } });
            }
        } catch (err) {
            console.error(err);
            navigate("/student");
        }
    }, [attemptId, answers, quiz, ttsEnabled]);

    // ── Countdown timer logic ────────────────────────────────────────────────
    useEffect(() => {
        if (!started) return;
        // Clear any previous timer
        if (timerRef.current) clearInterval(timerRef.current);

        const limitMinutes = quiz?.time_limit;
        if (!limitMinutes || limitMinutes <= 0) return; // no timer configured

        const totalSecs = limitMinutes * 60;
        setTotalTime(totalSecs);
        setTimeLeft(totalSecs);

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    // Save current answer then finish
                    handleFinish(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        };
    }, [started]); // only run when quiz starts

    // ── Start quiz ──────────────────────────────────────────────────────────
    const startQuiz = async () => {
        stopSpeaking();
        finishCalledRef.current = false;

        if (!bgAudio.instance) {
            bgAudio.instance = new Audio("/quiz-bg-music.mp3");
            bgAudio.instance.loop = true;
            bgAudio.instance.volume = 0.09;
            bgAudio.instance.play().catch(() => {});
        }

        setStarted(true);

        try {
            const res = await axios.post("/quiz-attempts", {
                quiz_id: quiz.id,
                started_at: new Date().toISOString(),
                score: 0,
            });
            const id = res.data.data.id;
            setAttemptId(id);
            if (ttsEnabled) {
                speak("Yay! The quiz is starting! Read each question and say your answer out loud. You can do it, superstar!", () => {
                    recognitionRef.current?.start();
                });
            } else {
                recognitionRef.current?.start();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ── Save answer ─────────────────────────────────────────────────────────
    const saveAnswer = async () => {
        if (!currentQuestion || !attemptId) return;
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: transcript || "" }));
        try {
            await axios.post("/answers", {
                question_id: currentQuestion.id,
                student_id: authUser?.id,
                attempt_id: attemptId,
                choice_id: null,
                transcript: transcript || "",
            });
        } catch (err) {
            console.error(err);
        }
    };

    // ── Next / Finish ───────────────────────────────────────────────────────
    const handleNext = () => {
        setButtonDisabled(true);
        stopSpeaking();
        saveAnswer();
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
            setTranscript("");
            setTimeout(() => { recognitionRef.current?.start(); setButtonDisabled(false); }, 500);
        } else {
            handleFinish(false);
        }
    };

    // ── Shared BG style ─────────────────────────────────────────────────────
    const bgStyle = {
        background: "linear-gradient(135deg, #a8edea, #fed6e3, #ffecd2, #a8edea)",
        backgroundSize: "400% 400%",
        animation: "rainbowBg 10s ease infinite",
    };

    // ── Loading ─────────────────────────────────────────────────────────────
    if (loading)
        return (
            <>
                <GlobalStyles />
                <div style={{ width:"100vw", height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", ...bgStyle }}>
                    <div style={{ fontSize: 80, animation:"bounce 0.8s ease infinite" }}>🦉</div>
                    <Spin size="large" style={{ marginTop: 20 }} />
                    <p style={{ fontFamily:"'Fredoka One', cursive", fontSize:"1.6rem", color:"#5b4e75", marginTop:16 }}>
                        Loading your quiz…
                    </p>
                </div>
            </>
        );

    if (!quiz)
        return (
            <>
                <GlobalStyles />
                <div style={{ textAlign:"center", marginTop:80, fontFamily:"'Fredoka One', cursive", fontSize:"1.8rem", color:"#ff6b6b" }}>
                    😕 No quiz found. Ask your teacher!
                </div>
            </>
        );

    // ═══════════════════════════════════════════
    // INTRO SCREEN
    // ═══════════════════════════════════════════
    if (!started)
        return (
            <>
                <GlobalStyles />
                {showConfetti && <ConfettiBlast />}
                <QuizMaterial
                    visible={showMaterials}
                    onClose={() => setShowMaterials(false)}
                    material={quiz?.material && (quiz.material.title || quiz.material.content) ? quiz.material : null}
                />

                <div style={{
                    width:"100vw", minHeight:"100vh",
                    display:"flex", flexDirection:"column",
                    alignItems:"center", justifyContent:"center",
                    padding:20, position:"relative", overflow:"hidden",
                    ...bgStyle,
                }}>
                    <Clouds />
                    <Stars />

                    {/* TTS toggle */}
                    <div style={{ position:"absolute", top:20, right:20, zIndex:10, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                        <button
                            className="kid-btn"
                            onClick={toggleTTS}
                            style={{
                                background: ttsEnabled ? "linear-gradient(135deg,#56d364,#2ea043)" : "linear-gradient(135deg,#ff6b6b,#ee1818)",
                                color:"white", padding:"10px 20px",
                                boxShadow:"0 4px 12px rgba(0,0,0,0.2)",
                                display:"flex", alignItems:"center", gap:8,
                                fontSize:"1rem",
                            }}
                        >
                            {isSpeaking ? <PauseOutlined /> : <SoundOutlined />}
                            {isSpeaking ? "Speaking…" : ttsEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
                        </button>
                        {friendlyVoice && (
                            <span style={{
                                fontSize:11, color:"#5b4e75",
                                background:"rgba(255,255,255,0.8)",
                                padding:"2px 8px", borderRadius:20,
                                fontFamily:"'Nunito', sans-serif",
                            }}>
                                🎙 {friendlyVoice.name}
                            </span>
                        )}
                    </div>

                    {/* Main card */}
                    <div style={{
                        position:"relative", zIndex:2,
                        background:"rgba(255,255,255,0.92)",
                        borderRadius:32, padding:"40px 50px",
                        boxShadow:"0 12px 48px rgba(0,0,0,0.18), 0 0 0 6px rgba(255,179,71,0.5)",
                        display:"flex", flexDirection:"column",
                        alignItems:"center", gap:20,
                        maxWidth:520, width:"100%",
                        animation:"pop 0.5s cubic-bezier(.17,.67,.35,1.3) both",
                    }}>
                        <div style={{ position:"absolute", top:-50, left:-50 }}>
                            <div className="mascot-float"><OwlMascot size={80} /></div>
                        </div>
                        <div style={{ position:"absolute", top:-40, right:-40 }}>
                            <div className="mascot-floatB"><StarMascot size={64} /></div>
                        </div>

                        <h1 style={{
                            fontFamily:"'Fredoka One', cursive", fontSize:"2.4rem",
                            color:"#5b4e75", margin:0,
                            textShadow:"2px 2px 0 rgba(255,179,71,0.4)", textAlign:"center",
                        }}>
                            {quiz.title} 🎉
                        </h1>

                        <div style={{
                            background:"linear-gradient(135deg,#ffd93d,#ff6b6b)", color:"white",
                            fontFamily:"'Fredoka One', cursive", fontSize:"1.1rem",
                            padding:"8px 24px", borderRadius:50,
                            boxShadow:"0 3px 10px rgba(0,0,0,0.15)",
                        }}>
                            ⚡ Level: {quiz.difficulty}
                        </div>

                        <div style={{
                            display:"flex", gap:6, alignItems:"center",
                            fontFamily:"'Nunito', sans-serif", fontWeight:700,
                            fontSize:"1rem", color:"#5b4e75",
                        }}>
                            📋 {questions.length} Questions to answer
                        </div>

                        {/* Time limit badge — shown on intro if set */}
                        {quiz.time_limit > 0 && (
                            <div style={{
                                display:"flex", alignItems:"center", gap:8,
                                background:"linear-gradient(135deg,#e0f7fa,#b2ebf2)",
                                border:"2px solid #4dd0e1",
                                borderRadius:50, padding:"8px 22px",
                                fontFamily:"'Fredoka One', cursive", fontSize:"1.1rem",
                                color:"#006064",
                                boxShadow:"0 3px 10px rgba(0,150,180,0.15)",
                            }}>
                                ⏱️ Time limit: {quiz.time_limit} minute{quiz.time_limit !== 1 ? "s" : ""}
                            </div>
                        )}

                        <button
                            className="kid-btn"
                            onClick={() => setShowMaterials(true)}
                            style={{
                                background:"linear-gradient(135deg,#4096ff,#1677ff)", color:"white",
                                padding:"14px 36px",
                                boxShadow:"0 6px 0 #1053a0, 0 8px 16px rgba(64,150,255,0.4)",
                                width:"100%", fontSize:"1.2rem",
                            }}
                        >
                            📘 View Study Materials
                        </button>

                        <button
                            className={`kid-btn ${!(isSpeaking || startDisabled) ? "start-btn-glow" : ""}`}
                            onClick={startQuiz}
                            disabled={isSpeaking || startDisabled}
                            style={{
                                background: (isSpeaking || startDisabled)
                                    ? "linear-gradient(135deg,#ccc,#aaa)"
                                    : "linear-gradient(135deg,#ff9f43,#ff6b6b)",
                                color:"white", padding:"18px 48px",
                                boxShadow: (isSpeaking || startDisabled)
                                    ? "none"
                                    : "0 8px 0 #c0392b, 0 12px 30px rgba(255,107,107,0.5)",
                                width:"100%", fontSize:"1.6rem", marginTop:4,
                            }}
                        >
                            {isSpeaking ? "🔊 Speaking…" : startDisabled ? "⏳ Getting ready…" : "🚀 START QUIZ!"}
                        </button>
                    </div>

                    <div style={{ marginTop:30, fontSize:32, display:"flex", gap:12, zIndex:2, animation:"bounce 2s ease infinite" }}>
                        🐱 🌈 🎮 ⭐ 🎯
                    </div>
                </div>
            </>
        );

    // ═══════════════════════════════════════════
    // QUIZ SCREEN
    // ═══════════════════════════════════════════
    const isNextDisabled = recStatus === "listening" || (!transcript && recStatus === "idle") || isSpeaking || buttonDisabled;

    return (
        <>
            <GlobalStyles />
            {showConfetti && <ConfettiBlast />}

            <div style={{
                width:"100vw", minHeight:"100vh",
                display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center",
                padding:"20px 16px", position:"relative", overflow:"hidden",
                ...bgStyle,
            }}>
                <Clouds />
                <Stars />

                {/* Top bar: TTS toggle + Timer */}
                <div style={{
                    position:"absolute", top:16, left:0, right:0,
                    padding:"0 16px", zIndex:10,
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                }}>
                    {/* Timer — left side */}
                    <div>
                        {totalTime > 0 && timeLeft !== null && (
                            <QuizTimer secondsLeft={timeLeft} totalSeconds={totalTime} />
                        )}
                    </div>

                    {/* TTS toggle — right side */}
                    <button
                        className="kid-btn"
                        onClick={toggleTTS}
                        style={{
                            background: ttsEnabled ? "linear-gradient(135deg,#56d364,#2ea043)" : "linear-gradient(135deg,#ff6b6b,#ee1818)",
                            color:"white", padding:"8px 16px",
                            boxShadow:"0 4px 12px rgba(0,0,0,0.2)",
                            display:"flex", alignItems:"center", gap:6,
                            fontSize:"0.9rem",
                        }}
                    >
                        {isSpeaking ? <PauseOutlined /> : <SoundOutlined />}
                        {isSpeaking ? "Speaking…" : ttsEnabled ? "🔊 ON" : "🔇 OFF"}
                    </button>
                </div>

                {/* Header */}
                <div style={{ zIndex:2, textAlign:"center", marginBottom:8, marginTop: totalTime > 0 ? 60 : 0 }}>
                    <h1 style={{
                        fontFamily:"'Fredoka One', cursive", fontSize:"1.8rem",
                        color:"#5b4e75", margin:0,
                        textShadow:"2px 2px 0 rgba(255,179,71,0.4)",
                    }}>
                        {quiz.title} 🦉
                    </h1>
                    <div style={{
                        display:"inline-block",
                        background:"linear-gradient(135deg,#ffd93d,#ff6b6b)", color:"white",
                        fontFamily:"'Fredoka One', cursive", fontSize:"0.95rem",
                        padding:"4px 16px", borderRadius:50, marginTop:4,
                    }}>
                        ⚡ {quiz.difficulty}
                    </div>
                </div>

                {/* Progress stars */}
                <div style={{ zIndex:2, width:"100%", maxWidth:640, marginBottom:4 }}>
                    <ProgressStars current={currentIndex + 1} total={questions.length} />
                    <div style={{
                        background:"rgba(255,255,255,0.5)", borderRadius:50,
                        height:18, overflow:"hidden",
                        boxShadow:"inset 0 2px 6px rgba(0,0,0,0.1)",
                    }}>
                        <div style={{
                            height:"100%",
                            width:`${((currentIndex + 1) / questions.length) * 100}%`,
                            background:"linear-gradient(90deg,#ffd93d,#ff6b6b)",
                            borderRadius:50, transition:"width 0.5s ease",
                            boxShadow:"0 2px 8px rgba(255,107,107,0.5)",
                        }} />
                    </div>
                    <p style={{
                        fontFamily:"'Fredoka One', cursive", color:"#5b4e75",
                        textAlign:"center", fontSize:"1rem", margin:"4px 0 0",
                    }}>
                        Question {currentIndex + 1} of {questions.length}
                    </p>
                </div>

                {/* Question card */}
                <div
                    key={currentIndex}
                    className="question-card"
                    style={{
                        zIndex:2,
                        background:"rgba(255,255,255,0.95)",
                        borderRadius:28, padding:"28px 32px",
                        boxShadow:"0 10px 40px rgba(0,0,0,0.15), 0 0 0 5px rgba(255,179,71,0.45)",
                        width:"100%", maxWidth:640,
                        display:"flex", flexDirection:"column",
                        alignItems:"center", gap:16, marginBottom:16,
                    }}
                >
                    {currentQuestion?.photo && (
                        <img
                            src={`${nonApi}/${currentQuestion.photo}`}
                            alt="Question"
                            style={{
                                maxWidth:320, maxHeight:220, width:"100%", height:"auto",
                                objectFit:"contain", borderRadius:16,
                                boxShadow:"0 6px 20px rgba(0,0,0,0.15)",
                                border:"4px solid #ffd93d",
                            }}
                        />
                    )}

                    <div style={{
                        fontFamily:"'Fredoka One', cursive",
                        fontSize: currentQuestion?.photo ? "1.5rem" : "1.9rem",
                        color:"#5b4e75", textAlign:"center", lineHeight:1.3,
                    }}>
                        {currentQuestion?.question_text}
                    </div>

                    <div style={{ minHeight:56, display:"flex", alignItems:"center", justifyContent:"center", width:"100%" }}>
                        {isSpeaking ? (
                            <div style={{
                                background:"linear-gradient(135deg,#4096ff,#1677ff)", color:"white",
                                borderRadius:50, padding:"10px 24px",
                                fontFamily:"'Fredoka One', cursive", fontSize:"1.1rem",
                                display:"flex", alignItems:"center", gap:8,
                                boxShadow:"0 4px 12px rgba(64,150,255,0.4)",
                                animation:"bounce 0.8s ease infinite",
                            }}>
                                🔊 Reading question…
                            </div>
                        ) : recStatus === "listening" ? (
                            <div className="listening-indicator" style={{
                                background:"linear-gradient(135deg,#ff6b6b,#ee1818)", color:"white",
                                borderRadius:50, padding:"12px 28px",
                                fontFamily:"'Fredoka One', cursive", fontSize:"1.2rem",
                                display:"flex", alignItems:"center", gap:10,
                                boxShadow:"0 4px 16px rgba(255,107,107,0.5)",
                            }}>
                                <AudioOutlined style={{ fontSize:"1.4rem" }} />
                                🎤 Listening… Speak now!
                            </div>
                        ) : recStatus === "error" ? (
                            <div style={{
                                background:"#fff3cd", color:"#856404",
                                borderRadius:50, padding:"10px 24px",
                                fontFamily:"'Nunito', sans-serif", fontWeight:700, fontSize:"1rem",
                            }}>
                                😕 Mic not found. Check permissions!
                            </div>
                        ) : transcript && recStatus === "idle" ? (
                            <div style={{
                                background:"linear-gradient(135deg,#56d364,#2ea043)", color:"white",
                                borderRadius:50, padding:"12px 28px",
                                fontFamily:"'Fredoka One', cursive", fontSize:"1.2rem",
                                display:"flex", alignItems:"center", gap:10,
                                boxShadow:"0 4px 16px rgba(86,211,100,0.5)",
                            }}>
                                🎉 Got it! Great answer!
                            </div>
                        ) : null}
                    </div>

                    {transcript && recStatus === "idle" && (
                        <div style={{
                            background:"linear-gradient(135deg,#f8f9fa,#e9ecef)",
                            border:"3px dashed #ffd93d", borderRadius:16,
                            padding:"12px 20px",
                            fontFamily:"'Nunito', sans-serif", fontWeight:700,
                            fontSize:"1.1rem", color:"#5b4e75", textAlign:"center", width:"100%",
                        }}>
                            💬 You said: "<em>{transcript}</em>"
                        </div>
                    )}
                </div>

                {/* Next / Finish button */}
                <button
                    className="kid-btn"
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    style={{
                        zIndex:2,
                        background: isNextDisabled
                            ? "linear-gradient(135deg,#ccc,#aaa)"
                            : "linear-gradient(135deg,#ff9f43,#ff6b6b)",
                        color:"white", padding:"16px 52px", fontSize:"1.5rem",
                        boxShadow: isNextDisabled
                            ? "none"
                            : "0 8px 0 #c0392b, 0 12px 28px rgba(255,107,107,0.45)",
                        marginBottom:16,
                    }}
                >
                    {isSpeaking     ? "🔊 Speaking…" :
                     recStatus === "listening" ? "🎤 Listening…" :
                     currentIndex === questions.length - 1 ? "🏆 Finish Quiz!" : "➡️ Next Question!"}
                </button>

                <div style={{ zIndex:2, display:"flex", gap:16, fontSize:28, animation:"bounce 2s ease infinite" }}>
                    🐣 🌈 ⭐ 🎯 🎊
                </div>
            </div>
        </>
    );
};

export default StudentQuiz;