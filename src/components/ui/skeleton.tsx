import * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  // 추가 props가 필요하면 여기에 정의
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("animate-pulse rounded-md bg-muted", className)}
        {...props}
      />
    )
  }
)

Skeleton.displayName = "Skeleton"

export { Skeleton }
export default Skeleton
