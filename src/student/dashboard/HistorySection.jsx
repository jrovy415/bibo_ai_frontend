import {
  difficultyEmojis, difficultyColors, difficultyLabels, difficultyOrder,
  isPostTestDifficulty, getStarCount, StarRow,
} from "./dashboardConstants";

const HistorySection = ({ attempts = [] }) => {
  if (attempts.length === 0) return (
    <div style={{ textAlign:"center", padding:"24px 16px", color:"#aaa", fontFamily:"'Fredoka One',cursive", fontSize:16 }}>
      📭 No reading history yet.
    </div>
  );

  // Group into takes: new take starts when Introduction appears after a PostTest
  const takes = [];
  let currentTake  = [];
  let lastWasPostTest = false;
  const sorted = [...attempts].sort((a,b) => new Date(a.completed_at) - new Date(b.completed_at));

  for (const attempt of sorted) {
    const diff = attempt.difficulty || attempt.quiz?.difficulty;
    if (diff === 'Introduction' && lastWasPostTest && currentTake.length > 0) {
      takes.push([...currentTake]);
      currentTake = [attempt];
      lastWasPostTest = false;
    } else {
      currentTake.push(attempt);
      if (isPostTestDifficulty(diff)) lastWasPostTest = true;
    }
  }
  if (currentTake.length > 0) takes.push(currentTake);

  return (
    <div className="history-card" style={{ width:"100%", maxWidth:600 }}>
      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(18px,5vw,24px)", color:"#333", marginBottom:16, textAlign:"center" }}>
        📚 Your Reading History
      </div>

      {/* Newest take first */}
      {[...takes].reverse().map((take, idx) => {
        const takeNum  = takes.length - idx;
        const isLatest = idx === 0;
        const diffMap  = {};
        for (const attempt of take) {
          const diff = attempt.difficulty || attempt.quiz?.difficulty;
          const rawScore = attempt.score ?? 0;
          const isReadingAssessment = ['Introduction','EasyPostTest','MediumPostTest','HardPostTest','ExpertPostTest','PostTest'].includes(diff);
          const totalQuestions = attempt.quiz?.questions?.length || attempt.total_questions || 1;
          const pct = isReadingAssessment
            ? Math.min(100, Math.round(rawScore))
            : Math.round((rawScore / totalQuestions) * 100);
          if (!diffMap[diff] || pct > diffMap[diff].pct) {
            diffMap[diff] = { pct, score:rawScore, title:attempt.title || attempt.quiz?.title };
          }
        }
        const completedDate = take[take.length - 1]?.completed_at;
        const dateStr = completedDate
          ? new Date(completedDate).toLocaleDateString("en-PH", { month:"short", day:"numeric", year:"numeric" })
          : null;

        return (
          <div key={idx} style={{
            marginBottom: idx < takes.length - 1 ? 16 : 0,
            borderRadius: 16,
            border: isLatest ? "3px solid #845ef7" : "2px solid #e9ecef",
            background: isLatest ? "linear-gradient(135deg,#f3f0ff,#fff)" : "#fafafa",
            padding: "16px 18px",
            animation: `historyCardIn 0.4s ${idx*0.1}s ease both`,
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:13, background:isLatest?"#845ef7":"#adb5bd", color:"white", borderRadius:20, padding:"2px 12px" }}>
                  {isLatest ? `🏅 Take ${takeNum} (Latest)` : `Take ${takeNum}`}
                </div>
                {dateStr && <span style={{ fontSize:11, color:"#aaa" }}>{dateStr}</span>}
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {difficultyOrder.filter(d => diffMap[d]).map(diff => {
                const { pct, title } = diffMap[diff];
                const color = difficultyColors[diff] || "#aaa";
                return (
                  <div key={diff} style={{ display:"flex", alignItems:"center", gap:10, background:"white", borderRadius:12, padding:"8px 12px", border:`1.5px solid ${color}33` }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>{difficultyEmojis[diff]}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:12, color:"#333", lineHeight:1.2 }}>{difficultyLabels[diff]}</div>
                      <div style={{ fontSize:10, color:"#aaa", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{title}</div>
                      <div style={{ marginTop:4, height:5, background:"#f0f0f0", borderRadius:99, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:99 }}/>
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:16, color, lineHeight:1 }}>{pct}<span style={{ fontSize:10, color:"#aaa" }}>%</span></div>
                      <StarRow count={getStarCount(pct)} size={10}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistorySection;
