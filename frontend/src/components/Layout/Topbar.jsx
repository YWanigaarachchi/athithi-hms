import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PAGE_META = {
  '/':         { title: 'Dashboard',  sub: 'Overview & today\'s summary' },
  '/rooms':    { title: 'Rooms',      sub: 'Manage room inventory' },
  '/bookings': { title: 'Bookings',   sub: 'Reservations & check-in/out' },
  '/guests':   { title: 'Guests',     sub: 'Guest profiles & preferences' },
  '/billing':  { title: 'Billing',    sub: 'Invoices & tax management' },
};

export default function Topbar() {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] || { title: 'Athithi HMS', sub: '' };

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = time.toLocaleTimeString('en-LK', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
  const dateStr = time.toLocaleDateString('en-LK', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2>{meta.title}</h2>
        {meta.sub && <p>{meta.sub}</p>}
      </div>
      <div className="topbar-right">
        <div className="topbar-time">{dateStr} — {timeStr}</div>
        <div className="topbar-badge">🇱🇰 Sri Lanka</div>
      </div>
    </header>
  );
}
