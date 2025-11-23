import { handleAuth } from '../../netlify/functions/utils/auth-handler';

export default async function handler(req, res) {
  const { all } = req.query;
  const path = `/${all?.join('/') || ''}`;
  
  // Route to the appropriate handler based on the path
  switch (path) {
    case '/login':
    case '/teacher-login':
      return handleAuth('teacher-login', req, res);
    case '/student-login':
      return handleAuth('student-login', req, res);
    case '/staff-login':
      return handleAuth('staff-login', req, res);
    default:
      res.status(404).json({ error: 'Not found' });
  }
}
