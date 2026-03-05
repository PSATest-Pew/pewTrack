import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select, Input } from '@/components/ui/Form';
import { cn, STOPPAGE_TYPES } from '@/lib/utils';
import { Test, Stoppage } from '@/types';
import { AlertTriangle, CheckCircle, Wrench, Ruler, Droplets, Camera } from 'lucide-react';

export default function ActiveTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  
  // String State
  const [currentShooter, setCurrentShooter] = useState('Operator 1');
  const [stoppages, setStoppages] = useState<Stoppage[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ mag: number; round: number } | null>(null);
  const [isStoppageModalOpen, setIsStoppageModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceType, setMaintenanceType] = useState<'cleaning' | 'lubrication' | 'measurement' | null>(null);
  const [maintenancePerformedAtRound, setMaintenancePerformedAtRound] = useState<number | null>(null);

  // Stoppage Form
  const [stoppageForm, setStoppageForm] = useState({ type: STOPPAGE_TYPES[0], comments: '' });

  // Maintenance Form
  const [maintenanceForm, setMaintenanceForm] = useState({
    headspace: '',
    firing_pin_indent: '',
    trigger_weight: '',
    comments: ''
  });

  useEffect(() => {
    fetchTest();
  }, [id]);

  const fetchTest = async () => {
    try {
      const res = await fetch(`/api/tests/${id}`);
      if (!res.ok) throw new Error('Test not found');
      const data = await res.json();
      setTest(data);
    } catch (error) {
      console.error(error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // --- Logic ---

  const totalRounds = test?.string_length ?? 0;
  const magCapacity = test?.mag_capacity ?? 1;
  const numMags = Math.ceil(totalRounds / magCapacity);

  // Check for upcoming intervals (Warning for current string)
  const roundsAtEndOfString = (test?.current_rounds ?? 0) + (test?.string_length ?? 0);
  const isCleaningUpcoming = test ? (roundsAtEndOfString > 0 && roundsAtEndOfString % test.cleaning_interval === 0) : false;
  const isLubeUpcoming = test ? (roundsAtEndOfString > 0 && roundsAtEndOfString % test.lubrication_interval === 0) : false;
  const isMeasureUpcoming = test ? (roundsAtEndOfString > 0 && roundsAtEndOfString % test.measurement_interval === 0) : false;

  // Check for IMMEDIATE blocking intervals (Must be done before starting string)
  const isCleaningDueNow = test ? (test.current_rounds > 0 && test.current_rounds % test.cleaning_interval === 0) : false;
  const isLubeDueNow = test ? (test.current_rounds > 0 && test.current_rounds % test.lubrication_interval === 0) : false;
  const isMeasureDueNow = test ? (test.current_rounds > 0 && test.current_rounds % test.measurement_interval === 0) : false;

  const isBlocked = (isCleaningDueNow || isLubeDueNow || isMeasureDueNow) 
    && !maintenanceType 
    && maintenancePerformedAtRound !== test?.current_rounds;

  useEffect(() => {
    if (isBlocked && !isMaintenanceModalOpen) {
      setIsMaintenanceModalOpen(true);
    }
  }, [isBlocked]);

  if (loading || !test) return <div className="p-8 text-white">Loading test data...</div>;

  const handleCellClick = (mag: number, round: number) => {
    if (isBlocked) return;
    setSelectedCell({ mag, round });
    // ... rest of function
    const existing = stoppages.find(s => s.mag_number === mag && s.round_number === round);
    if (existing) {
      setStoppageForm({ type: existing.stoppage_type, comments: existing.comments });
    } else {
      setStoppageForm({ type: STOPPAGE_TYPES[0], comments: '' });
    }
    setIsStoppageModalOpen(true);
  };

  const saveStoppage = () => {
    if (!selectedCell) return;
    
    const newStoppage: Stoppage = {
      mag_number: selectedCell.mag,
      round_number: selectedCell.round,
      stoppage_type: stoppageForm.type,
      comments: stoppageForm.comments
    };

    // Remove existing if any, then add new
    setStoppages(prev => [
      ...prev.filter(s => !(s.mag_number === selectedCell.mag && s.round_number === selectedCell.round)),
      newStoppage
    ]);
    setIsStoppageModalOpen(false);
  };

  const clearStoppage = () => {
    if (!selectedCell) return;
    setStoppages(prev => prev.filter(s => !(s.mag_number === selectedCell.mag && s.round_number === selectedCell.round)));
    setIsStoppageModalOpen(false);
  };

  const completeString = async () => {
    if (isBlocked) {
      alert("Maintenance required before proceeding.");
      return;
    }
    // ... rest of function

    try {
      const payload = {
        test_id: test.id,
        shooter_name: currentShooter,
        cumulative_rounds_start: test.current_rounds,
        cumulative_rounds_end: test.current_rounds + test.string_length,
        notes: '',
        stoppages
      };

      const res = await fetch('/api/strings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save string');

      // Refresh test data
      await fetchTest();
      setStoppages([]); // Reset grid
      
      // Check for maintenance after string completion (simulated here, usually would check before next string start)
      // For this prototype, we just refresh.
    } catch (error) {
      console.error(error);
      alert('Error saving string');
    }
  };

  const handleMaintenanceSubmit = async () => {
    try {
      await fetch('/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: test.id,
          cumulative_rounds: test.current_rounds, // Logged at current state
          type: maintenanceType,
          ...maintenanceForm
        })
      });
      setIsMaintenanceModalOpen(false);
      if (test) {
        setMaintenancePerformedAtRound(test.current_rounds);
      }
      setMaintenanceType(null); // Clear block
      // In a real app, we'd track that this specific interval was cleared.
    } catch (error) {
      console.error(error);
    }
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* HUD Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">{test.gun_model} <span className="text-zinc-500 font-normal">| {test.caliber}</span></h1>
            <div className="flex items-center gap-4 text-sm text-zinc-400 mt-1">
              <span>Rounds: <span className="text-emerald-400 font-mono font-bold">{test.current_rounds}</span> / {test.planned_rounds}</span>
              <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${(test.current_rounds / test.planned_rounds) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select 
              options={[{ value: 'Operator 1', label: 'Operator 1' }, { value: 'Operator 2', label: 'Operator 2' }]}
              value={currentShooter}
              onChange={(e) => setCurrentShooter(e.target.value)}
              className="w-40"
            />
            
            {/* Maintenance Indicators */}
            <div className="flex gap-2">
              {isCleaningUpcoming && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                  <Wrench className="w-3 h-3" /> Clean Due Soon
                </div>
              )}
              {isMeasureUpcoming && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                  <Ruler className="w-3 h-3" /> Measure Due Soon
                </div>
              )}
            </div>

            <Button onClick={completeString} disabled={isBlocked && false /* Allow override for prototype */}>
              Complete String
            </Button>
          </div>
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6">
            {Array.from({ length: numMags }).map((_, magIndex) => {
              const magNum = magIndex + 1;
              // Calculate rounds in this mag
              const roundsInThisMag = Math.min(
                magCapacity,
                totalRounds - (magIndex * magCapacity)
              );

              return (
                <div key={magNum} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Magazine {magNum}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: roundsInThisMag }).map((_, roundIndex) => {
                      const roundNum = roundIndex + 1;
                      const hasStoppage = stoppages.some(s => s.mag_number === magNum && s.round_number === roundNum);
                      
                      return (
                        <button
                          key={roundNum}
                          onClick={() => handleCellClick(magNum, roundNum)}
                          className={cn(
                            "w-8 h-10 rounded text-xs font-mono font-medium transition-all duration-150 flex items-center justify-center border",
                            hasStoppage 
                              ? "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30" 
                              : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300 hover:border-zinc-500"
                          )}
                        >
                          {roundNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Stoppage Modal */}
      <Modal
        isOpen={isStoppageModalOpen}
        onClose={() => setIsStoppageModalOpen(false)}
        title={`Log Stoppage - Mag ${selectedCell?.mag} Round ${selectedCell?.round}`}
        footer={
          <>
            <Button variant="ghost" onClick={clearStoppage}>Clear Issue</Button>
            <Button onClick={saveStoppage}>Save Log</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Stoppage Type"
            options={STOPPAGE_TYPES.map(t => ({ value: t, label: t }))}
            value={stoppageForm.type}
            onChange={(e) => setStoppageForm({ ...stoppageForm, type: e.target.value })}
          />
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
              Comments
            </label>
            <textarea
              className="w-full h-24 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={stoppageForm.comments}
              onChange={(e) => setStoppageForm({ ...stoppageForm, comments: e.target.value })}
              placeholder="Describe the issue..."
            />
          </div>
        </div>
      </Modal>

      {/* Maintenance Modal */}
      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={() => {}} // Prevent closing without action
        title="Maintenance Required"
        footer={
          <Button onClick={handleMaintenanceSubmit} disabled={!maintenanceType}>
            Log Maintenance & Continue
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
            <p className="text-zinc-300 mb-2">The following maintenance intervals have been reached:</p>
            <ul className="list-disc list-inside text-emerald-400 font-medium space-y-1">
              {isCleaningDueNow && <li>Cleaning ({test.cleaning_interval} rds)</li>}
              {isLubeDueNow && <li>Lubrication ({test.lubrication_interval} rds)</li>}
              {isMeasureDueNow && <li>Measurement ({test.measurement_interval} rds)</li>}
            </ul>
          </div>

          <div className="space-y-4">
            <Select
              label="Action Performed"
              options={[
                { value: '', label: 'Select Action...' },
                { value: 'cleaning', label: 'Cleaning' },
                { value: 'lubrication', label: 'Lubrication' },
                { value: 'measurement', label: 'Measurement' },
              ]}
              value={maintenanceType || ''}
              onChange={(e) => setMaintenanceType(e.target.value as any)}
            />

            {maintenanceType === 'measurement' && (
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Headspace"
                  value={maintenanceForm.headspace}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, headspace: e.target.value })}
                />
                <Input
                  label="Pin Indent"
                  value={maintenanceForm.firing_pin_indent}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, firing_pin_indent: e.target.value })}
                />
                <Input
                  label="Trigger Wt"
                  value={maintenanceForm.trigger_weight}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, trigger_weight: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                Notes
              </label>
              <textarea
                className="w-full h-24 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                value={maintenanceForm.comments}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, comments: e.target.value })}
                placeholder="Observations..."
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
