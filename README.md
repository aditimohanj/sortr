# Spotify Genre Playlist Organizer

A web application that automatically organizes your Spotify liked songs into genre-specific playlists using artist genre information from the Spotify Web API.

## Features

- **Spotify OAuth Integration**: Secure authentication with your Spotify account
- **Automatic Genre Detection**: Analyzes your liked songs using artist genre data
- **Smart Playlist Creation**: Creates organized playlists based on detected genres
- **Real-time Progress Tracking**: Watch the organization process in real-time
- **Customizable Settings**: Configure minimum songs per playlist, privacy settings, and more
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## How It Works

1. **Connect**: Authenticate with your Spotify account
2. **Analyze**: The app fetches your liked songs and analyzes artist genres
3. **Organize**: Creates genre-specific playlists automatically
4. **Enjoy**: Your music is now organized by genre while keeping your original liked songs intact

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix UI components
- TanStack Query for state management
- Wouter for routing

### Backend
- Node.js with Express
- TypeScript
- Spotify Web API integration
- In-memory storage (easily upgradeable to PostgreSQL)

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Spotify Developer account

### 1. Spotify App Setup
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add your redirect URI (e.g., `http://localhost:5000/api/auth/callback` for local development)
4. Note your Client ID and Client Secret

### 2. Environment Configuration
1. Copy `.env.example` to `.env`
2. Fill in your Spotify credentials:
   ```
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   SPOTIFY_REDIRECT_URI=http://localhost:5000/api/auth/callback
   ```

### 3. Installation and Running
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5000`

## Deployment

### Replit Deployment
This app is optimized for Replit deployment:
1. Import the project to Replit
2. Update the `SPOTIFY_REDIRECT_URI` in your environment to match your Replit domain
3. Update your Spotify app settings with the new redirect URI
4. Run the project

### Other Platforms
The app can be deployed to any Node.js hosting platform. Make sure to:
- Set environment variables
- Update Spotify app redirect URI settings
- Run `npm run build` for production builds

## Project Structure

```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and API client
├── server/          # Express backend
│   ├── services/    # Spotify API integration
│   ├── routes.ts    # API routes
│   └── storage.ts   # Data storage layer
├── shared/          # Shared TypeScript types
└── README.md
```

## API Endpoints

- `GET /api/auth/url` - Get Spotify authorization URL
- `GET /api/auth/callback` - Handle OAuth callback
- `GET /api/user/:id` - Get user information
- `GET /api/user/:id/stats` - Get user's Spotify stats
- `POST /api/processing/start` - Start playlist organization
- `GET /api/processing/status/:userId` - Get processing status
- `GET /api/settings/:userId` - Get user settings
- `PATCH /api/settings/:userId` - Update user settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Spotify API Permissions

This app requires the following Spotify scopes:
- `user-library-read` - Access your liked songs
- `playlist-modify-public` - Create and modify public playlists
- `playlist-modify-private` - Create and modify private playlists
- `user-read-private` - Access your profile information
- `user-read-email` - Access your email address

## Troubleshooting

### Common Issues

**Authentication fails with "redirect URI mismatch"**
- Ensure your `.env` file has the correct redirect URI
- Verify the redirect URI in your Spotify app settings matches exactly

**Processing fails or gets stuck**
- Check your internet connection
- Verify your Spotify token hasn't expired (the app handles refresh automatically)
- Try refreshing the page and starting again

**No playlists created**
- Ensure you have enough songs in each genre (check minimum songs setting)
- Verify the app has permission to create playlists on your account

For more help, please open an issue on GitHub.