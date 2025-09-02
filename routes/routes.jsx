import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Login from "../src/Login";
// import Register from "./pages/Register";
import Dashboard from "../src/Dashboard";

const isAuthenticated = () => {
    return !!localStorage.getItem("APP_TOKEN");
};

const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/" replace />;
};

const AuthRedirect = ({ children }) => {
    return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children;
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
]);

export default function Router() {
    return <RouterProvider router={router} />;
}
