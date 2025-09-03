import { useState, useRef } from 'react';
import axios from 'axios';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Link } from 'react-router-dom';
import { speakText } from './ttsUtil';

const images = [
  { src: "/happy.png", alt: "HAPPY", category: "wiggle" },
  { src: "/sad.png", alt: "SAD", category: "wiggle" },
  { src: "/angry.png", alt: "ANGRY", category: "wiggle" },
  { src: "/scared.png", alt: "AFRAID", category: "wiggle" },
  { src: "/surprised.png", alt: "SURPRISE", category: "wiggle" }
];

import { LOCAL_API_BASE_URL, REMOTE_API_BASE_URL } from './apiConfig';

const NextPage = () => {
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wiggle, setWiggle] = useState(null);
  const [glow, setGlow] = useState(null);
  const [pulse, setPulse] = useState(null);
  const [showClick1Image, setShowClick1Image] = useState(false);
  const [showClick2Image, setShowClick2Image] = useState(false);
  const [click1Pos, setClick1Pos] = useState({ top: '45%', left: '47%' });
  const [click2Pos, setClick2Pos] = useState({ top: '68%', left: '47%' });
  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(null);

  const firstBoxRef = useRef(null);
  const speakButtonRef = useRef(null);

  const handleQuestionClick = () => {
    speakText("Let's practice reading! Click the emotion for a hint, then click the button if you want to speak!");
    setTimeout(() => {
      if (firstBoxRef.current) {
        const rect = firstBoxRef.current.getBoundingClientRect();
        setClick1Pos({
          top: rect.top + rect.height / 2 + window.scrollY,
          left: rect.left + rect.width / 2 + window.scrollX,
        });
      }
      setShowClick1Image(true);
    }, 1000);
    setTimeout(() => {
      setShowClick1Image(false);
      if (speakButtonRef.current) {
        const rect = speakButtonRef.current.getBoundingClientRect();
        setClick2Pos({
          top: rect.top + rect.height / 2 + window.scrollY,
          left: rect.left + rect.width / 2 + window.scrollX,
        });
      }
      setShowClick2Image(true);
    }, 3200);
    setTimeout(() => {
      setShowClick2Image(false);
    }, 4200);
  };

  const startCountdown = () => {
    let count = 3;
    setCountdown('Ready?');
    speakText('Ready?');
    countdownRef.current = setInterval(() => {
      if (count > 0) {
        setCountdown(count.toString());
        speakText(count.toString());
        count -= 1;
      } else if (count === 0) {
        setCountdown(`Say ${images[currentIndex].alt}`);
        speakText(`Say ${images[currentIndex].alt}`);
        count -= 1;
      } else {
        clearInterval(countdownRef.current);
        setCountdown(null);
        startRecording();
        // Automatically stop recording after 5 seconds of "Say ..." TTS
        setTimeout(() => {
          if (status === 'recording') {
            stopRecording();
          }
        }, 6000);
      }
    }, 1000);
  };

  const {
    status,
    startRecording,
    stopRecording,
    clearBlobUrl
  } = useReactMediaRecorder({
    audio: {
      mimeType: 'audio/wav',
      bitsPerSecond: 128000
    },
    onStop: async (blobUrl, blob) => {
      await handleTranscribe(blob, 'recording.wav');
    }
  });

  const handleTranscribe = async (audioBlob, filename) => {
    try {
      setIsProcessing(true);
      setError(null);
      setTranscription('');
      
      const audioFile = new File([audioBlob], filename, {
        type: audioBlob.type,
        lastModified: Date.now()
      });

      const formData = new FormData();
      formData.append('audio', audioFile);

      let response;
      try {
        response = await axios.post(
          `${LOCAL_API_BASE_URL}/transcribe`,
          formData,
          {
            timeout: 30000
          }
        );
      } catch (localError) {
        response = await axios.post(
          `${REMOTE_API_BASE_URL}/transcribe`,
          formData,
          {
            timeout: 30000
          }
        );
      }

      setTranscription(response.data.text);
      clearBlobUrl();

      // Save transcription to database
      try {
        await axios.post(`${LOCAL_API_BASE_URL}/save-transcription`, {
          text: response.data.text,
          language: response.data.language,
          duration: response.data.duration,
          processing_time: response.data.processing_time
        });
      } catch (saveError) {
        try {
          await axios.post(`${REMOTE_API_BASE_URL}/save-transcription`, {
            text: response.data.text,
            language: response.data.language,
            duration: response.data.duration,
            processing_time: response.data.processing_time
          });
        } catch (remoteSaveError) {
          console.error('Error saving transcription remotely:', remoteSaveError);
        }
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError(`Transcription failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWiggle = (id) => {
    setWiggle(id);
    setTimeout(() => setWiggle(null), 500);
  };

  const handleGlow = (id) => {
    setGlow(id);
    setTimeout(() => setGlow(null), 500);
  };

  const handlePulse = (id) => {
    setPulse(id);
    setTimeout(() => setPulse(null), 500);
  };

  const handleImageClick = (image) => {
    speakText(image.alt);
    if (image.category === 'wiggle') {
      handleWiggle(image.alt);
    } else if (image.category === 'glow') {
      handleGlow(image.alt);
    } else if (image.category === 'pulse') {
      handlePulse(image.alt);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="nextpage-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Link to="/student/intro_emo" style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', zIndex: 1100 }}>
        <img src="/back.png" alt="Back" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }} />
      </Link>
      <Link to="/student/emo_act" style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)' }}>
        <img src="/forward.png" alt="Forward" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }} />
      </Link>

      <img
        src="/question.png"
        alt="Question"
        style={{ position: 'absolute', top: 10, right: 10, width: 60, height: 60, cursor: 'pointer', zIndex: 1000 }}
        onClick={handleQuestionClick}
      />

      {showClick1Image && (
        <img
          src="/click.png"
          alt="Click"
          style={{
            position: 'fixed',
            top: click1Pos.top,
            left: click1Pos.left,
            transform: 'translate(-50%, -50%)',
            width: 220,
            height: 220,
            zIndex: 1001,
            cursor: 'default',
            animation: 'pulse 1s ease-in-out infinite',
          }}
        />
      )}
      {showClick2Image && (
        <img
          src="/click.png"
          alt="Click2"
          style={{
            position: 'fixed',
            top: click2Pos.top,
            left: click2Pos.left,
            transform: 'translate(-50%, -50%)',
            width: 220,
            height: 220,
            zIndex: 1002,
            cursor: 'default',
            animation: 'pulse 1s ease-in-out infinite',
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '60px',
          flexWrap: 'wrap',
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
      <div
        ref={firstBoxRef}
        className="content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          flex: '1 1 400px',
          backgroundColor: 'transparent',
        }}
      >
        {/* Back/forward buttons + emotion image display */}
        <div className="back-forward-row" style={{ display: 'flex', justifyContent: 'center', gap: '200px' }}>
          <img
            src="/back.png"
            alt="Back2"
            className="back2-image"
            style={{ width: '100px', height: '100px', cursor: 'pointer' }}
            onClick={handlePrev}
          />
          <img
            src="/forward.png"
            alt="Forward2"
            className="forward2-image"
            style={{ width: '100px', height: '100px', cursor: 'pointer' }}
            onClick={handleNext}
          />
        </div>
        <div className="apple-orange-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            style={{ width: '300px', height: '300px', cursor: 'pointer' }}
            className={
              wiggle === images[currentIndex].alt
                ? 'wiggle'
                : glow === images[currentIndex].alt
                ? 'glow'
                : pulse === images[currentIndex].alt
                ? 'pulse'
                : ''
            }
            onClick={() => handleImageClick(images[currentIndex])}
          />
          <p style={{ marginTop: '15px', fontSize: '48px', fontWeight: 'bold', color: 'black', fontFamily: 'Comic Sans MS, cursive, sans-serif', textAlign: 'center', width: '100%', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            {images[currentIndex].alt}
          </p>
        </div>
      </div>

        <div
          ref={speakButtonRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: '1 1 400px',
            position: 'relative',
          }}
        >
          {/* Recording controls */}
          <div className="recording-controls" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: isProcessing || countdown !== null ? 'not-allowed' : 'pointer' }} onClick={() => {
              if (isProcessing || countdown !== null) return;
              if (status !== 'recording') {
                startCountdown();
              } else {
                stopRecording();
              }
            }} aria-disabled={isProcessing || countdown !== null}>
              <img
                src="/SpeakButton.png"
                alt="Speak Button"
                style={{
                  width: '120px',
                  height: 'auto',
                  filter: status === 'recording' ? 'drop-shadow(0 0 10px #00ff00)' : 'none',
                  transition: 'filter 0.3s ease-in-out'
                }}
              />
              <span style={{ marginTop: '5px', fontSize: '1.1rem', fontWeight: 'bold', color: 'black', fontFamily: 'Comic Sans MS, cursive, sans-serif', userSelect: 'none', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>Start Reading!</span>
            </div>
            {countdown !== null && (
              <div
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: 'black',
                  animation: 'none',
                  userSelect: 'none',
                  minWidth: '4rem',
                  textAlign: 'center',
                  backgroundColor: 'white',
                  padding: '20px 40px',
                  borderRadius: '10px',
                  boxShadow: '0 0 15px rgba(0, 255, 0, 0.7)',
                  zIndex: 3000
                }}
              >
                {countdown}
              </div>
            )}
            {error && <p className="error">{error}</p>}
          </div>

          {transcription && (
            <div className="transcription" style={{ position: 'absolute', top: '100%', marginTop: '20px', fontWeight: 'bold', color: 'black', textAlign: 'justify', fontSize: '0.9rem', width: '100%' }}>
              <h3>You said:</h3>
              <p>{transcription}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NextPage;
