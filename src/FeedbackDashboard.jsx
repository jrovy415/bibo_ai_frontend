import { useEffect, useState, useMemo } from "react";
import { Spin, Select, Empty, Table, Tag } from "antd";
import axios from "../plugins/axios";

const { Option } = Select;

const C = {
  primary: "#6C63FF", secondary: "#FF6584", accent: "#43D9AD",
  bg: "#F0F2FF", text: "#1A1A2E", muted: "#6B7280",
};

const FEELING_CONFIG = {
  easy: { emoji: "😊", label: "Easy!",  bg: "#DCFCE7", color: "#15803D", border: "#86EFAC" },
  okay: { emoji: "😐", label: "Okay",   bg: "#FEF9C3", color: "#A16207", border: "#FDE047" },
  hard: { emoji: "😔", label: "Hard",   bg: "#FEE2E2", color: "#B91C1C", border: "#FCA5A5" },
};

const DIFF_COLORS = {
  Introduction: "#1565C0", Easy: "#2E7D32", Medium: "#E65100",
  Hard: "#880E4F", Expert: "#4A148C", PostTest: "#33691E",
};
const DIFF_LABELS = {
  Introduction:"Pre-Test", Easy:"Low Reader", Medium:"Developing Reader",
  Hard:"Grade Ready Reader", Expert:"Advanced Reader", PostTest:"Post-Test",
};

const FeelingTag = ({ feeling }) => {
  const cfg = FEELING_CONFIG[feeling] || {};
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding:"2px 10px", borderRadius:20, fontSize:12, fontWeight:700,
      background: cfg.bg, color: cfg.color, border:`1px solid ${cfg.border}`,
    }}>
      {cfg.emoji} {cfg.label}
    </span>
  );
};

export default function FeedbackDashboard() {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [gradeFilter, setGradeFilter] = useState(null);
  const [quizFilter,  setQuizFilter]  = useState(null);
  const [feelFilter,  setFeelFilter]  = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = {};
        if (gradeFilter) params.grade_level = gradeFilter;
        if (quizFilter)  params.quiz_id     = quizFilter;
        if (feelFilter)  params.feeling     = feelFilter;
        const res = await axios.get("/quiz-feedbacks", { params });
        setData(res.data.data || null);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [gradeFilter, quizFilter, feelFilter]);

  const summary  = data?.summary   || { total:0, easy:0, okay:0, hard:0 };
  const perQuiz  = data?.per_quiz  || [];
  const feedbacks= data?.feedbacks || [];

  // Dropdown options from feedbacks
  const gradeOptions = [...new Set(feedbacks.map(f => f.student?.grade_level).filter(Boolean))];
  const quizOptions  = [...new Map(feedbacks.map(f => [f.quiz_id, f.quiz])).values()].filter(Boolean);

  const easyPct = summary.total > 0 ? Math.round((summary.easy / summary.total) * 100) : 0;
  const okayPct = summary.total > 0 ? Math.round((summary.okay / summary.total) * 100) : 0;
  const hardPct = summary.total > 0 ? Math.round((summary.hard / summary.total) * 100) : 0;

  const columns = [
    {
      title: "Student", key: "student",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight:600, fontSize:13 }}>{r.student?.nickname || "—"}</div>
          <div style={{ fontSize:11, color:C.muted }}>{r.student?.grade_level} — Section {r.student?.section}</div>
        </div>
      ),
    },
    {
      title: "Quiz", key: "quiz",
      render: (_, r) => (
        <div>
          <div style={{ fontSize:13, fontWeight:600 }}>{r.quiz?.title || "—"}</div>
          {r.quiz?.difficulty && (
            <span style={{
              fontSize:11, padding:"1px 8px", borderRadius:20, fontWeight:700,
              background: DIFF_COLORS[r.quiz.difficulty] + "18",
              color: DIFF_COLORS[r.quiz.difficulty],
            }}>
              {DIFF_LABELS[r.quiz.difficulty] || r.quiz.difficulty}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "How it felt", key: "feeling",
      render: (_, r) => <FeelingTag feeling={r.feeling}/>,
    },
    {
      title: "Date", key: "date",
      render: (_, r) => (
        <span style={{ fontSize:12, color:C.muted }}>
          {r.created_at ? new Date(r.created_at).toLocaleDateString("en-PH",{ month:"short", day:"numeric", year:"numeric" }) : "—"}
        </span>
      ),
    },
  ];

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .fb-dash * { font-family: 'Plus Jakarta Sans', sans-serif !important; box-sizing: border-box; }
    .fb-filters { background:white; border-radius:16px; padding:16px 20px; box-shadow:0 2px 12px rgba(108,99,255,0.08); display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:20px; }
    .fb-summary { display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:12px; margin-bottom:20px; }
    .fb-stat { background:white; border-radius:14px; padding:14px 16px; box-shadow:0 2px 12px rgba(108,99,255,0.08); text-align:center; }
    .fb-stat-emoji { font-size:28px; margin-bottom:4px; line-height:1; }
    .fb-stat-num { font-size:26px; font-weight:800; line-height:1; margin-bottom:2px; }
    .fb-stat-lbl { font-size:12px; color:${C.muted}; font-weight:500; }
    .fb-card { background:white; border-radius:16px; padding:20px; box-shadow:0 2px 12px rgba(108,99,255,0.08); margin-bottom:20px; }
    .fb-card-title { font-size:14px; font-weight:700; color:${C.text}; margin:0 0 14px; }
    .fb-bar-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
    .fb-bar-emoji { font-size:18px; width:28px; text-align:center; flex-shrink:0; }
    .fb-bar-track { flex:1; height:12px; background:#F0F2FF; border-radius:99px; overflow:hidden; }
    .fb-bar-fill { height:100%; border-radius:99px; transition:width 0.6s cubic-bezier(.34,1.56,.64,1); }
    .fb-bar-pct { font-size:12px; font-weight:700; width:36px; text-align:right; flex-shrink:0; }
    .per-quiz-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:12px; }
    .pq-card { border-radius:12px; padding:14px 16px; border:1.5px solid; }
    .pq-title { font-size:13px; font-weight:700; margin:0 0 4px; }
    .pq-diff { font-size:11px; font-weight:600; padding:1px 8px; border-radius:20px; display:inline-block; margin-bottom:10px; }
    .pq-bars { display:flex; flex-direction:column; gap:5px; }
    .pq-bar-row { display:flex; align-items:center; gap:6px; }
    .pq-bar-track { flex:1; height:8px; background:rgba(0,0,0,0.06); border-radius:99px; overflow:hidden; }
    .pq-bar-fill { height:100%; border-radius:99px; }
    .pq-count { font-size:11px; font-weight:700; width:20px; text-align:right; flex-shrink:0; }
    .ant-table { font-family:'Plus Jakarta Sans',sans-serif !important; border-radius:12px !important; overflow:hidden; }
    .ant-table-thead>tr>th { background:#F0F2FF !important; font-weight:700 !important; font-size:11px !important; text-transform:uppercase !important; letter-spacing:0.05em !important; color:${C.primary} !important; }
    .ant-table-tbody>tr>td { font-family:'Plus Jakarta Sans',sans-serif !important; border-bottom:1px solid #F0F2FF !important; }
    .ant-table-tbody>tr:hover>td { background:${C.primary}06 !important; }
  `;

  return (
    <>
      <style>{STYLES}</style>
      <div className="fb-dash">

        {/* Filters */}
        <div className="fb-filters">
          <span style={{ fontSize:13, fontWeight:600, color:C.muted }}>Filter by:</span>
          <Select placeholder="Grade Level" style={{ width:140 }} onChange={setGradeFilter} allowClear>
            {gradeOptions.map(g => <Option key={g} value={g}>{g}</Option>)}
          </Select>
          <Select placeholder="Quiz" style={{ width:200 }} onChange={setQuizFilter} allowClear showSearch optionFilterProp="children">
            {quizOptions.map(q => <Option key={q.id} value={q.id}>{q.title}</Option>)}
          </Select>
          <Select placeholder="Feeling" style={{ width:130 }} onChange={setFeelFilter} allowClear>
            <Option value="easy">😊 Easy</Option>
            <Option value="okay">😐 Okay</Option>
            <Option value="hard">😔 Hard</Option>
          </Select>
          <span style={{ marginLeft:"auto", fontSize:13, color:C.muted }}>{summary.total} response{summary.total !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:60 }}><Spin size="large"/></div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="fb-summary">
              <div className="fb-stat">
                <div className="fb-stat-emoji">📋</div>
                <div className="fb-stat-num" style={{ color:C.primary }}>{summary.total}</div>
                <div className="fb-stat-lbl">Total Responses</div>
              </div>
              <div className="fb-stat">
                <div className="fb-stat-emoji">😊</div>
                <div className="fb-stat-num" style={{ color:"#15803D" }}>{summary.easy}</div>
                <div className="fb-stat-lbl">Felt Easy</div>
              </div>
              <div className="fb-stat">
                <div className="fb-stat-emoji">😐</div>
                <div className="fb-stat-num" style={{ color:"#A16207" }}>{summary.okay}</div>
                <div className="fb-stat-lbl">Felt Okay</div>
              </div>
              <div className="fb-stat">
                <div className="fb-stat-emoji">😔</div>
                <div className="fb-stat-num" style={{ color:"#B91C1C" }}>{summary.hard}</div>
                <div className="fb-stat-lbl">Felt Hard</div>
              </div>
            </div>

            {/* Overall distribution bar */}
            {summary.total > 0 && (
              <div className="fb-card">
                <p className="fb-card-title">Overall Feeling Distribution</p>
                <div className="fb-bar-row">
                  <div className="fb-bar-emoji">😊</div>
                  <div style={{ fontSize:12, color:C.muted, width:36, flexShrink:0 }}>Easy</div>
                  <div className="fb-bar-track">
                    <div className="fb-bar-fill" style={{ width:`${easyPct}%`, background:"#86EFAC" }}/>
                  </div>
                  <div className="fb-bar-pct" style={{ color:"#15803D" }}>{easyPct}%</div>
                </div>
                <div className="fb-bar-row">
                  <div className="fb-bar-emoji">😐</div>
                  <div style={{ fontSize:12, color:C.muted, width:36, flexShrink:0 }}>Okay</div>
                  <div className="fb-bar-track">
                    <div className="fb-bar-fill" style={{ width:`${okayPct}%`, background:"#FDE047" }}/>
                  </div>
                  <div className="fb-bar-pct" style={{ color:"#A16207" }}>{okayPct}%</div>
                </div>
                <div className="fb-bar-row">
                  <div className="fb-bar-emoji">😔</div>
                  <div style={{ fontSize:12, color:C.muted, width:36, flexShrink:0 }}>Hard</div>
                  <div className="fb-bar-track">
                    <div className="fb-bar-fill" style={{ width:`${hardPct}%`, background:"#FCA5A5" }}/>
                  </div>
                  <div className="fb-bar-pct" style={{ color:"#B91C1C" }}>{hardPct}%</div>
                </div>
              </div>
            )}

            {/* Per-quiz breakdown */}
            {perQuiz.length > 0 && (
              <div className="fb-card">
                <p className="fb-card-title">Feedback per Quiz</p>
                <div className="per-quiz-grid">
                  {perQuiz.map(q => {
                    const ep = q.total > 0 ? Math.round((q.easy/q.total)*100) : 0;
                    const op = q.total > 0 ? Math.round((q.okay/q.total)*100) : 0;
                    const hp = q.total > 0 ? Math.round((q.hard/q.total)*100) : 0;
                    const dc = DIFF_COLORS[q.difficulty] || C.primary;
                    return (
                      <div key={q.quiz_id} className="pq-card"
                        style={{ background: dc+"08", borderColor: dc+"33" }}>
                        <div className="pq-title" style={{ color:C.text }}>{q.quiz_title}</div>
                        <span className="pq-diff" style={{ background:dc+"18", color:dc }}>
                          {DIFF_LABELS[q.difficulty] || q.difficulty}
                        </span>
                        <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>{q.total} response{q.total!==1?"s":""}</div>
                        <div className="pq-bars">
                          {[
                            { emoji:"😊", pct:ep, fill:"#86EFAC", count:q.easy },
                            { emoji:"😐", pct:op, fill:"#FDE047", count:q.okay },
                            { emoji:"😔", pct:hp, fill:"#FCA5A5", count:q.hard },
                          ].map((b,i) => (
                            <div key={i} className="pq-bar-row">
                              <span style={{ fontSize:14, width:20 }}>{b.emoji}</span>
                              <div className="pq-bar-track">
                                <div className="pq-bar-fill" style={{ width:`${b.pct}%`, background:b.fill }}/>
                              </div>
                              <div className="pq-count" style={{ color:C.muted }}>{b.count}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent responses table */}
            {feedbacks.length > 0 ? (
              <div className="fb-card">
                <p className="fb-card-title">All Responses</p>
                <Table
                  dataSource={feedbacks}
                  columns={columns}
                  rowKey="id"
                  size="middle"
                  pagination={{ pageSize:10, showSizeChanger:true, showTotal:(t,r)=>`${r[0]}-${r[1]} of ${t}` }}
                />
              </div>
            ) : (
              <Empty description="No feedback responses yet" style={{ marginTop:60 }}/>
            )}
          </>
        )}
      </div>
    </>
  );
}