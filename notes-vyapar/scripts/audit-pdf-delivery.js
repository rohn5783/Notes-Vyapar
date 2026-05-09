require("dotenv/config");
const mongoose = require("mongoose");

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("MONGO_URI or MONGODB_URI is required.");
  process.exit(1);
}

const noteSchema = new mongoose.Schema(
  {
    title: String,
    fileUrl: String,
  },
  { strict: false }
);

const Note = mongoose.models.Note || mongoose.model("Note", noteSchema, "notes");

function auditUrl(fileUrl) {
  try {
    const url = new URL(fileUrl || "");
    let status = "ok";

    if (!fileUrl) {
      status = "missing";
    } else if (url.protocol !== "https:") {
      status = "non_https";
    } else if (url.hostname.includes("localhost") || url.hostname === "127.0.0.1") {
      status = "localhost";
    } else if (!/\.pdf$/i.test(decodeURIComponent(url.pathname))) {
      status = "not_pdf_url";
    } else if (!url.hostname.includes("cloudinary.com")) {
      status = "not_cloudinary";
    }

    return {
      status,
      host: url.hostname,
      path: url.pathname,
    };
  } catch {
    return {
      status: "malformed",
      host: "",
      path: "",
    };
  }
}

async function checkDelivery(note) {
  const response = await fetch(note.fileUrl, {
    method: "GET",
    headers: {
      Range: "bytes=0-15",
    },
  });
  const body = Buffer.from(await response.arrayBuffer()).toString("utf8");

  return {
    id: String(note._id),
    title: note.title,
    status: response.status,
    contentType: response.headers.get("content-type"),
    contentDisposition: response.headers.get("content-disposition"),
    cloudinaryError: response.headers.get("x-cld-error"),
    startsWithPdf: body.startsWith("%PDF-"),
    bodySample: body.slice(0, 80),
  };
}

async function main() {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });

  const notes = await Note.find({}).select("title fileUrl").lean();
  const audited = notes.map((note) => ({
    id: String(note._id),
    title: note.title,
    ...auditUrl(note.fileUrl),
  }));
  const invalid = audited.filter((note) => note.status !== "ok");
  const firstValid = notes.find((note) => auditUrl(note.fileUrl).status === "ok");
  const delivery = firstValid ? await checkDelivery(firstValid) : null;

  console.log(JSON.stringify({
    total: audited.length,
    invalid: invalid.length,
    invalidSamples: invalid.slice(0, 10),
    validSamples: audited.filter((note) => note.status === "ok").slice(0, 5),
    delivery,
  }, null, 2));

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(`${error.name}: ${error.message}`);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
