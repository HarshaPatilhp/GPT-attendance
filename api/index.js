// Import required modules
import { handleAuth } from '../netlify/functions/utils/auth-handler';
import { handleEvent } from '../netlify/functions/utils/event-handler';

// Main request handler
export default async function handler(req, res) {
  try {
    // Parse the URL
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const pathname = url.pathname;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Parse request body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      try {
        if (!req.body && req.headers['content-type'] === 'application/json') {
          let body = '';
          for await (const chunk of req) {
            body += chunk.toString();
          }
          req.body = body ? JSON.parse(body) : {};
        }
      } catch (error) {
        console.error('Error parsing request body:', error);
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    // Route requests
    if (pathname.startsWith('/api/auth')) {
      return handleAuth(pathname.replace('/api', ''), req, res);
    }
    
    if (pathname.startsWith('/api/events')) {
      return handleEvent(pathname.replace('/api', ''), req, res);
    }

    // Handle 404 for unknown routes
    res.status(404).json({ 
      success: false,
      error: 'Endpoint not found',
      path: pathname
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Vercel Edge Function configuration
export const config = {
  runtime: 'edge',
  regions: ['bom1'], // Use Mumbai region for better performance in India
};
