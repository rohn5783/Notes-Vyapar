// src/lib/getNotes.js
import connectDB from "../infrastructure/database/mongodb";
import Note from "../domain/entities/Note";
// eslint-disable-next-line no-unused-vars
import User from "../domain/entities/User"; 
import mongoose from "mongoose";

export async function getNotes(searchParams) {
  try {
    await connectDB();
    
    const { search, type, sort } = searchParams || {};
    
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } }
      ];
    }
    
    if (type === "free") {
      query.price = 0;
    } else if (type === "paid") {
      query.price = { $gt: 0 };
    }
    
    let sortObj = { createdAt: -1 };
    if (sort === "oldest") {
      sortObj = { createdAt: 1 };
    } else if (sort === "price_low") {
      sortObj = { price: 1, createdAt: -1 };
    } else if (sort === "price_high") {
      sortObj = { price: -1, createdAt: -1 };
    }

    const notes = await Note.find(query)
      .populate("seller", "name")
      .sort(sortObj)
      .lean();
      
    // Serialize object to pass from Server Component to Client Component easily
    return JSON.parse(JSON.stringify(notes));
  } catch (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
}

export async function getNoteById(id) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    await connectDB();

    const note = await Note.findById(id)
      .populate("seller", "name")
      .lean();

    return note ? JSON.parse(JSON.stringify(note)) : null;
  } catch (error) {
    console.error("Error fetching note:", error);
    return null;
  }
}
