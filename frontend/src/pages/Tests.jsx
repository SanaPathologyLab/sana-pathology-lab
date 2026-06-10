import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { Plus, Search, Tag, Edit2, Trash2, ExternalLink, X } from 'lucide-react';

const Tests = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    testName: '', testCode: '', sampleType: 'Blood', price: '', categoryId: '', newCategoryName: '', summary: ''
  });
  const [parameters, setParameters] = useState([
    { parameterName: '', referenceRange: '', unit: '', groupName: '', isQualitative: false }
  ]);

  useEffect(() => {
    fetchTests();
    fetchCategories();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/tests', {
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setTests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/tests/categories', {
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addParameterRow = () => {
    setParameters([...parameters, { parameterName: '', referenceRange: '', unit: '', groupName: '', isQualitative: false }]);
  };

  const fillWidalPreset = () => {
    setFormData(prev => ({
      ...prev,
      testName: 'WIDAL TEST (Rapid Slid Method)',
      testCode: 'WIDAL',
      sampleType: 'BLOOD',
      price: '200',
      summary: 'Widal test is a serological test for detecting antibodies against Salmonella typhi and paratyphi. A titre of 1:80 or more for O antigen and 1:160 or more for H antigen is considered clinically significant.'
    }));
    // Auto-select Immunology category if it exists
    const immunoCat = categories.find(c => c.name === 'Immunology');
    if (immunoCat) setFormData(prev => ({ ...prev, categoryId: immunoCat.id }));
    setParameters([
      { parameterName: 'S. TYPHI O', referenceRange: '', unit: '', groupName: '', isQualitative: true, titerValues: '1/20,1/40,1/80,1/160,1/320' },
      { parameterName: 'S. TYPHI H', referenceRange: '', unit: '', groupName: '', isQualitative: true, titerValues: '1/20,1/40,1/80,1/160,1/320' },
      { parameterName: 'S. PARA TYPHI A (H)', referenceRange: '', unit: '', groupName: '', isQualitative: true, titerValues: '1/20,1/40,1/80,1/160,1/320' },
      { parameterName: 'S. PARA TYPHI B (H)', referenceRange: '', unit: '', groupName: '', isQualitative: true, titerValues: '1/20,1/40,1/80,1/160,1/320' },
    ]);
  };
  const removeParameterRow = (index) => {
    const p = [...parameters];
    p.splice(index, 1);
    setParameters(p);
  };
  const updateParameter = (index, field, value) => {
    const p = [...parameters];
    p[index][field] = value;
    setParameters(p);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalCategoryId = parseInt(formData.categoryId);

      if (!finalCategoryId && formData.newCategoryName) {
        const catRes = await fetch('/api/tests/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.accessToken}` },
          body: JSON.stringify({ name: formData.newCategoryName })
        });
        const catData = await catRes.json();
        finalCategoryId = catData.id;
        fetchCategories();
      }

      if (!finalCategoryId) return alert('Please select or create a category');

      const url = editingId 
        ? `/api/tests/${editingId}` 
        : '/api/tests';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}` 
        },
        body: JSON.stringify({
          testName: formData.testName,
          testCode: formData.testCode,
          sampleType: formData.sampleType,
          price: parseFloat(formData.price),
          categoryId: finalCategoryId,
          summary: formData.summary || null,
          parameters: parameters.filter(p => p.parameterName.trim() !== '')
        })
      });
      if (res.ok) {
        closeModal();
        fetchTests();
      } else {
        alert('Failed to save test');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;
    try {
      const res = await fetch(`/api/tests/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      });
      if (res.ok) fetchTests();
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ testName: '', testCode: '', sampleType: 'Blood', price: '', categoryId: '', newCategoryName: '', summary: '' });
    setParameters([{ parameterName: '', referenceRange: '', unit: '', groupName: '', isQualitative: false }]);
    setIsModalOpen(true);
  };

  const openEditModal = (test) => {
    setEditingId(test.id);
    setFormData({
      testName: test.testName, testCode: test.testCode, sampleType: test.sampleType, price: test.price, categoryId: test.categoryId, newCategoryName: '', summary: test.summary || ''
    });
    setParameters(test.parameters?.length > 0 ? test.parameters : [{ parameterName: '', referenceRange: '', unit: '', groupName: '' }]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const createWidalTestAuto = async () => {
    const existing = tests.find(t => t.testCode === 'WIDAL');
    if (existing) return alert('Widal test already exists!');
    try {
      let catId = categories.find(c => c.name === 'Immunology')?.id;
      if (!catId) {
        const catRes = await fetch('/api/tests/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.accessToken}` },
          body: JSON.stringify({ name: 'Immunology' })
        });
        const catData = await catRes.json();
        catId = catData.id;
        fetchCategories();
      }
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.accessToken}` },
        body: JSON.stringify({
          testName: 'WIDAL TEST (Rapid Slid Method)',
          testCode: 'WIDAL',
          sampleType: 'BLOOD',
          price: 200,
          categoryId: catId,
          summary: 'Widal test is a serological test for detecting antibodies against Salmonella typhi and paratyphi.',
          parameters: [
            { parameterName: 'S. TYPHI O', referenceRange: '', unit: '', groupName: '', isQualitative: true, titerValues: '1/20,1/40,1/80,1/160,1/320' },
            { parameterName: 'S. TYPHI H', referenceRange: '', unit: '', groupName: '', isQualitative: true, titerValues: '1/20,1/40,1/80,1/160,1/320' },
            { parameterName: 'S. PARA TYPHI A (H)', referenceRange: '', unit: '', groupName: '', isQualitative: true, titerValues: '1/20,1/40,1/80,1/160,1/320' },
            { parameterName: 'S. PARA TYPHI B (H)', referenceRange: '', unit: '', groupName: '', isQualitative: true, titerValues: '1/20,1/40,1/80,1/160,1/320' },
          ]
        })
      });
      if (res.ok) {
        alert('Widal test created successfully!');
        fetchTests();
      } else {
        alert('Failed to create Widal test');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating Widal test');
    }
  };

  const createMantouxTestAuto = async () => {
    const existing = tests.find(t => t.testCode === 'MANTOUX-01');
    if (existing) {
      if (!window.confirm('Mantoux test already exists. Do you want to overwrite it with standard Mantoux parameters?')) return;
      try {
        await fetch(`/api/tests/${existing.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${user.accessToken}` }
        });
      } catch (err) {
        console.error(err);
      }
    }
    try {
      let catId = categories.find(c => c.name === 'Clinical Pathology')?.id;
      if (!catId) {
        const catRes = await fetch('/api/tests/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.accessToken}` },
          body: JSON.stringify({ name: 'Clinical Pathology' })
        });
        const catData = await catRes.json();
        catId = catData.id;
        fetchCategories();
      }
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.accessToken}` },
        body: JSON.stringify({
          testName: 'MANTOUX TEST (TUBERCULIN SKIN TEST)',
          testCode: 'MANTOUX-01',
          sampleType: 'Skin',
          price: 250,
          categoryId: catId,
          summary: 'Induration measuring 10 mm more is considered positive which shows hypersensitivity to tuberculoprotein. It indicates past or present infection with Mycobacterium tuberculosis.',
          parameters: [
            { parameterName: 'Tuberculin Dose', referenceRange: '0.1 mL of TU PPD', unit: '', groupName: 'MANTOUX TEST (Interdermal Skin Test)' },
            { parameterName: 'Induration (mm)', referenceRange: '', unit: 'mm', groupName: 'MANTOUX TEST (Interdermal Skin Test)' },
            { parameterName: 'Result after 48 hours', referenceRange: 'NEGATIVE / POSITIVE', unit: '', groupName: 'MANTOUX TEST (Interdermal Skin Test)', isQualitative: true },
          ]
        })
      });
      if (res.ok) {
        alert('Mantoux test created successfully!');
        fetchTests();
      } else {
        alert('Failed to create Mantoux test');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating Mantoux test');
    }
  };

  const createMalariaTestAuto = async () => {
    const existing = tests.find(t => t.testCode === 'MALARIA-01');
    if (existing) {
      if (!window.confirm('Malaria test already exists. Do you want to overwrite it with standard Malaria parameters?')) return;
      try {
        await fetch(`/api/tests/${existing.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${user.accessToken}` }
        });
      } catch (err) {
        console.error(err);
      }
    }
    try {
      let catId = categories.find(c => c.name === 'Immunology & Serology' || c.name === 'Immunology')?.id;
      if (!catId) {
        const catRes = await fetch('/api/tests/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.accessToken}` },
          body: JSON.stringify({ name: 'Immunology & Serology' })
        });
        const catData = await catRes.json();
        catId = catData.id;
        fetchCategories();
      }
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.accessToken}` },
        body: JSON.stringify({
          testName: 'Malaria Micro',
          testCode: 'MALARIA-01',
          sampleType: 'Whole Blood',
          price: 150,
          categoryId: catId,
          summary: 'A Single negative smear does not rule out malaria. Test conducted on whole blood.',
          parameters: [
            { parameterName: 'Malaria Parasite', referenceRange: 'NOT-SEEN', unit: '', groupName: 'MALARIA PARASITE IDENTIFICATION (MICROSCOPY)', isQualitative: true },
          ]
        })
      });
      if (res.ok) {
        alert('Malaria test created successfully!');
        fetchTests();
      } else {
        alert('Failed to create Malaria test');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating Malaria test');
    }
  };

  const filteredTests = tests.filter(t => 
    t.testName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.testCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#00488d] uppercase tracking-wide">Test Directory (Panels)</h2>
        <div className="flex gap-2">
          <button 
            onClick={createWidalTestAuto}
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm font-bold tracking-wide transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> CREATE WIDAL
          </button>
          <button 
            onClick={createMantouxTestAuto}
            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded text-sm font-bold tracking-wide transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> CREATE MANTOUX
          </button>
          <button 
            onClick={createMalariaTestAuto}
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded text-sm font-bold tracking-wide transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> CREATE MALARIA
          </button>
          <button 
            onClick={openAddModal}
            className="bg-[#00488d] hover:bg-[#003875] text-white px-6 py-2 rounded text-sm font-bold tracking-wide transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> ADD TEST PANEL
          </button>
        </div>
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
          <div className="relative w-full max-w-md bg-white border border-gray-300 rounded flex items-center px-3 py-2 focus-within:border-[#00488d]">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by test name or code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm focus:outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase">Test Name & Code</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase">Category</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase">Sample Type</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase text-right">Price (₹)</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTests.length > 0 ? (
                filteredTests.map(t => (
                  <tr key={t.id} className="hover:bg-[#f2f7fc] transition-colors">
                    <td className="px-6 py-4">
                      {t.testCode === 'WIDAL' ? (
                        <p className="text-sm font-bold text-[#00488d] cursor-pointer hover:text-blue-700 flex items-center gap-1" onClick={() => navigate('/widal')}>
                          {t.testName} <ExternalLink className="w-3.5 h-3.5 inline opacity-50" />
                        </p>
                      ) : (
                        <p className="text-sm font-bold text-[#00488d]">{t.testName}</p>
                      )}
                      <p className="text-xs font-medium text-gray-500 font-mono mt-1">{t.testCode} • {t.parameters?.length || 0} Params</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-50 text-[#00488d] border border-blue-100">
                        <Tag className="w-3 h-3 mr-1" /> {t.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{t.sampleType}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">
                        {t.price}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-3">
                      <button onClick={() => openEditModal(t)} className="text-[#00488d] hover:text-blue-800" title="Edit">
                        <Edit2 className="w-4 h-4 inline-block" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700" title="Delete">
                        <Trash2 className="w-4 h-4 inline-block" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-sm">
                    No tests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
              <h3 className="text-xl font-bold text-[#00488d]">{editingId ? 'Edit Test Panel' : 'Add New Test Panel'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto grow p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Panel Name *</label>
                  <input type="text" required value={formData.testName} onChange={e => setFormData({...formData, testName: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]" placeholder="e.g. C.B.C."/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Code *</label>
                  <input type="text" required value={formData.testCode} onChange={e => setFormData({...formData, testCode: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Sample Type *</label>
                  <input type="text" required value={formData.sampleType} onChange={e => setFormData({...formData, sampleType: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category *</label>
                  <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]">
                    <option value="">Select or Create New...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {!formData.categoryId && (
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">New Category Name</label>
                    <input type="text" value={formData.newCategoryName} onChange={e => setFormData({...formData, newCategoryName: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]" placeholder="e.g. Hematology" />
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-[#00488d]">Test Parameters</h4>
                    <div className="flex gap-2">
                      <button type="button" onClick={fillWidalPreset} className="text-sm font-bold text-green-700 border border-green-600 px-3 py-1 rounded hover:bg-green-50">Quick Add Widal</button>
                      <button type="button" onClick={addParameterRow} className="text-sm font-bold text-[#00488d] border border-[#00488d] px-3 py-1 rounded hover:bg-blue-50">+ Add Row</button>
                    </div>
                  </div>
                <div className="space-y-2">
                  {parameters.map((p, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <input type="text" placeholder="Group Heading" value={p.groupName || ''} onChange={e => updateParameter(idx, 'groupName', e.target.value)} className="w-[15%] border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none" />
                      <input type="text" placeholder="Parameter Name *" required value={p.parameterName} onChange={e => updateParameter(idx, 'parameterName', e.target.value)} className="w-[20%] border border-gray-300 rounded px-2 py-1 text-sm font-bold focus:outline-none" />
                      {p.isQualitative ? (
                        <div className="flex gap-1 items-center w-[30%]">
                          <span className="text-[11px] font-bold text-green-700 whitespace-nowrap">+/- Only</span>
                          <input type="text" placeholder="Titers (e.g. 1/20,1/40,1/80)" value={p.titerValues || ''} onChange={e => updateParameter(idx, 'titerValues', e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-[11px] focus:outline-none" />
                        </div>
                      ) : (
                        <>
                          <input type="text" placeholder="Reference Range" value={p.referenceRange || ''} onChange={e => updateParameter(idx, 'referenceRange', e.target.value)} className="w-[17%] border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none" />
                          <input type="text" placeholder="Unit" value={p.unit || ''} onChange={e => updateParameter(idx, 'unit', e.target.value)} className="w-[13%] border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none" />
                        </>
                      )}
                      <label className="flex items-center gap-1 text-[11px] font-bold text-gray-600 cursor-pointer whitespace-nowrap pt-1">
                        <input type="checkbox" checked={p.isQualitative} onChange={e => updateParameter(idx, 'isQualitative', e.target.checked)} className="accent-[#00488d]" />
                        +/- Only
                      </label>
                      <button type="button" onClick={() => removeParameterRow(idx)} className="text-red-500 p-1 hover:bg-red-100 rounded shrink-0 mt-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary / Clinical Notes */}
              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Summary / Clinical Notes <span className="text-gray-400 font-normal">(appears on report under this test)</span>
                </label>
                <textarea value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} rows="4" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" placeholder="Optional: Add clinical notes, interpretations, or references to display on the report..."></textarea>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button type="button" onClick={closeModal} className="px-6 py-2 border border-gray-300 rounded text-gray-700 font-bold hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#00488d] text-white rounded font-bold hover:bg-[#003875]">{editingId ? 'Update Panel' : 'Save Panel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Tests;
