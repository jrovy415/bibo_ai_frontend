import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { speakText } from "./ttsUtil";
import "./GameClick.css";

export default function GameClick() {
  const [spoken, setSpoken] = useState(false);
  const [words, setWords] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Custom TTS function with word highlighting
const speakTextWithHighlight = (text) => {
  const synth = window.speechSynthesis;
  if (!synth) return alert("Speech synthesis not supported!");

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1.4;

  // 🧠 Smart voice selector (from HiClick)
  const setVoiceAndSpeak = () => {
    const voices = synth.getVoices();

    if (voices.length === 0) {
      setTimeout(setVoiceAndSpeak, 200);
      return;
    }

    const preferredVoice =
      voices.find((v) =>
        /(female|child|girl|kid|young)/i.test(v.name)
      ) ||
      voices.find((v) =>
        /(Google UK English Female|Google US English Female|Microsoft Zira|Samantha)/i.test(v.name)
      ) ||
      voices.find((v) => v.lang.startsWith("en") && v.gender === "female") ||
      voices[0];

    utterance.voice = preferredVoice;

    // --- Word highlighting ---
    const splitWords = text.split(" ");
    setWords(splitWords);
    setIsModalOpen(true);
    setHighlightIndex(-1);

    utterance.onboundary = (event) => {
      if (event.charIndex !== undefined) {
        let totalChars = 0;
        for (let i = 0; i < splitWords.length; i++) {
          totalChars += splitWords[i].length + 1;
          if (event.charIndex < totalChars) {
            setHighlightIndex(i);
            break;
          }
        }
      }
    };

    utterance.onend = () => {
      setIsModalOpen(false);
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    };

    synth.cancel();
    synth.speak(utterance);
  };

  // ✅ Wait until voices are ready
  if (synth.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
  } else {
    setVoiceAndSpeak();
  }
};



  useEffect(() => {
    if (!spoken) {
      const message =
        "Hi there! In this game, we will learn new words together! When you see the words on the screen, say them clearly and loudly. Let's practice speaking and have fun!";
      setSpoken(true);
      speakTextWithHighlight(message);
    }
  }, []);

  return (
    <div className="gameclick-container">
      {/* Decorative bubbles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="bubble"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${20 + Math.random() * 60}px`,
            height: `${20 + Math.random() * 60}px`,
            animationDuration: `${6 + Math.random() * 5}s`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      {/* Stars */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={`star-${i}`}
          className="star"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      <p className="subtitle">Get ready to learn and speak clearly!</p>

      {/* Modal for AI Speech */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <p className="highlighted-text">
              {words.map((word, i) => (
                <span
                  key={i}
                  className={i === highlightIndex ? "highlighted" : ""}
                >
                  {word}{" "}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
