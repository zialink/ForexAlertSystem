# Firebase Deployment Guide for Forex Market Tracker

This guide provides step-by-step instructions for deploying the Forex Market Tracker application to Firebase Hosting with Cloud Functions to handle the backend API.

## Prerequisites

1. **Firebase Account**: Create an account at [firebase.google.com](https://firebase.google.com/)
2. **Firebase Project**: Create a new project in the Firebase Console
3. **Firebase CLI**: Install Firebase CLI tools with `npm install -g firebase-tools`
4. **Node.js and npm**: Make sure you have Node.js (v14+) installed

## Step 1: Configure Firebase Project

1. Log in to Firebase from your terminal:
   ```bash
   firebase login
   ```

2. Update the `.firebaserc` file with your actual Firebase project ID:
   ```json
   {
     "projects": {
       "default": "your-actual-firebase-project-id"
     }
   }
   ```

## Step 2: Configure Environment Variables

You'll need to set the following environment variables for your Firebase Functions:

1. Go to the Firebase Console > Project Settings > Functions > Environment Variables
2. Add the following variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `VAPID_PUBLIC_KEY`: Your Web Push VAPID public key
   - `VAPID_PRIVATE_KEY`: Your Web Push VAPID private key

## Step 3: Build the Application

1. Build the frontend application:
   ```bash
   npm run build:client
   ```

2. Ensure the service worker is copied to the dist folder:
   ```bash
   cp client/public/service-worker.js dist/
   ```

## Step 4: Set Up Firebase Functions

1. Install dependencies for Firebase Functions:
   ```bash
   cd functions
   npm install
   npm install --save-dev @types/cors @types/web-push
   npm run build
   cd ..
   ```

2. Review the functions/src/index.ts file to ensure it contains all required API endpoints:
   - `/api/subscribe` - For subscribing to push notifications
   - `/api/unsubscribe` - For unsubscribing from push notifications
   - `/api/notify` - For sending test push notifications
   - `/api/notify/market-opening` - For market opening notifications

## Step 5: Configure Authentication

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable Google Authentication
3. Add your authorized domains:
   - Your development domain
   - Your Firebase Hosting domain (yourproject.web.app)
   - Any custom domains you're using

## Step 6: Set Up Database

1. Create a PostgreSQL database (you can use Cloud SQL or any other PostgreSQL provider)
2. Update the `DATABASE_URL` environment variable in Firebase Functions settings
3. Run the database migrations to create necessary tables:
   ```bash
   # On your local machine, with Firebase env vars set
   npm run db:push
   ```

## Step 7: Deploy to Firebase

1. Deploy both hosting and functions:
   ```bash
   firebase deploy
   ```

   Or deploy them separately:
   ```bash
   firebase deploy --only hosting
   firebase deploy --only functions
   ```

2. Your application will be available at:
   - https://your-project-id.web.app

## Step 8: Set Up Frontend Environment Variables

Create a `.env.production` file with the following variables:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_API_URL=https://us-central1-your-project-id.cloudfunctions.net/api
```

## Step 9: Post-Deployment Verification

After deployment, verify:

1. Open your Firebase hosting URL
2. Test user authentication
3. Test push notification subscription
4. Verify market data is displaying correctly
5. Test market opening notifications

## Troubleshooting

### CORS Issues
If you encounter CORS issues, verify:
- Your Firebase Hosting domain is included in the CORS configuration in functions/src/index.ts
- Ensure the `credentials: "include"` is set in API requests

### Authentication Issues
If authentication isn't working:
- Verify your Firebase project configuration is correct
- Ensure the authorized domains include your hosting domain
- Check browser console for any errors

### Push Notification Issues
If push notifications aren't working:
- Verify the VAPID keys are correctly set
- Check that the service worker is properly deployed
- Ensure all permissions are granted
- Use browser DevTools > Application > Service Workers to debug

### Database Connection Issues
If database operations fail:
- Verify the DATABASE_URL environment variable is correctly set
- Ensure the database is accessible from Firebase Functions
- Check that the database schema matches your application's expectations

## Maintenance

### Updating the Application
To update your deployed application:

1. Make changes to your code
2. Build the frontend: `npm run build:client`
3. Deploy to Firebase: `firebase deploy`

### Monitoring
Use Firebase Console for:
- Function logs and errors
- Hosting analytics
- Authentication statistics
- Performance monitoring

## Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Web Push Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)