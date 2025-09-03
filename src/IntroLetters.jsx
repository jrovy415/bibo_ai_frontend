
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './IntroLetters.css';
import { speakText } from './ttsUtil';

const Default = () => {
  const [speaking, setSpeaking] = useState(null);
  const [wiggle, setWiggle] = useState(null);
  const [showClick1Image, setShowClick1Image] = useState(false);
  const [showClick2Image, setShowClick2Image] = useState(false);
  const [showClick3Image, setShowClick3Image] = useState(false);
  const [showClick4Image, setShowClick4Image] = useState(false);

  const handleSpeak = (text, letter) => {
    if (!text) return;

    setSpeaking(letter);
    setWiggle(letter);
    setTimeout(() => setWiggle(null), 500);

    speakText(text, { lang: 'en-US', rate: 1, pitch: 1 });

    // Since speakText does not provide callbacks, reset speaking state after 1.5s
    setTimeout(() => setSpeaking(null), 1500);
  };

  const handleQuestionClick = () => {
    speakText("Click anything, they will tell you about the letter A!", { lang: 'en-US', rate: 1, pitch: 1 });

    setShowClick1Image(true);
    setTimeout(() => {
      setShowClick1Image(false);
    }, 1000);

    setTimeout(() => {
      setShowClick2Image(true);
      setTimeout(() => {
        setShowClick2Image(false);
      }, 1000);
    }, 500);

    setTimeout(() => {
      setShowClick3Image(true);
      setTimeout(() => {
        setShowClick3Image(false);
      }, 1000);
    }, 1000);

    setTimeout(() => {
      setShowClick4Image(true);
      setTimeout(() => {
        setShowClick4Image(false);
      }, 1000);
    }, 1500);
  };

  return (
    <div className="defaulthome-container" style={{display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', justifyContent: 'center', alignItems: 'center'}}>
      <Link to="/student">
        <img src="/back.png" alt="Back" style={{position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', width: 60, height: 60, borderRadius: '50%', objectFit: 'cover'}} />
      </Link>
      <Link to="/student/letter_sp">
        <img src="/forward.png" alt="Forward" style={{position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer'}} />
      </Link>
      <img
        src="/question.png"
        alt="Question"
        style={{ position: 'absolute', top: 10, right: 10, width: 60, height: 60, zIndex: 1000, cursor: 'pointer' }}
      onClick={handleQuestionClick}
      />
      {showClick1Image && (
        <img
          src="/click.png"
          alt="Click1"
          className="click-image"
        />
      )}
      {showClick2Image && (
        <img
          src="/click.png"
          alt="Click2"
          className="click-image2"
        />
      )}
      {showClick3Image && (
        <img
          src="/click.png"
          alt="Click3"
          className="click-image3"
        />
      )}
      {showClick4Image && (
        <img
          src="/click.png"
          alt="Click4"
          className="click-image4"
        />
      )}
      <h2
        onClick={() => handleSpeak('This is the Letter A!', 'topSentence')}
        className={wiggle === 'topSentence' ? 'wiggle' : ''}
        style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif", fontWeight: 'bold', fontSize: '4rem', color: 'black', textAlign: 'center', marginBottom: '20px', cursor: 'pointer' }}
      >
        This is the Letter A!
      </h2>
      <div style={{display: 'flex', flexDirection: 'row', gap: '50px', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: '50px', alignItems: 'center'}}>
          <div
            className={wiggle === 'A1' ? 'wiggle' : ''}
            style={{
              fontSize: '100px',
              fontWeight: 'bold',
              fontFamily: "'Comic Sans MS', cursive, sans-serif",
              color: speaking === 'A1' ? 'green' : '#000',
              cursor: 'pointer',
            }}
            onClick={() => handleSpeak('This is the Letter A', 'A1')}
          >
            A
          </div>
          <div
            className={wiggle === 'a1' ? 'wiggle' : ''}
            style={{
              fontSize: '100px',
              fontWeight: 'bold',
              fontFamily: "'Comic Sans MS', cursive, sans-serif",
              color: speaking === 'a1' ? 'green' : '#000',
              cursor: 'pointer',
            }}
            onClick={() => handleSpeak('This is also the Letter a', 'a1')}
          >
            a
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '50px', alignItems: 'center'}}>
          <div
            className={wiggle === 'A2' ? 'wiggle' : ''}
            style={{
              fontSize: '100px',
              fontWeight: 'bold',
              fontFamily: "'Comic Sans MS', cursive, sans-serif",
              color: speaking === 'A2' ? 'green' : '#000',
              cursor: 'pointer',
            }}
            onClick={() => handleSpeak('This is the big Letter A', 'A2')}
          >
            A
          </div>
          <div
            className={wiggle === 'a2' ? 'wiggle' : ''}
            style={{
              fontSize: '100px',
              fontWeight: 'bold',
              fontFamily: "'Comic Sans MS', cursive, sans-serif",
              color: speaking === 'a2' ? 'green' : '#000',
              cursor: 'pointer',
            }}
            onClick={() => handleSpeak('This is the small letter a', 'a2')}
          >
            a
          </div>
        </div>
        <div
          className={wiggle === 'Aa' ? 'wiggle' : ''}
          style={{
            fontSize: '100px',
            fontWeight: 'bold',
            fontFamily: "'Comic Sans MS', cursive, sans-serif",
            color: speaking === 'Aa' ? 'green' : '#000',
            cursor: 'pointer',
          }}
          onClick={() => handleSpeak('Both of them are letter A!', 'Aa')}
        >
          Aa
        </div>
      </div>
      <h3
        onClick={() => handleSpeak('A is for Airplane!', 'bottomSentence')}
        className={wiggle === 'bottomSentence' ? 'wiggle' : ''}
        style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif", fontWeight: 'bold', fontSize: '5rem', color: 'black', textAlign: 'center', marginTop: '20px', cursor: 'pointer' }}
      >
        A is for Airplane! ✈️
      </h3>
    </div>
  );
};

export default Default;
