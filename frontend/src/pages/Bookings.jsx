import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useHotel } from '../context/HotelContext';
import { BOOKING_STATUSES } from '../constants/sriLanka';
import { formatCurrency, formatDateSL } from '../utils/hotelUtils';
import {
  Plus, Search, Calendar, User, BedDouble, CheckCircle2,
  XCircle, LogIn, LogOut, Receipt, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Bookings() {
  const { openBookingModal } = useOutletContext();
  const { bookings, updateBookingStatus, currency, usdRate } = useHotel();

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (
      searchQuery &&
      !b.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !b.roomNumber.includes(searchQuery)
    )
      return false;
    return true;
  });

  const convertPrice = (lkrAmount) => {
    if (currency === 'USD') return formatCurrency(lkrAmount / usdRate, 'USD');
    return formatCurrency(lkrAmount, 'LKR');
  };

  const handleStatusChange = (bookingId, newStatus) => {
    updateBookingStatus(bookingId, newStatus);
    toast.success(`Booking ${bookingId} marked as ${newStatus}!`);
  };

  return (
    <div className="fade-in-up flex-col gap-24">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-12 mb-8">
        <div>
          <h1 className="page-title">Reservations & Bookings</h1>
          <p className="page-desc">Manage guest bookings, check-in status, and dining preferences</p>
        </div>
        <button className="btn btn-primary" onClick={openBookingModal}>
          <Plus size={16} />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-sm flex items-center justify-between flex-wrap gap-16" style={{ background: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-12 flex-wrap">
          <div className="input-group" style={{ width: '260px' }}>
            <Search className="input-addon" size={16} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by ID, Guest, or Room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="tabs" style={{ padding: '2px' }}>
            <button
              type="button"
              className={`tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            {BOOKING_STATUSES.map((st) => (
              <button
                key={st.value}
                type="button"
                className={`tab-btn ${statusFilter === st.value ? 'active' : ''}`}
                onClick={() => setStatusFilter(st.value)}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-secondary">
          Showing <b>{filteredBookings.length}</b> Reservations
        </div>
      </div>

      {/* Bookings Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID & Date</th>
              <th>Guest Details</th>
              <th>Room</th>
              <th>Stay Duration</th>
              <th>Hospitality Preferences</th>
              <th>Grand Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="empty-state">
                    <span className="empty-state-icon">📋</span>
                    <h3>No bookings found</h3>
                    <p>Try clearing your search query or create a new reservation.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="font-bold text-brand">{b.id}</div>
                    <div className="text-xs text-muted">{b.createdAt}</div>
                  </td>
                  <td>
                    <div className="font-semibold">{b.guestName}</div>
                    <div className="text-xs text-secondary">{b.guestPhone}</div>
                  </td>
                  <td>
                    <div className="font-semibold">Room {b.roomNumber}</div>
                    <div className="text-xs text-secondary">{b.roomName}</div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {formatDateSL(b.checkIn)} → {formatDateSL(b.checkOut)}
                    </div>
                    <div className="text-xs text-brand font-medium">
                      {b.nights} Night{b.nights > 1 ? 's' : ''} ({b.guestsCount} Guests)
                      {b.multiplier > 1 && ` • ${b.multiplier}x Peak`}
                    </div>
                  </td>
                  <td>
                    <div className="text-xs flex-col gap-2">
                      <div>🍛 {b.breakfastPreference === 'traditional-sl' ? 'Sri Lankan (Kiribath/Hoppers)' : b.breakfastPreference}</div>
                      <div>🌶️ {b.spicePreference}</div>
                    </div>
                  </td>
                  <td>
                    <div className="font-bold text-brand">{convertPrice(b.grandTotal)}</div>
                    <div className="text-xs text-secondary">Inc. 18% VAT, 2.5% SSCL</div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        b.paymentStatus === 'paid'
                          ? 'badge-confirmed'
                          : b.paymentStatus === 'partial'
                          ? 'badge-pending'
                          : 'badge-cancelled'
                      }`}
                    >
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${b.status}`}>{b.status}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-4">
                      {b.status === 'confirmed' && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Check In"
                          onClick={() => handleStatusChange(b.id, 'checked-in')}
                        >
                          <LogIn size={13} />
                          <span>Check In</span>
                        </button>
                      )}
                      {b.status === 'checked-in' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Check Out"
                          onClick={() => handleStatusChange(b.id, 'checked-out')}
                        >
                          <LogOut size={13} />
                          <span>Check Out</span>
                        </button>
                      )}
                      {b.status !== 'cancelled' && b.status !== 'checked-out' && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 6px', color: '#f87171' }}
                          title="Cancel Reservation"
                          onClick={() => handleStatusChange(b.id, 'cancelled')}
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                      <Link
                        to="/billing"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px 6px' }}
                        title="View Billing"
                      >
                        <Receipt size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
