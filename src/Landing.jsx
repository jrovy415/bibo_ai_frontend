import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TTS from "../TTS";
const Landing = () => {
    const [countdown, setCountdown] = useState(null);
    const [startCountdown, setStartCountdown] = useState(false);
    const navigate = useNavigate();

    // Handle countdown logic
    useEffect(() => {
        let timer;
        if (startCountdown && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0) {
            navigate('/next'); // Navigate when countdown reaches 0
        }

        return () => clearTimeout(timer);
    }, [countdown, startCountdown, navigate]);

    // Start countdown when the button is clicked
    const handleClick = () => {
        setCountdown(5); // Set initial countdown value
        setStartCountdown(true); // Start countdown
    };

    <div className="background-container">
        <div className="content-column">
            <p><TTS>Hi, my name is OpenAI Whisper! I am here to help you read!</TTS></p>
            {/* Countdown Number */}
            {countdown !== null && countdown > 0 && (
                <div className="countdown-number">{countdown}</div>
            )}

            {/* Character Image */}
            <img
                src="/freepik__background__27761-removebg-preview.png"
                alt="Character"
                className="character-img"
            />

            {/* Button to Start Countdown */}
            <button onClick={handleClick}>Let’s read!</button>
        </div>
    </div>
}

export default Landing;