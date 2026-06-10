import React from 'react';

export default function Spinner({ size = '' }) {
  return <span className={`spinner${size ? ` spinner-${size}` : ''}`} />;
}

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="loading-state">
      <Spinner />
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={24} />
        </div>
      )}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
}
