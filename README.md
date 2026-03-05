<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PewTrack - Live Fire Tracking System

A comprehensive live fire tracking system for firearms testing and maintenance.

## Frontend Demo

This is a **frontend-only demo** version of PewTrack, designed for stakeholder analysis and demonstration purposes. All data is mocked and stored locally in the browser.

### Features

- **Test Management**: Create and manage firearm testing sessions
- **Live Tracking**: Interactive firing grid with stoppage logging
- **Maintenance Tracking**: Automated maintenance intervals and measurements
- **Measurement History**: View historical maintenance and measurement data

### Demo Data

The application includes pre-populated mock data:
- Sample test configurations (M4 Carbine, Glock 19)
- Simulated firing progress and maintenance schedules
- Example measurements and maintenance records

### Deployment

This project is configured for deployment on Vercel with no backend requirements.

1. Connect your GitHub repository to Vercel
2. Deploy automatically - no build configuration needed
3. The app will run entirely in the browser with local storage

### Local Development (No Node.js Required)

Since this is a frontend-only demo, you can:
1. Open the built files directly in a browser
2. Use Vercel's deployment preview
3. All functionality works without a server

### Architecture

- **Framework**: Next.js for static generation
- **Styling**: Tailwind CSS
- **State Management**: React hooks with localStorage persistence
- **Mock Data**: Pre-configured demo data for immediate testing

### Navigation

- `/` - Dashboard with test overview
- `/new` - Create new test configuration
- `/test/[id]` - Active test interface with firing grid
- `/measurements/[id]` - View maintenance history
