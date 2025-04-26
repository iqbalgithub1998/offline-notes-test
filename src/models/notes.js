import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema(
  {
    localId: { type: String, required: false },
    localDeleteSynced: { type: Boolean, default: false },
    localEditSynced: { type: Boolean, default: false },
    title: { type: String, required: true },
    tag: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, 
  }
);

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
