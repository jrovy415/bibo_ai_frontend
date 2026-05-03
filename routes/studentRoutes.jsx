import { Navigate } from "react-router-dom";
import StudentLayout from "../src/layouts/StudentLayout";
import StudentDashboard from "../src/student/StudentDashboard";
import StudentQuiz from "../src/student/StudentQuiz";
import StudentFinishedQuiz from "../src/student/StudentFinishedQuiz";
import StudentLogout from "../src/StudentLogout";
import LockedScreen from "../src/student/LockedScreen";

// ── Auth guard ────────────────────────────────────────────────────────────────
const isStudentAuthenticated = () => !!localStorage.getItem("APP_STUDENT_TOKEN");

const StudentProtectedRoute = ({ children }) =>
    isStudentAuthenticated() ? children : <Navigate to="/" replace />;

// ── Student routes ─────────────────────────────────────────────────────────────
//
//  /locked            — shown when a student account is disabled
//  /student           — StudentDashboard  (home after login)
//  /student/quiz      — StudentQuiz       (active quiz session)
//  /student/finished-quiz — StudentFinishedQuiz  (results + feedback)
//  /student/logout    — StudentLogout     (outside protected route — token is
//                         already removed before navigating here, so the guard
//                         would redirect to "/" before the component mounts)
//
const studentRoutes = [
    {
        path: "/locked",
        element: <LockedScreen />,
    },
    {
        path: "/student",
        element: (
            <StudentProtectedRoute>
                <StudentLayout />
            </StudentProtectedRoute>
        ),
        children: [
            { index: true, element: <StudentDashboard /> },
            { path: "quiz", element: <StudentQuiz /> },
            { path: "finished-quiz", element: <StudentFinishedQuiz /> },
        ],
    },
    {
        path: "/student/logout",
        element: <StudentLogout />,
    },
];

export default studentRoutes;
