import React, { useState, useEffect, useCallback } from 'react';
import { Plus, CalendarDays, Search, CheckCircle, Clock, Eye } from 'lucide-react';
import { getBookings, checkIn, checkOut, confirmBooking, cancelBooking } from '../../api/bookingsApi';
import { fmtDate, fmtLKR, bookingStatusBadge } from '../../utils/formatters';
import Badge from '../../components/ui/Badge';
import { LoadingState, EmptyState } from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import SeasonBadge from '../../components/SeasonBadge';
import BookingFormModal from './BookingFormModal';
import BookingDetailsModal from './BookingDetailsModal';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'];

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBookings({ page, limit: 10, status, search });
      setBookings(res.data.data || []);
      setTotal(res.data.pagination?.total || res.data.total || 0);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleAction = async (id, actionStr, apiFn) => {
    if (!window.confirm(`Are you sure you want to ${actionStr} this booking?`)) return;
    try {
      if (apiFn) {
        await apiFn(id);
      } else if (actionStr === 'confirm') {
        await confirmBooking(id);
      } else if (actionStr === 'check-in') {
        await checkIn(id);
      } else if (actionStr === 'check-out') {
        await checkOut(id);
      } else if (actionStr === 'cancel') {
        await cancelBooking(id, { reason: 'Staff cancelled via console' });
      }
      toast.success(`Booking successfully updated.`);
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${actionStr}`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Reservations & Bookings</h1>
          <p>Manage guest reservations, check-ins, and check-outs</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
            <Plus size={16} /> New Booking
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-filters">
            <div className="search-input-wrapper">
              <Search size={14} />
              <input
                className="form-input search-input"
                placeholder="Search by name, ref or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="form-select"
              style={{ width: '150px' }}
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace('-', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="text-muted text-sm">{total} total records</div>
        </div>

        {loading ? (
          <LoadingState message="Loading reservations..." />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No bookings found"
            description="Try adjusting your filters or search term."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Dates</th>
                  <th>Total / Season</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div className="font-semibold text-gold">{b.bookingReference}</div>
                      <div className="text-xs text-muted">via {b.source}</div>
                    </td>
                    <td>
                      <div className="font-semibold">{b.guestId?.firstName} {b.guestId?.lastName}</div>
                      <div className="text-xs text-muted">{b.guestId?.email}</div>
                    </td>
                    <td>
                      <div>Room {b.roomId?.number}</div>
                      <Badge variant="neutral">{b.roomId?.name}</Badge>
                    </td>
                    <td>
                      <div className="text-sm">
                        <CheckCircle size={12} className="text-success" style={{ display: 'inline', marginRight: 4 }} />
                        {fmtDate(b.checkIn)}
                      </div>
                      <div className="text-sm" style={{ marginTop: 2 }}>
                        <Clock size={12} className="text-danger" style={{ display: 'inline', marginRight: 4 }} />
                        {fmtDate(b.checkOut)}
                      </div>
                    </td>
                    <td>
                      <div className="font-bold">{fmtLKR(b.totalPrice)}</div>
                      <div style={{ marginTop: '0.25rem' }}>
                        <SeasonBadge seasonName={b.pricingDetails?.seasonName} multiplier={b.pricingDetails?.multiplier} />
                      </div>
                    </td>
                    <td>
                      <Badge variant={bookingStatusBadge(b.status)} dot>{b.status}</Badge>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {b.status === 'pending' && (
                          <button className="btn btn-sm btn-secondary" onClick={() => handleAction(b._id, 'confirm', confirmBooking)}>Confirm</button>
                        )}
                        {b.status === 'confirmed' && (
                          <button className="btn btn-sm btn-success" onClick={() => handleAction(b._id, 'check in', checkIn)}>Check In</button>
                        )}
                        {b.status === 'checked-in' && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleAction(b._id, 'check out', checkOut)}>Check Out</button>
                        )}
                        <button className="btn btn-sm btn-ghost" onClick={() => setSelectedBooking(b)}>
                          <Eye size={13} style={{ display: 'inline', marginRight: 4 }} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <Pagination
          page={page}
          limit={10}
          total={total}
          pages={Math.ceil(total / 10)}
          onPage={setPage}
        />
      </div>

      {/* New Booking Form Modal */}
      <BookingFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={fetchBookings}
      />

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={!!selectedBooking}
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onAction={handleAction}
      />
    </div>
  );
}
