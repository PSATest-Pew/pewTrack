import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Form';
import { CALIBERS, AMMO_TYPES } from '@/lib/utils';

export default function NewTest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    gun_model: '',
    caliber: CALIBERS[0],
    ammunition_type: AMMO_TYPES[CALIBERS[0] as keyof typeof AMMO_TYPES][0],
    mag_capacity: 30,
    string_length: 100,
    planned_rounds: 5000,
    lubrication_interval: 500,
    cleaning_interval: 1000,
    measurement_interval: 2000,
  });

  const handleCaliberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCaliber = e.target.value;
    setFormData({
      ...formData,
      caliber: newCaliber,
      ammunition_type: AMMO_TYPES[newCaliber as keyof typeof AMMO_TYPES]?.[0] || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to create test');

      const data = await res.json();
      navigate(`/test/${data.id}`);
    } catch (error) {
      console.error(error);
      alert('Error creating test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Initialize New Test</h1>
        <p className="text-zinc-400 mt-2">Configure test parameters and protocols.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <Input
              label="Gun Model"
              value={formData.gun_model}
              onChange={(e) => setFormData({ ...formData, gun_model: e.target.value })}
              required
              placeholder="e.g. ProArms X-15 Prototype"
            />
          </div>

          <Select
            label="Caliber"
            options={CALIBERS.map((c) => ({ value: c, label: c }))}
            value={formData.caliber}
            onChange={handleCaliberChange}
          />

          <Select
            label="Ammunition Type"
            options={
              AMMO_TYPES[formData.caliber as keyof typeof AMMO_TYPES]?.map((a) => ({
                value: a,
                label: a,
              })) || []
            }
            value={formData.ammunition_type}
            onChange={(e) => setFormData({ ...formData, ammunition_type: e.target.value })}
          />

          <Input
            label="Magazine Capacity"
            type="number"
            value={formData.mag_capacity}
            onChange={(e) => setFormData({ ...formData, mag_capacity: parseInt(e.target.value) })}
            required
            min={1}
          />

          <Input
            label="Rounds Per String"
            type="number"
            value={formData.string_length}
            onChange={(e) => setFormData({ ...formData, string_length: parseInt(e.target.value) })}
            required
            min={1}
          />

          <Input
            label="Planned Total Rounds"
            type="number"
            value={formData.planned_rounds}
            onChange={(e) => setFormData({ ...formData, planned_rounds: parseInt(e.target.value) })}
            required
            min={1}
          />
        </div>

        <div className="border-t border-zinc-800 pt-6">
          <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">Maintenance Intervals</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Lubrication (Rds)"
              type="number"
              value={formData.lubrication_interval}
              onChange={(e) => setFormData({ ...formData, lubrication_interval: parseInt(e.target.value) })}
              required
            />
            <Input
              label="Cleaning (Rds)"
              type="number"
              value={formData.cleaning_interval}
              onChange={(e) => setFormData({ ...formData, cleaning_interval: parseInt(e.target.value) })}
              required
            />
            <Input
              label="Measurement (Rds)"
              type="number"
              value={formData.measurement_interval}
              onChange={(e) => setFormData({ ...formData, measurement_interval: parseInt(e.target.value) })}
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? 'Initializing...' : 'Start Test'}
          </Button>
        </div>
      </form>
    </div>
  );
}
