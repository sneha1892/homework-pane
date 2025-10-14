/**
 * Diagnostic component to verify Firebase and template setup
 * Import and render this in App.tsx temporarily if you're having issues
 */
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function DiagnosticCheck() {
  const [status, setStatus] = useState<string[]>([]);

  useEffect(() => {
    async function runDiagnostics() {
      const results: string[] = [];
      
      // Check 1: Firebase initialized
      try {
        results.push('✅ Firebase initialized: ' + (db ? 'Yes' : 'No'));
      } catch (e) {
        results.push('❌ Firebase initialization failed: ' + e);
      }

      // Check 2: Can connect to Firestore
      try {
        const templatesRef = collection(db, 'kid_templates');
        const snap = await getDocs(templatesRef);
        results.push(`✅ Firestore connected: ${snap.size} template(s) found`);
        
        // Check 3: Hazel template exists
        const hazelDoc = snap.docs.find(d => d.id === 'Hazel');
        if (hazelDoc) {
          const data = hazelDoc.data();
          results.push(`✅ Hazel template: ${data.templateTasks?.length || 0} tasks`);
        } else {
          results.push('❌ Hazel template: NOT FOUND! Please create it.');
        }
        
        // Check 4: Aiden template exists
        const aidenDoc = snap.docs.find(d => d.id === 'Aiden');
        if (aidenDoc) {
          const data = aidenDoc.data();
          results.push(`✅ Aiden template: ${data.templateTasks?.length || 0} tasks`);
        } else {
          results.push('❌ Aiden template: NOT FOUND! Please create it.');
        }
      } catch (e: any) {
        results.push('❌ Firestore error: ' + e?.message);
        results.push('💡 Hint: Check firebase.ts config and deploy rules');
      }

      setStatus(results);
    }

    runDiagnostics();
  }, []);

  return (
    <div style={{
      padding: '20px',
      margin: '20px',
      background: 'rgba(255,255,255,0.9)',
      borderRadius: '10px',
      fontFamily: 'monospace'
    }}>
      <h2>🔍 Diagnostic Check</h2>
      {status.length === 0 ? (
        <p>Running diagnostics...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {status.map((s, i) => (
            <li key={i} style={{ margin: '8px 0' }}>{s}</li>
          ))}
        </ul>
      )}
      <hr />
      <p><strong>Next steps if you see ❌:</strong></p>
      <ol>
        <li>Check src/firebase.ts has your real Firebase config</li>
        <li>Deploy Firestore rules: <code>firebase deploy --only firestore:rules</code></li>
        <li>Create templates in Firestore (see TEMPLATE_SETUP.md)</li>
      </ol>
    </div>
  );
}

