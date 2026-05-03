import { DIFFICULTY_DISPLAY } from "./finishedUtils";

// Shows per-answer detail for a single quiz attempt (used in post-test journey review).
const ResultsModal = ({ attempt, onClose }) => {
  if (!attempt) return null;
  const { quiz, answers } = attempt;
  const diff    = quiz?.difficulty;
  const display = DIFFICULTY_DISPLAY[diff] || { label:diff, color:"#aaa", emoji:"📋" };
  const correct = (answers||[]).filter(a => a.is_correct).length;
  const total   = (answers||[]).length;

  return (
    <div className="results-modal-backdrop" onClick={onClose}>
      <div className="results-modal" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:40, marginBottom:4 }}>{display.emoji}</div>
          <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(18px,5vw,24px)", color:display.color, margin:"0 0 4px" }}>
            {display.label} — Results
          </h2>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:"#888" }}>{quiz?.title}</div>
          <div style={{ display:"inline-block", marginTop:8, background: correct===total ? "linear-gradient(135deg,#69db7c,#38d9a9)" : correct>total/2 ? "linear-gradient(135deg,#ffd43b,#ffa94d)" : "linear-gradient(135deg,#ff6b6b,#ff8787)", color:"white", borderRadius:50, padding:"4px 18px", fontFamily:"'Fredoka One',cursive", fontSize:15 }}>
            ✅ {correct} / {total} Correct
          </div>
        </div>
        <div style={{ borderTop:"2px dashed #f0f0f0", marginBottom:16 }} />
        {(answers||[]).map((ans, i) => {
          const questionText  = ans.question?.question_text || "—";
          const correctChoice = ans.question?.choices?.find(c => c.is_correct);
          const correctText   = correctChoice?.choice_text || "—";
          const spokenText    = ans.choice_string || "(no answer)";
          const isOk          = ans.is_correct;
          return (
            <div key={ans.id} className={`answer-row ${isOk ? "correct" : "wrong"}`}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:12, color:"white", background:isOk?"#2f9e44":"#e03131", borderRadius:50, padding:"2px 10px", flexShrink:0 }}>{isOk ? "✓ Correct" : "✗ Wrong"}</span>
                <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:13, color:"#888" }}>Q{i+1}</span>
              </div>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(13px,3vw,16px)", color:"#333", marginBottom:8, lineHeight:1.4 }}>📖 {questionText}</div>
              <div style={{ display:"flex", gap:6, alignItems:"flex-start", marginBottom:4, flexWrap:"wrap" }}>
                <span style={{ fontSize:11, fontWeight:800, color:"#2f9e44", background:"#d3f9d8", borderRadius:6, padding:"2px 8px", flexShrink:0 }}>✅ Should say</span>
                <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13, color:"#2f9e44" }}>{correctText}</span>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"flex-start", flexWrap:"wrap" }}>
                <span style={{ fontSize:11, fontWeight:800, color:isOk?"#2f9e44":"#e03131", background:isOk?"#d3f9d8":"#ffe3e3", borderRadius:6, padding:"2px 8px", flexShrink:0 }}>🎤 You said</span>
                <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13, color:isOk?"#2f9e44":"#e03131", fontStyle:"italic" }}>"{spokenText}"</span>
              </div>
            </div>
          );
        })}
        <button onClick={onClose} style={{ display:"block", width:"100%", marginTop:16, padding:"12px", borderRadius:50, border:"none", background:`linear-gradient(135deg,${display.color},${display.color}bb)`, color:"white", fontFamily:"'Fredoka One',cursive", fontSize:18, cursor:"pointer", boxShadow:`0 6px 0 ${display.color}88` }}>
          ✕ Close
        </button>
      </div>
    </div>
  );
};

export default ResultsModal;
