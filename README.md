# Forex Market Tracker

A modern web application that tracks forex market opening times and provides real-time notifications when markets open. This application allows users to customize notification preferences, manage settings, and receive alerts on both desktop and mobile devices.

## Features

- 📈 Real-time tracking of major forex markets (Tokyo, London, New York, Sydney)
- 🔔 Browser notifications and sound alerts when markets open
- 📱 Push notifications for mobile devices even when browser is closed
- 👤 User authentication with Google
- ⚙️ Personalized settings that sync across devices
- 🌐 Responsive design for desktop and mobile

## Technical Stack

- **Frontend**: React with TypeScript
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Authentication
- **UI Framework**: Tailwind CSS with Shadcn UI components
- **Push Notifications**: Web Push API
- **State Management**: React Context API and React Query

## Project Structure

### Core Directories

- `client/`: Frontend React application
- `server/`: Backend Express server
- `db/`: Database configuration and seed data
- `shared/`: Shared types and schema definitions
- `@types/`: TypeScript type definitions

### Client Directory Structure

The `client/` directory contains the frontend React application:

#### Main Files

- `client/index.html`: Entry HTML file
- `client/src/main.tsx`: Main entry point for the React application
- `client/src/App.tsx`: Root component that sets up routing and providers
- `client/src/index.css`: Global CSS styles

#### Core Subdirectories

- `client/src/components/`: UI components
- `client/src/hooks/`: Custom React hooks
- `client/src/lib/`: Utility functions and data
- `client/src/pages/`: Page components
- `client/src/contexts/`: React context providers
- `client/public/`: Static assets and service worker

### Server Directory Structure

The `server/` directory contains the backend Express server:

- `server/index.ts`: Entry point for the server
- `server/routes.ts`: API route definitions
- `server/vite.ts`: Configuration for Vite integration
- `server/storage.ts`: Storage utilities for push notification subscriptions

### Database Directory

The `db/` directory contains database-related files:

- `db/index.ts`: Database connection setup
- `db/seed.ts`: Database seed data

### Shared Directory

The `shared/` directory contains shared types and schema definitions:

- `shared/schema.ts`: Database schema definitions for Drizzle ORM

## Detailed File Explanations

### Frontend (Client)

#### Entry Files

- `client/index.html`: The main HTML file that loads the React application
- `client/src/main.tsx`: The entry point for the React application, renders the App component
- `client/src/App.tsx`: Sets up routing, authentication, settings providers, and React Query

#### Context Providers

- `client/src/contexts/AuthContext.tsx`: Manages user authentication state using Firebase
  
#### Pages

- `client/src/pages/home.tsx`: The main page showing market times and notifications
- `client/src/pages/not-found.tsx`: 404 page for invalid routes

#### Components

- `client/src/components/Header.tsx`: App header with logo and authentication controls
- `client/src/components/MarketCard.tsx`: Card displaying market information
- `client/src/components/NextOpeningSection.tsx`: Section showing which market opens next
- `client/src/components/NotificationToast.tsx`: Toast notification for market openings
- `client/src/components/SettingsModal.tsx`: Settings panel for user preferences
- `client/src/components/TimeCard.tsx`: Displays time for different timezones
- `client/src/components/LoginButton.tsx`: Button for Google authentication
- `client/src/components/UserProfile.tsx`: User profile display and settings access

#### Hooks

- `client/src/hooks/use-markets.ts`: Manages market data and status
- `client/src/hooks/use-mobile.tsx`: Detects mobile devices
- `client/src/hooks/use-notifications.ts`: Manages browser notifications
- `client/src/hooks/use-push-notifications.tsx`: Manages push notifications for mobile
- `client/src/hooks/use-settings.tsx`: Handles user settings and preferences
- `client/src/hooks/use-time.ts`: Handles time calculations and formatting
- `client/src/hooks/use-toast.ts`: Manages toast notifications

#### UI Components

- `client/src/components/ui/`: Contains Shadcn UI components like buttons, dialogs, etc.

#### Utilities and Data

- `client/src/lib/firebase.ts`: Firebase configuration and authentication functions
- `client/src/lib/market-data.ts`: Market data and time calculation utilities
- `client/src/lib/queryClient.ts`: React Query client configuration
- `client/src/lib/utils.ts`: General utility functions

#### Service Worker

- `client/public/service-worker.js`: Handles push notifications when app is closed

### Backend (Server)

- `server/index.ts`: Sets up the Express server, middleware, error handling
- `server/routes.ts`: Defines API routes for:
  - Push notification subscription management (`/api/subscribe`, `/api/unsubscribe`)
  - Sending notifications (`/api/notify`, `/api/notify/market-opening`)
- `server/storage.ts`: Functions to save, delete, and retrieve push subscriptions
- `server/vite.ts`: Integration with Vite for serving the frontend

### Database

- `db/index.ts`: Creates and exports database connection and Drizzle ORM instance
- `db/seed.ts`: Contains seed data functions
- `shared/schema.ts`: Defines database tables and relationships using Drizzle ORM
  - `users`: User information table
  - `pushSubscriptions`: Stores push notification subscriptions

### Configuration Files

- `drizzle.config.ts`: Configuration for Drizzle ORM
- `postcss.config.js`: PostCSS configuration for Tailwind
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Vite bundler configuration
- `components.json`: Shadcn UI components configuration

## Environment Variables

The application uses the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start the development server: `npm run dev`

## Deployment

The application can be deployed directly using Replit Deployments, which handles:
- SSL certificates and HTTPS
- Database migration
- Environment variable configuration
- Custom domain support (optional)

After deployment, make sure to:
1. Add your production URL to Firebase authorized domains
2. Test all features in the production environment

## Authentication Flow

1. User clicks "Sign in with Google" button
2. Firebase Auth opens Google sign-in popup
3. After successful sign-in, the user state is updated in AuthContext
4. User-specific settings are loaded from localStorage or default settings
5. Settings are synchronized across devices for the same user

## Push Notification Architecture

1. Service worker registers with browser
2. Subscription is sent to backend and stored in database
3. When a market opens, notification is sent to all subscribed devices
4. Service worker displays notification even when browser is closed

## Known Limitations

- Push notifications require HTTPS and won't work in development mode without proper SSL
- Some browsers limit background notifications to conserve battery
- Mobile Safari has limited Web Push API support