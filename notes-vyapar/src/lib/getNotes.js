// src/lib/getNotes.js
import connectDB from "../infrastructure/database/mongodb";
import Note from "../domain/entities/Note";
// eslint-disable-next-line no-unused-vars
import User from "../domain/entities/User"; 
import mongoose from "mongoose";

const serializeNote = (note) => {
  const serialized = JSON.parse(JSON.stringify(note));
  const seller = serialized.seller;

  return {
    ...serialized,
    sellerId: seller?._id || seller?.id || (typeof seller === "string" ? seller : null),
  };
};

export async function getNotes(searchParams) {
  try {
    await connectDB();

    const {
      search,
      type,
      sort,
      category,
      sellerId,
      page = 1,
      limit = 20,
    } = searchParams || {};

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number(limit) || 20));
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    if (search) {
      const regex = { $regex: search, $options: "i" };
      query.$or = [
        { title: regex },
        { subject: regex },
        { description: regex },
        { category: regex },
        { tags: regex },
      ];
    }

    if (type === "free") {
      query.price = 0;
    } else if (type === "paid") {
      query.price = { $gt: 0 };
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
      query.seller = sellerId;
    }

    const sortMap = {
      latest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_low: { price: 1 },
      price_high: { price: -1 },
    };

    const sortBy = sortMap[sort] || { createdAt: -1 };

    const [notes, total] = await Promise.all([
      Note.find(query)
        .populate("seller", "name")
        .sort(sortBy)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Note.countDocuments(query),
    ]);

    return {
      notes: notes.map(serializeNote),
      total,
      page: pageNumber,
      limit: limitNumber,
    };
  } catch (error) {
    console.error("Error fetching notes:", error);
    return {
      notes: [],
      total: 0,
      page: 1,
      limit: 20,
    };
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

    return note ? serializeNote(note) : null;
  } catch (error) {
    console.error("Error fetching note:", error);
    return null;
  }
}
