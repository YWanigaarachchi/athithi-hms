import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { formatCurrency, formatDateSL, calcTaxes } from '../utils/hotelUtils';
import {
  Receipt, Plus, CheckCircle2, Printer, Search, DollarSign,
  CreditCard, Banknote, X, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Billing() {
  const { bills, markBillPaid, addBillItem, taxRates, currency, usdRate, hotelInfo } = useHotel();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Add Item to Bill Modal
  const [activeBillId, setActiveBillId] = useState(null);
  const [itemDescription, setItemDescription] = useState('');
  const [itemAmount, setItemAmount] = useState('');

  const filteredBills = bills.filter((b) => {
    if (
      searchQuery &&
      !b.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !b.roomNumber.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  const convertPrice = (lkrAmount) => {
    if (currency === 'USD') return formatCurrency(lkrAmount / usdRate, 'USD');
    return formatCurrency(lkrAmount, 'LKR');
  };

  const handlePayBill = (billId) => {
    markBillPaid(billId, 'Credit Card (Visa/Master)');
    toast.success(`Invoice ${billId} marked as PAID!`);
    if (selectedInvoice && selectedInvoice.id === billId) {
      setSelectedInvoice({ ...selectedInvoice, status: 'paid', paymentMethod: 'Credit Card (Visa/Master)' });
    }
  };

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if (!itemDescription.trim() || !itemAmount) {
      toast.error('Description and amount are required.');
      return;
    }

    addBillItem(activeBillId, {
      description: itemDescription.trim(),
      amount: Number(itemAmount),
    });

    toast.success('Line item added to invoice with updated taxes!');
    setActiveBillId(null);
    setItemDescription('');
    setItemAmount('');
  };

  return (
    <div className="fade-in-up flex-col gap-24">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-12 mb-8">
        <div>
          <h1 className="page-title">Billing & Sri Lankan Tax Invoicing</h1>
          <p className="page-desc">Automated VAT (18%), SSCL (2.5%), and 10% Service Charge calculations</p>
        </div>
      </div>

      {/* Tax Rates Summary Box */}
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-icon orange">
            <Receipt size={24} className="text-brand" />
          </div>
          <div>
            <div className="stat-value">18.0%</div>
            <div className="stat-label">Value Added Tax (VAT)</div>
            <div className="text-xs text-muted mt-4">Statutory Sri Lankan 2024 rate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">
            <Banknote size={24} style={{ color: '#14b8a6' }} />
          </div>
          <div>
            <div className="stat-value">2.5%</div>
            <div className="stat-label">Social Security Contribution (SSCL)</div>
            <div className="text-xs text-muted mt-4">Applicable on taxable turnover</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CreditCard size={24} className="text-success" />
          </div>
          <div>
            <div className="stat-value">10.0%</div>
            <div className="stat-label">Hotel Service Charge</div>
            <div className="text-xs text-muted mt-4">Distributed to resort staff</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-sm flex items-center justify-between flex-wrap gap-16" style={{ background: 'var(--bg-surface)' }}>
        <div className="input-group" style={{ width: '320px' }}>
          <Search className="input-addon" size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by invoice #, guest, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="text-sm text-secondary">
          Showing <b>{filteredBills.length}</b> Invoices
        </div>
      </div>

      {/* Invoices Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Date</th>
              <th>Guest Name</th>
              <th>Room</th>
              <th>Subtotal</th>
              <th>Taxes (VAT+SSCL+SC)</th>
              <th>Grand Total</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map((b) => {
              const taxSum = b.serviceCharge + b.vat + b.sscl;
              return (
                <tr key={b.id}>
                  <td className="font-bold text-brand">{b.id}</td>
                  <td className="text-sm">{formatDateSL(b.date)}</td>
                  <td>
                    <div className="font-semibold">{b.guestName}</div>
                    <div className="text-xs text-secondary">{b.bookingId}</div>
                  </td>
                  <td>
                    <span className="badge badge-reserved">Room {b.roomNumber}</span>
                  </td>
                  <td className="text-sm">{convertPrice(b.subtotal)}</td>
                  <td className="text-xs text-secondary">
                    {convertPrice(taxSum)}
                  </td>
                  <td className="font-bold text-brand">{convertPrice(b.grandTotal)}</td>
                  <td>
                    <span className={`badge ${b.status === 'paid' ? 'badge-confirmed' : 'badge-pending'}`}>
                      {b.status === 'paid' ? `Paid (${b.paymentMethod || 'Cash'})` : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-8">
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => setSelectedInvoice(b)}
                      >
                        <Printer size={13} />
                        <span>Print Invoice</span>
                      </button>

                      {b.status !== 'paid' && (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                            onClick={() => setActiveBillId(b.id)}
                            title="Add Room Service / Mini Bar / Extra"
                          >
                            <Plus size={13} /> Item
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                            onClick={() => handlePayBill(b.id)}
                          >
                            Mark Paid
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header no-print">
              <div className="flex items-center gap-8">
                <FileText size={20} className="text-brand" />
                <h3 className="section-title" style={{ margin: 0 }}>
                  Official Hotel Folio & Tax Invoice ({selectedInvoice.id})
                </h3>
              </div>
              <div className="flex items-center gap-8">
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Printer size={16} /> Print / PDF
                </button>
                <button className="btn btn-ghost btn-icon" onClick={() => setSelectedInvoice(null)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="modal-body invoice-print" style={{ padding: '32px' }}>
              {/* Hotel Header */}
              <div className="flex justify-between items-start mb-24 pb-16" style={{ borderBottom: '2px solid var(--border)' }}>
                <div>
                  <div className="flex items-center gap-8 mb-4">
                    <span style={{ fontSize: '28px' }}>🏨</span>
                    <h2 className="font-bold" style={{ fontSize: '22px', fontFamily: "'Playfair Display', serif" }}>
                      {hotelInfo.name}
                    </h2>
                  </div>
                  <p className="text-xs text-secondary">{hotelInfo.tagline}</p>
                  <p className="text-xs text-secondary mt-4">{hotelInfo.address}</p>
                  <p className="text-xs text-secondary">Tel: {hotelInfo.phone} • {hotelInfo.email}</p>
                  <p className="text-xs text-brand font-semibold mt-4">Tax Reg: {hotelInfo.taxRegNo}</p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="font-bold text-lg text-brand">TAX INVOICE</div>
                  <div className="text-sm font-semibold mt-4">Invoice #: {selectedInvoice.id}</div>
                  <div className="text-xs text-secondary">Date: {formatDateSL(selectedInvoice.date)}</div>
                  <div className="text-xs text-secondary">Booking Ref: {selectedInvoice.bookingId}</div>
                  <div className="mt-8">
                    <span className={`badge ${selectedInvoice.status === 'paid' ? 'badge-confirmed' : 'badge-pending'}`}>
                      {selectedInvoice.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guest & Room Info */}
              <div className="grid-2 mb-24 card-sm" style={{ background: 'var(--bg-surface)' }}>
                <div>
                  <span className="text-xs text-muted text-uppercase">Billed To:</span>
                  <div className="font-bold text-primary">{selectedInvoice.guestName}</div>
                </div>
                <div>
                  <span className="text-xs text-muted text-uppercase">Accommodation:</span>
                  <div className="font-bold text-primary">Room {selectedInvoice.roomNumber}</div>
                </div>
              </div>

              {/* Line Items */}
              <div className="table-wrapper mb-20">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Amount (LKR)</th>
                      {currency === 'USD' && <th style={{ textAlign: 'right' }}>Amount (USD)</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.description}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.amount, 'LKR')}</td>
                        {currency === 'USD' && (
                          <td style={{ textAlign: 'right' }}>{formatCurrency(item.amount / usdRate, 'USD')}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sri Lankan Statutory Taxes Breakdown */}
              <div className="tax-box">
                <div className="tax-row sub">
                  <span>Subtotal Net</span>
                  <span>{convertPrice(selectedInvoice.subtotal)}</span>
                </div>
                <div className="tax-row sub">
                  <span>10% Service Charge (SC)</span>
                  <span>{convertPrice(selectedInvoice.serviceCharge)}</span>
                </div>
                <div className="tax-row sub">
                  <span>18% Value Added Tax (VAT)</span>
                  <span>{convertPrice(selectedInvoice.vat)}</span>
                </div>
                <div className="tax-row sub">
                  <span>2.5% Social Security Contribution Levy (SSCL)</span>
                  <span>{convertPrice(selectedInvoice.sscl)}</span>
                </div>
                <div className="tax-row divider total">
                  <span>Grand Total Payable</span>
                  <span>{convertPrice(selectedInvoice.grandTotal)}</span>
                </div>
                {currency === 'USD' && (
                  <div className="text-xs text-muted mt-4" style={{ textAlign: 'right' }}>
                    Converted at 1 USD = LKR {usdRate}
                  </div>
                )}
              </div>

              <div className="mt-24 text-xs text-secondary" style={{ textAlign: 'center' }}>
                <p>Thank you for staying at {hotelInfo.name}! ස්තූතියි • Ayubowan 🌸</p>
                <p className="mt-4 text-muted">This is a computer-generated tax invoice valid under Sri Lankan Inland Revenue Act.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {activeBillId && (
        <div className="modal-overlay" onClick={() => setActiveBillId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="section-title" style={{ margin: 0 }}>Add Charge to Invoice ({activeBillId})</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setActiveBillId(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit}>
              <div className="modal-body flex-col gap-16">
                <div className="form-group">
                  <label className="form-label required">Description</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Airport Transfer, King Coconut Bar, Sri Lankan Dinner Buffet..."
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Amount in LKR</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 5000"
                    value={itemAmount}
                    onChange={(e) => setItemAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setActiveBillId(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Item & Recompute Taxes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
