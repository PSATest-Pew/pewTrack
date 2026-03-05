import express from "express";
import { createServer as createViteServer } from "vite";
import { initDb } from "./db";
import db from "./db";

// Use in-memory storage if NO_DB is set
const NO_DB = process.env.NO_DB === 'true';
let inMemoryTests: any[] = [];
let inMemoryMeasurements: any[] = [];
let testIdCounter = 1;
let measurementIdCounter = 1;

// Initialize Database only if not NO_DB
if (!NO_DB) {
  initDb();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Create a new test
  app.post("/api/tests", (req, res) => {
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
        res.json(newTest);
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

        res.json({ id: info.lastInsertRowid, ...req.body });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create test" });
    }
  });

  // Get active test (or specific test by ID)
  app.get("/api/tests/:id", (req, res) => {
    try {
      if (NO_DB) {
        const test = inMemoryTests.find(t => t.id == req.params.id);
        if (!test) return res.status(404).json({ error: "Test not found" });
        res.json(test);
      } else {
        const test = db.prepare("SELECT * FROM tests WHERE id = ?").get(req.params.id);
        if (!test) return res.status(404).json({ error: "Test not found" });
        res.json(test);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test" });
    }
  });

  // Get all tests
  app.get("/api/tests", (req, res) => {
    try {
      if (NO_DB) {
        res.json(inMemoryTests);
      } else {
        const tests = db.prepare("SELECT * FROM tests ORDER BY created_at DESC").all();
        res.json(tests);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tests" });
    }
  });

  // Submit a completed string
  app.post("/api/strings", (req, res) => {
    const { test_id, shooter_name, cumulative_rounds_start, cumulative_rounds_end, notes, stoppages } = req.body;

    if (NO_DB) {
      const test = inMemoryTests.find(t => t.id == test_id);
      if (!test) return res.status(404).json({ error: "Test not found" });
      test.current_rounds = cumulative_rounds_end;
      res.json({ success: true, stringId: Date.now() });
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
        res.json({ success: true, stringId });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save string" });
      }
    }
  });

  // Log a measurement/maintenance action
  app.post("/api/measurements", (req, res) => {
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
        res.json({ success: true });
      } else {
        const stmt = db.prepare(`
          INSERT INTO measurements (test_id, cumulative_rounds, type, performed_by, headspace, firing_pin_indent, trigger_weight, comments)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(test_id, cumulative_rounds, type, performed_by || null, headspace, firing_pin_indent, trigger_weight, comments);
        res.json({ success: true });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to log measurement" });
    }
  });

  // Get measurements for a test
  app.get("/api/tests/:id/measurements", (req, res) => {
    try {
      if (NO_DB) {
        const measurements = inMemoryMeasurements.filter(m => m.test_id == req.params.id);
        res.json(measurements);
      } else {
        const measurements = db.prepare("SELECT * FROM measurements WHERE test_id = ? ORDER BY created_at DESC").all(req.params.id);
        res.json(measurements);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch measurements" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve static files from dist
    app.use(express.static("dist"));
    
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile("index.html", { root: "dist" });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
