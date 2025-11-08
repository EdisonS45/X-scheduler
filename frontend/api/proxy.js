import axios from 'axios';

// IMPORTANT: This environment variable MUST NOT have /api at the end.
// Vercel should be set to: http://46.62.201.166:4000
const HETZNER_API_BASE = process.env.VITE_HETZNER_API_URL; 

// --- CRITICAL FIX 1: Tell Vercel to disable body parsing ---
export const config = {
  api: {
    bodyParser: false, 
  },
};
// ---

if (!HETZNER_API_BASE) {
  throw new Error('VITE_HETZNER_API_URL environment variable is not set.');
}

export default async function handler(req, res) {
  const proxyPath = req.query.path || ''; 
  // Target URL will be http://46.62.201.166:4000/api/auth/login
  const targetUrl = `${HETZNER_API_BASE}/api/${proxyPath}`;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    const headers = {
      'Authorization': req.headers.authorization || '',
      // FIX 2: Do NOT include content-type for multipart data—axios will get it from the stream headers
      'Content-Type': req.headers['content-type'], 
      'Accept-Encoding': 'identity',
    };

    // --- FIX 3: Forward the entire raw request object as the data stream ---
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: headers,
      data: req, // The raw request stream is passed directly
      responseType: 'arraybuffer'
    });

    res.status(response.status);
    Object.keys(response.headers).forEach(key => {
        if (key.toLowerCase() !== 'transfer-encoding' && key.toLowerCase() !== 'content-encoding') {
            res.setHeader(key, response.headers[key]);
        }
    });
    res.send(response.data);

  } catch (error) {
    console.error(`[PROXY ERROR] Target URL: ${targetUrl}`, error.message);
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(502).json({ message: 'Proxy Error: Could not connect to the Hetzner backend. Check firewall/server status.' });
    }
  }
}