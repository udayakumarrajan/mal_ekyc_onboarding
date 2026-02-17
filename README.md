# eKYC Onboarding Platform

A fullstack eKYC (electronic Know Your Customer) onboarding system built with React Native Expo (mobile) and Node.js/Express (backend).

## Project Structure

```
ekyc-onboarding/
├── apps/
│   ├── api/          # Backend API (Node.js + Express + TypeScript)
│   └── mobile/       # Mobile App (Expo + React Native + TypeScript)
├── package.json      # Root workspace configuration
└── README.md
```

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- JWT Authentication
- In-memory data storage

### Mobile
- Expo (React Native)
- React Navigation
- Zustand (State Management)
- Axios (HTTP Client)
- AsyncStorage (Persistence)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (for mobile development)

### Installation

1. Install dependencies for all workspaces:
```bash
npm install
```

2. Install backend dependencies:
```bash
cd apps/api
npm install
```

3. Install mobile dependencies:
```bash
cd apps/mobile
npm install
```

### Running the Application

#### Start the Backend API
```bash
# From root directory
npm run api

# Or from apps/api directory
cd apps/api
npm run dev
```

The API will run on `http://localhost:3000`

#### Start the Mobile App
```bash
# From root directory
npm run mobile

# Or from apps/mobile directory
cd apps/mobile
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Features

### Milestone 1 - Core Flow ✅
- ✅ User authentication (login with JWT)
- ✅ 5-step onboarding flow (Profile, Document, Address, Consents, Review)
- ✅ Home screen with user info and verification status
- ✅ Settings screen with theme toggle (light/dark)
- ✅ State persistence (theme, onboarding draft)
- ✅ Loading and error states

### Milestone 2 - Production Ready ✅
- ✅ Winston logging with correlation IDs
- ✅ Automatic token refresh + retry logic
- ✅ Session expiry handling with clear UX
- ✅ Comprehensive API tests (19 tests)
- ✅ Sensitive data sanitization in logs

### Milestone 3 - Async Verification ✅
- ✅ Asynchronous verification processing
- ✅ Backend state machine (IN_PROGRESS → APPROVED/REJECTED/MANUAL_REVIEW)
- ✅ Mobile status polling with exponential backoff
- ✅ Real-time status updates in UI
- ✅ Demo button to trigger processing

## API Endpoints

### Authentication
- `POST /v1/auth/login` - User login with JWT tokens
- `POST /v1/auth/refresh` - Refresh access token

### User & Onboarding
- `GET /v1/me` - Get current user info (protected)
- `POST /v1/onboarding/submit` - Submit onboarding data (protected)

### Verification
- `GET /v1/verification/status` - Get verification status (protected)
- `POST /v1/verification/process` - Process verification asynchronously (protected) **[M3]**

## Default Test User

```
Email: udayakumar.rajan@example.com
Password: password123
```

## Development

### Backend Structure
```
apps/api/src/
├── server.ts                 # Entry point
├── app.ts                    # Express app setup
├── middleware/               # Auth, validation, error handling
├── routes/                   # API routes
├── services/                 # Business logic
├── repositories/             # Data access layer
└── types/                    # TypeScript types
```

### Mobile Structure
```
apps/mobile/src/
├── App.tsx                   # Root component
├── navigation/               # React Navigation setup
├── screens/                  # Screen components
├── components/               # Reusable UI components
├── stores/                   # Zustand state stores
├── services/                 # API client
├── theme/                    # Theme tokens and provider
└── types/                    # TypeScript types
```

