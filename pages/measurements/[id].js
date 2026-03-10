import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { getMeasurements, getTest, getStrings, getStoppages } from '../../lib/store';
import { ArrowLeft, Ruler, Droplets, Sparkles, AlertTriangle, ClipboardList, Home } from 'lucide-react';

const TYPE_STYLES = {
  measurement: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: Ruler },
  cleaning: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', icon: Sparkles },
  lubrication: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: Droplets },
};

export default function Measurements() {
  const router = useRouter();
  const { id } = router.query;
  const [test, setTest] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [strings, setStrings] = useState([]);
  const [allStoppages, setAllStoppages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('maintenance'); // 'maintenance' | 'strings'

  useEffect(() => {
    if (!id) return;
    setTest(getTest(id));
    setMeasurements(getMeasurements(id));
    setStrings(getStrings(id));
    setAllStoppages(getStoppages(id));
    setLoading(false);
  }, [id]);

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
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
        <div className="flex gap-1 mb-6 bg-zinc-900 rounded-lg p-1 border border-zinc-800 w-fit">
          <button
            onClick={() => setTab('maintenance')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'maintenance'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Maintenance ({measurements.length})
          </button>
          <button
            onClick={() => setTab('strings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'strings'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Strings ({strings.length})
          </button>
        </div>

        {/* Maintenance Tab */}
        {tab === 'maintenance' && (
          <>
            {measurements.length === 0 ? (
              <EmptyState message="No maintenance records yet. Complete strings to trigger maintenance events." />
            ) : (
              <div className="space-y-3">
                {measurements.map((m) => {
                  const style = TYPE_STYLES[m.type] || TYPE_STYLES.measurement;
                  const Icon = style.icon;

                  return (
                    <div key={m.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-medium text-zinc-400">
                            @ {m.cumulative_rounds} rds
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${style.bg} ${style.text} border ${style.border} rounded-full text-xs font-bold uppercase tracking-wider`}>
                            <Icon className="w-3 h-3" />
                            {m.type}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-600">
                          {new Date(m.created_at).toLocaleString()}
                        </span>
                      </div>

                      {m.performed_by && (
                        <p className="text-sm text-zinc-400 mb-3">
                          by <span className="text-zinc-300">{m.performed_by}</span>
                        </p>
                      )}

                      {m.type === 'measurement' && (m.headspace || m.firing_pin_indent || m.trigger_weight) && (
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          {m.headspace && (
                            <div className="bg-zinc-800/50 p-3 rounded-lg">
                              <span className="text-xs text-zinc-500 uppercase tracking-wider">Headspace</span>
                              <p className="text-lg font-mono font-bold text-emerald-400">{m.headspace}&quot;</p>
                            </div>
                          )}
                          {m.firing_pin_indent && (
                            <div className="bg-zinc-800/50 p-3 rounded-lg">
                              <span className="text-xs text-zinc-500 uppercase tracking-wider">Pin Indent</span>
                              <p className="text-lg font-mono font-bold text-emerald-400">{m.firing_pin_indent}&quot;</p>
                            </div>
                          )}
                          {m.trigger_weight && (
                            <div className="bg-zinc-800/50 p-3 rounded-lg">
                              <span className="text-xs text-zinc-500 uppercase tracking-wider">Trigger Wt</span>
                              <p className="text-lg font-mono font-bold text-emerald-400">{m.trigger_weight} lbs</p>
                            </div>
                          )}
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

        {/* Strings Tab */}
        {tab === 'strings' && (
          <>
            {strings.length === 0 ? (
              <EmptyState message="No strings logged yet. Complete your first string from the active test page." />
            ) : (
              <div className="space-y-3">
                {strings.map((s) => {
                  const stringStoppages = allStoppages.filter(
                    (st) => String(st.string_id) === String(s.id)
                  );

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
                        <span className="text-xs text-zinc-600">
                          {new Date(s.created_at).toLocaleString()}
                        </span>
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

                      {s.notes && (
                        <p className="text-xs text-zinc-500 mt-2">{s.notes}</p>
                      )}
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
            <span className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
              ← Dashboard
            </span>
          </Link>
          {test && (
            <Link href={`/test/${test.id}`}>
              <span className="text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer">
                Active Test →
              </span>
            </Link>
          )}
        </div>
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
