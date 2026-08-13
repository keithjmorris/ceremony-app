// Runs on Vercel's server, not in the browser — this is what keeps the Mux
// access token secret from guests while still letting the admin page list
// recent recordings.
export default async function handler(req, res) {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;

  if (!tokenId || !tokenSecret) {
    res.status(500).json({ error: 'MUX_TOKEN_ID / MUX_TOKEN_SECRET not set in Vercel environment variables.' });
    return;
  }

  try {
    const auth = Buffer.from(`${tokenId}:${tokenSecret}`).toString('base64');
    const muxRes = await fetch('https://api.mux.com/video/v1/assets?limit=25', {
      headers: { Authorization: `Basic ${auth}` }
    });
    const data = await muxRes.json();

    if (!muxRes.ok) {
      res.status(muxRes.status).json({ error: data });
      return;
    }

    const assets = (data.data || [])
      .filter((a) => a.status === 'ready' && a.playback_ids && a.playback_ids.length)
      .map((a) => {
        const publicPlayback = a.playback_ids.find((p) => p.policy === 'public') || a.playback_ids[0];
        return {
          assetId: a.id,
          playbackId: publicPlayback.id,
          createdAt: a.created_at,
          durationSeconds: a.duration || null
        };
      });

    res.status(200).json({ assets });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
