import axios from 'axios';
// VITE_HETZNER_API_URL should be set to: http://46.62.201.166:4000
const HETZNER_API_BASE = process.env.VITE_HETZNER_API_URL; 

// CRITICAL FIX: Tell Vercel to disable body parsing
export const config = {
  api: {
    bodyParser: false, 
  },
};

if (!HETZNER_API_BASE) {
  throw new Error('VITE_HETZNER_API_URL environment variable is not set.');
}

export default async function handler(req, res) {
  // 1. Extract the full path from the Vercel request URL
  // req.url will be the full path: /api/templates/ID/create-project
  const vercelApiPathPrefix = '/api';
  // This extracts the target path: /templates/ID/create-project
const pathFromQuery = req.query.path || '';
  // 2. Construct the full target URL
  const targetUrl = `${HETZNER_API_BASE}/api${pathFromQuery}`; 

  // Log the target URL for debugging
  console.log(`[UPLOAD PROXY] Forwarding ${req.method} to: ${targetUrl}`);
  
  // CORS Headers (Unchanged)
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
      'Content-Type': req.headers['content-type'], 
      'Accept-Encoding': 'identity',
    };

    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: headers,
      data: req, 
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