import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { Search, IndianRupee, CreditCard, Receipt, TrendingUp, Wallet, QrCode, CheckCircle2, X, Tag, Percent } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const Billing = () => {
  const { user } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [isProcessing, setIsProcessing] = useState(false);

  // Discount state
  const [discountBy, setDiscountBy] = useState('');
  const [discountType, setDiscountType] = useState('PERCENT');
  const [discountValue, setDiscountValue] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices', {
        headers: { 'Authorization': `Bearer ${user?.token || user?.accessToken}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setInvoices(data);
    } catch (err) { console.error(err); }
  };

  const handlePayClick = (inv) => {
    setSelectedInvoice(inv);
    setPaymentMethod('CASH');
    setDiscountBy('');
    setDiscountType('PERCENT');
    setDiscountValue('');
    setDiscountApplied(inv.discount > 0);
    setIsPaymentModalOpen(true);
  };

  const handleApplyDiscount = async () => {
    if (!discountValue || parseFloat(discountValue) <= 0) return;
    setIsApplyingDiscount(true);
    try {
      const res = await fetch(`/api/invoices/${selectedInvoice.id}/discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token || user?.accessToken}` },
        body: JSON.stringify({ discountType, discountValue: parseFloat(discountValue), discountBy })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedInvoice(prev => ({ ...prev, ...updated }));
        setDiscountApplied(true);
        setInvoices(prev => prev.map(inv => inv.id === updated.id ? { ...inv, ...updated } : inv));
      }
    } catch (err) { console.error(err); }
    finally { setIsApplyingDiscount(false); }
  };

  const handleRemoveDiscount = async () => {
    setIsApplyingDiscount(true);
    try {
      const res = await fetch(`/api/invoices/${selectedInvoice.id}/discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token || user?.accessToken}` },
        body: JSON.stringify({ discountType: 'FIXED', discountValue: 0 })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedInvoice(prev => ({ ...prev, ...updated }));
        setDiscountApplied(false);
        setDiscountValue('');
        setDiscountBy('');
      }
    } catch (err) { console.error(err); }
    finally { setIsApplyingDiscount(false); }
  };

  const handleProcessPayment = async () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/invoices/${selectedInvoice.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token || user?.accessToken}` },
        body: JSON.stringify({ amount: selectedInvoice.finalAmount, paymentMethod })
      });
      if (res.ok) { setIsPaymentModalOpen(false); fetchInvoices(); }
      else alert('Payment failed to process');
    } catch (err) { console.error(err); }
    finally { setIsProcessing(false); }
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.patient?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const discountAmt = selectedInvoice ? (selectedInvoice.totalAmount - selectedInvoice.finalAmount) : 0;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Billing &amp; Payments</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage pending payments and generate receipts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-teal-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-teal-100 mb-2">Total Collected</h3>
            <p className="text-4xl font-bold flex items-center"><IndianRupee className="w-8 h-8 mr-1" />
              {invoices.filter(i => i.paymentStatus === 'PAID').reduce((a, b) => a + b.finalAmount, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm"><TrendingUp className="w-10 h-10" /></div>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-lg shadow-red-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-orange-100 mb-2">Pending Dues</h3>
            <p className="text-4xl font-bold flex items-center"><IndianRupee className="w-8 h-8 mr-1" />
              {invoices.filter(i => i.paymentStatus === 'UNPAID').reduce((a, b) => a + b.finalAmount, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm"><CreditCard className="w-10 h-10" /></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-96 shadow-sm rounded-xl">
            <input type="text" placeholder="Search invoices by ID or Patient Name..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Invoice No.', 'Patient', 'Amount', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.length > 0 ? filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-blue-600">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{inv.patient?.fullName}</p>
                    <p className="text-xs text-slate-500">{inv.patient?.mobileNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">₹{inv.finalAmount}</p>
                    {inv.discount > 0 && <p className="text-xs text-green-600 font-medium">-₹{inv.discount} discount</p>}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {inv.paymentStatus === 'PAID'
                      ? <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">PAID</span>
                      : <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">PENDING</span>}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                    {inv.paymentStatus !== 'PAID' && (
                      <button onClick={() => handlePayClick(inv)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors">
                        Collect Payment
                      </button>
                    )}
                    <button className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center">
                      <Receipt className="w-4 h-4 mr-1.5" /> Receipt
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <Receipt className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium text-lg">No invoices found</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col" style={{ maxHeight: '92vh', overflowY: 'auto' }}>

            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" /> Process Payment
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Amount Summary */}
              <div className="text-center">
                <p className="font-bold text-slate-800 text-base">{selectedInvoice.patient?.fullName}</p>
                <p className="text-xs text-slate-400 mt-0.5">Invoice: {selectedInvoice.invoiceNumber}</p>
                <div className="mt-3 bg-slate-50 rounded-2xl p-4 text-sm">
                  <div className="flex justify-between text-slate-500 mb-1">
                    <span>Total Amount</span>
                    <span className="font-bold text-slate-700">₹{selectedInvoice.totalAmount}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-green-600 mb-1">
                      <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Discount</span>
                      <span className="font-bold">- ₹{discountAmt.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-1">
                    <span className="font-bold text-slate-800">Final Amount</span>
                    <span className="text-3xl font-black text-slate-900">₹{selectedInvoice.finalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Discount Section */}
              <div className="border border-dashed border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Apply Discount
                </p>
                {discountApplied ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <span className="text-sm font-bold text-green-700">✓ Discount: -₹{discountAmt.toFixed(2)}</span>
                    <button onClick={handleRemoveDiscount} className="text-xs text-red-500 hover:text-red-700 font-bold ml-3">Remove</button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {[['DOCTOR', '🩺 Referral Doctor', 'purple'], ['LAB', '🏥 Laboratory', 'orange']].map(([val, label, color]) => (
                        <button key={val} onClick={() => setDiscountBy(val)}
                          className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                            discountBy === val
                              ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                              : 'border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                          style={discountBy === val ? { borderColor: color === 'purple' ? '#a855f7' : '#f97316', background: color === 'purple' ? '#faf5ff' : '#fff7ed', color: color === 'purple' ? '#7e22ce' : '#c2410c' } : {}}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {discountBy && (
                      <div className="space-y-2">
                        <div className="flex bg-slate-100 rounded-lg p-0.5">
                          <button onClick={() => setDiscountType('PERCENT')}
                            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${discountType === 'PERCENT' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>
                            <Percent className="w-3 h-3 inline mr-1" /> Percentage (%)
                          </button>
                          <button onClick={() => setDiscountType('FIXED')}
                            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${discountType === 'FIXED' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>
                            <IndianRupee className="w-3 h-3 inline mr-1" /> Fixed (₹)
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input type="number" min="0" max={discountType === 'PERCENT' ? '100' : selectedInvoice.totalAmount}
                            step="0.5" value={discountValue} onChange={e => setDiscountValue(e.target.value)}
                            placeholder={discountType === 'PERCENT' ? 'e.g. 10' : 'e.g. 100'}
                            className="flex-1 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium"
                          />
                          <button onClick={handleApplyDiscount} disabled={isApplyingDiscount || !discountValue}
                            className="bg-[#00488d] hover:bg-blue-800 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap">
                            {isApplyingDiscount ? '...' : 'Apply'}
                          </button>
                        </div>
                        {discountValue && (
                          <p className="text-xs text-slate-400 text-center">
                            Saves ₹{discountType === 'PERCENT'
                              ? ((selectedInvoice.totalAmount * parseFloat(discountValue || 0)) / 100).toFixed(2)
                              : parseFloat(discountValue || 0).toFixed(2)
                            } → Pay ₹{Math.max(0, selectedInvoice.totalAmount - (discountType === 'PERCENT'
                              ? (selectedInvoice.totalAmount * parseFloat(discountValue || 0)) / 100
                              : parseFloat(discountValue || 0))).toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                {[['CASH', <IndianRupee className="w-5 h-5" />, 'Cash'], ['UPI', <QrCode className="w-5 h-5" />, 'UPI / QR']].map(([val, icon, label]) => (
                  <button key={val} onClick={() => setPaymentMethod(val)}
                    className={`py-3 px-4 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === val ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}>
                    {icon} {label}
                  </button>
                ))}
              </div>

              {/* UPI QR */}
              {paymentMethod === 'UPI' && (
                <div className="flex flex-col items-center p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <p className="text-sm font-bold text-blue-800 mb-4 text-center">
                    Scan with any UPI App<br />
                    <span className="text-xs font-medium text-blue-600">(Google Pay, PhonePe, Paytm)</span>
                  </p>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                    <QRCodeSVG
                      value={`upi://pay?pa=sanapathologylab@axl&pn=SanaPathologyLab&am=${selectedInvoice.finalAmount}&cu=INR`}
                      size={180} level="H" includeMargin={true}
                    />
                  </div>
                  <p className="text-xs font-mono font-medium text-slate-500 mt-3 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
                    sanapathologylab@axl
                  </p>
                  <p className="text-sm font-bold text-blue-700 mt-1">Amount: ₹{selectedInvoice.finalAmount}</p>
                </div>
              )}

              {/* Confirm Button */}
              <button onClick={handleProcessPayment} disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-lg shadow-slate-900/20">
                {isProcessing
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><CheckCircle2 className="w-5 h-5" /> Mark as Paid ({paymentMethod})</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Billing;
