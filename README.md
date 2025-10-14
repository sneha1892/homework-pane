# Homework Pane

A beautiful, mobile-first Progressive Web Application (PWA) for tracking daily homework for multiple kids. Built with React, TypeScript, Firebase Firestore, and glassmorphism design.

## ✨ Features

- 📱 **Mobile-First Design**: Optimized for phones with swipeable kid cards
- 💎 **Glassmorphism UI**: Modern, beautiful glass-effect design
- 🔄 **Real-time Sync**: Automatic synchronization across all family devices
- 📅 **Date Navigation**: Easy browsing of homework by date
- ✅ **Task Management**: Add, complete, and organize homework by subject
- 🎨 **Multiple Kids**: Support for multiple children with custom accent colors
- 📲 **PWA**: Install on any device, works offline
- 🔥 **Firebase Powered**: Serverless backend with Firestore

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Firebase account (free tier works)

### Installation

1. **Clone or navigate to the project:**
   ```bash
   cd homework-pane
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase:**

   a. Go to [Firebase Console](https://console.firebase.google.com/)
   
   b. Create a new project (or use existing)
   
   c. Enable Firestore Database:
      - Go to Build > Firestore Database
      - Click "Create database"
      - Start in **production mode**
      - Choose your region
   
   d. Get your Firebase config:
      - Go to Project Settings (gear icon)
      - Scroll to "Your apps" section
      - Click the web icon (`</>`) to add a web app
      - Register your app (nickname: "Homework Pane")
      - Copy the `firebaseConfig` object
   
   e. Update `src/firebase.ts` with your actual config values:
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

4. **Deploy Firestore Rules:**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```
   
   - Select "Firestore" and "Hosting"
   - Use existing project (select your project)
   - Accept default files (firestore.rules, firebase.json)
   - Choose "dist" as public directory
   - Configure as single-page app: Yes
   - Don't set up automatic builds
   
   Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open in browser:**
   - Navigate to `http://localhost:5173`
   - For mobile testing, use your local IP (shown in terminal)

## 📦 Dependencies Explained

### Core Dependencies

- **`react`** & **`react-dom`**: UI framework for building the component-based interface
- **`firebase`**: Backend services (Firestore database for real-time data sync)
- **`date-fns`**: Modern date utility library for formatting and manipulating dates
- **`clsx`**: Utility for conditionally joining CSS class names

### Dev Dependencies

- **`vite`**: Fast build tool and development server
- **`@vitejs/plugin-react`**: Vite plugin for React with Fast Refresh
- **`typescript`**: Type-safe JavaScript for better development experience
- **`@types/react`** & **`@types/react-dom`**: TypeScript type definitions for React

### PWA Dependencies

- **`vite-plugin-pwa`**: Vite plugin that generates service worker and manifest for PWA functionality
- **`workbox-window`**: Library for registering and communicating with service workers

## 🏗️ Project Structure

```
homework-pane/
├── public/
│   ├── manifest.webmanifest      # PWA manifest
│   ├── robots.txt                # Search engine rules
│   └── pwa-icon-placeholder.txt  # Icon generation instructions
├── src/
│   ├── components/
│   │   ├── KidCard.tsx          # Individual kid's homework card
│   │   ├── TaskModal.tsx        # Add/edit task modal
│   │   └── SwipePager.tsx       # Swipeable container for mobile
│   ├── App.tsx                  # Main app component
│   ├── firebase.ts              # Firebase initialization
│   ├── types.ts                 # TypeScript interfaces
│   ├── utils.ts                 # Helper functions
│   ├── index.css                # Glassmorphism styles
│   └── main.tsx                 # App entry point
├── firebase.json                # Firebase hosting config
├── firestore.rules              # Firestore security rules
├── .firebaserc                  # Firebase project config
├── vite.config.ts              # Vite configuration
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## 🎨 Using the App

### Adding Kids

The app automatically creates cards for kids as you add tasks. Default kids are **Aiden** and **Hazel**. When adding a task, you can:
- Select an existing kid from the dropdown
- Click "+ New Kid" to add a new child

Each kid gets a unique accent color:
- Aiden: Blue (#3c9df1)
- Hazel: Orange (#ff9933)
- Additional kids get colors from a rotating palette

### Adding Homework

1. Click the "+ Add Homework" button on any kid's card
2. Fill in the form:
   - **Kid**: Select or add a new kid
   - **Subject**: Math, English, Science, History, or Other
   - **Task Type**: Notebook, Textbook, Handwriting, or Other
   - **Description**: What needs to be done
   - **Page Number**: (Shows only for Textbook/Handwriting)
3. Click "Save Task"

### Completing Tasks

Simply tap the checkbox next to any task to mark it complete. Changes sync instantly to all devices.

### Navigating Dates

- Use **‹ / ›** arrows to browse previous/next days
- Click **TODAY** to jump to the current date
- Tasks are organized by the selected date

### Mobile vs Desktop

- **Mobile (< 768px)**: One kid card at a time, swipe left/right to switch
- **Tablet/Desktop (≥ 768px)**: Side-by-side cards for all kids

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Deploy to Firebase Hosting

1. **Update `.firebaserc`** with your project ID:
   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```

2. **Deploy:**
   ```bash
   firebase deploy
   ```

Your app will be live at: `https://your-project-id.web.app`

### Install as PWA

Once deployed (or running locally), you can install the app:

**On Mobile:**
- iOS: Safari > Share > Add to Home Screen
- Android: Chrome > Menu > Install app

**On Desktop:**
- Chrome: Address bar > Install icon (⊕)
- Edge: Address bar > App available icon

## 🔐 Security Notes

⚠️ **Important**: This app uses **public read/write** access to the `homework_tasks` collection in Firestore. This is suitable for family use but means anyone with your Firebase project URL could theoretically access your data.

For production use with sensitive data, consider:
- Adding Firebase Authentication
- Updating Firestore rules to require authentication
- Implementing user-based data isolation

Current Firestore rules (for reference):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /homework_tasks/{taskId} {
      allow read, write: true;  // Public access
    }
    match /{document=**} {
      allow read, write: false;  // Block everything else
    }
  }
}
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Adding PWA Icons

Currently, the app uses placeholder references for icons. To add real icons:

1. Create or generate icons (192x192, 512x512)
2. Place in `/public` folder:
   - `pwa-192x192.png`
   - `pwa-512x512.png`
   - `favicon.ico`
   - `apple-touch-icon.png`

Use tools like:
- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

## 📱 Browser Support

- Chrome/Edge (recommended)
- Safari 14+
- Firefox (limited PWA support)
- Any modern mobile browser

## 🐛 Troubleshooting

### "Failed to add/update task" error

- Check that Firebase config in `src/firebase.ts` is correct
- Verify Firestore rules are deployed: `firebase deploy --only firestore:rules`
- Check browser console for specific Firebase errors

### Tasks not syncing

- Ensure you're connected to the internet
- Check Firebase Console > Firestore Database to see if data is being written
- Verify all devices are using the same Firebase project

### PWA not installing

- Ensure you're using HTTPS (required for PWA)
- Check that manifest.webmanifest is being served correctly
- Verify icons are present (or use placeholders temporarily)

## 📄 License

MIT License - Feel free to use and modify for your family's needs!

## 🤝 Contributing

This is a family homework tracker, but feel free to fork and customize for your own use!

---

Built with ❤️ for Aiden and Hazel

