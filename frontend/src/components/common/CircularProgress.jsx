import React from 'react';

export const CircularProgress = ({
  size = 100,
  stroke = 10,
  progress: progressProp,
  value,
  color = 'green',
}) => {
  const progress = value ?? progressProp ?? 0;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (progress / 100) * circ;

  const strokeColor = color === 'green' ? '#16a34a' : color === 'yellow' ? '#d97706' : '#dc2626';

  return (
    <svg width={size} height={size} className="block">
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={radius} cx="0" cy="0" fill="transparent" stroke="#e6e6e6" strokeWidth={stroke} />
        <circle
          r={radius}
          cx="0"
          cy="0"
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90)"
        />
        <text x="0" y="6" textAnchor="middle" fontSize="18" fontWeight="700" fill="#111">
          {Math.round(progress)}%
        </text>
      </g>
    </svg>
  );
};

export default CircularProgress;
