import React from 'react';

interface StatusIndicatorProps {
  status: 'active' | 'partial' | 'inactive';
  label?: string;
  pulse?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  pulse = false
}) => {
  const colors = {
    active: 'bg-green-profit',
    partial: 'bg-orange-warning',
    inactive: 'bg-red-loss',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          w-3 h-3 rounded-full
          ${colors[status]}
          ${pulse && status === 'active' ? 'animate-pulse-soft' : ''}
        `}
      />
      {label && (
        <span className="text-sm text-text-secondary">{label}</span>
      )}
    </div>
  );
};
