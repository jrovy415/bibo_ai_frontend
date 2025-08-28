import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { speakText } from './ttsUtil';
import './DefaultHome.css';

const topics = [
  {
    title: 'Letters',
    description: 'Learn the alphabet from A to Z',
    link: '/IntroLetters',
    image: '/Aa.png'
  },
  {
    title: 'Go, Grow, and Glow foods',
    description: 'Explore different types of nutritious foods',
    link: '/IntroFood',
    image: '/b-fruits.png'
  },
  {
    title: 'Basic Emotions',
    description: 'Understand and express different emotions',
    link: '/IntroEmo',
    image: '/happy.png'
  }
];

const DefaultHome = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showClickImage, setShowClickImage] = useState(false);
  const [showClick2Image, setShowClick2Image] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [click1Pos, setClick1Pos] = useState({ x: 0, y: 0 });
  const [click2Pos, setClick2Pos] = useState({ x: 0, y: 0 });

  const handleQuestionClick = () => {
    speakText('click any topic you want to learn!');
    setIsClicked(true);

    // Calculate positions for click images
    const forwardButton = document.querySelector('.forward-button');
    const startButton = document.querySelector('.start-learning-button');

    if (forwardButton) {
      const forwardRect = forwardButton.getBoundingClientRect();
      setClick1Pos({
        x: forwardRect.left + forwardRect.width / 2 + window.scrollX,
        y: forwardRect.top + forwardRect.height / 2 + window.scrollY
      });
    }

    if (startButton) {
      const startRect = startButton.getBoundingClientRect();
      setClick2Pos({
        x: startRect.left + startRect.width / 2 + window.scrollX,
        y: startRect.top + startRect.height / 2 + window.scrollY
      });
    }

    // Show original click.png immediately
    setShowClickImage(true);
    setTimeout(() => {
      setShowClickImage(false);
    }, 1000);

    // Show new click2.png after 1 second delay
    setTimeout(() => {
      setShowClick2Image(true);
      setTimeout(() => {
        setShowClick2Image(false);
      }, 1000);
    }, 1000);

    setTimeout(() => {
      setIsClicked(false);
    }, 500); // duration of pulse animation
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : topics.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < topics.length - 1 ? prevIndex + 1 : 0));
  };

  const currentTopic = topics[currentIndex];

  return (
    <div> 
      <Link to="/" style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', zIndex: 1000 }}>
        <img src="/back.png" alt="Back" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
      </Link>
      <img 
        src="/question.png" 
        alt="Question" 
        className={isClicked ? 'wiggle' : ''}
        style={{ position: 'absolute', top: 10, right: 10, width: 60, height: 60, zIndex: 1000, cursor: 'pointer' }} 
        onClick={handleQuestionClick}
      />
      {showClickImage && (
        <img 
          src="/click.png" 
          alt="Click" 
          className="click-imageDefault1"
      style={{
        position: 'fixed',
        top: click1Pos.y,
        left: click1Pos.x,
        transform: 'translate(-50%, -50%)',
        zIndex: 1000
      }}
        />
      )}
      {showClick2Image && (
        <img
          src="/click.png"
          alt="Click2"
          className="click-imageDefault2"
          style={{
            position: 'fixed',
            top: click2Pos.y,
            left: click2Pos.x,
            transform: 'translate(-50%, -50%)',
            zIndex: 1000
          }}
        />
      )}

      <div className="defaulthome-container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: 'transparent',
        position: 'relative'
      }}>
        <div className="selected-topic" style={{ 
          textAlign: 'center',
          backgroundColor: 'transparent',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)'
          }}>
            <button 
              onClick={handlePrev}
              style={{
                padding: '10px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <img src="/back.png" alt="Previous" style={{ width: '40px', height: '40px' }} />
            </button>
          </div>
          <div style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)'
          }}>
            <button 
              onClick={handleNext}
              style={{
                padding: '10px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <img src="/forward.png" alt="Next" style={{ width: '40px', height: '40px' }} />
            </button>
          </div>
          <h1 style={{
            fontFamily: 'Comic Sans MS, cursive, sans-serif',
            fontSize: '36px',
            margin: '20px 0'
          }}>{currentTopic.title}</h1>
          <p style={{
            fontFamily: 'Comic Sans MS, cursive, sans-serif',
            fontSize: '24px',
            margin: '10px 0'
          }}>{currentTopic.description}</p>
          <Link to={currentTopic.link} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '10px',
            textDecoration: 'none'
          }}>
            <img src={currentTopic.image} alt={currentTopic.title} style={{ 
              width: '200px', 
              height: '200px', 
              objectFit: 'contain',
              borderRadius: '10px'
            }} />
            <button className="start-learning-button" style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              outline: 'none'
            }}>
              Start Learning
            </button>
          </Link>
          <button className="forward-button" onClick={handleNext} style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '10px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            outline: 'none'
          }}>
            <img src="/forward.png" alt="Next" style={{ width: '40px', height: '40px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DefaultHome;
