// Use in-memory storage if NO_DB is set
const NO_DB = process.env.NO_DB === 'true';
// db disabled for frontend-only mode
if (!NO_DB) {
}
let inMemoryTests = [];
let inMemoryMeasurements = [];

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      if (NO_DB) {
        const test = inMemoryTests.find(t => t.id == id);
        if (!test) return res.status(404).json({ error: "Test not found" });
        res.status(200).json(test);
      } else {
        const test = db.prepare("SELECT * FROM tests WHERE id = ?").get(id);
        if (!test) return res.status(404).json({ error: "Test not found" });
        res.status(200).json(test);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test" });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}