# Ceremony App — Setup Guide

A private, invite-only site for a live-streamed ceremony and its photo album.
Plain HTML/CSS/JS — no build step, deploys straight to Vercel.

## What's here

- `index.html` — guest sign-in (magic email link)
- `live.html` — the live stream, which automatically becomes the recording afterward
- `gallery.html` — the photo album
- `js/firebase-config.js` — **you need to fill this in** (see Step 1)
- `firestore.rules` / `storage.rules` — lock the data down to signed-in guests only

## Step 1 — Create your Firebase project

1. Go to https://console.firebase.google.com → **Add project** → name it (e.g. "our-ceremony") → create.
2. In the project, click the **</> (web)** icon to register a web app. Skip Firebase Hosting (we're using Vercel).
3. Copy the `firebaseConfig` object it shows you into `js/firebase-config.js`, replacing the placeholder values.
4. In the left sidebar: **Build → Authentication → Get started → Email link (passwordless sign-in)** → enable it.
5. **Build → Firestore Database → Create database** → start in production mode.
6. **Build → Storage → Get started** → this is where photos will live.
7. Deploy the security rules: install the Firebase CLI (`npm install -g firebase-tools`), run `firebase login`, then from this folder run `firebase init` (select Firestore + Storage, point it at your project, keep the existing `firestore.rules`/`storage.rules` files), then `firebase deploy --only firestore:rules,storage:rules`.

## Step 2 — Add your guest list

Guests are just documents in a `guests` collection, one per invited email (lowercased), so anyone not on the list is turned away at the door.

In the Firebase Console → Firestore Database → Start collection → id `guests`. For each guest, add a document whose **Document ID is their lowercased email** (e.g. `aunt.sue@example.com`) — the document's contents don't matter, just its existence. Tedious for a big list by hand; if your guest list is large, say the word and I'll write you a small script to bulk-import a CSV instead.

## Step 3 — Create your Mux account and live stream

1. Sign up at https://mux.com (free tier covers a single ceremony easily).
2. Dashboard → **Video → Live Streams → Create new live stream**. Leave "Record live streams" on (it's on by default) — that's what gives you the permanent recording afterward.
3. Mux gives you:
   - **Stream URL + Stream Key** → paste into Larix Broadcaster (see the steps I gave you earlier).
   - **Playback ID** → paste into `js/firebase-config.js` as `MUX_PLAYBACK_ID`.
4. That's it — the same playback ID plays the live feed during the event and the saved recording afterward, so you only set it once.

## Step 4 — Add photos

For now, upload images via Firebase Console → Storage → `photos/` folder, then add a matching document in a `photos` Firestore collection:
```
{ url: "<the Storage download URL>", caption: "...", order: 1 }
```
Once you're happy with the flow, I can build you a small admin upload page so you're not doing this by hand in the console — just ask.

## Step 5 — Push to GitHub and deploy on Vercel

```bash
cd ceremony-app
git init
git add .
git commit -m "Initial ceremony app"
gh repo create ceremony-app --private --source=. --push
```
Then on https://vercel.com → **Add New Project** → import the GitHub repo → deploy. Since this is plain static HTML, Vercel needs no build settings at all.

## Before the day

- Add every guest email to the `guests` collection.
- Do a private test broadcast from the venue (see the Larix test-run advice).
- Confirm `MUX_PLAYBACK_ID` and the Firebase config in `js/firebase-config.js` are the real values, not placeholders, then redeploy.
