import React, { useState, useEffect, useContext, useCallback } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import {
  Package, Plus, Trash2, Edit2, X, Search, Check, ChevronDown, ChevronUp,
  Tag, IndianRupee, FlaskConical, ToggleLeft, ToggleRight, AlertCircle
} from 'lucide-react';

const EMPTY_FORM = { name: '', code: '', description: '', price: '', isActive: true };

const Packages = () => {
  const { user } = useContext(AuthContext);
  const headers = { 'Authorization': `Bearer ${user?.accessToken}`, 'Content-Type': 'application/json' };

  const [packages, setPackages] = useState([]);
  const [allTests, setAllTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPkg, setExpandedPkg] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [testSearch, setTestSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/packages', { headers });
      const data = await res.json();
      if (Array.isArray(data)) setPackages(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  const fetchTests = useCallback(async () => {
    try {
      const res = await fetch('/api/tests', { headers });
      const data = await res.json();
      if (Array.isArray(data)) setAllTests(data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchPackages();
    fetchTests();
  }, [fetchPackages, fetchTests]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSelectedTestIds([]);
    setTestSearch('');
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (pkg) => {
    setEditingId(pkg.id);
    setForm({ name: pkg.name, code: pkg.code, description: pkg.description || '', price: pkg.price, isActive: pkg.isActive });
    setSelectedTestIds(pkg.items.map(it => it.testId));
    setTestSearch('');
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setError(''); };

  const toggleTest = (testId) => {
    setSelectedTestIds(prev =>
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };

  // Auto-calc recommended price (sum of selected tests) for reference
  const recommendedPrice = allTests
    .filter(t => selectedTestIds.includes(t.id))
    .reduce((sum, t) => sum + t.price, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTestIds.length === 0) { setError('Please select at least one test.'); return; }
    setSaving(true); setError('');
    try {
      const url = editingId ? `/api/packages/${editingId}` : '/api/packages';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({ ...form, price: parseFloat(form.price), testIds: selectedTestIds }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to save package'); return; }
      closeModal();
      fetchPackages();
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete package "${name}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/packages/${id}`, { method: 'DELETE', headers });
      fetchPackages();
    } catch (err) { console.error(err); }
  };

  const handleToggleActive = async (pkg) => {
    try {
      await fetch(`/api/packages/${pkg.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ isActive: !pkg.isActive }),
      });
      fetchPackages();
    } catch (err) { console.error(err); }
  };

  const filteredPackages = packages.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTests = allTests.filter(t =>
    t.testName.toLowerCase().includes(testSearch.toLowerCase()) ||
    t.testCode.toLowerCase().includes(testSearch.toLowerCase())
  );

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#00488d] uppercase tracking-wide flex items-center gap-2">
            <Package className="w-6 h-6" /> Health Checkup Packages
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Bundle multiple tests into packages with combo pricing — {packages.length} packages configured
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#00488d] hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Package
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search packages by name or code..."
          className="flex-1 text-sm focus:outline-none"
        />
        <span className="text-xs text-gray-400 font-medium">{filteredPackages.length} found</span>
      </div>

      {/* Package Cards */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-[#00488d] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No packages yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first health checkup package to bundle tests together</p>
          <button onClick={openAdd} className="mt-4 bg-[#00488d] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors">
            <Plus className="w-4 h-4 inline mr-1" /> Create Package
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPackages.map(pkg => {
            const isExpanded = expandedPkg === pkg.id;
            const totalTestsPrice = pkg.items.reduce((s, it) => s + (it.test?.price || 0), 0);
            const savings = totalTestsPrice - pkg.price;
            return (
              <div key={pkg.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${pkg.isActive ? 'border-gray-200' : 'border-gray-100 opacity-70'}`}>
                {/* Card Header */}
                <div className="px-5 py-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-slate-800 truncate">{pkg.name}</h3>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-[#00488d]/10 text-[#00488d] rounded-full font-mono">{pkg.code}</span>
                      {!pkg.isActive && <span className="text-[10px] font-black px-2 py-0.5 bg-red-100 text-red-600 rounded-full">INACTIVE</span>}
                    </div>
                    {pkg.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{pkg.description}</p>}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4 text-[#085041]" />
                        <span className="text-lg font-black text-[#085041]">{pkg.price}</span>
                        {savings > 0 && (
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1">
                            Save ₹{savings}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                        <FlaskConical className="w-3.5 h-3.5" />
                        {pkg.items.length} tests
                        {totalTestsPrice > 0 && (
                          <span className="line-through text-gray-300 ml-1">₹{totalTestsPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleActive(pkg)}
                      className={`p-1.5 rounded-lg transition-colors ${pkg.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      title={pkg.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {pkg.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button onClick={() => openEdit(pkg)} className="p-1.5 rounded-lg text-[#00488d] hover:bg-blue-50 transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(pkg.id, pkg.name)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expand/Collapse Tests */}
                <button
                  onClick={() => setExpandedPkg(isExpanded ? null : pkg.id)}
                  className="w-full px-5 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <span>View included tests</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex flex-wrap gap-2">
                      {pkg.items.map(it => (
                        <div key={it.id} className="flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-full text-xs font-medium text-gray-700">
                          <Tag className="w-3 h-3 text-[#00488d]" />
                          {it.test?.testName || 'Unknown'}
                          <span className="text-gray-400">₹{it.test?.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 shrink-0">
              <h2 className="text-lg font-extrabold text-[#00488d]">
                {editingId ? 'Edit Package' : 'New Health Checkup Package'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Package Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Package Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="e.g. Full Body Checkup"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Package Code *</label>
                  <input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                    placeholder="e.g. PKG-FULL"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#00488d]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Package Price (₹) *
                    {recommendedPrice > 0 && (
                      <span className="ml-2 text-amber-600 font-normal normal-case">
                        (Individual total: ₹{recommendedPrice})
                      </span>
                    )}
                  </label>
                  <input required type="number" min="0" step="0.01" value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    rows={2} placeholder="Brief description of what this package covers..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00488d] resize-none" />
                </div>
              </div>

              {/* Test Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                  Select Tests *
                  {selectedTestIds.length > 0 && (
                    <span className="ml-2 bg-[#00488d] text-white px-2 py-0.5 rounded-full font-bold normal-case text-[10px]">
                      {selectedTestIds.length} selected
                    </span>
                  )}
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={testSearch}
                    onChange={e => setTestSearch(e.target.value)}
                    placeholder="Filter tests..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00488d]"
                  />
                </div>
                <div className="border border-gray-200 rounded-lg h-52 overflow-y-auto divide-y divide-gray-50">
                  {filteredTests.map(t => {
                    const isSelected = selectedTestIds.includes(t.id);
                    return (
                      <label key={t.id}
                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors select-none ${isSelected ? 'bg-[#00488d]/5' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#00488d] border-[#00488d]' : 'border-gray-300'}`}
                          onClick={() => toggleTest(t.id)}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <input type="checkbox" className="sr-only" checked={isSelected} onChange={() => toggleTest(t.id)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{t.testName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{t.testCode} · {t.category?.name}</p>
                        </div>
                        <span className="text-xs font-bold text-[#085041] shrink-0">₹{t.price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 bg-[#00488d] text-white rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors disabled:opacity-60">
                  {saving ? 'Saving...' : editingId ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Packages;
