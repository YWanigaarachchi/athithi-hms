import React from 'react';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { fmtDate, nicTypeLabel } from '../../utils/formatters';
import { User, Phone, Mail, MapPin, Car, Utensils, Shield, Edit3, Heart } from 'lucide-react';

export default function GuestDetailsModal({ isOpen, onClose, guest, onEdit }) {
  if (!guest) return null;

  const footer = (
    <>
      <button className="btn btn-ghost" onClick={onClose}>Close</button>
      <button
        className="btn btn-primary"
        onClick={() => {
          onClose();
          onEdit(guest);
        }}
      >
        <Edit3 size={14} /> Edit Profile
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${guest.firstName} ${guest.lastName}`}
      size="md"
      footer={footer}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Header summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
          <div className="activity-avatar" style={{ width: 56, height: 56, fontSize: '1.3rem' }}>
            {guest.firstName?.[0]}{guest.lastName?.[0]}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{guest.firstName} {guest.lastName}</h3>
              {guest.vipLevel && guest.vipLevel !== 'none' && (
                <Badge variant="gold" dot>{guest.vipLevel.toUpperCase()} VIP</Badge>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Registered on {fmtDate(guest.createdAt)} · {guest.nationality || 'Sri Lankan'}
            </div>
          </div>
        </div>

        {/* Contact & Identity details */}
        <div className="card" style={{ padding: '1rem', background: 'var(--bg-card)' }}>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Contact & Identification</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={14} className="text-gold" />
              <span><strong>Phone:</strong> {guest.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={14} className="text-gold" />
              <span><strong>Email:</strong> {guest.email || '—'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={14} className="text-gold" />
              <span><strong>Document:</strong> {guest.nicNumber} ({nicTypeLabel(guest.nicType)})</span>
            </div>
            {guest.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} className="text-gold" />
                <span><strong>Address:</strong> {guest.address}, {guest.country}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sri Lankan Food & Spice */}
        <div className="card" style={{ padding: '1rem', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Utensils size={15} className="text-gold" />
            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Dining & Spice Profile</h4>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Spice Tolerance</span>
              <div style={{ fontWeight: 600, textTransform: 'capitalize', color: 'var(--gold)' }}>
                🌶️ {guest.spiceTolerance || 'Medium'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Breakfast Plan</span>
              <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                🍳 {guest.breakfastPreference || 'Continental'}
              </div>
            </div>
          </div>
          {guest.dietaryRestrictions?.length > 0 && (
            <div style={{ marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dietary Restrictions</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {guest.dietaryRestrictions.map((d) => (
                  <Badge key={d} variant="warning">{d}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Driver Tracking */}
        {guest.driver?.name && (
          <div className="card" style={{ padding: '1rem', background: 'rgba(201, 168, 76, 0.05)', border: '1px solid var(--border-gold)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Car size={15} className="text-gold" />
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--gold)' }}>Assigned Tour Driver</h4>
            </div>
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><strong>Name:</strong> {guest.driver.name}</div>
              <div><strong>Contact:</strong> {guest.driver.contactNumber || '—'}</div>
              <div><strong>Vehicle Plate:</strong> {guest.driver.vehiclePlateNumber || '—'}</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 4 }}>
                {guest.driver.requiresAccommodation && <Badge variant="warning">Lodging Needed</Badge>}
                {guest.driver.requiresMealPlan && <Badge variant="info">Meals Needed</Badge>}
              </div>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
}
