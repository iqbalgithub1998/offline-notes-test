import connectToDatabase from '../../utils/mongodb';
import Note from '../../models/notes';
export default async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      const { id } = req.query; // ID of the note to edit (likely localId stored as _id by client)
      const { title: noteTitle } = req.body; // New title

      if (!id || typeof noteTitle !== 'string') {
        return res.status(400).json({ error: 'Missing note ID or title' });
      }

      // TODO: Implement logic to update the note in your chosen data store.
      // - Connect to the database/data source.
      // - Find the note by its unique identifier (`id`).
      // - Update the note's title to `noteTitle`.
      // - Handle the case where the note is not found.
      // - Replace the example response below.

      await connectToDatabase();

      const updatedNote = await Note.findByIdAndUpdate(
        id,
        {
          title: noteTitle,
        },
        { new: true } // Return the updated document
      );

      if (!updatedNote) {
        return res.status(404).json({ error: 'Note not found' });
      }

      res.status(200).json({ message: 'Note edited successfully', note: updatedNote });
    } catch (error) {
      console.error('Error editing note:', error);
      res.status(500).json({ error: 'Failed to edit note' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}