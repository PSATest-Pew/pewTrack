/**
 * PewTrack client-side data store
 * Wraps localStorage so all pages share consistent test/measurement/string data.
 * Falls back to in-memory when localStorage is unavailable (SSR).
 */

const KEYS = {
  tests: 'pewtrack_tests',
  strings: 'pewtrack_strings',
  measurements: 'pewtrack_measurements',
  stoppages: 'pewtrack_stoppages',
};

// Seed data so the demo isn't empty on first visit
const SEED_TESTS = [
  {
    id: 1,
    gun_model: 'M4 Carbine',
    caliber: '5.56 NATO',
    ammunition_type: 'M855 62gr',
    mag_capacity: 30,
    string_length: 30,
    planned_rounds: 1000,
    lubrication_interval: 300,
    cleaning_interval: 500,
    measurement_interval: 250,
    measurement_fields: ['headspace', 'firing_pin_indent', 'trigger_weight'],
    status: 'active',
    current_rounds: 250,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 2,
    gun_model: 'Glock 19',
    caliber: '9mm',
    ammunition_type: 'FMJ 124gr',
    mag_capacity: 15,
    string_length: 30,
    planned_rounds: 500,
    lubrication_interval: 250,
    cleaning_interval: 500,
    measurement_interval: 250,
    measurement_fields: ['trigger_weight'],
    status: 'completed',
    current_rounds: 500,
    planned_rounds: 500,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

const SEED_MEASUREMENTS = [
  {
    id: 1,
    test_id: 1,
    cumulative_rounds: 250,
    type: 'measurement',
    performed_by: 'Operator 1',
    headspace: '1.635',
    firing_pin_indent: '0.065',
    trigger_weight: '5.2',
    comments: 'Initial measurement before test',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    test_id: 1,
    cumulative_rounds: 500,
    type: 'cleaning',
    performed_by: 'Operator 1',
    headspace: '',
    firing_pin_indent: '',
    trigger_weight: '',
    comments: 'Routine cleaning after 500 rounds',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

function isBrowser() {
  return typeof window !== 'undefined';
}

function read(key) {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, data) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
}

/** Ensure seed data exists on first visit */
function ensureSeeded() {
  if (!isBrowser()) return;
  if (localStorage.getItem('pewtrack_seeded')) return;
  write(KEYS.tests, SEED_TESTS);
  write(KEYS.measurements, SEED_MEASUREMENTS);
  write(KEYS.strings, []);
  write(KEYS.stoppages, []);
  localStorage.setItem('pewtrack_seeded', '1');
}

// --- Public API ---

export function getAllTests() {
  ensureSeeded();
  return read(KEYS.tests) || [];
}

export function getTest(id) {
  const tests = getAllTests();
  return tests.find((t) => String(t.id) === String(id)) || null;
}

export function createTest(data) {
  const tests = getAllTests();
  const newTest = {
    id: Date.now(),
    ...data,
    mag_capacity: parseInt(data.mag_capacity) || 30,
    string_length: parseInt(data.string_length) || 30,
    planned_rounds: parseInt(data.planned_rounds) || 1000,
    lubrication_interval: parseInt(data.lubrication_interval) || 500,
    cleaning_interval: parseInt(data.cleaning_interval) || 500,
    measurement_interval: parseInt(data.measurement_interval) || 250,
    measurement_fields: data.measurement_fields || [],
    status: 'active',
    current_rounds: 0,
    created_at: new Date().toISOString(),
  };
  tests.unshift(newTest);
  write(KEYS.tests, tests);
  return newTest;
}

export function updateTest(id, updates) {
  const tests = getAllTests();
  const idx = tests.findIndex((t) => String(t.id) === String(id));
  if (idx === -1) return null;
  tests[idx] = { ...tests[idx], ...updates };
  write(KEYS.tests, tests);
  return tests[idx];
}

export function getMeasurements(testId) {
  ensureSeeded();
  const all = read(KEYS.measurements) || [];
  return all
    .filter((m) => String(m.test_id) === String(testId))
    .sort((a, b) => b.cumulative_rounds - a.cumulative_rounds);
}

export function addMeasurement(data) {
  const all = read(KEYS.measurements) || [];
  const entry = {
    id: Date.now(),
    ...data,
    created_at: new Date().toISOString(),
  };
  all.push(entry);
  write(KEYS.measurements, all);
  return entry;
}

export function getStrings(testId) {
  ensureSeeded();
  const all = read(KEYS.strings) || [];
  return all
    .filter((s) => String(s.test_id) === String(testId))
    .sort((a, b) => b.cumulative_rounds_end - a.cumulative_rounds_end);
}

export function addString(data) {
  const all = read(KEYS.strings) || [];
  const entry = {
    id: Date.now(),
    ...data,
    created_at: new Date().toISOString(),
  };
  all.push(entry);
  write(KEYS.strings, all);
  return entry;
}

export function getStoppages(testId) {
  ensureSeeded();
  const all = read(KEYS.stoppages) || [];
  return all.filter((s) => String(s.test_id) === String(testId));
}

export function addStoppages(testId, stringId, stoppagesArr) {
  const all = read(KEYS.stoppages) || [];
  const entries = stoppagesArr.map((s, i) => ({
    id: Date.now() + i,
    test_id: testId,
    string_id: stringId,
    ...s,
    created_at: new Date().toISOString(),
  }));
  all.push(...entries);
  write(KEYS.stoppages, all);
  return entries;
}

/** Reset demo data — useful for testing */
export function resetAllData() {
  if (!isBrowser()) return;
  localStorage.removeItem('pewtrack_seeded');
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  ensureSeeded();
}
