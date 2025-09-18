import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { speakText } from './ttsUtil';
import { MdHeadset } from 'react-icons/md';
import { useAuth } from "../composables/useAuth"
import { Button, Card, Spin } from "antd";
import { useMicPermission } from "../composables/useMicPermission";
import axios from '../plugins/axios';
import Title from 'antd/es/skeleton/Title';
import Paragraph from 'antd/es/typography/Paragraph';
import { AudioOutlined, FrownOutlined, LoadingOutlined } from '@ant-design/icons';

export default function Login() {
  const [activeTab, setActiveTab] = useState('Student');
  const [nickname, setNickname] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Kinder');
  const [section, setSection] = useState('1');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showIntroText, setShowIntroText] = useState(false);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const [showHeadphonesBox, setShowHeadphonesBox] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1); // For highlighting step sentences
  const [currentStepWordIndex, setCurrentStepWordIndex] = useState(-1); // For highlighting words in step sentence
  const [studentError, setStudentError] = useState('');
  const [teacherError, setTeacherError] = useState('');
  const [isSecondSentenceSpeaking, setIsSecondSentenceSpeaking] = useState(false);
  // Removed circlePositions state as moving click and mouse images logic is unnecessary now
  // const [circlePositions, setCirclePositions] = useState({
  //   click: { x: 0, y: 0 },
  //   mouse: { x: 0, y: 0 },
  // });
  const navigate = useNavigate();
  const hiButtonRef = useRef(null);

  const { loading, login } = useAuth();

  const micGranted = useMicPermission();

  useEffect(() => {
    // Removed animation effect for moving click and mouse images as unnecessary
  }, [isSecondSentenceSpeaking]);

  const introFullText = "Hello! I'm OpenAI Whisper, a super cool speech recognition system that can listen and understand you. Let's have fun learning together!";

  // Handle student form submission with basic validation
  const handleStudentSubmit = async (e) => {
    e.preventDefault();

    if (!nickname.trim()) {
      setStudentError("Please enter a valid nickname.");
      return;
    }

    setStudentError("");

    try {
      const response = await axios.post("/students/login", {
        nickname,
        grade_level: gradeLevel,
        section,
      });

      // Save token for student
      window.localStorage.setItem("APP_STUDENT_TOKEN", response.data.token);

      // Save student info
      if (response.data.student) {
        window.localStorage.setItem("APP_STUDENT", JSON.stringify(response.data.student));
      }

      // Redirect after successful login
      window.location.href = "/student";
    } catch (error) {
      console.error(error);
      setStudentError("Login failed. Please try again.");
    }
  };



  // Handle teacher form submission with basic validation
  const handleTeacherSubmit = async (e) => {
    console.log("handleTeacherSubmit called");

    await login(
      {
        username: username,
        password: password,
      }
    );
  };

  const activeColor = '#a8d5a2'; // lighter green

  useEffect(() => {
    // Reset highlighted word index when intro text is hidden
    if (!showIntroText) {
      setHighlightedWordIndex(-1);
    }
  }, [showIntroText]);

  // Handle "Hi!" button click to speak intro text with word highlighting
  const handleHiClick = () => {
    speakText(introFullText, {
      rate: 1.1,
      pitch: 1.2,
      onBoundary: (charIndex) => {
        // Find the word index based on charIndex
        let cumulativeLength = 0;
        const words = introFullText.split(' ');
        for (let i = 0; i < words.length; i++) {
          cumulativeLength += words[i].length + 1; // +1 for space
          if (charIndex < cumulativeLength) {
            setHighlightedWordIndex(i);
            break;
          }
        }
      },
      onEnd: () => {
        setShowIntroText(false);
        setHighlightedWordIndex(-1);
      }
    });
    setShowIntroText(true);
    // Ensure the box disappears after 10 seconds as a fallback
    setTimeout(() => {
      setShowIntroText(false);
      setHighlightedWordIndex(-1);
    }, 10000);
  };

  // New texts for headphones box
  const headphonesTexts = [
    "Step 1: Please wear your headphones while using this app.",
    "Step 2: move the mouse and cursor to click and interact with the lessons!",
    "Step 3: Talk in English and remember to speak confidently to your microphone!"
  ];

  // Concatenate all step sentences into one string for TTS
  const concatenatedText = headphonesTexts.join(' ');

  // Split concatenated text into words for highlighting
  const concatenatedWords = concatenatedText.split(' ');

  const speakHeadphonesTexts = async () => {
    for (let i = 0; i < headphonesTexts.length; i++) {
      const text = headphonesTexts[i];

      await new Promise((resolve) => {
        speakText(text, {
          rate: 1.0,
          pitch: 1.0,
          onBoundary: (charIndex) => {
            // Calculate correct global word index for highlighting
            let globalWordIndex = 0;
            for (let j = 0; j < i; j++) {
              globalWordIndex += headphonesTexts[j].split(' ').length;
            }

            let cumulativeLength = 0;
            const words = text.split(' ');
            for (let k = 0; k < words.length; k++) {
              cumulativeLength += words[k].length + 1;
              if (charIndex < cumulativeLength) {
                setCurrentStepWordIndex(globalWordIndex + k);
                break;
              }
            }
          },
          onStart: () => {
            if (i === 1) {
              setIsSecondSentenceSpeaking(true);
            }
          },
          onEnd: () => {
            if (i === 1) {
              setIsSecondSentenceSpeaking(false);
            }
            resolve();
          },
        });
      });

      // Add a small pause (e.g., 500ms) between sentences
      await new Promise((res) => setTimeout(res, 500));
    }

    setCurrentStepWordIndex(-1);
  };

  // Toggle headphones box visibility and trigger TTS
  const handleGameClick = () => {
    setShowHeadphonesBox((prev) => {
      const newState = !prev;
      if (!prev) {
        // If box is being shown, start speaking texts
        setTimeout(() => {
          speakHeadphonesTexts();
        }, 100); // slight delay to ensure box is rendered
      } else {
        // If box is being hidden, reset highlighting
        setCurrentStepWordIndex(-1);
      }
      return newState;
    });
  };

  const backgroundStyle = {
    backgroundImage: "url('/3436801_20252.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // 🎤 Loading state
  if (micGranted === null) {
    return (
      <div style={backgroundStyle}>
        <Card
          bordered={false}
          style={{
            maxWidth: 400,
            textAlign: "center",
            padding: "2rem",
            borderRadius: "20px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            background: "rgba(255,255,255,0.9)",
          }}
        >
          <LoadingOutlined style={{ fontSize: "4rem", color: "#722ed1" }} spin />
          <Title level={3} style={{ marginTop: "1rem", color: "#722ed1" }}>
            Checking Microphone…
          </Title>
          <Paragraph style={{ fontSize: "1.1rem", color: "#555" }}>
            Hang tight! We’re making sure your mic is ready for fun. 🎶
          </Paragraph>
        </Card>
      </div>
    );
  }

  // ❌ Denied state
  if (micGranted === false) {
    return (
      <div style={backgroundStyle}>
        <Card
          bordered={false}
          style={{
            maxWidth: 480,
            textAlign: "center",
            padding: "2rem",
            borderRadius: "20px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            background: "rgba(255,255,255,0.9)",
          }}
        >
          <FrownOutlined style={{ fontSize: "4rem", color: "#ff4d4f" }} />
          <Title level={2} style={{ color: "#ff4d4f", marginTop: "1rem" }}>
            Oops! Microphone Needed 🎤
          </Title>
          <Paragraph style={{ fontSize: "1.1rem", marginBottom: "1.5rem", color: "#555" }}>
            We need your microphone so you can have fun with the quizzes!
            Please turn it on and try again. 🌟
          </Paragraph>
          <Button
            type="primary"
            size="large"
            shape="round"
            icon={<AudioOutlined />}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        margin: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: "url('/3436801_20252.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <button
        ref={hiButtonRef}
        onClick={handleHiClick}
        className="animate-wiggle"
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: '#ff6f61',
          border: '3px solid #ff3b2f',
          borderRadius: '20px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '2.5rem',
          fontFamily: "'Comic Sans MS', cursive, sans-serif",
          cursor: 'pointer',
          userSelect: 'none',
          padding: '0.5rem 1.5rem',
          boxShadow: '0 4px 8px rgba(255, 111, 97, 0.6)',
          animationTimingFunction: 'ease-in-out',
          transition: 'transform 0.2s ease-in-out',
        }}
        aria-label="Introduce OpenAI Whisper"
      >
        Hi!
      </button>
      <img
        src="/game.png"
        alt="Game"
        className="animate-wiggle"
        onClick={handleGameClick}
        style={{
          position: 'absolute',
          top: '120px',
          left: '10px',
          width: '100px',
          height: 'auto',
          zIndex: 1001,
          cursor: 'pointer',
        }}
      />

      {showIntroText && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(5px)',
              zIndex: 998,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              userSelect: 'none',
            }}
          >
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#333',
                width: '80vw',
                height: '40rem',
                textAlign: 'justify',
                margin: 'auto',
                padding: '2rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                whiteSpace: 'normal',
                overflowY: 'auto',
                display: 'block',
                textAlignLast: 'center',
              }}
            >
              <p style={{ margin: 0 }}>
                {introFullText.split(' ').map((word, index, arr) => {
                  const isHighlighted = index === highlightedWordIndex;
                  return (
                    <React.Fragment key={index}>
                      <span
                        style={{
                          color: isHighlighted ? '#ff6f61' : '#333',
                          transition: 'color 0.3s ease',
                          display: 'inline',
                        }}
                      >
                        {word}
                      </span>
                      {index !== arr.length - 1 && ' '}
                    </React.Fragment>
                  );
                })}
              </p>
              <img
                src="/studentread.png"
                alt="Student Reading"
                style={{
                  display: 'block',
                  maxWidth: '80%',
                  maxHeight: '80%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  margin: '1rem auto 0',
                }}
              />
            </div>
          </div>
        </>
      )}
      {showHeadphonesBox && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(5px)',
              zIndex: 998,
            }}
            onClick={() => setShowHeadphonesBox(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              maxWidth: '60vw',
              padding: '2rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 1000,
              userSelect: 'none',
            }}
          >
            {/* Row 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', color: '#333', whiteSpace: 'normal', textAlign: 'justify' }}>
                <MdHeadset size={32} color="#333" />
                <span>
                  {headphonesTexts[0].split(' ').map((word, index) => {
                    const globalWordIndex = index;
                    const isHighlighted = globalWordIndex === currentStepWordIndex;
                    return (
                      <React.Fragment key={index}>
                        <span
                          style={{
                            color: isHighlighted ? '#ff6f61' : '#333',
                            transition: 'color 0.3s ease',
                            display: 'inline',
                          }}
                        >
                          {word}
                        </span>
                        {index !== headphonesTexts[0].split(' ').length - 1 && ' '}
                      </React.Fragment>
                    );
                  })}
                </span>
              </div>
              <img
                src="/boywithHP.png"
                alt="Boy with Headphones"
                style={{ width: '18%', height: 'auto', objectFit: 'cover', borderRadius: '8px', alignSelf: 'center' }}
              />
            </div>

            {/* Row 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
              <div style={{ fontSize: '1.2rem', color: '#333', whiteSpace: 'normal', textAlign: 'justify' }}>
                {headphonesTexts[1].split(' ').map((word, index) => {
                  const globalWordIndex = headphonesTexts[0].split(' ').length + index;
                  const isHighlighted = globalWordIndex === currentStepWordIndex;
                  return (
                    <React.Fragment key={index}>
                      <span
                        style={{
                          color: isHighlighted ? '#ff6f61' : '#333',
                          transition: 'color 0.3s ease',
                          display: 'inline',
                        }}
                      >
                        {word}
                      </span>
                      {index !== headphonesTexts[1].split(' ').length - 1 && '\u00A0'}
                    </React.Fragment>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <img
                  src="/click.png"
                  alt="Click"
                  style={{
                    width: '25%',
                    height: 'auto',
                    objectFit: 'cover',
                    position: 'relative',
                    transform: 'translate(0px, 0px)',
                    transition: 'transform 0.1s linear',
                  }}
                />
                <img
                  src="/graymouse.webp"
                  alt="Gray Mouse"
                  style={{
                    width: '17%',
                    height: 'auto',
                    objectFit: 'cover',
                    position: 'relative',
                    transform: 'translate(0px, 0px)',
                    transition: 'transform 0.1s linear',
                  }}
                />
              </div>
            </div>

            {/* Row 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
              <div style={{ fontSize: '1.2rem', color: '#333', whiteSpace: 'normal', textAlign: 'justify' }}>
                {headphonesTexts[2].split(' ').map((word, index) => {
                  const globalWordIndex = headphonesTexts[0].split(' ').length + headphonesTexts[1].split(' ').length + index;
                  const isHighlighted = globalWordIndex === currentStepWordIndex;
                  return (
                    <React.Fragment key={index}>
                      <span
                        style={{
                          color: isHighlighted ? '#ff6f61' : '#333',
                          transition: 'color 0.3s ease',
                          display: 'inline',
                        }}
                      >
                        {word}
                      </span>
                      {index !== headphonesTexts[2].split(' ').length - 1 && ' '}
                    </React.Fragment>
                  );
                })}
              </div>
              <img
                src="/BoySpeakToMic.png"
                alt="Boy Speak To Mic"
                style={{ width: '40%', height: 'auto', objectFit: 'cover', borderRadius: '8px', alignSelf: 'center' }}
              />
            </div>
          </div>
        </>
      )}

      <div
        style={{
          width: '500px',
          backgroundColor: 'white',
          borderRadius: '8px 8px 0 0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            borderBottom: '1px solid #ccc',
            borderRadius: '8px 8px 0 0',
            backgroundColor: '#f1f1f1',
          }}
        >
          <button
            onClick={() => setActiveTab('Student')}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: activeTab === 'Student' ? 'white' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'Student' ? `3px solid ${activeColor}` : 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 'bold',
              color: activeTab === 'Student' ? activeColor : 'black',
            }}
          >
            Student
          </button>
          <button
            onClick={() => setActiveTab('Teacher')}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: activeTab === 'Teacher' ? 'white' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'Teacher' ? `3px solid ${activeColor}` : 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 'bold',
              color: activeTab === 'Teacher' ? activeColor : 'black',
            }}
          >
            Teacher
          </button>
        </div>

        <div
          style={{
            width: '100%',
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {activeTab === 'Student' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label htmlFor="nickname" style={{ marginBottom: '0.5rem', fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                Nickname
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1rem', textAlign: 'center', width: '100%' }}
              />
              {studentError && <p style={{ color: 'red', marginBottom: '1rem' }}>{studentError}</p>}
              <div style={{ marginBottom: '1rem', width: '100%', textAlign: 'center' }}>
                <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>Grade Level:</label>
                {['Kinder', 'Grade 1'].map((grade) => (
                  <label key={grade} style={{ marginRight: '1rem', textTransform: 'capitalize' }}>
                    <input
                      type="radio"
                      name="gradeLevel"
                      value={grade}
                      checked={gradeLevel === grade}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      style={{ marginRight: '0.25rem' }}
                    />
                    {grade}
                  </label>
                ))}
              </div>
              <div style={{ marginBottom: '1rem', width: '100%', textAlign: 'center' }}>
                <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>Section:</label>
                {['1', '2', '3', '4'].map((sec) => (
                  <label key={sec} style={{ marginRight: '1rem' }}>
                    <input
                      type="radio"
                      name="section"
                      value={sec}
                      checked={section === sec}
                      onChange={(e) => setSection(e.target.value)}
                      style={{ marginRight: '0.25rem' }}
                    />
                    {sec}
                  </label>
                ))}
              </div>
              <Button
                type="primary"
                style={{
                  backgroundColor: "green",
                  width: '100%',
                }}
                disabled={loading}
                loading={loading}
                onClick={handleStudentSubmit}
              >
                Login
              </Button>
            </div>
          )}

          {activeTab === 'Teacher' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label htmlFor="username" style={{ marginBottom: '0.5rem', fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1rem', width: '100%' }}
              />
              <label htmlFor="password" style={{ marginBottom: '0.5rem', fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1rem', width: '100%' }}
              />
              <Button
                type="primary"
                style={{
                  backgroundColor: "green",
                  width: '100%',
                }}
                disabled={loading}
                loading={loading}
                onClick={handleTeacherSubmit}
              >
                Login
              </Button>
            </div>
          )}
        </div>
      </div>
      <style>
        {`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-15px);
            }
          }
          @keyframes wiggle {
            0% { transform: rotate(0deg); }
            15% { transform: rotate(15deg); }
            30% { transform: rotate(-15deg); }
            45% { transform: rotate(15deg); }
            60% { transform: rotate(-15deg); }
            75% { transform: rotate(15deg); }
            100% { transform: rotate(0deg); }
          }
          .animate-bounce {
            animation: bounce 1s ease-in-out;
          }
          .animate-wiggle {
            animation: wiggle 1s ease-in-out infinite;
          }
        `}
      </style>
    </div >
  );
}
