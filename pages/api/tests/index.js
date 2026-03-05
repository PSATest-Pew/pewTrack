import { v4 as uuidv4 } from 'uuid';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const {
        gun_model,
        caliber,
        ammunition_type,
        magazine_capacity,
        string_length,
        planned_rounds,
        lubrication_interval,
        cleaning_interval,
        inspection_interval,
      } = req.body;

      const testId = uuidv4();
      const result = await query(
        `INSERT INTO tests (
          id, gun_model, caliber, ammunition_type, magazine_capacity,
          string_length, planned_rounds, lubrication_interval,
          cleaning_interval, inspection_interval, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          testId,
          gun_model,
          caliber,
          ammunition_type,
          magazine_capacity,
          string_length,
          planned_rounds,
          lubrication_interval,
          cleaning_interval,
          inspection_interval,
          'active',
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('POST /api/tests error:', error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const result = await query(
        'SELECT * FROM tests ORDER BY created_at DESC LIMIT 50'
      );
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('GET /api/tests error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
