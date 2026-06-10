import React, { useState, useEffect, useCallback } from 'react';
import { Plus, BedDouble, Search, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { getRooms, deleteRoom } from '../../api/roomsApi';
import Badge from '../../components/ui/Badge';
import { LoadingState, EmptyState } from '../../components/ui/Spinner';
import { fmtLKR, roomStatusBadge, roomTypeLabel } from '../../utils/formatters';
import RoomFormModal from './RoomFormModal';
import toast from 'react-hot-toast';

const ROOM_TYPES = ['standard','deluxe','ocean-view','eco-cabana','suite','villa'];
const STATUSES   = ['available','occupied','reserved','maintenance'];

export default function RoomsPage() {
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', status: '' });
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState({ open: false, room: null });

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type)   params.type   = filters.type;
      if (filters.status) params.status = filters.status;
      const res = await getRooms(params);
      setRooms(res.data.data);
    } catch {
      toast.error('Failed to load rooms.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const filtered = rooms.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.number.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q)   ||
      r.type.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (room) => {
    if (!window.confirm(`Deactivate Room #${room.number}?`)) return;
    try {
      await deleteRoom(room._id);
      toast.success(`Room #${room.number} deactivated.`);
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate room.');
    }
  };

  const statusColor = {
    available:   'var(--success)',
    occupied:    'var(--danger)',
    reserved:    'var(--warning)',
    maintenance: 'var(--text-muted)',
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Room Inventory</h1>
          <p>Manage all rooms — availability, pricing, and amenities</p>
        </div>
        <div className="page-header-actions">
          <button
            id="add-room-btn"
            className="btn btn-primary"
            onClick={() => setModal({ open: true, room: null })}
          >
            <Plus size={16} /> Add Room
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="table-container" style={{ marginBottom: '1.5rem' }}>
        <div className="table-toolbar">
          <div className="table-filters">
            <div className="search-input-wrapper">
              <Search size={14} />
              <input
                id="room-search"
                className="form-input search-input"
                placeholder="Search rooms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ width: '150px' }}
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="">All Types</option>
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>{roomTypeLabel(t)}</option>
              ))}
            </select>
            <select
              className="form-select"
              style={{ width: '140px' }}
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <span className="text-muted text-sm">{filtered.length} rooms</span>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading rooms..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="No rooms found"
          description="Add your first room to get started."
          action={
            <button className="btn btn-primary btn-sm" onClick={() => setModal({ open: true, room: null })}>
              <Plus size={14} /> Add Room
            </button>
          }
        />
      ) : (
        <div className="rooms-grid">
          {filtered.map((room) => (
            <div key={room._id} className="room-card">
              <div className="room-card-header">
                <div>
                  <div className="room-number">#{room.number}</div>
                  <div className="room-name">{room.name}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <Badge variant={roomStatusBadge(room.status)} dot>
                    {room.status}
                  </Badge>
                  <Badge variant="neutral">{roomTypeLabel(room.type)}</Badge>
                </div>
              </div>
              <div className="room-card-body">
                <div className="room-meta">
                  <div className="room-meta-item">
                    <BedDouble size={13} />
                    Floor {room.floor}
                  </div>
                  <div className="room-meta-item">
                    <CheckCircle size={13} />
                    {room.capacity} guests
                  </div>
                  {room.view && (
                    <div className="room-meta-item">🌊 {room.view}</div>
                  )}
                </div>
                <div className="room-price">
                  {fmtLKR(room.basePrice)}
                  <span> / night</span>
                </div>
                {room.description && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    {room.description}
                  </p>
                )}
                {room.amenities?.length > 0 && (
                  <div className="room-amenities">
                    {room.amenities.slice(0, 4).map((a) => (
                      <span key={a} className="amenity-tag">{a}</span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="amenity-tag">+{room.amenities.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="room-card-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => setModal({ open: true, room })}
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(room)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RoomFormModal
        isOpen={modal.open}
        room={modal.room}
        onClose={() => setModal({ open: false, room: null })}
        onSaved={fetchRooms}
      />
    </div>
  );
}
