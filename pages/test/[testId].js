import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FiringGrid from '../../components/FiringGrid';
import styles from '../../styles/TestPage.module.css';

export default function TestPage() {
  const router = useRouter();
  const { testId } = router.query;

  const [test, setTest] = useState(null);
  const [currentString, setCurrentString] = useState(1);
  const [cumulativeRounds, setCumulativeRounds] = useState(0);
  const [shooter, setShooter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testEnded, setTestEnded] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showPlannedEndModal, setShowPlannedEndModal] = useState(false);

  useEffect(() => {
    if (!testId) return;

    const fetchTest = async () => {
      try {
        const response = await fetch(`/api/tests/${testId}`);
        if (!response.ok) throw new Error('Failed to load test');
        const data = await response.json();
        setTest(data.test);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  const handleStringComplete = async (stoppages) => {
    if (!shooter.trim()) {
      alert('Please enter shooter name');
      return;
    }

    try {
      const newCumulative = cumulativeRounds + test.string_length;
      const stoppagesArray = Object.entries(stoppages).map(
        ([key, data]) => data
      );

      const response = await fetch('/api/strings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: testId,
          string_number: currentString,
          shooter_name: shooter,
          cumulative_rounds_at_end: newCumulative,
          stoppages: stoppagesArray,
        }),
      });

      if (!response.ok) throw new Error('Failed to save string');

      setCumulativeRounds(newCumulative);

      // Check if planned rounds reached
      if (newCumulative >= test.planned_rounds) {
        setShowPlannedEndModal(true);
      } else {
        setCurrentString((s) => s + 1);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEndTestEarly = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to end this test early? Only data up to the last completed string will be saved.'
    );

    if (!confirmed) return;

    try {
      await fetch(`/api/tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ended' }),
      });
      setTestEnded(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleContinuePastPlanned = () => {
    setShowPlannedEndModal(false);
    setCurrentString((s) => s + 1);
  };

  const handleFinalizePlanned = async () => {
    try {
      await fetch(`/api/tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      setTestEnded(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading test...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;
  if (!test) return <div style={{ padding: '2rem' }}>Test not found</div>;

  if (testEnded) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Test Completed</h2>
        <p>Final cumulative rounds: {cumulativeRounds}</p>
        <button onClick={() => router.push('/')} style={{ padding: '0.5rem 1rem' }}>
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Live Fire Test – ProArms Tech</h1>
        <div className={styles.shooterInput}>
          <label>Current Shooter:</label>
          <input
            type="text"
            value={shooter}
            onChange={(e) => setShooter(e.target.value)}
            placeholder="Enter shooter name"
          />
        </div>
        <button
          onClick={handleEndTestEarly}
          className={styles.btnDanger}
        >
          End Test Early
        </button>
      </header>

      <FiringGrid
        test={test}
        currentString={currentString}
        cumulativeRounds={cumulativeRounds}
        onStringComplete={handleStringComplete}
      />

      {showPlannedEndModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPlannedEndModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Planned End Reached</h3>
            <p>Cumulative rounds: {cumulativeRounds}</p>
            <p>Planned total: {test.planned_rounds}</p>
            <p>Do you want to finalize the test or continue firing?</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={handleFinalizePlanned}
                className={styles.btnPrimary}
                style={{ flex: 1 }}
              >
                Finalize Test
              </button>
              <button
                onClick={handleContinuePastPlanned}
                className={styles.btnSecondary}
                style={{ flex: 1 }}
              >
                Continue Firing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
