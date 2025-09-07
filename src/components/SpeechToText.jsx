import { useState, useRef } from "react";

const SpeechToText = () => {
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef(null);

    const startListening = () => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Speech recognition is not supported in this browser. Try Chrome.");
            return;
        }

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true; // keep listening until stopped
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event) => {
            let finalTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
                finalTranscript += event.results[i][0].transcript + " ";
            }
            setTranscript(finalTranscript.trim());
        };

        recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
        };

        recognitionRef.current.onend = () => {
            setListening(false);
        };

        recognitionRef.current.start();
        setListening(true);
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setListening(false);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Speech to Text Demo</h2>
            <button onClick={startListening} disabled={listening}>
                🎤 Start
            </button>
            <button onClick={stopListening} disabled={!listening}>
                ⏹ Stop
            </button>
            <p>
                <strong>Transcript:</strong> {transcript}
            </p>
        </div>
    );
};

export default SpeechToText;
