import { v4 as uuidv4 } from 'uuid';
import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const {
        test_id,
        string_id,
        cumulative_rounds,
        headspace,
        firing_pin_indent,
        trigger_weight,
        comments,
      } = req.body;

      const result = await query(
        `INSERT INTO measurements (
          id, test_id, string_id, cumulative_rounds,
          headspace, firing_pin_indent, trigger_weight, comments
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          uuidv4(),
          test_id,
          string_id,
          cumulative_rounds,
          headspace,
          firing_pin_indent,
          trigger_weight,
          comments,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('POST /api/measurements error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
