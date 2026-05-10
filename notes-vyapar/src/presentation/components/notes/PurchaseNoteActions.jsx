"use client";

import { useEffect, useMemo, useState } from "react";
import useAuth from "@/presentation/hooks/useAuth";

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not available."));
      return;
    }

    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      resolve(window.Razorpay);
    };
    script.onerror = () => {
      reject(new Error("Failed to load Razorpay checkout script."));
    };
    document.body.appendChild(script);
  });
}

const PUBLIC_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

export default function PurchaseNoteActions({ note }) {
  const { authFetch, isAuthenticated, user, status } = useAuth();
  const [hasPurchased, setHasPurchased] = useState(Number(note.price) === 0);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  const isOwner = useMemo(() => {
    if (!user) return false;
    const sellerId = note.sellerId || note.seller?._id || note.seller?.id || note.seller;
    return Boolean(sellerId && String(user.id) === String(sellerId));
  }, [note.seller, note.sellerId, user?.id]);

  useEffect(() => {
    const loadStatus = async () => {
      if (Number(note.price) === 0 || isOwner || !isAuthenticated) {
        return;
      }

      setLoadingStatus(true);
      try {
        const response = await authFetch(`/api/payment/status?noteId=${encodeURIComponent(note._id)}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setHasPurchased(Boolean(data.hasPurchased));
        }
      } catch (error) {
        console.error("Could not load payment status:", error);
      } finally {
        setLoadingStatus(false);
      }
    };

    loadStatus();
  }, [authFetch, isAuthenticated, note._id, note.price, isOwner]);

  const canDownload = Number(note.price) === 0 || isOwner || hasPurchased;

  const loadRazorpay = async () => {
    if (!PUBLIC_KEY) {
      throw new Error("Razorpay public key is not configured.");
    }

    const Razorpay = await loadRazorpayScript();
    return Razorpay;
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      setMessage({ type: "error", text: "Please log in to complete the purchase." });
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      const response = await authFetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ noteId: note._id }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to create payment order.");
      }

      if (data.alreadyPurchased) {
        setHasPurchased(true);
        setMessage({ type: "success", text: "You already own this note." });
        setProcessing(false);
        return;
      }

      const Razorpay = await loadRazorpay();
      const order = data.order;

      const razorpayOptions = {
        key: PUBLIC_KEY,
        amount: order.amount,
        currency: order.currency,
        name: "Notes Vyapar",
        description: note.title,
        order_id: order.id,
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await authFetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(verifyData.message || "Payment verification failed.");
            }

            setHasPurchased(true);
            setMessage({ type: "success", text: "Payment confirmed. Your note is now available to download." });
          } catch (verificationError) {
            console.error("Payment verification error:", verificationError);
            setMessage({ type: "error", text: verificationError.message || "Payment verification failed." });
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#2563eb",
        },
      };

      const checkout = new Razorpay(razorpayOptions);
      checkout.on("payment.failed", (failure) => {
        console.error("Razorpay payment failed:", failure.error);
        setMessage({ type: "error", text: failure.error.description || "Payment failed. Please try again." });
      });

      checkout.open();
    } catch (error) {
      console.error("Purchase error:", error);
      setMessage({ type: "error", text: error.message || "Unable to start purchase." });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="notePurchaseCard">
      {message && (
        <div className={`uploadFeedback ${message.type === "error" ? "uploadFeedbackError" : "uploadFeedbackSuccess"}`}>
          {message.text}
        </div>
      )}

      {loadingStatus ? (
        <p>Checking purchase status…</p>
      ) : canDownload ? (
        <a
          href={`/api/pdf/download/${encodeURIComponent(note._id)}`}
          className="notesButton notesButton--success notesButton--full"
        >
          Download Notes
        </a>
      ) : isAuthenticated ? (
        <button
          type="button"
          onClick={handlePurchase}
          disabled={processing}
          className="notesButton notesButton--primary notesButton--full"
        >
          {processing ? "Processing…" : `Buy Now for ₹${note.price}`}
        </button>
      ) : (
        <a href="/login" className="notesButton notesButton--primary notesButton--full">
          Sign in to Purchase
        </a>
      )}

      {!canDownload && note.price > 0 && (
        <p className="notePurchaseHint">
          After payment is complete, your download link will be enabled immediately.
        </p>
      )}
    </div>
  );
}
