import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function NewTest() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    gun_model: '',
    caliber: '',
    ammunition_type: '',
    mag_capacity: '',
    string_length: '',
    planned_rounds: '',
    lubrication_interval: '',
    cleaning_interval: '',
    measurement_interval: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock API call for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockTest = {
        id: Date.now(),
        ...formData,
        mag_capacity: parseInt(formData.mag_capacity),
        string_length: parseInt(formData.string_length),
        planned_rounds: parseInt(formData.planned_rounds),
        lubrication_interval: parseInt(formData.lubrication_interval),
        cleaning_interval: parseInt(formData.cleaning_interval),
        measurement_interval: parseInt(formData.measurement_interval),
        status: 'active',
        current_rounds: 0,
        created_at: new Date().toISOString()
      };

      // Store in localStorage for demo
      const existingTests = JSON.parse(localStorage.getItem('pewtrack_tests') || '[]');
      existingTests.push(mockTest);
      localStorage.setItem('pewtrack_tests', JSON.stringify(existingTests));

      router.push(`/test/${mockTest.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 p-8 rounded-xl border border-zinc-800">
        <h1 className="text-2xl font-bold mb-6 text-center">Initialize New Test</h1>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Gun Model</label>
            <input
              type="text"
              name="gun_model"
              value={formData.gun_model}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Caliber</label>
            <input
              type="text"
              name="caliber"
              value={formData.caliber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ammunition Type</label>
            <input
              type="text"
              name="ammunition_type"
              value={formData.ammunition_type}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Magazine Capacity</label>
            <input
              type="number"
              name="mag_capacity"
              value={formData.mag_capacity}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">String Length</label>
            <input
              type="number"
              name="string_length"
              value={formData.string_length}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Planned Rounds</label>
            <input
              type="number"
              name="planned_rounds"
              value={formData.planned_rounds}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lubrication Interval</label>
            <input
              type="number"
              name="lubrication_interval"
              value={formData.lubrication_interval}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cleaning Interval</label>
            <input
              type="number"
              name="cleaning_interval"
              value={formData.cleaning_interval}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Measurement Interval</label>
            <input
              type="number"
              name="measurement_interval"
              value={formData.measurement_interval}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Start Test'}
          </button>
        </form>
      </div>
    </div>
  );
}