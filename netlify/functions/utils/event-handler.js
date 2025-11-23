import { getDB } from './db';

export async function handleEvent(path, req, res) {
  const db = await getDB();
  const { method } = req;
  const eventId = req.query.eventId || req.body?.eventId;
  const mongoId = req.query.mongoId || req.body?.mongoId;

  try {
    switch (true) {
      // Get all events
      case path === '/' && method === 'GET':
        const events = await db.collection('events').find({}).toArray();
        return res.status(200).json(events);

      // Create event
      case path === '/' && method === 'POST':
        const newEvent = req.body;
        const result = await db.collection('events').insertOne(newEvent);
        return res.status(201).json({ ...newEvent, _id: result.insertedId });

      // Get single event
      case method === 'GET' && (eventId || mongoId):
        const query = {};
        if (eventId) query.eventId = eventId;
        if (mongoId) query._id = mongoId;
        
        const event = await db.collection('events').findOne(query);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        return res.status(200).json(event);

      // Update event
      case method === 'PUT' && (eventId || mongoId):
        const updateQuery = {};
        if (eventId) updateQuery.eventId = eventId;
        if (mongoId) updateQuery._id = mongoId;
        
        const { _id, ...updateData } = req.body;
        const updateResult = await db.collection('events').updateOne(
          updateQuery,
          { $set: updateData },
          { returnOriginal: false }
        );
        
        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ error: 'Event not found' });
        }
        return res.status(200).json(updateResult);

      // Delete event
      case method === 'DELETE' && (eventId || mongoId):
        const deleteQuery = {};
        if (eventId) deleteQuery.eventId = eventId;
        if (mongoId) deleteQuery._id = mongoId;
        
        const deleteResult = await db.collection('events').deleteOne(deleteQuery);
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ error: 'Event not found' });
        }
        return res.status(200).json({ success: true });

      default:
        return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('Event handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
