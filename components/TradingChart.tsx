
import React, { useMemo } from 'react';

interface ChartProps {
  color: string;
  dataCount?: number;
}

const TradingChart: React.FC<ChartProps> = ({ color, dataCount = 20 }) => {
  const candles = useMemo(() => {
    return Array.from({ length: dataCount }).map((_, i) => {
      const open = 40 + Math.random() * 20;
      const close = open + (Math.random() - 0.5) * 10;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      return { open, close, high, low, x: i * 20 };
    });
  }, [dataCount]);

  return (
    <div className="w-full h-full bg-slate-900/50 rounded-lg p-4 flex items-end">
      <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d">
        {candles.map((c, i) => {
          const isUp = c.close > c.open;
          const stroke = isUp ? '#22c55e' : '#ef4444';
          return (
            <g key={i}>
              <line x1={c.x + 8} y1={100 - c.high} x2={c.x + 8} y2={100 - c.low} stroke={stroke} strokeWidth="1" />
              <rect
                x={c.x + 4}
                y={100 - Math.max(c.open, c.close)}
                width="8"
                height={Math.abs(c.open - c.close) + 1}
                fill={isUp ? '#22c55e33' : '#ef444433'}
                stroke={stroke}
                strokeWidth="1"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default TradingChart;
