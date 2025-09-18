import { Button, Card, Spin, Layout, Typography, message, Row, Col, Progress, Badge } from "antd";
import { useAuth } from "../../composables/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../plugins/axios";

const { Content } = Layout;
const { Title, Text } = Typography;

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { authUser, getUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [currentDifficulty, setCurrentDifficulty] = useState("Introduction");
    const [availableQuiz, setAvailableQuiz] = useState(null);
    const [allQuizzes, setAllQuizzes] = useState(null);
    const [showAllQuizzes, setShowAllQuizzes] = useState(false);

    const difficultyOrder = ["Introduction", "Easy", "Medium", "Hard"];
    const difficultyColors = {
        "Introduction": "#52C41A",
        "Easy": "#1890FF",
        "Medium": "#FA8C16",
        "Hard": "#F5222D"
    };

    useEffect(() => {
        const init = async () => {
            try {
                await getUser();
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        init();
    }, []);

    useEffect(() => {
        const fetchDifficultyAndQuiz = async () => {
            if (!authUser?.id) return;
            setLoading(true);

            try {
                const diffRes = await axios.get(`/students/${authUser.id}/difficulty`);
                const diff = diffRes.data.data?.difficulty || "Introduction";
                setCurrentDifficulty(diff);

                const quizRes = await axios.get("/quizzes/get-quiz");

                if (!quizRes.data.data) {
                    setAvailableQuiz(null);
                    setShowAllQuizzes(true);
                    setAllQuizzes([]);
                    return;
                }

                if (quizRes.data.data.questions) {
                    // Single next quiz
                    setAvailableQuiz(quizRes.data.data);
                    setShowAllQuizzes(false);
                    if (!diff || diff === "Introduction") {
                        message.info("You are starting with the Introduction quiz.");
                        navigate("/student/quiz");
                    }
                } else {
                    // All quizzes grouped by difficulty
                    setAvailableQuiz(null);
                    setShowAllQuizzes(true);
                    setAllQuizzes(quizRes.data.data);
                }

            } catch (err) {
                console.error("Error fetching difficulty/quiz:", err);
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
            const res = await axios.post("/quiz-attempts", {
                quiz_id: quizId,
                started_at: new Date().toISOString(),
                score: 0,
            });
            const attemptId = res.data.data.id;
            console.log("Quiz attempt ID:", attemptId);
            navigate(`/student/quiz`);
        } catch (err) {
            console.error("Error starting quiz:", err);
            message.error("Failed to start quiz. Please try again.");
        }
    };

    const renderQuizCard = (quiz, difficulty) => {
        const latestAttempt = quiz.latest_quiz_attempt;
        const totalQuestions = quiz.questions?.length || 0;
        const score = latestAttempt?.score ?? 0;
        const progressPercent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

        const isCompleted = !!latestAttempt?.completed_at;
        const isPerfected = progressPercent === 100;

        return (
            <Card
                key={quiz.id}
                style={{
                    marginBottom: "16px",
                    borderRadius: "12px",
                    border: `2px solid ${difficultyColors[difficulty]}`,
                    backgroundColor: "rgba(255,255,255,0.95)",
                }}
            >
                <Row justify="space-between" align="middle">
                    <Col flex="1">
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                            <Title level={5} style={{ margin: 0, marginRight: "12px" }}>
                                📚 {quiz.title}
                            </Title>
                            {isPerfected && <Badge count="Perfect!" style={{ backgroundColor: '#52c41a' }} />}
                            {isCompleted && !isPerfected && <Badge count="Completed" style={{ backgroundColor: '#1890ff' }} />}
                        </div>

                        <Text type="secondary" style={{ display: "block", marginBottom: "8px" }}>
                            {quiz.instructions}
                        </Text>

                        <div style={{ marginBottom: "12px" }}>
                            <Text strong>Questions: </Text>{totalQuestions} |
                            <Text strong> Time: </Text>{quiz.time_limit} min
                            {latestAttempt?.score != null && (
                                <>
                                    {" | "}
                                    <Text strong>Latest Score: </Text>{score}/{totalQuestions}
                                </>
                            )}
                        </div>

                        {isCompleted && (
                            <Progress
                                percent={progressPercent}
                                size="small"
                                strokeColor={isPerfected ? '#52c41a' : '#1890ff'}
                                style={{ marginBottom: "8px" }}
                            />
                        )}
                    </Col>

                    <Col>
                        <Button
                            type="primary"
                            size="middle"
                            onClick={() => startSpecificQuiz(quiz.id)}
                            style={{
                                background: `linear-gradient(90deg, ${difficultyColors[difficulty]}, ${difficultyColors[difficulty]}dd)`,
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: "bold",
                            }}
                        >
                            {isCompleted ? "🔄 Retake" : "🚀 Start"}
                        </Button>
                    </Col>
                </Row>
            </Card>
        );
    };

    if (loading || !authUser) {
        return (
            <Layout
                style={{
                    width: "100%",
                    height: "100vh",
                    backgroundImage: "url('/3436801_20252.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    position: "relative",
                }}
            >
                <Content
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Spin size="large" />
                </Content>
            </Layout>
        );
    }

    return (
        <Layout
            style={{
                width: "100%",
                minHeight: "100vh",
                backgroundImage: "url('/3436801_20252.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                position: "relative",
                overflow: "auto",
                display: 'flex',
                paddingTop: '200px',
            }}
        >
            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)" }} />
            <Content
                style={{
                    position: "relative",
                    zIndex: 1,
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                }}
            >
                {/* Welcome Card */}
                <Card
                    style={{
                        borderRadius: "25px",
                        background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)",
                        padding: "32px",
                        maxWidth: "650px",
                        width: "100%",
                        marginBottom: "32px",
                        textAlign: "center",
                        boxShadow: "0 12px 24px rgba(0,0,0,0.2)",
                        border: "4px solid #FFD700",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <div style={{ position: "absolute", top: "-20px", left: "-20px", fontSize: "60px", opacity: 0.2 }}>🧸</div>
                    <div style={{ position: "absolute", bottom: "-20px", right: "-20px", fontSize: "60px", opacity: 0.2 }}>✨</div>
                    <Title style={{ color: "#333", marginBottom: "8px", fontFamily: "'Comic Sans MS', cursive" }} level={1}>
                        🎓 Welcome, {authUser.nickname || "Student"} 👋
                    </Title>
                    <Title style={{ color: "#555", marginBottom: "8px", fontFamily: "'Comic Sans MS', cursive" }} level={3}>
                        {authUser.grade_level && authUser.section && `${authUser.grade_level} - Section ${authUser.section}`}
                    </Title>
                    <Title style={{ color: "#444", marginBottom: 0, fontFamily: "'Comic Sans MS', cursive" }} level={3}>
                        🚀 Current Level: <span style={{ color: "#FF6347" }}>{currentDifficulty}</span>
                    </Title>
                </Card>

                {/* Next Quiz or All Quizzes */}
                {!showAllQuizzes && availableQuiz ? (
                    <Card style={{ borderRadius: "25px", background: "linear-gradient(135deg, #FFFAE3, #FFD1DC)", textAlign: "center", maxWidth: "550px", width: "100%", boxShadow: "0 10px 24px rgba(0,0,0,0.2)", border: "4px solid #FFD700", padding: "24px" }}>
                        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎯</div>
                        <Title level={2} style={{ margin: "12px 0", color: "#333", fontFamily: "'Comic Sans MS', cursive" }}>
                            Next: {currentDifficulty} Level
                        </Title>
                        <Title level={4} style={{ color: "#444", marginBottom: "12px", fontFamily: "'Comic Sans MS', cursive" }}>
                            📚 {availableQuiz.title}
                        </Title>
                        <p style={{ color: "#555", fontSize: "16px", marginBottom: "20px", fontStyle: "italic" }}>
                            {availableQuiz.instructions}
                        </p>
                        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.9)", padding: "16px", borderRadius: "12px", marginBottom: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                            <p style={{ color: "#333", marginBottom: "10px", fontSize: "15px" }}><strong>📊 Difficulty:</strong> {availableQuiz.difficulty}</p>
                            {/* <p style={{ color: "#333", marginBottom: "10px", fontSize: "15px" }}><strong>⏰ Time Limit:</strong> {availableQuiz.time_limit} minutes</p> */}
                            <p style={{ color: "#333", marginBottom: "0", fontSize: "15px" }}><strong>❓ Questions:</strong> {availableQuiz.questions?.length || 0}</p>
                        </div>
                        <Button type="primary" size="large" onClick={() => startSpecificQuiz(availableQuiz.id)} style={{ background: "linear-gradient(90deg, #FF7F50, #FFB347)", border: "none", fontSize: "18px", height: "56px", paddingLeft: "40px", paddingRight: "40px", fontWeight: "bold", borderRadius: "15px", boxShadow: "0 6px 14px rgba(0,0,0,0.2)" }}>🚀 Start Quiz</Button>
                        {/* <Button type="default" size="large" onClick={() => setShowAllQuizzes(true)} style={{ fontSize: "16px", height: "56px", paddingLeft: "32px", paddingRight: "32px", borderRadius: "15px", marginTop: "8px" }}>📋 View All Quizzes</Button> */}
                    </Card>
                ) : (
                    <Card style={{ borderRadius: "25px", background: "linear-gradient(135deg, #FFFAE3, #FFD1DC)", maxWidth: "800px", width: "100%", boxShadow: "0 10px 24px rgba(0,0,0,0.2)", border: "4px solid #FFD700", padding: "24px", marginTop: "100px" }}>
                        <div style={{ textAlign: "center", marginBottom: "32px" }}>
                            <div style={{ fontSize: "64px", marginBottom: "16px" }}>📚</div>
                            <Title level={2} style={{ margin: "0", color: "#333", fontFamily: "'Comic Sans MS', cursive" }}>All Available Quizzes</Title>
                            <Text type="secondary">Choose any quiz to practice and improve your score!</Text>
                        </div>

                        {allQuizzes && difficultyOrder.map(difficulty => {
                            const quizzesInDifficulty = allQuizzes[difficulty];
                            if (!quizzesInDifficulty || quizzesInDifficulty.length === 0) return null;

                            return (
                                <div key={difficulty} style={{ marginBottom: "32px" }}>
                                    <div style={{ display: "flex", alignItems: "center", marginBottom: "16px", padding: "12px 16px", backgroundColor: difficultyColors[difficulty], borderRadius: "8px", color: "white" }}>
                                        <Title level={4} style={{ margin: 0, color: "white" }}>{difficulty} Level ({quizzesInDifficulty.length} quiz{quizzesInDifficulty.length !== 1 ? 'es' : ''})</Title>
                                    </div>
                                    {quizzesInDifficulty.map(quiz => renderQuizCard(quiz, difficulty))}
                                </div>
                            );
                        })}

                        {availableQuiz && (
                            <div style={{ textAlign: "center", marginTop: "24px" }}>
                                <Button type="primary" size="large" onClick={() => setShowAllQuizzes(false)} style={{ background: "linear-gradient(90deg, #FF7F50, #FFB347)", border: "none", fontSize: "16px", height: "48px", paddingLeft: "32px", paddingRight: "32px", borderRadius: "12px" }}>← Back to Next Quiz</Button>
                            </div>
                        )}
                    </Card>
                )}

                <div style={{ marginTop: "40px", textAlign: "center" }}>
                    <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "18px", fontFamily: "'Comic Sans MS', 'Trebuchet MS', cursive", fontWeight: "600", textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}>
                        Keep going! You're doing great! 💪
                    </p>
                </div>
            </Content>
        </Layout >
    );
};

export default StudentDashboard;
