// Use in-memory storage if NO_DB is set
const NO_DB = process.env.NO_DB === 'true';
// db disabled for frontend-only mode
if (!NO_DB) {
}
let inMemoryMeasurements = [];

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      if (NO_DB) {
        const measurements = inMemoryMeasurements.filter(m => m.test_id == id);
        res.status(200).json(measurements);
      } else {
        const measurements = db.prepare("SELECT * FROM measurements WHERE test_id = ? ORDER BY created_at DESC").all(id);
        res.status(200).json(measurements);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch measurements" });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}