import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const STORAGE_EMAIL_KEY = 'ceremony_guest_email';
const STORAGE_VERIFIED_KEY = 'ceremony_verified';

// Makes sure we have an anonymous Firebase Auth session, which is what lets
// the app read Firestore at all (rules require request.auth != null).
// Guests never see this — it's invisible plumbing, not a login.
function ensureAnonymousSession() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        resolve(user);
      } else {
        const cred = await signInAnonymously(auth);
        resolve(cred.user);
      }
    });
  });
}

// Checks the entered email against the guest list and the entered passcode
// against the shared code stored in Firestore (config/access).
// Returns true and remembers the guest on success; false on any mismatch.
export async function checkAccess(email, passcode) {
  await ensureAnonymousSession();
  const normalizedEmail = email.trim().toLowerCase();

  const guestDoc = await getDoc(doc(db, 'guests', normalizedEmail));
  if (!guestDoc.exists()) return false;

  const accessDoc = await getDoc(doc(db, 'config', 'access'));
  if (!accessDoc.exists()) return false;

  const expectedCode = (accessDoc.data().code || '').trim();
  if (passcode.trim() !== expectedCode) return false;

  window.localStorage.setItem(STORAGE_EMAIL_KEY, normalizedEmail);
  window.localStorage.setItem(STORAGE_VERIFIED_KEY, 'true');
  return true;
}

export function getGuestEmail() {
  return window.localStorage.getItem(STORAGE_EMAIL_KEY) || '';
}

export function signOutGuest() {
  window.localStorage.removeItem(STORAGE_EMAIL_KEY);
  window.localStorage.removeItem(STORAGE_VERIFIED_KEY);
}

// Call this at the top of every protected page (live.html, gallery.html, upload.html).
// Redirects home if the visitor hasn't passed the email + passcode check.
export function requireGuest(onReady) {
  ensureAnonymousSession().then(() => {
    const verified = window.localStorage.getItem(STORAGE_VERIFIED_KEY) === 'true';
    const email = getGuestEmail();
    if (!verified || !email) {
      window.location.href = '/index.html';
      return;
    }
    onReady({ email });
  });
}
