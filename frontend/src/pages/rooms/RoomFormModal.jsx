import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { createRoom, updateRoom } from '../../api/roomsApi';
import toast from 'react-hot-toast';

const AMENITIES = ['WiFi', 'Air Conditioning', 'Mini Bar', 'Ocean View', 'Balcony', 'Room Service', 'Bathtub', 'Plunge Pool'];
const TYPES     = ['standard', 'deluxe', 'ocean-view', 'eco-cabana', 'suite', 'villa'];
const STATUSES  = ['available', 'occupied', 'reserved', 'maintenance'];

export default function RoomFormModal({ isOpen, onClose, room, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    number: '', name: '', type: 'standard', status: 'available',
    capacity: 2, floor: 1, basePrice: 0,
    amenities: [], view: '', description: ''
  });

  useEffect(() => {
    if (room) {
      setForm({ ...room });
    } else {
      setForm({
        number: '', name: '', type: 'standard', status: 'available',
        capacity: 2, floor: 1, basePrice: 0,
        amenities: [], view: '', description: ''
      });
    }
  }, [room, isOpen]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toggleAmenity = (a) => {
    setForm((f) => {
      const copy = new Set(f.amenities);
      copy.has(a) ? copy.delete(a) : copy.add(a);
      return { ...f, amenities: Array.from(copy) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (room) {
        await updateRoom(room._id, form);
        toast.success(`Room #${form.number} updated.`);
      } else {
        await createRoom(form);
        toast.success(`Room #${form.number} created.`);
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save room.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
      <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Saving...' : (room ? 'Save Changes' : 'Create Room')}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={room ? `Edit Room #${room.number}` : 'Add New Room'}
      size="md"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label className="form-label">Room Number</label>
          <input name="number" className="form-input" value={form.number} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Room Name</label>
          <input name="name" className="form-input" value={form.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label className="form-label">Room Type</label>
          <select name="type" className="form-select" value={form.type} onChange={handleChange}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select name="status" className="form-select" value={form.status} onChange={handleChange}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Base Price (LKR)</label>
          <input name="basePrice" type="number" min="0" className="form-input" value={form.basePrice} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Capacity (Guests)</label>
          <input name="capacity" type="number" min="1" className="form-input" value={form.capacity} onChange={handleChange} required />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Description</label>
          <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} rows={2} />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Amenities</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {AMENITIES.map(a => {
              const active = form.amenities.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  style={{
                    padding: '4px 10px', fontSize: '0.8rem',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                    background: active ? 'var(--gold-muted)' : 'var(--bg-elevated)',
                    color: active ? 'var(--gold)' : 'var(--text-secondary)',
                  }}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}
