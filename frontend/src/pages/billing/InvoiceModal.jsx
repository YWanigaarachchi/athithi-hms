import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { fmtDate, fmtLKR, fmtUSD, paymentStatusBadge } from '../../utils/formatters';
import { addLineItem, markPaid } from '../../api/billingApi';
import { Printer, CreditCard, Plus, Trash2, CheckCircle, FileText, Utensils, BedDouble, Compass } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InvoiceModal({ isOpen, onClose, bill, onUpdated }) {
  const [newItem, setNewItem] = useState({ description: '', type: 'fb', amount: '', quantity: 1 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!bill) return null;

  const booking = bill.bookingId || {};
  const guest   = bill.guestId || booking.guestId || {};
  const room    = booking.roomId || {};

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.description || !newItem.amount) {
      toast.error('Please enter item description and price.');
      return;
    }
    setLoading(true);
    try {
      await addLineItem(bill._id, {
        description: newItem.description,
        type: newItem.type,
        amount: Number(newItem.amount) * (Number(newItem.quantity) || 1),
        quantity: Number(newItem.quantity) || 1,
        unitPrice: Number(newItem.amount),
      });
      toast.success('Line item added to invoice.');
      setNewItem({ description: '', type: 'fb', amount: '', quantity: 1 });
      setShowAddForm(false);
      onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add line item.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (method = 'card') => {
    if (!window.confirm(`Settle invoice ${bill.invoiceNumber || 'payment'} for ${fmtLKR(bill.totalLKR || bill.grandTotalLKR)}?`)) return;
    setLoading(true);
    try {
      await markPaid(bill._id, {
        method,
        amount: bill.totalLKR || bill.grandTotalLKR,
      });
      toast.success('Payment successfully recorded! 🧾');
      onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
      <button className="btn btn-ghost" onClick={onClose}>Close</button>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-secondary" onClick={handlePrint}>
          <Printer size={15} /> Print Tax Invoice
        </button>
        {bill.paymentStatus !== 'paid' && (
          <button className="btn btn-primary" onClick={() => handlePay('card')} disabled={loading}>
            <CreditCard size={15} /> Settle Bill (Pay)
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Statutory Sri Lankan Tax Invoice"
      size="lg"
      footer={footer}
    >
      <div className="printable-invoice" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Invoice Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '2px solid var(--border-light)',
            paddingBottom: '1rem',
          }}
        >
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold)', letterSpacing: '0.05em' }}>
              🏨 ATHITHI RESORT & LUXURY VILLAS
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Beachfront Road, Mirissa, Southern Province, Sri Lanka<br />
              VAT Reg No: <strong>VAT-114589230-7000</strong> · SVAT: <strong>SVAT-004812</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tax Invoice</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {bill.invoiceNumber || `INV-${bill._id?.slice(-8).toUpperCase()}`}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Date: {fmtDate(bill.createdAt || bill.issuedAt)}
            </div>
            <div style={{ marginTop: 6 }}>
              <Badge variant={paymentStatusBadge(bill.paymentStatus)} dot>
                {bill.paymentStatus?.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Bill To & Booking Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            background: 'var(--bg-elevated)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Billed To</div>
            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{guest.firstName} {guest.lastName}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {guest.phone} · {guest.email || 'No email'}<br />
              NIC / Passport: {guest.nicNumber || 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Stay Summary</div>
            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
              Room #{room.number || '—'} ({room.name || 'Standard'})
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Ref: <strong>{booking.bookingReference || 'N/A'}</strong><br />
              Stay: {fmtDate(booking.checkIn)} to {fmtDate(booking.checkOut)} ({booking.nights || 1} nights)
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Itemized Folio Charges</h4>
            {bill.paymentStatus !== 'paid' && (
              <button
                className="btn btn-sm btn-ghost"
                style={{ color: 'var(--gold)' }}
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus size={13} /> {showAddForm ? 'Cancel Item' : 'Add Charge / Service'}
              </button>
            )}
          </div>

          {/* Quick add item drawer */}
          {showAddForm && (
            <form
              onSubmit={handleAddItem}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr auto',
                gap: '0.5rem',
                background: 'var(--bg-card)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0.75rem',
                border: '1px dashed var(--border-gold)',
              }}
            >
              <input
                className="form-input"
                placeholder="Description (e.g. Seafood Kottu, Airport Ride)"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                required
              />
              <select
                className="form-select"
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              >
                <option value="fb">Food & Beverage</option>
                <option value="extra">Extra / Excursion</option>
                <option value="room">Room Charge</option>
              </select>
              <input
                type="number"
                min="0"
                className="form-input"
                placeholder="Price (LKR)"
                value={newItem.amount}
                onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                required
              />
              <button type="submit" className="btn btn-sm btn-primary" disabled={loading}>
                Add
              </button>
            </form>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Item Description</th>
                  <th style={{ textAlign: 'center' }}>Category</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Amount (LKR)</th>
                </tr>
              </thead>
              <tbody>
                {(bill.lineItems || []).map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.description}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Badge variant={item.type === 'fb' ? 'warning' : item.type === 'room' ? 'info' : 'neutral'}>
                        {item.type === 'fb' ? 'F & B' : item.type === 'room' ? 'Room Stay' : 'Extra Activity'}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.quantity || 1}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtLKR(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sri Lankan Statutory Tax Equations Breakdown */}
        <div
          style={{
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            🇱🇰 Statutory Sri Lankan Tax Breakdown
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal (Net Items Pre-Tax)</span>
              <span>{fmtLKR(bill.subtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Hotel Service Charge (10.0%)</span>
              <span>+ {fmtLKR(bill.serviceCharge || bill.taxes?.ServiceCharge || bill.subtotal * 0.1)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Value Added Tax (VAT 18.0% on Subtotal + SC)</span>
              <span>+ {fmtLKR(bill.vat || bill.taxes?.VAT || (bill.subtotal * 1.1) * 0.18)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Social Security Contribution Levy (SSCL 2.5% on Subtotal)</span>
              <span>+ {fmtLKR(bill.sscl || bill.taxes?.SSCL || bill.subtotal * 0.025)}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--gold)',
                borderTop: '2px solid var(--border-gold)',
                paddingTop: '0.65rem',
                marginTop: '0.4rem',
              }}
            >
              <span>Grand Total Payable</span>
              <span>{fmtLKR(bill.totalLKR || bill.grandTotalLKR)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Equivalent ≈ {fmtUSD((bill.totalLKR || bill.grandTotalLKR) / (bill.exchangeRate || 320))} (Rate: 1 USD = 320 LKR)
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
          Thank you for choosing Athithi Resort! We look forward to welcoming you back to Sri Lanka. 🇱🇰
        </div>

      </div>
    </Modal>
  );
}
