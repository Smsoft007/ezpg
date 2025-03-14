import React, { useEffect, useRef, useState, CSSProperties } from 'react';

interface InfiniteScrollProps {
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  loadingComponent?: React.ReactNode;
  endComponent?: React.ReactNode;
  threshold?: number;
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
}

export default function InfiniteScroll({
  loadMore,
  hasMore,
  isLoading,
  loadingComponent = <DefaultLoader />,
  endComponent = <DefaultEnd />,
  threshold = 300,
  className = '',
  style,
  children,
}: InfiniteScrollProps) {
  const [shouldLoadMore, setShouldLoadMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || isLoading || !hasMore) return;

      const container = containerRef.current;
      const { scrollTop, scrollHeight, clientHeight } = container;

      // 스크롤이 하단에 도달했는지 확인 (threshold 값만큼의 여유를 둠)
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        setShouldLoadMore(true);
      }
    };

    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isLoading, hasMore, threshold]);

  useEffect(() => {
    if (shouldLoadMore && hasMore && !isLoading) {
      loadMore();
      setShouldLoadMore(false);
    }
  }, [shouldLoadMore, hasMore, isLoading, loadMore]);

  return (
    <div ref={containerRef} className={`overflow-auto ${className}`} style={style}>
      {children}
      {isLoading && loadingComponent}
      {!hasMore && !isLoading && endComponent}
    </div>
  );
}

function DefaultLoader() {
  return (
    <div className="flex justify-center items-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

function DefaultEnd() {
  return (
    <div className="text-center py-4 text-gray-500 text-sm">
      더 이상 데이터가 없습니다
    </div>
  );
}
