# Quick Start Guide

## Local Development with PostgreSQL

### 1. Install PostgreSQL

Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/).

After installation, create a database:

```bash
createdb pewtrack
```

### 2. Configure Environment

Create `.env.local` in the project root:

```bash
DATABASE_URL=postgresql://localhost/pewtrack
NODE_ENV=development
```

On Windows, you may need to specify username/password:

```bash
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/pewtrack
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

On first API call, the database schema will be created automatically.

### 5. Open the App

- Navigate to `http://localhost:3000`
- Click **"Start Test"** to initialize a new live fire test
- Fill in gun model, caliber, ammunition, magazine capacity, string length, planned rounds, and maintenance intervals
- You'll be redirected to the active test page with the firing grid
- Click cells to log stoppages, enter shooter name, and complete strings
- Stoppages and measurements are saved to PostgreSQL

## Deploying to Vercel

### Prerequisites

- A Git repository (GitHub, GitLab, Bitbucket)
- A PostgreSQL database accessible from the internet (e.g., AWS RDS, Render, Supabase)
- A Vercel account

### Steps

1. Push your code to Git:

```bash
git add .
git commit -m "Initial pewTrack implementation"
git push origin main
```

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click **"New Project"** and select your repository

4. In **Environment Variables**, add:
   - `DATABASE_URL`: Your hosted PostgreSQL connection string
   - `NODE_ENV`: `production`

5. Click **Deploy** – Vercel will automatically build and deploy

Once deployed, your app is live! The API routes handle database initialization.

## Troubleshooting

### "connection refused" error

- Ensure PostgreSQL is running
- Verify `DATABASE_URL` is correct in `.env.local`
- On Windows, check the PostgreSQL service is started

### Grid not rendering

- Ensure magazine_capacity and string_length are valid integers
- Check browser console for JavaScript errors

### Data not saving

- Check that the backend API route is accessible (`/api/tests`)
- Verify PostgreSQL is connected and schema exists
- Check browser network tab for failed requests

## Next Steps

- Add offline support with IndexedDB
- Implement photo upload functionality
- Add data export (CSV/PDF reports)
- Create admin dashboard for test analytics
- Add user authentication and role-based access
