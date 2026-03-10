// Use in-memory storage if NO_DB is set
const NO_DB = process.env.NO_DB === 'true';
// db disabled for frontend-only mode
if (!NO_DB) {
  db = dbModule.default;
  dbModule.initDb();
}
let inMemoryTests = [];
let inMemoryMeasurements = [];
let testIdCounter = 1;
let measurementIdCounter = 1;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const {
        gun_model,
        caliber,
        ammunition_type,
        mag_capacity,
        string_length,
        planned_rounds,
        lubrication_interval,
        cleaning_interval,
        measurement_interval,
      } = req.body;

      if (NO_DB) {
        const newTest = {
          id: testIdCounter++,
          gun_model,
          caliber,
          ammunition_type,
          mag_capacity,
          string_length,
          planned_rounds,
          lubrication_interval,
          cleaning_interval,
          measurement_interval,
          status: 'active',
          current_rounds: 0,
          created_at: new Date().toISOString(),
        };
        inMemoryTests.push(newTest);
        res.status(201).json(newTest);
      } else {
        const stmt = db.prepare(`
          INSERT INTO tests (
            gun_model, caliber, ammunition_type, mag_capacity, string_length,
            planned_rounds, lubrication_interval, cleaning_interval, measurement_interval
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const info = stmt.run(
          gun_model,
          caliber,
          ammunition_type,
          mag_capacity,
          string_length,
          planned_rounds,
          lubrication_interval,
          cleaning_interval,
          measurement_interval
        );

        res.status(201).json({ id: info.lastInsertRowid, ...req.body });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create test" });
    }
  } else if (req.method === 'GET') {
    try {
      if (NO_DB) {
        res.status(200).json(inMemoryTests);
      } else {
        const tests = db.prepare("SELECT * FROM tests ORDER BY created_at DESC").all();
        res.status(200).json(tests);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch tests" });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}