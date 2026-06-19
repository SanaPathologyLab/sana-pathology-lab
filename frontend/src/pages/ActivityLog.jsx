import React, { useState, useEffect, useContext, useCallback } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { 
  ClipboardList, Search, RefreshCw, ChevronLeft, ChevronRight,
  User, FileText, Trash2, Edit3, Plus, Filter, AlertCircle
} from 'lucide-react';

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-800 border-green-200',
  UPDATE: 'bg-blue-100 text-blue-800 border-blue-200',
  DELETE: 'bg-red-100 text-red-800 border-red-200',
};

const ENTITY_ICONS = {
  Report:      <FileText className="w-3.5 h-3.5" />,
  Patient:     <User className="w-3.5 h-3.5" />,
  TestPackage: <ClipboardList className="w-3.5 h-3.5" />,
};

const ActivityLog = () => {
  const { user } = useContext(AuthContext);
  const headers = { 'Authorization': `Bearer ${user?.accessToken}` };

  const [logs, setLogs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const LIMIT = 50;

  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [search, setSearch]             = useState('');
  const [searchInput, setSearchInput]   = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: LIMIT,
        ...(filterAction && { action: filterAction }),
        ...(filterEntity && { entity: filterEntity }),
        ...(search && { search }),
      });
      const res = await fetch(`/api/activity-log?${params}`, { headers });
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Activity log fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filterAction, filterEntity, search]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const totalPages = Math.ceil(total / LIMIT);

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#00488d] uppercase tracking-wide flex items-center gap-2">
            <ClipboardList className="w-6 h-6" /> Activity Log
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Audit trail of all create, update, and delete actions — {total} total entries
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center shadow-sm">
        <Filter className="w-4 h-4 text-gray-400" />

        <select
          value={filterAction}
          onChange={e => { setFilterAction(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#00488d]"
        >
          <option value="">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>

        <select
          value={filterEntity}
          onChange={e => { setFilterEntity(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#00488d]"
        >
          <option value="">All Entities</option>
          <option value="Report">Report</option>
          <option value="Patient">Patient</option>
          <option value="TestPackage">Test Package</option>
        </select>

        <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search description or ID..."
              className="pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#00488d] w-64"
            />
          </div>
          <button type="submit" className="bg-[#00488d] text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-blue-800 transition-colors">
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-[#00488d] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-sm text-gray-500">Loading activity log...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No activity entries found</p>
            <p className="text-sm text-gray-400 mt-1">Actions like creating reports or patients will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-xs font-bold text-gray-600 uppercase">Date & Time</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-600 uppercase">Action</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-600 uppercase">Entity</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-600 uppercase">Entity ID</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-600 uppercase">Description</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-600 uppercase">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log, i) => (
                  <tr key={log.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap font-mono">
                      {formatTime(log.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {log.action === 'CREATE' && <Plus className="w-2.5 h-2.5" />}
                        {log.action === 'UPDATE' && <Edit3 className="w-2.5 h-2.5" />}
                        {log.action === 'DELETE' && <Trash2 className="w-2.5 h-2.5" />}
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {log.entity ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {ENTITY_ICONS[log.entity] || null} {log.entity}
                        </span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-[#00488d] font-bold">
                      {log.entityId || '—'}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700 max-w-xs">
                      <span className="line-clamp-2">{log.description || '—'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-[#00488d]/10 flex items-center justify-center">
                          <User className="w-3 h-3 text-[#00488d]" />
                        </div>
                        <span className="text-xs font-bold text-gray-700">{log.userName}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <span className="text-xs text-gray-500">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-gray-700">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ActivityLog;
