# Troubleshooting Guide

## Site Not Loading / Blank Screen

### Problem: "Loading..." appears forever

**Most Common Cause**: Kid templates are missing from Firestore

**Solution**:
1. Go to Firebase Console > Firestore Database
2. Create collection `kid_templates`
3. Add documents `Hazel` and `Aiden` with `templateTasks` arrays
4. See [TEMPLATE_SETUP.md](./TEMPLATE_SETUP.md) for detailed instructions

### Problem: Console shows "tasks is not defined"

**Cause**: This was a bug in the initial code (now fixed)

**Solution**: The latest code fixes this. If you still see it:
```bash
# Pull latest changes
git pull

# Or manually verify App.tsx line ~166 uses:
# const allTasks = displayKids.flatMap(k => dailyDocs[k]?.tasks || []);
```

### Problem: "Permission denied" errors

**Cause**: Firestore rules not deployed

**Solution**:
```bash
firebase deploy --only firestore:rules
```

Verify rules allow access to `kid_templates` and `daily_tasks` collections.

### Problem: Firebase config errors

**Cause**: Placeholder values still in `src/firebase.ts`

**Solution**:
1. Go to Firebase Console > Project Settings
2. Scroll to "Your apps" > Web app
3. Copy the config object
4. Replace in `src/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_KEY",  // Not "YOUR_API_KEY"
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... etc
};
```

## Build / Development Issues

### npm run dev fails

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### TypeScript errors

**Common issue**: Missing type definitions

```bash
npm install --save-dev @types/react @types/react-dom
```

### Vite build fails

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## Firebase / Firestore Issues

### Templates not creating daily docs

**Check**:
1. Browser console for errors
2. Firestore console - is `daily_tasks` collection being created?
3. Network tab - are Firestore API calls succeeding?

**Debug**:
Add diagnostic component to `App.tsx`:

```typescript
import DiagnosticCheck from './DiagnosticCheck';

// At top of render:
return (
  <div className="app">
    <DiagnosticCheck />  {/* Temporary for debugging */}
    ...
```

### Slow first load

**Expected behavior**: First visit to a new date creates two daily docs (Hazel + Aiden)

**Optimization options**:
1. Pre-create daily docs for upcoming week
2. Add optimistic UI updates
3. Show skeleton loaders during Firestore writes

### Data not syncing across devices

**Check**:
1. Both devices have internet connection
2. Same Firebase project ID in config
3. Firestore rules deployed
4. No browser cache issues (try incognito)

## PWA Issues

### Can't install app

**Causes**:
- Not using HTTPS (required for PWA)
- Missing manifest icons
- Service worker not registered

**Solutions**:
1. Deploy to Firebase Hosting (auto HTTPS)
2. Add PWA icons to `/public` folder
3. Check browser console for PWA errors

### Manifest icon warnings

```
Error: Download error or resource isn't a valid image
```

**Temporary fix**: Remove icon refs from `public/manifest.webmanifest` until you add real icons

**Permanent fix**: Add PNG icons (see README "Adding PWA Icons")

### Service worker not updating

```bash
# Clear service workers
# Chrome: DevTools > Application > Service Workers > Unregister

# Force rebuild
npm run build
```

## UI / Display Issues

### Glassmorphism not showing

**Check**:
1. Browser supports `backdrop-filter` (recent Chrome/Safari/Firefox)
2. CSS loaded correctly
3. Background gradient applied to body

### Swipe not working on mobile

**Check**:
1. Touch events enabled
2. Browser console for touch event errors
3. Try on actual device (not always emulated)

### Tasks not grouped correctly

**Check**:
- Tasks have `subject` field
- Subject matches expected values (English, Maths, etc.)

## Advanced Debugging

### Enable verbose logging

Add to top of `services.firestore.ts`:

```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db).catch((err) => {
  console.log('Persistence error:', err);
});
```

### Check Firestore document structure

Firebase Console > Firestore > daily_tasks > [pick a doc]

Should see:
```
{
  kidName: "Hazel",
  date: "2025-10-16",
  tasks: [ ... ],
  createdAt: 1697452800000,
  updatedAt: 1697453200000
}
```

### Network debugging

Browser DevTools > Network tab > Filter by "firestore"
- Should see successful requests (200 status)
- Check request/response payloads

## Quick Diagnostic Checklist

Run through these in order:

- [ ] `npm install` completed successfully
- [ ] Firebase config in `src/firebase.ts` has real values
- [ ] Firestore rules deployed: `firebase deploy --only firestore:rules`
- [ ] Templates exist: Firestore Console shows `kid_templates/Hazel` and `kid_templates/Aiden`
- [ ] Each template has `templateTasks` array
- [ ] Hazel has 9 tasks, Aiden has 11 tasks
- [ ] Browser console shows no errors
- [ ] `npm run dev` starts without errors
- [ ] Can access http://localhost:5173

## Still Having Issues?

1. Check browser console (F12) for specific error messages
2. Check Firestore Console for data
3. Use `DiagnosticCheck` component (see `src/DiagnosticCheck.tsx`)
4. Review Network tab for failed API calls
5. Verify Firebase project has Firestore enabled
6. Try in incognito/private mode to rule out cache issues

## Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "tasks is not defined" | Old buggy code | Update App.tsx (fixed) |
| "Permission denied" | Rules not deployed | `firebase deploy --only firestore:rules` |
| "Collection not found" | Templates missing | Create templates in Firestore |
| "Failed to update task" | Firebase config wrong | Check `src/firebase.ts` |
| "Loading forever" | Templates missing | Create Hazel/Aiden docs |
| Module not found | Missing dependency | `npm install` |

---

Need more help? Check:
- [README.md](./README.md) - Full documentation
- [QUICK_START.md](./QUICK_START.md) - Setup guide
- [TEMPLATE_SETUP.md](./TEMPLATE_SETUP.md) - Template creation

