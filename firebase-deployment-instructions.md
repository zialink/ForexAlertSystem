# Firebase Deployment Instructions for Forex Market Tracker

This document provides step-by-step instructions for deploying your Forex Market Tracker application to Firebase.

## Prerequisites

1. Firebase account created and project set up
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. Required environment variables available

## Environment Setup

You'll need to set the following environment variables in your Firebase project:

1. `DATABASE_URL`: Your PostgreSQL connection string
2. `VAPID_PUBLIC_KEY`: Your Web Push VAPID public key
3. `VAPID_PRIVATE_KEY`: Your Web Push VAPID private key

You can set these environment variables in the Firebase Console under Project Settings > Functions > Environment Variables.

## Deployment Steps

### Step 1: Login to Firebase

```bash
firebase login
```

### Step 2: Update .firebaserc with your project ID

Replace `${FIREBASE_PROJECT_ID}` in the `.firebaserc` file with your actual Firebase project ID:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### Step 3: Build the Frontend

```bash
# Build the frontend
npm run build:client

# Make sure dist directory exists
mkdir -p dist

# Copy the service worker to the dist directory
cp client/public/service-worker.js dist/
```

### Step 4: Install Dependencies for Firebase Functions

```bash
cd functions
npm install
npm run build
cd ..
```

### Step 5: Deploy to Firebase

```bash
# Deploy everything (hosting and functions)
firebase deploy

# Alternatively, deploy only hosting
firebase deploy --only hosting

# Or deploy only functions
firebase deploy --only functions
```

## Post-Deployment Setup

1. Update your Firebase Authentication configuration:
   - Go to Firebase Console > Authentication > Sign-in method
   - Add your Firebase Hosting domain to the authorized domains

2. Update your Web Push configuration:
   - Make sure your VAPID keys are properly set in the environment variables
   - Test push notifications from the deployed application

3. Set up the PostgreSQL database:
   - Make sure the deployed functions have access to your database
   - Update the DATABASE_URL environment variable if needed

## Troubleshooting

1. If you see CORS errors:
   - Make sure your Firebase Hosting domain is properly set up in the CORS configuration
   - Check that your frontend is making requests to the correct API endpoint

2. If push notifications aren't working:
   - Verify that your service worker is properly copied to the dist directory
   - Check that your VAPID keys are correctly set in the environment variables
   - Make sure your Firebase domain is using HTTPS (required for push notifications)

3. If authentication fails:
   - Ensure your Firebase project's authorized domains include your hosting domain
   - Check that your Firebase configuration in the frontend code matches your project settings

## Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Web Push Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)