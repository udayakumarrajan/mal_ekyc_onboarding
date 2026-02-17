# eKYC Onboarding - Setup Guide

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- For mobile: Expo Go app on iOS/Android device (or emulator)

## Installation Steps

### 1. Install Root Dependencies

```bash
cd /path/to/ekyc-onboarding
npm install
```

### 2. Install API Dependencies

```bash
cd apps/api
npm install
```

### 3. Install Mobile Dependencies

```bash
cd apps/mobile
npm install
```

## Running the Application

### Start the Backend API

```bash
# From root directory
npm run api

# Or from apps/api directory
cd apps/api
npm run dev
```

The API will start on `http://localhost:3000`

**Test the API:**
```bash
# Health check
curl http://localhost:3000/health

# Test login
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"udayakumar.rajan@example.com","password":"password123"}'
```

### Start the Mobile App

**Important:** Make sure the API is running first!

```bash
# From root directory
npm run mobile

# Or from apps/mobile directory
cd apps/mobile
npm start
```

or you can try using the below

```
npx expo start --localhost --ios
```

Then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan QR code with Expo Go app on your physical device

**Note for physical devices:** Update the API base URL in `apps/mobile/.env`:
```
API_BASE_URL=http://YOUR_COMPUTER_IP:3000
```

## Test Credentials

```
Email: jane.doe@example.com
Password: password123
```

## Features Implemented (Milestone 1)

✅ Backend API with 5 endpoints (login, refresh, me, submit, status)
✅ In-memory data storage (no database required)
✅ JWT authentication with access and refresh tokens
✅ Mobile app with 4 screens (Login, Home, Onboarding, Settings)
✅ 5-step onboarding flow (Profile, Document, Address, Consents, Review)
✅ State management with Zustand
✅ Theme toggle (light/dark mode)
✅ State persistence (theme, onboarding draft)
✅ Loading and error states
✅ Form validation

## Project Structure

```
ekyc-onboarding/
├── apps/
│   ├── api/              # Backend API
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── app.ts
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── repositories/
│   │   └── package.json
│   │
│   └── mobile/           # Mobile App
│       ├── src/
│       │   ├── App.tsx
│       │   ├── screens/
│       │   ├── components/
│       │   ├── stores/
│       │   ├── services/
│       │   ├── navigation/
│       │   └── theme/
│       └── package.json
│
├── package.json          # Root workspace config
└── README.md
```

## Troubleshooting

### API won't start
- Check if port 3000 is already in use
- Make sure all dependencies are installed: `cd apps/api && npm install`
- Check for TypeScript errors in terminal output

### Mobile app won't connect to API
- Verify API is running: `curl http://localhost:3000/health`
- For physical devices, use your computer's IP address instead of localhost
- Check firewall settings

### Mobile app build errors
- Clear Expo cache: `cd apps/mobile && npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Next Steps (Milestone 2)

- Token refresh + retry logic
- Route guards and session expiry handling
- Enhanced server-side validation
- Centralized error handling
- Logging and correlation IDs
- API and mobile tests
