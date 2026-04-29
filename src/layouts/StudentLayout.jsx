import { Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import bgAudio from "../../plugins/bgAudio";

// Inject global reset to ensure nothing clips the page
const globalStyle = `
  html, body, #root {
    margin: 0 !important;
    padding: 0 !important;
    height: auto !important;
    min-height: 100% !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    box-sizing: border-box !important;
  }
`;

export default function StudentLayout() {
    const navigate  = useNavigate();
    const location  = useLocation();

    // Hide the Logout button on the finished-quiz page —
    // that page has its own "Finish" button that handles logout cleanly.
    const hideLogout = location.pathname.includes("/finished-quiz");

    const handleLogout = () => {
        window.speechSynthesis.cancel();
        if (bgAudio.instance) {
            bgAudio.instance.pause();
            bgAudio.instance.currentTime = 0;
            bgAudio.instance = null;
        }
        navigate("/student/logout");
    };

    return (
        <>
            <style>{globalStyle}</style>
            <div
                className="student-layout"
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "100%",
                    minHeight: "100vh",
                    overflowX: "hidden",
                    overflowY: "auto",
                    boxSizing: "border-box",
                }}
            >
                {/* Only show Logout button when NOT on the finished-quiz page */}
                {!hideLogout && (
                    <Button
                        type="primary"
                        danger
                        shape="round"
                        size="large"
                        onClick={handleLogout}
                        style={{
                            position: "fixed",
                            bottom: "24px",
                            right: "24px",
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
                )}

                <Outlet />
            </div>
        </>
    );
}