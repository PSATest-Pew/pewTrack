import { useState } from 'react';
import styles from '../styles/Modal.module.css';

export default function MeasurementModal({ onClose, onSubmit }) {
  const [headspace, setHeadspace] = useState('');
  const [firing_pin_indent, setFiringPinIndent] = useState('');
  const [trigger_weight, setTriggerWeight] = useState('');
  const [comments, setComments] = useState('');

  const handleSubmit = () => {
    onSubmit({
      headspace: headspace ? parseFloat(headspace) : null,
      firing_pin_indent: firing_pin_indent ? parseFloat(firing_pin_indent) : null,
      trigger_weight: trigger_weight ? parseFloat(trigger_weight) : null,
      comments,
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Log Measurement</h3>

        <div style={{ marginBottom: '1rem' }}>
          <label>Headspace:</label>
          <input
            type="number"
            step="0.001"
            value={headspace}
            onChange={(e) => setHeadspace(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Firing Pin Indent:</label>
          <input
            type="number"
            step="0.001"
            value={firing_pin_indent}
            onChange={(e) => setFiringPinIndent(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Trigger Weight:</label>
          <input
            type="number"
            step="0.001"
            value={trigger_weight}
            onChange={(e) => setTriggerWeight(e.target.value)}
            style={{ width: '100%' }}
          />
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
            Save Measurement
          </button>
        </div>
      </div>
    </div>
  );
}
