import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BalanceTrendData {
  date: string;
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
}

interface BalanceTrendChartProps {
  data: BalanceTrendData[];
  height?: number | string;
}

const BalanceTrendChart: React.FC<BalanceTrendChartProps> = ({ data, height = 400 }) => {
  // 숫자 포맷팅 함수
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ko-KR", { 
      style: "currency", 
      currency: "KRW",
      maximumFractionDigits: 0 
    }).format(value);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 툴팁 커스텀 포맷터
  const customTooltipFormatter = (value: any, name: string, props: any): [any, any] => {
    if (typeof value !== 'number') return [value, name];
    
    const formattedValue = formatCurrency(value);
    let displayName = name;
    
    switch(name) {
      case 'totalBalance':
        displayName = '총 잔액';
        break;
      case 'availableBalance':
        displayName = '가용 잔액';
        break;
      case 'pendingBalance':
        displayName = '대기 잔액';
        break;
    }
    
    return [formattedValue, displayName];
  };

  return (
    
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          stroke="#888888"
          fontSize={12}
        />
        <YAxis
          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
          stroke="#888888"
          fontSize={12}
        />
        <Tooltip
          formatter={customTooltipFormatter}
          labelFormatter={(label: any) => {
            if (typeof label !== 'string') return '날짜: 정보 없음';
            return `날짜: ${new Date(label).toLocaleDateString("ko-KR")}`;
          }}
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="totalBalance"
          name="총 잔액"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="availableBalance"
          name="가용 잔액"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="pendingBalance"
          name="대기 잔액"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default BalanceTrendChart;
