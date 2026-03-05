import db from '../../../lib/db';

// Use in-memory storage if NO_DB is set
const NO_DB = process.env.NO_DB === 'true';
let inMemoryMeasurements: any[] = [];
let measurementIdCounter = 1;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { test_id, cumulative_rounds, type, performed_by, headspace, firing_pin_indent, trigger_weight, comments } = req.body;

      if (NO_DB) {
        const newMeasurement = {
          id: measurementIdCounter++,
          test_id,
          cumulative_rounds,
          type,
          performed_by: performed_by || null,
          headspace,
          firing_pin_indent,
          trigger_weight,
          comments,
          created_at: new Date().toISOString(),
        };
        inMemoryMeasurements.push(newMeasurement);
        res.status(200).json({ success: true });
      } else {
        const stmt = db.prepare(`
          INSERT INTO measurements (test_id, cumulative_rounds, type, performed_by, headspace, firing_pin_indent, trigger_weight, comments)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(test_id, cumulative_rounds, type, performed_by || null, headspace, firing_pin_indent, trigger_weight, comments);
        res.status(200).json({ success: true });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to log measurement" });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}