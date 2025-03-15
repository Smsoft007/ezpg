import React from "react";
import {
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface MerchantBalanceData {
  merchantId: string;
  merchantName: string;
  value: number;
}

interface MerchantBalancePieChartProps {
  data: MerchantBalanceData[];
  dataKey?: string;
  nameKey?: string;
}

// 차트 색상 배열
const COLORS = [
  "#6366f1", // 인디고
  "#8b5cf6", // 보라
  "#ec4899", // 핑크
  "#10b981", // 에메랄드
  "#f59e0b", // 황색
  "#ef4444", // 빨강
  "#3b82f6", // 파랑
  "#14b8a6", // 청록
  "#f97316", // 주황
  "#84cc16", // 라임
];

const MerchantBalancePieChart: React.FC<MerchantBalancePieChartProps> = ({
  data,
  dataKey = "value",
  nameKey = "merchantName",
}) => {
  // 숫자 포맷팅 함수
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ko-KR").format(value) + "원";
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
          <p className="font-medium">{data.merchantName}</p>
          <p className="text-gray-700">{formatCurrency(data.value)}</p>
          <p className="text-gray-500 text-sm">
            {`${(payload[0].percent * 100).toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  // 커스텀 레전드
  const renderCustomizedLegend = (props: any) => {
    const { payload } = props;

    return (
      <ul className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center mr-4 mb-2">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  // 데이터에 색상 추가
  const coloredData = data.map((entry, index) => ({
    ...entry,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={coloredData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={40}
          fill="#8884d8"
          dataKey={dataKey}
          nameKey={nameKey}
          isAnimationActive={true}
          paddingAngle={2}
          cornerRadius={3}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          content={renderCustomizedLegend}
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MerchantBalancePieChart;
