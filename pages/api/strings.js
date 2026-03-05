import db from '../../../lib/db';

// Use in-memory storage if NO_DB is set
const NO_DB = process.env.NO_DB === 'true';
let inMemoryTests: any[] = [];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { test_id, shooter_name, cumulative_rounds_start, cumulative_rounds_end, notes, stoppages } = req.body;

    if (NO_DB) {
      const test = inMemoryTests.find(t => t.id == test_id);
      if (!test) return res.status(404).json({ error: "Test not found" });
      test.current_rounds = cumulative_rounds_end;
      res.status(200).json({ success: true, stringId: Date.now() });
    } else {
      const insertString = db.prepare(`
        INSERT INTO strings (test_id, shooter_name, cumulative_rounds_start, cumulative_rounds_end, notes)
        VALUES (?, ?, ?, ?, ?)
      `);

      const insertStoppage = db.prepare(`
        INSERT INTO stoppages (test_id, string_id, mag_number, round_number, stoppage_type, comments)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const updateTest = db.prepare(`
        UPDATE tests SET current_rounds = ? WHERE id = ?
      `);

      const transaction = db.transaction(() => {
        const info = insertString.run(test_id, shooter_name, cumulative_rounds_start, cumulative_rounds_end, notes);
        const stringId = info.lastInsertRowid;

        for (const stop of stoppages) {
          insertStoppage.run(test_id, stringId, stop.mag_number, stop.round_number, stop.stoppage_type, stop.comments);
        }

        updateTest.run(cumulative_rounds_end, test_id);
        return stringId;
      });

      try {
        const stringId = transaction();
        res.status(200).json({ success: true, stringId });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save string" });
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}