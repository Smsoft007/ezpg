"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"

export interface CalendarProps {
  className?: string
  selected?: Date | null
  onSelect?: (date: Date | null) => void
  disabled?: boolean
  mode?: "single" | "range" | "multiple"
  defaultMonth?: Date
  month?: Date
  onMonthChange?: (date: Date) => void
  numberOfMonths?: number
  fromDate?: Date
  toDate?: Date
  showOutsideDays?: boolean
  [key: string]: any
}

// 날짜 포맷 함수
function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // 간단한 포맷 치환
  return format
    .replace('yyyy', year.toString())
    .replace('MM', month)
    .replace('dd', day)
    .replace('년', '년 ')
    .replace('월', '월 ');
}

// 월 추가 함수
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// 월 감소 함수
function subMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}

// 날짜 유효성 검사
function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
}

function Calendar({
  className,
  selected,
  onSelect,
  disabled = false,
  mode = "single",
  defaultMonth = new Date(),
  month,
  onMonthChange,
  numberOfMonths = 1,
  fromDate,
  toDate,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(month || defaultMonth || new Date())
  
  const handlePreviousMonth = () => {
    const newMonth = subMonths(currentMonth, 1)
    setCurrentMonth(newMonth)
    onMonthChange?.(newMonth)
  }
  
  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1)
    setCurrentMonth(newMonth)
    onMonthChange?.(newMonth)
  }
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value)
    if (isValidDate(date)) {
      onSelect?.(date)
    }
  }
  
  return (
    <div className={cn("flex flex-col space-y-2", className)} {...props}>
      <div className="flex justify-between items-center p-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousMonth}
          disabled={fromDate && fromDate > subMonths(currentMonth, 1)}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {formatDate(currentMonth, "yyyy년 MM월")}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          disabled={toDate && toDate < addMonths(currentMonth, 1)}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-2">
        <input
          type="date"
          className={cn(
            "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          )}
          value={selected ? formatDate(selected, "yyyy-MM-dd").replace(/\s/g, '') : ""}
          onChange={handleDateChange}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
