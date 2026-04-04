import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from "recharts";

import { Row, Col, Card, Statistic, Select, DatePicker, Table } from "antd";
import { useState, useMemo } from "react";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ["#ff4d4f", "#faad14", "#1890ff", "#52c41a"];

const LMSAnalyticsDashboard = ({ data }) => {

  const [dateRange, setDateRange] = useState(null);
  const [gradeFilter, setGradeFilter] = useState(null);
  const [studentFilter, setStudentFilter] = useState(null);
  const [quizFilter, setQuizFilter] = useState(null);

  // FILTERED DATA
  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (dateRange) {
      filtered = filtered.filter(item => {
        const date = dayjs(item.created_at);
        return date.isAfter(dateRange[0]) && date.isBefore(dateRange[1]);
      });
    }

    if (gradeFilter) {
      filtered = filtered.filter(
        item => item.student?.grade_level === gradeFilter
      );
    }

    if (studentFilter) {
      filtered = filtered.filter(
        item => item.student?.id === studentFilter
      );
    }

    if (quizFilter) {
      filtered = filtered.filter(
        item => item.quiz?.id === quizFilter
      );
    }

    return filtered;

  }, [data, dateRange, gradeFilter, studentFilter, quizFilter]);

  // KPI VALUES
  const totalAttempts = filteredData.length;

  const avgScore =
    filteredData.reduce((sum, i) => sum + i.score, 0) /
    (filteredData.length || 1);

  const highestScore = Math.max(...filteredData.map(i => i.score), 0);

  const uniqueStudents = new Set(
    filteredData.map(i => i.student?.id)
  ).size;

  // PIE DATA
  const ranges = [
    { name: "0-25", value: 0 },
    { name: "26-50", value: 0 },
    { name: "51-75", value: 0 },
    { name: "76-100", value: 0 }
  ];

  filteredData.forEach(item => {
    const s = item.score;

    if (s <= 25) ranges[0].value++;
    else if (s <= 50) ranges[1].value++;
    else if (s <= 75) ranges[2].value++;
    else ranges[3].value++;
  });

  // BAR DATA
  const quizMap = {};

  filteredData.forEach(item => {
    const quiz = item.quiz?.title || "Unknown";

    if (!quizMap[quiz]) {
      quizMap[quiz] = { total: 0, count: 0 };
    }

    quizMap[quiz].total += item.score;
    quizMap[quiz].count++;
  });

  const barData = Object.keys(quizMap).map(q => ({
    quiz: q,
    average: (quizMap[q].total / quizMap[q].count).toFixed(1)
  }));

  // LINE DATA
  const lineData = filteredData.map((item, index) => ({
    attempt: index + 1,
    score: item.score
  }));

  // LEADERBOARD
  const leaderboardMap = {};

  filteredData.forEach(item => {
    const student = item.student?.nickname || "Unknown";

    if (!leaderboardMap[student]) {
      leaderboardMap[student] = { total: 0, count: 0 };
    }

    leaderboardMap[student].total += item.score;
    leaderboardMap[student].count++;
  });

  const leaderboard = Object.keys(leaderboardMap)
    .map(student => ({
      student,
      avg: (
        leaderboardMap[student].total /
        leaderboardMap[student].count
      ).toFixed(1)
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10);

  return (
    <div>

      {/* FILTER PANEL */}
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16}>

          <Col span={6}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={(val) => setDateRange(val)}
            />
          </Col>

          <Col span={6}>
            <Select
              placeholder="Grade Level"
              style={{ width: "100%" }}
              onChange={setGradeFilter}
              allowClear
            >
              {[...new Set(data.map(i => i.student?.grade_level))]
                .map(g => (
                  <Option key={g} value={g}>{g}</Option>
                ))}
            </Select>
          </Col>

          <Col span={6}>
            <Select
              placeholder="Student"
              style={{ width: "100%" }}
              onChange={setStudentFilter}
              allowClear
            >
              {[...new Set(data.map(i => i.student?.id))]
                .map(id => {
                  const student = data.find(s => s.student?.id === id)?.student;
                  return (
                    <Option key={id} value={id}>
                      {student?.nickname}
                    </Option>
                  );
                })}
            </Select>
          </Col>

          <Col span={6}>
            <Select
              placeholder="Quiz"
              style={{ width: "100%" }}
              onChange={setQuizFilter}
              allowClear
            >
              {[...new Set(data.map(i => i.quiz?.id))]
                .map(id => {
                  const quiz = data.find(q => q.quiz?.id === id)?.quiz;
                  return (
                    <Option key={id} value={id}>
                      {quiz?.title}
                    </Option>
                  );
                })}
            </Select>
          </Col>

        </Row>
      </Card>

      {/* KPI */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}><Card><Statistic title="Attempts" value={totalAttempts} /></Card></Col>
        <Col span={6}><Card><Statistic title="Average Score" value={avgScore.toFixed(1)} /></Card></Col>
        <Col span={6}><Card><Statistic title="Highest Score" value={highestScore} /></Card></Col>
        <Col span={6}><Card><Statistic title="Students" value={uniqueStudents} /></Card></Col>
      </Row>

      {/* CHARTS */}
      <Row gutter={16}>

        <Col span={12}>
          <Card title="Score Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={ranges} dataKey="value" label>
                  {ranges.map((e,i)=>(
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip/>
                <Legend/>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Average Score Per Quiz">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="quiz"/>
                <YAxis/>
                <Tooltip/>
                <Bar dataKey="average" fill="#1890ff"/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

      </Row>

      <Row style={{ marginTop:20 }}>
        <Col span={24}>
          <Card title="Score Progression">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="attempt"/>
                <YAxis/>
                <Tooltip/>
                <Line type="monotone" dataKey="score" stroke="#52c41a"/>
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* LEADERBOARD */}
      <Row style={{ marginTop:20 }}>
        <Col span={24}>
          <Card title="🏆 Top Students Leaderboard">
            <Table
              dataSource={leaderboard}
              pagination={false}
              columns={[
                { title:"Rank", render:(_,__,i)=>i+1 },
                { title:"Student", dataIndex:"student" },
                { title:"Average Score", dataIndex:"avg" }
              ]}
            />
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default LMSAnalyticsDashboard;