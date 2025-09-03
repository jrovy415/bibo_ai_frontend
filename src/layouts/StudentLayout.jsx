import { Button } from "antd";
import { Outlet, useNavigate } from "react-router-dom";

export default function StudentLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/student/logout"); // navigates to StudentLogout.jsx
    };

    return (
        <div className="student-layout" style={{ position: "relative", minHeight: "100vh" }}>
            {/* Floating Logout button */}
            <Button
                type="primary"
                danger
                shape="round"
                size="large"
                onClick={handleLogout}
                style={{
                    position: "fixed",
                    top: "20px",
                    left: "20px",
                    zIndex: 9999,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    padding: "0 1.5rem",
                    fontWeight: "bold",
                    background: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
                    border: "none",
                }}
            >
                🚪 Logout
            </Button>


            {/* Wrapper for all student routes */}
            <Outlet />
        </div>
    );
}
