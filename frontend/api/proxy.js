import axios from 'axios';

// The URL of your Hetzner backend. Should be http://46.62.201.166:4000/api
const HETZNER_API_BASE = process.env.VITE_HETZNER_API_URL; 

if (!HETZNER_API_BASE) {
  // If the variable isn't set, this will return a server error
  throw new Error('VITE_HETZNER_API_URL environment variable is not set.');
}

export default async function handler(req, res) {
  // --- FIX: Safely read the path from the Vercel rewrite parameter ---
  const proxyPath = req.query.path || ''; 
  
  // Construct the full HTTP target URL (Vercel rewrite handles the '/api' prefix implicitly)
  const targetUrl = `${HETZNER_API_BASE}/${proxyPath}`;

  // Log the target URL for server debugging
  console.log(`[PROXY] Forwarding ${req.method} to: ${targetUrl}`);

  // 1. Pre-flight CORS handling (Crucial for Vercel to allow the frontend fetch)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      // Pass along the Authorization token
      headers: {
        'Authorization': req.headers.authorization || '',
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Accept-Encoding': 'identity',
      },
      // Pass the body for POST/PUT/DELETE
      data: req.body,
      responseType: 'arraybuffer'
    });

    // 2. Forward response status and headers from Hetzner back to the Vercel frontend
    res.status(response.status);
    Object.keys(response.headers).forEach(key => {
        if (key.toLowerCase() !== 'transfer-encoding' && key.toLowerCase() !== 'content-encoding') {
            res.setHeader(key, response.headers[key]);
        }
    });

    // 3. Send the response body
    res.send(response.data);

  } catch (error) {
    console.error(`[PROXY ERROR] Target URL: ${targetUrl}`, error.message);
    if (error.response) {
      // Forward the backend's error response (e.g., 400, 401, 429)
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(502).json({ message: 'Proxy Error: Could not reach the Hetzner backend.' });
    }
  }
}