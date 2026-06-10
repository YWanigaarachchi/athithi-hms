import React from 'react';
import { Flame, TrendingDown } from 'lucide-react';

/**
 * Visual badge for Sri Lankan seasonal pricing.
 */
export default function SeasonBadge({ seasonName, multiplier }) {
  if (!seasonName || seasonName === 'Off-Peak') {
    return (
      <span className="season-badge off-peak">
        <TrendingDown size={11} />
        Off-Peak
      </span>
    );
  }

  const isPeak = multiplier >= 1.5;

  return (
    <span className={`season-badge ${isPeak ? 'peak' : 'moderate'}`}>
      <Flame size={11} />
      {seasonName} ×{multiplier}
    </span>
  );
}
