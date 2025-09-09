import { Button, Progress, Card, Spin, Carousel, Row, Col, Tag } from "antd";
import { BookOutlined, StarOutlined, TrophyOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useAuth } from "../../composables/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../plugins/axios";


const StudentDashboard = () => {
    const navigate = useNavigate();

    const [quizDone, setQuizDone] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quizAttempts, setQuizAttempts] = useState();

    const { authUser, getUser } = useAuth();

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                getUser();
                await axios.get("/quizzes/get-quiz");

            } catch (err) {
                console.error(err);
                setQuizDone(true);
            } finally {
                // Add a small delay before hiding loading
                setTimeout(() => {
                    setLoading(false);
                }, 1500);
            }
        };

        fetchQuiz();
    }, []);

    useEffect(() => {
        const fetchAttempts = async () => {
            if (!authUser?.id) return;

            try {
                const res = await axios.get(`/quiz-attempts/student-attempts/${authUser.id}`);
                setQuizAttempts(res.data.data); // 👈 set actual data
                console.log(res.data.data);
            } catch (err) {
                console.error("Error fetching attempts:", err);
            }
        };

        fetchAttempts();
    }, [authUser]);

    // Fetch all quizzes if quizDone is true and authUser is available
    useEffect(() => {
        const fetchAllQuizzes = async () => {
            if (!quizDone || !authUser?.grade_level) return;

            try {
                const res = await axios.get(`/quizzes/get-quizzes/${authUser.grade_level}`);
                setQuizzes(res.data.data || []);
            } catch (err) {
                console.error("Error fetching all quizzes:", err);
            }
        };

        fetchAllQuizzes();
    }, [quizDone, authUser]);

    const handleRetake = async (quizId) => {
        try {
            const res = await axios.post("/quiz-attempts", {
                quiz_id: quizId,
            });

            console.log("Retake success:", res.data);
            navigate("/student/quiz"); // 👈 redirect student back to quiz page
        } catch (err) {
            console.error("Error retaking quiz:", err);
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundImage: "url('/3436801_20252.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    position: "relative",
                }}
            >
                {/* Dark overlay */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(4px)",
                    }}
                />

                {/* Spinner container */}
                <div
                    style={{
                        position: "relative",
                        padding: "40px 60px",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "16px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                        textAlign: "center",
                        color: "white",
                    }}
                >
                    <Spin size="large" tip="Loading your dashboard..." />
                </div>
            </div>
        );
    }


    return (
        <div
            style={{
                width: "100vw",
                minHeight: "100vh",
                backgroundImage: "url('/3436801_20252.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                position: "relative",
            }}
        >
            {/* Overlay */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.4)",
                }}
            ></div>

            {/* Content */}
            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    color: "white",
                    padding: "20px",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: quizDone ? "flex-start" : "center",
                }}
            >
                <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginTop: quizDone ? "40px" : 0 }}>
                    Welcome, {authUser?.nickname} 👋
                </h1>

                {!quizDone && (
                    <>
                        <p style={{ fontSize: "1.4rem", marginTop: "10px" }}>
                            Ready to start your next quiz?
                        </p>

                        {/* Start Quiz Button */}
                        <motion.div whileHover={{ scale: 1.1 }} style={{ marginTop: "50px" }}>
                            <Button
                                type="primary"
                                size="large"
                                icon={<BookOutlined />}
                                onClick={() => navigate("/student/quiz")}
                                style={{
                                    backgroundColor: "#ff7f50",
                                    border: "none",
                                    padding: "30px 80px",
                                    borderRadius: "20px",
                                    fontSize: "1.8rem",
                                    fontWeight: "bold",
                                }}
                            >
                                Start Quiz
                            </Button>
                        </motion.div>
                    </>
                )}

                {/* Display quizzes if done */}


                {quizDone && quizAttempts && (
                    <div
                        style={{
                            marginTop: "60px",
                            width: "100%",
                            height: "100%",
                            padding: "0 40px",
                            position: "relative",
                            zIndex: 2,
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "2rem",
                                fontWeight: "bold",
                                color: "white",
                                textAlign: "center",
                                marginBottom: "30px",
                            }}
                        >
                            🎉 Your Quiz Attempts
                        </h2>

                        <Row gutter={[16, 16]} justify="center" style={{ marginTop: "20px" }}>
                            {[quizAttempts].flat().map((attempt, index) => {
                                const colors = ["#4FAF5D", "#2F78E0", "#E04848", "#E68100"];
                                const bgColor = colors[index % colors.length];

                                const quiz = attempt.quiz;
                                const totalQuestions = quiz?.questions?.length;
                                const completion = Math.round(
                                    (attempt?.answers?.length / totalQuestions) * 100
                                );

                                return (
                                    <Col xs={24} sm={12} lg={6} key={attempt.id}>
                                        <Card
                                            style={{
                                                borderRadius: "20px",
                                                boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
                                                backgroundColor: bgColor,
                                                color: "white",
                                                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                                cursor: "pointer",
                                                minHeight: "330px",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "space-between",
                                                overflowWrap: "break-word"
                                            }}
                                            hoverable
                                        >
                                            <div>
                                                <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>🎯</div>
                                                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                                                    {quiz?.title}
                                                </h2>
                                                <p><strong>Difficulty:</strong> {quiz?.difficulty}</p>
                                                <p><strong>Questions:</strong> {totalQuestions}</p>
                                                <div
                                                    style={{
                                                        marginTop: "15px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: "80px",
                                                            height: "80px",
                                                            borderRadius: "50%",
                                                            backgroundColor: "rgba(255,255,255,0.2)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: "1.5rem",
                                                            fontWeight: "bold",
                                                            color: "white",
                                                            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                                                        }}
                                                    >
                                                        {attempt?.score ?? 0}/{totalQuestions}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                type="primary"
                                                size="middle"
                                                style={{
                                                    marginTop: "12px",
                                                    backgroundColor: "#ff7f50",
                                                    border: "none",
                                                    borderRadius: "10px",
                                                    fontWeight: "bold",
                                                }}
                                                onClick={() => handleRetake(quiz?.id)}
                                            >
                                                Retake Quiz
                                            </Button>
                                        </Card>

                                    </Col>
                                );
                            })}
                        </Row>
                    </div>
                )}


                {/* Progress at the bottom */}
                {!quizDone && (
                    <div
                        style={{
                            position: "absolute",
                            bottom: "40px",
                            textAlign: "center",
                            width: "100%",
                        }}
                    >
                        <h3 style={{ color: "white", marginBottom: "10px" }}>Your Progress</h3>
                        <Progress type="circle" percent={65} strokeColor="#ffd700" size={120} />
                        <p style={{ marginTop: "10px", fontSize: "1rem" }}>13 of 20 quizzes completed</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
