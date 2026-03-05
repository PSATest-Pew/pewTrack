import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/pewtrack',
});

export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database error', error);
    throw error;
  }
}

export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gun_model VARCHAR(255) NOT NULL,
        caliber VARCHAR(50) NOT NULL,
        ammunition_type VARCHAR(255),
        magazine_capacity INTEGER NOT NULL,
        string_length INTEGER NOT NULL,
        planned_rounds INTEGER NOT NULL,
        lubrication_interval INTEGER NOT NULL,
        cleaning_interval INTEGER NOT NULL,
        inspection_interval INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS strings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
        string_number INTEGER NOT NULL,
        shooter_name VARCHAR(255),
        cumulative_rounds_at_end INTEGER NOT NULL,
        completed_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS stoppages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        string_id UUID NOT NULL REFERENCES strings(id) ON DELETE CASCADE,
        mag_number INTEGER NOT NULL,
        round_number INTEGER NOT NULL,
        stoppage_type VARCHAR(255) NOT NULL,
        comments TEXT
      );

      CREATE TABLE IF NOT EXISTS measurements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
        string_id UUID REFERENCES strings(id) ON DELETE SET NULL,
        cumulative_rounds INTEGER NOT NULL,
        headspace DECIMAL(10, 3),
        firing_pin_indent DECIMAL(10, 3),
        trigger_weight DECIMAL(10, 3),
        comments TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
        string_id UUID REFERENCES strings(id) ON DELETE SET NULL,
        file_path VARCHAR(255),
        caption TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_strings_test_id ON strings(test_id);
      CREATE INDEX IF NOT EXISTS idx_stoppages_string_id ON stoppages(string_id);
      CREATE INDEX IF NOT EXISTS idx_measurements_test_id ON measurements(test_id);
      CREATE INDEX IF NOT EXISTS idx_photos_test_id ON photos(test_id);
    `);
    console.log('Database initialized');
  } finally {
    client.release();
  }
}

export default pool;
