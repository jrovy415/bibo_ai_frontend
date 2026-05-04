import { useState } from "react";
import { StarRow, getStarCount } from "./finishedUtils";
import axios from "../../../plugins/axios";

const PostTestResults = ({
  quizData, pctNum, progressWidth, starCount,
  barColor, borderColor, display,
  isFinalPostTest,
  journeyLoading, takenLevels, journeyOverallPct,
  authUser, attemptId, navigate, answers,
}) => {
  const [showAnswers, setShowAnswers] = useState(false);

  const isPerfect  = pctNum >= 100;
  const isGreat    = pctNum >= 75;
  const percentage = pctNum.toFixed(1);

  const handleFinish = async () => {
    window.speechSynthesis?.cancel();
    try {
      if (authUser?.id) await axios.patch(`/students/${authUser.id}/lock`);
    } catch(e) { console.error("Lock failed:", e); }
    localStorage.removeItem('APP_STUDENT_TOKEN');
    localStorage.removeItem('APP_STUDENT');
    window.location.href = '/login';
  };

  const questions = quizData.questions ?? [];
  const answerReview = questions.map((q, i) => {
    const ans = (answers ?? []).find(a => String(a.question_id) === String(q.id));
    const spoken = (ans?.choice_string || ans?.transcript || "").trim();
    const correctChoice = q.choices?.find(c => c.is_correct);
    const wordScore = ans?.word_score ?? null;
    const matchPct = wordScore !== null ? wordScore : null;
    return { num: i + 1, questionText: q.question_text, spoken, correctAnswer: correctChoice?.choice_text || "", matchPct };
  });

  return (
    <div className="finished-root">

      {/* ── LEFT: Score card + champion card ─────────────── */}
      <div className="left-col">

        <div className={`result-hero-card${isPerfect ? " perfect" : ""}`} style={{ border:`4px solid ${borderColor}` }}>
          <div style={{ fontSize:"clamp(56px,15vw,80px)", marginBottom:4, display:"inline-block", animation:"trophyBounce 2.5s ease-in-out infinite" }}>
            {display.emoji}
          </div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(20px,5vw,30px)", color:isPerfect?"#ff6b6b":"#5b4e75", marginBottom:4, animation:isPerfect?"rainbowText 2s linear infinite":"none" }}>
            Great Job! 🎉
          </div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:"clamp(12px,2.5vw,14px)", color:"#888", marginBottom:4 }}>
            {quizData.title}
          </div>
          <div style={{ display:"inline-block", marginBottom:10, background:`${display.color}22`, border:`2px solid ${display.color}`, borderRadius:20, padding:"3px 14px", fontFamily:"'Fredoka One',cursive", fontSize:13, color:display.color }}>
            {display.emoji} {display.label}
          </div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(40px,10vw,60px)", color:"#ff6b6b", lineHeight:1, marginBottom:4 }}>
            {pctNum.toFixed(0)}<span style={{ fontSize:"clamp(20px,5vw,28px)", color:"#ccc" }}>%</span>
          </div>
          <StarRow count={starCount} color={display.color}/>
          <div style={{ margin:"10px 0 4px" }}>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width:`${progressWidth}%`, background:barColor }}>
                {progressWidth > 15 && `${pctNum.toFixed(0)}%`}
              </div>
            </div>
          </div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(12px,3vw,15px)", color:"#888" }}>
            {percentage}% — {isGreat ? "Great job! 🌟" : pctNum >= 50 ? "Good effort! 💪" : "Keep going! 🚀"}
          </div>
        </div>

        {/* Champion card */}
        <div className="champion-card" style={{ background:`linear-gradient(135deg,${display.color}22,${display.color}11)`, border:`4px solid ${display.color}`, boxShadow:`0 8px 32px ${display.color}44` }}>
          <div style={{ fontSize:"clamp(32px,8vw,52px)", marginBottom:6, animation:"trophyBounce 2.5s ease-in-out infinite" }}>
            {isFinalPostTest ? "🎓✨" : `${display.emoji}✅`}
          </div>
          <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(14px,3.5vw,20px)", color:"#333", margin:"0 0 6px" }}>
            {isFinalPostTest
              ? <span style={{ animation:"rainbowText 2s linear infinite", display:"inline-block" }}>You're a Reading Champion!</span>
              : `${display.label} Complete! 🎉`
            }
          </h2>
          {isFinalPostTest && (
            <p style={{ fontSize:"clamp(11px,2.5vw,13px)", color:"#555", margin:"6px 0 0", fontWeight:700 }}>
              You completed the whole reading journey! 🌟🏆
            </p>
          )}
        </div>

        {/* ── Answer Review Toggle ── */}
        {answerReview.length > 0 && (
          <div style={{ width:"100%", maxWidth:400, marginTop:12 }}>
            <button
              onClick={() => setShowAnswers(s => !s)}
              style={{ width:"100%", fontFamily:"'Fredoka One',cursive", fontSize:"clamp(14px,3vw,17px)", background: showAnswers ? "linear-gradient(135deg,#845ef7,#5c3fa3)" : "linear-gradient(135deg,#74c0fc,#4dabf7)", color:"white", border:"none", borderRadius:50, padding:"12px 24px", cursor:"pointer", boxShadow:"0 4px 12px rgba(0,0,0,0.15)", marginBottom: showAnswers ? 10 : 0 }}
            >
              {showAnswers ? "🙈 Hide Answers" : "👀 See My Answers!"}
            </button>

            {showAnswers && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {answerReview.map(item => {
                  const isGood = item.matchPct !== null ? item.matchPct >= 75 : false;
                  const isOkay = item.matchPct !== null ? item.matchPct >= 40 : false;
                  const bg     = isGood ? "#ebfbee" : isOkay ? "#fff9db" : "#fff5f5";
                  const bdr    = isGood ? "#69db7c" : isOkay ? "#ffd43b" : "#ffa8a8";
                  const emoji  = isGood ? "✅" : isOkay ? "🌟" : "❌";
                  const label  = isGood ? "Great!" : isOkay ? "Almost!" : "Keep Trying!";
                  return (
                    <div key={item.num} style={{ background:bg, border:`2px solid ${bdr}`, borderRadius:16, padding:"12px 14px" }}>
                      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:15, color:"#5b4e75", marginBottom:4, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span>{emoji} Question {item.num}</span>
                        {item.matchPct !== null && (
                          <span style={{ fontSize:13, background:bdr+"33", color:"#333", borderRadius:20, padding:"2px 10px" }}>{item.matchPct}% match</span>
                        )}
                      </div>
                      {item.questionText && (
                        <div style={{ fontSize:12, color:"#555", marginBottom:4, fontWeight:700 }}>
                          📖 {item.questionText}
                        </div>
                      )}
                      <div style={{ fontSize:13, color:"#666", marginBottom:4 }}>
                        🗣️ You said: <span style={{ color:"#5b4e75", fontWeight:800 }}>"{item.spoken || "nothing"}"</span>
                      </div>
                      {item.correctAnswer && (
                        <div style={{ fontSize:13, color:"#2f9e44", fontWeight:800 }}>
                          💡 Answer: "{item.correctAnswer}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── RIGHT: Overall average + finish button ────────── */}
      <div className="right-col">

        {!journeyLoading && takenLevels.length > 1 && (
          <div style={{ background:"white", border:"3px solid #ffd700", borderRadius:20, padding:"20px 24px", textAlign:"center", boxShadow:"0 4px 20px rgba(255,215,0,0.25)", maxWidth:320, width:"100%" }}>
            <p style={{ margin:"0 0 4px", fontWeight:800, color:"#888", fontSize:"clamp(12px,2.5vw,14px)" }}>🏅 Overall Average</p>
            <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(36px,8vw,48px)", color:"#ff6b6b" }}>{journeyOverallPct}</span>
            <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(18px,4vw,24px)", color:"#aaa" }}>%</span>
            <p style={{ margin:"4px 0 8px", fontWeight:800, color:"#ffa94d", fontSize:"clamp(12px,2.5vw,15px)" }}>
              Across {takenLevels.length} level{takenLevels.length !== 1 ? "s" : ""}
            </p>
            <StarRow count={getStarCount(journeyOverallPct)} color="#ffd700" size="clamp(20px,4vw,28px)"/>
          </div>
        )}

        <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", zIndex:1 }}>
          <button className="action-btn btn-results" onClick={handleFinish}>
            {isFinalPostTest ? "🏁 Finish Journey!" : "🏁 Finish!"}
          </button>
        </div>

        <p style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(13px,3vw,16px)", color:"#ff6b6b", textAlign:"center", zIndex:1, padding:"0 16px", margin:0 }}>
          {isFinalPostTest
            ? "You've completed your entire reading journey! 🌟🎓"
            : "Amazing job finishing your Post-Test! Keep it up! 🎉"
          }
        </p>
      </div>
    </div>
  );
};

export default PostTestResults;
