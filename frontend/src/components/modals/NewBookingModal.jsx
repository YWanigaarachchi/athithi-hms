import React, { useState, useEffect } from 'react';
import { useHotel } from '../../context/HotelContext';
import { ROOM_TYPES, BREAKFAST_PREFERENCES, SPICE_LEVELS, NIC_TYPES } from '../../constants/sriLanka';
import { calcRoomPrice, calcTaxes, formatCurrency, validateNIC } from '../../utils/hotelUtils';
import { X, Calendar, User, BedDouble, Utensils, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewBookingModal({ isOpen, onClose }) {
  const { rooms, guests, addBooking, addGuest, taxRates, currency, usdRate } = useHotel();

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [guestMode, setGuestMode] = useState('existing'); // 'existing' | 'new'
  const [selectedGuestId, setSelectedGuestId] = useState('');
  
  // New Guest fields
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [idType, setIdType] = useState('nic-old');
  const [idNumber, setIdNumber] = useState('');

  // Booking fields
  const [roomId, setRoomId] = useState('');
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [guestsCount, setGuestsCount] = useState(2);
  const [breakfastPreference, setBreakfastPreference] = useState('traditional-sl');
  const [spicePreference, setSpicePreference] = useState('medium');

  // Set default available room
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      const available = rooms.find((r) => r.status === 'available') || rooms[0];
      if (available && !roomId) setRoomId(available.id);
    }
    if (guests && guests.length > 0 && !selectedGuestId) {
      setSelectedGuestId(guests[0].id);
    }
  }, [rooms, guests, roomId, selectedGuestId]);

  if (!isOpen) return null;

  const selectedRoom = rooms.find((r) => r.id === roomId);
  const priceDetails = selectedRoom
    ? calcRoomPrice(selectedRoom.basePrice, checkIn, checkOut)
    : { nights: 1, multiplier: 1, season: null, subtotal: 0 };

  const taxes = calcTaxes(priceDetails.subtotal, taxRates);

  // Validate NIC if entering new guest
  const nicValidation = guestMode === 'new' && idNumber ? validateNIC(idNumber, idType) : null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!roomId) {
      toast.error('Please select a room.');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error('Check-out date must be after check-in date.');
      return;
    }

    let bookingGuestName = '';
    let bookingGuestPhone = '';
    let finalGuestId = selectedGuestId;

    if (guestMode === 'existing') {
      const existing = guests.find((g) => g.id === selectedGuestId);
      if (!existing) {
        toast.error('Please select a valid guest.');
        return;
      }
      bookingGuestName = existing.name;
      bookingGuestPhone = existing.phone;
    } else {
      if (!guestName.trim()) {
        toast.error('Guest name is required.');
        return;
      }
      if (nicValidation && !nicValidation.valid) {
        toast.error(nicValidation.message);
        return;
      }

      const createdGuest = addGuest({
        name: guestName,
        phone: guestPhone,
        email: guestEmail,
        idType,
        idNumber,
        spicePreference,
        breakfastPreference,
        nationality: idType.startsWith('nic') ? 'Sri Lankan' : 'International',
      });
      finalGuestId = createdGuest.id;
      bookingGuestName = createdGuest.name;
      bookingGuestPhone = createdGuest.phone;
    }

    addBooking({
      guestId: finalGuestId,
      guestName: bookingGuestName,
      guestPhone: bookingGuestPhone,
      roomId: selectedRoom.id,
      roomNumber: selectedRoom.number,
      roomName: selectedRoom.name,
      checkIn,
      checkOut,
      nights: priceDetails.nights,
      guestsCount: Number(guestsCount),
      baseRate: selectedRoom.basePrice,
      multiplier: priceDetails.multiplier,
      subtotal: priceDetails.subtotal,
      taxTotal: taxes.serviceCharge + taxes.vat + taxes.sscl,
      grandTotal: taxes.total,
      spicePreference,
      breakfastPreference,
    });

    toast.success(`Booking created for ${bookingGuestName} in Room ${selectedRoom.number}!`);
    onClose();
  };

  const convertPrice = (lkrAmount) => {
    if (currency === 'USD') return formatCurrency(lkrAmount / usdRate, 'USD');
    return formatCurrency(lkrAmount, 'LKR');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-8">
            <span style={{ fontSize: '24px' }}>🏨</span>
            <div>
              <h3 className="page-title" style={{ fontSize: '18px' }}>Create New Reservation</h3>
              <p className="page-desc">Athithi HMS • Smart Sri Lankan Pricing & Taxes</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body flex-col gap-20">
            {/* Guest Selection Mode */}
            <div className="card-sm" style={{ background: 'var(--bg-surface)' }}>
              <div className="flex items-center justify-between mb-16">
                <span className="section-title-sm" style={{ margin: 0 }}>Guest Details</span>
                <div className="tabs" style={{ padding: '2px' }}>
                  <button
                    type="button"
                    className={`tab-btn ${guestMode === 'existing' ? 'active' : ''}`}
                    onClick={() => setGuestMode('existing')}
                  >
                    Existing Guest
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${guestMode === 'new' ? 'active' : ''}`}
                    onClick={() => setGuestMode('new')}
                  >
                    + New Guest
                  </button>
                </div>
              </div>

              {guestMode === 'existing' ? (
                <div className="form-group">
                  <label className="form-label">Select Registered Guest</label>
                  <select
                    className="form-select"
                    value={selectedGuestId}
                    onChange={(e) => setSelectedGuestId(e.target.value)}
                  >
                    {guests.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.phone}) — {g.idNumber || g.idType}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">Full Name</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Kasun Perera"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      className="form-input"
                      placeholder="+94 77 123 4567"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ID Type</label>
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
              )}
            </div>

            {/* Room & Date Selection */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label required">Select Room</label>
                <select
                  className="form-select"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.number} - {r.name} ({convertPrice(r.basePrice)}/night) {r.status !== 'available' ? `[${r.status}]` : '✓ Available'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Number of Guests</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="form-input"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Check-In Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Check-Out Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Sri Lankan Hospitality Preferences */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">🇱🇰 Breakfast Preference</label>
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
                <label className="form-label">🌶️ Spice Level</label>
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

            {/* Live Pricing & Sri Lankan Tax Breakdown */}
            <div className="tax-box">
              <div className="flex items-center justify-between mb-8">
                <span className="font-semibold text-sm">Calculation & Sri Lankan Tax Summary</span>
                {priceDetails.season ? (
                  <span className="season-pill season-peak text-xs">
                    {priceDetails.season.emoji} {priceDetails.season.name} ({priceDetails.multiplier}x Multiplier Applied)
                  </span>
                ) : (
                  <span className="season-pill season-offpeak text-xs">🌿 Standard Rates</span>
                )}
              </div>

              <div className="tax-row sub">
                <span>Room Subtotal ({priceDetails.nights} Night{priceDetails.nights > 1 ? 's' : ''} @ {convertPrice(selectedRoom?.basePrice || 0)})</span>
                <span>{convertPrice(priceDetails.subtotal)}</span>
              </div>
              <div className="tax-row sub">
                <span>10% Service Charge</span>
                <span>{convertPrice(taxes.serviceCharge)}</span>
              </div>
              <div className="tax-row sub">
                <span>18% VAT (Value Added Tax)</span>
                <span>{convertPrice(taxes.vat)}</span>
              </div>
              <div className="tax-row sub">
                <span>2.5% SSCL (Social Security Levy)</span>
                <span>{convertPrice(taxes.sscl)}</span>
              </div>
              <div className="tax-row divider total">
                <span>Total Amount ({currency})</span>
                <span>{convertPrice(taxes.total)}</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
