import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Receipt, Search, Download } from 'lucide-react';
import { getBills, markPaid, getInvoice } from '../../api/billingApi';
import { fmtDate, fmtLKR, paymentStatusBadge } from '../../utils/formatters';
import Badge from '../../components/ui/Badge';
import { LoadingState, EmptyState } from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

export default function BillingPage() {
  const [bills, setBills]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState('');

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBills({ page, limit: 10, status });
      setBills(res.data.data);
      setTotal(res.data.pagination.total);
    } catch {
      toast.error('Failed to load billing records');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const handlePay = async (bill) => {
    if (!window.confirm(`Mark Bill ${bill.invoiceNumber} as Paid?`)) return;
    try {
      await markPaid(bill._id, { method: 'credit_card', amount: bill.grandTotalLKR });
      toast.success('Payment recorded successfully.');
      fetchBills();
    } catch {
      toast.error('Failed to record payment.');
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await getInvoice(id);
      console.log('Invoice data ready for PDF generation:', res.data.data);
      toast.success('Invoice fetched. (PDF generation pending)');
    } catch {
      toast.error('Failed to generate invoice.');
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
                  <th>Booking Ref</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Taxes</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div className="font-semibold text-gold">{b.invoiceNumber}</div>
                    </td>
                    <td>
                      <div className="font-semibold">{b.bookingId?.bookingReference}</div>
                    </td>
                    <td>{fmtDate(b.createdAt)}</td>
                    <td>
                      <Badge variant="neutral">{b.lineItems?.length || 0} items</Badge>
                    </td>
                    <td>
                      <div className="text-sm">VAT: {fmtLKR(b.taxes?.VAT)}</div>
                      <div className="text-xs text-muted">SC: {fmtLKR(b.taxes?.ServiceCharge)}</div>
                    </td>
                    <td>
                      <div className="font-bold text-success">{fmtLKR(b.grandTotalLKR)}</div>
                      {b.currency === 'USD' && (
                        <div className="text-xs text-muted">≈ ${b.grandTotalUSD?.toFixed(2)} USD</div>
                      )}
                    </td>
                    <td>
                      <Badge variant={paymentStatusBadge(b.paymentStatus)} dot>
                        {b.paymentStatus}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {b.paymentStatus === 'pending' && (
                          <button className="btn btn-sm btn-primary" onClick={() => handlePay(b)}>
                            Pay Now
                          </button>
                        )}
                        <button className="btn btn-sm btn-secondary" onClick={() => handleDownload(b._id)}>
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
}
