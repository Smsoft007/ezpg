import React, { ReactNode } from 'react';
import InfiniteScroll from './InfiniteScroll';

interface ShardCardProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  loadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  maxHeight?: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export default function ShardCard({
  title,
  actionLabel,
  onAction,
  children,
  loadMore,
  hasMore = false,
  isLoading = false,
  maxHeight = '600px',
  className = '',
  headerClassName = '',
  bodyClassName = ''
}: ShardCardProps) {
  const hasInfiniteScroll = loadMore && (hasMore || isLoading);

  const content = (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      {/* ud5e4ub354 */}
      <div className={`p-4 md:p-6 border-b border-gray-200 ${headerClassName}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {actionLabel && onAction && (
            <button 
              onClick={onAction}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>

      {/* ubcf8ubb38 */}
      {hasInfiniteScroll ? (
        <InfiniteScroll
          loadMore={loadMore}
          hasMore={hasMore}
          isLoading={isLoading}
          className={bodyClassName}
          threshold={100}
          style={{ maxHeight }}
        >
          {children}
        </InfiniteScroll>
      ) : (
        <div className={bodyClassName}>
          {children}
        </div>
      )}
    </div>
  );

  return content;
}
