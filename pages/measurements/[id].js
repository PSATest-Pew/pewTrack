import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { getMeasurements, getTest, getStrings, getStoppages } from '../../lib/store';
import { STOPPAGE_TYPES, MEASUREMENT_FIELDS } from '../../lib/utils';
import { Ruler, Droplets, Sparkles, AlertTriangle, ClipboardList, Home, TrendingUp, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const TYPE_STYLES = {
  measurement: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: Ruler },
  cleaning: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', icon: Sparkles },
  lubrication: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: Droplets },
};

export default function TestLog() {
  const router = useRouter();
  const { id } = router.query;
  const [test, setTest] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [strings, setStrings] = useState([]);
  const [allStoppages, setAllStoppages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (!id) return;
    setTest(getTest(id));
    setMeasurements(getMeasurements(id));
    setStrings(getStrings(id));
    setAllStoppages(getStoppages(id));
    setLoading(false);
  }, [id]);

  // Configured measurement fields for this test
  const testMeasurementFields = useMemo(() => {
    const keys = test?.measurement_fields || [];
    return MEASUREMENT_FIELDS.filter((f) => keys.includes(f.key));
  }, [test?.measurement_fields]);

  // Stoppage type summary
  const stoppageSummary = useMemo(() => {
    const counts = {};
    STOPPAGE_TYPES.forEach((t) => { counts[t] = 0; });
    allStoppages.forEach((s) => {
      if (counts[s.stoppage_type] !== undefined) {
        counts[s.stoppage_type]++;
      } else {
        counts[s.stoppage_type] = 1;
      }
    });
    return counts;
  }, [allStoppages]);

  // MRBS chart data: running MRBS after each string
  const mrbsChartData = useMemo(() => {
    // Sort strings chronologically (ascending by cumulative_rounds_end)
    const sortedStrings = [...strings].sort((a, b) => a.cumulative_rounds_end - b.cumulative_rounds_end);
    let cumulativeStoppages = 0;
    const data = [];

    sortedStrings.forEach((s) => {
      const stringStoppages = allStoppages.filter(
        (st) => String(st.string_id) === String(s.id)
      ).length;
      cumulativeStoppages += stringStoppages;

      const mrbs = cumulativeStoppages > 0
        ? Math.round(s.cumulative_rounds_end / cumulativeStoppages)
        : null; // null = no stoppages yet, will show as gap

      data.push({
        rounds: s.cumulative_rounds_end,
        mrbs: mrbs,
        stoppages: cumulativeStoppages,
        label: `${s.cumulative_rounds_end} rds`,
      });
    });

    return data;
  }, [strings, allStoppages]);

  // Overall MRBS
  const overallMrbs = useMemo(() => {
    if (!test) return '—';
    if (allStoppages.length === 0) return test.current_rounds > 0 ? '∞' : '—';
    return Math.round(test.current_rounds / allStoppages.length);
  }, [test, allStoppages]);

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'stoppages', label: `Stoppages (${allStoppages.length})` },
    { key: 'maintenance', label: `Maintenance (${measurements.length})` },
    { key: 'strings', label: `Strings (${strings.length})` },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link href="/">
            <span className="p-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-500 hover:text-zinc-300">
              <Home className="w-4 h-4" />
            </span>
          </Link>
          {test && (
            <Link href={`/test/${test.id}`}>
              <span className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                {test.gun_model} · {test.caliber}
              </span>
            </Link>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-500" />
            Test Log
          </h1>
          {test && (
            <Link href={`/test/${test.id}`}>
              <Button variant="ghost" size="sm">Back to Test</Button>
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-zinc-900 rounded-lg p-1 border border-zinc-800 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.key ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ===== OVERVIEW TAB ===== */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Rounds Fired" value={test?.current_rounds ?? 0} sub={`/ ${test?.planned_rounds ?? 0}`} />
              <StatCard label="Total Stoppages" value={allStoppages.length} color={allStoppages.length > 0 ? 'text-red-400' : ''} />
              <StatCard label="MRBS" value={overallMrbs} color={overallMrbs === '∞' ? 'text-emerald-400' : ''} />
              <StatCard label="Strings Fired" value={strings.length} />
            </div>

            {/* MRBS Chart */}
            {mrbsChartData.length > 0 && mrbsChartData.some((d) => d.mrbs !== null) ? (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Running MRBS Over Test
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mrbsChartData.filter((d) => d.mrbs !== null)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis
                        dataKey="rounds"
                        stroke="#52525b"
                        tick={{ fill: '#71717a', fontSize: 12 }}
                        label={{ value: 'Cumulative Rounds', position: 'insideBottom', offset: -5, fill: '#52525b', fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#52525b"
                        tick={{ fill: '#71717a', fontSize: 12 }}
                        label={{ value: 'MRBS', angle: -90, position: 'insideLeft', fill: '#52525b', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#f4f4f5' }}
                        labelFormatter={(v) => `${v} rounds`}
                        formatter={(value, name) => [value, 'MRBS']}
                      />
                      <Line
                        type="monotone"
                        dataKey="mrbs"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-sm">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                MRBS chart will appear after strings with stoppages are completed.
              </div>
            )}

            {/* Stoppage type breakdown (quick summary) */}
            {allStoppages.length > 0 && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Stoppage Breakdown
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(stoppageSummary)
                    .filter(([_, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="bg-zinc-800/50 rounded-lg px-3 py-2 flex items-center justify-between">
                        <span className="text-xs text-zinc-400 truncate mr-2">{type}</span>
                        <span className="text-sm font-mono font-bold text-red-400">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== STOPPAGES TAB ===== */}
        {tab === 'stoppages' && (
          <div className="space-y-6">
            {/* Type summary table */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                Stoppage Summary by Type
              </h3>
              <div className="space-y-1">
                {STOPPAGE_TYPES.map((type) => {
                  const count = stoppageSummary[type] || 0;
                  const pct = allStoppages.length > 0 ? Math.round((count / allStoppages.length) * 100) : 0;
                  return (
                    <div key={type} className="flex items-center gap-3 py-2">
                      <span className="text-sm text-zinc-300 w-44 truncate">{type}</span>
                      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500/60 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono font-bold text-white w-8 text-right">{count}</span>
                      <span className="text-xs text-zinc-600 w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
                <div className="flex items-center gap-3 py-2 border-t border-zinc-800 mt-2 pt-3">
                  <span className="text-sm font-medium text-zinc-300 w-44">Total</span>
                  <div className="flex-1" />
                  <span className="text-sm font-mono font-bold text-red-400 w-8 text-right">{allStoppages.length}</span>
                  <span className="text-xs text-zinc-600 w-10 text-right">100%</span>
                </div>
              </div>
            </div>

            {/* Full stoppage list */}
            {allStoppages.length === 0 ? (
              <EmptyState message="No stoppages recorded. Clean running so far." />
            ) : (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                  All Stoppages ({allStoppages.length})
                </h3>
                <div className="space-y-1.5">
                  {allStoppages
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map((st) => (
                      <div key={st.id} className="text-sm bg-zinc-800/50 rounded-lg px-4 py-3 flex items-center gap-4">
                        <span className="text-red-400 font-mono text-xs font-bold shrink-0">
                          M{st.mag_number} R{st.round_number}
                        </span>
                        <span className="text-zinc-300 font-medium">{st.stoppage_type}</span>
                        {st.comments && <span className="text-zinc-600 text-xs truncate">— {st.comments}</span>}
                        <span className="ml-auto text-xs text-zinc-700 shrink-0">
                          {new Date(st.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== MAINTENANCE TAB ===== */}
        {tab === 'maintenance' && (
          <>
            {measurements.length === 0 ? (
              <EmptyState message="No maintenance records yet. Complete strings to trigger maintenance events." />
            ) : (
              <div className="space-y-3">
                {measurements.map((m) => {
                  const style = TYPE_STYLES[m.type] || TYPE_STYLES.measurement;
                  const Icon = style.icon;
                  // Only show fields that were configured for this test
                  const visibleFields = m.type === 'measurement' ? testMeasurementFields.filter((f) => m[f.key]) : [];

                  return (
                    <div key={m.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-medium text-zinc-400">@ {m.cumulative_rounds} rds</span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${style.bg} ${style.text} border ${style.border} rounded-full text-xs font-bold uppercase tracking-wider`}>
                            <Icon className="w-3 h-3" />
                            {m.type}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-600">{new Date(m.created_at).toLocaleString()}</span>
                      </div>

                      {m.performed_by && (
                        <p className="text-sm text-zinc-400 mb-3">
                          by <span className="text-zinc-300">{m.performed_by}</span>
                        </p>
                      )}

                      {visibleFields.length > 0 && (
                        <div className={`grid gap-3 mb-3 ${visibleFields.length === 1 ? 'grid-cols-1' : visibleFields.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                          {visibleFields.map((field) => (
                            <div key={field.key} className="bg-zinc-800/50 p-3 rounded-lg">
                              <span className="text-xs text-zinc-500 uppercase tracking-wider">{field.shortLabel || field.label}</span>
                              <p className="text-lg font-mono font-bold text-emerald-400">
                                {m[field.key]}{field.unit}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {m.comments && (
                        <div className="bg-zinc-800/30 p-3 rounded-lg">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider">Notes</span>
                          <p className="text-sm text-zinc-300 mt-1">{m.comments}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ===== STRINGS TAB ===== */}
        {tab === 'strings' && (
          <>
            {strings.length === 0 ? (
              <EmptyState message="No strings logged yet. Complete your first string from the active test page." />
            ) : (
              <div className="space-y-3">
                {strings.map((s) => {
                  const stringStoppages = allStoppages.filter((st) => String(st.string_id) === String(s.id));

                  return (
                    <div key={s.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-medium text-zinc-300">
                            Rounds {s.cumulative_rounds_start + 1}–{s.cumulative_rounds_end}
                          </span>
                          <span className="text-xs text-zinc-600">
                            {s.cumulative_rounds_end - s.cumulative_rounds_start} rds
                          </span>
                        </div>
                        <span className="text-xs text-zinc-600">{new Date(s.created_at).toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-zinc-400">
                          Shooter: <span className="text-zinc-300">{s.shooter_name}</span>
                        </span>
                        {stringStoppages.length > 0 ? (
                          <span className="flex items-center gap-1 text-red-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {stringStoppages.length} stoppage{stringStoppages.length !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-emerald-500 text-xs font-medium">Clean</span>
                        )}
                      </div>

                      {stringStoppages.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {stringStoppages.map((st) => (
                            <div key={st.id} className="text-xs text-zinc-500 bg-zinc-800/50 rounded px-3 py-2">
                              <span className="text-red-400 font-medium">Mag {st.mag_number} Rd {st.round_number}</span>
                              {' — '}
                              <span className="text-zinc-400">{st.stoppage_type}</span>
                              {st.comments && <span className="text-zinc-600"> · {st.comments}</span>}
                            </div>
                          ))}
                        </div>
                      )}

                      {s.notes && <p className="text-xs text-zinc-500 mt-2">{s.notes}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Bottom nav */}
        <div className="mt-8 flex items-center justify-between text-sm">
          <Link href="/">
            <span className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">← Dashboard</span>
          </Link>
          {test && (
            <Link href={`/test/${test.id}`}>
              <span className="text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer">Active Test →</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
      <div className="mt-1">
        <span className={`text-2xl font-mono font-bold ${color || 'text-white'}`}>{value}</span>
        {sub && <span className="text-sm text-zinc-600 ml-1">{sub}</span>}
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
      <p className="text-zinc-500 text-sm">{message}</p>
    </div>
  );
}
