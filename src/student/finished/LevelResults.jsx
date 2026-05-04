import { useState } from "react";
import { StarRow } from "./finishedUtils";

const LevelResults = ({
  quizData, pctNum, progressWidth, displayScore, starCount,
  barColor, borderColor, display,
  nextLoading, actualNextQuiz, nextDiffDisplay, isNextPostTest,
  navigate, answers,
}) => {
  const [showAnswers, setShowAnswers] = useState(false);

  const isPerfect     = pctNum >= 100;
  const isGreat       = pctNum >= 75;
  const trophyEmoji   = isPerfect ? "🏆" : isGreat ? "🥇" : pctNum >= 50 ? "🥈" : "⭐";
  const resultMessage = isPerfect ? "Perfect Score!" : isGreat ? "Awesome Job!" : pctNum >= 50 ? "Good Work!" : "Keep Trying!";
  const percentage    = pctNum.toFixed(1);

  const questions = quizData.questions ?? [];
  const answerReview = questions.map((q, i) => {
    const ans = (answers ?? []).find(a => String(a.question_id) === String(q.id));
    const spoken = (ans?.choice_string || ans?.transcript || "").trim();
    const correctChoice = q.choices?.find(c => c.is_correct);
    const isCorrect = ans?.is_correct || false;
    return { num: i + 1, questionText: q.question_text, spoken, correctAnswer: correctChoice?.choice_text || "", isCorrect };
  });

  return (
    <div className="finished-root">

      {/* ── LEFT: Score card ──────────────────────────────── */}
      <div className="left-col">
        <div className={`result-hero-card${isPerfect ? " perfect" : ""}`} style={{ border:`4px solid ${borderColor}` }}>
          <div style={{ fontSize:"clamp(56px,15vw,80px)", marginBottom:4, display:"inline-block", animation:"trophyBounce 2.5s ease-in-out infinite" }}>
            {trophyEmoji}
          </div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(20px,5vw,30px)", color:isPerfect?"#ff6b6b":"#5b4e75", marginBottom:4, animation:isPerfect?"rainbowText 2s linear infinite":"none" }}>
            {resultMessage}
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
          <StarRow count={starCount} color={isPerfect ? "#ffd700" : "#74c0fc"}/>
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

        {/* ── Answer Review Toggle ── */}
        {answerReview.length > 0 && (
          <div style={{ width:"100%", maxWidth:400, marginTop:12 }}>
            <button
              onClick={() => setShowAnswers(s => !s)}
              style={{ width:"100%", fontFamily:"'Fredoka One',cursive", fontSize:"clamp(14px,3vw,17px)", background: showAnswers ? "linear-gradient(135deg,#845ef7,#5c3fa3)" : "linear-gradient(135deg,#74c0fc,#4dabf7)", color:"white", border:"none", borderRadius:50, padding:"12px 24px", cursor:"pointer", boxShadow:"0 4px 12px rgba(0,0,0,0.15)", transition:"transform 0.15s", marginBottom: showAnswers ? 10 : 0 }}
            >
              {showAnswers ? "🙈 Hide Answers" : "👀 See My Answers!"}
            </button>

            {showAnswers && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {answerReview.map(item => (
                  <div key={item.num} style={{ background: item.isCorrect ? "#ebfbee" : "#fff5f5", border:`2px solid ${item.isCorrect ? "#69db7c" : "#ffa8a8"}`, borderRadius:16, padding:"12px 14px" }}>
                    <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:15, color: item.isCorrect ? "#2f9e44" : "#e03131", marginBottom:4 }}>
                      {item.isCorrect ? "✅" : "❌"} Question {item.num}
                    </div>
                    {item.questionText && (
                      <div style={{ fontSize:12, color:"#555", marginBottom:4, fontWeight:700 }}>
                        📖 {item.questionText}
                      </div>
                    )}
                    <div style={{ fontSize:13, color:"#666", marginBottom: !item.isCorrect ? 4 : 0 }}>
                      🗣️ You said: <em style={{ color:"#5b4e75", fontStyle:"normal", fontWeight:800 }}>"{item.spoken || "nothing"}"</em>
                    </div>
                    {!item.isCorrect && item.correctAnswer && (
                      <div style={{ fontSize:13, color:"#2f9e44", fontWeight:800 }}>
                        💡 Answer: "{item.correctAnswer}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── RIGHT: Next level card + buttons ─────────────── */}
      <div className="right-col">

        {/* Next level card */}
        {!nextLoading && actualNextQuiz && nextDiffDisplay && (
          <div style={{ width:"100%", maxWidth:400, borderRadius:24, padding:"20px 16px", textAlign:"center", background:`linear-gradient(135deg,${nextDiffDisplay.color}22,${nextDiffDisplay.color}11)`, border:`4px solid ${nextDiffDisplay.color}`, boxShadow:`0 8px 32px ${nextDiffDisplay.color}44`, animation:"levelReveal 0.8s 0.3s cubic-bezier(0.175,0.885,0.32,1.275) both" }}>
            <div style={{ fontSize:"clamp(32px,8vw,48px)", marginBottom:8, animation:"bounce 2s ease infinite" }}>{nextDiffDisplay.emoji}</div>
            <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(13px,3vw,17px)", color:"#555", margin:"0 0 6px" }}>🚀 Level Complete! Next Up:</h2>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(20px,5vw,28px)", color:nextDiffDisplay.color, margin:"8px 0" }}>
              {nextDiffDisplay.label}!
            </div>
            <p style={{ fontSize:"clamp(11px,2.5vw,13px)", color:"#555", margin:"6px 0 0", fontWeight:700 }}>
              {isNextPostTest ? "Time for your Post-Test! Show what you learned! 🌟" : `Keep going — the ${nextDiffDisplay.label} level awaits! 💪`}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", zIndex:1 }}>
          {nextLoading && (
            <button className="action-btn btn-secondary" disabled style={{ opacity:0.6 }}>⏳ Loading next…</button>
          )}
          {!nextLoading && actualNextQuiz && (
            <button
              className={`action-btn ${isNextPostTest ? "btn-posttest" : "btn-primary"}`}
              onClick={() => navigate("/student/quiz", { state: { prefetchedQuiz: actualNextQuiz } })}
            >
              {isNextPostTest ? "🎓 Take Post-Test!" : "➡️ Next Level!"}
            </button>
          )}
          {!nextLoading && !actualNextQuiz && (
            <button className="action-btn btn-secondary" onClick={() => navigate("/student")}>🏠 Back to Dashboard</button>
          )}
        </div>

        <p style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(13px,3vw,16px)", color:"#ff6b6b", textAlign:"center", zIndex:1, padding:"0 16px", margin:0 }}>
          You can do it! Keep practicing! 💪🌟
        </p>
      </div>
    </div>
  );
};

export default LevelResults;
