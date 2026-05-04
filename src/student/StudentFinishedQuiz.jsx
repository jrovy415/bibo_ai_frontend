import { useEffect, useState } from "react";
import { Spin } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../composables/useAuth";
import axios from "../../plugins/axios";

import {
  styles, Confetti,
  DIFFICULTY_DISPLAY, JOURNEY_ORDER, READING_ASSESSMENT_DIFFS,
  isLevelPostTest, scoreWordByWord, getPlacementLevel, getStarCount,
} from "./finished/finishedUtils";
import PreTestResults  from "./finished/PreTestResults";
import PostTestResults from "./finished/PostTestResults";
import LevelResults    from "./finished/LevelResults";
import FeedbackModal   from "./finished/FeedbackModal";
import ResultsModal    from "./finished/ResultsModal";

/* ══════════════════════════════════════════════════════════════
   ORCHESTRATOR — handles all data fetching, then renders the
   correct result view based on quiz type:
     Introduction  → PreTestResults
     *PostTest     → PostTestResults
     Easy/Medium/… → LevelResults
══════════════════════════════════════════════════════════════ */
const StudentFinishedQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser, getUser } = useAuth();
  const { attemptId, quizSnapshot, answers: answersFromNav } = location.state || {};

  const [loading,         setLoading]         = useState(true);
  const [quizData,        setQuizData]        = useState(null);
  const [answers,         setAnswers]         = useState([]);
  const [score,           setScore]           = useState(0);
  const [progressWidth,   setProgressWidth]   = useState(0);
  const [journeyAttempts, setJourneyAttempts] = useState([]);
  const [journeyLoading,  setJourneyLoading]  = useState(false);
  const [actualNextQuiz,  setActualNextQuiz]  = useState(null);
  const [nextLoading,     setNextLoading]     = useState(false);
  const [modalAttempt,    setModalAttempt]    = useState(null);
  const [showFeedback,    setShowFeedback]    = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [feedbackSent,    setFeedbackSent]    = useState(false);

  // ── Auth ──────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => { try { await getUser(); } catch(e) {} };
    init();
  }, []);

  // ── Feedback timing ───────────────────────────────────────────
  useEffect(() => {
    if (!feedbackSent && !loading && quizData) {
      const t = setTimeout(() => setShowFeedback(true), 1800);
      return () => clearTimeout(t);
    }
  }, [feedbackSent, loading, quizData]);

  // ── Fetch quiz result + fire secondary fetches immediately ───────
  useEffect(() => {
    const applySnapshot = () => {
      if (!quizSnapshot) { navigate("/student", { replace: true }); return; }
      setQuizData(quizSnapshot);
      const fallback = Object.entries(answersFromNav || {}).map(([qId, transcript]) => ({
        question_id: qId, choice_string: transcript, transcript,
      }));
      setAnswers(fallback);
    };

    const fetchAll = async () => {
      try {
        const res = await axios.get(`/quiz-attempts/${attemptId}`);
        const { quiz, answers: apiAnswers, score: apiScore } = res.data.data;
        if (!quiz) { applySnapshot(); return; }

        // Fire next-quiz fetch immediately without waiting for a React re-render.
        // For regular levels only — post-test journey is handled in the effect below.
        if (!isLevelPostTest(quiz.difficulty) && quiz.difficulty !== "Introduction") {
          setNextLoading(true);
          axios.get("/quizzes/get-quiz")
            .then(r => { setActualNextQuiz(r.data.data?.questions ? r.data.data : null); })
            .catch(() => setActualNextQuiz(null))
            .finally(() => setNextLoading(false));
        }

        setQuizData(quiz);
        setAnswers(apiAnswers ?? []);
        setScore(apiScore ?? (apiAnswers ?? []).filter(a => a.is_correct).length);
      } catch(err) {
        console.error(err);
        applySnapshot();
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) fetchAll();
    else { setLoading(false); navigate("/student", { replace: true }); }
  }, [attemptId]);

  // ── Fetch journey (PostTest only) — kept separate: needs authUser ──
  useEffect(() => {
    if (!loading && quizData && isLevelPostTest(quizData.difficulty) && authUser?.id) {
      setJourneyLoading(true);
      axios.get(`/quiz-attempts/student-attempts/${authUser.id}`)
        .then(r => {
          const data = r.data?.data ?? [];
          setJourneyAttempts(Array.isArray(data) ? data : []);
        })
        .catch(console.error)
        .finally(() => setJourneyLoading(false));
    }
  }, [loading, quizData, authUser]);

  // ── Animate progress bar ──────────────────────────────────────
  useEffect(() => {
    if (!loading && quizData) {
      const isPreTest  = quizData.difficulty === "Introduction";
      const isPostTest = isLevelPostTest(quizData.difficulty);

      if (isPreTest || isPostTest) {
        let earned = 0, possible = 0;
        for (const q of quizData.questions ?? []) {
          const correctChoice = q.choices?.find(c => c.is_correct);
          const ans = answers.find(a => a.question_id === q.id);
          const pts = q.points ?? 1; possible += pts;
          if (correctChoice) {
            const spoken = ans?.choice_string || ans?.transcript || "";
            earned += scoreWordByWord(spoken, correctChoice.choice_text, pts);
          }
        }
        const pct = possible > 0 ? (earned / possible) * 100 : 0;
        setTimeout(() => setProgressWidth(pct), 300);
        setScore(earned);
      } else {
        const totalPoints = (quizData.questions ?? []).reduce((sum,q) => sum + (q.points ?? 1), 0);
        const pct = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
        setTimeout(() => setProgressWidth(pct), 300);
      }
    }
  }, [loading, quizData, score]);

  // ── Loading / error states ────────────────────────────────────
  if (loading) return (
    <><style>{styles}</style>
    <div style={{ width:"100%",height:"100vh",background:"linear-gradient(160deg,#a8edea,#fed6e3)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16 }}>
      <div style={{ fontSize:"clamp(48px,12vw,72px)",animation:"bounce 1s ease infinite" }}>⏳</div>
      <Spin size="large"/>
      <p style={{ fontFamily:"'Fredoka One',cursive",fontSize:"clamp(15px,4vw,20px)",color:"#ff6b6b" }}>Getting your results...</p>
    </div></>
  );

  if (!quizData) return (
    <><style>{styles}</style>
    <div style={{ textAlign:"center",marginTop:80,fontSize:"clamp(16px,4vw,22px)",fontFamily:"'Fredoka One',cursive",padding:"20px" }}>
      <div style={{ fontSize:"clamp(48px,12vw,72px)" }}>😕</div>Quiz data not found!
    </div></>
  );

  // ── Compute shared derived values ─────────────────────────────
  const isPreTest      = quizData.difficulty === "Introduction";
  const isPostTest     = isLevelPostTest(quizData.difficulty);
  const isFinalPostTest = quizData.difficulty === "PostTest";
  const totalPoints    = (quizData.questions ?? []).reduce((sum,q) => sum + (q.points ?? 1), 0);
  const display        = DIFFICULTY_DISPLAY[quizData.difficulty] || { label:quizData.difficulty, color:"#aaa", emoji:"📋" };

  const normWords = (t) => (t||"").toLowerCase().replace(/[^a-z0-9\s]/g,"").trim().split(/\s+/).filter(Boolean);
  let pctNum = 0, displayScore = score;

  if (isPreTest || isPostTest) {
    let totalPct = 0, qCount = 0;
    for (const q of quizData.questions ?? []) {
      const correctChoice = q.choices?.find(c => c.is_correct);
      const ans = answers.find(a => a.question_id === q.id);
      if (!correctChoice) continue;
      const spoken = ans?.choice_string || ans?.transcript || "";
      const sw = normWords(spoken); const cw = normWords(correctChoice.choice_text);
      if (cw.length === 0) continue;
      const pool = [...cw]; let matched = 0;
      for (const w of sw) { const i = pool.indexOf(w); if (i !== -1) { matched++; pool.splice(i,1); } }
      totalPct += Math.round((matched / cw.length) * 100); qCount++;
    }
    pctNum = qCount > 0 ? totalPct / qCount : 0;
    displayScore = Math.round(pctNum);
  } else {
    pctNum = totalPoints > 0 ? (displayScore / totalPoints) * 100 : 0;
  }

  const starCount   = getStarCount(pctNum);
  const barColor    = pctNum>=75 ? "linear-gradient(90deg,#69db7c,#a9e34b)" : pctNum>=50 ? "linear-gradient(90deg,#74c0fc,#a9e34b)" : "linear-gradient(90deg,#ff6b6b,#ffa94d)";
  const borderColor = pctNum >= 100 ? "#ffd700" : isPostTest ? display.color : "#74c0fc";
  const placement   = isPreTest ? getPlacementLevel(pctNum) : null;

  const nextDiff        = actualNextQuiz?.difficulty ?? null;
  const nextDiffDisplay = nextDiff ? DIFFICULTY_DISPLAY[nextDiff] : null;
  const isNextPostTest  = nextDiff ? isLevelPostTest(nextDiff) : false;

  // ── Journey summary (PostTest) ────────────────────────────────
  const latestIntroAttempt = journeyAttempts
    .filter(a => (a.difficulty||a.quiz?.difficulty) === 'Introduction' && a.completed_at)
    .sort((a,b) => new Date(b.completed_at) - new Date(a.completed_at))[0];
  const latestIntroDate = latestIntroAttempt?.completed_at ? new Date(latestIntroAttempt.completed_at) : null;

  const journeyMap = {};
  for (const attempt of journeyAttempts) {
    const diff = attempt.difficulty || attempt.quiz?.difficulty;
    if (!diff) continue;
    const attemptDate = attempt.completed_at ? new Date(attempt.completed_at) : null;
    if (diff !== 'Introduction' && latestIntroDate && attemptDate && attemptDate < latestIntroDate) continue;
    if (!journeyMap[diff] || (attemptDate && new Date(journeyMap[diff].completed_at||0) < attemptDate)) {
      journeyMap[diff] = attempt;
    }
  }
  if (isPostTest && quizData) {
    journeyMap[quizData.difficulty] = { score:displayScore, difficulty:quizData.difficulty, quiz:quizData, completed_at: new Date().toISOString() };
  }

  const journeyLevels = JOURNEY_ORDER.map(diff => {
    const attempt     = journeyMap[diff];
    const disp        = DIFFICULTY_DISPLAY[diff];
    if (!attempt) return { diff, disp, score:null, total:null, pct:null };
    const isReadingPct = READING_ASSESSMENT_DIFFS.includes(diff);
    const total = attempt.quiz?.questions?.length ?? attempt.total_questions ?? null;
    const sc    = attempt.score ?? null;
    const pct   = sc != null
      ? (isReadingPct ? Math.min(100, Math.round(sc)) : (total && total > 0 ? Math.round((sc / total) * 100) : null))
      : null;
    return { diff, disp, score:sc, total, pct };
  });

  const takenLevels       = journeyLevels.filter(l => l.pct != null);
  const journeyOverallPct = takenLevels.length > 0
    ? Math.round(takenLevels.reduce((s,l) => s + l.pct, 0) / takenLevels.length)
    : 0;

  const submitFeedback = async (feeling) => {
    if (!feeling || !authUser?.id || !quizData?.id) return;
    try { await axios.post("/quiz-feedbacks", { student_id:authUser.id, quiz_id:quizData.id, quiz_attempt_id:attemptId||null, feeling }); }
    catch(e) { console.error(e); }
    finally { setFeedbackSent(true); setShowFeedback(false); setSelectedFeeling(null); }
  };

  // ── Shared props for all result views ─────────────────────────
  const sharedProps = {
    quizData, pctNum, progressWidth, displayScore, starCount,
    barColor, borderColor, display, navigate,
  };

  return (
    <>
      <style>{styles}</style>
      {(pctNum >= 100 || isPreTest || isPostTest) && <Confetti/>}
      {modalAttempt && <ResultsModal attempt={modalAttempt} onClose={() => setModalAttempt(null)}/>}

      {["⭐","🌟","✨","💫"].map((s,i) => (
        <div key={i} className="floating-star" style={{ top:`${10+i*20}%`, [i%2===0?"left":"right"]:"2%", animationDuration:`${3+i}s`, animationDelay:`${i*0.5}s` }}>{s}</div>
      ))}

      {/* Render the correct result view based on quiz type */}
      {isPreTest && (
        <PreTestResults {...sharedProps} placement={placement}/>
      )}
      {isPostTest && (
        <PostTestResults {...sharedProps}
          isFinalPostTest={isFinalPostTest}
          journeyLoading={journeyLoading}
          takenLevels={takenLevels}
          journeyOverallPct={journeyOverallPct}
          authUser={authUser}
          attemptId={attemptId}
        />
      )}
      {!isPreTest && !isPostTest && (
        <LevelResults {...sharedProps}
          nextLoading={nextLoading}
          actualNextQuiz={actualNextQuiz}
          nextDiffDisplay={nextDiffDisplay}
          isNextPostTest={isNextPostTest}
        />
      )}

      <FeedbackModal
        show={showFeedback}
        selectedFeeling={selectedFeeling}
        setSelectedFeeling={setSelectedFeeling}
        onSubmit={submitFeedback}
        onSkip={() => { setShowFeedback(false); setFeedbackSent(true); }}
      />
    </>
  );
};

export default StudentFinishedQuiz;
