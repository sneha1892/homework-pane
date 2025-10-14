# Kid Templates Setup Guide

## Important: You MUST create the templates in Firestore before using the app!

The app requires predefined templates for Hazel and Aiden in the `kid_templates` collection. Follow these steps:

## Option 1: Manual Setup (Firebase Console)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Build > Firestore Database**
4. Click **Start collection**
5. Collection ID: `kid_templates`

### Create Hazel's Template

1. Document ID: `Hazel`
2. Add field `templateTasks` (type: **array**)
3. Add these array elements (each is a **map** with two fields):

```
0: { subject: "English", book: "Textbook" }
1: { subject: "English", book: "Handwriting Book" }
2: { subject: "English", book: "Notebook" }
3: { subject: "Malayalam", book: "Textbook" }
4: { subject: "Malayalam", book: "Handwriting Book" }
5: { subject: "Malayalam", book: "Notebook" }
6: { subject: "Maths", book: "Textbook" }
7: { subject: "Maths", book: "Notebook" }
8: { subject: "GK", book: "Textbook" }
```

### Create Aiden's Template

1. Document ID: `Aiden`
2. Add field `templateTasks` (type: **array**)
3. Add Hazel's 9 items PLUS these 2:

```
9: { subject: "Hindi", book: "Textbook" }
10: { subject: "Hindi", book: "Notebook" }
```

## Option 2: Using Firebase CLI (Advanced)

Create a file `seed-templates.json`:

```json
{
  "kid_templates": {
    "Hazel": {
      "kidName": "Hazel",
      "templateTasks": [
        { "subject": "English", "book": "Textbook" },
        { "subject": "English", "book": "Handwriting Book" },
        { "subject": "English", "book": "Notebook" },
        { "subject": "Malayalam", "book": "Textbook" },
        { "subject": "Malayalam", "book": "Handwriting Book" },
        { "subject": "Malayalam", "book": "Notebook" },
        { "subject": "Maths", "book": "Textbook" },
        { "subject": "Maths", "book": "Notebook" },
        { "subject": "GK", "book": "Textbook" }
      ]
    },
    "Aiden": {
      "kidName": "Aiden",
      "templateTasks": [
        { "subject": "English", "book": "Textbook" },
        { "subject": "English", "book": "Handwriting Book" },
        { "subject": "English", "book": "Notebook" },
        { "subject": "Malayalam", "book": "Textbook" },
        { "subject": "Malayalam", "book": "Handwriting Book" },
        { "subject": "Malayalam", "book": "Notebook" },
        { "subject": "Maths", "book": "Textbook" },
        { "subject": "Maths", "book": "Notebook" },
        { "subject": "GK", "book": "Textbook" },
        { "subject": "Hindi", "book": "Textbook" },
        { "subject": "Hindi", "book": "Notebook" }
      ]
    }
  }
}
```

Then use a script or Firestore import tool.

## Verify Setup

After creating the templates:

1. Open Firestore Database
2. You should see:
   - Collection: `kid_templates`
     - Document: `Hazel` (with 9 templateTasks)
     - Document: `Aiden` (with 11 templateTasks)

3. Run your app: `npm run dev`
4. The first time you open a date, the app will create `daily_tasks/YYYY-MM-DD_Hazel` and `daily_tasks/YYYY-MM-DD_Aiden` automatically!

## Troubleshooting

### "No template found" in console
- Double-check document IDs are exactly `Hazel` and `Aiden` (case-sensitive)
- Verify `templateTasks` field exists and is an array

### "Permission denied" errors
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Check rules allow read/write to `kid_templates` collection

### App loads with empty task lists
- Templates are created correctly
- Check browser console for any Firebase errors
- Verify Firebase config in `src/firebase.ts` is correct

## What Happens Next?

Once templates are set up:
1. App checks for daily doc on date change
2. If not found, clones template into new daily doc
3. All tasks start with empty descriptions and `completed: false`
4. You can add notes, check off tasks, or remove lines
5. Each day's data is independent; template stays intact

