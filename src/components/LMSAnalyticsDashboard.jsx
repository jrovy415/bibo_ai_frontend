import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer, ReferenceLine
} from "recharts";

import { Row, Col, Card, Statistic, Select, DatePicker, Table, Tag, Progress, Badge } from "antd";
import { TrophyOutlined, RiseOutlined, TeamOutlined, FileTextOutlined } from "@ant-design/icons";
import { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

const SCORE_COLORS = ["#ff4d4f", "#faad14", "#1890ff", "#52c41a"];
const DIFF_COLORS  = {
  Introduction:   "#69db7c",
  Easy:           "#74c0fc",
  EasyPostTest:   "#74c0fc",
  Medium:         "#ffa94d",
  MediumPostTest: "#ffa94d",
  Hard:           "#ff6b6b",
  HardPostTest:   "#ff6b6b",
  Expert:         "#cc5de8",
  ExpertPostTest: "#cc5de8",
  PostTest:       "#a9e34b",
};
const DIFF_LABELS = {
  Introduction:   "Pre-Test",
  Easy:           "Low Reader",
  EasyPostTest:   "Low Reader Post-Test",
  Medium:         "Beginning Reader",
  MediumPostTest: "Beginning Reader Post-Test",
  Hard:           "Developing Reader",
  HardPostTest:   "Developing Reader Post-Test",
  Expert:         "Grade Ready Reader",
  ExpertPostTest: "Grade Ready Post-Test",
  PostTest:       "Post-Test",
};

const medals = ["🥇", "🥈", "🥉"];

const renderPieLabel = ({ name, percent }) =>
  percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : "";

// Dark mode helper
const useDark = () => document.body.getAttribute('data-dark') === '1';

const DiffTag = ({ difficulty }) => (
  <Tag style={{
    background: (DIFF_COLORS[difficulty] || "#aaa") + "22",
    color:      DIFF_COLORS[difficulty] || "#aaa",
    border:     `1px solid ${DIFF_COLORS[difficulty] || "#aaa"}`,
    fontSize:   11, fontWeight: 600,
  }}>
    {DIFF_LABELS[difficulty] || difficulty}
  </Tag>
);

const KpiCard = ({ title, value, icon, color, suffix }) => {
  const dark = useDark();
  return (
    <Card bordered={false} style={{
      borderRadius: 12,
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      borderLeft: `4px solid ${color}`,
      background: dark ? '#1A1830' : 'white',
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Statistic
          title={<span style={{ fontSize: 13, color: dark ? '#7A79A0' : "#888" }}>{title}</span>}
          value={value}
          suffix={suffix}
          valueStyle={{ fontSize: 28, fontWeight: 700, color }}
        />
        <div style={{ fontSize: 32, color: color + "55" }}>{icon}</div>
      </div>
    </Card>
  );
};

const LMSAnalyticsDashboard = ({ data, onFilterChange }) => {
  const [dateRange,     setDateRange]     = useState(null);
  const [gradeFilter,   setGradeFilter]   = useState(null);
  const [studentFilter, setStudentFilter] = useState(null);
  const [quizFilter,    setQuizFilter]    = useState(null);
  const [diffFilter,    setDiffFilter]    = useState(null);
  const [, forceUpdate] = useState(0);

  // Re-render when dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => forceUpdate(n => n + 1));
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-dark'] });
    return () => observer.disconnect();
  }, []);

  const dark = useDark();

  const cardStyle = {
    borderRadius: 14,
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    background: dark ? '#1A1830' : 'white',
  };

  const textColor    = dark ? '#D0CFEE' : '#333';
  const mutedColor   = dark ? '#7A79A0' : '#888';
  const gridColor    = dark ? '#2D2A50' : '#f0f0f0';
  const axisColor    = dark ? '#7A79A0' : '#666';

  // Filtered data
  const filteredData = useMemo(() => {
    let f = [...data];
    if (dateRange)     f = f.filter(i => { const d = dayjs(i.created_at); return d.isAfter(dateRange[0]) && d.isBefore(dateRange[1]); });
    if (gradeFilter)   f = f.filter(i => i.student?.grade_level === gradeFilter);
    if (studentFilter) f = f.filter(i => i.student?.id === studentFilter);
    if (quizFilter)    f = f.filter(i => i.quiz?.id === quizFilter);
    if (diffFilter)    f = f.filter(i => i.quiz?.difficulty === diffFilter);
    return f;
  }, [data, dateRange, gradeFilter, studentFilter, quizFilter, diffFilter]);

  useEffect(() => { if (onFilterChange) onFilterChange(filteredData); }, [filteredData]);

  const totalAttempts  = filteredData.length;
  const avgScore       = filteredData.reduce((s, i) => s + (i.score ?? 0), 0) / (filteredData.length || 1);
  const highestScore   = Math.max(...filteredData.map(i => i.score ?? 0), 0);
  const uniqueStudents = new Set(filteredData.map(i => i.student?.id)).size;
  const completed      = filteredData.filter(i => i.completed_at).length;
  const completionPct  = totalAttempts > 0 ? Math.round((completed / totalAttempts) * 100) : 0;

  const ranges = [
    { name: "0–25%",   value: 0 },
    { name: "26–50%",  value: 0 },
    { name: "51–75%",  value: 0 },
    { name: "76–100%", value: 0 },
  ];
  filteredData.forEach(item => {
    const total = item.quiz?.questions?.length || 1;
    const pct   = ((item.score ?? 0) / total) * 100;
    if      (pct <= 25) ranges[0].value++;
    else if (pct <= 50) ranges[1].value++;
    else if (pct <= 75) ranges[2].value++;
    else                ranges[3].value++;
  });

  const quizMap = {};
  filteredData.forEach(item => {
    const key = item.quiz?.title || "Unknown";
    if (!quizMap[key]) quizMap[key] = { total: 0, count: 0, difficulty: item.quiz?.difficulty };
    quizMap[key].total += item.score ?? 0;
    quizMap[key].count++;
  });
  const barData = Object.keys(quizMap).map(q => ({
    quiz:       q.length > 20 ? q.slice(0, 18) + "…" : q,
    fullTitle:  q,
    average:    parseFloat((quizMap[q].total / quizMap[q].count).toFixed(2)),
    difficulty: quizMap[q].difficulty,
  }));

  const diffMap = {};
  filteredData.forEach(item => {
    const d = item.quiz?.difficulty || "Unknown";
    if (!diffMap[d]) diffMap[d] = { total: 0, count: 0 };
    diffMap[d].total += item.score ?? 0;
    diffMap[d].count++;
  });
  const diffBarData = Object.keys(diffMap).map(d => ({
    difficulty: DIFF_LABELS[d] || d,
    average:    parseFloat((diffMap[d].total / diffMap[d].count).toFixed(2)),
    color:      DIFF_COLORS[d] || "#aaa",
  }));

  const lineData = filteredData
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((item, index) => ({
      attempt: index + 1,
      score:   item.score ?? 0,
      student: item.student?.nickname,
      quiz:    item.quiz?.title,
    }));

  const scoringMethodData = useMemo(() => {
    const map = {};
    filteredData.forEach(item => {
      const title = item.quiz?.title || "Unknown";
      const diff  = item.quiz?.difficulty || "";
      if (!map[title]) map[title] = { title, difficulty: diff, wordByWord: 0, exactMatch: 0, total: 0, totalScore: 0, count: 0 };
      map[title].totalScore += item.score ?? 0;
      map[title].count++;
      (item.quiz?.questions || []).forEach(q => {
        map[title].total++;
        if (q.use_word_scoring) map[title].wordByWord++;
        else                    map[title].exactMatch++;
      });
    });
    return Object.values(map);
  }, [filteredData]);

  const lbMap = {};
  filteredData.forEach(item => {
    const key = item.student?.nickname || "Unknown";
    if (!lbMap[key]) lbMap[key] = { total: 0, count: 0, grade: item.student?.grade_level };
    lbMap[key].total += item.score ?? 0;
    lbMap[key].count++;
  });
  const leaderboard = Object.keys(lbMap)
    .map(s => ({ student: s, avg: parseFloat((lbMap[s].total / lbMap[s].count).toFixed(1)), attempts: lbMap[s].count, grade: lbMap[s].grade }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10);

  const gradeOptions   = [...new Set(data.map(i => i.student?.grade_level).filter(Boolean))];
  const diffOptions    = [...new Set(data.map(i => i.quiz?.difficulty).filter(Boolean))];
  const studentOptions = [...new Map(data.map(i => [i.student?.id, i.student])).values()].filter(Boolean);
  const quizOptions    = [...new Map(data.map(i => [i.quiz?.id, i.quiz])).values()].filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Filter Panel */}
      <Card bordered={false} style={cardStyle}>
        <div style={{ fontWeight: 700, fontSize: 13, color: mutedColor, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>🔍 Filters</div>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} lg={6}>
            <RangePicker style={{ width: "100%" }} onChange={setDateRange} placeholder={["Start date", "End date"]} />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select placeholder="Grade Level" style={{ width: "100%" }} onChange={setGradeFilter} allowClear>
              {gradeOptions.map(g => <Option key={g} value={g}>{g}</Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select placeholder="Difficulty" style={{ width: "100%" }} onChange={setDiffFilter} allowClear>
              {diffOptions.map(d => <Option key={d} value={d}>{DIFF_LABELS[d] || d}</Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select placeholder="Student" style={{ width: "100%" }} onChange={setStudentFilter} allowClear showSearch optionFilterProp="children">
              {studentOptions.map(s => <Option key={s.id} value={s.id}>{s.nickname}</Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select placeholder="Quiz" style={{ width: "100%" }} onChange={setQuizFilter} allowClear showSearch optionFilterProp="children">
              {quizOptions.map(q => <Option key={q.id} value={q.id}>{q.title}</Option>)}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}><KpiCard title="Total Attempts"  value={totalAttempts}       icon={<FileTextOutlined />} color="#1890ff" /></Col>
        <Col xs={24} sm={12} lg={6}><KpiCard title="Average Score"   value={avgScore.toFixed(1)} icon={<RiseOutlined />}     color="#52c41a" /></Col>
        <Col xs={24} sm={12} lg={6}><KpiCard title="Highest Score"   value={highestScore}        icon={<TrophyOutlined />}   color="#faad14" /></Col>
        <Col xs={24} sm={12} lg={6}><KpiCard title="Active Students" value={uniqueStudents}      icon={<TeamOutlined />}     color="#722ed1" /></Col>
      </Row>

      {/* Completion Rate */}
      <Card bordered={false} style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: textColor }}>✅ Quiz Completion Rate</span>
          <span style={{ fontWeight: 700, fontSize: 20, color: completionPct >= 75 ? "#52c41a" : completionPct >= 50 ? "#faad14" : "#ff4d4f" }}>
            {completionPct}%
          </span>
        </div>
        <Progress percent={completionPct} strokeColor={completionPct >= 75 ? "#52c41a" : completionPct >= 50 ? "#faad14" : "#ff4d4f"} showInfo={false} strokeWidth={12} trailColor={dark ? '#2D2A50' : '#f0f0f0'} />
        <div style={{ fontSize: 12, color: mutedColor, marginTop: 6 }}>{completed} of {totalAttempts} attempts completed</div>
      </Card>

      {/* Pie + Bar per quiz */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card title={<span style={{ fontWeight: 700, color: textColor }}>📊 Score Distribution</span>} bordered={false} style={{ ...cardStyle, height: "100%" }}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={ranges} dataKey="value" label={renderPieLabel} labelLine={false} outerRadius={100}>
                  {ranges.map((_, i) => <Cell key={i} fill={SCORE_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v} attempts`, ""]} contentStyle={{ background: dark ? '#1A1830' : 'white', border: `1px solid ${dark ? '#2D2A50' : '#e0e0e0'}`, color: textColor }} />
                <Legend wrapperStyle={{ color: textColor }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title={<span style={{ fontWeight: 700, color: textColor }}>📚 Average Score Per Quiz</span>} bordered={false} style={{ ...cardStyle, height: "100%" }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="quiz" tick={{ fontSize: 11, fill: axisColor }} interval={0} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: axisColor }} />
                <Tooltip formatter={(v, _, props) => [v, props.payload.fullTitle]} labelFormatter={() => ""} contentStyle={{ background: dark ? '#1A1830' : 'white', border: `1px solid ${dark ? '#2D2A50' : '#e0e0e0'}`, color: textColor }} />
                <Bar dataKey="average" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => <Cell key={i} fill={DIFF_COLORS[entry.difficulty] || "#1890ff"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {Object.keys(DIFF_COLORS).filter(d => !d.includes('PostTest') || d === 'PostTest').map(d => (
                <span key={d} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: DIFF_COLORS[d] + "22", color: DIFF_COLORS[d], border: `1px solid ${DIFF_COLORS[d]}`, fontWeight: 600 }}>
                  {DIFF_LABELS[d]}
                </span>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Avg by Level + Score Progression */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card title={<span style={{ fontWeight: 700, color: textColor }}>🎯 Average Score by Level</span>} bordered={false} style={{ ...cardStyle, height: "100%" }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={diffBarData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                <XAxis type="number" tick={{ fontSize: 11, fill: axisColor }} />
                <YAxis dataKey="difficulty" type="category" tick={{ fontSize: 11, fill: axisColor }} width={130} />
                <Tooltip contentStyle={{ background: dark ? '#1A1830' : 'white', border: `1px solid ${dark ? '#2D2A50' : '#e0e0e0'}`, color: textColor }} />
                <Bar dataKey="average" radius={[0, 6, 6, 0]}>
                  {diffBarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title={<span style={{ fontWeight: 700, color: textColor }}>📈 Score Progression</span>} bordered={false} style={{ ...cardStyle, height: "100%" }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="attempt" tick={{ fontSize: 11, fill: axisColor }} label={{ value: "Attempt #", position: "insideBottom", offset: -4, fontSize: 11, fill: axisColor }} />
                <YAxis tick={{ fontSize: 11, fill: axisColor }} />
                <Tooltip formatter={(v, _, props) => [v, `${props.payload.student} — ${props.payload.quiz}`]} contentStyle={{ background: dark ? '#1A1830' : 'white', border: `1px solid ${dark ? '#2D2A50' : '#e0e0e0'}`, color: textColor }} />
                <ReferenceLine y={avgScore} stroke="#faad14" strokeDasharray="4 4" label={{ value: "Avg", fontSize: 10, fill: "#faad14" }} />
                <Line type="monotone" dataKey="score" stroke="#52c41a" strokeWidth={2} dot={{ r: 4, fill: "#52c41a" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Scoring Method Breakdown */}
      <Card title={<span style={{ fontWeight: 700, color: textColor }}>🔤 Scoring Method Breakdown Per Quiz</span>} bordered={false} style={cardStyle}>
        <Table
          dataSource={scoringMethodData}
          rowKey="title"
          pagination={false}
          size="middle"
          columns={[
            {
              title: "Quiz", dataIndex: "title", key: "title",
              render: v => <span style={{ fontWeight: 600, color: textColor }}>{v}</span>,
            },
            {
              title: "Level", dataIndex: "difficulty", key: "difficulty",
              render: v => <DiffTag difficulty={v} />,
            },
            {
              title: "🔤 Word-by-Word", dataIndex: "wordByWord", key: "wordByWord",
              render: (v, row) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, color: "#1890ff", minWidth: 20 }}>{v}</span>
                  {row.total > 0 && <Progress percent={Math.round((v / row.total) * 100)} size="small" strokeColor="#1890ff" style={{ width: 70, margin: 0 }} showInfo={false} trailColor={dark ? '#2D2A50' : '#f0f0f0'} />}
                  <span style={{ fontSize: 11, color: mutedColor }}>{row.total > 0 ? `${Math.round((v / row.total) * 100)}%` : "-"}</span>
                </div>
              ),
            },
            {
              title: "✅ Exact Match", dataIndex: "exactMatch", key: "exactMatch",
              render: (v, row) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, color: "#52c41a", minWidth: 20 }}>{v}</span>
                  {row.total > 0 && <Progress percent={Math.round((v / row.total) * 100)} size="small" strokeColor="#52c41a" style={{ width: 70, margin: 0 }} showInfo={false} trailColor={dark ? '#2D2A50' : '#f0f0f0'} />}
                  <span style={{ fontSize: 11, color: mutedColor }}>{row.total > 0 ? `${Math.round((v / row.total) * 100)}%` : "-"}</span>
                </div>
              ),
            },
            {
              title: "Avg Score", key: "avgScore",
              render: (_, row) => (
                <span style={{ fontWeight: 700, color: row.count > 0 && (row.totalScore / row.count) >= 0.5 ? "#52c41a" : "#ff4d4f" }}>
                  {row.count > 0 ? (row.totalScore / row.count).toFixed(1) : "-"}
                </span>
              ),
            },
            {
              title: "Attempts", dataIndex: "count", key: "count",
              render: v => <Badge count={v} style={{ backgroundColor: "#1890ff" }} overflowCount={999} />,
            },
          ]}
        />
      </Card>

      {/* Leaderboard */}
      <Card title={<span style={{ fontWeight: 700, color: textColor }}>🏆 Top Students Leaderboard</span>} bordered={false} style={cardStyle}>
        <Table
          dataSource={leaderboard}
          rowKey="student"
          pagination={false}
          size="middle"
          columns={[
            {
              title: "Rank", key: "rank", width: 70,
              render: (_, __, i) => (
                <span style={{ fontSize: i < 3 ? 22 : 14, fontWeight: 700, color: i === 0 ? "#faad14" : i === 1 ? "#8c8c8c" : i === 2 ? "#d46b08" : mutedColor }}>
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </span>
              ),
            },
            {
              title: "Student", dataIndex: "student", key: "student",
              render: (v, row) => (
                <div>
                  <div style={{ fontWeight: 700, color: textColor }}>{v}</div>
                  <div style={{ fontSize: 11, color: mutedColor }}>{row.grade}</div>
                </div>
              ),
            },
            {
              title: "Attempts", dataIndex: "attempts", key: "attempts",
              render: v => <span style={{ color: mutedColor }}>{v}</span>,
            },
            {
              title: "Average Score", dataIndex: "avg", key: "avg",
              render: v => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Progress
                    percent={Math.min(parseFloat(v) * 10, 100)}
                    size="small"
                    strokeColor={parseFloat(v) >= 0.75 ? "#52c41a" : parseFloat(v) >= 0.5 ? "#faad14" : "#ff4d4f"}
                    style={{ width: 80, margin: 0 }}
                    showInfo={false}
                    trailColor={dark ? '#2D2A50' : '#f0f0f0'}
                  />
                  <span style={{ fontWeight: 700, color: textColor }}>{v}</span>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default LMSAnalyticsDashboard;