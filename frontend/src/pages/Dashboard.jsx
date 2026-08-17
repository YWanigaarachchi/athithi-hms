import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useHotel } from '../context/HotelContext';
import { getSeasonForDate, formatCurrency, formatDateSL } from '../utils/hotelUtils';
import {
  BedDouble, Users, CalendarCheck, TrendingUp, ArrowUpRight,
  CheckCircle2, Clock, Plus, Sparkles, LogIn, LogOut, Coffee
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { openBookingModal } = useOutletContext();
  const { rooms, bookings, currency, usdRate, updateBookingStatus } = useHotel();

  // Computations
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const availableRooms = rooms.filter((r) => r.status === 'available').length;
  const reservedRooms = rooms.filter((r) => r.status === 'reserved').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const activeSeason = getSeasonForDate(new Date());

  const todayCheckIns = bookings.filter((b) => b.checkIn === todayStr && b.status === 'confirmed');
  const todayCheckOuts = bookings.filter((b) => b.checkOut === todayStr && b.status === 'checked-in');

  const totalRevenue = bookings.reduce((sum, b) => (b.status !== 'cancelled' ? sum + b.grandTotal : sum), 0);

  const convertPrice = (lkrAmount) => {
    if (currency === 'USD') return formatCurrency(lkrAmount / usdRate, 'USD');
    return formatCurrency(lkrAmount, 'LKR');
  };

  const handleQuickCheckIn = (bookingId) => {
    updateBookingStatus(bookingId, 'checked-in');
    toast.success('Guest successfully checked in!');
  };

  const handleQuickCheckOut = (bookingId) => {
    updateBookingStatus(bookingId, 'checked-out');
    toast.success('Guest successfully checked out!');
  };

  return (
    <div className="fade-in-up flex-col gap-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-desc">Athithi Hotel Management System • Sri Lankan Hospitality Suite</p>
        </div>
        <div className="flex items-center gap-12">
          <button className="btn btn-primary" onClick={openBookingModal}>
            <Plus size={16} />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Sri Lankan Seasonal Pricing Banner */}
      {activeSeason && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,88,12,0.05))',
            borderColor: 'var(--brand-500)',
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-12">
            <div className="flex items-center gap-16">
              <span style={{ fontSize: '36px' }}>{activeSeason.emoji}</span>
              <div>
                <div className="flex items-center gap-8">
                  <h3 className="font-bold text-brand" style={{ fontSize: '16px' }}>
                    Active Period: {activeSeason.name}
                  </h3>
                  <span className="badge badge-pending">
                    {activeSeason.multiplier}x Multiplier
                  </span>
                </div>
                <p className="text-sm text-secondary mt-4">
                  {activeSeason.description} — Dynamic seasonal rates automatically applied to all new bookings.
                </p>
              </div>
            </div>
            <Link to="/settings" className="btn btn-secondary btn-sm">
              Manage Season Rules <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-icon orange">
            <BedDouble size={24} className="text-brand" />
          </div>
          <div>
            <div className="stat-value">{occupancyRate}%</div>
            <div className="stat-label">Occupancy Rate ({occupiedRooms}/{totalRooms} Rooms)</div>
            <div className="progress-bar-bg mt-8" style={{ width: '120px' }}>
              <div className="progress-bar orange" style={{ width: `${occupancyRate}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <LogIn size={24} className="text-success" />
          </div>
          <div>
            <div className="stat-value">{todayCheckIns.length}</div>
            <div className="stat-label">Expected Check-Ins Today</div>
            <div className="stat-change up">
              <Clock size={12} /> Today: {formatDateSL(todayStr)}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">
            <LogOut size={24} className="text-warning" />
          </div>
          <div>
            <div className="stat-value">{todayCheckOuts.length}</div>
            <div className="stat-label">Scheduled Check-Outs Today</div>
            <div className="stat-change down">
              <Clock size={12} /> Ready for Housekeeping
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <TrendingUp size={24} style={{ color: '#c084fc' }} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '20px' }}>
              {convertPrice(totalRevenue)}
            </div>
            <div className="stat-label">Total Booking Revenue</div>
            <div className="stat-change up">
              <ArrowUpRight size={12} /> Includes VAT & Service Charge
            </div>
          </div>
        </div>
      </div>

      {/* Live Room Status Matrix */}
      <div className="card">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-8">
            <span style={{ fontSize: '20px' }}>🛏️</span>
            <h2 className="section-title" style={{ margin: 0 }}>Live Room Status & Capacity</h2>
          </div>
          <div className="flex items-center gap-12 text-xs text-secondary flex-wrap">
            <span className="badge badge-available">Available ({availableRooms})</span>
            <span className="badge badge-occupied">Occupied ({occupiedRooms})</span>
            <span className="badge badge-reserved">Reserved ({reservedRooms})</span>
            <span className="badge badge-maintenance">Maintenance ({maintenanceRooms})</span>
          </div>
        </div>

        <div className="grid-4">
          {rooms.map((room) => {
            const badgeClass =
              room.status === 'available'
                ? 'badge-available'
                : room.status === 'occupied'
                ? 'badge-occupied'
                : room.status === 'reserved'
                ? 'badge-reserved'
                : 'badge-maintenance';

            return (
              <div
                key={room.id}
                className="card-sm"
                style={{
                  background: 'var(--bg-surface)',
                  borderLeft: `4px solid ${
                    room.status === 'available'
                      ? '#22c55e'
                      : room.status === 'occupied'
                      ? '#ef4444'
                      : room.status === 'reserved'
                      ? '#3b82f6'
                      : '#f59e0b'
                  }`,
                }}
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="font-bold text-lg">Room {room.number}</span>
                  <span className={`badge ${badgeClass}`}>{room.status}</span>
                </div>
                <div className="text-sm font-semibold text-primary">{room.name}</div>
                <div className="text-xs text-brand mt-4">
                  {convertPrice(room.basePrice)} <span className="text-secondary">/ night</span>
                </div>
                {room.currentGuest && (
                  <div className="text-xs text-secondary mt-8 flex items-center gap-4">
                    <Users size={12} /> {room.currentGuest}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Bookings & Arrivals */}
      <div className="card">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-8">
            <span style={{ fontSize: '20px' }}>📋</span>
            <h2 className="section-title" style={{ margin: 0 }}>Recent Reservations & Guest Log</h2>
          </div>
          <Link to="/bookings" className="btn btn-ghost btn-sm">
            View All Bookings <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Dates</th>
                <th>Preferences</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((b) => (
                <tr key={b.id}>
                  <td className="font-semibold text-brand">{b.id}</td>
                  <td>
                    <div>
                      <div className="font-semibold">{b.guestName}</div>
                      <div className="text-xs text-secondary">{b.guestPhone}</div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-reserved">Room {b.roomNumber}</span>
                  </td>
                  <td className="text-sm">
                    {formatDateSL(b.checkIn)} → {formatDateSL(b.checkOut)} ({b.nights}N)
                  </td>
                  <td className="text-xs">
                    <div className="flex items-center gap-4">
                      <span>🍛 {b.breakfastPreference === 'traditional-sl' ? 'Kiribath/Hoppers' : b.breakfastPreference}</span>
                      <span>• 🌶️ {b.spicePreference}</span>
                    </div>
                  </td>
                  <td className="font-semibold text-brand">{convertPrice(b.grandTotal)}</td>
                  <td>
                    <span className={`badge badge-${b.status}`}>{b.status}</span>
                  </td>
                  <td>
                    {b.status === 'confirmed' && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                        onClick={() => handleQuickCheckIn(b.id)}
                      >
                        Check In
                      </button>
                    )}
                    {b.status === 'checked-in' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                        onClick={() => handleQuickCheckOut(b.id)}
                      >
                        Check Out
                      </button>
                    )}
                    {b.status === 'checked-out' && (
                      <span className="text-xs text-muted">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
