import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Receipt, Search, Download, Eye, CreditCard } from 'lucide-react';
import { getBills, markPaid, getInvoice } from '../../api/billingApi';
import { fmtDate, fmtLKR, paymentStatusBadge } from '../../utils/formatters';
import Badge from '../../components/ui/Badge';
import { LoadingState, EmptyState } from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import InvoiceModal from './InvoiceModal';
import toast from 'react-hot-toast';

export default function BillingPage() {
  const [bills, setBills]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState('');
  const [search, setSearch]     = useState('');

  // Selected bill for Invoice Modal
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBills({ page, limit: 10, status, search });
      setBills(res.data.data || []);
      setTotal(res.data.pagination?.total || res.data.total || 0);
    } catch {
      toast.error('Failed to load billing records');
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const handleOpenInvoice = (bill) => {
    setSelectedBill(bill);
  };

  const handlePay = async (bill) => {
    if (!window.confirm(`Mark Bill ${bill.invoiceNumber || 'Folio'} as Paid?`)) return;
    try {
      await markPaid(bill._id, { method: 'card', amount: bill.totalLKR || bill.grandTotalLKR });
      toast.success('Payment recorded successfully.');
      fetchBills();
    } catch {
      toast.error('Failed to record payment.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Billing & Invoices</h1>
          <p>Manage guest folios, payments, and statutory tax invoices</p>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-filters">
            <div className="search-input-wrapper">
              <Search size={14} />
              <input
                className="form-input search-input"
                placeholder="Search by invoice or guest..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <select
              className="form-select"
              style={{ width: '180px' }}
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Payment Statuses</option>
              {['pending', 'paid', 'partially-paid', 'refunded'].map((s) => (
                <option key={s} value={s}>{s.replace('-', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="text-muted text-sm">{total} total bills</div>
        </div>

        {loading ? (
          <LoadingState message="Loading financial records..." />
        ) : bills.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No bills found"
            description="No billing records match your current filters."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Booking Ref / Guest</th>
                  <th>Date</th>
                  <th>Line Items</th>
                  <th>Sri Lankan Taxes</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => {
                  const grandTotal = b.totalLKR ?? b.grandTotalLKR ?? 0;
                  const vatAmount = b.vat ?? b.taxes?.VAT ?? 0;
                  const scAmount = b.serviceCharge ?? b.taxes?.ServiceCharge ?? 0;

                  return (
                    <tr key={b._id}>
                      <td>
                        <div className="font-semibold text-gold">
                          {b.invoiceNumber || `INV-${b._id?.slice(-6).toUpperCase()}`}
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold">
                          {b.bookingId?.bookingReference || (b.guestId ? `${b.guestId.firstName} ${b.guestId.lastName}` : 'Direct')}
                        </div>
                        {b.guestId && b.bookingId?.bookingReference && (
                          <div className="text-xs text-muted">
                            {b.guestId.firstName} {b.guestId.lastName}
                          </div>
                        )}
                      </td>
                      <td>{fmtDate(b.createdAt || b.issuedAt)}</td>
                      <td>
                        <Badge variant="neutral">{b.lineItems?.length || 0} items</Badge>
                      </td>
                      <td>
                        <div className="text-sm font-medium">VAT (18%): {fmtLKR(vatAmount)}</div>
                        <div className="text-xs text-muted">SC (10%): {fmtLKR(scAmount)}</div>
                      </td>
                      <td>
                        <div className="font-bold text-gold" style={{ fontSize: '1rem' }}>
                          {fmtLKR(grandTotal)}
                        </div>
                        {b.currency === 'USD' && (
                          <div className="text-xs text-muted">≈ ${((b.totalUSD || b.grandTotalUSD) || grandTotal / 320).toFixed(2)} USD</div>
                        )}
                      </td>
                      <td>
                        <Badge variant={paymentStatusBadge(b.paymentStatus)} dot>
                          {b.paymentStatus}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleOpenInvoice(b)}
                            title="View / Print Tax Invoice"
                          >
                            <Eye size={13} style={{ display: 'inline', marginRight: 4 }} /> View Invoice
                          </button>
                          {b.paymentStatus !== 'paid' && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handlePay(b)}
                            >
                              <CreditCard size={13} style={{ display: 'inline', marginRight: 4 }} /> Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        <Pagination
          page={page}
          limit={10}
          total={total}
          pages={Math.ceil(total / 10)}
          onPage={setPage}
        />
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={!!selectedBill}
        bill={selectedBill}
        onClose={() => setSelectedBill(null)}
        onUpdated={() => {
          fetchBills();
          setSelectedBill(null);
        }}
      />
    </div>
  );
}
