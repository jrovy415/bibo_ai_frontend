import { Button } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import bgAudio from "../../plugins/bgAudio";

export default function StudentLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Stop AI voice (Web Speech API)
        window.speechSynthesis.cancel();

        // Stop background music via the global reference
        if (bgAudio.instance) {
            bgAudio.instance.pause();
            bgAudio.instance.currentTime = 0;
            bgAudio.instance = null;
        }

        navigate("/student/logout");
    };

    return (
        <div className="student-layout" style={{ position: "relative", minHeight: "100vh", maxWidth: "100vw", width: "100vw" }}>
            {/* Floating Logout button */}
            <Button
                type="primary"
                danger
                shape="round"
                size="large"
                onClick={handleLogout}
                style={{
                    position: "fixed",
                    top: "70px",
                    left: "20px",
                    zIndex: 9999,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    padding: "0 1.5rem",
                    fontWeight: "bold",
                    background: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
                    border: "none",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
            >
                🚪 Logout
            </Button>

            {/* Wrapper for all student routes */}
            <Outlet />
        </div>
    );
}