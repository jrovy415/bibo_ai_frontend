import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from "recharts";

const COLORS = ["#ff4d4f", "#faad14", "#1890ff", "#52c41a"];

const QuizAnalyticsCharts = ({ data }) => {

  // PIE CHART (score ranges)
  const ranges = [
    { name: "0-25", value: 0 },
    { name: "26-50", value: 0 },
    { name: "51-75", value: 0 },
    { name: "76-100", value: 0 },
  ];

  data.forEach(item => {
    const score = item.score;

    if (score <= 25) ranges[0].value++;
    else if (score <= 50) ranges[1].value++;
    else if (score <= 75) ranges[2].value++;
    else ranges[3].value++;
  });

  // BAR CHART (average score per quiz)
  const quizMap = {};

  data.forEach(item => {
    const title = item.quiz?.title || "Unknown";

    if (!quizMap[title]) {
      quizMap[title] = { total: 0, count: 0 };
    }

    quizMap[title].total += item.score;
    quizMap[title].count += 1;
  });

  const barData = Object.keys(quizMap).map(title => ({
    quiz: title,
    average: (quizMap[title].total / quizMap[title].count).toFixed(1)
  }));

  // LINE CHART (score progression)
  const lineData = data
    .map((item, index) => ({
      attempt: index + 1,
      score: item.score
    }))
    .sort((a, b) => a.attempt - b.attempt);

  return (
    <div>

      {/* PIE CHART */}
      <h3>Score Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={ranges} dataKey="value" nameKey="name" label>
            {ranges.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* BAR CHART */}
      <h3 style={{ marginTop: 40 }}>Average Score Per Quiz</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="quiz" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="average" fill="#1890ff" />
        </BarChart>
      </ResponsiveContainer>

      {/* LINE CHART */}
      <h3 style={{ marginTop: 40 }}>Score Progression</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={lineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="attempt" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="score" stroke="#52c41a" />
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
};

export default QuizAnalyticsCharts;