import { handleAuth } from '../netlify/functions/utils/auth-handler';
import { handleEvent } from '../netlify/functions/utils/event-handler';

export default async function handler(req, res) {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  
  // Handle authentication routes
  if (pathname.startsWith('/api/auth')) {
    return handleAuth(pathname.replace('/api', ''), req, res);
  }
  
  // Handle event routes
  if (pathname.startsWith('/api/events')) {
    return handleEvent(pathname.replace('/api', ''), req, res);
  }
  
  // Handle other API routes
  res.status(404).json({ error: 'Not found' });
}
