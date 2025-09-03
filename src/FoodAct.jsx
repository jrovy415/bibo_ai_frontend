import React, { useState, useEffect } from 'react';
import './FoodAct.css';
import { Link } from 'react-router-dom';
import { speakText } from './ttsUtil';

const Default = () => {
  const [animating, setAnimating] = useState(null);
  const [feedbackImage, setFeedbackImage] = useState({});
  const [audio, setAudio] = useState(null);

  const containerStyle = {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '40px',
    textAlign: 'center',
    position: 'relative',
  };

  const topTextStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    fontFamily: "'Comic Sans MS', cursive, sans-serif",
    marginTop: 0,
  };

  const centerRowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: 'repeat(2, 1fr)',
    gap: '40px',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  };

  const imageStyle = {
    width: '150px',
    height: '150px',
    objectFit: 'contain',
  };

  const bottomRowStyle = {
    display: 'flex',
    gap: '100px',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    fontFamily: "'Comic Sans MS', cursive, sans-serif",
  };

  useEffect(() => {
    if (audio) {
      audio.play();
      const handleEnded = () => setAudio(null);
      audio.addEventListener('ended', handleEnded);
      return () => {
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audio]);

  const handleClick = (name) => {
    speakText(name);
    setAnimating(name);

    if (name === 'apple') {
      setFeedbackImage({ [name]: '/check.png' });
      setAudio(new Audio('/correct.mp3'));
    } else if (['cereal', 'cheese'].includes(name)) {
      setFeedbackImage({ [name]: '/wrong.png' });
      setAudio(new Audio('/wrong.mp3'));
    } else {
      setFeedbackImage({});
      setAudio(null);
    }

    setTimeout(() => {
      setAnimating(null);
      setFeedbackImage({});
    }, 1000);
  };

  const getAnimationClass = (name) => {
    if (animating !== name) return '';
    if (['carrot', 'broccoli', 'orange', 'apple'].includes(name)) return 'glow';
    if (name === 'cereal') return 'wiggle';
    if (name === 'cheese') return 'pulse';
    return '';
  };

  return (
    <div className="foodact-container" style={containerStyle}>
      <Link to="/student/food_sp">
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
            cursor: 'pointer',
          }}
        />
      </Link>

      <div style={centerRowStyle}>
        <img
          src="/carrot.png"
          alt="carrot"
          style={imageStyle}
          className={getAnimationClass('carrot')}
          onClick={() => handleClick('carrot')}
        />
        <img
          src="/broccoli.png"
          alt="broccoli"
          style={imageStyle}
          className={getAnimationClass('broccoli')}
          onClick={() => handleClick('broccoli')}
        />
        <img
          src="/question.png"
          alt="question"
          style={imageStyle}
          className={animating === 'question' ? 'glow' : ''}
          onClick={() => {
            speakText('What is the missing GLOW Food?');
            setAnimating('question');
            setTimeout(() => setAnimating(null), 500);
          }}
        />
        <img
          src="/orange.png"
          alt="orange"
          style={imageStyle}
          className={getAnimationClass('orange')}
          onClick={() => handleClick('orange')}
        />
      </div>

      <div
        style={topTextStyle}
        className={animating === 'sentence' ? 'wiggle' : ''}
        onClick={() => {
          speakText('Help me find the missing GLOW Food!');
          setAnimating('sentence');
          setTimeout(() => setAnimating(null), 500);
        }}
      >
        Help me find the missing GLOW Food!
      </div>

      <div style={bottomRowStyle}>
        <div style={{ position: 'relative' }}>
          <img
            src="/apple.png"
            alt="apple"
            style={imageStyle}
            className={getAnimationClass('apple')}
            onClick={() => handleClick('apple')}
          />
          {feedbackImage['apple'] === '/check.png' && (
            <img
              src={feedbackImage['apple']}
              alt="check"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '150px',
                height: '150px',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <img
            src="/cereal.png"
            alt="cereal"
            style={imageStyle}
            className={getAnimationClass('cereal')}
            onClick={() => handleClick('cereal')}
          />
          {feedbackImage['cereal'] === '/wrong.png' && (
            <img
              src={feedbackImage['cereal']}
              alt="wrong"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '150px',
                height: '150px',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <img
            src="/cheese.png"
            alt="cheese"
            style={imageStyle}
            className={getAnimationClass('cheese')}
            onClick={() => handleClick('cheese')}
          />
          {feedbackImage['cheese'] === '/wrong.png' && (
            <img
              src={feedbackImage['cheese']}
              alt="wrong"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '150px',
                height: '150px',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Default;
