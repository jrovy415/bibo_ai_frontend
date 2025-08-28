import React, { useState, useRef, useEffect } from 'react';
import './NextPage.css';
import { Link } from 'react-router-dom';
import { speakText } from './ttsUtil';

function Letters() {
  const [glowLettersLeft, setGlowLettersLeft] = useState({});
  const [glowLettersRight, setGlowLettersRight] = useState({});
  const [connections, setConnections] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);

  const [wiggleSentence, setWiggleSentence] = useState(false);
  const [wiggleLeft, setWiggleLeft] = useState(false);
  const [wiggleRight, setWiggleRight] = useState({ a: false, b: false, c: false });

  const [showClickImage, setShowClickImage] = useState(false);
  const [showClickImage2, setShowClickImage2] = useState(false);
  const [showClickImage3, setShowClickImage3] = useState(false);
  const [showClickImage4, setShowClickImage4] = useState(false);
  const [showClickImage5, setShowClickImage5] = useState(false);
  const [ttsMessage, setTtsMessage] = useState('');
  const [ttsKey, setTtsKey] = useState(0);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const leftRefs = {
    A: useRef(null),
  };

  const rightRefs = {
    a: useRef(null),
    b: useRef(null),
    c: useRef(null),
  };

  const letterColors = {
    A: '#00FF00', // Green
  };

  const getGlowStyle = (letter) => {
    const color = letterColors[letter.toUpperCase()] || '#0ff';
    return {
      textShadow: `0 0 8px ${color}, 0 0 12px ${color}, 0 0 20px ${color}`,
    };
  };

  const getLetterCenter = (ref) => {
    if (!ref.current || !containerRef.current) return null;
    const rect = ref.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top + rect.height / 2 - containerRect.top,
    };
  };

  const [showCheckImage, setShowCheckImage] = useState(false);
  const [showWrongImage, setShowWrongImage] = useState(false);

  const checkMatch = (left, right) => {
    if (left === 'A' && ['a', 'b', 'c'].includes(right)) {
      const start = getLetterCenter(leftRefs[left]);
      const end = getLetterCenter(rightRefs[right]);

      if (start && end) {
        const color = right === 'a' ? letterColors[left] : 'red';
        setConnections([{ left, right, start, end, color }]);
        setGlowLettersLeft({ [left]: true });
        setGlowLettersRight({ [right]: true });

        if (right === 'a') {
          setShowCheckImage(true);
          setTimeout(() => setShowCheckImage(false), 1000);
          // Play correct sound
          const correctAudio = new Audio('/correct.mp3');
          correctAudio.play();
        } else {
          setShowWrongImage(true);
          setTimeout(() => setShowWrongImage(false), 1000);
          // Play wrong sound
          const wrongAudio = new Audio('/wrong.mp3');
          wrongAudio.play();
        }
      }
    }
  };

  const handleLeftClick = (letter) => {
    setSelectedLeft(letter);
    setWiggleLeft(true);
    setTimeout(() => setWiggleLeft(false), 1000);
    speakText(letter);
    if (selectedRight) {
      checkMatch(letter, selectedRight);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const handleRightClick = (letter) => {
    setSelectedRight(letter);
    setWiggleRight((prev) => ({ ...prev, [letter]: true }));
    setTimeout(() => setWiggleRight((prev) => ({ ...prev, [letter]: false })), 1000);
    speakText(letter);
    if (selectedLeft) {
      checkMatch(selectedLeft, letter);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const handleSentenceClick = () => {
    setWiggleSentence(true);
    setTimeout(() => setWiggleSentence(false), 1000);
    speakText('Help the big letter A find the small letter A!');
  };

  useEffect(() => {
    if (ttsMessage) {
      speakText(ttsMessage);
    }
  }, [ttsMessage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = container.getBoundingClientRect();

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    connections.forEach(({ start, end, color }) => {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.stroke();
    });
  }, [connections]);

  const columnStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'center',
  };

  const rowStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '100px',
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100vh',
    color: 'black',
    position: 'relative',
    fontFamily: '"Comic Sans MS", cursive, sans-serif',
    fontWeight: 'bold',
  };

  const textStyle = {
    textAlign: 'center',
    marginTop: '20px',
    marginBottom: '40px',
    fontSize: '2.5rem',
    color: 'black',
    fontFamily: '"Comic Sans MS", cursive, sans-serif',
    fontWeight: 'bold',
    animation: wiggleSentence ? 'wiggle 1s ease-in-out' : 'none',
  };

  const letterStyle = (letter) => {
    const glowStyle =
      (letter === 'A' && glowLettersLeft['A']) || glowLettersRight[letter]
        ? getGlowStyle(letter.toUpperCase())
        : {};
    const wiggleAnimation =
      (letter === 'A' && wiggleLeft) || wiggleRight[letter] ? 'wiggle 1s ease-in-out' : 'none';

    return {
      fontSize: '4rem',
      cursor: 'pointer',
      color: 'black',
      fontFamily: '"Comic Sans MS", cursive, sans-serif',
      fontWeight: 'bold',
      animation: wiggleAnimation,
      ...glowStyle,
    };
  };

  const handleQuestionClick = () => {
    setShowClickImage(true);
    speakText('Help the big letter find the small letter! Click big letter, then click the correct small letter!');
    setTimeout(() => setShowClickImage(false), 1000);
    setTimeout(() => setShowClickImage2(true), 2100);
    setTimeout(() => setShowClickImage2(false), 3500);
    setTimeout(() => {
      setShowClickImage3(true);
      setShowClickImage4(true);
      setShowClickImage5(true);
    }, 3500);
    setTimeout(() => {
      setShowClickImage3(false);
      setShowClickImage4(false);
      setShowClickImage5(false);
    }, 4800);
  };

  return (
    <>
      <style>
        {`
          @keyframes wiggle {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
          }
          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              transform: translate(-50%, -50%) scale(1.1);
            }
            100% {
              transform: translate(-50%, -50%) scale(1);
            }
          }
        `}
      </style>
      <div className="nextpage-container" ref={containerRef} style={{ position: 'relative', ...containerStyle }}>
        <div>
          <h2 style={textStyle} onClick={handleSentenceClick}>
            Help the big letter A find the small A!
          </h2>
          <div style={rowStyle}>
            <h1
              style={letterStyle('A')}
              ref={leftRefs.A}
              onClick={() => handleLeftClick('A')}
            >
              A
            </h1>
            <div style={columnStyle}>
              {['b', 'c', 'a'].map((letter) => (
                <h1
                  key={letter}
                  style={letterStyle(letter)}
                  ref={rightRefs[letter]}
                  onClick={() => handleRightClick(letter)}
                >
                  {letter}
                </h1>
              ))}
            </div>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
        <Link to="/LetterSp">
          <img
            src="/back.png"
            alt="Back"
            style={{
              position: 'absolute',
              top: '50%',
              left: 10,
              transform: 'translateY(-50%)',
              width: 60,
              height: 60,
              borderRadius: '50%',
              objectFit: 'cover',
              zIndex: 3,
            }}
          />
        </Link>
          <img
            src="/question.png"
            alt="Question"
            onClick={handleQuestionClick}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 60,
              height: 60,
              cursor: 'pointer',
              zIndex: 5,
            }}
          />
          {showClickImage && (
            <img
              src="/click.png"
              alt="Click1"
              style={{
                position: 'fixed',
                top: '20%',
                left: '55%',
                width: 100,
                height: 100,
                zIndex: 10,
                pointerEvents: 'none',
                animation: 'pulse 1s ease-in-out',
                transformOrigin: 'center center',
                transform: 'translate(-50%, -50%) scale(1)',
              }}
            />
          )}
          {showClickImage2 && (
            <img
              src="/click.png"
              alt="Click2"
              style={{
                position: 'fixed',
                top: '57%',
                left: '48%',
                width: 100,
                height: 100,
                zIndex: 11,
                pointerEvents: 'none',
                animation: 'pulse 1s ease-in-out',
                transformOrigin: 'center center',
                transform: 'translate(-50%, -50%) scale(1)',
              }}
            />
          )}
          {showClickImage3 && (
            <img
              src="/click.png"
              alt="Click3"
              style={{
                position: 'fixed',
                top: '57%',
                left: '57%',
                width: 100,
                height: 100,
                zIndex: 12,
                pointerEvents: 'none',
                animation: 'pulse 1s ease-in-out',
                transformOrigin: 'center center',
                transform: 'translate(-50%, -50%) scale(1)',
              }}
            />
          )}
          {showClickImage4 && (
            <img
              src="/click.png"
              alt="Click4"
              style={{
                position: 'fixed',
                top: '37%',
                left: '57%',
                width: 100,
                height: 100,
                zIndex: 13,
                pointerEvents: 'none',
                animation: 'pulse 1s ease-in-out',
                transformOrigin: 'center center',
                transform: 'translate(-50%, -50%) scale(1)',
              }}
            />
          )}
          {showClickImage5 && (
            <img
              src="/click.png"
              alt="Click5"
              style={{
                position: 'fixed',
                top: '77%',
                left: '57%',
                width: 100,
                height: 100,
                zIndex: 14,
                pointerEvents: 'none',
                animation: 'pulse 1s ease-in-out',
                transformOrigin: 'center center',
                transform: 'translate(-50%, -50%) scale(1)',
              }}
            />
          )}
          {showCheckImage && (
            <img
              src="/check.png"
              alt="Check"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                width: 120,
                height: 120,
                zIndex: 20,
                pointerEvents: 'none',
                animation: 'pulse 1s ease-in-out',
                transformOrigin: 'center center',
                transform: 'translate(-50%, -50%) scale(1)',
              }}
            />
          )}
          {showWrongImage && (
            <img
              src="/wrong.png"
              alt="Wrong"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                width: 120,
                height: 120,
                zIndex: 21,
                pointerEvents: 'none',
                animation: 'pulse 1s ease-in-out',
                transformOrigin: 'center center',
                transform: 'translate(-50%, -50%) scale(1)',
              }}
            />
          )}
          {/* Removed visual display of ttsMessage as per user request */} 
          {/* {ttsMessage && <span key={ttsKey}>{ttsMessage}</span>} */}
        </div>
      </>
    );
  }

export default Letters;
