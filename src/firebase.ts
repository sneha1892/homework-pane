import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
export const COLLECTIONS = {
  templates: 'kid_templates',
  daily: 'daily_tasks',
  // legacy: 'homework_tasks' // kept for reference; not used in new template flow
} as const;

// Firebase configuration

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCeKHXVi745baqEA-G_y4whYeejPjoCm4",
  authDomain: "homework-pane.firebaseapp.com",
  projectId: "homework-pane",
  storageBucket: "homework-pane.firebasestorage.app",
  messagingSenderId: "1035033561355",
  appId: "1:1035033561355:web:33c775c90bc66ec00cba0e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

