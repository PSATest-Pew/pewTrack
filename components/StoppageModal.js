import { useState } from 'react';
import styles from '../styles/Modal.module.css';

export default function StoppageModal({
  onClose,
  onSubmit,
  magNumber,
  roundNumber,
}) {
  const [stoppageType, setStoppageType] = useState('');
  const [comments, setComments] = useState('');

  const stoppageTypes = [
    'Feed failure',
    'Extraction failure',
    'Ejection failure',
    'Bolt failure',
    'Trigger failure',
    'Other',
  ];

  const handleSubmit = () => {
    if (!stoppageType) {
      alert('Please select a stoppage type');
      return;
    }
    onSubmit({
      mag_number: magNumber,
      round_number: roundNumber,
      stoppage_type: stoppageType,
      comments,
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Log Stoppage</h3>
        <p>
          Magazine {magNumber}, Round {roundNumber}
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <label>Stoppage Type:</label>
          <select
            value={stoppageType}
            onChange={(e) => setStoppageType(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">-- Select --</option>
            {stoppageTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Comments/Observations:</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            style={{ width: '100%', minHeight: '80px' }}
          />
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.btnSecondary}>
            Cancel
          </button>
          <button onClick={handleSubmit} className={styles.btnPrimary}>
            Log Stoppage
          </button>
        </div>
      </div>
    </div>
  );
}
