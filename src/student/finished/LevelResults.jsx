import { StarRow } from "./finishedUtils";

// Results page for regular reading-level quizzes (Easy, Medium, Hard, Expert).
// Shows score + next-level card + navigation buttons.
const LevelResults = ({
  quizData, pctNum, progressWidth, displayScore, starCount,
  barColor, borderColor, display,
  nextLoading, actualNextQuiz, nextDiffDisplay, isNextPostTest,
  navigate,
}) => {
  const isPerfect     = pctNum >= 100;
  const isGreat       = pctNum >= 75;
  const trophyEmoji   = isPerfect ? "🏆" : isGreat ? "🥇" : pctNum >= 50 ? "🥈" : "⭐";
  const resultMessage = isPerfect ? "Perfect Score!" : isGreat ? "Awesome Job!" : pctNum >= 50 ? "Good Work!" : "Keep Trying!";
  const percentage    = pctNum.toFixed(1);

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
