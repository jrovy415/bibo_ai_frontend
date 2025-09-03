import React, { useState, useRef } from 'react';
import './EmoAct.css';
import { Link } from 'react-router-dom';
import { speakText } from './ttsUtil';

const Default = () => {
  const [wiggleText, setWiggleText] = useState(false);
  const [wiggleImage, setWiggleImage] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [glow, setGlow] = useState(null); // 'yes' or 'no' or null

  const correctAudio = useRef(new Audio('/correct.mp3'));
  const wrongAudio = useRef(new Audio('/wrong.mp3'));

  const containerStyle = {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '80px',
    textAlign: 'center',
  };

  const topTextStyle = {
    fontSize: '4rem',
    fontWeight: 'bold',
    fontFamily: "'Comic Sans MS', cursive, sans-serif",
    cursor: 'pointer',
    animation: wiggleText ? 'wiggle 0.5s ease-in-out' : 'none',
  };

  const bottomRowStyle = {
    display: 'flex',
    gap: '100px',
    fontSize: '3rem',
    fontWeight: 'bold',
    fontFamily: "'Comic Sans MS', cursive, sans-serif",
  };

  const imageStyle = {
    width: '150px',
    height: '150px',
    objectFit: 'contain',
    cursor: 'pointer',
    animation: wiggleImage ? 'wiggle 0.5s ease-in-out' : 'none',
  };

  const handleTextClick = () => {
    setWiggleText(true);
    speakText('Is this person Happy?');
    setTimeout(() => setWiggleText(false), 500);
  };

  const handleImageClick = () => {
    setWiggleImage(true);
    setTimeout(() => setWiggleImage(false), 500);
  };

  const handleYesClick = () => {
    if (glow === 'yes') {
      setGlow(null);
    } else {
      setGlow('yes');
    }
    setShowWrong(true);
    setShowCheck(false);
    wrongAudio.current.play();
    setTimeout(() => {
      setShowWrong(false);
    }, 1000);
  };

  const handleNoClick = () => {
    if (glow === 'no') {
      setGlow(null);
    } else {
      setGlow('no');
    }
    setShowCheck(true);
    setShowWrong(false);
    correctAudio.current.play();
    setTimeout(() => {
      setShowCheck(false);
    }, 1000);
  };

  return (
    <div className="defaulthome-container" style={containerStyle}>
      <Link to="/student/emo_sp">
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
            cursor: 'pointer',
            borderRadius: '50%',
            objectFit: 'cover',
            zIndex: 3,
          }}
        />
      </Link>
      <div style={topTextStyle} onClick={handleTextClick}>Is this person Happy?</div>
      <img src="/sad.png" alt="Sad" style={imageStyle} onClick={handleImageClick} />
      <div style={bottomRowStyle}>
        <button onClick={handleYesClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '3rem', fontWeight: 'bold', fontFamily: "'Comic Sans MS', cursive, sans-serif", cursor: 'pointer', background: '#b0b0b0', border: 'none', padding: '10px 20px', borderRadius: '8px', boxShadow: glow === 'yes' ? '0 0 15px 5px red' : 'none' }}>
          <span role="img" aria-label="thumbs up">👍</span> Yes
        </button>
        <button onClick={handleNoClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '3rem', fontWeight: 'bold', fontFamily: "'Comic Sans MS', cursive, sans-serif", cursor: 'pointer', background: '#b0b0b0', border: 'none', padding: '10px 20px', borderRadius: '8px', boxShadow: glow === 'no' ? '0 0 15px 5px green' : 'none' }}>
          <span role="img" aria-label="thumbs down">👎</span> No
        </button>
      </div>
      {showCheck && (
        <img
          src="/check.png"
          alt="Check"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 100,
            height: 100,
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />
      )}
      {showWrong && (
        <img
          src="/wrong.png"
          alt="Wrong"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 100,
            height: 100,
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />
      )}
      <style>
        {`
          @keyframes wiggle {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Default;
