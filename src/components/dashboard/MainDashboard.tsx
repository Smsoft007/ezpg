import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Users, 
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import TransactionTable from '@/components/transactions/TransactionTable';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 임시 데이터
const transactionData = [
  { month: '1월', 카드: 4000, 계좌이체: 2400, 가상계좌: 1800 },
  { month: '2월', 카드: 4200, 계좌이체: 2100, 가상계좌: 1600 },
  { month: '3월', 카드: 4800, 계좌이체: 2600, 가상계좌: 2000 },
  { month: '4월', 카드: 5000, 계좌이체: 2800, 가상계좌: 2200 },
  { month: '5월', 카드: 4700, 계좌이체: 2700, 가상계좌: 2100 },
  { month: '6월', 카드: 5500, 계좌이체: 3000, 가상계좌: 2400 },
];

const dailyTrends = [
  { day: '월', 거래액: 1200, 승인건수: 42 },
  { day: '화', 거래액: 1800, 승인건수: 53 },
  { day: '수', 거래액: 1600, 승인건수: 49 },
  { day: '목', 거래액: 2000, 승인건수: 57 },
  { day: '금', 거래액: 2400, 승인건수: 61 },
  { day: '토', 거래액: 1900, 승인건수: 48 },
  { day: '일', 거래액: 1300, 승인건수: 39 },
];

const paymentMethodData = [
  { name: '신용카드', value: 55, color: '#4f46e5' },
  { name: '계좌이체', value: 25, color: '#3b82f6' },
  { name: '가상계좌', value: 15, color: '#0ea5e9' },
  { name: '기타', value: 5, color: '#8b5cf6' },
];

const topMerchants = [
  { id: 1, name: '에이비씨 주식회사', transactions: 342, amount: 15700000, growth: 12.5 },
  { id: 2, name: '스마트페이 테크', transactions: 287, amount: 12450000, growth: 8.3 },
  { id: 3, name: '디지털 커머스', transactions: 253, amount: 9800000, growth: -3.2 },
  { id: 4, name: '이커머스 솔루션', transactions: 201, amount: 7600000, growth: 5.1 },
  { id: 5, name: '모바일 페이먼트', transactions: 189, amount: 6900000, growth: 2.8 },
];

const COLORS = ['#4f46e5', '#3b82f6', '#0ea5e9', '#8b5cf6', '#6366f1'];

/**
 * 메인 대시보드 컴포넌트
 */
export default function MainDashboard() {
  const [timeRange, setTimeRange] = useState('week');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 일/주/월/년 간 거래 추이 데이터
  const getChartData = () => {
    switch (timeRange) {
      case 'day':
        return dailyTrends;
      case 'week':
        return transactionData.slice(0, 7);
      case 'month':
        return transactionData;
      case 'year':
        return transactionData;
      default:
        return transactionData;
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단 필터 영역 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>
          <p className="text-muted-foreground">
            결제 시스템의 주요 지표와 트렌드를 확인하세요.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {date ? format(date, 'PPP', { locale: ko }) : '날짜 선택'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(date) => {
                  setDate(date);
                  setIsCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">일간</SelectItem>
              <SelectItem value="week">주간</SelectItem>
              <SelectItem value="month">월간</SelectItem>
              <SelectItem value="year">연간</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                필터
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">필터 옵션</h4>
                <div className="space-y-2">
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium">결제 방법</label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="전체" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="card">신용카드</SelectItem>
                        <SelectItem value="transfer">계좌이체</SelectItem>
                        <SelectItem value="virtual">가상계좌</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium">가맹점</label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="전체" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="1">에이비씨 주식회사</SelectItem>
                        <SelectItem value="2">스마트페이 테크</SelectItem>
                        <SelectItem value="3">디지털 커머스</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium">상태</label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="전체" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="approved">승인</SelectItem>
                        <SelectItem value="pending">대기</SelectItem>
                        <SelectItem value="failed">실패</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button size="sm">적용</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              총 거래액
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩ 128,450,000</div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-green-500 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>12.5%</span>
              </div>
              <div className="text-xs text-muted-foreground">전월 대비</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              거래 건수
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,287</div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-green-500 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>8.2%</span>
              </div>
              <div className="text-xs text-muted-foreground">전월 대비</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              신규 가맹점
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-green-500 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>16.7%</span>
              </div>
              <div className="text-xs text-muted-foreground">전월 대비</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              거래 성공률
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.2%</div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-red-500 flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                <span>0.5%</span>
              </div>
              <div className="text-xs text-muted-foreground">전월 대비</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 영역 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* 거래 추이 차트 */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>거래 추이</CardTitle>
            <CardDescription>
              결제 수단별 거래액 추이
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={timeRange === 'day' ? 'day' : 'month'} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString()}원`, '']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend />
                  <Bar dataKey="카드" fill="#4f46e5" />
                  <Bar dataKey="계좌이체" fill="#3b82f6" />
                  <Bar dataKey="가상계좌" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* 결제 수단 비율 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>결제 수단 비율</CardTitle>
            <CardDescription>
              결제 수단별 거래 비율
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, '비율']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 하단 영역: 탭 기반 콘텐츠 */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">최근 거래 내역</TabsTrigger>
          <TabsTrigger value="merchants">상위 가맹점</TabsTrigger>
        </TabsList>
        
        {/* 최근 거래 내역 탭 */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>최근 거래 내역</CardTitle>
              <CardDescription>
                최근 발생한 거래 내역을 확인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionTable limit={5} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 상위 가맹점 탭 */}
        <TabsContent value="merchants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>상위 거래 가맹점</CardTitle>
              <CardDescription>
                거래액 기준 상위 5개 가맹점
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topMerchants.map((merchant) => (
                  <div key={merchant.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <div className="font-medium">{merchant.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {merchant.transactions}건의 거래
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-medium">
                        {merchant.amount.toLocaleString()}원
                      </div>
                      <div className={`text-sm flex items-center ${merchant.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {merchant.growth >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(merchant.growth)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
