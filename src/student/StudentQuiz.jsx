import { useEffect, useRef, useState } from "react";
import { Button, Card, Progress, Spin, message } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import axios from "../../plugins/axios";
import { useAuth } from "../../composables/useAuth";
import { useNavigate } from "react-router-dom";

const StudentQuiz = () => {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [started, setStarted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [recStatus, setRecStatus] = useState("idle");
    const [transcript, setTranscript] = useState("");
    const [answers, setAnswers] = useState({});
    const [buttonDisabled, setButtonDisabled] = useState(false);

    const [attemptId, setAttemptId] = useState(null); // store QuizAttempt ID

    const recognitionRef = useRef(null);

    const { authUser, getUser } = useAuth();

    const navigate = useNavigate();

    // Fetch quiz
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                getUser();

                const res = await axios.get("/quizzes/get-quiz");

                setQuiz(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, []);

    const questions = quiz?.questions || [];
    const currentQuestion = questions[currentIndex];

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
        let timeoutId = null;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => setRecStatus("listening");

        // recognition.onresult = (event) => {
        //     const last = event.results[event.results.length - 1];
        //     const result = last[0].transcript.trim();

        //     if (result && !captured) {
        //         setTranscript(result);
        //         captured = true;

        //         timeoutId = setTimeout(() => {
        //             recognition.stop();
        //             setRecStatus("idle");
        //         }, 300);
        //     }
        // };

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
        recognition.start();

        return () => {
            clearTimeout(timeoutId);
            captured = true;
            recognition.stop();
        };
    }, [currentIndex, started]);

    const startQuiz = async () => {
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
        } catch (err) {
            console.error("Failed to create quiz attempt:", err);
            message.error("Failed to start quiz. Please try again.");
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
            message.error("Failed to save answer.");
        }
    };

    const handleNext = () => {
        setButtonDisabled(true);
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
        recognitionRef.current?.stop();
        console.log("Final answers:", answers);
        message.success("Quiz finished! Answers captured.");
        setButtonDisabled(false);

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
                        type="primary"
                        size="large"
                        onClick={startQuiz}
                        style={{
                            backgroundColor: "#ff7f50",
                            border: "none",
                            padding: "15px 40px",
                            borderRadius: 12,
                            fontSize: "1.5rem",
                        }}
                    >
                        🚀 Start Quiz
                    </Button>
                </div>
            </div>

        );

    return (
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
            <h1 style={{ fontSize: "2rem", marginBottom: 10 }}>{quiz.title}</h1>
            <p style={{ fontSize: "1.2rem", marginBottom: 20 }}>
                Difficulty: <b>{quiz.difficulty}</b>
            </p>

            <Progress percent={questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0} style={{ width: "80%", marginBottom: 20 }} />

            <Card style={{
                width: "90%",
                maxWidth: 700,
                textAlign: "center",
                padding: 40,
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                fontSize: "2rem",
                fontWeight: "bold",
                position: "relative",
                border: "10px solid rgba(255, 127, 80, 0.6)",
                borderRadius: 20,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
            }}>
                {currentQuestion?.question_text}

                <div style={{ marginTop: 20, fontSize: "1.5rem" }}>
                    {recStatus === "listening" ? (
                        <span style={{ color: "red", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <AudioOutlined />
                            Listening…
                        </span>
                    ) : recStatus === "error" ? (
                        <span style={{ color: "crimson" }}>Mic unavailable. Check permissions.</span>
                    ) : transcript && recStatus === "idle" ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>🎉 Answer captured! You can proceed →</span>
                    ) : (
                        <span style={{ color: "gray" }}>Not listening</span>
                    )}
                </div>
            </Card>

            <Button
                type="primary"
                size="large"
                onClick={handleNext}
                disabled={!transcript && recStatus === "idle"}
                style={{ backgroundColor: !transcript ? "#ccc" : "#ff7f50", border: "none", padding: "10px 30px", borderRadius: 10, cursor: !transcript ? "not-allowed" : "pointer", marginTop: 20 }}
            >
                {currentIndex === questions.length - 1 ? "Finish" : "Next"}
            </Button>
        </div>
    );
};

export default StudentQuiz;
