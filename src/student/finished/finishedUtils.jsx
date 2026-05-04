// Shared constants, helpers, and tiny UI atoms for all StudentFinishedQuiz views.

export const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');

html, body, #root {
  margin: 0 !important; padding: 0 !important;
  width: 100% !important; max-width: 100% !important;
  overflow-x: hidden !important; box-sizing: border-box !important;
}
*, *::before, *::after {
  box-sizing: border-box;
  font-family: 'Nunito', 'Comic Sans MS', cursive, sans-serif !important;
}

@keyframes popIn {
  0%   { transform: scale(0.5) rotate(-10deg); opacity: 0; }
  70%  { transform: scale(1.08) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes slideUp {
  from { transform: translateY(40px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  40%       { transform: translateY(-14px); }
  60%       { transform: translateY(-7px); }
}
@keyframes confettiFall {
  0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
@keyframes starPop {
  0%   { transform: scale(0) rotate(0); opacity: 0; }
  60%  { transform: scale(1.3) rotate(20deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px #ffd70088, 0 0 40px #ffd70044; }
  50%       { box-shadow: 0 0 40px #ffd700cc, 0 0 80px #ffd70066; }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
}
@keyframes rainbowText {
  0%   { color: #ff6b6b; }
  20%  { color: #ffa94d; }
  40%  { color: #ffd43b; }
  60%  { color: #69db7c; }
  80%  { color: #74c0fc; }
  100% { color: #ff6b6b; }
}
@keyframes levelReveal {
  0%   { transform: scale(0.5) rotate(-8deg); opacity: 0; }
  70%  { transform: scale(1.1) rotate(2deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes trophyBounce {
  0%,100% { transform: translateY(0) rotate(-3deg) scale(1); }
  30%      { transform: translateY(-20px) rotate(3deg) scale(1.05); }
  60%      { transform: translateY(-10px) rotate(-2deg) scale(1.02); }
}
@keyframes modalSlideIn {
  0%   { transform: scale(0.7) translateY(40px); opacity: 0; }
  70%  { transform: scale(1.03) translateY(-4px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
@keyframes backdropFade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes journeyCardIn {
  0%   { transform: translateY(30px) scale(0.92); opacity: 0; }
  70%  { transform: translateY(-4px) scale(1.01); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

.results-modal-backdrop {
  position: fixed; inset: 0; z-index: 8000;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  animation: backdropFade 0.25s ease both;
}
.results-modal {
  background: white; border-radius: 28px;
  width: 100%; max-width: 520px;
  max-height: 80vh; overflow-y: auto;
  padding: 28px 24px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.35);
  animation: modalSlideIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both;
  position: relative;
}
.results-modal::-webkit-scrollbar { width: 6px; }
.results-modal::-webkit-scrollbar-track { background: #f0f0f0; border-radius: 8px; }
.results-modal::-webkit-scrollbar-thumb { background: #ffd93d; border-radius: 8px; }
.answer-row {
  border-radius: 16px; padding: 12px 16px; margin-bottom: 10px;
  border: 2px solid transparent; transition: transform 0.15s ease;
}
.answer-row:hover { transform: translateX(4px); }
.answer-row.correct { background: linear-gradient(135deg,#ebfbee,#d3f9d8); border-color: #69db7c; }
.answer-row.wrong   { background: linear-gradient(135deg,#fff5f5,#ffe3e3); border-color: #ff6b6b; }
.pill-clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.pill-clickable:hover {
  transform: translateY(-4px) scale(1.04);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15) !important;
}
.confetti-piece {
  position: fixed; border-radius: 3px;
  pointer-events: none; z-index: 999;
  animation: confettiFall linear forwards;
}
.floating-star {
  position: fixed; pointer-events: none; z-index: 0;
  opacity: 0.25; font-size: clamp(20px,4vw,32px);
  animation: float ease-in-out infinite;
}

.finished-root {
  width: 100%; max-width: 100%;
  min-height: 100vh;
  background: linear-gradient(160deg,#e0f7fa 0%,#fce4ec 50%,#fff9c4 100%);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; position: relative;
  padding: 20px;
  gap: 20px;
}

.left-col {
  width: 340px;
  flex-shrink: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 14px;
}

.right-col {
  width: 420px;
  flex-shrink: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 14px;
}

@media (max-width: 800px) {
  .finished-root { flex-direction: column; min-height: 100vh; overflow-y: auto; padding: 16px; gap: 14px; }
  .left-col  { width: 100%; max-width: 420px; }
  .right-col { width: 100%; max-width: 420px; }
}

.result-hero-card {
  animation: popIn 0.7s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
  width: 100%; border-radius: 28px;
  padding: 24px 20px; text-align: center;
  background: rgba(255,255,255,0.96);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12);
}
.result-hero-card.perfect {
  animation: popIn 0.7s cubic-bezier(0.175,0.885,0.32,1.275) forwards, glow 2s ease-in-out infinite;
  background: linear-gradient(135deg,#fff9c4,#ffd6e7,#c8f7ff);
}

.champion-card {
  animation: levelReveal 0.8s 0.3s cubic-bezier(0.175,0.885,0.32,1.275) both;
  width: 100%; border-radius: 24px;
  padding: 20px 16px; text-align: center;
}

.scores-card {
  animation: journeyCardIn 0.7s 0.3s cubic-bezier(0.175,0.885,0.32,1.275) both;
  width: 100%; border-radius: 24px;
  padding: 20px;
  background: linear-gradient(135deg,#fff9c4,#ffd6e7,#c8f7ff);
  border: 4px solid #ffd700;
  box-shadow: 0 12px 40px rgba(255,215,0,0.25);
}

.action-btn {
  border: none; border-radius: 24px; color: white;
  font-family: 'Fredoka One', cursive !important;
  font-size: clamp(14px,3.5vw,18px);
  padding: clamp(10px,2.5vw,13px) clamp(20px,5vw,36px);
  cursor: pointer; transition: all 0.15s;
  display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;
}
.action-btn:hover  { transform: translateY(-3px); }
.action-btn:active { transform: translateY(2px); }
.btn-primary   { background: linear-gradient(90deg,#69db7c,#38d9a9); box-shadow: 0 6px 0 #2fbf71; }
.btn-orange    { background: linear-gradient(90deg,#ff6b6b,#ffa94d); box-shadow: 0 6px 0 #e05a5a; }
.btn-secondary { background: linear-gradient(90deg,#74c0fc,#a9e34b); box-shadow: 0 6px 0 #4a9fd4; }
.btn-posttest  { background: linear-gradient(90deg,#cc5de8,#845ef7); box-shadow: 0 6px 0 #9b3fc8; }
.btn-results   { background: linear-gradient(90deg,#ffd43b,#ff9f43); box-shadow: 0 6px 0 #d48806; }

.progress-bar-track {
  width: 100%; height: clamp(16px,3.5vw,22px);
  background: #f0f0f0; border-radius: 14px; overflow: hidden;
  box-shadow: inset 0 3px 6px rgba(0,0,0,0.1);
}
.progress-bar-fill {
  height: 100%; border-radius: 14px;
  transition: width 1.5s cubic-bezier(0.34,1.56,0.64,1);
  background-size: 200% auto;
  animation: shimmer 2s linear infinite;
  display: flex; align-items: center;
  justify-content: flex-end; padding-right: 8px;
  color: white; font-weight: 900;
  font-size: clamp(10px,2.5vw,12px);
}

.score-row-item {
  border-radius: 16px; padding: 12px 16px; margin-bottom: 8px;
  background: white; border: 2px solid #f0f0f0;
  display: flex; align-items: center; gap: 12px;
  transition: transform 0.15s ease;
}
.score-row-item:hover { transform: translateX(4px); }
`;

export const DIFFICULTY_DISPLAY = {
  Introduction:   { label:"Pre-Test",                      color:"#69db7c", emoji:"🌱" },
  Easy:           { label:"Low Reader",                    color:"#74c0fc", emoji:"⭐" },
  EasyPostTest:   { label:"Low Reader Post-Test",          color:"#4dabf7", emoji:"📋" },
  Medium:         { label:"Beginning Reader",              color:"#ffa94d", emoji:"🔥" },
  MediumPostTest: { label:"Beginning Reader Post-Test",    color:"#fd7e14", emoji:"📋" },
  Hard:           { label:"Developing Reader",             color:"#ff6b6b", emoji:"💎" },
  HardPostTest:   { label:"Developing Reader Post-Test",   color:"#f03e3e", emoji:"📋" },
  Expert:         { label:"Grade Ready Reader",            color:"#cc5de8", emoji:"🏆" },
  ExpertPostTest: { label:"Grade Ready Post-Test",         color:"#ae3ec9", emoji:"📋" },
  PostTest:       { label:"Post-Test",                     color:"#a9e34b", emoji:"🎓" },
};

export const POST_TEST_DIFFICULTIES = ["EasyPostTest","MediumPostTest","HardPostTest","ExpertPostTest","PostTest"];
export const isLevelPostTest = (diff) => POST_TEST_DIFFICULTIES.includes(diff);

export const JOURNEY_ORDER = [
  "Introduction",
  "Easy","EasyPostTest",
  "Medium","MediumPostTest",
  "Hard","HardPostTest",
  "Expert","ExpertPostTest",
  "PostTest",
];

export const READING_ASSESSMENT_DIFFS = [
  "Introduction",
  "EasyPostTest","MediumPostTest","HardPostTest","ExpertPostTest","PostTest",
];

export const scoreWordByWord = (transcript, correctText, maxPoints) => {
  const normalize = (t) => (t||"").toLowerCase().replace(/[^a-z0-9\s]/g,"").trim().split(/\s+/).filter(Boolean);
  const spokenWords  = normalize(transcript);
  const correctWords = normalize(correctText);
  if (correctWords.length === 0) return 0;
  const pool = [...correctWords]; let matched = 0;
  for (const word of spokenWords) { const idx = pool.indexOf(word); if (idx !== -1) { matched++; pool.splice(idx,1); } }
  return Math.round((matched / correctWords.length) * maxPoints);
};

export const getPlacementLevel = (pct) => {
  if (pct >= 91) return { level:"Expert", color:"#cc5de8", emoji:"🏆", label:"Grade Ready Reader" };
  if (pct >= 61) return { level:"Hard",   color:"#ff6b6b", emoji:"💎", label:"Developing Reader" };
  if (pct >= 31) return { level:"Medium", color:"#ffa94d", emoji:"🔥", label:"Beginning Reader" };
  return             { level:"Easy",   color:"#74c0fc", emoji:"⭐", label:"Low Reader" };
};

export const getStarCount = (pct) => {
  if (pct >= 95) return 5;
  if (pct >= 80) return 4;
  if (pct >= 60) return 3;
  if (pct >= 40) return 2;
  return 1;
};

export const StarRow = ({ count, color, size = "clamp(20px,5vw,28px)" }) => (
  <div style={{ display:"flex", gap:4, justifyContent:"center", margin:"6px 0" }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{
        fontSize: size, opacity: i <= count ? 1 : 0.2,
        filter: i <= count ? `drop-shadow(0 0 6px ${color}88)` : "none",
        animation: i <= count ? `starPop 0.4s ${0.1*i}s cubic-bezier(0.175,0.885,0.32,1.275) both` : "none",
      }}>⭐</span>
    ))}
  </div>
);

const confettiColors = ["#ff6b6b","#ffa94d","#ffd43b","#69db7c","#74c0fc","#da77f2","#ff8787","#63e6be"];

export const Confetti = () => {
  const pieces = Array.from({ length: 48 }, (_, i) => ({
    id: i, color: confettiColors[i % confettiColors.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
    duration: `${3 + Math.random() * 3}s`,
    size: `${8 + Math.random() * 8}px`,
  }));
  return (
    <>
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left: p.left, top: "-20px",
          width: p.size, height: p.size,
          backgroundColor: p.color,
          animationDuration: p.duration,
          animationDelay: p.delay,
          borderRadius: Math.random() > 0.5 ? "50%" : "3px",
        }} />
      ))}
    </>
  );
};
