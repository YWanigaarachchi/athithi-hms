import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { SL_SEASONS } from '../constants/sriLanka';
import { Settings as SettingsIcon, Save, DollarSign, Percent, Hotel, Calendar, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { hotelInfo, setHotelInfo, taxRates, setTaxRates, usdRate, setUsdRate } = useHotel();

  const [formHotel, setFormHotel] = useState({ ...hotelInfo });
  const [vat, setVat] = useState((taxRates.VAT * 100).toString());
  const [sscl, setSscl] = useState((taxRates.SSCL * 100).toString());
  const [serviceCharge, setServiceCharge] = useState((taxRates.SERVICE_CHARGE * 100).toString());
  const [exchangeRate, setExchangeRate] = useState(usdRate.toString());

  const handleSaveAll = (e) => {
    e.preventDefault();

    setHotelInfo(formHotel);
    setTaxRates({
      VAT: Number(vat) / 100,
      SSCL: Number(sscl) / 100,
      SERVICE_CHARGE: Number(serviceCharge) / 100,
    });
    setUsdRate(Number(exchangeRate));

    toast.success('Settings & Tax configurations saved successfully!');
  };

  return (
    <div className="fade-in-up flex-col gap-24">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-12 mb-8">
        <div>
          <h1 className="page-title">System Settings & Configuration</h1>
          <p className="page-desc">Hotel profile, Sri Lankan tax rates, currency exchange, and seasonal calendars</p>
        </div>
        <button className="btn btn-primary" onClick={handleSaveAll}>
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="flex-col gap-24">
        {/* Hotel Profile */}
        <div className="card">
          <div className="flex items-center gap-8 mb-16">
            <Hotel size={20} className="text-brand" />
            <h2 className="section-title" style={{ margin: 0 }}>Resort Profile & Contact Info</h2>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label required">Property Name</label>
              <input
                className="form-input"
                value={formHotel.name}
                onChange={(e) => setFormHotel({ ...formHotel, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input
                className="form-input"
                value={formHotel.tagline}
                onChange={(e) => setFormHotel({ ...formHotel, tagline: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group mt-16">
            <label className="form-label">Physical Address</label>
            <input
              className="form-input"
              value={formHotel.address}
              onChange={(e) => setFormHotel({ ...formHotel, address: e.target.value })}
            />
          </div>

          <div className="grid-3 mt-16">
            <div className="form-group">
              <label className="form-label">Contact Phone(s)</label>
              <input
                className="form-input"
                value={formHotel.phone}
                onChange={(e) => setFormHotel({ ...formHotel, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reservations Email</label>
              <input
                className="form-input"
                value={formHotel.email}
                onChange={(e) => setFormHotel({ ...formHotel, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tax / VAT Registration No</label>
              <input
                className="form-input"
                value={formHotel.taxRegNo}
                onChange={(e) => setFormHotel({ ...formHotel, taxRegNo: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Sri Lankan Statutory Taxes & Exchange Rate */}
        <div className="grid-2">
          <div className="card">
            <div className="flex items-center gap-8 mb-16">
              <Percent size={20} className="text-brand" />
              <h2 className="section-title" style={{ margin: 0 }}>Sri Lankan Tax Rates (%)</h2>
            </div>

            <div className="flex-col gap-16">
              <div className="form-group">
                <label className="form-label">Value Added Tax (VAT %)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={vat}
                  onChange={(e) => setVat(e.target.value)}
                />
                <span className="form-hint">Standard Sri Lankan Inland Revenue rate is currently 18.0%.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Social Security Contribution Levy (SSCL %)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={sscl}
                  onChange={(e) => setSscl(e.target.value)}
                />
                <span className="form-hint">SSCL statutory rate is 2.5% on turnover.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Service Charge (SC %)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={serviceCharge}
                  onChange={(e) => setServiceCharge(e.target.value)}
                />
                <span className="form-hint">Mandatory 10.0% hotel hospitality service charge.</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-8 mb-16">
              <DollarSign size={20} className="text-brand" />
              <h2 className="section-title" style={{ margin: 0 }}>Currency & Exchange Rates</h2>
            </div>

            <div className="form-group">
              <label className="form-label">USD to LKR Exchange Rate</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
              />
              <span className="form-hint">
                Used for instant currency conversion on topbar, bookings, and invoices.
              </span>
            </div>

            <div
              className="card-sm mt-20"
              style={{ background: 'var(--bg-surface)' }}
            >
              <div className="font-semibold text-sm mb-4">Sample Conversion:</div>
              <div className="text-sm text-secondary">
                $100.00 USD = <b className="text-brand">LKR {(100 * Number(exchangeRate || 0)).toLocaleString()}</b>
              </div>
            </div>
          </div>
        </div>

        {/* Sri Lankan Seasonal Calendar Overview */}
        <div className="card">
          <div className="flex items-center gap-8 mb-16">
            <Calendar size={20} className="text-brand" />
            <h2 className="section-title" style={{ margin: 0 }}>Sri Lankan Peak Season Calendar</h2>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Season Name</th>
                  <th>Dates</th>
                  <th>Multiplier</th>
                  <th>Category</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {SL_SEASONS.map((s, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="font-semibold">
                        {s.emoji} {s.name}
                      </span>
                    </td>
                    <td className="text-sm">
                      Month {s.startMonth}/{s.startDay} → Month {s.endMonth}/{s.endDay}
                    </td>
                    <td>
                      <span className="badge badge-pending font-bold">{s.multiplier}x</span>
                    </td>
                    <td>
                      <span className={`badge ${s.type === 'peak' ? 'badge-cancelled' : 'badge-maintenance'}`}>
                        {s.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-xs text-secondary">{s.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </div>
  );
}
