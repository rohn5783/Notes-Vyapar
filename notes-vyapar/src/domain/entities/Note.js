// models/note.model.ts
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true,
  },
  subject: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  category: {
    type: String,
    default: "General",
  },
  tags: {
    type: [String],
    default: [],
  },
  fileUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: null,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  language: {
    type: String,
    default: "English",
  },
  university: {
    type: String,
    default: "",
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

noteSchema.index({ createdAt: -1 });
noteSchema.index({ seller: 1 });

export default mongoose.models.Note || mongoose.model("Note", noteSchema);