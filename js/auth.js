import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Completes sign-in if the visitor just clicked the emailed magic link.
export async function completeSignInIfNeeded() {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('ceremony_email_for_signin');
    if (!email) {
      email = window.prompt('Please confirm the email address this invite was sent to:');
    }
    try {
      await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('ceremony_email_for_signin');
      // Clean the sign-in token out of the URL bar.
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error('Sign-in link failed:', err);
    }
  }
}

// Checks the Firestore "guests" collection for this email.
// Guests are added manually (or via a small script) as documents keyed by lowercased email.
async function isInvitedGuest(email) {
  if (!email) return false;
  const guestDoc = await getDoc(doc(db, 'guests', email.toLowerCase()));
  return guestDoc.exists();
}

// Call this at the top of every protected page. Redirects home if the visitor
// isn't signed in, or isn't on the guest list.
export function requireGuest(onReady) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = '/index.html';
      return;
    }
    const invited = await isInvitedGuest(user.email);
    if (!invited) {
      await signOut(auth);
      window.location.href = '/index.html?denied=1';
      return;
    }
    onReady(user);
  });
}

export { signOut };
