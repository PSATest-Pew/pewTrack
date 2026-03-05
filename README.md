# pewTrack – ProArms Tech Live Fire Tracking System

A web-based frontend (React) and backend (Node.js/PostgreSQL) application for tracking live fire testing data by strings, with offline resilience and strict protocol adherence.

## Features

- **Test Initialization**: Define test parameters (gun model, caliber, ammunition, magazine capacity, string length, planned rounds, and maintenance intervals)
- **Dynamic Firing Grid**: Real-time grid display adapting to magazine capacity and string length, with stoppage logging per round
- **Interval Enforcement**: Automatic enforcement of lubrication, cleaning, and measurement intervals
- **Measurement Templates**: Logging of headspace, firing pin indent, trigger weight, and photos
- **Offline Support**: LocalStorage/IndexedDB for offline data queuing and state persistence
- **Test Termination**: Early termination with confirmation, and planned end overrides for extended testing
- **Data Syncing**: Per-string saves to PostgreSQL backend

## Tech Stack

- **Frontend**: React 18 + Next.js 14
- **Backend**: Node.js API with Next.js API routes
- **Database**: PostgreSQL
- **State/Caching**: Browser LocalStorage/IndexedDB (optional)

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL 12+

### Installation

1. Clone or navigate to the project directory
2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables. Copy `.env.local.example` to `.env.local` and update:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your PostgreSQL connection string.

4. Initialize the database (on first run):

```bash
node -e "require('./lib/db').initDb().then(() => console.log('DB initialized')).catch(e => console.error(e))"
```

Or in development mode, the database will auto-initialize on first API call.

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Deployment to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Connect your repository to Vercel at [vercel.com](https://vercel.com)
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NODE_ENV`: `production`
4. Vercel will automatically build and deploy

The `vercel.json` configuration is included for optimal Next.js deployment.

## Project Structure

```
pewTrack/
├── components/           # React components
│   ├── TestSetup.js     # Test initialization form
│   ├── FiringGrid.js    # Dynamic firing grid
│   ├── StoppageModal.js # Stoppage logging modal
│   └── MeasurementModal.js # Measurement template
├── lib/
│   └── db.js            # PostgreSQL connection & schema
├── pages/
│   ├── api/             # Backend API routes
│   │   ├── tests/       # Test CRUD endpoints
│   │   ├── strings.js   # String submission endpoint
│   │   └── measurements.js # Measurement logging endpoint
│   ├── index.js         # Home page (test list & setup)
│   ├── test/[testId].js # Active test page
│   └── _app.js          # App wrapper
├── styles/              # CSS modules
├── public/              # Static assets
├── package.json         # Dependencies & scripts
├── next.config.js       # Next.js configuration
├── vercel.json          # Vercel deployment configuration
└── README.md
```

## API Endpoints

- `POST /api/tests` – Create a new test
- `GET /api/tests` – List recent tests
- `GET /api/tests/[testId]` – Fetch test details with all strings and stoppages
- `PATCH /api/tests/[testId]` – Update test status (e.g., mark as ended)
- `POST /api/strings` – Submit a completed string with stoppages
- `POST /api/measurements` – Log a measurement template

## Database Schema

### tables

- **tests**: gun_model, caliber, ammunition_type, magazine_capacity, string_length, planned_rounds, lubrication_interval, cleaning_interval, inspection_interval, status, created_at, ended_at
- **strings**: test_id, string_number, shooter_name, cumulative_rounds_at_end, completed_at
- **stoppages**: string_id, mag_number, round_number, stoppage_type, comments
- **measurements**: test_id, string_id, cumulative_rounds, headspace, firing_pin_indent, trigger_weight, comments, created_at
- **photos**: test_id, string_id, file_path, caption, created_at

## Contributing

Please follow the existing code style and ensure all features are tested before submitting pull requests.

## License

Proprietary – ProArms Tech
