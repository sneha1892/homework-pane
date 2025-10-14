# Deployment Guide for Homework Pane

## Prerequisites

1. Firebase account (free tier works)
2. Firebase CLI installed globally: `npm install -g firebase-tools`
3. Node.js 16+ installed

## Step-by-Step Deployment

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard
4. Note your project ID (you'll need it later)

### 2. Enable Firestore

1. In Firebase Console, go to **Build > Firestore Database**
2. Click **Create database**
3. Select **Production mode**
4. Choose your preferred location (closest to your users)
5. Click **Enable**

### 3. Get Firebase Configuration

1. In Firebase Console, click the **gear icon** > **Project settings**
2. Scroll down to "Your apps"
3. Click the **web icon** (`</>`)
4. Register app with nickname: "Homework Pane"
5. Copy the `firebaseConfig` object
6. Open `src/firebase.ts` and replace the placeholder config:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

### 4. Initialize Firebase in Your Project

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select:
# - Firestore
# - Hosting

# Choose:
# - Use an existing project
# - Select your project from the list
# - Accept firestore.rules as the rules file
# - Accept firebase.json
# - Set public directory to: dist
# - Configure as single-page app: Yes
# - Don't set up automatic builds with GitHub
```

### 5. Update Firebase Project ID

Edit `.firebaserc` and replace with your actual project ID:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 6. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

This deploys the security rules that allow public read/write to `homework_tasks` collection only.

### 7. Build the App

```bash
npm install
npm run build
```

This creates a production-optimized build in the `dist/` folder.

### 8. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Or deploy everything at once:

```bash
firebase deploy
```

### 9. Your App is Live! 🎉

Your app will be available at:
- **Main URL**: `https://your-project-id.web.app`
- **Custom domain** (optional): `https://your-project-id.firebaseapp.com`

## Testing the Deployment

1. Open the deployed URL in your mobile browser
2. Add a test task
3. Open the same URL on another device
4. Verify the task appears on both devices (real-time sync)

## Installing as PWA

### On iOS (Safari)
1. Open the deployed URL
2. Tap the **Share** button
3. Scroll and tap **Add to Home Screen**
4. Tap **Add**

### On Android (Chrome)
1. Open the deployed URL
2. Tap the **menu** (three dots)
3. Tap **Install app** or **Add to Home Screen**

### On Desktop (Chrome/Edge)
1. Open the deployed URL
2. Look for the **install icon** (⊕) in the address bar
3. Click it and confirm installation

## Adding PWA Icons (Recommended)

Before deploying, create proper PWA icons:

1. Use a tool like [PWA Builder](https://www.pwabuilder.com/imageGenerator)
2. Upload a square image (512x512 recommended)
3. Download the generated icons
4. Place these files in `/public`:
   - `pwa-192x192.png`
   - `pwa-512x512.png`
   - `favicon.ico`
   - `apple-touch-icon.png`

Then rebuild and redeploy:
```bash
npm run build
firebase deploy
```

## Continuous Deployment

### Option 1: Manual Updates
Whenever you make changes:
```bash
npm run build
firebase deploy
```

### Option 2: GitHub Actions (Advanced)
Set up automatic deployment on every push to main:

1. Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

2. Generate a service account key in Firebase Console
3. Add it as a GitHub secret named `FIREBASE_SERVICE_ACCOUNT`

## Monitoring

### View Usage
Firebase Console > Build > Hosting

### Check Database
Firebase Console > Build > Firestore Database

### View Errors
Firebase Console > Build > Firestore > Logs

## Custom Domain (Optional)

1. In Firebase Console, go to **Hosting**
2. Click **Add custom domain**
3. Follow the DNS configuration steps
4. Wait for SSL certificate provisioning (can take up to 24 hours)

## Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Fails
```bash
# Check you're logged in
firebase login --reauth

# Check project is correct
firebase projects:list
firebase use your-project-id

# Try deploying again
firebase deploy
```

### Data Not Syncing
1. Check Firebase Console > Firestore Database
2. Verify rules are deployed: `firebase deploy --only firestore:rules`
3. Check browser console for errors

### PWA Not Installing
1. Ensure you're using HTTPS (Firebase Hosting does this automatically)
2. Add proper icons (see "Adding PWA Icons" above)
3. Clear browser cache and try again

## Security Recommendations

⚠️ **Current Setup**: Public read/write to `homework_tasks` collection

For production with sensitive data:
1. Enable Firebase Authentication
2. Update Firestore rules to require auth
3. Add user ID to each task document
4. Filter tasks by authenticated user

Example secure rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /homework_tasks/{taskId} {
      allow read, write: if request.auth != null 
        && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## Support

For issues:
1. Check the main README.md
2. Review Firebase Console logs
3. Check browser console for errors
4. Verify all configuration steps were completed

---

Happy deploying! 🚀

