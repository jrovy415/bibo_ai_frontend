// src/StudentLogout.jsx
import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function StudentLogout() {
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async () => {
            try {
                const token = localStorage.getItem("APP_STUDENT_TOKEN");

                if (token) {
                    await axios.post(
                        "/api/students/logout",
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                }
            } catch (error) {
                console.error("Logout failed", error);
            } finally {
                // Clear student session
                localStorage.removeItem("APP_STUDENT_TOKEN");
                localStorage.removeItem("APP_STUDENT");

                // Redirect to login
                navigate("/", { replace: true });
            }
        };

        logout();
    }, [navigate]);

    return <div>Logging out...</div>;
}
