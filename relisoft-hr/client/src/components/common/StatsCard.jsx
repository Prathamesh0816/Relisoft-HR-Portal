import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, color = '#2563eb' }) => {
  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <div className="stat-card group">
      <div className="p-3 rounded-xl transition-transform group-hover:scale-110" style={{ background: `${color}14` }}>
        {Icon && <Icon size={24} style={{ color }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate" style={{ color: 'var(--muted)' }}>{title}</p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{value}</p>
          {trend !== undefined && trend !== null && (
            <span className={`flex items-center gap-0.5 text-xs font-medium ${
              isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : ''
            }`}>
              {isPositive ? <TrendingUp size={14} /> : isNegative ? <TrendingDown size={14} /> : null}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
