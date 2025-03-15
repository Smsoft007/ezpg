import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullPage?: boolean;
  className?: string;
}

/**
 * 로딩 스피너 컴포넌트
 * 
 * @param size - 스피너 크기 (sm, md, lg)
 * @param text - 표시할 텍스트
 * @param fullPage - 전체 페이지를 덮는 오버레이 여부
 * @param className - 추가 클래스명
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text = "로딩 중...",
  fullPage = false,
  className = "",
}) => {
  // 크기에 따른 스피너 클래스
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  // 전체 페이지 오버레이 스타일
  const overlayClasses = fullPage
    ? "fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50"
    : "flex items-center justify-center";

  return (
    <div className={`${overlayClasses} ${className}`}>
      <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-white/90 shadow-lg">
        <div
          className={`${sizeClasses[size]} border-t-primary border-primary/30 rounded-full animate-spin`}
        ></div>
        {text && <p className="text-gray-700 font-medium">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
