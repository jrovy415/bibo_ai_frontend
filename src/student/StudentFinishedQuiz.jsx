import { useEffect, useState } from "react";
import { Card, Progress, Table, Spin, message, Button } from "antd";
import axios from "../../plugins/axios";
import { useAuth } from "../../composables/useAuth";
import { useLocation } from "react-router-dom";

const StudentFinishedQuiz = () => {
    const location = useLocation();
    const { attemptId } = location.state || {};

    const [loading, setLoading] = useState(true);
    const [quizData, setQuizData] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [score, setScore] = useState(0);

    const { authUser, getUser } = useAuth();

    useEffect(() => {
        const fetchQuizResult = async () => {
            try {
                getUser();

                // Fetch quiz attempt and answers
                const res = await axios.get(`/quiz-attempts/${attemptId}`);
                const { quiz, answers } = res.data.data;

                setQuizData(quiz);
                setAnswers(answers);

                // Calculate score
                const correctCount = answers.filter(a => a.is_correct).length;
                setScore(correctCount);
            } catch (err) {
                console.error(err);
                message.error("Failed to load quiz results.");
            } finally {
                setLoading(false);
            }
        };

        fetchQuizResult();
    }, [attemptId]);

    if (loading)
        return (
            <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Spin size="large" />
            </div>
        );

    if (!quizData)
        return <p style={{ textAlign: "center", marginTop: 50, fontSize: "1.2rem" }}>Quiz data not found.</p>;

    const columns = [
        {
            title: "Question",
            dataIndex: "question_text",
            key: "question",
            render: (text) => <b>{text}</b>,
        },
        {
            title: "Your Answer",
            dataIndex: "user_answer",
            key: "answer",
            render: (text, record) => (
                <span style={{ color: record.is_correct ? "green" : "crimson" }}>{text}</span>
            ),
        },
        {
            title: "Correct Answer",
            dataIndex: "correct_answer",
            key: "correct",
        },
        {
            title: "Points",
            dataIndex: "points",
            key: "points",
        },
    ];

    const totalPoints = quizData.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = ((score / totalPoints) * 100).toFixed(1);

    return (
        <div
            style={{
                width: "100vw",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: 30,
                background: "#f0f8ff",
                backgroundImage: "url('/3436801_20252.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <h1 style={{ fontSize: "2.5rem", marginBottom: 20 }}>{quizData.title}</h1>
            <p style={{ fontSize: "1.2rem", marginBottom: 20 }}>
                Grade Level: <b>{quizData.grade_level}</b> | Difficulty: <b>{quizData.difficulty}</b>
            </p>

            <Card
                style={{
                    width: "90%",
                    maxWidth: 600,
                    textAlign: "center",
                    padding: 30,
                    borderRadius: 20,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                    marginBottom: 20,
                }}
            >
                <h2>Final Score</h2>
                <p style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: 20 }}>
                    {score} / {totalPoints} points
                </p>

                <Progress
                    percent={percentage}
                    strokeColor={{
                        "0%": "#108ee9",
                        "100%": "#87d068",
                    }}
                    status={percentage >= 50 ? "active" : "exception"}
                    style={{ marginBottom: 10 }}
                />
                <p>{percentage}%</p>
            </Card>

            <h2 style={{ margin: "20px 0" }}>Question Summary</h2>
            <Table
                dataSource={answers.map(a => ({
                    key: a.id,
                    question_text: a.question.question_text,
                    user_answer: a.choice_id !== null ? a.choice?.choice_text : a.choice_string || "No Answer",
                    correct_answer: a.question.choices.find(c => c.is_correct)?.choice_text || "N/A",
                    points: a.is_correct ? a.question.points : 0,
                    is_correct: a.is_correct,
                }))}
                columns={columns}
                pagination={false}
                style={{ width: "90%", maxWidth: 800, marginBottom: 30 }}
            />

            <Button
                type="primary"
                size="large"
                onClick={() => window.location.reload()}
                style={{ backgroundColor: "#ff7f50", border: "none", padding: "10px 40px", borderRadius: 12 }}
            >
                Retake Quiz
            </Button>
        </div>
    );
};

export default StudentFinishedQuiz;
