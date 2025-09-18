import { useEffect, useRef, useState } from "react";
import { Button, Card, Progress, Spin, message } from "antd";
import { AudioOutlined, SoundOutlined, PauseOutlined } from "@ant-design/icons";
import axios, { nonApi } from "../../plugins/axios";
import { useAuth } from "../../composables/useAuth";
import { useNavigate } from "react-router-dom";
import QuizMaterial from "../components/QuizMaterial";

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

    const [attemptId, setAttemptId] = useState(null); // store QuizAttempt ID
    const [showMaterials, setShowMaterials] = useState(false);

    // TTS state
    const [isSpeaking, setIsSpeaking] = useState(true);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [friendlyVoice, setFriendlyVoice] = useState(null);

    const recognitionRef = useRef(null);
    const backgroundAudioRef = useRef(null);

    const { authUser, getUser } = useAuth();

    const navigate = useNavigate();

    // Load Zira voice
    useEffect(() => {
        const loadVoice = () => {
            const voices = window.speechSynthesis.getVoices();

            // Find Microsoft Zira voice specifically
            const zira = voices.find(voice =>
                voice.name.toLowerCase().includes('zira')
            );

            if (zira) {
                setFriendlyVoice(zira);
                console.log("Zira voice found:", zira.name);
            } else {
                // Fallback to other child-friendly voices if Zira is not available
                const childFriendlyVoice = voices.find(voice =>
                    voice.name.toLowerCase().includes('karen') ||
                    voice.name.toLowerCase().includes('samantha') ||
                    voice.name.toLowerCase().includes('alice') ||
                    (voice.name.toLowerCase().includes('female') && voice.lang.startsWith('en'))
                );

                if (childFriendlyVoice) {
                    setFriendlyVoice(childFriendlyVoice);
                    console.log("Child-friendly voice found:", childFriendlyVoice.name);
                }
            }
        };

        // Load voices immediately if available
        loadVoice();

        // Also load when voices change (some browsers load voices asynchronously)
        window.speechSynthesis.onvoiceschanged = loadVoice;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    // TTS Functions
    const speak = (text, callback) => {
        if (!ttsEnabled || !text) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Child-friendly voice settings optimized for Zira
        utterance.rate = 0.85;          // Slightly slower for better comprehension
        utterance.pitch = 1.1;          // Higher pitch, more cheerful
        utterance.volume = 0.9;         // Clear volume

        // Use Zira voice if available
        if (friendlyVoice) {
            utterance.voice = friendlyVoice;
        }

        utterance.onstart = () => {
            setIsSpeaking(true);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            if (callback) callback();
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
            console.error("TTS error occurred");
        };

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const toggleTTS = () => {
        if (isSpeaking) {
            stopSpeaking();
        }
        setTtsEnabled(!ttsEnabled);
    };

    // // Fetch quiz
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                await getUser();

                const res = await axios.get("/quizzes/get-quiz");

                if (!res.data.data) {
                    setQuiz(null);
                    return;
                }

                setQuiz(res.data.data);
            } catch (err) {
                console.error(err);
                navigate("/student");
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, []);

    // TTS for quiz introduction (when quiz loads)
    useEffect(() => {
        if (quiz && !started && ttsEnabled && friendlyVoice) {
            stopSpeaking();

            const introText = `Hello there! Welcome to ${quiz.title}. This is a ${quiz.difficulty} level quiz. Take your time and click the start quiz button when you're ready to begin. Good luck!`;
            setTimeout(() => {
                speak(introText, () => {
                    setStartDisabled(false); // ✅ enable after TTS finishes
                });
            }, 1500);
        } else if (quiz && !started && !ttsEnabled) {
            // ✅ if TTS is OFF, enable after short delay
            setTimeout(() => setStartDisabled(false), 1000);
        }
    }, [quiz, started, ttsEnabled, friendlyVoice]);

    const questions = quiz?.questions || [];
    const currentQuestion = questions[currentIndex];

    // TTS for current question (when question changes)
    // useEffect(() => {
    //     if (started && currentQuestion && ttsEnabled && friendlyVoice) {
    //         const questionText = `Question ${currentIndex + 1} of ${questions.length}. ${currentQuestion.question_text}. Please speak your answer clearly.`;
    //         setTimeout(() => {
    //             speak(questionText);
    //         }, 800); // Slightly longer delay
    //     }
    // }, [currentIndex, started, currentQuestion, ttsEnabled, friendlyVoice]);

    // Speech recognition setup
    useEffect(() => {
        if (!started || !currentQuestion) return;

        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            setRecStatus("error");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        let captured = false;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => setRecStatus("listening");

        recognition.onresult = (event) => {
            const lastIndex = event.results.length - 1;
            const lastResult = event.results[lastIndex][0];
            const isFinal = event.results[lastIndex].isFinal;
            const transcriptText = lastResult.transcript.trim();

            if (transcriptText) {
                if (isFinal && !captured) {
                    captured = true;
                    setTranscript(transcriptText);
                    recognition.stop();
                    setRecStatus("idle");
                }
            }
        };

        recognition.onerror = (e) => {
            console.error("Recognition error:", e);
            setRecStatus("error");
        };

        recognition.onend = () => {
            if (!captured) {
                setTimeout(() => recognition.start(), 500);
            }
        };

        recognitionRef.current = recognition;
        setTranscript("");

        return () => {
            captured = true;
            recognition.stop();
        };
    }, [currentIndex, started, currentQuestion]);


    const startQuiz = async () => {
        stopSpeaking();

        if (!backgroundAudioRef.current) {
            const bgAudio = new Audio("/quiz-bg-music.mp3");
            bgAudio.loop = true;
            bgAudio.volume = 0.09;
            bgAudio.play().catch(err => console.error("Failed to play background audio:", err));
            backgroundAudioRef.current = bgAudio;
        }

        setStarted(true);

        try {
            const res = await axios.post("/quiz-attempts", {
                quiz_id: quiz.id,
                started_at: new Date().toISOString(),
                score: 0,
            });

            const attemptId = res.data.data.id;
            setAttemptId(attemptId);

            console.log("Attempt ID:", attemptId);

            // TTS for intro
            if (ttsEnabled) {
                const introText = "Great job! The quiz is starting! Read each statement slowly and carefully, and say your answer out loud when you’re ready. You can do it!";

                speak(introText, () => {
                    // Callback after TTS finishes
                    if (currentQuestion) {
                        recognitionRef.current?.start();
                    }
                });
            } else {
                // If TTS disabled, start recognition immediately
                recognitionRef.current?.start();
            }
        } catch (err) {
            console.error("Failed to create quiz attempt:", err);
        }
    };


    const saveAnswer = async () => {
        if (!currentQuestion || !attemptId) return;

        const answerPayload = {
            question_id: currentQuestion.id,
            student_id: authUser?.id, // if using auth, add student ID here
            attempt_id: attemptId,
            choice_id: null, // for reading type, we only have transcript
            transcript: transcript || "", // <-- send current transcript
        };

        // Save transcript locally for UI
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: transcript || "",
        }));

        try {
            await axios.post("/answers", answerPayload);
        } catch (err) {
            console.error("Failed to save answer:", err);
        }
    };

    const handleNext = () => {
        setButtonDisabled(true);
        stopSpeaking(); // Stop any ongoing speech
        saveAnswer();

        if (currentIndex < questions.length - 1) {
            setCurrentIndex((i) => i + 1);
            setTranscript("");
            setTimeout(() => {
                recognitionRef.current?.start();
                setButtonDisabled(false);
            }, 500);
        } else {
            handleFinish();
        }
    };

    const handleFinish = async () => {
        if (backgroundAudioRef.current) {
            backgroundAudioRef.current.pause();      // stop playback
            backgroundAudioRef.current.currentTime = 0; // reset to start
            backgroundAudioRef.current = null;       // clear the ref
        }

        stopSpeaking(); // Stop any ongoing speech
        recognitionRef.current?.stop();
        console.log("Final answers:", answers);
        message.success("Quiz finished! Answers captured.");
        setButtonDisabled(false);

        if (ttsEnabled) {
            speak("Fantastic! You've completed the quiz! Well done, you did amazing!");
        }

        try {
            await axios.patch(`/quiz-attempts/${attemptId}`);

            navigate("/student/finished-quiz", { state: { attemptId, answers } });
        } catch (err) {
            console.error("Failed to finish attempt:", err);
        }
    };

    if (loading)
        return (
            <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Spin size="large" />
            </div>
        );

    if (!quiz)
        return <p style={{ textAlign: "center", marginTop: 50, fontSize: "1.2rem" }}>No quiz found.</p>;

    if (!started)
        return (
            <>
                <QuizMaterial
                    visible={showMaterials}
                    onClose={() => setShowMaterials(false)}
                    material={quiz?.material && (quiz.material.title || quiz.material.content) ? quiz.material : null}
                />

                <div
                    style={{
                        width: "100vw",
                        height: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 20,
                        backgroundImage: "url('/3436801_20252.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    {/* TTS Control Button with Voice Info */}
                    <div style={{
                        position: "absolute",
                        top: 20,
                        right: 20,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 8
                    }}>
                        <Button
                            onClick={toggleTTS}
                            style={{
                                backgroundColor: ttsEnabled ? "#52c41a" : "#ff4d4f",
                                borderColor: ttsEnabled ? "#52c41a" : "#ff4d4f",
                                color: "white",
                                borderRadius: 8,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                            icon={isSpeaking ? <PauseOutlined /> : <SoundOutlined />}
                        >
                            {isSpeaking ? "Speaking..." : ttsEnabled ? "TTS ON" : "TTS OFF"}
                        </Button>
                        {friendlyVoice && (
                            <span style={{
                                fontSize: "11px",
                                color: "white",
                                backgroundColor: "rgba(0,0,0,0.6)",
                                padding: "2px 6px",
                                borderRadius: 4,
                                textShadow: "none"
                            }}>
                                Voice: {friendlyVoice.name}
                            </span>
                        )}
                    </div>

                    <div
                        style={{
                            padding: "40px 60px",
                            border: "10px solid rgba(255, 127, 80, 0.6)", // semi-solid border
                            borderRadius: 20,
                            backgroundColor: "rgba(255, 255, 255, 0.9)", // optional subtle overlay
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 20,
                        }}
                    >
                        <h1 style={{ fontSize: "2.5rem", marginBottom: 20 }}>{quiz.title}</h1>
                        <p style={{ fontSize: "1.2rem", marginBottom: 40 }}>
                            Difficulty: <b>{quiz.difficulty}</b>
                        </p>
                        <Button
                            type="default"
                            size="large"
                            onClick={() => setShowMaterials(true)}
                            style={{
                                backgroundColor: "#1890ff",
                                borderColor: "#1890ff",
                                border: "none",
                                padding: "15px 40px",
                                borderRadius: 12,
                                fontSize: "1.2rem",
                                color: "white",
                            }}
                        >
                            📘 View Materials
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            onClick={startQuiz}
                            disabled={isSpeaking || startDisabled} // ✅ add startDisabled here
                            style={{
                                backgroundColor: (isSpeaking || startDisabled) ? "#ccc" : "#ff7f50",
                                borderColor: (isSpeaking || startDisabled) ? "#ccc" : "#ff7f50",
                                border: "none",
                                padding: "15px 40px",
                                borderRadius: 12,
                                fontSize: "1.5rem",
                                opacity: (isSpeaking || startDisabled) ? 0.6 : 1,
                            }}
                        >
                            {isSpeaking ? "🔊 Speaking..." : "🚀 Start Quiz"}
                        </Button>
                    </div>
                </div>
            </>
        );

    return (
        <>
            <div style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                backgroundImage: "url('/3436801_20252.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}>
                {/* TTS Control Button with Voice Info */}
                <div style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 8
                }}>
                    <Button
                        onClick={toggleTTS}
                        style={{
                            backgroundColor: ttsEnabled ? "#52c41a" : "#ff4d4f",
                            borderColor: ttsEnabled ? "#52c41a" : "#ff4d4f",
                            color: "white",
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                        icon={isSpeaking ? <PauseOutlined /> : <SoundOutlined />}
                    >
                        {isSpeaking ? "Speaking..." : ttsEnabled ? "TTS ON" : "TTS OFF"}
                    </Button>
                    {friendlyVoice && (
                        <span style={{
                            fontSize: "11px",
                            color: "white",
                            backgroundColor: "rgba(0,0,0,0.6)",
                            padding: "2px 6px",
                            borderRadius: 4,
                            textShadow: "none"
                        }}>
                            Voice: {friendlyVoice.name}
                        </span>
                    )}
                </div>

                <h1 style={{ fontSize: "2rem", marginBottom: 10 }}>{quiz.title}</h1>
                <p style={{ fontSize: "1.2rem", marginBottom: 20 }}>
                    Difficulty: <b>{quiz.difficulty}</b>
                </p>

                <Progress percent={questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0} style={{ width: "80%", marginBottom: 20 }} />

                <Card
                    style={{
                        width: "90%",
                        maxWidth: 700,
                        textAlign: "center",
                        padding: "30px 40px",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                        fontSize: "2rem",
                        fontWeight: "bold",
                        border: "8px solid rgba(255, 127, 80, 0.6)",
                        borderRadius: 20,
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center", // ✅ center children horizontally
                    }}
                >
                    {/* ✅ Show image only if it exists */}
                    {currentQuestion?.photo && (
                        <img
                            src={`${nonApi}/${currentQuestion.photo}`}
                            alt="Question"
                            style={{
                                maxWidth: "350px", // ✅ slightly smaller
                                maxHeight: "250px",
                                width: "100%",
                                height: "auto",
                                objectFit: "contain",
                                marginBottom: 20,
                                borderRadius: 12,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            }}
                        />
                    )}

                    {/* ✅ Question text */}
                    <div style={{ marginBottom: 20 }}>{currentQuestion?.question_text}</div>

                    {/* ✅ Status */}
                    <div style={{ fontSize: "1.3rem", marginTop: 10 }}>
                        {isSpeaking ? (
                            <span style={{ color: "blue", fontWeight: "bold" }}>
                                🔊 Reading question...
                            </span>
                        ) : recStatus === "listening" ? (
                            <span
                                style={{
                                    color: "red",
                                    fontWeight: "bold",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <AudioOutlined />
                                Listening…
                            </span>
                        ) : recStatus === "error" ? (
                            <span style={{ color: "crimson" }}>
                                Mic unavailable. Check permissions.
                            </span>
                        ) : transcript && recStatus === "idle" ? (
                            <span style={{ color: "green", fontWeight: "bold" }}>
                                🎉 Answer captured! You can proceed →
                            </span>
                        ) : null}
                    </div>
                </Card>


                <Button
                    type="primary"
                    size="large"
                    onClick={handleNext}
                    disabled={recStatus === "listening" || (!transcript && recStatus === "idle") || isSpeaking}
                    style={{
                        backgroundColor: (recStatus === "listening" || (!transcript && recStatus === "idle") || isSpeaking) ? "#ccc" : "#ff7f50",
                        borderColor: (recStatus === "listening" || (!transcript && recStatus === "idle") || isSpeaking) ? "#ccc" : "#ff7f50",
                        color: "#fff",
                        padding: "10px 30px",
                        height: "auto",
                        borderRadius: "10px",
                        cursor: (recStatus === "listening" || (!transcript && recStatus === "idle") || isSpeaking) ? "not-allowed" : "pointer",
                        marginTop: "20px",
                        fontWeight: "bold",
                        fontSize: "16px",
                        boxShadow: (recStatus === "listening" || (!transcript && recStatus === "idle") || isSpeaking) ? "none" : "0 4px 8px rgba(255, 127, 80, 0.3)",
                        transition: "all 0.3s ease",
                        opacity: (recStatus === "listening" || (!transcript && recStatus === "idle") || isSpeaking) ? 0.6 : 1
                    }}
                >
                    {isSpeaking ? "🔊 Speaking..." :
                        recStatus === "listening" ? "Please wait..." :
                            (currentIndex === questions.length - 1 ? "Finish" : "Next")}
                </Button>
            </div>
        </>
    );

};

export default StudentQuiz;