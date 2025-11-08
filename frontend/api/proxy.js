// File: frontend/api/proxy.js
// This function runs on Vercel's secure HTTPS server and forwards the request to your insecure HTTP backend.

import axios from 'axios';

// The URL of your Hetzner backend, fetched from Vercel's environment vars.
// It must include http:// and the port.
const HETZNER_API_BASE = process.env.VITE_HETZNER_API_URL; 

if (!HETZNER_API_BASE) {
  // If the variable isn't set, this will return a server error
  throw new Error('VITE_HETZNER_API_URL environment variable is not set.');
}

export default async function handler(req, res) {
  // 1. Determine the path (e.g., /auth/register)
  // Vercel maps /api/auth/register to this function with req.url = /api/auth/register
  const proxyPath = req.url.replace('/api', '');

  // 2. Construct the full HTTP target URL
  // Example: http://46.62.201.166:4000/api/auth/register
  const targetUrl = `${HETZNER_API_BASE}${proxyPath}`;

  // Pre-flight CORS handling (Crucial for Vercel to allow the frontend fetch)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      // Pass along the body and headers, including the Authorization token
      headers: {
        'Authorization': req.headers.authorization || '',
        'Content-Type': req.headers['content-type'] || 'application/json',
        // Important: Stop the proxy from crashing on gzip/compression headers
        'Accept-Encoding': 'identity',
        // Set the host header to the target host
        'Host': new URL(HETZNER_API_BASE).host
      },
      data: req.method !== 'GET' ? req.body : undefined,
      responseType: 'arraybuffer' // Use arraybuffer for predictable data handling
    });

    // 3. Forward CORS headers and status code back to the Vercel frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    res.status(response.status);
    Object.keys(response.headers).forEach(key => {
        // Forward all headers except for potentially problematic ones
        if (key.toLowerCase() !== 'transfer-encoding' && key.toLowerCase() !== 'content-encoding') {
            res.setHeader(key, response.headers[key]);
        }
    });

    // 4. Send the response body
    res.send(response.data);

  } catch (error) {
    console.error("Proxy Error:", error.message);
    if (error.response) {
      // Forward the backend's error response (e.g., 400, 401, 429)
      res.status(error.response.status).json(error.response.data);
    } else {
      // Network failure on the proxy side
      res.status(500).json({ message: 'Proxy Error: Could not connect to the Hetzner backend.' });
    }
  }
}