import React, { useState, useRef, useEffect, useCallback } from 'react';
import { speakText } from './ttsUtil';
import { useAuth } from "../composables/useAuth";
import { useMicPermission } from "../composables/useMicPermission";
import axios from '../plugins/axios';

// ── Floating particle ────────────────────────────────────────────────────────
const FloatingParticle = ({ emoji, style }) => (
  <div style={{ position: 'absolute', fontSize: '1.5rem', animation: 'floatUp 6s ease-in-out infinite', userSelect: 'none', pointerEvents: 'none', ...style }}>
    {emoji}
  </div>
);

// ── Twinkling star field ─────────────────────────────────────────────────────
const StarField = () => (
  <>
    {[...Array(22)].map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        width: i % 3 === 0 ? '5px' : '3px',
        height: i % 3 === 0 ? '5px' : '3px',
        borderRadius: '50%',
        backgroundColor: 'white',
        top: `${(Math.sin(i * 137.5) * 0.5 + 0.5) * 100}%`,
        left: `${(i * 4.7) % 100}%`,
        opacity: 0.5 + (i % 4) * 0.12,
        animation: `twinkle ${1.5 + (i % 3) * 0.7}s ease-in-out infinite`,
        animationDelay: `${(i * 0.28) % 2.5}s`,
        pointerEvents: 'none',
      }} />
    ))}
  </>
);

// ── Countdown dots shown between steps ───────────────────────────────────────
function CountdownDots({ active }) {
  const [dot, setDot] = useState(0);
  useEffect(() => {
    if (!active) { setDot(0); return; }
    const iv = setInterval(() => setDot(d => (d + 1) % 4), 400);
    return () => clearInterval(iv);
  }, [active]);
  if (!active) return null;
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '0.5rem 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: '50%',
          background: i < dot ? 'white' : 'rgba(255,255,255,0.25)',
          transition: 'background 0.3s ease',
          boxShadow: i < dot ? '0 0 8px rgba(255,255,255,0.8)' : 'none',
        }} />
      ))}
    </div>
  );
}

export default function Login() {
  const [activeTab,    setActiveTab]    = useState('Student');
  const [nickname,     setNickname]     = useState('');
  const [gradeLevel,   setGradeLevel]   = useState('Kinder');
  const [section,      setSection]      = useState('1');
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [studentError, setStudentError] = useState('');
  const [cardShake,    setCardShake]    = useState(false);

  // ─── Tutorial state ───────────────────────────────────────────────────────
  const [showTutorial,       setShowTutorial]       = useState(false);
  const [tutorialStep,       setTutorialStep]       = useState(0);
  const [tutorialWordIndex,  setTutorialWordIndex]  = useState(-1);
  const [isTutorialSpeaking, setIsTutorialSpeaking] = useState(false);
  const [isBetweenSteps,     setIsBetweenSteps]     = useState(false); // pause dots
  const autoAdvanceRef = useRef(null);

  const tutorialSteps = [
    {
      title:       "BIBO AI",
      description: "Welcome to BiboAI! This is your super fun learning adventure! Let me show you how to log in. Just follow the glowing steps!",
      speakText:   "Welcome to BiboAI! This is your super fun learning adventure! Let me show you how to log in. Just follow the glowing steps!",
      highlight: null, emoji: "🌟", color: "#f6ad55",
    },
    {
      title:       "Step 1: Your Student Number",
      description: "Step 1: Type your Student Number in the glowing green box.",
      speakText:   "Step 1! Type your Student Number in the glowing green box.",
      highlight: "nickname", emoji: "😄", color: "#68d391",
    },
    {
      title:       "Step 2: Grade Level",
      description: "Step 2: Are you in Kinder or Grade 1? Click the button that matches your grade — it will glow!",
      speakText:   "Step 2! Are you in Kinder or Grade 1? Click the button that matches your grade!",
      highlight: "gradeLevel", emoji: "📚", color: "#63b3ed",
    },
    {
      title:       "Step 3: Your Section",
      description: "Step 3: Pick your section number: 1, 2, 3, or 4. Your teacher told you which one!",
      speakText:   "Step 3! Pick your section number. 1, 2, 3, or 4. Your teacher told you which one you are in!",
      highlight: "section", emoji: "🔢", color: "#b794f4",
    },
    {
      title:       "Step 4: Start Adventure!",
      description: "Step 4: All done! Now press the big orange button and start your learning adventure!",
      speakText:   "Step 4! All done! Now press the big orange button and start your learning adventure!",
      highlight: "login", emoji: "🎉", color: "#fc8181",
    },
  ];

  // ── Speak a step, then auto-advance after a short pause ──────────────────
  const speakTutorialStep = useCallback((step, afterSpeak) => {
    const text = tutorialSteps[step].speakText;
    window.speechSynthesis?.cancel();
    clearTimeout(autoAdvanceRef.current);
    setTutorialWordIndex(-1);
    setIsBetweenSteps(false);
    setIsTutorialSpeaking(true);

    speakText(text, {
      rate:  0.85,
      pitch: 1.1,
      onBoundary: (wordIndex) => setTutorialWordIndex(wordIndex),
      onEnd: () => {
        setTutorialWordIndex(-1);
        setIsTutorialSpeaking(false);
        afterSpeak?.();
      },
    });
  }, []);

  // ── Schedule auto-advance after speaking ends ─────────────────────────────
  const advanceAfterPause = useCallback((currentStep) => {
    const isLast = currentStep >= tutorialSteps.length - 1;
    if (isLast) {
      // Last step: close tutorial after a 1.5s pause
      autoAdvanceRef.current = setTimeout(() => {
        setShowTutorial(false);
        setTutorialStep(0);
        setIsBetweenSteps(false);
      }, 1500);
    } else {
      // Show dots for ~1.2s then advance
      setIsBetweenSteps(true);
      autoAdvanceRef.current = setTimeout(() => {
        setIsBetweenSteps(false);
        setTutorialStep(currentStep + 1);
      }, 1200);
    }
  }, []);

  const handleSkipTutorial = () => {
    window.speechSynthesis?.cancel();
    clearTimeout(autoAdvanceRef.current);
    setShowTutorial(false);
    setTutorialStep(0);
    setIsBetweenSteps(false);
    setIsTutorialSpeaking(false);
    setTutorialWordIndex(-1);
  };

  const handleReplay = () => {
    clearTimeout(autoAdvanceRef.current);
    setIsBetweenSteps(false);
    speakTutorialStep(tutorialStep, () => advanceAfterPause(tutorialStep));
  };

  // ── Kick off tutorial on mount ────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setShowTutorial(true), 800);
    return () => clearTimeout(t);
  }, []);

  // ── Speak whenever step changes (or tutorial opens) ───────────────────────
  useEffect(() => {
    if (!showTutorial) {
      window.speechSynthesis?.cancel();
      clearTimeout(autoAdvanceRef.current);
      setTutorialWordIndex(-1);
      setIsTutorialSpeaking(false);
      setIsBetweenSteps(false);
      return;
    }
    speakTutorialStep(tutorialStep, () => advanceAfterPause(tutorialStep));
    return () => clearTimeout(autoAdvanceRef.current);
  }, [showTutorial, tutorialStep]);

  const isHighlighted   = (field) => showTutorial && tutorialSteps[tutorialStep].highlight === field;
  const currentTutorial = tutorialSteps[tutorialStep];

  // ─── Music ────────────────────────────────────────────────────────────────
  const [isMusicPlaying,  setIsMusicPlaying]  = useState(true);
  const backgroundMusicRef = useRef(null);

  useEffect(() => {
    const audio = new Audio('/child_friendly_music.mp3');
    audio.loop = true; audio.volume = 0.2;
    backgroundMusicRef.current = audio;
    const play = () => {
      audio.play().catch(() => {
        const resume = () => {
          audio.play();
          document.removeEventListener('click', resume);
          document.removeEventListener('keydown', resume);
        };
        document.addEventListener('click', resume);
        document.addEventListener('keydown', resume);
      });
    };
    play();
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  const { loading, login } = useAuth();
  const micGranted = useMicPermission();

  const handleStudentSubmit = async (e) => {
    e?.preventDefault();
    if (!nickname.trim() || !/^[0-9-]+$/.test(nickname)) {
      setStudentError("Only numbers and '-' are allowed.");
      setCardShake(true);
      setTimeout(() => setCardShake(false), 500);
      return;
    }
    setStudentError('');
    try {
      const response = await axios.post('/students/login', { nickname, grade_level: gradeLevel, section });
      window.localStorage.setItem('APP_STUDENT_TOKEN', response.data.token);
      if (response.data.student) window.localStorage.setItem('APP_STUDENT', JSON.stringify(response.data.student));
      window.location.href = '/student';
    } catch (error) {
      console.error(error);
      setStudentError('Login failed. Please try again.');
    }
  };

  const handleTeacherSubmit = async () => { await login({ username, password }); };

  // ─── Loading / mic denied screens ────────────────────────────────────────
  const loadingStyle = {
    width: '100vw', height: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a0a2e, #1a1a5e, #2d1b69)',
  };

  if (micGranted === null) {
    return (
      <div style={loadingStyle}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'mascotBob 1.5s ease-in-out infinite' }}>🎤</div>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '2.2rem', color: '#ffd166', margin: '0 0 0.5rem' }}>Checking Microphone…</h2>
          <p style={{ fontSize: '1.1rem', color: '#a0c4ff', fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>Hang tight! Getting ready for fun! 🎶</p>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;900&display=swap');
            @keyframes mascotBob { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-12px) rotate(3deg)} }
          `}</style>
        </div>
      </div>
    );
  }

  if (micGranted === false) {
    return (
      <div style={loadingStyle}>
        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', borderRadius: '32px', padding: '3rem 2.5rem', border: '2px solid rgba(255,255,255,0.15)', maxWidth: '420px', margin: '0 1rem' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>😢</div>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '2rem', color: '#ff6b6b', margin: '0 0 1rem' }}>We Need Your Mic! 🎤</h2>
          <p style={{ fontSize: '1rem', color: '#e0e0e0', marginBottom: '2rem', lineHeight: 1.6, fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
            We need your microphone to have fun with quizzes! Please turn it on and try again. 🌟
          </p>
          <button onClick={() => window.location.reload()} style={{ background: 'linear-gradient(135deg, #56ab2f, #a8e063)', color: 'white', border: 'none', borderRadius: '50px', padding: '1rem 2.5rem', fontSize: '1.2rem', fontFamily: "'Fredoka One', cursive", cursor: 'pointer', boxShadow: '0 6px 20px rgba(86,171,47,0.4)' }}>
            🔄 Try Again
          </button>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;900&display=swap');`}</style>
      </div>
    );
  }

  // ─── MAIN RENDER ──────────────────────────────────────────────────────────
  return (
    <div style={{ margin: 0, width: '100vw', height: '100vh', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', fontFamily: "'Nunito', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes twinkle        { 0%,100%{opacity:0.25;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.4)} }
        @keyframes floatUp        { 0%{transform:translateY(0) rotate(0deg);opacity:0.8} 50%{transform:translateY(-28px) rotate(12deg);opacity:1} 100%{transform:translateY(0) rotate(0deg);opacity:0.8} }
        @keyframes cloudDrift     { 0%{transform:translateX(-250px)} 100%{transform:translateX(110vw)} }
        @keyframes mascotBob      { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-10px) rotate(3deg)} }
        @keyframes cardFloat      { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-7px)} }
        @keyframes shake          { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(10px)} 60%{transform:translateX(-7px)} 80%{transform:translateX(7px)} }
        @keyframes tutorialSlideIn{ 0%{transform:translateY(30px);opacity:0} 70%{transform:translateY(-4px);opacity:1} 100%{transform:translateY(0);opacity:1} }
        @keyframes glowPulse      { 0%,100%{box-shadow:0 0 12px rgba(255,255,255,0.15)} 50%{box-shadow:0 0 32px rgba(255,255,255,0.5)} }
        @keyframes speakingPulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.65;transform:scale(1.06)} }
        @keyframes rainbowBorder  { 0%{border-color:#ff6b6b} 25%{border-color:#ffd166} 50%{border-color:#06d6a0} 75%{border-color:#a78bfa} 100%{border-color:#ff6b6b} }
        @keyframes arrowBounce    { 0%,100%{transform:translateY(-50%) translateX(0)} 50%{transform:translateY(-50%) translateX(5px)} }
        @keyframes stepFadeIn     { 0%{opacity:0;transform:scale(0.92)} 100%{opacity:1;transform:scale(1)} }
        input::placeholder { color: rgba(255,255,255,0.3); font-family: 'Nunito', sans-serif; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Night-sky background */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#060620 0%,#0d0d3b 25%,#1a1060 55%,#0d2b52 80%,#083248 100%)', zIndex: 0 }} />

      {/* Stars */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden', pointerEvents: 'none' }}>
        <StarField />
      </div>

      {/* Drifting clouds */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, overflow: 'hidden', pointerEvents: 'none' }}>
        {[
          { top: '12%', size: 160, dur: '24s', delay: '0s',   opacity: 0.06 },
          { top: '35%', size: 110, dur: '32s', delay: '-10s', opacity: 0.05 },
          { top: '58%', size: 190, dur: '40s', delay: '-20s', opacity: 0.07 },
          { top: '78%', size: 130, dur: '22s', delay: '-6s',  opacity: 0.04 },
        ].map((c, i) => (
          <div key={i} style={{ position: 'absolute', top: c.top, left: '-200px', width: `${c.size}px`, height: `${c.size * 0.5}px`, background: 'white', borderRadius: '60px', opacity: c.opacity, animation: `cloudDrift ${c.dur} linear infinite`, animationDelay: c.delay, filter: 'blur(10px)' }} />
        ))}
      </div>

      {/* Floating emoji particles */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, overflow: 'hidden', pointerEvents: 'none' }}>
        {[
          { emoji: '⭐', top: '75%', left: '6%',  dur: '7s',   delay: '0s'    },
          { emoji: '🌙', top: '62%', left: '90%', dur: '9s',   delay: '-3s'   },
          { emoji: '✨', top: '82%', left: '22%', dur: '6s',   delay: '-1.5s' },
          { emoji: '🌈', top: '68%', left: '74%', dur: '8s',   delay: '-4s'   },
          { emoji: '🦋', top: '78%', left: '52%', dur: '10s',  delay: '-2s'   },
          { emoji: '💫', top: '88%', left: '38%', dur: '7.5s', delay: '-5s'   },
          { emoji: '🎈', top: '72%', left: '14%', dur: '11s',  delay: '-6s'   },
          { emoji: '🎀', top: '70%', left: '82%', dur: '8.5s', delay: '-2.5s' },
          { emoji: '🌺', top: '85%', left: '65%', dur: '9.5s', delay: '-7s'   },
          { emoji: '🍀', top: '92%', left: '48%', dur: '6.5s', delay: '-3.5s' },
        ].map((p, i) => (
          <FloatingParticle key={i} emoji={p.emoji} style={{ top: p.top, left: p.left, animationDuration: p.dur, animationDelay: p.delay }} />
        ))}
      </div>

      {/* BiboAI header */}
      <div style={{ position: 'absolute', top: '18px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: '2.5rem', display: 'inline-block', animation: 'mascotBob 3s ease-in-out infinite' }}>🤖</div>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '2.2rem', color: 'white', textShadow: '0 0 40px #a78bfa, 0 0 80px #7c3aed55, 0 4px 8px rgba(0,0,0,0.6)', letterSpacing: '3px', lineHeight: 1 }}>
          BiboAI
        </div>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '0.75rem', color: '#c4b5fd', letterSpacing: '4px', textTransform: 'uppercase', marginTop: '2px' }}>
          ✦ Learning Adventure ✦
        </div>
      </div>

      {/* Music toggle */}
      <button
        onClick={() => { if (isMusicPlaying) backgroundMusicRef.current.pause(); else backgroundMusicRef.current.play(); setIsMusicPlaying(!isMusicPlaying); }}
        style={{ position: 'absolute', bottom: '18px', right: '18px', zIndex: 20, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '2px solid rgba(255,255,255,0.25)', borderRadius: '50px', padding: '0.5rem 1.1rem', color: 'white', fontWeight: 800, fontFamily: "'Nunito', sans-serif", fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.4)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {isMusicPlaying ? '🔇 Mute' : '🎵 Music'}
      </button>

      {/* ── Layout: side-by-side when tutorial open ── */}
      <div style={{
        position: 'relative', zIndex: 5,
        display: 'flex', flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',
        gap: showTutorial ? '1.5rem' : '0',
        width: '100%', maxWidth: '960px',
        padding: '0 1rem', marginTop: '85px',
        transition: 'gap 0.4s ease',
      }}>

        {/* ── TUTORIAL PANEL ── */}
        {showTutorial && (
          <div style={{
            width: '340px', flexShrink: 0,
            background: `linear-gradient(145deg, ${currentTutorial.color}ee, ${currentTutorial.color}aa)`,
            borderRadius: '28px', padding: '1.6rem 1.8rem',
            boxShadow: `0 0 60px ${currentTutorial.color}55, 0 20px 60px rgba(0,0,0,0.5)`,
            border: '3px solid rgba(255,255,255,0.5)',
            animation: 'tutorialSlideIn 0.45s cubic-bezier(.36,.07,.19,.97)',
            textAlign: 'center', position: 'relative',
          }}>
            {/* Corner sparkles */}
            {[{ top: '10px', left: '14px' }, { top: '10px', right: '14px' }, { bottom: '10px', left: '14px' }, { bottom: '10px', right: '14px' }].map((pos, i) => (
              <span key={i} style={{ position: 'absolute', ...pos, fontSize: '1.1rem', animation: `twinkle ${1 + i * 0.35}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}>✦</span>
            ))}

            {/* Arrow pointing to form */}
            <div style={{
              position: 'absolute', right: '-18px', top: '50%',
              width: 0, height: 0,
              borderTop: '18px solid transparent', borderBottom: '18px solid transparent',
              borderLeft: `18px solid ${currentTutorial.color}ee`,
              animation: 'arrowBounce 1s ease-in-out infinite',
              filter: `drop-shadow(2px 0 6px ${currentTutorial.color}88)`,
            }} />

            {/* Emoji — bounces while speaking, wiggles between steps */}
            <div style={{
              fontSize: '3.5rem',
              animation: isBetweenSteps
                ? 'twinkle 0.4s ease-in-out infinite'
                : 'mascotBob 1.8s ease-in-out infinite',
              marginBottom: '0.2rem',
              display: 'inline-block',
            }}>
              {currentTutorial.emoji}
            </div>

            {/* Title */}
            <h2 style={{
              margin: '0 0 0.5rem',
              fontFamily: "'Fredoka One', cursive",
              fontSize: '1.45rem', color: 'white',
              textShadow: '0 3px 10px rgba(0,0,0,0.35)',
              animation: 'stepFadeIn 0.35s ease both',
            }}>
              {currentTutorial.title}
            </h2>

            {/* ── Word-highlighted description ── */}
            <p style={{ margin: '0 0 0.6rem', fontSize: '1rem', color: 'white', lineHeight: 1.65, fontWeight: 700, animation: 'stepFadeIn 0.35s ease both' }}>
              {currentTutorial.description.split(' ').map((word, i) => (
                <React.Fragment key={i}>
                  <span style={{
                    display: 'inline',
                    background:  i === tutorialWordIndex ? 'rgba(255,255,255,0.55)' : 'transparent',
                    color:       i === tutorialWordIndex ? '#333' : 'white',
                    borderRadius: '5px',
                    padding:     i === tutorialWordIndex ? '1px 5px' : '0',
                    fontWeight:  i === tutorialWordIndex ? 900 : 700,
                    transition:  'all 0.12s ease',
                  }}>
                    {word}
                  </span>{' '}
                </React.Fragment>
              ))}
            </p>

            {/* Between-steps dots OR speaking indicator */}
            {isBetweenSteps ? (
              <CountdownDots active={true} />
            ) : (
              <div style={{
                height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '5px', marginBottom: '0.4rem',
              }}>
                {isTutorialSpeaking && [0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)',
                    animation: `speakingPulse 0.7s ${i * 0.18}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
            )}

            {/* Progress dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '1rem' }}>
              {tutorialSteps.map((_, i) => (
                <div key={i} style={{
                  width: i === tutorialStep ? '28px' : '10px', height: '10px', borderRadius: '5px',
                  background: i < tutorialStep
                    ? 'rgba(255,255,255,0.9)'
                    : i === tutorialStep
                    ? 'white'
                    : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s cubic-bezier(.34,1.56,.64,1)',
                  boxShadow: i === tutorialStep ? '0 0 12px rgba(255,255,255,0.8)' : 'none',
                }} />
              ))}
            </div>

            {/* Bottom row: Replay + Skip */}
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
              {/* Replay — disabled while between steps */}
              <button
                onClick={handleReplay}
                disabled={isBetweenSteps}
                style={{
                  background: 'rgba(255,255,255,0.22)', border: '2px solid rgba(255,255,255,0.55)',
                  borderRadius: '50px', padding: '0.5rem 1.2rem', color: 'white', fontSize: '0.88rem',
                  fontWeight: 800, cursor: isBetweenSteps ? 'not-allowed' : 'pointer',
                  fontFamily: "'Nunito', sans-serif",
                  opacity: isBetweenSteps ? 0.45 : 1,
                  animation: isTutorialSpeaking && !isBetweenSteps ? 'speakingPulse 0.8s ease-in-out infinite' : 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { if (!isBetweenSteps) e.currentTarget.style.background = 'rgba(255,255,255,0.38)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; }}
              >
                {isTutorialSpeaking ? '🔊 Speaking...' : '🔁 Replay'}
              </button>

              {/* Skip */}
              <button
                onClick={handleSkipTutorial}
                style={{
                  background: 'rgba(255,255,255,0.18)', color: 'white',
                  border: '2px solid rgba(255,255,255,0.45)',
                  borderRadius: '50px', padding: '0.5rem 1.2rem',
                  fontSize: '0.95rem', fontWeight: 800,
                  cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.32)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Skip ✕
              </button>
            </div>
          </div>
        )}

        {/* ── MAIN LOGIN CARD ── */}
        <div style={{
          width: '460px', maxWidth: '95vw', flexShrink: 0,
          animation: cardShake ? 'shake 0.4s ease' : 'cardFloat 4s ease-in-out infinite',
          position: 'relative',
        }}>
          {/* Rainbow glow ring */}
          <div style={{ position: 'absolute', inset: '-3px', borderRadius: '35px', background: 'linear-gradient(135deg,#a78bfa,#60a5fa,#34d399,#fbbf24,#f87171,#a78bfa)', backgroundSize: '300% 300%', animation: 'rainbowBorder 4s linear infinite', zIndex: -1, filter: 'blur(1px)' }} />

          <div style={{ background: 'rgba(8,8,35,0.92)', backdropFilter: 'blur(28px)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 30px 90px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)', overflow: 'hidden' }}>

            {/* Tab switcher */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Student', 'Teacher'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  flex: 1, padding: '1.1rem 1rem', border: 'none', cursor: 'pointer',
                  fontFamily: "'Fredoka One', cursive", fontSize: '1.1rem',
                  background: activeTab === tab ? 'rgba(167,139,250,0.15)' : 'transparent',
                  color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.4)',
                  borderBottom: activeTab === tab ? '3px solid #a78bfa' : '3px solid transparent',
                  transition: 'all 0.3s ease', letterSpacing: '0.5px',
                }}
                  onMouseEnter={(e) => { if (activeTab !== tab) e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
                  onMouseLeave={(e) => { if (activeTab !== tab) e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                >
                  {tab === 'Student' ? '🎒 Student' : '👩‍🏫 Teacher'}
                </button>
              ))}
            </div>

            <div style={{ padding: '1.75rem 1.75rem 2rem' }}>

              {/* ── STUDENT TAB ── */}
              {activeTab === 'Student' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  {/* Student Number */}
                  <div style={{
                    borderRadius: '20px', padding: '1rem 1.2rem',
                    background: isHighlighted('nickname') ? 'rgba(104,211,145,0.15)' : 'rgba(255,255,255,0.04)',
                    border: isHighlighted('nickname') ? '2px solid #68d391' : '1.5px solid rgba(255,255,255,0.08)',
                    boxShadow: isHighlighted('nickname') ? '0 0 30px rgba(104,211,145,0.45),inset 0 0 20px rgba(104,211,145,0.08)' : 'none',
                    transition: 'all 0.3s ease',
                    animation: isHighlighted('nickname') ? 'glowPulse 1.5s ease-in-out infinite' : 'none',
                  }}>
                    <label style={{ display: 'block', fontFamily: "'Fredoka One', cursive", fontSize: '0.95rem', color: '#a78bfa', marginBottom: '0.6rem', letterSpacing: '0.5px' }}>
                      ✏️ Student Number
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => { if (/^[0-9-]*$/.test(e.target.value)) setNickname(e.target.value); }}
                      placeholder="Example: 24-4824"
                      inputMode="numeric"
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '14px', border: '1.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: 'white', fontSize: '1.05rem', fontFamily: "'Nunito', sans-serif", fontWeight: 700, outline: 'none' }}
                    />
                    {studentError && <div style={{ marginTop: '0.5rem', color: '#ff6b6b', fontWeight: 800, fontSize: '0.88rem' }}>⚠️ {studentError}</div>}
                  </div>

                  {/* Grade Level */}
                  <div style={{
                    borderRadius: '20px', padding: '1rem 1.2rem',
                    background: isHighlighted('gradeLevel') ? 'rgba(99,179,237,0.15)' : 'rgba(255,255,255,0.04)',
                    border: isHighlighted('gradeLevel') ? '2px solid #63b3ed' : '1.5px solid rgba(255,255,255,0.08)',
                    boxShadow: isHighlighted('gradeLevel') ? '0 0 30px rgba(99,179,237,0.45)' : 'none',
                    transition: 'all 0.3s ease',
                    animation: isHighlighted('gradeLevel') ? 'glowPulse 1.5s ease-in-out infinite' : 'none',
                  }}>
                    <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '0.95rem', color: '#a78bfa', marginBottom: '0.7rem' }}>🎓 Grade Level</div>
                    <div style={{ display: 'flex', gap: '0.7rem' }}>
                      {['Kinder', 'Grade 1'].map((grade) => {
                        const isActive = gradeLevel === grade;
                        return (
                          <button key={grade} onClick={() => setGradeLevel(grade)} style={{
                            flex: 1, padding: '0.8rem 0.5rem', borderRadius: '16px',
                            border: isActive ? '2px solid rgba(255,255,255,0.35)' : '1.5px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer', fontFamily: "'Fredoka One', cursive", fontSize: '1rem',
                            background: isActive ? 'linear-gradient(135deg,#11998e,#38ef7d)' : 'rgba(255,255,255,0.06)',
                            color: 'white',
                            boxShadow: isActive ? '0 6px 22px rgba(56,239,125,0.4),0 0 0 2px rgba(56,239,125,0.2)' : 'none',
                            transform: isActive ? 'scale(1.05) translateY(-2px)' : 'scale(1)',
                            transition: 'all 0.25s cubic-bezier(.34,1.56,.64,1)',
                          }}
                            onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.transform = 'scale(1.04)'; } }}
                            onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'scale(1)'; } }}
                          >
                            {grade === 'Kinder' ? '🌱 Kinder' : '📗 Grade 1'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section */}
                  <div style={{
                    borderRadius: '20px', padding: '1rem 1.2rem',
                    background: isHighlighted('section') ? 'rgba(183,148,244,0.15)' : 'rgba(255,255,255,0.04)',
                    border: isHighlighted('section') ? '2px solid #b794f4' : '1.5px solid rgba(255,255,255,0.08)',
                    boxShadow: isHighlighted('section') ? '0 0 30px rgba(183,148,244,0.45)' : 'none',
                    transition: 'all 0.3s ease',
                    animation: isHighlighted('section') ? 'glowPulse 1.5s ease-in-out infinite' : 'none',
                  }}>
                    <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '0.95rem', color: '#a78bfa', marginBottom: '0.7rem' }}>🏫 Section</div>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      {['1', '2', '3', '4'].map((sec) => {
                        const isActive = section === sec;
                        const sectionColors = ['135deg,#f7971e,#ffd200', '135deg,#ff6b6b,#feca57', '135deg,#48c6ef,#6f86d6', '135deg,#a8edea,#fed6e3'];
                        return (
                          <button key={sec} onClick={() => setSection(sec)} style={{
                            flex: 1, padding: '0.85rem 0.4rem', borderRadius: '16px',
                            border: isActive ? '2px solid rgba(255,255,255,0.35)' : '1.5px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer', fontFamily: "'Fredoka One', cursive", fontSize: '1.3rem',
                            background: isActive ? `linear-gradient(${sectionColors[parseInt(sec) - 1]})` : 'rgba(255,255,255,0.06)',
                            color: 'white',
                            boxShadow: isActive ? '0 6px 20px rgba(0,0,0,0.3),0 0 0 2px rgba(255,255,255,0.15)' : 'none',
                            transform: isActive ? 'scale(1.1) translateY(-3px)' : 'scale(1)',
                            transition: 'all 0.25s cubic-bezier(.34,1.56,.64,1)',
                            textShadow: isActive ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
                          }}
                            onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'scale(1.07)'; } }}
                            onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'scale(1)'; } }}
                          >
                            {sec}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Login button */}
                  <button
                    onClick={handleStudentSubmit}
                    style={{
                      padding: '1.15rem', borderRadius: '20px',
                      border: isHighlighted('login') ? '3px solid white' : '2px solid rgba(255,150,0,0.4)',
                      cursor: 'pointer', fontFamily: "'Fredoka One', cursive", fontSize: '1.4rem', color: 'white',
                      background: 'linear-gradient(135deg,#f7971e 0%,#ff5f6d 100%)',
                      boxShadow: isHighlighted('login') ? '0 0 50px rgba(255,200,0,0.9),0 10px 30px rgba(247,151,30,0.6)' : '0 8px 28px rgba(247,151,30,0.45)',
                      transition: 'all 0.3s cubic-bezier(.34,1.56,.64,1)',
                      animation: isHighlighted('login') ? 'glowPulse 1s ease-in-out infinite' : 'none',
                      letterSpacing: '1px', marginTop: '0.25rem',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05) translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(247,151,30,0.65)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(247,151,30,0.45)'; }}
                    onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                    onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1.05) translateY(-3px)'; }}
                  >
                    🚀 Start Adventure!
                  </button>
                </div>
              )}

              {/* ── TEACHER TAB ── */}
              {activeTab === 'Teacher' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '0.5rem 0 0.75rem' }}>
                    <div style={{ fontSize: '3.5rem', display: 'inline-block', animation: 'mascotBob 3s ease-in-out infinite' }}>👩‍🏫</div>
                    <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.7rem', color: 'white', margin: '0.25rem 0 0', textShadow: '0 0 30px rgba(167,139,250,0.7)' }}>Welcome, Teacher!</h2>
                  </div>

                  {[
                    { label: '👤 Username', id: 'username', type: 'text',     val: username, set: setUsername },
                    { label: '🔒 Password', id: 'password', type: 'password', val: password, set: setPassword },
                  ].map(({ label, id, type, val, set }) => (
                    <div key={id} style={{ borderRadius: '20px', padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
                      <label style={{ display: 'block', fontFamily: "'Fredoka One', cursive", fontSize: '0.95rem', color: '#a78bfa', marginBottom: '0.6rem' }}>{label}</label>
                      <input id={id} type={type} value={val} onChange={(e) => set(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '14px', border: '1.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: 'white', fontSize: '1rem', fontFamily: "'Nunito', sans-serif", fontWeight: 700, outline: 'none' }}
                        onFocus={(e) => { e.target.style.borderColor = '#a78bfa'; e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.2)'; }}
                        onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  ))}

                  <button onClick={handleTeacherSubmit} disabled={loading} style={{
                    padding: '1.15rem', borderRadius: '20px', border: '2px solid rgba(167,139,250,0.4)', cursor: 'pointer',
                    fontFamily: "'Fredoka One', cursive", fontSize: '1.4rem', color: 'white',
                    background: 'linear-gradient(135deg,#667eea,#764ba2)',
                    boxShadow: '0 8px 28px rgba(102,126,234,0.45)',
                    transition: 'all 0.3s cubic-bezier(.34,1.56,.64,1)',
                    opacity: loading ? 0.7 : 1, marginTop: '0.25rem',
                  }}
                    onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'scale(1.05) translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(102,126,234,0.65)'; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(102,126,234,0.45)'; }}
                  >
                    {loading ? '⏳ Logging In...' : '🔑 Log In'}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}