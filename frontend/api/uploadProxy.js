// File: frontend/api/uploadProxy.js
// This function is designed EXCLUSIVELY to handle multipart/form-data file uploads.

import axios from 'axios';

// Get the base URL (e.g., http://46.62.201.166:4000)
const HETZNER_API_BASE = process.env.VITE_HETZNER_API_URL; 

if (!HETZNER_API_BASE) {
  throw new Error('VITE_HETZNER_API_URL environment variable is not set.');
}

// --- CRITICAL FIX: Tell Vercel to disable body parsing ---
// This prevents Vercel from corrupting the incoming file stream.
export const config = {
  api: {
    bodyParser: false, 
  },
};
// ---

export default async function handler(req, res) {
  // The path must be read from the query string defined in vercel.json
  const proxyPath = req.query.path || ''; 
  const targetUrl = `${HETZNER_API_BASE}/api/${proxyPath}`;
  
  // Log the target URL for debugging
  console.log(`[UPLOAD PROXY] Forwarding ${req.method} to: ${targetUrl}`);
  
  // CORS Headers (Must be present for pre-flight OPTIONS check and the main request)
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
      // CRITICAL: We forward the original Content-Type header which contains the boundary data
      'Content-Type': req.headers['content-type'], 
      'Accept-Encoding': 'identity',
    };

    // Forward the ENTIRE raw request stream directly to the backend
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: headers,
      data: req, // The raw request stream is passed directly as data
      responseType: 'arraybuffer'
    });

    // Forward the backend's response
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
      // Forward the backend's error response (e.g., 400, 401, 500)
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(502).json({ message: 'Proxy Error: Could not connect to Hetzner backend for file upload.' });
    }
  }
}