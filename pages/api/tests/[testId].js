import { query } from '../../../lib/db';

export default async function handler(req, res) {
  const { testId } = req.query;

  if (req.method === 'GET') {
    try {
      const testResult = await query('SELECT * FROM tests WHERE id = $1', [testId]);
      if (testResult.rows.length === 0) {
        return res.status(404).json({ error: 'Test not found' });
      }

      const stringsResult = await query(
        'SELECT * FROM strings WHERE test_id = $1 ORDER BY string_number ASC',
        [testId]
      );

      const stoppagesResult = await query(
        `SELECT s.* FROM stoppages s
         JOIN strings st ON s.string_id = st.id
         WHERE st.test_id = $1`,
        [testId]
      );

      const measurementsResult = await query(
        'SELECT * FROM measurements WHERE test_id = $1 ORDER BY created_at ASC',
        [testId]
      );

      res.status(200).json({
        test: testResult.rows[0],
        strings: stringsResult.rows,
        stoppages: stoppagesResult.rows,
        measurements: measurementsResult.rows,
      });
    } catch (error) {
      console.error('GET /api/tests/[testId] error:', error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { status } = req.body;
      const result = await query(
        'UPDATE tests SET status = $1, ended_at = NOW() WHERE id = $2 RETURNING *',
        [status, testId]
      );
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('PATCH /api/tests/[testId] error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
