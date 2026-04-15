import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import HiClick from "../src/HiClick";
import GameClick from "../src/GameClick";
import Login from "../src/Login";
import Dashboard from "../src/Dashboard";
import StudentLayout from "../src/layouts/StudentLayout";
import LockedScreen from "../src/student/LockedScreen";

import Animal from "../src/Animal";
import Default from "../src/DefaultHome";
import Weather from "../src/Weather";
import IntroLetters from "../src/IntroLetters";
import LetterSp from "../src/LetterSp";
import Letters from "../src/Letters";
import IntroFood from "../src/IntroFood";
import FoodSp from "../src/FoodSp";
import FoodAct from "../src/FoodAct";
import IntroEmo from "../src/IntroEmo";
import EmoSp from "../src/EmoSp";
import EmoAct from "../src/EmoAct";
import StudentLogout from "../src/StudentLogout";
import StudentDashboard from "../src/student/StudentDashboard";
import StudentQuiz from "../src/student/StudentQuiz";
import SpeechToText from "../src/components/SpeechToText";
import StudentFinishedQuiz from "../src/student/StudentFinishedQuiz";

// check teacher login
const isTeacherAuthenticated = () => {
    return !!localStorage.getItem("APP_TOKEN");
};

// check student login
const isStudentAuthenticated = () => {
    return !!localStorage.getItem("APP_STUDENT_TOKEN");
};

// general check for *any* login
const isAuthenticated = () => {
    return isTeacherAuthenticated() || isStudentAuthenticated();
};

// protect teacher routes
const ProtectedRoute = ({ children }) => {
    return isTeacherAuthenticated() ? children : <Navigate to="/" replace />;
};

// protect student routes
const StudentProtectedRoute = ({ children }) => {
    return isStudentAuthenticated() ? children : <Navigate to="/" replace />;
};

// redirect if already logged in as teacher
const AuthRedirect = ({ children }) => {
    if (isTeacherAuthenticated()) {
        return <Navigate to="/dashboard" replace />;
    }
    if (isStudentAuthenticated()) {
        return <Navigate to="/student" replace />;
    }
    return children;
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <HiClick />,
    },
    {
        path: "/gameclick",
        element: <GameClick />,
    },
    {
        path: "/login",
        element: (
            <AuthRedirect>
                <Login />
            </AuthRedirect>
        ),
    },
    {
        path: "/dashboard",
        element: (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        ),
    },
    // ── Locked account screen ─────────────────────────────────────────────
    // No auth protection needed — student is locked out so they have no token
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
            { path: "", element: <StudentDashboard /> },
            { path: "quiz", element: <StudentQuiz /> },
            { path: "finished-quiz", element: <StudentFinishedQuiz /> },
            { path: "logout", element: <StudentLogout /> },
        ],
    },
    {
        path: "/speech",
        element: <SpeechToText />
    }
]);

export default function Router() {
    return <RouterProvider router={router} />;
}