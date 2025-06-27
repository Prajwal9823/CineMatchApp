# CineMatch - Movie Discovery Platform

## Overview

CineMatch is a modern movie discovery web application built with a full-stack architecture featuring React frontend, Express.js backend, and PostgreSQL database. The application provides advanced movie filtering, personalized recommendations, and comprehensive movie management features including watchlists, favorites, and ratings.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom cinema theme variables
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js 20 with ES modules
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: express-session with PostgreSQL store
- **API Structure**: RESTful API design with structured error handling

### Database Architecture
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM with schema-first approach
- **Schema Location**: `shared/schema.ts` for type sharing between frontend and backend
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation and profile management
- **Security**: HTTP-only cookies with secure flags for production

### Movie Discovery Engine
- **Data Source**: The Movie Database (TMDB) API integration
- **Search Capabilities**: Real-time movie search with pagination
- **Filtering System**: Multi-dimensional filtering by genre, region, rating, release year, runtime, and age rating
- **Trending System**: Dynamic trending movies display

### User Features
- **Watchlist Management**: Add/remove movies from personal watchlist
- **Favorites System**: Mark movies as favorites with quick access
- **Rating System**: User-generated movie ratings (1-10 scale)
- **User Preferences**: Customizable user preferences and settings

### Data Management
- **Schema Design**: Normalized database schema with relationships
- **Type Safety**: Full TypeScript integration with Drizzle Zod validation
- **Data Synchronization**: Real-time updates between frontend and backend

## Data Flow

1. **Authentication Flow**: User authenticates via Replit Auth → Session created in PostgreSQL → User profile stored/updated
2. **Movie Discovery**: Frontend requests movies → Backend queries TMDB API → Data cached in local database → Filtered results returned
3. **User Actions**: Frontend sends action (watchlist/favorite) → Backend validates and stores → Database updated → Frontend cache invalidated
4. **Real-time Updates**: TanStack Query manages cache invalidation and refetching for seamless user experience

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection with serverless support
- **@tanstack/react-query**: Powerful data synchronization for React
- **drizzle-orm**: Type-safe database ORM with excellent TypeScript support
- **express-session**: Session management middleware
- **passport**: Authentication middleware framework

### UI Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant management
- **cmdk**: Command palette component

### Development Dependencies
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module
- **Development Server**: Vite dev server with HMR
- **Port Configuration**: Server on port 5000, external port 80

### Production Deployment
- **Build Process**: Vite builds frontend to `dist/public`, esbuild bundles server
- **Deployment Target**: Replit Autoscale for automatic scaling
- **Environment Variables**: DATABASE_URL, TMDB_API_KEY, SESSION_SECRET, REPLIT_DOMAINS
- **Static Assets**: Served from `dist/public` directory

### Configuration Management
- **Environment-based**: Different configurations for development and production
- **Session Security**: Secure cookies in production, HTTP-only flags
- **Database Migrations**: Automated via Drizzle Kit push command

## Changelog

```
Changelog:
- June 27, 2025. Initial setup
- June 27, 2025. Year filter feature removed per user request
- June 27, 2025. Database expanded with Korean movies, Bollywood films, and top-rated content
- June 27, 2025. Enhanced movie data with cast information and trailer support
- June 27, 2025. Application ready for deployment with comprehensive movie discovery features
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```