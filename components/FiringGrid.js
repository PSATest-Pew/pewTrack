import { useState, useMemo } from 'react';
import StoppageModal from './StoppageModal';
import MeasurementModal from './MeasurementModal';
import styles from '../styles/FiringGrid.module.css';

export default function FiringGrid({
  test,
  currentString,
  cumulativeRounds,
  onStoppageLogged,
  onStringComplete,
  onIntervalRequired,
}) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [showStoppageModal, setShowStoppageModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [stoppages, setStoppages] = useState({});

  const { rows, cols, lastRowRounds } = useMemo(() => {
    const magCap = test.magazine_capacity;
    const strLen = test.string_length;
    const fullRows = Math.floor(strLen / magCap);
    const remainder = strLen % magCap;

    return {
      rows: fullRows + (remainder > 0 ? 1 : 0),
      cols: magCap,
      lastRowRounds: remainder || magCap,
    };
  }, [test.magazine_capacity, test.string_length]);

  const handleCellClick = (magNum, roundNum) => {
    setSelectedCell({ magNum, roundNum });
    setShowStoppageModal(true);
  };

  const handleStoppageLog = (stoppage) => {
    const key = `${selectedCell.magNum}-${selectedCell.roundNum}`;
    setStoppages((prev) => ({ ...prev, [key]: stoppage }));
    setShowStoppageModal(false);
    onStoppageLogged?.();
  };

  const checkIntervals = () => {
    const nextLubric = ((Math.floor(cumulativeRounds / test.lubrication_interval) + 1) *
      test.lubrication_interval);
    const nextClean = ((Math.floor(cumulativeRounds / test.cleaning_interval) + 1) *
      test.cleaning_interval);
    const nextInspect = ((Math.floor(cumulativeRounds / test.inspection_interval) + 1) *
      test.inspection_interval);

    const intervals = [];
    if (nextLubric <= cumulativeRounds + test.string_length) {
      intervals.push(`Lubrication required at ${nextLubric} rounds`);
    }
    if (nextClean <= cumulativeRounds + test.string_length) {
      intervals.push(`Cleaning required at ${nextClean} rounds`);
    }
    if (nextInspect <= cumulativeRounds + test.string_length) {
      intervals.push(`Measurement required at ${nextInspect} rounds`);
    }

    return intervals;
  };

  const upcomingIntervals = checkIntervals();

  return (
    <div className={styles.container}>
      <div className={styles.hud}>
        <h3>String {currentString}</h3>
        <p>
          Cumulative: {cumulativeRounds} / {test.planned_rounds} rounds
        </p>
        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{
              width: `${(cumulativeRounds / test.planned_rounds) * 100}%`,
            }}
          />
        </div>

        {upcomingIntervals.length > 0 && (
          <div className={styles.warning}>
            <strong>⚠️ Upcoming Actions:</strong>
            <ul>
              {upcomingIntervals.map((interval, idx) => (
                <li key={idx}>{interval}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={styles.gridWrapper}>
        <table className={styles.grid}>
          <tbody>
            {Array.from({ length: rows }).map((_, magIdx) => {
              const magNum = magIdx + 1;
              const isLastRow = magIdx === rows - 1;
              const roundsInMag = isLastRow ? lastRowRounds : test.magazine_capacity;

              return (
                <tr key={magNum}>
                  <td className={styles.magLabel}>Mag {magNum}</td>
                  {Array.from({ length: roundsInMag }).map((_, roundIdx) => {
                    const roundNum = roundIdx + 1;
                    const key = `${magNum}-${roundNum}`;
                    const hasStoppage = key in stoppages;

                    return (
                      <td
                        key={key}
                        className={`${styles.cell} ${hasStoppage ? styles.stoppage : ''}`}
                        onClick={() => handleCellClick(magNum, roundNum)}
                        title={hasStoppage ? stoppages[key].stoppage_type : 'Click to log stoppage'}
                      >
                        {roundNum}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.actions}>
        <button
          onClick={() => setShowMeasurementModal(true)}
          className={styles.btn}
        >
          Log Measurement
        </button>
        <button
          onClick={() => onStringComplete(stoppages)}
          className={styles.btnPrimary}
        >
          Complete String
        </button>
      </div>

      {showStoppageModal && (
        <StoppageModal
          onClose={() => setShowStoppageModal(false)}
          onSubmit={handleStoppageLog}
          magNumber={selectedCell?.magNum}
          roundNumber={selectedCell?.roundNum}
        />
      )}

      {showMeasurementModal && (
        <MeasurementModal
          onClose={() => setShowMeasurementModal(false)}
          onSubmit={(data) => {
            onIntervalRequired?.(data);
            setShowMeasurementModal(false);
          }}
        />
      )}
    </div>
  );
}
