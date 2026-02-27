import React, { memo } from 'react';

const LoadingSpinner = memo(function LoadingSpinner({ size = 40 }) {
  return (
    <div className="flex items-center justify-center p-4">
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        className="animate-spin"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="90, 150"
          strokeDashoffset="0"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
});

export default LoadingSpinner;
