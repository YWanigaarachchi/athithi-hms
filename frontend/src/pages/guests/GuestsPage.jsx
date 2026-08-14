import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, Search, Mail, Phone, FileText, User } from 'lucide-react';
import { getGuests, deleteGuest } from '../../api/guestsApi';
import { fmtDate, nicTypeLabel } from '../../utils/formatters';
import Badge from '../../components/ui/Badge';
import { LoadingState, EmptyState } from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import GuestFormModal from './GuestFormModal';
import GuestDetailsModal from './GuestDetailsModal';
import toast from 'react-hot-toast';

export default function GuestsPage() {
  const [guests, setGuests]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [viewingGuest, setViewingGuest] = useState(null);

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getGuests({ page, limit: 12, search });
      setGuests(res.data.data || []);
      setTotal(res.data.pagination?.total || res.data.total || 0);
    } catch {
      toast.error('Failed to load guest profiles');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchGuests(); }, [fetchGuests]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete profile for ${name}?`)) return;
    try {
      await deleteGuest(id);
      toast.success('Guest deleted.');
      fetchGuests();
    } catch {
      toast.error('Failed to delete guest.');
    }
  };

  const handleOpenCreate = () => {
    setEditingGuest(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (g) => {
    setEditingGuest(g);
    setIsFormOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Guest CRM</h1>
          <p>Manage guest profiles, preferences, and identity verification</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Add Guest
          </button>
        </div>
      </div>

      <div className="table-container" style={{ marginBottom: '1.5rem' }}>
        <div className="table-toolbar">
          <div className="search-input-wrapper">
            <Search size={14} />
            <input
              className="form-input search-input"
              placeholder="Search by name, email, or NIC..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ minWidth: '300px' }}
            />
          </div>
          <span className="text-muted text-sm">{total} guests registered</span>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading guest database..." />
      ) : guests.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No guests found"
          description="Try adjusting your search criteria."
        />
      ) : (
        <div className="rooms-grid">
          {guests.map((g) => (
            <div key={g._id} className="card" style={{ padding: '1.25rem' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="activity-avatar" style={{ width: 48, height: 48, fontSize: '1.1rem' }}>
                    {g.firstName[0]}{g.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ fontSize: '1rem', lineHeight: 1.2 }}>
                      {g.firstName} {g.lastName}
                    </h3>
                    <div className="text-xs text-muted">Since {fmtDate(g.createdAt)}</div>
                  </div>
                </div>
                {g.isVIP && <Badge variant="gold" dot>VIP</Badge>}
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <Mail size={13} /> <span className="truncate">{g.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <Phone size={13} /> {g.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <FileText size={13} /> 
                  {g.identityDoc?.number} <Badge variant="neutral">{nicTypeLabel(g.identityDoc?.type)}</Badge>
                </div>
              </div>

              {g.preferences?.dietary?.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-muted uppercase tracking-wider mb-1">Dietary</div>
                  <div className="flex flex-wrap gap-1">
                    {g.preferences.dietary.map(d => (
                      <span key={d} className="amenity-tag" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}>{d}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-sm btn-secondary flex-1" onClick={() => setViewingGuest(g)}>Profile</button>
                <button className="btn btn-sm btn-ghost" onClick={() => handleOpenEdit(g)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(g._id, `${g.firstName} ${g.lastName}`)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && total > 0 && (
        <div className="mt-6">
          <Pagination
            page={page}
            limit={12}
            total={total}
            pages={Math.ceil(total / 12)}
            onPage={setPage}
          />
        </div>
      )}

      {/* Guest Form Modal (Add / Edit) */}
      <GuestFormModal
        isOpen={isFormOpen}
        guest={editingGuest}
        onClose={() => setIsFormOpen(false)}
        onSaved={fetchGuests}
      />

      {/* Guest Details Modal */}
      <GuestDetailsModal
        isOpen={!!viewingGuest}
        guest={viewingGuest}
        onClose={() => setViewingGuest(null)}
        onEdit={handleOpenEdit}
      />
    </div>
  );
}
