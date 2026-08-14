import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { getRooms } from '../../api/roomsApi';
import { getGuests } from '../../api/guestsApi';
import { createBooking } from '../../api/bookingsApi';
import { fmtLKR, calcNights, roomTypeLabel } from '../../utils/formatters';
import SeasonBadge from '../../components/SeasonBadge';
import { Calendar, User, BedDouble, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingFormModal({ isOpen, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms]     = useState([]);
  const [guests, setGuests]   = useState([]);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [form, setForm] = useState({
    guestId: '',
    roomId: '',
    checkIn: todayStr,
    checkOut: tomorrowStr,
    adults: 2,
    children: 0,
    source: 'phone',
    currency: 'LKR',
    specialNotes: '',
  });

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        getRooms({ isActive: true, limit: 50 }),
        getGuests({ limit: 50 }),
      ]).then(([rRes, gRes]) => {
        setRooms(rRes.data.data || []);
        setGuests(gRes.data.data || []);
        if (rRes.data.data?.length && !form.roomId) {
          setForm(f => ({ ...f, roomId: rRes.data.data[0]._id }));
        }
        if (gRes.data.data?.length && !form.guestId) {
          setForm(f => ({ ...f, guestId: gRes.data.data[0]._id }));
        }
      }).catch(() => {
        toast.error('Failed to load rooms or guests.');
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const selectedRoom = rooms.find(r => r._id === form.roomId);
  const selectedGuest = guests.find(g => g._id === form.guestId);
  const nights = calcNights(form.checkIn, form.checkOut);

  // Dynamic estimate
  const baseRate = selectedRoom?.basePrice || 0;
  const estimatedSubtotal = baseRate * nights;
  const serviceCharge = estimatedSubtotal * 0.10;
  const vat = (estimatedSubtotal + serviceCharge) * 0.18;
  const sscl = estimatedSubtotal * 0.025;
  const estimatedGrandTotal = estimatedSubtotal + serviceCharge + vat + sscl;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.guestId) {
      toast.error('Please select a guest.');
      return;
    }
    if (!form.roomId) {
      toast.error('Please select a room.');
      return;
    }
    if (new Date(form.checkOut) <= new Date(form.checkIn)) {
      toast.error('Check-out date must be after check-in date.');
      return;
    }

    setLoading(true);
    try {
      await createBooking(form);
      toast.success('Reservation successfully created! 🏨');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
        Cancel
      </button>
      <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !rooms.length || !guests.length}>
        {loading ? 'Creating Booking...' : 'Confirm & Reserve'}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Reservation"
      size="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="form-grid">
        {/* Guest Selector */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">
            <User size={14} style={{ display: 'inline', marginRight: 6 }} /> Select Guest Profile <span className="required">*</span>
          </label>
          <select
            name="guestId"
            className="form-select"
            value={form.guestId}
            onChange={handleChange}
            required
          >
            <option value="">-- Choose registered guest --</option>
            {guests.map((g) => (
              <option key={g._id} value={g._id}>
                {g.firstName} {g.lastName} ({g.nicNumber || g.phone} - {g.vipLevel !== 'none' ? `⭐ VIP ${g.vipLevel.toUpperCase()}` : g.nationality})
              </option>
            ))}
          </select>
          {selectedGuest && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              📞 {selectedGuest.phone} · 📧 {selectedGuest.email || 'No email'} · 🌶️ Spice: {selectedGuest.spiceTolerance || 'medium'}
              {selectedGuest.driver?.name && ` · 🚗 Driver: ${selectedGuest.driver.name} (${selectedGuest.driver.vehiclePlateNumber})`}
            </div>
          )}
        </div>

        {/* Room Selector */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">
            <BedDouble size={14} style={{ display: 'inline', marginRight: 6 }} /> Select Room <span className="required">*</span>
          </label>
          <select
            name="roomId"
            className="form-select"
            value={form.roomId}
            onChange={handleChange}
            required
          >
            <option value="">-- Choose Room --</option>
            {rooms.map((r) => (
              <option key={r._id} value={r._id}>
                Room #{r.number} - {r.name} ({roomTypeLabel(r.type)}) — {fmtLKR(r.basePrice)}/night [Max {r.capacity} pax]
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="form-group">
          <label className="form-label">
            <Calendar size={14} style={{ display: 'inline', marginRight: 6 }} /> Check-in Date <span className="required">*</span>
          </label>
          <input
            type="date"
            name="checkIn"
            className="form-input"
            value={form.checkIn}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <Calendar size={14} style={{ display: 'inline', marginRight: 6 }} /> Check-out Date <span className="required">*</span>
          </label>
          <input
            type="date"
            name="checkOut"
            className="form-input"
            value={form.checkOut}
            min={form.checkIn}
            onChange={handleChange}
            required
          />
        </div>

        {/* Guests Pax */}
        <div className="form-group">
          <label className="form-label">Adults</label>
          <input
            type="number"
            name="adults"
            min="1"
            max={selectedRoom?.capacity || 10}
            className="form-input"
            value={form.adults}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Children</label>
          <input
            type="number"
            name="children"
            min="0"
            className="form-input"
            value={form.children}
            onChange={handleChange}
          />
        </div>

        {/* Source & Currency */}
        <div className="form-group">
          <label className="form-label">Booking Channel / Source</label>
          <select name="source" className="form-select" value={form.source} onChange={handleChange}>
            <option value="phone">Phone Reservation</option>
            <option value="walk-in">Walk-in Guest</option>
            <option value="online">Online / Web</option>
            <option value="agent">Travel Agent / Tour Operator</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Billing Currency</label>
          <select name="currency" className="form-select" value={form.currency} onChange={handleChange}>
            <option value="LKR">LKR (Sri Lankan Rupee)</option>
            <option value="USD">USD (United States Dollar)</option>
          </select>
        </div>

        {/* Special Notes */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Special Requests / Sri Lankan Food Preferences</label>
          <textarea
            name="specialNotes"
            rows={2}
            className="form-textarea"
            placeholder="e.g. Extra spicy Pol Sambol, Driver accommodation needed, late check-in..."
            value={form.specialNotes}
            onChange={handleChange}
          />
        </div>

        {/* Dynamic Cost Breakdown Preview */}
        {selectedRoom && (
          <div
            style={{
              gridColumn: '1 / -1',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              marginTop: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Estimated Cost Preview</span>
              <span className="badge badge-info">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              <span>Base Rate ({fmtLKR(baseRate)} × {nights} nights)</span>
              <span>{fmtLKR(estimatedSubtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>Service Charge (10%) + VAT (18%) + SSCL (2.5%)</span>
              <span>+ {fmtLKR(serviceCharge + vat + sscl)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--gold)',
                borderTop: '1px dashed var(--border)',
                paddingTop: '0.5rem',
                marginTop: '0.5rem',
              }}
            >
              <span>Estimated Grand Total</span>
              <span>{fmtLKR(estimatedGrandTotal)}</span>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
