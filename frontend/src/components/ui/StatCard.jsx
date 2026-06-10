import React from 'react';

export default function StatCard({
  label, value, sub, icon: Icon,
  accentColor = 'var(--gold)',
  iconBg = 'var(--gold-muted)',
  iconColor = 'var(--gold)',
  change, changeDir,
}) {
  return (
    <div
      className="stat-card"
      style={{
        '--accent-color': accentColor,
        '--icon-bg':      iconBg,
        '--icon-color':   iconColor,
      }}
    >
      {Icon && (
        <div className="stat-card-icon">
          <Icon size={20} />
        </div>
      )}
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
      {change !== undefined && (
        <div className={`stat-card-change ${changeDir || ''}`}>
          {change}
        </div>
      )}
    </div>
  );
}
