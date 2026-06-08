import React, { useState } from 'react';
import Layout from '../components/Layout';

const TITERS = ['1/20', '1/40', '1/80', '1/160', '1/320'];
const ANTIGENS = ['S. TYPHI O', 'S. TYPHI H', 'S. PARA TYPHI A (H)', 'S. PARA TYPHI B (H)'];

const WidalTest = () => {
  const [cells, setCells] = useState(() => {
    const initial = {};
    ANTIGENS.forEach(a => {
      TITERS.forEach(t => {
        initial[`${a}|${t}`] = '--';
      });
    });
    return initial;
  });
  const [report, setReport] = useState(null);
  const [overallResult, setOverallResult] = useState('NEGATIVE');

  const toggleCell = (antigen, titer) => {
    const key = `${antigen}|${titer}`;
    setCells(prev => ({ ...prev, [key]: prev[key] === '+' ? '--' : '+' }));
  };

  const resetAll = () => {
    const cleared = {};
    ANTIGENS.forEach(a => {
      TITERS.forEach(t => {
        cleared[`${a}|${t}`] = '--';
      });
    });
    setCells(cleared);
    setReport(null);
  };

  const generateReport = () => {
    const rows = ANTIGENS.map(antigen => {
      const titerResults = TITERS.map(titer => ({
        titer,
        value: cells[`${antigen}|${titer}`]
      }));
      const reactive = titerResults.some(r => r.value === '+');
      return { antigen, titerResults, reactive };
    });
    setReport(rows);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#00488d] uppercase tracking-wide">Enter Widal Test Results</h2>
        </div>

        <div className="bg-white border border-gray-300">
          {/* Title */}
          <div className="px-6 py-4 text-center border-b border-gray-300">
            <span className="text-lg font-bold text-black uppercase tracking-wide">WIDAL TEST (Rapid Slid Method)</span>
          </div>

          <div className="p-6">
            {/* POSITIVE / NEGATIVE Selector (center) */}
            <div className="flex items-center justify-center gap-4 mb-6 pb-4 border-b border-gray-200">
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Result:</span>
              {['POSITIVE', 'NEGATIVE'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setOverallResult(opt)}
                  className={`px-6 py-2 text-sm font-bold uppercase tracking-wide border-2 rounded transition-colors ${
                    overallResult === opt
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Titer Table */}
            <div className="border border-black rounded">
              <table className="w-full text-left border-collapse text-black">
                <thead>
                  <tr className="border-b border-black">
                    <th className="px-4 py-3 text-sm font-bold uppercase">&nbsp;</th>
                    {TITERS.map((t, i) => (
                      <th key={i} className="px-2 py-3 text-sm font-bold text-center">{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ANTIGENS.map((antigen) => (
                    <tr key={antigen} className="border-b border-gray-200 last:border-b-0">
                      <td className="px-4 py-3 text-sm font-bold">{antigen}</td>
                      {TITERS.map((titer) => {
                        const val = cells[`${antigen}|${titer}`];
                        return (
                          <td key={titer} className="px-2 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => toggleCell(antigen, titer)}
                              className="font-mono text-sm font-bold text-black cursor-pointer hover:text-gray-600 bg-transparent border-0 outline-none w-full"
                            >
                              {val}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={resetAll}
                className="px-6 py-2.5 border-2 border-gray-400 rounded text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-500 transition-colors"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={generateReport}
                className="px-8 py-2.5 bg-black hover:bg-gray-800 text-white rounded text-sm font-bold tracking-wide transition-colors"
              >
                Generate Report
              </button>
            </div>

            {/* Report Output */}
            {report && (
              <div className="mt-8 border border-gray-300 p-6">
                <h4 className="font-bold text-black uppercase tracking-wide mb-4 text-sm border-b border-gray-300 pb-2">WIDAL Test Interpretation</h4>
                <div className="space-y-3">
                  {report.map((row) => {
                    const posTiters = row.titerResults.filter(r => r.value === '+').map(r => r.titer);
                    const negTiters = row.titerResults.filter(r => r.value === '--').map(r => r.titer);
                    return (
                      <div key={row.antigen} className="border border-gray-200 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-black">{row.antigen}</span>
                          <span className="text-xs font-bold uppercase tracking-wider">{row.reactive ? 'REACTIVE' : 'NON-REACTIVE'}</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          {posTiters.length > 0 && <p>Positive: {posTiters.join(', ')}</p>}
                          {negTiters.length > 0 && <p>Negative: {negTiters.join(', ')}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  <p>Overall Result: <span className="font-bold text-black">{overallResult}</span></p>
                  <p className="italic mt-1">
                    {report.some(r => r.reactive)
                      ? 'Reactive result suggests recent or active infection with Salmonella typhi/paratyphi.'
                      : 'Non-reactive result suggests no significant antibody titre detected.'}
                  </p>
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
