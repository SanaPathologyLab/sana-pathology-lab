import React, { useState } from 'react';
import Layout from '../components/Layout';

const TITERS = ['1/20', '1/40', '1/80', '1/160', '1/320'];
const ANTIGENS = ['S. TYPHI O', 'S. TYPHI H', 'S. PARA TYPHI A (H)', 'S. PARA TYPHI B (H)'];

const WidalTest = () => {
  const [cells, setCells] = useState(() => {
    const initial = {};
    ANTIGENS.forEach(a => {
      TITERS.forEach(t => {
        initial[`${a}|${t}`] = '';
      });
    });
    return initial;
  });
  const [report, setReport] = useState(null);

  const toggleCell = (antigen, titer) => {
    const key = `${antigen}|${titer}`;
    setCells(prev => ({ ...prev, [key]: prev[key] === '+' ? '' : '+' }));
  };

  const resetAll = () => {
    const cleared = {};
    ANTIGENS.forEach(a => {
      TITERS.forEach(t => {
        cleared[`${a}|${t}`] = '';
      });
    });
    setCells(cleared);
    setReport(null);
  };

  const anyPositive = Object.values(cells).some(v => v === '+');

  const generateReport = () => {
    const rows = ANTIGENS.map(antigen => {
      const titerResults = TITERS.map(titer => ({
        titer,
        value: cells[`${antigen}|${titer}`] || ''
      }));
      const hasPositive = titerResults.some(r => r.value === '+');
      return { antigen, titerResults, reactive: hasPositive };
    });
    setReport(rows);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#00488d] uppercase tracking-wide">Enter Widal Test Results</h2>
        </div>

        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
            <span className="text-base font-bold text-gray-800 uppercase tracking-wide">WIDAL TEST (Rapid Slid Method)</span>
            <span className={`text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider ${anyPositive ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
              {anyPositive ? 'POSITIVE' : 'NEGATIVE'}
            </span>
          </div>

          <div className="p-6">
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-wider w-[28%]">Antigen / Organism</th>
                    {TITERS.map((t, i) => (
                      <th key={i} className="px-1 py-3.5 text-xs font-bold text-gray-600 uppercase text-center tracking-wider">{t}</th>
                    ))}
                    <th className="px-2 py-3.5 text-xs font-bold text-gray-600 uppercase text-center tracking-wider w-[12%]">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ANTIGENS.map((antigen) => {
                    const titerResults = TITERS.map(t => ({ titer: t, value: cells[`${antigen}|${t}`] || '' }));
                    const hasPos = titerResults.some(r => r.value === '+');
                    const allNeg = titerResults.every(r => r.value === '');
                    return (
                      <tr key={antigen} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-sm font-bold text-gray-800">{antigen}</td>
                        {TITERS.map((titer) => {
                          const val = cells[`${antigen}|${titer}`] || '';
                          return (
                            <td key={titer} className="px-1 py-4 text-center">
                              <div className="flex items-center justify-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => toggleCell(antigen, titer)}
                                  className={`w-9 h-9 text-sm font-bold rounded border-2 transition-all duration-100 ${
                                    val === '+'
                                      ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                      : 'bg-white text-gray-300 border-gray-200 hover:border-green-400 hover:text-green-500'
                                  }`}
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleCell(antigen, titer)}
                                  className={`w-9 h-9 text-sm font-bold rounded border-2 transition-all duration-100 ${
                                    val === '+'
                                      ? 'bg-white text-gray-300 border-gray-200 hover:border-red-400 hover:text-red-500'
                                      : 'bg-red-600 text-white border-red-600 shadow-sm'
                                  }`}
                                >
                                  −
                                </button>
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-2 py-4 text-center">
                          <span className={`text-sm font-bold ${hasPos ? 'text-red-600' : allNeg ? 'text-gray-400' : 'text-orange-500'}`}>
                            {hasPos ? 'POSITIVE' : allNeg ? 'NEGATIVE' : '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={resetAll}
                className="px-6 py-2.5 border-2 border-gray-300 rounded text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={generateReport}
                className="px-8 py-2.5 bg-[#00488d] hover:bg-[#003875] text-white rounded text-sm font-bold tracking-wide transition-colors shadow-sm"
              >
                Generate Report
              </button>
            </div>

            {report && (
              <div className="mt-8 border border-gray-200 rounded bg-gray-50 p-6">
                <h4 className="font-bold text-[#00488d] uppercase tracking-wide mb-4 text-sm">WIDAL Test Interpretation</h4>
                <div className="space-y-3">
                  {report.map((row) => {
                    const posTiters = row.titerResults.filter(r => r.value === '+').map(r => r.titer);
                    const negTiters = row.titerResults.filter(r => r.value === '').map(r => r.titer);
                    return (
                      <div key={row.antigen} className="bg-white border border-gray-200 rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-800 text-sm">{row.antigen}</span>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${row.reactive ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                            {row.reactive ? 'REACTIVE' : 'NON-REACTIVE'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          {posTiters.length > 0 && (
                            <p><span className="font-semibold text-green-700">Positive Titers:</span> {posTiters.join(', ')}</p>
                          )}
                          {negTiters.length > 0 && (
                            <p><span className="font-semibold text-gray-500">Negative Titers:</span> {negTiters.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-xs text-gray-500 italic">
                  Interpretation: {report.some(r => r.reactive) ? 'Reactive result suggests recent or active infection with Salmonella typhi/paratyphi.' : 'Non-reactive result suggests no significant antibody titre detected.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WidalTest;
