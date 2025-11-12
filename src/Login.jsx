import React, {useState, useRef, useEffect} from 'react';
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
const [isMusicPlaying, setIsMusicPlaying] = useState(true);
const backgroundMusicRef = useRef(null);

useEffect(() => {
  const audio = new Audio("/child_friendly_music.mp3");
  audio.loop = true;
  audio.volume = 0.2; // soft background volume
  backgroundMusicRef.current = audio;

  // Try autoplay on mount
  const playMusic = () => {
    audio.play().catch(() => {
      console.warn("Autoplay blocked. Will play after first user interaction.");
      // Wait for user interaction (click, keypress, etc.)
      const resumeAfterInteraction = () => {
        audio.play();
        document.removeEventListener("click", resumeAfterInteraction);
        document.removeEventListener("keydown", resumeAfterInteraction);
      };
      document.addEventListener("click", resumeAfterInteraction);
      document.addEventListener("keydown", resumeAfterInteraction);
    });
  };

  playMusic();

  return () => {
    audio.pause();
    audio.src = "";
  };
}, []);



  const { loading, login } = useAuth();

  const micGranted = useMicPermission();

  useEffect(() => {
    // Removed animation effect for moving click and mouse images as unnecessary
  }, [isSecondSentenceSpeaking]);

  const introFullText = "Hello! I'm BiboAI, a super cool speech recognition system that can listen and understand you. Let's have fun learning together!";

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
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  }}
>
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(270deg, #ffecd2, #fcb69f, #a1c4fd, #c2e9fb, #fbc2eb, #a6c1ee)',
      backgroundSize: '1200% 1200%',
      animation: 'gradientShift 25s ease infinite',
      zIndex: 0,
      filter: 'brightness(1.05)',
    }}
  />

<Button
  onClick={() => {
    if (isMusicPlaying) {
      backgroundMusicRef.current.pause();
    } else {
      backgroundMusicRef.current.play();
    }
    setIsMusicPlaying(!isMusicPlaying);
  }}
  shape="round"
  size="large"
  style={{
    position: "absolute",
    bottom: "20px",
    right: "20px",
    backgroundColor: "#ffd166",
    borderColor: "#ffb703",
    color: "#333",
    fontWeight: "bold",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  }}
>
  {isMusicPlaying ? "🔇 Stop Music" : "🎵 Play Music"}
</Button>

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
    backgroundColor: '#f8f9fa',
    position: 'relative',
    overflow: 'hidden',
  }}
>
  {['Student', 'Teacher'].map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      style={{
        flex: 1,
        padding: '0.75rem 1rem',
        backgroundColor: activeTab === tab ? 'white' : 'transparent',
        border: 'none',
        position: 'relative',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        color: activeTab === tab ? activeColor : '#444',
        borderRadius: '8px 8px 0 0',
        boxShadow:
          activeTab === tab
            ? '0 -2px 6px rgba(0, 0, 0, 0.1)'
            : 'inset 0 0 0 rgba(0,0,0,0)',
        transform: activeTab === tab ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#fff9';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor =
          activeTab === tab ? 'white' : 'transparent';
      }}
    >
      {tab}
      {activeTab === tab && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '25%',
            width: '50%',
            height: '3px',
            backgroundColor: activeColor,
            borderRadius: '4px',
            animation: 'slide-in 0.3s ease, bounce 0.4s ease-out',
          }}
        />
      )}
    </button>
  ))}

  {/* Keyframe animations */}
  <style>
    {`
      @keyframes slide-in {
        from { width: 0; left: 50%; opacity: 0.5; }
        to { width: 50%; left: 25%; opacity: 1; }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
    `}
  </style>
</div>


        <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "linear-gradient(135deg, rgba(173, 216, 230, 0.7), rgba(230, 230, 250, 0.7))",
      padding: "2rem",
      borderRadius: "20px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
      backdropFilter: "blur(8px)",
      width: "100%",
      position: "relative",
      overflow: "hidden",
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
              {/* 🌟 Grade Level Section */}
<div style={{ marginBottom: '1.5rem', width: '100%', textAlign: 'center' }}>
  <h3 style={{ color: '#38a169', fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '1.3rem' }}>
    🎓 Choose Your Grade Level
  </h3>
  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
    {['Kinder', 'Grade 1'].map((grade) => {
      const isActive = gradeLevel === grade;
      return (
        <button
          key={grade}
          onClick={() => setGradeLevel(grade)}
          style={{
            background: isActive
              ? 'linear-gradient(135deg, #68d391, #38a169)'
              : 'linear-gradient(135deg, #e2e8f0, #cbd5e0)',
            color: isActive ? 'white' : '#333',
            border: isActive ? '3px solid #48bb78' : '2px solid #a0aec0',
            borderRadius: '15px',
            padding: '0.75rem 1.5rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: isActive
              ? '0 0 20px rgba(72, 187, 120, 0.6), 0 4px 12px rgba(0,0,0,0.2)'
              : '0 2px 6px rgba(0,0,0,0.1)',
            transform: isActive ? 'scale(1.05)' : 'scale(1)',
            fontFamily: "'Garamond', cursive, sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(2deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = isActive ? 'scale(1.05)' : 'scale(1)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(2deg)';
          }}
        >
          {grade}
        </button>
      );
    })}
  </div>
</div>

{/* 🏫 Section Picker */}
<div style={{ marginBottom: '1.5rem', width: '100%', textAlign: 'center' }}>
  <h3 style={{ color: '#3182ce', fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '1.3rem' }}>
    🏫 Pick Your Section
  </h3>
  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
    {['1', '2', '3', '4'].map((sec) => {
      const isActive = section === sec;
      return (
        <button
          key={sec}
          onClick={() => setSection(sec)}
          style={{
            background: isActive
              ? 'linear-gradient(135deg, #63b3ed, #3182ce)'
              : 'linear-gradient(135deg, #e2e8f0, #cbd5e0)',
            color: isActive ? 'white' : '#333',
            border: isActive ? '3px solid #4299e1' : '2px solid #a0aec0',
            borderRadius: '15px',
            padding: '0.75rem 1.5rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: isActive
              ? '0 0 20px rgba(99, 179, 237, 0.6), 0 4px 12px rgba(0,0,0,0.2)'
              : '0 2px 6px rgba(0,0,0,0.1)',
            transform: isActive ? 'scale(1.05)' : 'scale(1)',
            fontFamily: "'Garamond', cursive, sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(-2deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = isActive ? 'scale(1.05)' : 'scale(1)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(-2deg)';
          }}
        >
          {sec}
        </button>
      );
    })}
  </div>
</div>
        {/* 🌟 Playful Log In Button */}
<button
  onClick={handleStudentSubmit}
  style={{
    background: 'linear-gradient(135deg, #f6ad55, #ed8936)',
    color: 'white',
    border: '3px solid #dd6b20',
    borderRadius: '20px',
    padding: '0.9rem 2.5rem',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow:
      '0 0 20px rgba(237, 137, 54, 0.7), 0 5px 15px rgba(0,0,0,0.2)',
    fontFamily: "'Comic Sans MS', cursive, sans-serif",
    letterSpacing: '0.5px',
    marginTop: '1rem',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'scale(1.1) rotate(2deg)';
    e.currentTarget.style.boxShadow =
      '0 0 30px rgba(237, 137, 54, 0.9), 0 5px 20px rgba(0,0,0,0.25)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow =
      '0 0 20px rgba(237, 137, 54, 0.7), 0 5px 15px rgba(0,0,0,0.2)';
  }}
  onMouseDown={(e) => {
    e.currentTarget.style.transform = 'scale(0.95)';
    e.currentTarget.style.filter = 'brightness(0.9)';
  }}
  onMouseUp={(e) => {
    e.currentTarget.style.transform = 'scale(1.1) rotate(2deg)';
    e.currentTarget.style.filter = 'brightness(1)';
  }}
>
  🚀 Log In
</button>
            </div>
          )}

          {activeTab === 'Teacher' && (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "linear-gradient(135deg, rgba(173, 216, 230, 0.7), rgba(230, 230, 250, 0.7))",
      padding: "2rem",
      borderRadius: "20px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
      backdropFilter: "blur(8px)",
      width: "100%",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <h2
      style={{
        fontFamily: "'Comic Sans MS', cursive, sans-serif",
        color: "#5a67d8",
        fontWeight: "bold",
        fontSize: "1.8rem",
        textAlign: "center",
        marginBottom: "1.5rem",
        letterSpacing: "1px",
      }}
    >
      👩‍🏫 Welcome, Teacher!
    </h2>

    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div style={{ width: "100%", textAlign: "center" }}>
        <label
          htmlFor="username"
          style={{
            fontWeight: "bold",
            color: "#333",
            fontSize: "1.1rem",
            display: "block",
            marginBottom: "0.3rem",
          }}
        >
          👤 Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            padding: "0.8rem",
            borderRadius: "12px",
            border: "2px solid #b794f4",
            width: "100%",
            textAlign: "center",
            fontSize: "1rem",
            outline: "none",
            boxShadow: "inset 0 2px 5px rgba(0,0,0,0.1)",
            transition: "0.3s all ease",
          }}
          onFocus={(e) =>
            (e.target.style.border = "2px solid #805ad5")
          }
          onBlur={(e) =>
            (e.target.style.border = "2px solid #b794f4")
          }
        />
      </div>

      <div style={{ width: "100%", textAlign: "center" }}>
        <label
          htmlFor="password"
          style={{
            fontWeight: "bold",
            color: "#333",
            fontSize: "1.1rem",
            display: "block",
            marginBottom: "0.3rem",
          }}
        >
          🔒 Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "0.8rem",
            borderRadius: "12px",
            border: "2px solid #b794f4",
            width: "100%",
            textAlign: "center",
            fontSize: "1rem",
            outline: "none",
            boxShadow: "inset 0 2px 5px rgba(0,0,0,0.1)",
            transition: "0.3s all ease",
          }}
          onFocus={(e) =>
            (e.target.style.border = "2px solid #805ad5")
          }
          onBlur={(e) =>
            (e.target.style.border = "2px solid #b794f4")
          }
        />
      </div>

      <button
        onClick={handleTeacherSubmit}
        disabled={loading}
        style={{
          marginTop: "1.5rem",
          background:
            "linear-gradient(135deg, #7f9cf5, #805ad5, #9f7aea)",
          border: "none",
          color: "white",
          fontSize: "1.3rem",
          fontWeight: "bold",
          padding: "0.9rem 2.5rem",
          borderRadius: "25px",
          boxShadow:
            "0 0 25px rgba(128, 90, 213, 0.6), 0 6px 15px rgba(0,0,0,0.2)",
          cursor: "pointer",
          fontFamily: "'Comic Sans MS', cursive, sans-serif",
          transition: "all 0.3s ease",
          transform: loading ? "scale(0.95)" : "scale(1)",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow =
            "0 0 35px rgba(159, 122, 234, 0.9), 0 6px 20px rgba(0,0,0,0.25)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow =
            "0 0 25px rgba(128, 90, 213, 0.6), 0 6px 15px rgba(0,0,0,0.2)";
        }}
      >
        {loading ? "⏳ Logging In..." : "🚀 Log In"}
      </button>
    </div>

    {/* Background floating shapes */}
    <div
      style={{
        position: "absolute",
        top: "-30px",
        left: "-30px",
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        background: "rgba(128, 90, 213, 0.3)",
        animation: "floaty 5s ease-in-out infinite",
        zIndex: 0,
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: "-40px",
        right: "-40px",
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        background: "rgba(159, 122, 234, 0.25)",
        animation: "floaty 7s ease-in-out infinite reverse",
        zIndex: 0,
      }}
    />

    <style>
      {`
      @keyframes floaty {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
      `}
    </style>
  </div>
)}

        </div>
      </div>
      <style>
{`
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

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
