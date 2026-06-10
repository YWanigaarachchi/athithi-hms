import React, { useState, useEffect } from 'react';
import {
  BedDouble, Users, CalendarDays, DollarSign,
  TrendingUp, CheckSquare, LogIn, LogOut,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { getDashboardStats } from '../../api/authApi';
import { getTodayBookings }  from '../../api/bookingsApi';
import StatCard from '../../components/ui/StatCard';
import { LoadingState } from '../../components/ui/Spinner';
import { fmtLKR, fmtDate, getInitials, bookingStatusBadge } from '../../utils/formatters';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

// Static weekly occupancy demo data
const weekData = [
  { day: 'Mon', rate: 72 }, { day: 'Tue', rate: 65 },
  { day: 'Wed', rate: 80 }, { day: 'Thu', rate: 78 },
  { day: 'Fri', rate: 91 }, { day: 'Sat', rate: 95 },
  { day: 'Sun', rate: 88 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)', padding: '8px 12px',
        fontSize: '0.8rem', color: 'var(--text-primary)',
      }}>
        <strong>{label}</strong>: {payload[0].value}% occupancy
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats]   = useState(null);
  const [today, setToday]   = useState({ checkIns: [], checkOuts: [] });
  const [tab, setTab]       = useState('checkIns');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getTodayBookings()])
      .then(([s, t]) => {
        setStats(s.data.data);
        setToday(t.data.data);
      })
      .catch(() => toast.error('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;

  const d = stats || {};

  return (
    <div>
      {/* ── Stat Cards ── */}
      <div className="stat-grid">
        <StatCard
          label="Total Rooms"
          value={d.rooms?.total ?? '—'}
          sub={`${d.rooms?.available ?? 0} available`}
          icon={BedDouble}
          accentColor="var(--gold)"
        />
        <StatCard
          label="Occupied"
          value={d.rooms?.occupied ?? '—'}
          sub={`${d.occupancyRate ?? 0}% occupancy rate`}
          icon={TrendingUp}
          accentColor="var(--danger)"
          iconBg="var(--danger-bg)"
          iconColor="var(--danger)"
        />
        <StatCard
          label="Total Guests"
          value={d.guests?.total ?? '—'}
          sub="All registered guests"
          icon={Users}
          accentColor="var(--info)"
          iconBg="var(--info-bg)"
          iconColor="var(--info)"
        />
        <StatCard
          label="Active Bookings"
          value={d.bookings?.active ?? '—'}
          sub={`${d.bookings?.checkInsToday ?? 0} check-ins today`}
          icon={CalendarDays}
          accentColor="var(--success)"
          iconBg="var(--success-bg)"
          iconColor="var(--success)"
        />
        <StatCard
          label="Today's Revenue"
          value={fmtLKR(d.revenue?.today)}
          sub="Paid bills today"
          icon={DollarSign}
          accentColor="var(--gold)"
        />
        <StatCard
          label="Check-outs Today"
          value={d.bookings?.checkOutsToday ?? '—'}
          sub={`${d.bookings?.total ?? 0} total bookings`}
          icon={CheckSquare}
          accentColor="var(--warning)"
          iconBg="var(--warning-bg)"
          iconColor="var(--warning)"
        />
      </div>

      {/* ── Occupancy Bar + Today activity ── */}
      <div className="dashboard-grid">
        {/* Occupancy Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Weekly Occupancy</div>
              <div className="card-subtitle">Occupancy rate % by day</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold)' }}>
                {d.occupancyRate ?? 0}%
              </div>
              <div className="card-subtitle">Current rate</div>
            </div>
          </div>

          {/* Occupancy Bar */}
          <div className="occupancy-bar" style={{ marginBottom: '1.5rem' }}>
            <div
              className="occupancy-fill"
              style={{ width: `${d.occupancyRate ?? 0}%` }}
            />
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false} tickLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {weekData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.rate >= 85
                      ? 'var(--gold)'
                      : entry.rate >= 70
                        ? '#8C6E2A'
                        : 'var(--bg-elevated)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Activity */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Today's Activity</div>
          </div>

          <div className="today-tabs" style={{ marginBottom: '1rem' }}>
            <button
              className={`today-tab${tab === 'checkIns' ? ' active' : ''}`}
              onClick={() => setTab('checkIns')}
            >
              <LogIn size={12} style={{ display: 'inline', marginRight: 4 }} />
              Arrivals ({today.checkIns?.length ?? 0})
            </button>
            <button
              className={`today-tab${tab === 'checkOuts' ? ' active' : ''}`}
              onClick={() => setTab('checkOuts')}
            >
              <LogOut size={12} style={{ display: 'inline', marginRight: 4 }} />
              Departures ({today.checkOuts?.length ?? 0})
            </button>
          </div>

          {(today[tab] || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
              No {tab === 'checkIns' ? 'arrivals' : 'departures'} today.
            </p>
          ) : (
            <div>
              {(today[tab] || []).map((b) => (
                <div className="activity-item" key={b._id}>
                  <div className="activity-avatar">
                    {getInitials(b.guestId?.firstName, b.guestId?.lastName)}
                  </div>
                  <div className="activity-info">
                    <div className="activity-name">
                      {b.guestId?.firstName} {b.guestId?.lastName}
                    </div>
                    <div className="activity-meta">
                      Room {b.roomId?.number} · {b.roomId?.name}
                    </div>
                  </div>
                  <Badge variant={bookingStatusBadge(b.status)} dot>
                    {b.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Room status summary */}
          <div className="form-section" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Available', value: d.rooms?.available ?? 0, color: 'var(--success)' },
                { label: 'Occupied',  value: d.rooms?.occupied  ?? 0, color: 'var(--danger)'  },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
