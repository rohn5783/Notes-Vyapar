// models/note.model.ts
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    index: true,
  },
  subject: {
    type: String,
    index: true,
  },
  price: Number,
  fileUrl: String,
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

noteSchema.index({ createdAt: -1 });

export default mongoose.models.Note || mongoose.model("Note", noteSchema);