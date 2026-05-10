import connectDB from "@/infrastructure/database/mongodb";
import Note from "@/domain/entities/Note";
import Payment from "@/domain/entities/Payment";
import { createRazorpayOrder, verifyRazorpaySignature } from "@/infrastructure/payment/razorpay";

export async function createOrder(userId, noteId) {
  await connectDB();

  const note = await Note.findById(noteId).lean();
  if (!note) {
    throw new Error("Note not found");
  }

  if (Number(note.price) <= 0) {
    throw new Error("Payment is not required for free notes");
  }

  const alreadyPaid = await Payment.findOne({
    userId,
    noteId,
    status: "paid",
  });

  if (alreadyPaid) {
    return { alreadyPurchased: true };
  }

  const amountInPaisa = Math.round(Number(note.price) * 100);
  const receipt = `notes-vyapar-${noteId}-${userId}-${Date.now()}`.substring(0, 40);

  const razorpayOrder = await createRazorpayOrder({
    amount: amountInPaisa,
    receipt,
    notes: {
      noteId: noteId.toString(),
      userId: userId.toString(),
    },
  });

  await Payment.create({
    userId,
    noteId,
    orderId: razorpayOrder.id,
    amount: amountInPaisa,
    currency: "INR",
    status: "created",
    receipt,
  });

  return {
    order: razorpayOrder,
    note,
  };
}

export async function verifyPayment(userId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  await connectDB();

  const isValid = verifyRazorpaySignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  if (!isValid) {
    throw new Error("Invalid payment signature");
  }

  const payment = await Payment.findOneAndUpdate(
    {
      orderId: razorpay_order_id,
      userId,
      status: "created",
    },
    {
      status: "paid",
      razorpay_payment_id,
    },
    { new: true }
  );

  if (!payment) {
    throw new Error("Payment record not found or already processed");
  }

  return payment;
}

export async function getPaymentStatus(userId, noteId) {
  await connectDB();

  const note = await Note.findById(noteId).lean();
  if (!note) {
    throw new Error("Note not found");
  }

  const isOwner = note.seller?.toString() === userId;
  const isFree = Number(note.price) === 0;
  const hasPurchased = isFree || isOwner || Boolean(
    await Payment.exists({
      userId,
      noteId,
      status: "paid",
    })
  );

  return {
    notePrice: Number(note.price),
    hasPurchased,
    isFree,
    isOwner,
  };
}
