import { v4 as uuidv4 } from 'uuid';
import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const {
        test_id,
        string_number,
        shooter_name,
        cumulative_rounds_at_end,
        stoppages,
      } = req.body;

      const stringId = uuidv4();
      const stringResult = await query(
        `INSERT INTO strings (id, test_id, string_number, shooter_name, cumulative_rounds_at_end)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [stringId, test_id, string_number, shooter_name, cumulative_rounds_at_end]
      );

      if (stoppages && stoppages.length > 0) {
        for (const stoppage of stoppages) {
          await query(
            `INSERT INTO stoppages (id, string_id, mag_number, round_number, stoppage_type, comments)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              uuidv4(),
              stringId,
              stoppage.mag_number,
              stoppage.round_number,
              stoppage.stoppage_type,
              stoppage.comments,
            ]
          );
        }
      }

      res.status(201).json(stringResult.rows[0]);
    } catch (error) {
      console.error('POST /api/strings error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
