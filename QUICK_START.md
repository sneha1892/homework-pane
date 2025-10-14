# Quick Start Guide

## Setup in 5 Minutes

### 1. Install Dependencies
```bash
cd homework-pane
npm install
```

### 2. Configure Firebase

Edit `src/firebase.ts` and replace placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Deploy Firestore Rules

```bash
npm install -g firebase-tools
firebase login
firebase use your-project-id
firebase deploy --only firestore:rules
```

### 4. **CRITICAL**: Create Kid Templates in Firestore

Go to Firebase Console > Firestore Database and manually create:

**Collection**: `kid_templates`

**Document 1**: `Hazel`
- Field: `templateTasks` (array of maps)
- Add 9 items:
  1. {subject: "English", book: "Textbook"}
  2. {subject: "English", book: "Handwriting Book"}
  3. {subject: "English", book: "Notebook"}
  4. {subject: "Malayalam", book: "Textbook"}
  5. {subject: "Malayalam", book: "Handwriting Book"}
  6. {subject: "Malayalam", book: "Notebook"}
  7. {subject: "Maths", book: "Textbook"}
  8. {subject: "Maths", book: "Notebook"}
  9. {subject: "GK", book: "Textbook"}

**Document 2**: `Aiden`
- Field: `templateTasks` (array of maps)
- Add all 9 from Hazel PLUS:
  10. {subject: "Hindi", book: "Textbook"}
  11. {subject: "Hindi", book: "Notebook"}

See [TEMPLATE_SETUP.md](./TEMPLATE_SETUP.md) for detailed instructions.

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173

## How It Works

1. **First Visit**: App creates `daily_tasks/2025-10-16_Hazel` and `daily_tasks/2025-10-16_Aiden` from templates
2. **Add Notes**: Click "+ Add Homework", fill description, save
3. **Check Off**: Tap checkbox to mark complete
4. **Remove Lines**: Click × button to remove any task line
5. **Navigate Dates**: Use ‹ / › arrows or TODAY button

## Common Issues

### Blank Screen / Not Loading
- Check browser console for errors
- Verify Firebase config is correct
- Ensure Firestore rules are deployed
- **Most common**: Templates not created in Firestore!

### "Permission denied"
```bash
firebase deploy --only firestore:rules
```

### Tasks not syncing
- Check internet connection
- Verify Firebase console shows data in `daily_tasks` collection

### "Loading..." forever
- Templates probably missing - create them in Firestore!
- Check browser network tab for Firebase errors

## Next Steps

- [README.md](./README.md) - Full documentation
- [TEMPLATE_SETUP.md](./TEMPLATE_SETUP.md) - Detailed template setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - How to deploy to Firebase Hosting

