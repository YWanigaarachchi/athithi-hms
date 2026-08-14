import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { createGuest, updateGuest, validateNIC } from '../../api/guestsApi';
import { User, Phone, Mail, Car, Utensils, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const NIC_TYPES = [
  { value: 'nic-old', label: 'Old SL NIC (e.g. 881234567V / X)' },
  { value: 'nic-new', label: 'New SL NIC (12 digits, e.g. 199512345678)' },
  { value: 'passport', label: 'International Passport' },
];

const SPICE_LEVELS = [
  { value: 'none', label: 'None (No Spice)' },
  { value: 'mild', label: 'Mild' },
  { value: 'medium', label: 'Medium' },
  { value: 'hot', label: 'Hot 🔥' },
  { value: 'sri-lankan-hot', label: 'Sri Lankan Hot 🔥🔥 (Traditional)' },
];

const BREAKFAST_PREFS = [
  { value: 'traditional-sl', label: 'Traditional Sri Lankan (Hoppers, String Hoppers, Pol Sambol)' },
  { value: 'continental', label: 'Continental' },
  { value: 'english', label: 'Full English' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'none', label: 'Room Only (No Breakfast)' },
];

const VIP_LEVELS = ['none', 'silver', 'gold', 'platinum'];

export default function GuestFormModal({ isOpen, onClose, guest, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [nicFeedback, setNicFeedback] = useState(null);

  const defaultForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: 'Sri Lankan',
    country: 'Sri Lanka',
    address: '',
    nicType: 'nic-old',
    nicNumber: '',
    driver: {
      name: '',
      contactNumber: '',
      vehiclePlateNumber: '',
      requiresAccommodation: false,
      requiresMealPlan: false,
    },
    spiceTolerance: 'medium',
    breakfastPreference: 'traditional-sl',
    dietaryRestrictions: '',
    specialNotes: '',
    vipLevel: 'none',
  };

  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (guest) {
      setForm({
        ...guest,
        driver: {
          name: guest.driver?.name || '',
          contactNumber: guest.driver?.contactNumber || '',
          vehiclePlateNumber: guest.driver?.vehiclePlateNumber || '',
          requiresAccommodation: !!guest.driver?.requiresAccommodation,
          requiresMealPlan: !!guest.driver?.requiresMealPlan,
        },
        dietaryRestrictions: Array.isArray(guest.dietaryRestrictions)
          ? guest.dietaryRestrictions.join(', ')
          : guest.dietaryRestrictions || '',
      });
    } else {
      setForm(defaultForm);
    }
    setNicFeedback(null);
  }, [guest, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('driver.')) {
      const driverKey = name.split('.')[1];
      setForm((f) => ({
        ...f,
        driver: {
          ...f.driver,
          [driverKey]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  // Real-time Sri Lankan NIC validation
  const handleNicCheck = async (nicNum, nicType) => {
    if (!nicNum || nicNum.length < 5) {
      setNicFeedback(null);
      return;
    }
    try {
      const res = await validateNIC({ nicNumber: nicNum, nicType: nicType || form.nicType });
      if (res.data.data?.valid) {
        setNicFeedback({
          valid: true,
          message: `Valid ${res.data.data.format?.toUpperCase()} format (${res.data.data.estimatedBirthYear ? 'Born ~' + res.data.data.estimatedBirthYear : ''})`,
        });
      } else {
        setNicFeedback({ valid: false, message: 'Invalid NIC format for chosen type' });
      }
    } catch {
      // Local regex fallback
      const oldRegex = /^[0-9]{9}[VXvx]$/;
      const newRegex = /^[0-9]{12}$/;
      if (form.nicType === 'nic-old' && oldRegex.test(nicNum)) {
        setNicFeedback({ valid: true, message: 'Valid Old Sri Lankan NIC (9 digits + letter)' });
      } else if (form.nicType === 'nic-new' && newRegex.test(nicNum)) {
        setNicFeedback({ valid: true, message: 'Valid New Sri Lankan NIC (12 digits)' });
      } else if (form.nicType === 'passport' && nicNum.length >= 6) {
        setNicFeedback({ valid: true, message: 'Valid Passport Number' });
      } else {
        setNicFeedback({ valid: false, message: 'Does not match expected Sri Lankan NIC pattern' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.phone || !form.nicNumber) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        dietaryRestrictions: form.dietaryRestrictions
          ? form.dietaryRestrictions.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      if (guest) {
        await updateGuest(guest._id, payload);
        toast.success(`Profile for ${form.firstName} updated.`);
      } else {
        await createGuest(payload);
        toast.success(`Guest ${form.firstName} ${form.lastName} registered!`);
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save guest profile.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
        Cancel
      </button>
      <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Saving Profile...' : guest ? 'Save Changes' : 'Register Guest'}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={guest ? `Edit Guest: ${guest.firstName} ${guest.lastName}` : 'Register New Guest'}
      size="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="form-grid">
        {/* Personal Details */}
        <div className="form-group">
          <label className="form-label">
            First Name <span className="required">*</span>
          </label>
          <input
            name="firstName"
            className="form-input"
            placeholder="e.g. Kasun"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Last Name <span className="required">*</span>
          </label>
          <input
            name="lastName"
            className="form-input"
            placeholder="e.g. Perera"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <Phone size={13} style={{ display: 'inline', marginRight: 4 }} /> Phone Number <span className="required">*</span>
          </label>
          <input
            name="phone"
            className="form-input"
            placeholder="e.g. +94 77 123 4567"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <Mail size={13} style={{ display: 'inline', marginRight: 4 }} /> Email Address
          </label>
          <input
            name="email"
            type="email"
            className="form-input"
            placeholder="e.g. kasun@example.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        {/* Identity & Sri Lankan NIC Verification */}
        <div className="form-group">
          <label className="form-label">
            <Shield size={13} style={{ display: 'inline', marginRight: 4 }} /> Identity Document Type <span className="required">*</span>
          </label>
          <select
            name="nicType"
            className="form-select"
            value={form.nicType}
            onChange={(e) => {
              handleChange(e);
              handleNicCheck(form.nicNumber, e.target.value);
            }}
          >
            {NIC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Document / NIC Number <span className="required">*</span>
          </label>
          <input
            name="nicNumber"
            className="form-input"
            placeholder="e.g. 881234567V or 199512345678"
            value={form.nicNumber}
            onChange={(e) => {
              handleChange(e);
              handleNicCheck(e.target.value, form.nicType);
            }}
            required
          />
          {nicFeedback && (
            <div
              style={{
                fontSize: '0.78rem',
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: nicFeedback.valid ? 'var(--success)' : 'var(--danger)',
              }}
            >
              {nicFeedback.valid ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
              {nicFeedback.message}
            </div>
          )}
        </div>

        {/* VIP Level & Nationality */}
        <div className="form-group">
          <label className="form-label">VIP Tier</label>
          <select name="vipLevel" className="form-select" value={form.vipLevel} onChange={handleChange}>
            {VIP_LEVELS.map((v) => (
              <option key={v} value={v}>
                {v === 'none' ? 'Standard (No VIP)' : `⭐ ${v.toUpperCase()} VIP`}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Nationality</label>
          <input
            name="nationality"
            className="form-input"
            value={form.nationality}
            onChange={handleChange}
          />
        </div>

        {/* Sri Lankan Food & Spice Preferences */}
        <div
          style={{
            gridColumn: '1 / -1',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Utensils size={15} className="text-gold" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gold)' }}>
              Culinary & Spice Preferences
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">🌶️ Spice Tolerance</label>
              <select name="spiceTolerance" className="form-select" value={form.spiceTolerance} onChange={handleChange}>
                {SPICE_LEVELS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">🍳 Breakfast Choice</label>
              <select name="breakfastPreference" className="form-select" value={form.breakfastPreference} onChange={handleChange}>
                {BREAKFAST_PREFS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label">Dietary Restrictions (comma-separated)</label>
            <input
              name="dietaryRestrictions"
              className="form-input"
              placeholder="e.g. Vegetarian, Gluten-free, Seafood allergy, Halal"
              value={form.dietaryRestrictions}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Tour Driver & Guide Tracking */}
        <div
          style={{
            gridColumn: '1 / -1',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Car size={15} className="text-gold" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gold)' }}>
              Tour Driver & Transport Details (Sri Lankan Tourism)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Driver Name</label>
              <input
                name="driver.name"
                className="form-input"
                placeholder="e.g. Sunil Shantha"
                value={form.driver.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Driver Contact No.</label>
              <input
                name="driver.contactNumber"
                className="form-input"
                placeholder="e.g. +94 71 987 6543"
                value={form.driver.contactNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Plate No.</label>
              <input
                name="driver.vehiclePlateNumber"
                className="form-input"
                placeholder="e.g. WP CAB-4521"
                value={form.driver.vehiclePlateNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="driver.requiresAccommodation"
                checked={form.driver.requiresAccommodation}
                onChange={handleChange}
              />
              <span>Requires Driver Accommodation Quarters</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="driver.requiresMealPlan"
                checked={form.driver.requiresMealPlan}
                onChange={handleChange}
              />
              <span>Requires Driver Staff Meals</span>
            </label>
          </div>
        </div>

      </form>
    </Modal>
  );
}
