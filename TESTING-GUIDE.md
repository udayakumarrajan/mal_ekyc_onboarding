# Testing Guide - eKYC Onboarding Platform

## Quick Start

### Prerequisites
- ✅ Backend API running on http://localhost:3000
- ✅ Mobile app running on iOS simulator
- ✅ Test user: udayakumar.rajanexample.com / password123

---

## 🧪 Test Scenarios

### Scenario 1: Complete Happy Path (5 minutes)

#### Step 1: Login
1. Open mobile app on iOS simulator
2. Enter credentials:
   - Email: `jane.doe@example.com`
   - Password: `password123`
3. Tap "Sign In"
4. ✅ Should navigate to Home screen

#### Step 2: View Home Screen
1. See welcome message: "Welcome, Jane Doe!"
2. See verification status: "Not Started"
3. ✅ User info loaded from API

#### Step 3: Complete Onboarding
1. Tap "Start Onboarding" button
2. **Step 1 - Profile**:
   - Full Name: John Smith
   - Date of Birth: 1990-01-15
   - Nationality: US
   - Tap "Next"
3. **Step 2 - Document**:
   - Select: Passport
   - Document Number: P12345678
   - Tap "Next"
4. **Step 3 - Address**:
   - Address: 123 Main Street
   - City: New York
   - Country: USA
   - Tap "Next"
5. **Step 4 - Consents**:
   - Check "I accept the terms and conditions"
   - Tap "Next"
6. **Step 5 - Review**:
   - Review all information
   - Tap "Submit"
7. ✅ Should show success alert
8. ✅ Should navigate back to Home

#### Step 4: Watch Async Verification
1. On Home screen, see status: "In Progress"
2. See "● Updating..." indicator (polling active)
3. See "Process Verification (Demo)" button
4. Tap the button to simulate processing
5. Wait 2-5 seconds (processing delay)
6. ✅ Status changes to APPROVED/MANUAL_REVIEW/REJECTED
7. ✅ Polling indicator disappears
8. ✅ See appropriate message for final status

#### Step 5: Test Theme Toggle
1. Go to Settings tab
2. Toggle "Dark Mode" switch
3. ✅ App changes to dark theme instantly
4. Toggle back to light mode
5. ✅ Theme persists (check after app restart)

#### Step 6: Test Logout
1. In Settings, tap "Logout"
2. Confirm in alert
3. ✅ Should return to Login screen
4. ✅ Session cleared

---

### Scenario 2: Test Token Refresh (Manual - requires waiting)

#### Setup
1. Login to app
2. Navigate around (Home, Onboarding, Settings)
3. Wait 15 minutes (token expiry)

#### Expected Behavior
1. Make any API call (go to Home, refresh)
2. ✅ Token expires → API returns 401
3. ✅ App automatically calls /v1/auth/refresh
4. ✅ Gets new token
5. ✅ Retries original request
6. ✅ User sees no interruption

#### Verification
- Check API logs: Should see refresh request
- User stays logged in
- No error messages shown

---

### Scenario 3: Test Draft Persistence

#### Steps
1. Login
2. Start onboarding
3. Fill out Step 1 (Profile)
4. Tap "Next" to Step 2
5. Fill out document info
6. **Navigate away**: Go to Settings tab
7. **Navigate back**: Go to Onboarding tab
8. ✅ Should show Step 2 with data intact
9. Go back to Step 1
10. ✅ Profile data should still be there

#### Also Test
- Close and reopen app
- ✅ Draft should persist
- ✅ Current step should be remembered

---

### Scenario 4: Test Validation Errors

#### Invalid Login
1. Enter wrong password
2. Tap "Sign In"
3. ✅ Should show "Invalid email or password"

#### Missing Form Fields
1. Start onboarding
2. Leave Full Name empty
3. Try to go to next step
4. ✅ Should show field-specific error

#### Backend Validation
1. Submit onboarding with missing fields via API:
```bash
curl -X POST http://localhost:3000/v1/onboarding/submit \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"draft":{"profile":{"fullName":""}}}'
```
2. ✅ Should return 400 with fieldErrors

---

### Scenario 5: Test Status Polling

#### Manual Test
1. Submit onboarding (status → IN_PROGRESS)
2. Watch Home screen
3. ✅ See "● Updating..." every few seconds
4. Open API logs terminal
5. ✅ See GET /v1/verification/status requests
6. ✅ Interval should increase: 2s, 4s, 8s, 10s...
7. Process verification (tap button)
8. ✅ Polling should stop when status is final

#### Test Cleanup
1. While polling is active, navigate to Settings
2. ✅ Polling should stop (check logs - no more requests)
3. Navigate back to Home
4. ✅ If status is still IN_PROGRESS, polling resumes

---

## 🔍 Backend API Testing

### Run Automated Tests
```bash
cd apps/api
npm test
```

**Expected Output**:
```
Test Suites: 3 passed, 3 total
Tests:       19 passed, 19 total
Time:        ~5 seconds
```

### Manual API Testing with curl

#### 1. Test Health Check
```bash
curl http://localhost:3000/health
```
Expected: `{"status":"ok","timestamp":"..."}`

#### 2. Test Login
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.doe@example.com","password":"password123"}'
```
Expected: Returns user object and session with tokens

#### 3. Test Protected Endpoint
```bash
# First get token
TOKEN=$(curl -s -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.doe@example.com","password":"password123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# Then call protected endpoint
curl -X GET http://localhost:3000/v1/me \
  -H "Authorization: Bearer $TOKEN"
```
Expected: Returns user info

#### 4. Test Verification Processing
```bash
# After submitting onboarding...
curl -X POST http://localhost:3000/v1/verification/process \
  -H "Authorization: Bearer $TOKEN"
```
Expected: Takes 2-5 seconds, returns updated status

#### 5. Test Correlation IDs
```bash
curl -X GET http://localhost:3000/v1/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Correlation-ID: my-test-123"
```
Check API logs: Should show `[my-test-123]`

---

## 📱 Mobile App Testing

### Visual Testing Checklist

#### Login Screen
- [ ] Email validation works
- [ ] Password field is masked
- [ ] Error messages display clearly
- [ ] Loading indicator during login
- [ ] Success navigates to Home

#### Home Screen
- [ ] User name displays correctly
- [ ] Email displays correctly
- [ ] Verification status badge shows
- [ ] Status color is correct for each type
- [ ] "Start Onboarding" button visible
- [ ] Pull-to-refresh works
- [ ] Polling indicator shows when active

#### Onboarding Screen
- [ ] Progress bar shows current step
- [ ] Step title shows (Step 1 of 5: Profile)
- [ ] Back button works (except step 1)
- [ ] Next button advances step
- [ ] Data persists between steps
- [ ] Review step shows all data
- [ ] Submit button shows loading
- [ ] Success navigates to Home

#### Settings Screen
- [ ] Theme toggle switch works
- [ ] Theme persists after restart
- [ ] Logout confirmation shows
- [ ] Logout clears session

---

## 🐛 Common Issues & Solutions

### Issue: API won't start
**Error**: "EADDRINUSE: address already in use :::3000"
**Solution**: 
```bash
lsof -ti:3000 | xargs kill -9
cd apps/api && npm run dev
```

### Issue: Mobile app won't connect to API
**Error**: Network timeout or connection refused
**Solutions**:
1. Check API is running: `curl http://localhost:3000/health`
2. For physical device, update API_BASE_URL to your computer's IP
3. Check firewall settings

### Issue: Mobile bundle fails
**Error**: "Unable to resolve module"
**Solution**:
```bash
cd apps/mobile
rm -rf node_modules .expo
npm install
npx expo start --clear
```

### Issue: Tests fail
**Error**: UUID import issues
**Solution**: Already fixed with jest.config.js setup

### Issue: Polling doesn't stop
**Check**: Navigate away and back - should cleanup properly
**Solution**: Implemented with useFocusEffect hook

---

## 📊 Expected Test Results

### All Scenarios Should Pass

✅ **Login/Auth**: 100% working
✅ **Onboarding**: 5 steps complete successfully  
✅ **Submission**: Data sent to API
✅ **Verification**: Status updates in real-time
✅ **Polling**: Starts/stops correctly
✅ **Theme**: Persists across restarts
✅ **Logout**: Clears session properly
✅ **Refresh**: Token refresh automatic and transparent
✅ **Tests**: 19/19 passing

---

## 🎬 Demo Recording Checklist

For assessment submission:

1. [ ] Start recording (full screen visible)
2. [ ] Show project structure in IDE
3. [ ] Show backend running (API logs)
4. [ ] Show mobile app starting
5. [ ] Demo login flow
6. [ ] Demo complete onboarding (all 5 steps)
7. [ ] Show async verification with polling
8. [ ] Show theme toggle
9. [ ] Show logout
10. [ ] Run `npm test` - show 19/19 passing
11. [ ] Show API logs with correlation IDs
12. [ ] Explain architecture and decisions
13. [ ] Stop recording

**Total Recording Time**: Should be < 15 minutes

---

## ✅ Verification Checklist

Before submitting:

### Code Quality
- [ ] TypeScript strict mode: ✅
- [ ] No console.errors in production code: ✅
- [ ] Proper error handling everywhere: ✅
- [ ] Clean code, good naming: ✅

### Functionality
- [ ] All 3 milestones working: ✅
- [ ] No crashes in happy path: ✅
- [ ] Loading states everywhere: ✅
- [ ] Error messages clear: ✅

### Security
- [ ] Passwords hashed: ✅
- [ ] Tokens not logged: ✅
- [ ] No sensitive data in errors: ✅
- [ ] Auth guards working: ✅

### Testing
- [ ] All tests passing: ✅ (19/19)
- [ ] Coverage for critical paths: ✅
- [ ] Edge cases tested: ✅

### Documentation
- [ ] README with setup: ✅
- [ ] API endpoint docs: ✅
- [ ] Test credentials included: ✅
- [ ] Architecture explained: ✅

---

## 🎯 Success!

You're ready to demo and submit! All 3 milestones are complete with:
- Production-quality code
- Comprehensive testing
- Clear documentation
- Working end-to-end flows

**Good luck with your submission!** 🚀
