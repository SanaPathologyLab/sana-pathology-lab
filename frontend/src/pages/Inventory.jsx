import React, { useEffect, useState, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { Plus, Pencil, Trash2, X, Package, AlertTriangle, Calendar, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const API = '/api';

const CATEGORIES = ['Test Tubes', 'Reagents', 'Chemicals', 'Kits', 'Consumables', 'Equipment', 'PPE', 'Other'];

const Inventory = () => {
  const { user } = useContext(AuthContext);
  const headers = { 'Authorization': `Bearer ${user?.accessToken}`, 'Content-Type': 'application/json' };

  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('ALL');
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [form, setForm] = useState({
    itemName: '', category: 'Reagents', currentStock: '', lowStockAlert: '10',
    expiryDate: '', supplierName: '', supplierPhone: '', supplierEmail: '', unitPrice: '', unit: '',
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/inventory`, { headers });
      setItems(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openAdd = () => {
    setForm({ itemName: '', category: 'Reagents', currentStock: '', lowStockAlert: '10', expiryDate: '', supplierName: '', supplierPhone: '', supplierEmail: '', unitPrice: '', unit: '' });
    setEditItem(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({
      itemName: item.itemName, category: item.category,
      currentStock: item.currentStock, lowStockAlert: item.lowStockAlert,
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      supplierName: item.supplierName || '', supplierPhone: item.supplierPhone || '',
      supplierEmail: item.supplierEmail || '', unitPrice: item.unitPrice || '', unit: item.unit || '',
    });
    setEditItem(item);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editItem ? 'PUT' : 'POST';
    const url = editItem ? `${API}/inventory/${editItem.id}` : `${API}/inventory`;
    await fetch(url, { method, headers, body: JSON.stringify(form) });
    setShowModal(false);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    await fetch(`${API}/inventory/${id}`, { method: 'DELETE', headers });
    fetchItems();
  };

  let filtered = filterCat === 'ALL' ? items : items.filter(i => i.category === filterCat);
  if (showLowOnly) filtered = filtered.filter(i => i.currentStock <= i.lowStockAlert);

  const exportToExcel = () => {
    const dataToExport = filtered.map(i => ({
      'Item Name': i.itemName,
      'Category': i.category,
      'Current Stock': i.currentStock,
      'Low Stock Alert': i.lowStockAlert,
      'Expiry Date': i.expiryDate ? new Date(i.expiryDate).toLocaleDateString('en-IN') : 'N/A',
      'Supplier Name': i.supplierName || 'N/A',
      'Unit Price': i.unitPrice || 'N/A'
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    XLSX.writeFile(workbook, `Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const lowStockItems = items.filter(i => i.currentStock <= i.lowStockAlert);
  const expiringItems = items.filter(i => {
    if (!i.expiryDate) return false;
    const days = (new Date(i.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
    return days <= 30 && days >= 0;
  });

  const getStockStatus = (item) => {
    if (item.currentStock <= 0) return { label: 'OUT', color: 'bg-red-100 text-red-800' };
    if (item.currentStock <= item.lowStockAlert) return { label: 'LOW', color: 'bg-orange-100 text-orange-800' };
    return { label: 'OK', color: 'bg-green-100 text-green-800' };
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#00488d] uppercase tracking-wide">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} items tracked</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-bold text-sm transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-[#00488d] hover:bg-blue-800 text-white px-5 py-2 rounded font-bold text-sm transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Alert Cards */}
      {(lowStockItems.length > 0 || expiringItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {lowStockItems.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-orange-800 text-sm">{lowStockItems.length} Low Stock Alert{lowStockItems.length > 1 ? 's' : ''}</p>
                <p className="text-xs text-orange-600">{lowStockItems.map(i => i.itemName).join(', ')}</p>
              </div>
            </div>
          )}
          {expiringItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-800 text-sm">{expiringItems.length} Expiring Within 30 Days</p>
                <p className="text-xs text-red-600">{expiringItems.map(i => i.itemName).join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5 items-center">
        <button onClick={() => { setFilterCat('ALL'); setShowLowOnly(false); }}
          className={`px-3 py-1.5 rounded text-xs font-bold uppercase ${filterCat === 'ALL' && !showLowOnly ? 'bg-[#00488d] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
          All
        </button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => { setFilterCat(c); setShowLowOnly(false); }}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase ${filterCat === c && !showLowOnly ? 'bg-[#00488d] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#00488d]'}`}>
            {c}
          </button>
        ))}
        <button onClick={() => { setShowLowOnly(!showLowOnly); setFilterCat('ALL'); }}
          className={`px-3 py-1.5 rounded text-xs font-bold uppercase ${showLowOnly ? 'bg-orange-500 text-white' : 'bg-white border border-orange-300 text-orange-600'}`}>
          ⚠ Low Stock
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#00488d] border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Item Name', 'Category', 'Stock', 'Alert At', 'Status', 'Expiry', 'Supplier', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  No items found
                </td></tr>
              ) : filtered.map(item => {
                const status = getStockStatus(item);
                const isExpiring = item.expiryDate && (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) <= 30;
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{item.itemName} {item.unit && <span className="text-xs text-gray-400">/{item.unit}</span>}</td>
                    <td className="px-4 py-3 text-gray-600">{item.category}</td>
                    <td className="px-4 py-3 font-bold text-gray-800">{item.currentStock}</td>
                    <td className="px-4 py-3 text-gray-500">{item.lowStockAlert}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded ${status.color}`}>{status.label}</span></td>
                    <td className={`px-4 py-3 text-xs ${isExpiring ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN') : '—'}
                      {isExpiring && ' ⚠'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{item.supplierName || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-[#00488d]"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-[#00488d]">{editItem ? 'Edit Item' : 'Add Inventory Item'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Item Name *', field: 'itemName', required: true },
                  { label: 'Unit (Box/Vial/Pack)', field: 'unit' },
                  { label: 'Current Stock *', field: 'currentStock', type: 'number', required: true },
                  { label: 'Low Stock Alert *', field: 'lowStockAlert', type: 'number', required: true },
                  { label: 'Unit Price (₹)', field: 'unitPrice', type: 'number' },
                  { label: 'Expiry Date', field: 'expiryDate', type: 'date' },
                  { label: 'Supplier Name', field: 'supplierName' },
                  { label: 'Supplier Phone', field: 'supplierPhone' },
                  { label: 'Supplier Email', field: 'supplierEmail' },
                ].map(f => (
                  <div key={f.field} className={f.fullWidth ? 'md:col-span-2' : ''}>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{f.label}</label>
                    <input required={f.required} type={f.type || 'text'} value={form[f.field] || ''}
                      onChange={e => setForm(p => ({ ...p, [f.field]: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category *</label>
                  <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 border border-gray-300 rounded text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#00488d] text-white rounded text-sm font-bold hover:bg-blue-800">
                  {editItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Inventory;
