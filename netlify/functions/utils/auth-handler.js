import { getDB } from './db';

export async function handleAuth(path, req, res) {
  const db = await getDB();
  const { method, body } = req;

  try {
    // Handle login requests
    if (method === 'POST' && path.includes('-login')) {
      const { email, password } = body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Determine user type from path (teacher, student, or staff)
      const userType = path.split('-')[0].replace('/', '');
      const user = await db.collection(`${userType}s`).findOne({ email });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // In a real app, you should hash and compare passwords properly
      // This is just a basic example
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token (in a real app, use a proper JWT library)
      const token = Buffer.from(JSON.stringify({
        id: user._id,
        email: user.email,
        role: userType,
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      })).toString('base64');

      // Return user data without password
      const { password: _, ...userData } = user;
      return res.status(200).json({
        ...userData,
        token,
        role: userType
      });
    }

    // Handle other auth-related endpoints
    switch (path) {
      case '/me':
        if (method === 'GET') {
          const token = req.headers.authorization?.split(' ')[1];
          if (!token) {
            return res.status(401).json({ error: 'No token provided' });
          }
          
          try {
            const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
            return res.status(200).json(decoded);
          } catch (err) {
            return res.status(401).json({ error: 'Invalid token' });
          }
        }
        break;

      default:
        return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('Auth handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
