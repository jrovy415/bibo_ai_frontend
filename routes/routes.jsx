import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Login from "../src/Login";
import Dashboard from "../src/Dashboard";
import StudentLayout from "../src/layouts/StudentLayout";

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
    {
        path: "/student",
        element: (
            <StudentProtectedRoute>
                <StudentLayout />
            </StudentProtectedRoute>
        ),
        children: [
            { path: "", element: <Default /> },
            { path: "animal", element: <Animal /> },
            { path: "weather", element: <Weather /> },
            { path: "intro_letters", element: <IntroLetters /> },
            { path: "letter_sp", element: <LetterSp /> },
            { path: "letters", element: <Letters /> },
            { path: "intro_food", element: <IntroFood /> },
            { path: "food_sp", element: <FoodSp /> },
            { path: "food_act", element: <FoodAct /> },
            { path: "intro_emo", element: <IntroEmo /> },
            { path: "emo_sp", element: <EmoSp /> },
            { path: "emo_act", element: <EmoAct /> },
            { path: "logout", element: <StudentLogout /> },
        ],
    },
]);

export default function Router() {
    return <RouterProvider router={router} />;
}
