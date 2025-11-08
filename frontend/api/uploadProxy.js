import axios from 'axios';

// This environment variable MUST be set to: http://46.62.201.166:4000
const HETZNER_API_BASE = process.env.VITE_HETZNER_API_URL; 

// --- CRITICAL FIX 1: Tell Vercel to disable body parsing for file streams ---
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
  // 1. Read the full path from the query parameter set by vercel.json
  // Example pathFromQuery: templates/690eeaca1ae5e1364a25e643/create-project
  const pathFromQuery = req.query.path || '';

  // 2. Construct the full target URL, including the backend's /api route
  // Example targetUrl: http://46.62.201.166:4000/api/templates/ID/create-project
  const targetUrl = `${HETZNER_API_BASE}/api/${pathFromQuery}`; 

  console.log(`[UPLOAD PROXY] Forwarding ${req.method} to: ${targetUrl}`);
  
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    const headers = {
      'Authorization': req.headers.authorization || '',
      'Content-Type': req.headers['content-type'], // CRITICAL: Forward the original Content-Type
      'Accept-Encoding': 'identity',
    };

    // Forward the raw request stream as the data for file upload
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: headers,
      data: req, // Raw request stream
      responseType: 'arraybuffer'
    });

    // Forward the backend's response (Unchanged)
    res.status(response.status);
    Object.keys(response.headers).forEach(key => {
        if (key.toLowerCase() !== 'transfer-encoding' && key.toLowerCase() !== 'content-encoding') {
            res.setHeader(key, response.headers[key]);
        }
    });
    res.send(response.data);

  } catch (error) {
    console.error(`[UPLOAD PROXY ERROR] Target URL: ${targetUrl}`, error.message);
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(502).json({ message: 'Proxy Error: Could not connect to Hetzner backend for file upload.' });
    }
  }
}