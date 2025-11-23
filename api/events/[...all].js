import { handleEvent } from '../../netlify/functions/utils/event-handler';

export default async function handler(req, res) {
  const { all } = req.query;
  const path = `/${all?.join('/') || ''}`;
  
  // Route to the appropriate handler based on the path and method
  return handleEvent(path, req, res);
}
