import React from 'react';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import SeasonBadge from '../../components/SeasonBadge';
import { fmtDate, fmtLKR, fmtUSD, bookingStatusBadge, roomTypeLabel, nicTypeLabel } from '../../utils/formatters';
import { Calendar, User, BedDouble, Phone, Mail, Car, Shield, Utensils, CheckCircle, LogIn, LogOut, XCircle } from 'lucide-react';

export default function BookingDetailsModal({ isOpen, onClose, booking, onAction }) {
  if (!booking) return null;

  const guest = booking.guestId || {};
  const room  = booking.roomId || {};
  const pricing = booking.pricingDetails || {};

  const footer = (
    <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
      <button className="btn btn-ghost" onClick={onClose}>Close</button>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {booking.status === 'pending' && (
          <button className="btn btn-secondary" onClick={() => onAction(booking._id, 'confirm')}>
            <CheckCircle size={15} /> Confirm
          </button>
        )}
        {booking.status === 'confirmed' && (
          <button className="btn btn-success" onClick={() => onAction(booking._id, 'check-in')}>
            <LogIn size={15} /> Check In
          </button>
        )}
        {booking.status === 'checked-in' && (
          <button className="btn btn-danger" onClick={() => onAction(booking._id, 'check-out')}>
            <LogOut size={15} /> Check Out & Bill
          </button>
        )}
        {(booking.status === 'pending' || booking.status === 'confirmed') && (
          <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => onAction(booking._id, 'cancel')}>
            <XCircle size={15} /> Cancel
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reservation #${booking.bookingReference || booking._id?.slice(-6)}`}
      size="lg"
      footer={footer}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Status header banner */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-elevated)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</span>
            <div style={{ marginTop: 2 }}>
              <Badge variant={bookingStatusBadge(booking.status)} dot>
                {booking.status.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Channel</span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {booking.source || 'Direct'}
            </div>
          </div>
        </div>

        {/* Guest & Room Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Guest Profile Card */}
          <div className="card" style={{ padding: '1rem', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <User size={16} className="text-gold" />
              <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Guest Information</h4>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {guest.firstName} {guest.lastName} {guest.vipLevel && guest.vipLevel !== 'none' && `(⭐ VIP ${guest.vipLevel.toUpperCase()})`}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><Phone size={12} style={{ display: 'inline', marginRight: 4 }} /> {guest.phone || '—'}</div>
              <div><Mail size={12} style={{ display: 'inline', marginRight: 4 }} /> {guest.email || '—'}</div>
              <div><Shield size={12} style={{ display: 'inline', marginRight: 4 }} /> {guest.nicNumber} ({nicTypeLabel(guest.nicType)})</div>
            </div>
          </div>

          {/* Room Card */}
          <div className="card" style={{ padding: '1rem', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <BedDouble size={16} className="text-gold" />
              <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Room Details</h4>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Room #{room.number} · {room.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div>Type: <strong>{roomTypeLabel(room.type)}</strong></div>
              <div>Floor: Floor {room.floor} · View: {room.view || 'Standard'}</div>
              <div>Base Price: <strong>{fmtLKR(booking.basePricePerNight || room.basePrice)}</strong>/night</div>
            </div>
          </div>
        </div>

        {/* Dates & Stay Information */}
        <div
          style={{
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Check-In</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: 2 }}>{fmtDate(booking.checkIn)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Check-Out</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: 2 }}>{fmtDate(booking.checkOut)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Duration</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: 2 }}>{booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Occupancy</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: 2 }}>{booking.adults} Adults {booking.children > 0 ? `, ${booking.children} Kids` : ''}</div>
          </div>
        </div>

        {/* Sri Lankan Preferences & Driver Tracking */}
        {(guest.driver?.name || guest.spiceTolerance || booking.specialNotes) && (
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              background: 'rgba(201, 168, 76, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Utensils size={15} className="text-gold" />
              <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--gold)' }}>
                Sri Lankan Hospitality & Driver Care
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {guest.driver?.name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Car size={13} className="text-secondary" />
                  <span><strong>Driver:</strong> {guest.driver.name} ({guest.driver.vehiclePlateNumber || 'No Plate'}) · Tel: {guest.driver.contactNumber}</span>
                  {guest.driver.requiresAccommodation && <Badge variant="warning">Driver Lodging Required</Badge>}
                  {guest.driver.requiresMealPlan && <Badge variant="info">Driver Meals Required</Badge>}
                </div>
              )}
              {guest.spiceTolerance && (
                <div>
                  🌶️ <strong>Spice Level:</strong> <span style={{ textTransform: 'capitalize' }}>{guest.spiceTolerance}</span> · <strong>Breakfast:</strong> <span style={{ textTransform: 'capitalize' }}>{guest.breakfastPreference || 'Continental'}</span>
                </div>
              )}
              {booking.specialNotes && (
                <div>
                  📝 <strong>Notes:</strong> {booking.specialNotes}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pricing Breakdown */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Financial Total</span>
            <SeasonBadge seasonName={booking.seasonName || pricing.seasonName} multiplier={booking.seasonMultiplier || pricing.multiplier} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Room Subtotal ({booking.nights} nights @ {fmtLKR(booking.pricePerNight || booking.basePricePerNight)}/nt)</span>
            <span>{fmtLKR(booking.roomSubtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: 'var(--gold)', marginTop: '0.5rem' }}>
            <span>Total Value</span>
            <span>{fmtLKR(booking.finalPrice || booking.roomSubtotal * 1.305)}</span>
          </div>
        </div>

      </div>
    </Modal>
  );
}
