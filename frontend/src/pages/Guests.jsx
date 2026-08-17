import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { NIC_TYPES, BREAKFAST_PREFERENCES, SPICE_LEVELS } from '../constants/sriLanka';
import { validateNIC } from '../utils/hotelUtils';
import { Plus, Search, User, Phone, Mail, IdCard, Utensils, CheckCircle2, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Guests() {
  const { guests, addGuest } = useHotel();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idType, setIdType] = useState('nic-old');
  const [idNumber, setIdNumber] = useState('');
  const [nationality, setNationality] = useState('Sri Lankan');
  const [spicePreference, setSpicePreference] = useState('medium');
  const [breakfastPreference, setBreakfastPreference] = useState('traditional-sl');
  const [notes, setNotes] = useState('');

  const filteredGuests = guests.filter((g) => {
    if (
      searchQuery &&
      !g.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !g.phone.includes(searchQuery) &&
      !g.idNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const nicValidation = idNumber ? validateNIC(idNumber, idType) : null;

  const handleAddGuestSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Guest name is required.');
      return;
    }

    if (nicValidation && !nicValidation.valid) {
      toast.error(nicValidation.message);
      return;
    }

    addGuest({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      idType,
      idNumber: idNumber.trim(),
      nationality,
      spicePreference,
      breakfastPreference,
      notes: notes.trim(),
    });

    toast.success(`Guest ${name} registered successfully!`);
    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setIdNumber('');
    setNotes('');
  };

  return (
    <div className="fade-in-up flex-col gap-24">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-12 mb-8">
        <div>
          <h1 className="page-title">Guest Directory & Profiles</h1>
          <p className="page-desc">Manage guest records, Sri Lankan NIC identification, and culinary preferences</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>Register Guest</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-sm flex items-center justify-between flex-wrap gap-16" style={{ background: 'var(--bg-surface)' }}>
        <div className="input-group" style={{ width: '320px' }}>
          <Search className="input-addon" size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, phone, or NIC / passport..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="text-sm text-secondary">
          Showing <b>{filteredGuests.length}</b> Registered Guests
        </div>
      </div>

      {/* Guests Grid */}
      <div className="grid-3">
        {filteredGuests.map((g) => (
          <div key={g.id} className="card flex-col gap-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-10">
                <div
                  className="stat-icon orange"
                  style={{ width: '40px', height: '40px', fontSize: '18px' }}
                >
                  👤
                </div>
                <div>
                  <h3 className="font-bold text-primary">{g.name}</h3>
                  <span className="text-xs text-secondary">{g.nationality}</span>
                </div>
              </div>
              <span className="badge badge-pending">{g.totalVisits} Visit{g.totalVisits > 1 ? 's' : ''}</span>
            </div>

            <div className="divider" style={{ margin: '8px 0' }} />

            <div className="flex-col gap-6 text-sm">
              <div className="flex items-center gap-8 text-secondary">
                <Phone size={14} className="text-brand" />
                <span>{g.phone || 'No phone recorded'}</span>
              </div>
              <div className="flex items-center gap-8 text-secondary">
                <Mail size={14} className="text-brand" />
                <span>{g.email || 'No email recorded'}</span>
              </div>
              <div className="flex items-center gap-8 text-secondary">
                <IdCard size={14} className="text-brand" />
                <span className="font-semibold text-primary">{g.idNumber}</span>
                <span className="text-xs text-muted">({g.idType})</span>
              </div>
            </div>

            {/* Preferences */}
            <div
              className="card-sm mt-8 flex-col gap-4"
              style={{ background: 'var(--bg-surface)', padding: '10px' }}
            >
              <div className="text-xs font-semibold text-brand">Sri Lankan Hospitality Notes:</div>
              <div className="text-xs text-secondary">
                🍛 Breakfast: <b>{g.breakfastPreference === 'traditional-sl' ? 'Traditional Sri Lankan' : g.breakfastPreference}</b>
              </div>
              <div className="text-xs text-secondary">
                🌶️ Spice: <b>{g.spicePreference}</b>
              </div>
              {g.notes && <div className="text-xs text-muted mt-4">💬 "{g.notes}"</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Add Guest Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="section-title" style={{ margin: 0 }}>Register New Guest Profile</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddGuestSubmit}>
              <div className="modal-body flex-col gap-16">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">Guest Full Name</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Kasun Perera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      className="form-input"
                      placeholder="+94 77 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="guest@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nationality</label>
                    <input
                      className="form-input"
                      placeholder="Sri Lankan, British, etc."
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">ID Document Type</label>
                    <select
                      className="form-select"
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                    >
                      {NIC_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">NIC / Passport Number</label>
                    <input
                      className={`form-input ${nicValidation ? (nicValidation.valid ? 'success' : 'error') : ''}`}
                      placeholder={idType === 'nic-old' ? '921543890V' : idType === 'nic-new' ? '199854201132' : 'Passport Number'}
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                    />
                    {nicValidation && (
                      <div className={`nic-validated ${nicValidation.valid ? 'ok' : 'err'}`}>
                        {nicValidation.valid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        <span>{nicValidation.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Breakfast Preference</label>
                    <select
                      className="form-select"
                      value={breakfastPreference}
                      onChange={(e) => setBreakfastPreference(e.target.value)}
                    >
                      {BREAKFAST_PREFERENCES.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Spice Tolerance</label>
                    <select
                      className="form-select"
                      value={spicePreference}
                      onChange={(e) => setSpicePreference(e.target.value)}
                    >
                      {SPICE_LEVELS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Special Hospitality Notes</label>
                  <textarea
                    className="form-textarea"
                    placeholder="e.g. Likes extra coconut sambol, early morning tea, anniversary setup..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
