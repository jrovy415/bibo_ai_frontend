import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { speakText } from './ttsUtil';
import './IntroEmo.css';

const Default = () => {
  const [wiggleEmotion, setWiggleEmotion] = useState(null);
  const [showClick1Image, setShowClick1Image] = useState(false);
  const [showClick2Image, setShowClick2Image] = useState(false);
  const [showClick3Image, setShowClick3Image] = useState(false);
  const [showClick4Image, setShowClick4Image] = useState(false);
  const [showClick5Image, setShowClick5Image] = useState(false);

  const handleEmotionClick = (emotion) => {
    setWiggleEmotion(emotion);
    speakText(emotion);
  };

  const handleAnimationEnd = () => {
    setWiggleEmotion(null);
  };

  const handleQuestionClick = () => {
    speakText('Click any emotion to hear its name!');
    setShowClick1Image(true);
    setTimeout(() => {
      setShowClick1Image(false);
    }, 500);
    setTimeout(() => {
      setShowClick2Image(true);
      setTimeout(() => {
        setShowClick2Image(false);
      }, 500);
    }, 500);
    setTimeout(() => {
      setShowClick3Image(true);
      setTimeout(() => {
        setShowClick3Image(false);
      }, 500);
    }, 1000);
    setTimeout(() => {
      setShowClick4Image(true);
      setTimeout(() => {
        setShowClick4Image(false);
      }, 500);
    }, 1500);
    setTimeout(() => {
      setShowClick5Image(true);
      setTimeout(() => {
        setShowClick5Image(false);
      }, 500);
    }, 2000);
  };

  return (
    <>
      <div className="defaulthome-container">
        <div className="defaulthome-top-row" style={{ flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div>
              <Link to="/student/">
                <img src="/back.png" alt="Back" style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', height: '50px', width: 'auto' }} />
              </Link>
            </div>
            <img
              src="/question.png"
              alt="Question"
              style={{ position: 'absolute', top: 10, right: 10, width: 60, height: 60, cursor: 'pointer', zIndex: 1000 }}
              onClick={handleQuestionClick}
            />
            <div className="emotion-icons" style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginBottom: '20px' }}>
              <div
                onClick={() => handleEmotionClick('Happy')}
                onAnimationEnd={handleAnimationEnd}
                className={wiggleEmotion === 'Happy' ? 'wiggle' : ''}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <img src="/happy.png" alt="Happy" style={{ height: '180px', width: 'auto', marginBottom: '10px' }} />
                <span style={{ fontWeight: 'bold', textAlign: 'center', fontFamily: '"Comic Sans MS", cursive, sans-serif', fontSize: '3rem' }}>HAPPY</span>
              </div>
              <div
                onClick={() => handleEmotionClick('Sad')}
                onAnimationEnd={handleAnimationEnd}
                className={wiggleEmotion === 'Sad' ? 'wiggle' : ''}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <img src="/sad.png" alt="Sad" style={{ height: '180px', width: 'auto', marginBottom: '10px' }} />
                <span style={{ fontWeight: 'bold', textAlign: 'center', fontFamily: '"Comic Sans MS", cursive, sans-serif', fontSize: '3rem' }}>SAD</span>
              </div>
              <div
                onClick={() => handleEmotionClick('Angry')}
                onAnimationEnd={handleAnimationEnd}
                className={wiggleEmotion === 'Angry' ? 'wiggle' : ''}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <img src="/angry.png" alt="Angry" style={{ height: '180px', width: 'auto', marginBottom: '10px' }} />
                <span style={{ fontWeight: 'bold', textAlign: 'center', fontFamily: '"Comic Sans MS", cursive, sans-serif', fontSize: '3rem' }}>ANGRY</span>
              </div>
              <div
                onClick={() => handleEmotionClick('Scared')}
                onAnimationEnd={handleAnimationEnd}
                className={wiggleEmotion === 'Scared' ? 'wiggle' : ''}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <img src="/scared.png" alt="Scared" style={{ height: '180px', width: 'auto', marginBottom: '10px' }} />
                <span style={{ fontWeight: 'bold', textAlign: 'center', fontFamily: '"Comic Sans MS", cursive, sans-serif', fontSize: '3rem' }}>SCARED</span>
              </div>
              <div
                onClick={() => handleEmotionClick('Surprise')}
                onAnimationEnd={handleAnimationEnd}
                className={wiggleEmotion === 'Surprise' ? 'wiggle' : ''}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <img src="/surprised.png" alt="Surprised" style={{ height: '180px', width: 'auto', marginBottom: '10px' }} />
                <span style={{ fontWeight: 'bold', textAlign: 'center', fontFamily: '"Comic Sans MS", cursive, sans-serif', fontSize: '3rem' }}>SURPRISE</span>
              </div>
            </div>
            <div>
              <Link to="/student/emo_sp">
                <img src="/forward.png" alt="Forward" style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', height: '50px', width: 'auto' }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      {showClick1Image && (
        <img
          src="/click.png"
          alt="Click1"
          style={{
            position: 'fixed',
            top: '40%',
            left: '17%',
            width: 100,
            height: 100,
            zIndex: 1000,
            pointerEvents: 'none',
            animation: 'pulse 1s ease-in-out',
          }}
        />
      )}
      {showClick2Image && (
        <img
          src="/click.png"
          alt="Click2"
          style={{
            position: 'fixed',
            top: '40%',
            left: '32%',
            width: 100,
            height: 100,
            zIndex: 1000,
            pointerEvents: 'none',
            animation: 'pulse 1s ease-in-out',
          }}
        />
      )}
      {showClick3Image && (
        <img
          src="/click.png"
          alt="Click3"
          style={{
            position: 'fixed',
            top: '40%',
            left: '49%',
            width: 100,
            height: 100,
            zIndex: 1000,
            pointerEvents: 'none',
            animation: 'pulse 1s ease-in-out',
          }}
        />
      )}
      {showClick4Image && (
        <img
          src="/click.png"
          alt="Click4"
          style={{
            position: 'fixed',
            top: '40%',
            left: '65%',
            width: 100,
            height: 100,
            zIndex: 1000,
            pointerEvents: 'none',
            animation: 'pulse 1s ease-in-out',
          }}
        />
      )}
      {showClick5Image && (
        <img
          src="/click.png"
          alt="Click5"
          style={{
            position: 'fixed',
            top: '40%',
            left: '82%',
            width: 100,
            height: 100,
            zIndex: 1000,
            pointerEvents: 'none',
            animation: 'pulse 1s ease-in-out',
          }}
        />
      )}
    </>
  );
};

export default Default;
