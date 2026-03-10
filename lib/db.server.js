import Database from 'better-sqlite3';

const db = new Database('pewtrack.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gun_model TEXT NOT NULL,
      caliber TEXT NOT NULL,
      ammunition_type TEXT NOT NULL,
      mag_capacity INTEGER NOT NULL,
      string_length INTEGER NOT NULL,
      planned_rounds INTEGER NOT NULL,
      lubrication_interval INTEGER NOT NULL,
      cleaning_interval INTEGER NOT NULL,
      measurement_interval INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      current_rounds INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS strings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id INTEGER NOT NULL,
      shooter_name TEXT NOT NULL,
      cumulative_rounds_start INTEGER NOT NULL,
      cumulative_rounds_end INTEGER NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(test_id) REFERENCES tests(id)
    );

    CREATE TABLE IF NOT EXISTS stoppages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id INTEGER NOT NULL,
      string_id INTEGER NOT NULL,
      mag_number INTEGER NOT NULL,
      round_number INTEGER NOT NULL,
      stoppage_type TEXT NOT NULL,
      comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(test_id) REFERENCES tests(id),
      FOREIGN KEY(string_id) REFERENCES strings(id)
    );

    CREATE TABLE IF NOT EXISTS measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id INTEGER NOT NULL,
      cumulative_rounds INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'measurement', 'cleaning', 'lubrication'
      performed_by TEXT,
      headspace REAL,
      firing_pin_indent REAL,
      trigger_weight REAL,
      comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(test_id) REFERENCES tests(id)
    );

    -- migration: add performed_by column if not present
  `);

  // migration: add performed_by column if not present
  const info = db.prepare("PRAGMA table_info(measurements)").all();
  const hasPerformedBy = info.some((col) => col.name === 'performed_by');
  if (!hasPerformedBy) {
    db.exec("ALTER TABLE measurements ADD COLUMN performed_by TEXT;");
  }


  console.log('Database initialized');
}

export default db;