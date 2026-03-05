import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '../../components/ui/Button';

export default function Measurements() {
  const router = useRouter();
  const { id } = router.query;
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMeasurements();
    }
  }, [id]);

  const fetchMeasurements = async () => {
    try {
      // Mock data for demo
      const mockMeasurements = [
        {
          id: 1,
          test_id: parseInt(id),
          cumulative_rounds: 250,
          type: 'measurement',
          performed_by: 'Operator 1',
          headspace: '1.635"',
          firing_pin_indent: '0.065"',
          trigger_weight: '5.2 lbs',
          comments: 'Initial measurement before test',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          test_id: parseInt(id),
          cumulative_rounds: 500,
          type: 'cleaning',
          performed_by: 'Operator 1',
          comments: 'Routine cleaning after 500 rounds',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          test_id: parseInt(id),
          cumulative_rounds: 750,
          type: 'measurement',
          performed_by: 'Operator 2',
          headspace: '1.638"',
          firing_pin_indent: '0.062"',
          trigger_weight: '5.4 lbs',
          comments: 'Measurement after continued firing',
          created_at: new Date().toISOString()
        }
      ];
      setMeasurements(mockMeasurements);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading measurements...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Measurements & Inspections</h1>
          <Button onClick={() => router.push('/')} variant="ghost">Back to Dashboard</Button>
        </div>

        {measurements.length === 0 ? (
          <p className="text-zinc-400">No measurements recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {measurements.map((m) => (
              <div key={m.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                      Round {m.cumulative_rounds}
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                      {m.type}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                </div>

                {m.performed_by && (
                  <p className="text-sm text-zinc-300 mb-2">
                    <strong>Performed by:</strong> {m.performed_by}
                  </p>
                )}

                {m.type === 'measurement' && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {m.headspace && (
                      <div className="bg-zinc-800/50 p-3 rounded">
                        <span className="text-xs text-zinc-400 uppercase tracking-wider">Headspace</span>
                        <p className="text-lg font-mono font-bold text-emerald-400">{m.headspace}</p>
                      </div>
                    )}
                    {m.firing_pin_indent && (
                      <div className="bg-zinc-800/50 p-3 rounded">
                        <span className="text-xs text-zinc-400 uppercase tracking-wider">Pin Indent</span>
                        <p className="text-lg font-mono font-bold text-emerald-400">{m.firing_pin_indent}</p>
                      </div>
                    )}
                    {m.trigger_weight && (
                      <div className="bg-zinc-800/50 p-3 rounded">
                        <span className="text-xs text-zinc-400 uppercase tracking-wider">Trigger Wt</span>
                        <p className="text-lg font-mono font-bold text-emerald-400">{m.trigger_weight}</p>
                      </div>
                    )}
                  </div>
                )}

                {m.comments && (
                  <div className="bg-zinc-800/50 p-3 rounded">
                    <span className="text-xs text-zinc-400 uppercase tracking-wider">Notes</span>
                    <p className="text-sm text-zinc-300 mt-1">{m.comments}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}