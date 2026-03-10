import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select, Input } from '../../components/ui/Form';
import { cn, STOPPAGE_TYPES, OPERATORS, MEASUREMENT_FIELDS } from '../../lib/utils';
import { getTest, updateTest, addString, addStoppages, addMeasurement, getStoppages } from '../../lib/store';
import { ArrowLeft, AlertTriangle, Ruler, Droplets, Sparkles, ClipboardCheck, Home, TrendingUp } from 'lucide-react';

export default function ActiveTest() {
  const router = useRouter();
  const { id } = router.query;
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  // String state
  const [currentShooter, setCurrentShooter] = useState(OPERATORS[0]);
  const [stoppages, setStoppages] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isStoppageModalOpen, setIsStoppageModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isConfirmCompleteOpen, setIsConfirmCompleteOpen] = useState(false);

  // Lifetime stoppages for MRBS
  const [lifetimeStoppages, setLifetimeStoppages] = useState([]);

  // Track which maintenance actions have been performed for each round count
  const [performedActions, setPerformedActions] = useState({});

  // Stoppage form
  const [stoppageForm, setStoppageForm] = useState({ type: STOPPAGE_TYPES[0], comments: '' });

  // Maintenance form
  const [maintenanceForm, setMaintenanceForm] = useState({
    headspace: '', firing_pin_indent: '', trigger_weight: '', comments: '', performed_by: '',
  });

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Load test data
  useEffect(() => {
    if (!id) return;
    const data = getTest(id);
    if (data) {
      setTest(data);
      setLifetimeStoppages(getStoppages(id));
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [id, router]);

  // Load persisted performed actions from localStorage
  useEffect(() => {
    if (test) {
      try {
        const key = `pewtrack-performed-${test.id}`;
        const saved = localStorage.getItem(key);
        if (saved) setPerformedActions(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, [test?.id]);

  // Persist performed actions
  useEffect(() => {
    if (test) {
      const key = `pewtrack-performed-${test.id}`;
      localStorage.setItem(key, JSON.stringify(performedActions));
    }
  }, [performedActions, test?.id]);

  // --- Derived values ---
  const totalRounds = test?.string_length ?? 0;
  const magCapacity = test?.mag_capacity ?? 1;
  const numMags = Math.ceil(totalRounds / magCapacity);
  const currentRounds = test?.current_rounds ?? 0;

  // Measurement fields configured for this test
  const testMeasurementFields = useMemo(() => {
    const keys = test?.measurement_fields || [];
    return MEASUREMENT_FIELDS.filter((f) => keys.includes(f.key));
  }, [test?.measurement_fields]);

  const hasMeasurements = testMeasurementFields.length > 0;

  // MRBS: total lifetime rounds ÷ total lifetime stoppages
  const totalLifetimeStoppages = lifetimeStoppages.length + stoppages.length;
  const effectiveRounds = currentRounds; // rounds already completed (not counting current in-progress string)
  const mrbs = totalLifetimeStoppages > 0
    ? Math.round(effectiveRounds / totalLifetimeStoppages)
    : effectiveRounds > 0 ? '∞' : '—';

  // What's due NOW at the current round count
  const dueNow = useMemo(() => {
    const actions = [];
    if (test && currentRounds > 0) {
      if (currentRounds % test.cleaning_interval === 0) actions.push('cleaning');
      if (currentRounds % test.lubrication_interval === 0) actions.push('lubrication');
      if (hasMeasurements && test.measurement_interval > 0 && currentRounds % test.measurement_interval === 0) {
        actions.push('measurement');
      }
    }
    return actions;
  }, [test, currentRounds, hasMeasurements]);

  // What's been performed this round
  const performedThisRound = performedActions[currentRounds] || [];
  const remainingActions = dueNow.filter((act) => !performedThisRound.includes(act));
  const isBlocked = remainingActions.length > 0;

  // What's upcoming after this string completes
  const roundsAfterString = currentRounds + (test?.string_length ?? 0);
  const upcomingWarnings = useMemo(() => {
    const warnings = [];
    if (test && roundsAfterString > 0) {
      if (hasMeasurements && test.measurement_interval > 0 && roundsAfterString % test.measurement_interval === 0) {
        warnings.push('measurement');
      }
      if (roundsAfterString % test.cleaning_interval === 0) warnings.push('cleaning');
      if (roundsAfterString % test.lubrication_interval === 0) warnings.push('lubrication');
    }
    return warnings;
  }, [test, roundsAfterString, hasMeasurements]);

  // Auto-open maintenance modal when blocked
  useEffect(() => {
    if (isBlocked && !isMaintenanceModalOpen && !loading) {
      setIsMaintenanceModalOpen(true);
    }
  }, [isBlocked]);

  if (loading || !test) return <div className="p-8 text-white">Loading test data...</div>;

  const isCompleted = test.status === 'completed';
  const progress = test.planned_rounds > 0 ? Math.min(100, (currentRounds / test.planned_rounds) * 100) : 0;

  // --- Handlers ---
  const handleCellClick = (mag, round) => {
    if (isBlocked || isCompleted) return;
    setSelectedCell({ mag, round });
    const existing = stoppages.find((s) => s.mag_number === mag && s.round_number === round);
    if (existing) {
      setStoppageForm({ type: existing.stoppage_type, comments: existing.comments });
    } else {
      setStoppageForm({ type: STOPPAGE_TYPES[0], comments: '' });
    }
    setIsStoppageModalOpen(true);
  };

  const saveStoppage = () => {
    if (!selectedCell) return;
    const newStoppage = {
      mag_number: selectedCell.mag,
      round_number: selectedCell.round,
      stoppage_type: stoppageForm.type,
      comments: stoppageForm.comments,
    };
    setStoppages((prev) => [
      ...prev.filter((s) => !(s.mag_number === selectedCell.mag && s.round_number === selectedCell.round)),
      newStoppage,
    ]);
    setIsStoppageModalOpen(false);
    showToast(`Stoppage logged: Mag ${selectedCell.mag}, Rd ${selectedCell.round}`);
  };

  const clearStoppage = () => {
    if (!selectedCell) return;
    setStoppages((prev) =>
      prev.filter((s) => !(s.mag_number === selectedCell.mag && s.round_number === selectedCell.round))
    );
    setIsStoppageModalOpen(false);
  };

  const completeString = () => {
    if (isBlocked) {
      setIsMaintenanceModalOpen(true);
      return;
    }
    setIsConfirmCompleteOpen(true);
  };

  const confirmCompleteString = () => {
    setIsConfirmCompleteOpen(false);

    const newRounds = currentRounds + test.string_length;
    const isNowComplete = newRounds >= test.planned_rounds;

    // Save string to store
    const stringData = addString({
      test_id: test.id,
      shooter_name: currentShooter,
      cumulative_rounds_start: currentRounds,
      cumulative_rounds_end: newRounds,
      notes: stoppages.length > 0 ? `${stoppages.length} stoppage(s) recorded` : 'Clean string',
    });

    // Save stoppages
    if (stoppages.length > 0) {
      addStoppages(test.id, stringData.id, stoppages);
    }

    // Update the test
    const updated = updateTest(test.id, {
      current_rounds: newRounds,
      status: isNowComplete ? 'completed' : 'active',
    });

    setTest(updated);
    // Update lifetime stoppages to include what we just saved
    setLifetimeStoppages(getStoppages(test.id));
    setStoppages([]);

    if (isNowComplete) {
      showToast('Test complete! All planned rounds fired.', 'success');
    } else {
      showToast(`String complete — ${newRounds} total rounds`);
    }
  };

  const handleMaintenanceSubmit = () => {
    if (!test || remainingActions.length === 0) return;
    const action = remainingActions[0];

    // Save measurement/maintenance to store
    addMeasurement({
      test_id: test.id,
      cumulative_rounds: currentRounds,
      type: action,
      performed_by: maintenanceForm.performed_by || currentShooter,
      headspace: maintenanceForm.headspace || null,
      firing_pin_indent: maintenanceForm.firing_pin_indent || null,
      trigger_weight: maintenanceForm.trigger_weight || null,
      comments: maintenanceForm.comments || null,
    });

    // Mark action as performed
    setPerformedActions((prev) => {
      const arr = prev[currentRounds] ? [...prev[currentRounds], action] : [action];
      return { ...prev, [currentRounds]: arr };
    });

    setMaintenanceForm({ headspace: '', firing_pin_indent: '', trigger_weight: '', comments: '', performed_by: '' });
    showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} logged`);

    const newRemaining = remainingActions.slice(1);
    if (newRemaining.length === 0) {
      setIsMaintenanceModalOpen(false);
    }
  };

  const actionLabel = (a) => a.charAt(0).toUpperCase() + a.slice(1);
  const actionIcon = (a) => {
    if (a === 'measurement') return <Ruler className="w-4 h-4" />;
    if (a === 'lubrication') return <Droplets className="w-4 h-4" />;
    if (a === 'cleaning') return <Sparkles className="w-4 h-4" />;
    return null;
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto">
          {/* Top row */}
          <div className="flex items-center gap-3 mb-3">
            <Link href="/">
              <span className="p-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-500 hover:text-zinc-300">
                <Home className="w-4 h-4" />
              </span>
            </Link>
            <h1 className="text-lg font-bold tracking-tight text-white">
              {test.gun_model}
              <span className="text-zinc-500 font-normal ml-2">| {test.caliber} · {test.ammunition_type}</span>
            </h1>
            {isCompleted && (
              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs font-bold uppercase">
                Completed
              </span>
            )}
          </div>

          {/* Bottom row: stats + controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-5">
              {/* Round counter */}
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-mono font-bold text-lg">{currentRounds}</span>
                <span className="text-zinc-600 text-sm">/ {test.planned_rounds} rds</span>
                <div className="w-28 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* MRBS */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 rounded-lg border border-zinc-700">
                <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">MRBS</span>
                <span className={`font-mono font-bold text-sm ${
                  mrbs === '∞' ? 'text-emerald-400' : mrbs === '—' ? 'text-zinc-600' : 'text-white'
                }`}>
                  {mrbs}
                </span>
              </div>

              {/* Upcoming warnings */}
              {upcomingWarnings.length > 0 && !isCompleted && (
                <div className="flex items-center gap-1.5">
                  {upcomingWarnings.map((w) => (
                    <span
                      key={w}
                      className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-xs font-medium"
                    >
                      {actionIcon(w)}
                      <span className="hidden sm:inline">{actionLabel(w)}</span>
                    </span>
                  ))}
                  <span className="text-xs text-zinc-600">after string</span>
                </div>
              )}
            </div>

            {/* Controls */}
            {!isCompleted && (
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Select
                  options={OPERATORS.map((o) => ({ value: o, label: o }))}
                  value={currentShooter}
                  onChange={(e) => setCurrentShooter(e.target.value)}
                  className="w-36"
                />

                {isBlocked && (
                  <button
                    onClick={() => setIsMaintenanceModalOpen(true)}
                    className="text-red-400 text-xs font-bold px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                    {remainingActions.length} action{remainingActions.length > 1 ? 's' : ''} required
                  </button>
                )}

                <Button onClick={completeString} disabled={isBlocked} className="ml-auto md:ml-0">
                  <ClipboardCheck className="w-4 h-4 mr-1.5" />
                  Complete String
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {isCompleted && (
            <div className="mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center text-zinc-400">
              This test is complete. All {test.planned_rounds} planned rounds have been fired.
              <Link href={`/measurements/${test.id}`}>
                <span className="text-emerald-500 hover:underline ml-2 cursor-pointer">View test log →</span>
              </Link>
            </div>
          )}

          {/* String info bar */}
          {!isCompleted && (
            <div className="mb-4 flex items-center justify-between text-xs text-zinc-500">
              <span>
                Current string: rounds {currentRounds + 1}–{currentRounds + test.string_length}
                {' · '}Shooter: <span className="text-zinc-300">{currentShooter}</span>
              </span>
              {stoppages.length > 0 && (
                <span className="text-red-400 font-medium">
                  {stoppages.length} stoppage{stoppages.length !== 1 ? 's' : ''} this string
                </span>
              )}
            </div>
          )}

          <div className="grid gap-4">
            {Array.from({ length: numMags }).map((_, magIndex) => {
              const magNum = magIndex + 1;
              const roundsInThisMag = Math.min(magCapacity, totalRounds - magIndex * magCapacity);

              return (
                <div key={magNum} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      Magazine {magNum}
                    </span>
                    {stoppages.filter((s) => s.mag_number === magNum).length > 0 && (
                      <span className="text-xs text-red-400">
                        {stoppages.filter((s) => s.mag_number === magNum).length} issue(s)
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: roundsInThisMag }).map((_, roundIndex) => {
                      const roundNum = roundIndex + 1;
                      const stoppage = stoppages.find(
                        (s) => s.mag_number === magNum && s.round_number === roundNum
                      );

                      return (
                        <button
                          key={roundNum}
                          onClick={() => handleCellClick(magNum, roundNum)}
                          disabled={isCompleted}
                          title={stoppage ? `${stoppage.stoppage_type}${stoppage.comments ? ': ' + stoppage.comments : ''}` : `Mag ${magNum} Rd ${roundNum}`}
                          className={cn(
                            'w-9 h-10 rounded-md text-xs font-mono font-medium transition-all duration-150 flex items-center justify-center border',
                            isCompleted && 'opacity-50 cursor-default',
                            stoppage
                              ? 'bg-red-500/20 border-red-500/60 text-red-400 hover:bg-red-500/30'
                              : 'bg-zinc-800/80 border-zinc-700/50 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300 hover:border-zinc-500'
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

          {/* Navigation footer */}
          <div className="mt-8 flex items-center justify-between text-sm">
            <Link href="/">
              <span className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">← Dashboard</span>
            </Link>
            <Link href={`/measurements/${test.id}`}>
              <span className="text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer">Test Log →</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Stoppage Modal */}
      <Modal
        isOpen={isStoppageModalOpen}
        onClose={() => setIsStoppageModalOpen(false)}
        title={`Log Stoppage — Mag ${selectedCell?.mag}, Round ${selectedCell?.round}`}
        footer={
          <>
            <Button variant="ghost" onClick={clearStoppage}>Clear Issue</Button>
            <Button onClick={saveStoppage}>Save Stoppage</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Stoppage Type"
            options={STOPPAGE_TYPES.map((t) => ({ value: t, label: t }))}
            value={stoppageForm.type}
            onChange={(e) => setStoppageForm({ ...stoppageForm, type: e.target.value })}
          />
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Comments</label>
            <textarea
              className="w-full h-24 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={stoppageForm.comments}
              onChange={(e) => setStoppageForm({ ...stoppageForm, comments: e.target.value })}
              placeholder="Describe the issue..."
            />
          </div>
        </div>
      </Modal>

      {/* Complete String Confirmation Modal */}
      <Modal
        isOpen={isConfirmCompleteOpen}
        onClose={() => setIsConfirmCompleteOpen(false)}
        title="Complete String"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsConfirmCompleteOpen(false)}>Cancel</Button>
            <Button onClick={confirmCompleteString}>Confirm &amp; Log</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Shooter</span>
              <span className="text-white font-medium">{currentShooter}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Rounds this string</span>
              <span className="text-white font-mono">{test.string_length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">New total</span>
              <span className="text-emerald-400 font-mono font-bold">
                {currentRounds + test.string_length} / {test.planned_rounds}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Stoppages this string</span>
              <span className={stoppages.length > 0 ? 'text-red-400 font-medium' : 'text-zinc-300'}>
                {stoppages.length === 0 ? 'Clean string' : `${stoppages.length} recorded`}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-zinc-700 pt-2">
              <span className="text-zinc-400">Lifetime MRBS</span>
              <span className="text-white font-mono font-bold">
                {(() => {
                  const newTotal = lifetimeStoppages.length + stoppages.length;
                  const newRounds = currentRounds + test.string_length;
                  return newTotal > 0 ? Math.round(newRounds / newTotal) : '∞';
                })()}
              </span>
            </div>
          </div>

          {currentRounds + test.string_length >= test.planned_rounds && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-lg">
              This will complete the test — all planned rounds will have been fired.
            </div>
          )}
        </div>
      </Modal>

      {/* Maintenance Modal */}
      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={() => { if (!isBlocked) setIsMaintenanceModalOpen(false); }}
        title="Maintenance Required"
        footer={
          <Button onClick={handleMaintenanceSubmit} disabled={remainingActions.length === 0}>
            Log {remainingActions[0] ? actionLabel(remainingActions[0]) : ''} &amp; Continue
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Action queue */}
          <div className="space-y-2">
            {dueNow.map((action) => {
              const done = performedThisRound.includes(action);
              return (
                <div
                  key={action}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg border transition-all',
                    done
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : action === remainingActions[0]
                        ? 'bg-zinc-800 border-zinc-600 text-white'
                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-500'
                  )}
                >
                  {actionIcon(action)}
                  <span className="capitalize font-medium text-sm">{action}</span>
                  {done && <span className="ml-auto text-xs">✓ Done</span>}
                  {action === remainingActions[0] && !done && (
                    <span className="ml-auto text-xs text-amber-400">← Current</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Form fields for current action */}
          {remainingActions.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-zinc-800">
              {/* Only show measurement fields if this action is 'measurement' AND there are configured fields */}
              {remainingActions[0] === 'measurement' && testMeasurementFields.length > 0 && (
                <div className={`grid gap-3 ${testMeasurementFields.length === 1 ? 'grid-cols-1' : testMeasurementFields.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {testMeasurementFields.map((field) => (
                    <Input
                      key={field.key}
                      label={field.shortLabel || field.label}
                      value={maintenanceForm[field.key] || ''}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                    />
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Performed by
                </label>
                <select
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  value={maintenanceForm.performed_by || currentShooter}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, performed_by: e.target.value })}
                >
                  {OPERATORS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Notes</label>
                <textarea
                  className="w-full h-20 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  value={maintenanceForm.comments}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, comments: e.target.value })}
                  placeholder="Observations..."
                />
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
