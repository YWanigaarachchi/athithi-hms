import React from 'react';
import { useHotel } from '../../context/HotelContext';
import { getSeasonForDate } from '../../utils/hotelUtils';
import { Calendar, DollarSign, Bell, Plus, Sparkles, RefreshCw } from 'lucide-react';

export default function Topbar({ onNewBookingClick }) {
  const { currency, setCurrency, usdRate, resetDemoData } = useHotel();
  const today = new Date();
  const currentSeason = getSeasonForDate(today);

  const formattedDate = today.toLocaleDateString('en-LK', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="topbar">
      <div className="flex items-center gap-16 flex-wrap">
        <div className="flex items-center gap-8 text-secondary text-sm">
          <Calendar size={16} className="text-brand" />
          <span>{formattedDate}</span>
        </div>

        {/* Season Indicator Pill */}
        {currentSeason ? (
          <div className="season-pill season-peak">
            <span>{currentSeason.emoji}</span>
            <span>{currentSeason.name} ({currentSeason.multiplier}x)</span>
          </div>
        ) : (
          <div className="season-pill season-offpeak">
            <span>🌿 Regular Season (1.0x)</span>
          </div>
        )}
      </div>

      <div className="topbar-actions">
        {/* Reset / Reload Demo Data Button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '12px', padding: '5px 10px', gap: '6px' }}
          onClick={resetDemoData}
          title="Reset and populate rich Sri Lankan resort demo data"
        >
          <Sparkles size={14} className="text-brand" />
          <span>Demo Data</span>
        </button>

        {/* Currency Switcher */}
        <div className="tabs" style={{ padding: '2px' }}>
          <button
            type="button"
            className={`tab-btn ${currency === 'LKR' ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: '12px' }}
            onClick={() => setCurrency('LKR')}
          >
            🇱🇰 LKR
          </button>
          <button
            type="button"
            className={`tab-btn ${currency === 'USD' ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: '12px' }}
            onClick={() => setCurrency('USD')}
            title={`1 USD = LKR ${usdRate}`}
          >
            💵 USD
          </button>
        </div>

        {/* Quick New Booking Button */}
        {onNewBookingClick && (
          <button className="btn btn-primary btn-sm" onClick={onNewBookingClick}>
            <Plus size={16} />
            <span>New Booking</span>
          </button>
        )}

        <div className="stat-icon orange" style={{ width: '36px', height: '36px', fontSize: '16px' }} title="Athithi Staff Admin">
          👑
        </div>
      </div>
    </header>
  );
}
