// Shared constants, helpers, and tiny UI atoms for the StudentDashboard.

export const floatKeyframes = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');
html, body, #root { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; overflow-x: hidden !important; box-sizing: border-box !important; }
*, *::before, *::after { box-sizing: border-box; font-family: 'Nunito', 'Comic Sans MS', cursive, sans-serif !important; }
@keyframes float       { 0%,100%{transform:translateY(0px) rotate(-2deg)} 50%{transform:translateY(-12px) rotate(2deg)} }
@keyframes float2      { 0%,100%{transform:translateY(0px) rotate(3deg)} 50%{transform:translateY(-8px) rotate(-3deg)} }
@keyframes wiggle      { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
@keyframes pop         { 0%{transform:scale(0.8);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
@keyframes rainbowBorder { 0%{border-color:#ff6b6b} 16%{border-color:#ffa94d} 33%{border-color:#ffd43b} 50%{border-color:#69db7c} 66%{border-color:#74c0fc} 83%{border-color:#da77f2} 100%{border-color:#ff6b6b} }
@keyframes bounce      { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-10px)} 60%{transform:translateY(-5px)} }
@keyframes shimmer     { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes twinkle     { 0%,100%{opacity:0.25;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.4)} }
@keyframes glowPulse   { 0%,100%{box-shadow:0 0 12px rgba(255,255,255,0.15)} 50%{box-shadow:0 0 32px rgba(255,255,255,0.5)} }
@keyframes speakingPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.65;transform:scale(1.06)} }
@keyframes floatUpDown { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-14px)} }
@keyframes bounceUp    { 0%,100%{transform:translateY(0) scale(1)} 40%{transform:translateY(-28px) scale(1.05)} 60%{transform:translateY(-10px) scale(1.02)} }
@keyframes waveArm     { 0%{transform:rotate(0deg)} 100%{transform:rotate(-45deg)} }
@keyframes armSway     { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(10deg)} }
@keyframes tutorialSlideIn { 0%{transform:translateY(20px);opacity:0} 70%{transform:translateY(-4px);opacity:1} 100%{transform:translateY(0);opacity:1} }
@keyframes confettiFall { 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
@keyframes spotlightPulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,211,75,0.9),0 0 0 8px rgba(255,211,75,0.5),0 0 0 18px rgba(255,211,75,0.2)} 50%{box-shadow:0 0 0 6px rgba(255,211,75,0.9),0 0 0 18px rgba(255,211,75,0.5),0 0 0 36px rgba(255,211,75,0.15)} }
@keyframes arrowBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes pointerTeleport { 0%{opacity:0;transform:scale(0.5)} 60%{opacity:1;transform:scale(1.1)} 100%{opacity:1;transform:scale(1)} }
@keyframes historyCardIn { 0%{transform:translateY(20px);opacity:0} 100%{transform:translateY(0);opacity:1} }

.dashboard-root { width:100%; max-width:100%; min-height:100vh; background:linear-gradient(160deg,#a8edea 0%,#fed6e3 50%,#ffecd2 100%); display:flex; flex-direction:column; align-items:center; padding:24px 16px 80px; overflow-x:hidden; position:relative; }
.floating-emoji { position:fixed; font-size:clamp(20px,4vw,36px); pointer-events:none; z-index:0; opacity:0.35; user-select:none; }
.welcome-card { animation:pop 0.6s ease-out forwards, rainbowBorder 4s linear infinite; width:100%; max-width:600px; border-radius:24px; border:4px solid #ff6b6b; background:linear-gradient(135deg,#fff9c4 0%,#ffd6e7 50%,#c8f7ff 100%); box-shadow:0 12px 32px rgba(0,0,0,0.12); padding:28px 20px; text-align:center; position:relative; overflow:hidden; z-index:1; margin-bottom:24px; }
.quiz-area { width:100%; max-width:600px; z-index:1; position:relative; }
.quiz-challenge-card { border-radius:24px; border:4px solid #ffa94d; background:linear-gradient(135deg,#fffde7,#ffe0ec,#e8f8ff); box-shadow:0 12px 32px rgba(0,0,0,0.1); padding:28px 20px; text-align:center; }
.posttest-challenge-card { border-radius:24px; border:4px solid #a9e34b; background:linear-gradient(135deg,#f3ffe3,#fffde7,#e8f8ff); box-shadow:0 12px 32px rgba(169,227,75,0.3); padding:28px 20px; text-align:center; }
.all-quizzes-card { border-radius:24px; border:4px solid #74c0fc; background:linear-gradient(135deg,#fffde7,#e8f8ff); box-shadow:0 12px 32px rgba(0,0,0,0.1); padding:24px 16px; }
.all-done-card { border-radius:24px; border:4px solid #ffd700; background:linear-gradient(135deg,#fff9c4,#ffd6e7,#c8f7ff); box-shadow:0 12px 40px rgba(255,215,0,0.3); padding:28px 20px; text-align:center; margin-bottom:16px; }
.history-card { border-radius:24px; border:4px solid #74c0fc; background:rgba(255,255,255,0.92); box-shadow:0 12px 32px rgba(0,0,0,0.1); padding:24px 20px; animation:historyCardIn 0.5s ease both; margin-bottom:16px; }
.difficulty-badge { border-radius:12px; padding:10px 16px; font-family:'Fredoka One',cursive !important; font-size:clamp(14px,3.5vw,18px); margin-bottom:12px; display:flex; align-items:center; gap:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
.quiz-item-card { margin-bottom:12px; border-radius:16px; background:rgba(255,255,255,0.95); padding:14px 16px; box-shadow:0 4px 16px rgba(0,0,0,0.07); transition:transform 0.2s; }
.quiz-item-card:hover { transform:translateY(-2px); }
.go-btn { border:none; border-radius:14px; color:white; font-family:'Fredoka One',cursive !important; font-size:clamp(13px,3vw,15px); padding:10px 20px; cursor:pointer; transition:all 0.15s; white-space:nowrap; flex-shrink:0; }
.go-btn:hover { transform:translateY(-2px); }
.start-btn { border:none; border-radius:24px; color:white; font-family:'Fredoka One',cursive !important; font-size:clamp(17px,4vw,22px); padding:clamp(12px,3vw,16px) clamp(36px,8vw,56px); cursor:pointer; background:linear-gradient(90deg,#ff6b6b,#ffa94d); box-shadow:0 6px 0 #e05a5a, 0 8px 20px rgba(255,107,107,0.4); transition:all 0.15s; }
.start-btn:hover { transform:translateY(-3px); }
.start-btn-posttest { border:none; border-radius:24px; color:white; font-family:'Fredoka One',cursive !important; font-size:clamp(17px,4vw,22px); padding:clamp(12px,3vw,16px) clamp(36px,8vw,56px); cursor:pointer; background:linear-gradient(90deg,#a9e34b,#2f9e44); box-shadow:0 6px 0 #1e7a34, 0 8px 20px rgba(46,164,68,0.4); transition:all 0.15s; }
.start-btn-posttest:hover { transform:translateY(-3px); }
.retake-btn { border:none; border-radius:24px; color:white; font-family:'Fredoka One',cursive !important; font-size:clamp(17px,4vw,22px); padding:clamp(12px,3vw,16px) clamp(36px,8vw,56px); cursor:pointer; background:linear-gradient(90deg,#845ef7,#cc5de8); box-shadow:0 6px 0 #6741d9, 0 8px 20px rgba(132,94,247,0.4); transition:all 0.15s; }
.retake-btn:hover { transform:translateY(-3px); }
.motivational-text { margin-top:32px; font-size:clamp(14px,3.5vw,18px); font-weight:800; text-align:center; background:linear-gradient(90deg,#ff6b6b,#ffa94d,#ffd43b,#69db7c,#74c0fc); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 3s linear infinite; padding:0 16px; z-index:1; }
`;

export const CONFETTI_COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF922B","#CC5DE8","#F06595"];

export const TUTORIAL_STEPS = [
  { title:"Welcome to your Dashboard! 🎓", description:"Welcome to your Dashboard! This is where all your quizzes live! I'll show you how everything works. Just follow along!", speakText:"Welcome to your Dashboard! This is where all your quizzes live! I'll show you how everything works. Just follow along!", highlight:null, emoji:"🌟", color:"#a78bfa", confetti:true },
  { title:"Your Level Badge 🏅", description:"See this colourful badge? It shows your current level. As you complete quizzes you will level up and unlock new challenges!", speakText:"See this colourful badge? It shows your current level! As you complete quizzes, you will level up and unlock new challenges!", highlight:"levelBadge", emoji:"📊", color:"#34d399", confetti:false },
  { title:"Your Quiz Card 🎯", description:"This card shows the next quiz waiting for you! You can see the title, how many questions, and how much time you get!", speakText:"This card shows the next quiz waiting for you! You can see the title, how many questions, and how much time you get!", highlight:"quizCard", emoji:"📋", color:"#fb923c", confetti:false },
  { title:"Press the Button! 🚀", description:"When you are ready, press the big button and start your quiz! You can do it! Give it your absolute best shot! You are amazing!", speakText:"When you are ready, press the big button and start your quiz! You can do it! Give it your absolute best shot! You are amazing!", highlight:"startBtn", emoji:"🎉", color:"#f472b6", confetti:true },
];

export const difficultyEmojis = { Introduction:"🌱", Easy:"⭐", EasyPostTest:"📋", Medium:"🔥", MediumPostTest:"📋", Hard:"💎", HardPostTest:"📋", Expert:"🏆", ExpertPostTest:"📋", PostTest:"🎓" };
export const difficultyColors = { Introduction:"#69db7c", Easy:"#74c0fc", EasyPostTest:"#4dabf7", Medium:"#ffa94d", MediumPostTest:"#fd7e14", Hard:"#ff6b6b", HardPostTest:"#f03e3e", Expert:"#cc5de8", ExpertPostTest:"#ae3ec9", PostTest:"#a9e34b" };
export const difficultyLabels = { Introduction:"Pre-Test", Easy:"Low Reader", EasyPostTest:"Low Reader Post-Test", Medium:"Beginning Reader", MediumPostTest:"Beginning Reader Post-Test", Hard:"Developing Reader", HardPostTest:"Developing Reader Post-Test", Expert:"Grade Ready Reader", ExpertPostTest:"Grade Ready Post-Test", PostTest:"Post-Test" };
export const difficultyOrder = ["Introduction","Easy","EasyPostTest","Medium","MediumPostTest","Hard","HardPostTest","Expert","ExpertPostTest","PostTest"];

export const isPostTestDifficulty = (diff) =>
  ["EasyPostTest","MediumPostTest","HardPostTest","ExpertPostTest","PostTest"].includes(diff);

export const getStarCount = (pct) => { if(pct>=95) return 5; if(pct>=80) return 4; if(pct>=60) return 3; if(pct>=40) return 2; return 1; };

export const StarRow = ({ count, size=12 }) => (
  <div style={{ display:"flex", gap:1 }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ fontSize:size, opacity:i<=count?1:0.2 }}>⭐</span>
    ))}
  </div>
);
