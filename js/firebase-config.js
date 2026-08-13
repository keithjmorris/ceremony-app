// Fill these in from Firebase Console > Project settings > Your apps > SDK setup and configuration.
// It's fine for these values to be visible in the browser — Firebase security is enforced by
// Firestore/Storage rules, not by hiding this config.
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// The Mux Playback ID for this event's live stream. The same ID keeps working
// to play the recorded video after the stream ends, so you only set this once.
export const MUX_PLAYBACK_ID = "N2jE01AhX2bEAOCYx9iolRFYeeK8WqFafLSAbcuGQbc00";

// Your own email — grants delete access on any photo in the album, not just your own uploads.
export const ADMIN_EMAIL = "keith.morris@outlook.com";

// A short label shown on the live/gallery pages.
export const EVENT_NAME = "The Ceremony";
