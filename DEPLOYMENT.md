# Local Deployment Guide

## Quick Start

1. **Download the project** from Replit or clone the repository
2. **Install dependencies**: `npm install`
3. **Set up environment variables** (see below)
4. **Set up PostgreSQL database** (see below)
5. **Run the application**: `npm run dev`

## Environment Setup

### 1. Copy the environment file
```bash
cp .env.example .env
```

### 2. Get TMDB API Key
1. Visit [The Movie Database](https://www.themoviedb.org/)
2. Create a free account
3. Go to Settings > API
4. Copy your API Read Access Token
5. Add it to your `.env` file as `TMDB_API_KEY`

### 3. Configure Database
Edit your `.env` file with your PostgreSQL credentials:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/cinematch
```

## Database Setup

### Option 1: Using PostgreSQL locally

1. **Install PostgreSQL** (if not already installed)
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)
   - Mac: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql`

2. **Create database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE cinematch;
   
   # Create user (optional)
   CREATE USER cinematch_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE cinematch TO cinematch_user;
   ```

3. **Push database schema**
   ```bash
   npm run db:push
   ```

### Option 2: Using Docker (Alternative)

```bash
# Run PostgreSQL in Docker
docker run -d \
  --name cinematch-db \
  -e POSTGRES_DB=cinematch \
  -e POSTGRES_USER=cinematch_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  postgres:14

# Update your .env file accordingly
DATABASE_URL=postgresql://cinematch_user:your_password@localhost:5432/cinematch
```

## Running the Application

### Development Mode
```bash
npm run dev
```
The app will be available at `http://localhost:5000`

### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Initial Data Setup

After starting the application, you can populate it with movies by visiting:
- Navigate to the homepage
- The app will automatically sync popular movies, Bollywood films, Korean movies, and top-rated content
- This happens automatically when the database is empty

Or manually trigger sync via API:
```bash
# Sync popular movies
curl -X POST http://localhost:5000/api/tmdb/sync/popular

# Sync Bollywood movies
curl -X POST http://localhost:5000/api/tmdb/sync/bollywood

# Sync Korean movies
curl -X POST http://localhost:5000/api/tmdb/sync/korean

# Sync top-rated movies
curl -X POST http://localhost:5000/api/tmdb/sync/top-rated
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `pg_ctl status`
- Check your DATABASE_URL format
- Verify database exists: `psql -U postgres -l`

### TMDB API Issues
- Verify your API key is correct
- Check you're using the API Read Access Token, not the API Key
- Ensure you have proper permissions

### Port Issues
- If port 5000 is in use, modify `server/index.ts` to use a different port
- Update REPLIT_DOMAINS in `.env` accordingly

### Build Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`

## Features Available Without Authentication

- Browse movies (popular, trending, top-rated)
- Filter by genre, region, rating, duration
- Search movies
- View movie details
- Watch trailers

## Features Requiring Authentication

- Personal watchlist
- Favorites
- Movie ratings
- User preferences

Note: Authentication is optional and uses Replit Auth. For local development, these features will be disabled unless you configure Replit Auth properly.