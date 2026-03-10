import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Crosshair } from 'lucide-react';
import { CALIBERS, AMMO_TYPES } from '../lib/utils';
import { createTest } from '../lib/store';

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

  const ammoOptions = formData.caliber ? (AMMO_TYPES[formData.caliber] || []) : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Reset ammo type when caliber changes
      if (name === 'caliber' && prev.caliber !== value) {
        next.ammunition_type = '';
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const newTest = createTest(formData);
      router.push(`/test/${newTest.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all';
  const labelClass = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-lg mx-auto pt-8 md:pt-12">
        {/* Back link */}
        <Link href="/">
          <span className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </span>
        </Link>

        <div className="bg-zinc-900 p-6 md:p-8 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3 mb-6">
            <Crosshair className="w-6 h-6 text-emerald-500" />
            <h1 className="text-xl font-bold">Initialize New Test</h1>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Weapon Info */}
            <fieldset>
              <legend className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                Weapon Information
              </legend>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Gun Model</label>
                  <input
                    type="text"
                    name="gun_model"
                    value={formData.gun_model}
                    onChange={handleChange}
                    required
                    placeholder="e.g. M4 Carbine, Glock 19"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Caliber</label>
                    <select
                      name="caliber"
                      value={formData.caliber}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    >
                      <option value="">Select caliber</option>
                      {CALIBERS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Ammunition Type</label>
                    <select
                      name="ammunition_type"
                      value={formData.ammunition_type}
                      onChange={handleChange}
                      required
                      disabled={!formData.caliber}
                      className={`${inputClass} ${!formData.caliber ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">{formData.caliber ? 'Select ammo' : 'Select caliber first'}</option>
                      {ammoOptions.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Test Parameters */}
            <fieldset>
              <legend className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                Test Parameters
              </legend>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Mag Capacity</label>
                    <input
                      type="number"
                      name="mag_capacity"
                      value={formData.mag_capacity}
                      onChange={handleChange}
                      required
                      min="1"
                      placeholder="30"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>String Length</label>
                    <input
                      type="number"
                      name="string_length"
                      value={formData.string_length}
                      onChange={handleChange}
                      required
                      min="1"
                      placeholder="30"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Planned Rounds</label>
                    <input
                      type="number"
                      name="planned_rounds"
                      value={formData.planned_rounds}
                      onChange={handleChange}
                      required
                      min="1"
                      placeholder="1000"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Intervals */}
            <fieldset>
              <legend className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                Maintenance Intervals (rounds)
              </legend>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Lubrication</label>
                  <input
                    type="number"
                    name="lubrication_interval"
                    value={formData.lubrication_interval}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="300"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Cleaning</label>
                  <input
                    type="number"
                    name="cleaning_interval"
                    value={formData.cleaning_interval}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="500"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Measurement</label>
                  <input
                    type="number"
                    name="measurement_interval"
                    value={formData.measurement_interval}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="250"
                    className={inputClass}
                  />
                </div>
              </div>
            </fieldset>

            <div className="flex gap-3 pt-2">
              <Link href="/" className="flex-1">
                <button
                  type="button"
                  className="w-full py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {loading ? 'Creating...' : 'Start Test'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
