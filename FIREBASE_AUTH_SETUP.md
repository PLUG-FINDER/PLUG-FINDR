# Firebase Authentication Setup Guide

This document explains how to set up Firebase Authentication for the PlugFindr application.

## Overview

The authentication system uses:
- **Firebase Authentication** for email verification and password reset
- **Custom Backend (Node.js + MongoDB + JWT)** for user profiles, role management, and API authentication
- **JWT tokens** are only issued after email verification

## Architecture

### Registration Flow
1. Frontend creates user in Firebase (email/password)
2. Frontend sends email verification via Firebase
3. Frontend sends user data + Firebase UID to backend
4. Backend stores user profile in MongoDB (NO JWT issued)
5. User must verify email before logging in

### Login Flow
1. Frontend authenticates with Firebase (email/password)
2. Frontend gets Firebase ID token
3. Frontend sends Firebase ID token to backend
4. Backend verifies token with Firebase Admin SDK
5. Backend checks `emailVerified === true` from Firebase
6. If verified, backend issues JWT token
7. If not verified, login is rejected

### Password Reset Flow
1. User clicks "Forgot Password"
2. Frontend calls Firebase `sendPasswordResetEmail`
3. User receives email from Firebase
4. User resets password via Firebase link
5. No backend or JWT involvement

## Environment Variables

### Backend (.env)
```env
# MongoDB
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Admin PIN
ADMIN_SECRET=your_admin_secret_pin

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**Important**: `FIREBASE_SERVICE_ACCOUNT` should be a JSON string containing your Firebase service account credentials.

### Frontend (.env)
```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Firebase Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Authentication** → **Email/Password** provider

### 2. Get Firebase Client Configuration
1. Go to Project Settings → General
2. Scroll to "Your apps" section
3. Add a web app if you haven't already
4. Copy the Firebase configuration object
5. Add these values to your frontend `.env` file

### 3. Get Firebase Admin SDK Service Account
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Convert the JSON to a single-line string and add to backend `.env` as `FIREBASE_SERVICE_ACCOUNT`

**Example conversion** (using Node.js):
```javascript
const serviceAccount = require('./path/to/serviceAccountKey.json');
console.log(JSON.stringify(serviceAccount));
```

Or use an online JSON minifier and escape quotes properly.

### 4. Configure Firebase Email Templates
1. Go to Authentication → Templates
2. Customize email verification and password reset templates if needed
3. Ensure email verification is enabled

## Security Features

1. **Email Verification Required**: Users cannot log in until email is verified
2. **Firebase UID Validation**: Backend verifies Firebase UID tokens before issuing JWTs
3. **Role-Based Access Control**: JWT contains user role for frontend route protection
4. **Secure Password Reset**: Handled entirely by Firebase, no backend involvement
5. **Duplicate Prevention**: Email is indexed as unique in MongoDB
6. **Token Expiration**: JWT tokens expire after 7 days (configurable)

## API Endpoints

### POST /api/auth/register
- Creates user in MongoDB (Firebase user already created by frontend)
- Returns user info but NO JWT token
- Requires: `email`, `role`, `firebaseUID`, optional: `name`, `whatsappNumber`, `adminPin`

### POST /api/auth/login
- Authenticates via Firebase ID token
- Checks email verification status
- Returns JWT token only if email is verified
- Requires: `firebaseIdToken`

### POST /api/auth/forgot-password
- Generates password reset link (for logging purposes)
- Frontend should use Firebase client SDK directly
- Requires: `email`

### POST /api/auth/resend-verification
- Generates verification link (for logging purposes)
- Frontend should use Firebase client SDK directly
- Requires: `email`

### GET /api/auth/me
- Returns current user profile
- Requires: JWT token in Authorization header

### PUT /api/auth/profile
- Updates user profile
- Requires: JWT token in Authorization header

## Testing the Setup

1. **Test Registration**:
   - Register a new user
   - Check that no JWT is returned
   - Check email inbox for verification email

2. **Test Login (Unverified)**:
   - Try to log in before verifying email
   - Should receive error: "Email not verified"

3. **Test Email Verification**:
   - Click verification link in email
   - Try logging in again
   - Should receive JWT token

4. **Test Password Reset**:
   - Click "Forgot Password"
   - Check email for reset link
   - Reset password via Firebase link

5. **Test Protected Routes**:
   - Log in with verified account
   - Access role-specific dashboards
   - Verify JWT is sent in API requests

## Troubleshooting

### "FIREBASE_SERVICE_ACCOUNT not found"
- Ensure the environment variable is set in backend `.env`
- Verify the JSON string is properly formatted (single line, escaped quotes)

### "Email not verified" error on login
- User must click verification link in email
- Check spam folder
- Use "Resend Verification" button if needed

### Firebase user creation fails
- Verify Firebase Authentication is enabled
- Check email/password provider is enabled
- Ensure email format is valid

### JWT token not issued
- Verify email is verified in Firebase
- Check backend logs for errors
- Ensure Firebase Admin SDK is properly initialized

## Notes

- **No automatic verification emails**: Emails are only sent on registration or when user explicitly clicks "Resend Verification"
- **Password storage**: Passwords are NOT stored in MongoDB, only in Firebase
- **Token refresh**: JWT tokens expire after 7 days; users must log in again
- **Admin registration**: Requires ADMIN_SECRET PIN from environment variables

