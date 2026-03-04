# Firebase Password Reset Action URL Configuration

## Overview

This guide explains how to configure the action URL for Firebase password reset emails. The action URL is the link that users will be redirected to after clicking the password reset link in their email.

## Current Implementation

The password reset flow now uses Firebase Authentication:
1. User clicks "Forgot Password" and enters their email
2. Firebase sends a password reset email
3. User clicks the link in the email
4. User is redirected to `/reset-password` with an `oobCode` query parameter
5. User enters new password and it's reset via Firebase

## Action URL Configuration

### Option 1: Configure in Code (Current Implementation)

The action URL is already configured in the `ForgotPassword.tsx` component:

```typescript
const actionCodeSettings: ActionCodeSettings = {
  url: `${window.location.origin}/reset-password`,
  handleCodeInApp: false,
};
```

This means:
- **Action URL**: `http://localhost:3000/reset-password` (development)
- **Action URL**: `https://yourdomain.com/reset-password` (production)

### Option 2: Configure in Firebase Console

You can also set a default action URL in Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add your domain (e.g., `yourdomain.com`)
5. Go to **Authentication** → **Templates** → **Password reset**
6. Click **Edit template**
7. In the **Action URL** field, you can customize the URL

**Note**: The action URL in the code takes precedence over the console setting when using `sendPasswordResetEmail` with `actionCodeSettings`.

## Email Template Customization

To customize the password reset email:

1. Go to **Authentication** → **Templates** → **Password reset**
2. Click **Edit template**
3. Customize:
   - **Subject**: Email subject line
   - **Body**: Email body content
   - **Action URL**: Default redirect URL (optional, can be overridden in code)

### Email Template Variables

You can use these variables in the email template:
- `%LINK%` - The password reset link
- `%EMAIL%` - User's email address
- `%DISPLAY_NAME%` - User's display name (if set)

## URL Format

When Firebase sends the password reset email, the link format is:
```
https://your-project.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=ABC123&apiKey=YOUR_API_KEY&continueUrl=YOUR_ACTION_URL
```

When the user clicks this link:
1. Firebase validates the `oobCode`
2. User is redirected to your `continueUrl` (action URL)
3. The `oobCode` and `mode` are appended as query parameters:
   ```
   https://yourdomain.com/reset-password?oobCode=ABC123&mode=resetPassword
   ```

## Environment Variables

Make sure your frontend `.env` file has:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Testing

1. **Test in Development**:
   - Use `http://localhost:3000/reset-password` as action URL
   - Make sure Firebase allows localhost (it's allowed by default)

2. **Test in Production**:
   - Use `https://yourdomain.com/reset-password` as action URL
   - Add your domain to Firebase Authorized domains
   - Test the full flow from email to password reset

## Troubleshooting

### "Invalid reset code" error
- The `oobCode` may have expired (default: 1 hour)
- The code may have already been used
- Check that the URL includes `?oobCode=...&mode=resetPassword`

### Email not received
- Check spam folder
- Verify email address is correct
- Check Firebase Console → Authentication → Users to see if user exists
- Verify email provider settings in Firebase

### Redirect not working
- Ensure the action URL is in Firebase Authorized domains
- Check that the URL matches exactly (including protocol: `https://` not `http://`)
- Verify the route exists in your React app (`/reset-password`)

## Security Notes

1. **Action Code Expiration**: Firebase action codes expire after 1 hour by default
2. **One-Time Use**: Each action code can only be used once
3. **HTTPS Required**: In production, use HTTPS for the action URL
4. **Domain Verification**: Only authorized domains can be used as action URLs

## Example Action URLs

- **Development**: `http://localhost:3000/reset-password`
- **Staging**: `https://staging.yourdomain.com/reset-password`
- **Production**: `https://yourdomain.com/reset-password`

