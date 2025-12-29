import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({ className = '', width, height, rounded = true }: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-700 animate-pulse
        ${rounded ? 'rounded' : ''}
        ${className}
      `}
      style={style}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card">
      <Skeleton height={24} width="60%" className="mb-4" />
      <Skeleton height={16} width="100%" className="mb-2" />
      <Skeleton height={16} width="80%" className="mb-4" />
      <Skeleton height={40} width="100%" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="card">
      <Skeleton height={24} width="40%" className="mb-6" />
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-end gap-2 h-32">
            <Skeleton height={`${20 + Math.random() * 80}%`} className="flex-1" />
            <Skeleton height={`${20 + Math.random() * 80}%`} className="flex-1" />
            <Skeleton height={`${20 + Math.random() * 80}%`} className="flex-1" />
            <Skeleton height={`${20 + Math.random() * 80}%`} className="flex-1" />
            <Skeleton height={`${20 + Math.random() * 80}%`} className="flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card">
      <Skeleton height={32} width="30%" className="mb-4" />
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton height={40} width={40} rounded />
            <Skeleton height={16} width="30%" />
            <Skeleton height={16} width="20%" />
            <Skeleton height={16} width="15%" className="ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BalanceSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton height={48} width={48} rounded />
      <div className="flex-1">
        <Skeleton height={20} width="40%" className="mb-2" />
        <Skeleton height={16} width="60%" />
      </div>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="card">
      <Skeleton height={16} width="50%" className="mb-2" />
      <Skeleton height={32} width="70%" className="mb-4" />
      <Skeleton height={12} width="40%" />
    </div>
  );
}

