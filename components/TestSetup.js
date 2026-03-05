import { useState, useEffect } from 'react';

export default function TestSetup({ onTestCreated }) {
  const [formData, setFormData] = useState({
    gun_model: '',
    caliber: '',
    ammunition_type: '',
    magazine_capacity: '',
    string_length: '',
    planned_rounds: '',
    lubrication_interval: '',
    cleaning_interval: '',
    inspection_interval: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          magazine_capacity: parseInt(formData.magazine_capacity),
          string_length: parseInt(formData.string_length),
          planned_rounds: parseInt(formData.planned_rounds),
          lubrication_interval: parseInt(formData.lubrication_interval),
          cleaning_interval: parseInt(formData.cleaning_interval),
          inspection_interval: parseInt(formData.inspection_interval),
        }),
      });

      if (!response.ok) throw new Error('Failed to create test');

      const test = await response.json();
      onTestCreated(test);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <h2>Initialize Test</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Gun Model:</label>
          <input
            type="text"
            name="gun_model"
            value={formData.gun_model}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Caliber:</label>
          <input
            type="text"
            name="caliber"
            value={formData.caliber}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Ammunition Type:</label>
          <input
            type="text"
            name="ammunition_type"
            value={formData.ammunition_type}
            onChange={handleChange}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Magazine Capacity:</label>
          <input
            type="number"
            name="magazine_capacity"
            value={formData.magazine_capacity}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>String Length (total rounds per string):</label>
          <input
            type="number"
            name="string_length"
            value={formData.string_length}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Planned Total Rounds:</label>
          <input
            type="number"
            name="planned_rounds"
            value={formData.planned_rounds}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Lubrication Interval (cumulative rounds):</label>
          <input
            type="number"
            name="lubrication_interval"
            value={formData.lubrication_interval}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Cleaning Interval (cumulative rounds):</label>
          <input
            type="number"
            name="cleaning_interval"
            value={formData.cleaning_interval}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Inspection/Measurement Interval (cumulative rounds):</label>
          <input
            type="number"
            name="inspection_interval"
            value={formData.inspection_interval}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'Creating Test...' : 'Start Test'}
        </button>
      </form>
    </div>
  );
}
