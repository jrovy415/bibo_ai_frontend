import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#ff4d4f", "#faad14", "#1890ff", "#52c41a"];

const QuizScorePieChart = ({ data }) => {
  // Group scores into ranges
  const scoreRanges = [
    { name: "0-25", value: 0 },
    { name: "26-50", value: 0 },
    { name: "51-75", value: 0 },
    { name: "76-100", value: 0 },
  ];

  data.forEach((item) => {
    const score = item.score;

    if (score <= 25) scoreRanges[0].value += 1;
    else if (score <= 50) scoreRanges[1].value += 1;
    else if (score <= 75) scoreRanges[2].value += 1;
    else scoreRanges[3].value += 1;
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={scoreRanges}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          label
        >
          {scoreRanges.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default QuizScorePieChart;