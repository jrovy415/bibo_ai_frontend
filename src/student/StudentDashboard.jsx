import { Button, Progress, Card, Spin, Carousel, Row, Col } from "antd";
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


                {quizDone && quizzes.length > 0 && (
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
                            🎉 Your Quizzes
                        </h2>

                        <Row gutter={[24, 24]} justify="center">
                            {quizzes.map((quiz, index) => {
                                const colors = ["#FFD93D", "#6BCB77", "#4D96FF", "#FF6B6B", "#FF9F1C"];
                                const bgColor = colors[index % colors.length];

                                return (
                                    <Col xs={24} sm={12} md={8} lg={6} key={quiz.id}>
                                        <Card
                                            bordered={false}
                                            style={{
                                                borderRadius: "20px",
                                                boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
                                                backgroundColor: bgColor,
                                                color: "white",
                                                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                                cursor: "pointer",
                                                minHeight: "220px",
                                            }}
                                            bodyStyle={{ padding: "20px" }}
                                            hoverable
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.transform = "scale(1.05)")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.transform = "scale(1)")
                                            }
                                        >
                                            <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
                                                🎯
                                            </div>
                                            <h2 style={{ fontSize: "1.4rem", fontWeight: "bold" }}>
                                                {quiz.title}
                                            </h2>
                                            <p>
                                                <strong>Difficulty:</strong> {quiz.difficulty}
                                            </p>
                                            <p>
                                                <strong>Questions:</strong> {quiz.total_questions}
                                            </p>
                                            <p>
                                                <strong>Score:</strong>{" "}
                                                {quiz.best_score !== null ? `${quiz.best_score}` : "Not taken"}
                                            </p>
                                            <Progress
                                                percent={quiz.completion_percentage || 0}
                                                size="small"
                                                strokeColor="#fff"
                                                trailColor="rgba(255,255,255,0.3)"
                                            />
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
