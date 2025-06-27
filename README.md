# CineMatch - Movie Discovery Platform

A modern movie discovery web application built with React, Express.js, and PostgreSQL, featuring comprehensive movie filtering, personalized recommendations, and TMDB API integration.

## Features

- **Movie Discovery**: Browse popular, trending, and top-rated movies
- **Advanced Filtering**: Filter by genre, region (Hollywood, Bollywood, Korean), rating, and duration
- **No Sign-in Required**: Browse movies without authentication
- **User Authentication**: Optional Replit Auth for personalized features
- **Cast Information**: View cast details for movies
- **Trailer Support**: Watch movie trailers
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **External API**: The Movie Database (TMDB)

## Local Development Setup

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 14 or higher
- TMDB API key

### Environment Variables

Create a `.env` file in the root directory with:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/cinematch

# TMDB API
TMDB_API_KEY=your_tmdb_api_key_here

# Session (generate a random string)
SESSION_SECRET=your_session_secret_here

# Replit Auth (optional - for authentication features)
REPL_ID=your_repl_id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=localhost:5000
```

### Installation

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Set up PostgreSQL database**:
```bash
# Create database
createdb cinematch

# Push database schema
npm run db:push
```

3. **Start the development server**:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

## Production Deployment

### Build the application:
```bash
npm run build
```

### Start production server:
```bash
npm run start
```

## API Endpoints

- `GET /api/movies` - Get movies with filtering
- `GET /api/movies/trending` - Get trending movies
- `GET /api/genres` - Get movie genres
- `POST /api/tmdb/sync/popular` - Sync popular movies
- `POST /api/tmdb/sync/bollywood` - Sync Bollywood movies
- `POST /api/tmdb/sync/korean` - Sync Korean movies
- `POST /api/tmdb/sync/top-rated` - Sync top-rated movies

## Database Schema

The application uses the following main tables:
- `users` - User accounts
- `movies` - Movie information with cast data
- `watchlist` - User watchlists
- `favorites` - User favorites
- `ratings` - User movie ratings
- `sessions` - Session storage

## Configuration

### TMDB API Setup
1. Create an account at [TMDB](https://www.themoviedb.org/)
2. Get your API key from account settings
3. Add it to your `.env` file

### Database Configuration
The app uses PostgreSQL with Drizzle ORM. The schema is automatically synced using `npm run db:push`.

## Troubleshooting

### Common Issues

1. **Database connection errors**: Ensure PostgreSQL is running and DATABASE_URL is correct
2. **TMDB API errors**: Verify your API key is valid and has proper permissions
3. **Build errors**: Run `npm install` to ensure all dependencies are installed

### Development Tips

- Use `npm run db:studio` to inspect and manage your database
- Check the browser console for client-side errors
- Monitor the server logs for API issues

## License

This project is open source and available under the MIT License.