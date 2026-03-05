import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Test } from '../types';
import { Plus, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo
    const mockTests = [
      {
        id: 1,
        gun_model: 'M4 Carbine',
        caliber: '5.56 NATO',
        ammunition_type: 'M855 62gr',
        status: 'active',
        current_rounds: 250,
        planned_rounds: 1000,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        gun_model: 'Glock 19',
        caliber: '9mm',
        ammunition_type: 'FMJ 124gr',
        status: 'completed',
        current_rounds: 500,
        planned_rounds: 500,
        created_at: new Date().toISOString()
      }
    ];
    setTimeout(() => {
      setTests(mockTests);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Pew Track</h1>
          <p className="text-zinc-400">ProArms Tech Live Fire Tracking System</p>
        </div>
        <Link href="/new">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            <Plus className="w-4 h-4" /> New Test
          </button>
        </Link>
      </div>

      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Recent Tests</h2>

        {loading ? (
          <div className="text-zinc-500">Loading tests...</div>
        ) : tests.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
            <p className="text-zinc-400 mb-4">No tests found.</p>
            <Link href="/new">
              <button className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600">Initialize First Test</button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {tests.map(test => (
              <Link key={test.id} href={`/test/${test.id}`}>
                <div className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-6 rounded-xl transition-all hover:shadow-lg flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${test.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                      <div className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {test.gun_model}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">
                        <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs">{test.caliber}</span>
                        <span>{test.ammunition_type}</span>
                        <span className="text-zinc-600">•</span>
                        <span>{new Date(test.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-2xl font-mono font-bold text-white">
                        {test.current_rounds} <span className="text-sm text-zinc-500 font-sans font-normal">/ {test.planned_rounds}</span>
                      </div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Rounds Fired</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/measurements/${test.id}`}>
                        <button className="px-3 py-1 bg-zinc-700 text-white rounded text-sm hover:bg-zinc-600">Measurements</button>
                      </Link>
                      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}