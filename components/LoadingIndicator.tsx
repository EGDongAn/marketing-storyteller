
import React from 'react';

interface LoadingIndicatorProps {
  message: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message, size = 'lg' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div
        className={`animate-spin rounded-full border-slate-400 border-t-purple-500 ${sizeClasses[size]}`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {message && <p className="text-slate-400 text-lg font-medium animate-pulse">{message}</p>}
    </div>
  );
};

export default LoadingIndicator;
