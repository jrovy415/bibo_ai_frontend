// Emoji feedback modal shown ~1.8 s after the results page loads.
const FeedbackModal = ({ show, selectedFeeling, setSelectedFeeling, onSubmit, onSkip }) => {
  if (!show) return null;

  const options = [
    { key:"easy", emoji:"😊", label:"Easy!",  bg:"#DCFCE7", border:"#86EFAC", color:"#15803D" },
    { key:"okay", emoji:"😐", label:"Okay",   bg:"#FEF9C3", border:"#FDE047", color:"#A16207" },
    { key:"hard", emoji:"😔", label:"Hard",   bg:"#FEE2E2", border:"#FCA5A5", color:"#B91C1C" },
  ];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:10000, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"linear-gradient(160deg,#a8edea,#fed6e3,#ffecd2)", borderRadius:32, padding:"32px 28px", maxWidth:380, width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.3)", animation:"popIn 0.4s cubic-bezier(.17,.67,.35,1.3) both" }}>
        <div style={{ fontSize:52, marginBottom:8 }}>🎉</div>
        <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(20px,5vw,26px)", color:"#5b4e75", margin:"0 0 6px" }}>Great job, Superstar!</h2>
        <p style={{ fontSize:14, color:"#888", margin:"0 0 20px" }}>One quick question before you go...</p>
        <p style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#5b4e75", margin:"0 0 20px" }}>How did this quiz feel?</p>
        <div style={{ display:"flex", justifyContent:"center", gap:16, marginBottom:24 }}>
          {options.map(f => (
            <button key={f.key} onClick={() => setSelectedFeeling(f.key)} style={{
              width:80, height:80, borderRadius:"50%", background:f.bg, border:`3px solid ${f.border}`,
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, cursor:"pointer",
              outline: selectedFeeling === f.key ? "4px solid #6C63FF" : "none", outlineOffset:3,
              transform: selectedFeeling === f.key ? "scale(1.1)" : "scale(1)", transition:"all 0.15s ease",
            }}>
              <span style={{ fontSize:32, lineHeight:1 }}>{f.emoji}</span>
              <span style={{ fontSize:10, fontWeight:800, color:f.color }}>{f.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => onSubmit(selectedFeeling)} disabled={!selectedFeeling} style={{
          width:"100%", border:"none", borderRadius:50, padding:"14px 0",
          background: selectedFeeling ? "linear-gradient(90deg,#ff6b6b,#ffa94d)" : "#ddd",
          color:"white", fontFamily:"'Fredoka One',cursive", fontSize:18,
          cursor: selectedFeeling ? "pointer" : "not-allowed",
          boxShadow: selectedFeeling ? "0 6px 0 #e05a5a" : "none", transition:"all 0.2s",
        }}>
          Send my answer! 🚀
        </button>
        <p onClick={onSkip} style={{ marginTop:12, fontSize:13, color:"#aaa", cursor:"pointer", textDecoration:"underline" }}>
          Skip for now
        </p>
      </div>
    </div>
  );
};

export default FeedbackModal;
