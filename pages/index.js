import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Plus, ChevronRight, Target, CheckCircle, Crosshair, RotateCcw } from 'lucide-react';
import { getAllTests, resetAllData } from '../lib/store';

export default function Dashboard() {
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTests(getAllTests());
    setLoading(false);
  }, []);

  const handleReset = () => {
    if (window.confirm('Reset all demo data? This will clear everything and restore the sample tests.')) {
      resetAllData();
      setTests(getAllTests());
    }
  };

  const activeTests = tests.filter((t) => t.status === 'active');
  const completedTests = tests.filter((t) => t.status === 'completed');

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-12 px-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Crosshair className="w-8 h-8 text-emerald-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Pew Track</h1>
          </div>
          <p className="text-zinc-500 text-sm ml-11">Live Fire Testing &amp; Tracking System</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-zinc-500 hover:text-zinc-300 text-xs rounded-lg hover:bg-zinc-800/50 transition-colors"
            title="Reset demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <Link href="/new">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm">
              <Plus className="w-4 h-4" /> New Test
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-zinc-500 py-20 text-center">Loading tests...</div>
      ) : tests.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
          <Target className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 mb-1 font-medium">No tests found</p>
          <p className="text-zinc-600 text-sm mb-6">Create your first live fire test to get started.</p>
          <Link href="/new">
            <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm">
              Initialize First Test
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Active Tests */}
          {activeTests.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Tests ({activeTests.length})
              </h2>
              <div className="grid gap-3">
                {activeTests.map((test) => (
                  <TestCard key={test.id} test={test} />
                ))}
              </div>
            </section>
          )}

          {/* Completed Tests */}
          {completedTests.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5" />
                Completed ({completedTests.length})
              </h2>
              <div className="grid gap-3">
                {completedTests.map((test) => (
                  <TestCard key={test.id} test={test} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function TestCard({ test }) {
  const progress = test.planned_rounds > 0
    ? Math.min(100, (test.current_rounds / test.planned_rounds) * 100)
    : 0;
  const isActive = test.status === 'active';

  return (
    <Link href={`/test/${test.id}`}>
      <div className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-5 md:p-6 rounded-xl transition-all hover:shadow-lg cursor-pointer">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Info */}
          <div className="flex items-start gap-3 min-w-0">
            <div className={`p-2.5 rounded-lg shrink-0 ${isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
              <Target className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                {test.gun_model}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400 mt-1">
                <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs font-medium">{test.caliber}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-xs">{test.ammunition_type}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-xs text-zinc-600">{new Date(test.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Right: Progress + Actions */}
          <div className="flex items-center gap-6 md:gap-8 ml-11 md:ml-0">
            <div className="min-w-[140px]">
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="text-xl font-mono font-bold text-white">{test.current_rounds}</span>
                <span className="text-xs text-zinc-500 font-normal">/ {test.planned_rounds} rds</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isActive ? 'bg-emerald-500' : 'bg-zinc-600'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/measurements/${test.id}`} onClick={(e) => e.stopPropagation()}>
                <button className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs hover:bg-zinc-700 hover:text-white transition-colors font-medium">
                  Logs
                </button>
              </Link>
              <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
