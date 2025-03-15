"use client"

import * as React from "react"
import { ko } from "date-fns/locale"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  value: DateRange | undefined
  onChange: (date: DateRange | undefined) => void
  className?: string
  align?: "start" | "center" | "end"
  locale?: Locale
  placeholder?: string
  calendarButtonLabel?: string
  clearButtonLabel?: string
}

export function DateRangePicker({
  value,
  onChange,
  className,
  align = "start",
  locale = ko,
  placeholder = "날짜 범위 선택",
  calendarButtonLabel = "날짜 선택",
  clearButtonLabel = "초기화",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleClear = () => {
    onChange(undefined)
    setIsOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "w-[240px] justify-start text-left font-normal border-gray-300 focus:border-blue-500 focus:ring-blue-500",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "yyyy-MM-dd", { locale })} ~{" "}
                  {format(value.to, "yyyy-MM-dd", { locale })}
                </>
              ) : (
                format(value.from, "yyyy-MM-dd", { locale })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={locale}
          />
          <div className="flex items-center justify-between p-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {value?.from && value?.to
                ? `${format(value.from, "yyyy-MM-dd", { locale })} ~ ${format(value.to, "yyyy-MM-dd", { locale })}`
                : value?.from
                ? `${format(value.from, "yyyy-MM-dd", { locale })} ~`
                : "날짜를 선택하세요"}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs"
                onClick={handleClear}
              >
                {clearButtonLabel}
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={() => setIsOpen(false)}
              >
                {calendarButtonLabel}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
