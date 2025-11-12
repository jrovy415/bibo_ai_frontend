import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { speakText } from "./ttsUtil";
import "./HiClick.css";

export default function HiClick() {
  const [started, setStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const navigate = useNavigate();

  const modalText = "Hello! I'm BiboAI, a super cool speech recognition system that can listen and understand you. Let's have fun learning together!";

  useEffect(() => {
    speakText("Hello! Tap the button to start!");
  }, []);

const handleStart = () => {
  setStarted(true);
  setShowModal(true);
  const words = modalText.split(" ");
  let i = 0;

  const modalSpeech = new SpeechSynthesisUtterance(modalText);
  modalSpeech.pitch = 1.3;
  modalSpeech.rate = 1.0;

  // Wait for voices to be loaded
  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // Retry if voices aren't loaded yet
      setTimeout(setVoice, 200);
      return;
    }

    // Try to find a female or child-like voice
    const preferredVoice =
      voices.find((v) =>
        /(female|child|girl|kid|young)/i.test(v.name)
      ) ||
      voices.find((v) => v.lang.startsWith("en") && v.gender === "female") ||
      voices.find((v) => /(Google UK English Female|Microsoft Zira|Samantha)/i.test(v.name)) ||
      voices[0]; // fallback

    modalSpeech.voice = preferredVoice;

    // Word highlighting
    modalSpeech.onboundary = (event) => {
      if (event.name === "word" || event.charIndex !== undefined) {
        const textUpToChar = modalText.slice(0, event.charIndex);
        const currentWord = textUpToChar.split(" ").length - 1;
        setHighlightIndex(currentWord);
      }
    };

    modalSpeech.onend = () => {
      setTimeout(() => {
        setShowModal(false);
        navigate("/gameclick");
      }, 800);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(modalSpeech);
  };

  setVoice();
};


  return (
    <div className="hiclick-container">
      <div className="bubble-container">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bubble"></div>
        ))}
      </div>

      {!started ? (
        <>
          <h1 className="hiclick-title">Hi 👋</h1>
          <button onClick={handleStart} className="hiclick-button">
            Tap to Start
          </button>
        </>
      ) : (
        <h1 className="hiclick-title">Hi 👋</h1>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            {modalText.split(" ").map((word, index) => (
              <span
                key={index}
                className={index === highlightIndex ? "highlighted-word" : ""}
              >
                {word}{" "}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
