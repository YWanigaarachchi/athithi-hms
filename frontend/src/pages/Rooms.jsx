import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useHotel } from '../context/HotelContext';
import { ROOM_TYPES } from '../constants/sriLanka';
import { formatCurrency, getSeasonForDate } from '../utils/hotelUtils';
import { Plus, BedDouble, Users, Sparkles, Wrench, CheckCircle2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Rooms() {
  const { openBookingModal } = useOutletContext();
  const { rooms, addRoom, updateRoom, currency, usdRate } = useHotel();

  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Room Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('deluxe');
  const [basePrice, setBasePrice] = useState('25000');
  const [capacity, setCapacity] = useState('2');
  const [floor, setFloor] = useState('1st Floor');
  const [amenitiesInput, setAmenitiesInput] = useState('AC, King Bed, Free Wi-Fi, Balcony');

  const activeSeason = getSeasonForDate(new Date());

  const filteredRooms = rooms.filter((r) => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (
      searchQuery &&
      !r.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.number.includes(searchQuery)
    )
      return false;
    return true;
  });

  const convertPrice = (lkrAmount) => {
    if (currency === 'USD') return formatCurrency(lkrAmount / usdRate, 'USD');
    return formatCurrency(lkrAmount, 'LKR');
  };

  const handleToggleMaintenance = (room) => {
    const nextStatus = room.status === 'maintenance' ? 'available' : 'maintenance';
    updateRoom(room.id, { status: nextStatus });
    toast.success(`Room ${room.number} is now marked as ${nextStatus}!`);
  };

  const handleAddRoomSubmit = (e) => {
    e.preventDefault();
    if (!roomNumber.trim() || !roomName.trim()) {
      toast.error('Room number and name are required.');
      return;
    }

    if (rooms.some((r) => r.number === roomNumber.trim())) {
      toast.error(`Room ${roomNumber} already exists!`);
      return;
    }

    addRoom({
      number: roomNumber.trim(),
      name: roomName.trim(),
      type: roomType,
      basePrice: Number(basePrice) || 20000,
      capacity: Number(capacity) || 2,
      floor,
      amenities: amenitiesInput.split(',').map((a) => a.trim()).filter(Boolean),
    });

    toast.success(`Room ${roomNumber} added successfully!`);
    setIsAddModalOpen(false);
    setRoomNumber('');
    setRoomName('');
  };

  return (
    <div className="fade-in-up flex-col gap-24">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-12 mb-8">
        <div>
          <h1 className="page-title">Rooms & Accommodations</h1>
          <p className="page-desc">Manage room inventory, pricing tiers, and maintenance status</p>
        </div>
        <div className="flex items-center gap-12">
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
            <span>Add New Room</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card-sm flex items-center justify-between flex-wrap gap-16" style={{ background: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-12 flex-wrap">
          {/* Search */}
          <div className="input-group" style={{ width: '220px' }}>
            <Search className="input-addon" size={16} />
            <input
              type="text"
              className="form-input"
              placeholder="Search room name or #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Room Types</option>
            {ROOM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="available">🟢 Available</option>
            <option value="occupied">🔴 Occupied</option>
            <option value="reserved">🔵 Reserved</option>
            <option value="maintenance">🟡 Maintenance</option>
          </select>
        </div>

        <div className="text-sm text-secondary">
          Showing <b>{filteredRooms.length}</b> of <b>{rooms.length}</b> Rooms
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid-3">
        {filteredRooms.map((room) => {
          const typeObj = ROOM_TYPES.find((t) => t.value === room.type);
          const seasonalPrice = activeSeason ? room.basePrice * activeSeason.multiplier : room.basePrice;

          return (
            <div key={room.id} className="room-card">
              <div className="room-card-img">
                <span>{typeObj ? typeObj.emoji : '🛏️'}</span>
                <span
                  className={`badge badge-${room.status}`}
                  style={{ position: 'absolute', top: '12px', right: '12px' }}
                >
                  {room.status}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    fontSize: '11px',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {room.floor}
                </span>
              </div>

              <div className="room-card-body">
                <div className="flex items-center justify-between">
                  <div className="room-card-type">{typeObj?.label || room.type}</div>
                  <div className="text-xs text-secondary flex items-center gap-4">
                    <Users size={12} /> Up to {room.capacity} Guests
                  </div>
                </div>

                <div className="room-card-name">Room {room.number} • {room.name}</div>

                <div className="flex items-baseline gap-8 mb-12">
                  <div className="room-card-price">{convertPrice(room.basePrice)} <span>/ night</span></div>
                  {activeSeason && (
                    <div className="text-xs text-brand font-semibold">
                      (Peak: {convertPrice(seasonalPrice)})
                    </div>
                  )}
                </div>

                {/* Amenities tags */}
                <div className="flex flex-wrap gap-4 mb-8">
                  {room.amenities?.slice(0, 3).map((a, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '10px',
                        background: 'var(--bg-hover)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {a}
                    </span>
                  ))}
                  {room.amenities?.length > 3 && (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      +{room.amenities.length - 3} more
                    </span>
                  )}
                </div>

                {room.currentGuest && (
                  <div className="text-xs text-secondary mb-4">
                    Guest: <b className="text-primary">{room.currentGuest}</b>
                    {room.checkOutDate && ` (Until ${room.checkOutDate})`}
                  </div>
                )}
              </div>

              <div className="room-card-footer">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleToggleMaintenance(room)}
                  style={{ fontSize: '12px', padding: '4px 8px' }}
                >
                  <Wrench size={13} />
                  {room.status === 'maintenance' ? 'Set Available' : 'Maintenance'}
                </button>

                {room.status === 'available' ? (
                  <button className="btn btn-primary btn-sm" onClick={openBookingModal}>
                    Book Now
                  </button>
                ) : (
                  <span className="text-xs text-muted">Currently {room.status}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Room Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="section-title" style={{ margin: 0 }}>Add New Room Unit</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddRoomSubmit}>
              <div className="modal-body flex-col gap-16">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">Room Number</label>
                    <input
                      className="form-input"
                      placeholder="e.g. 201"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Room Title</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Unawatuna Bay Villa"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                    >
                      {ROOM_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Base Rate (LKR / Night)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Guest Capacity</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="form-input"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Floor / Wing</label>
                    <input
                      className="form-input"
                      placeholder="e.g. 2nd Floor Ocean Wing"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Amenities (Comma separated)</label>
                  <input
                    className="form-input"
                    value={amenitiesInput}
                    onChange={(e) => setAmenitiesInput(e.target.value)}
                    placeholder="AC, King Bed, Free Wi-Fi, Mini Bar"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
