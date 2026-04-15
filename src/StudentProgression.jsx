import { useEffect, useState, useMemo } from "react";
import { Spin, Select, Empty, Modal, Tag, Input } from "antd";
import axios from "../plugins/axios";

const { Option } = Select;

/* ── Design tokens (same as Dashboard) ───────────────────────────────────── */
const C = {
  primary:  "#6C63FF",
  secondary:"#FF6584",
  accent:   "#43D9AD",
  warning:  "#FFB830",
  bg:       "#F0F2FF",
  surface:  "#FFFFFF",
  text:     "#1A1A2E",
  muted:    "#6B7280",
};

const DIFF_ORDER  = ["Introduction","Easy","Medium","Hard","Expert","PostTest"];
const DIFF_LABELS = {
  Introduction: "Pre-Test",
  Easy:         "Low Reader",
  Medium:       "Developing Reader",
  Hard:         "Grade Ready Reader",
  Expert:       "Advanced Reader",
  PostTest:     "Post-Test",
};
const DIFF_COLORS = {
  Introduction: { bg:"#E3F2FD", text:"#1565C0", border:"#90CAF9" },
  Easy:         { bg:"#E8F5E9", text:"#2E7D32", border:"#A5D6A7" },
  Medium:       { bg:"#FFF3E0", text:"#E65100", border:"#FFCC80" },
  Hard:         { bg:"#FCE4EC", text:"#880E4F", border:"#F48FB1" },
  Expert:       { bg:"#F3E5F5", text:"#4A148C", border:"#CE93D8" },
  PostTest:     { bg:"#F1F8E9", text:"#33691E", border:"#AED581" },
};
const DIFF_EMOJIS = {
  Introduction:"📝", Easy:"⭐", Medium:"🔥", Hard:"💎", Expert:"🏆", PostTest:"🎓",
};

/* ── Styles ───────────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.prog-root * { font-family: 'Plus Jakarta Sans', sans-serif !important; box-sizing: border-box; }

.prog-root {
  background: ${C.bg};
  min-height: calc(100vh - 72px);
  padding: 0;
}

/* ── Filters ── */
.prog-filters {
  background: white;
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 2px 12px rgba(108,99,255,0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

/* ── Summary cards ── */
.prog-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.prog-summary-card {
  background: white;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 12px rgba(108,99,255,0.08);
  text-align: center;
}
.prog-summary-val {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 4px;
}
.prog-summary-label {
  font-size: 12px;
  color: ${C.muted};
  font-weight: 500;
}

/* ── Student cards grid ── */
.prog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

/* ── Student card ── */
.prog-card {
  background: white;
  border-radius: 18px;
  padding: 18px 20px;
  box-shadow: 0 2px 16px rgba(108,99,255,0.08);
  border: 1.5px solid rgba(108,99,255,0.08);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.prog-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(108,99,255,0.16);
}

.prog-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.prog-avatar {
  width: 42px; height: 42px; border-radius: 12px;
  background: linear-gradient(135deg,${C.primary},${C.secondary});
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 800; font-size: 14px;
  flex-shrink: 0;
}
.prog-name { font-weight: 700; font-size: 15px; color: ${C.text}; }
.prog-meta { font-size: 12px; color: ${C.muted}; margin-top: 2px; }

/* ── Journey steps ── */
.prog-journey {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: 12px;
  scrollbar-width: none;
}
.prog-journey::-webkit-scrollbar { display: none; }

.prog-step {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  min-width: 48px; flex-shrink: 0;
}
.prog-step-circle {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  border: 2px solid transparent;
  transition: all 0.2s;
}
.prog-step-pct  { font-size: 10px; font-weight: 700; }
.prog-step-name { font-size: 9px; color: ${C.muted}; text-align: center; line-height: 1.2; }
.prog-arrow { font-size: 10px; color: #CBD5E1; flex-shrink: 0; margin-top: -8px; }

/* ── Improvement badge ── */
.prog-improvement {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px; font-weight: 700;
}
.prog-improvement.up   { background: #F0FDF4; color: #15803D; }
.prog-improvement.down { background: #FFF1F2; color: #BE123C; }
.prog-improvement.none { background: #F8FAFC; color: ${C.muted}; }

/* ── Assigned level badge ── */
.prog-assigned {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 700;
  margin-top: 8px;
}

/* ── Modal journey detail ── */
.modal-journey-row {
  display: flex; align-items: stretch; gap: 0;
  margin-bottom: 8px;
}
.modal-level-card {
  flex: 1; border-radius: 12px; padding: 12px 14px;
  border: 1.5px solid transparent;
  transition: transform 0.2s;
}
.modal-level-card.taken { border-style: solid; }
.modal-level-card.skipped { opacity: 0.4; }

.modal-level-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.modal-level-emoji  { font-size: 18px; }
.modal-level-name   { font-size: 13px; font-weight: 700; }
.modal-level-pct    { font-size: 24px; font-weight: 800; line-height: 1; }
.modal-level-label  { font-size: 11px; font-weight: 500; opacity: 0.7; margin-top: 2px; }
.modal-level-date   { font-size: 10px; opacity: 0.6; margin-top: 4px; }

/* ── Progress bar in modal ── */
.modal-pct-bar-track {
  height: 6px; border-radius: 99px;
  background: rgba(0,0,0,0.1); margin-top: 8px; overflow: hidden;
}
.modal-pct-bar-fill {
  height: 100%; border-radius: 99px;
  background: currentColor; opacity: 0.6;
  transition: width 0.6s cubic-bezier(.34,1.56,.64,1);
}

.modal-improvement-banner {
  border-radius: 14px; padding: 14px 18px; margin-bottom: 20px;
  display: flex; align-items: center; justify-content: space-between;
}
`;

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const pctColor = (pct) => {
  if (pct === null || pct === undefined) return { bg:"#F1F5F9", text:"#94A3B8", border:"#E2E8F0" };
  if (pct >= 80) return { bg:"#DCFCE7", text:"#15803D", border:"#86EFAC" };
  if (pct >= 60) return { bg:"#FEF9C3", text:"#A16207", border:"#FDE047" };
  if (pct >= 40) return { bg:"#FFEDD5", text:"#C2410C", border:"#FCA5A5" };
  return             { bg:"#FEE2E2", text:"#B91C1C", border:"#FCA5A5" };
};

const initials = (name) =>
  (name || "?").slice(0, 2).toUpperCase();

const formatDate = (dt) => {
  if (!dt) return null;
  return new Date(dt).toLocaleDateString("en-PH", { month:"short", day:"numeric", year:"numeric" });
};

/* ── Student Modal ───────────────────────────────────────────────────────── */
function StudentModal({ student, onClose }) {
  if (!student) return null;
  const { nickname, grade_level, section, assigned_level, journey, improvement, overall_avg } = student;
  const preP  = journey?.Introduction?.pct ?? null;
  const postP = journey?.PostTest?.pct     ?? null;

  return (
    <Modal
      open={!!student}
      onCancel={onClose}
      footer={null}
      width={560}
      title={null}
      styles={{ body:{ padding:0 }, content:{ borderRadius:20, overflow:"hidden" } }}
    >
      <div style={{ padding:"24px 24px 20px" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
          <div style={{
            width:52, height:52, borderRadius:14,
            background:`linear-gradient(135deg,${C.primary},${C.secondary})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"white", fontWeight:800, fontSize:16, flexShrink:0,
          }}>{initials(nickname)}</div>
          <div>
            <div style={{ fontWeight:800, fontSize:18, color:C.text }}>{nickname}</div>
            <div style={{ fontSize:13, color:C.muted }}>{grade_level} — Section {section}</div>
            {assigned_level && (
              <div className="prog-assigned" style={{
                background: DIFF_COLORS[assigned_level]?.bg,
                color:      DIFF_COLORS[assigned_level]?.text,
                border:    `1px solid ${DIFF_COLORS[assigned_level]?.border}`,
              }}>
                {DIFF_EMOJIS[assigned_level]} Current Level: {DIFF_LABELS[assigned_level] || assigned_level}
              </div>
            )}
          </div>
        </div>

        {/* Improvement banner */}
        {preP !== null && postP !== null && (
          <div className="modal-improvement-banner" style={{
            background: improvement >= 0 ? "#F0FDF4" : "#FFF1F2",
            border: `1.5px solid ${improvement >= 0 ? "#86EFAC" : "#FCA5A5"}`,
          }}>
            <div>
              <div style={{ fontSize:12, color:C.muted, fontWeight:500, marginBottom:2 }}>Pre-Test → Post-Test</div>
              <div style={{ fontSize:22, fontWeight:800, color: improvement >= 0 ? "#15803D" : "#BE123C" }}>
                {improvement >= 0 ? "+" : ""}{Math.round(improvement)}% improvement
              </div>
            </div>
            <div style={{ fontSize:36 }}>{improvement >= 20 ? "🚀" : improvement >= 0 ? "📈" : "📉"}</div>
          </div>
        )}

        {/* Level-by-level journey */}
        <div style={{ fontWeight:700, fontSize:13, color:C.muted, marginBottom:12, textTransform:"uppercase", letterSpacing:1 }}>
          Reading Journey
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {DIFF_ORDER.map((diff) => {
            const data   = journey?.[diff];
            const taken  = !!data;
            const dc     = DIFF_COLORS[diff];
            const pc     = taken ? pctColor(data.pct) : null;
            return (
              <div key={diff}
                className={`modal-level-card ${taken ? "taken" : "skipped"}`}
                style={{
                  background:   taken ? dc.bg   : "#F8FAFC",
                  borderColor:  taken ? dc.border: "#E2E8F0",
                }}
              >
                <div className="modal-level-header">
                  <span className="modal-level-emoji">{DIFF_EMOJIS[diff]}</span>
                  <span className="modal-level-name" style={{ color: taken ? dc.text : C.muted }}>
                    {DIFF_LABELS[diff]}
                  </span>
                </div>
                {taken ? (
                  <>
                    <div className="modal-level-pct" style={{ color: pc.text }}>
                      {data.pct}%
                    </div>
                    <div className="modal-level-label" style={{ color: dc.text }}>
                      {data.title}
                    </div>
                    <div className="modal-pct-bar-track">
                      <div className="modal-pct-bar-fill" style={{ width:`${data.pct}%`, color: dc.text }}/>
                    </div>
                    {data.completed_at && (
                      <div className="modal-level-date">{formatDate(data.completed_at)}</div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize:12, color:"#94A3B8", fontWeight:500, marginTop:4 }}>Not taken</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall avg */}
        {overall_avg !== null && (
          <div style={{
            marginTop:16, padding:"12px 16px", borderRadius:12,
            background:"#F0F2FF", border:`1.5px solid ${C.primary}22`,
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <span style={{ fontSize:13, fontWeight:600, color:C.primary }}>Overall Average</span>
            <span style={{ fontSize:22, fontWeight:800, color:C.primary }}>{overall_avg}%</span>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function StudentProgression() {
  const [data,          setData]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [gradeFilter,   setGradeFilter]   = useState(null);
  const [sectionFilter, setSectionFilter] = useState(null);
  const [searchText,    setSearchText]    = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = {};
        if (gradeFilter)   params.grade_level = gradeFilter;
        if (sectionFilter) params.section     = sectionFilter;
        const res = await axios.get("/student-progress", { params });
        setData(res.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [gradeFilter, sectionFilter]);

  /* Dropdown options */
  const gradeOptions   = [...new Set(data.map(s => s.grade_level).filter(Boolean))];
  const sectionOptions = [...new Set(data.map(s => s.section).filter(Boolean))];

  /* Summary stats */
  const totalStudents  = data.length;
  const improved       = data.filter(s => s.improvement !== null && s.improvement > 0).length;
  const avgImprovement = useMemo(() => {
    const vals = data.map(s => s.improvement).filter(v => v !== null);
    return vals.length > 0 ? Math.round(vals.reduce((a,b) => a+b, 0) / vals.length) : null;
  }, [data]);
  const completedAll = data.filter(s =>
    s.journey?.Introduction && s.journey?.PostTest
  ).length;

  return (
    <>
      <style>{STYLES}</style>
      <div className="prog-root">

        {/* ── Filters ── */}
        <div className="prog-filters">
          <Input.Search
            placeholder="Search student nickname..."
            allowClear
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width:240, borderRadius:10 }}
          />
          <span style={{ fontSize:13, fontWeight:600, color:C.muted, marginLeft:4 }}>Filter by:</span>
          <Select placeholder="Grade Level" style={{ width:140 }} onChange={setGradeFilter} allowClear>
            {gradeOptions.map(g => <Option key={g} value={g}>{g}</Option>)}
          </Select>
          <Select placeholder="Section" style={{ width:120 }} onChange={setSectionFilter} allowClear>
            {sectionOptions.map(s => <Option key={s} value={s}>Section {s}</Option>)}
          </Select>
          <span style={{ marginLeft:"auto", fontSize:13, color:C.muted }}>
            {searchText.trim()
              ? `${data.filter(s => (s.nickname||"").toLowerCase().includes(searchText.toLowerCase()) || (s.grade_level||"").toLowerCase().includes(searchText.toLowerCase()) || (s.section||"").toString().includes(searchText)).length} result${data.filter(s => (s.nickname||"").toLowerCase().includes(searchText.toLowerCase())).length !== 1 ? "s" : ""} found`
              : `${totalStudents} student${totalStudents !== 1 ? "s" : ""}`
            }
          </span>
        </div>

        {/* ── Summary cards ── */}
        <div className="prog-summary">
          <div className="prog-summary-card">
            <div className="prog-summary-val" style={{ color:C.primary }}>{totalStudents}</div>
            <div className="prog-summary-label">Total Students</div>
          </div>
          <div className="prog-summary-card">
            <div className="prog-summary-val" style={{ color:"#15803D" }}>{completedAll}</div>
            <div className="prog-summary-label">Pre→Post Complete</div>
          </div>
          <div className="prog-summary-card">
            <div className="prog-summary-val" style={{ color:"#0EA5E9" }}>{improved}</div>
            <div className="prog-summary-label">Students Improved</div>
          </div>
          <div className="prog-summary-card">
            <div className="prog-summary-val" style={{ color: avgImprovement >= 0 ? "#15803D" : "#BE123C" }}>
              {avgImprovement !== null ? `${avgImprovement >= 0 ? "+" : ""}${avgImprovement}%` : "—"}
            </div>
            <div className="prog-summary-label">Avg Improvement</div>
          </div>
        </div>

        {/* ── Student cards ── */}
        {loading ? (
          <div style={{ textAlign:"center", padding:60 }}><Spin size="large"/></div>
        ) : data.length === 0 ? (
          <Empty description="No student data found" style={{ marginTop:60 }}/>
        ) : (
          <div className="prog-grid">
            {data
              .filter(student => {
                if (!searchText.trim()) return true;
                const kw = searchText.trim().toLowerCase();
                return (
                  (student.nickname     || "").toLowerCase().includes(kw) ||
                  (student.grade_level  || "").toLowerCase().includes(kw) ||
                  (student.section      || "").toString().includes(kw)
                );
              })
              .map(student => {
              const { id, nickname, grade_level, section, assigned_level, journey, improvement, overall_avg } = student;
              const preP  = journey?.Introduction?.pct ?? null;
              const postP = journey?.PostTest?.pct     ?? null;
              const dc    = assigned_level ? DIFF_COLORS[assigned_level] : null;

              return (
                <div key={id} className="prog-card" onClick={() => setSelectedStudent(student)}>
                  {/* Header */}
                  <div className="prog-card-header">
                    <div className="prog-avatar">{initials(nickname)}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className="prog-name">{nickname}</div>
                      <div className="prog-meta">{grade_level} — Section {section}</div>
                    </div>
                    {overall_avg !== null && (
                      <div style={{
                        fontSize:13, fontWeight:800, padding:"4px 10px",
                        borderRadius:10, background:pctColor(overall_avg).bg,
                        color:pctColor(overall_avg).text, flexShrink:0,
                      }}>
                        {overall_avg}%
                      </div>
                    )}
                  </div>

                  {/* Mini journey row */}
                  <div className="prog-journey">
                    {DIFF_ORDER.map((diff, idx) => {
                      const data2 = journey?.[diff];
                      const taken = !!data2;
                      const pc    = taken ? pctColor(data2.pct) : null;
                      return (
                        <div key={diff} style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <div className="prog-step">
                            <div className="prog-step-circle" style={{
                              background:  taken ? pc.bg      : "#F1F5F9",
                              borderColor: taken ? pc.border  : "#E2E8F0",
                              color:       taken ? pc.text    : "#CBD5E1",
                            }}>
                              {taken ? `${data2.pct}%` : DIFF_EMOJIS[diff]}
                            </div>
                            <div className="prog-step-pct" style={{ color: taken ? pc.text : "#CBD5E1" }}>
                              {DIFF_LABELS[diff].split(" ")[0]}
                            </div>
                          </div>
                          {idx < DIFF_ORDER.length - 1 && (
                            <div className="prog-arrow">›</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Improvement bar */}
                  <div className={`prog-improvement ${
                    improvement === null ? "none" : improvement >= 0 ? "up" : "down"
                  }`}>
                    <span>
                      {improvement === null
                        ? "Pre-Test or Post-Test not taken yet"
                        : improvement >= 0
                          ? `+${Math.round(improvement)}% improvement`
                          : `${Math.round(improvement)}% decline`}
                    </span>
                    <span style={{ fontSize:16 }}>
                      {improvement === null ? "📋" : improvement >= 20 ? "🚀" : improvement >= 0 ? "📈" : "📉"}
                    </span>
                  </div>

                  {/* Assigned level */}
                  {assigned_level && dc && (
                    <div className="prog-assigned" style={{
                      background:dc.bg, color:dc.text,
                      border:`1px solid ${dc.border}`,
                    }}>
                      {DIFF_EMOJIS[assigned_level]} {DIFF_LABELS[assigned_level] || assigned_level}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)}/>
    </>
  );
}