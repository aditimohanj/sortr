# Spotify Genre Playlist Organizer

## Overview

This is a full-stack web application that integrates with Spotify to automatically organize a user's liked songs into genre-specific playlists. The application uses modern web technologies including React, TypeScript, Express, and Drizzle ORM with PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom Spotify-themed color palette
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Spotify OAuth 2.0 flow
- **API Pattern**: RESTful endpoints with JSON responses

### Data Storage
- **Database**: PostgreSQL (configured via Drizzle but can be provisioned later)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migration Strategy**: Drizzle Kit for schema migrations
- **Fallback Storage**: In-memory storage implementation for development

## Key Components

### Database Schema
The application uses three main tables:
- **Users**: Stores Spotify user information and OAuth tokens
- **Processing Jobs**: Tracks the status of genre analysis and playlist creation tasks
- **Settings**: User preferences for playlist generation and organization

### Spotify Integration
- **OAuth Flow**: Complete Spotify OAuth 2.0 implementation
- **Token Management**: Automatic token refresh and expiry handling
- **API Interaction**: Fetches user's liked songs, analyzes audio features, and creates playlists
- **Permissions**: Requires read access to user library and playlist modification permissions

### Processing Pipeline
The application implements a multi-step processing pipeline:
1. **Fetching**: Retrieves user's liked songs from Spotify
2. **Analysis**: Analyzes audio features and artist genres
3. **Classification**: Groups songs by detected genres
4. **Playlist Creation**: Creates genre-specific playlists on Spotify

### Real-time Updates
- **Polling**: Frontend polls processing status every 2 seconds
- **Progress Tracking**: Detailed progress reporting with current step and completion percentage
- **Status Management**: Comprehensive status tracking (idle, fetching, analyzing, creating, completed, error)

## Data Flow

1. **Authentication**: User initiates Spotify OAuth flow
2. **User Creation**: Application stores user data and tokens
3. **Processing Initiation**: User triggers genre analysis
4. **Data Fetching**: Application retrieves liked songs via Spotify API
5. **Genre Analysis**: Songs are analyzed for genre classification
6. **Playlist Creation**: Genre-specific playlists are created on Spotify
7. **Status Updates**: Real-time progress updates are provided to the user

## External Dependencies

### Core Dependencies
- **Spotify Web API**: For user authentication and music data
- **Neon Database**: PostgreSQL hosting (via @neondatabase/serverless)
- **Radix UI**: Accessible UI component primitives
- **TanStack Query**: Server state management and caching

### Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development tooling
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Production bundling

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite development server with HMR
- **API Proxy**: Integrated Express server serving both API and static files
- **Database**: Can use in-memory storage for development

### Production Build
- **Frontend**: Vite builds optimized React application
- **Backend**: ESBuild bundles Express server for production
- **Static Serving**: Express serves built React application
- **Database**: Requires PostgreSQL database with connection string

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SPOTIFY_CLIENT_ID`: Spotify application client ID
- `SPOTIFY_CLIENT_SECRET`: Spotify application client secret
- `SPOTIFY_REDIRECT_URI`: OAuth callback URL

## Changelog

```
Changelog:
- July 06, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```