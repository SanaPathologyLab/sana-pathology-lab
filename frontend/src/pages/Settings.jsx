import React, { useEffect, useState, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { Save, Building2, Phone, Mail, MapPin, FileText, UserCheck, Settings2 } from 'lucide-react';

const API = '/api';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const headers = { 'Authorization': `Bearer ${user?.accessToken}`, 'Content-Type': 'application/json' };

  const [settings, setSettings] = useState({
    labName: 'Sana Pathology Lab',
    labAddress: 'Datawali Road, Near Aara Machine, Hayat Nagar',
    labCity: 'Hayat Nagar',
    labPhone: '6396786939',
    labPhone2: '6397240575',
    labEmail: 'sana.pathology@gmail.com',
    labGST: '',
    labRegNo: '',
    pathologistName: 'Dr. Pathologist',
    pathologistQual: 'MD Pathology',
    technicianName: 'Lab Technician',
    reportFooter: 'This report is electronically generated. Results are for diagnostic purposes only.',
    logoUrl: '',
    aiApiKey: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API}/settings`, { headers })
      .then(r => r.json())
      .then(data => setSettings(prev => ({ ...prev, ...data })))
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to save settings');
    }
    setSaving(false);
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const Section = ({ icon, title, children }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="p-2 bg-[#00488d] rounded-lg text-white">{icon}</div>
        <h3 className="text-base font-bold text-[#00488d] uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );

  const Field = ({ label, field, type = 'text', fullWidth = false }) => (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={settings[field] || ''}
          onChange={e => handleChange(field, e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]"
        />
      ) : (
        <input
          type={type}
          value={settings[field] || ''}
          onChange={e => handleChange(field, e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]"
        />
      )}
    </div>
  );

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#00488d] uppercase tracking-wide">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your laboratory information</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#00488d] hover:bg-blue-800 text-white px-6 py-2 rounded font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm font-semibold">
          ✅ Settings saved successfully!
        </div>
      )}

      <Section icon={<Building2 className="w-4 h-4" />} title="Lab Information">
        <Field label="Lab Name" field="labName" />
        <Field label="Registration No." field="labRegNo" />
        <Field label="Address" field="labAddress" fullWidth />
        <Field label="City" field="labCity" />
        <Field label="GST Number" field="labGST" />
        <Field label="Phone 1" field="labPhone" />
        <Field label="Phone 2" field="labPhone2" />
        <Field label="Email" field="labEmail" type="email" />
      </Section>

      <Section icon={<UserCheck className="w-4 h-4" />} title="Report Signatories">
        <Field label="Pathologist Name" field="pathologistName" />
        <Field label="Pathologist Qualification" field="pathologistQual" />
        <Field label="Technician Name" field="technicianName" />
      </Section>

      <Section icon={<FileText className="w-4 h-4" />} title="Report Configuration">
        <Field label="Report Footer Text" field="reportFooter" type="textarea" fullWidth />
      </Section>

      <Section icon={<Settings2 className="w-4 h-4" />} title="AI Configuration">
        <Field label="Pollinations AI API Key (Optional)" field="aiApiKey" type="password" />
        <div className="md:col-span-2 text-xs text-gray-500 font-medium leading-relaxed mt-1">
          To prevent rate limiting and 429 error messages, you can obtain a free API key from{' '}
          <a
            href="https://enter.pollinations.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-[#00488d] underline font-semibold transition-colors"
          >
            enter.pollinations.ai
          </a>{' '}
          and paste it above. If empty, the system will use anonymous requests.
        </div>
      </Section>
    </Layout>
  );
};

export default Settings;
