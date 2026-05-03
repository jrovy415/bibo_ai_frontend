import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import HiClick from "../src/HiClick";
import GameClick from "../src/GameClick";
import Login from "../src/Login";
import Dashboard from "../src/Dashboard";
import SpeechToText from "../src/components/SpeechToText";

import studentRoutes from "./studentRoutes";

// ── Auth guards ───────────────────────────────────────────────────────────────
const isTeacherAuthenticated = () => !!localStorage.getItem("APP_TOKEN");
const isStudentAuthenticated = () => !!localStorage.getItem("APP_STUDENT_TOKEN");

const ProtectedRoute = ({ children }) =>
    isTeacherAuthenticated() ? children : <Navigate to="/" replace />;

// Redirect already-logged-in users away from the login page
const AuthRedirect = ({ children }) => {
    if (isTeacherAuthenticated()) return <Navigate to="/dashboard" replace />;
    if (isStudentAuthenticated()) return <Navigate to="/student" replace />;
    return children;
};

// ── Routes ────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
    // Public
    { path: "/", element: <HiClick /> },
    { path: "/gameclick", element: <GameClick /> },
    {
        path: "/login",
        element: (
            <AuthRedirect>
                <Login />
            </AuthRedirect>
        ),
    },

    // Teacher (protected)
    {
        path: "/dashboard",
        element: (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        ),
    },

    // Student routes (see studentRoutes.jsx)
    ...studentRoutes,

    // Dev / utility
    { path: "/speech", element: <SpeechToText /> },
]);

export default function Router() {
    return <RouterProvider router={router} />;
}
