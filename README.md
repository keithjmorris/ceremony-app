# Ceremony App — Setup Guide

A private, invite-only site for a live-streamed ceremony and its photo album.
Plain HTML/CSS/JS — no build step, deploys straight to Vercel.

## What's here

- `index.html` — guest sign-in (email + shared passcode)
- `live.html` — the live stream, which automatically becomes the recording afterward
- `gallery.html` — the photo album
- `upload.html` — lets any signed-in guest add a photo to the album
- `js/firebase-config.js` — **you need to fill this in** (see Step 1)
- `firestore.rules` / `storage.rules` — lock the data down to signed-in guests only

## Step 1 — Create your Firebase project

1. Go to https://console.firebase.google.com → **Add project** → name it (e.g. "our-ceremony") → create.
2. In the project, click the **</> (web)** icon to register a web app. Skip Firebase Hosting (we're using Vercel).
3. Copy the `firebaseConfig` object it shows you into `js/firebase-config.js`, replacing the placeholder values.
4. In the left sidebar: **Build → Authentication → Get started → Anonymous** → enable it. (This is invisible plumbing, not a real login — it's just what lets the app read Firestore at all under the security rules.)
5. **Build → Firestore Database → Create database** → start in production mode.
6. **Build → Storage → Get started** → this is where photos will live.
7. Deploy the security rules: install the Firebase CLI (`npm install -g firebase-tools`), run `firebase login`, then from this folder run `firebase init` (select Firestore + Storage, point it at your project, keep the existing `firestore.rules`/`storage.rules` files), then `firebase deploy --only firestore:rules,storage:rules`.

## Step 2 — Add your guest list and set the passcode

Guests are just documents in a `guests` collection, one per invited email (lowercased), so anyone not on the list is turned away at the door.

In the Firebase Console → Firestore Database → Start collection → id `guests`. For each guest, add a document whose **Document ID is their lowercased email** (e.g. `aunt.sue@example.com`) — the document's contents don't matter, just its existence.

Then create one more collection, `config`, with a single document whose **Document ID is `access`**, containing one field:
```
code: "YourPasscodeHere"
```
This is the passcode you send guests along with their invitation (text message, printed card, however you like). To change it later — say, if it leaks — just edit this one field in the Firebase Console; no redeploy needed.

Guests get in by entering an email that matches a `guests` document **and** this passcode. Neither alone is enough.

## Step 3 — Create your Mux account and live stream

1. Sign up at https://mux.com (free tier covers a single ceremony easily).
2. Dashboard → **Video → Live Streams → Create new live stream**. Leave "Record live streams" on (it's on by default) — that's what gives you the permanent recording afterward.
3. Mux gives you:
   - **Stream URL + Stream Key** → paste into Larix Broadcaster (see the steps I gave you earlier).
   - **Playback ID** → paste into `js/firebase-config.js` as `MUX_PLAYBACK_ID`.
4. That's it — the same playback ID plays the live feed during the event and the saved recording afterward, so you only set it once.

## Step 4 — Photos

No manual step needed — any signed-in guest can add a photo from `upload.html`, and it appears in the album immediately for everyone. Uploads are capped at 15MB and must be an image file (enforced by `storage.rules`).

Guests can delete their own uploads, and you can delete any photo, using the small × button that appears on hover in the album — set your own email as `ADMIN_EMAIL` in `js/firebase-config.js` to enable this for yourself. Note this isn't strongly enforced (guests aren't individually authenticated under the passcode model), so treat it as a convenience for a trusted group rather than a hard security boundary. Photos uploaded before this feature was added won't have their underlying file removed from Storage on delete (only the album entry) — that's fine for a handful of older test photos, just something to know.

## Step 5 — Adding each recording to the archive

- `live.html` ("Watch") always shows whatever is currently broadcasting, live.
- `recordings.html` ("Recordings") is a separate, browsable archive of every past broadcast — rehearsal, ceremony, speeches, whatever you stream — each kept permanently as its own entry.

Each time you start and stop a broadcast in Larix, Mux automatically saves it as a new, separate recording with its own permanent ID — even though every broadcast uses the same Larix connection and stream key. To make a recording appear on the Recordings page:

1. In the Mux dashboard, go to **Video → Assets** (not Live Streams). Find the asset that matches when you just finished broadcasting — sorted by most recent.
2. Open it and copy its **Playback ID** (this is different from the live stream's own Playback ID you set in `firebase-config.js`).
3. In Firebase Console → Firestore Database → `videos` collection (create it if it doesn't exist yet) → Add document, with these fields:
   - `title` (string) — e.g. `"Rehearsal"`, `"The Ceremony"`, `"Speeches"`
   - `playbackId` (string) — the asset's Playback ID from step 2
   - `order` (number) — `1`, `2`, `3`... controls the order they're listed in

That's it — no redeploy needed, it appears on the Recordings page immediately.

## Step 6 — Push to GitHub and deploy on Vercel

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
