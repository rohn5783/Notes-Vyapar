import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const mongoUri = process.env.MONGODB_URI;

if (!cloudName || !apiKey || !apiSecret) {
  console.error("Cloudinary environment variables are not configured.");
  process.exit(1);
}

if (!mongoUri) {
  console.error("MONGODB_URI environment variable is not configured.");
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Simple inline Note schema for this script
const noteSchema = new mongoose.Schema({
  fileUrl: String,
  thumbnailUrl: String,
  title: String,
});

const Note = mongoose.model("Note", noteSchema);

async function updateFileAccessModes() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to database");

    // Get all notes with file URLs
    const notes = await Note.find({ fileUrl: { $exists: true, $ne: null } }).select("fileUrl title thumbnailUrl").lean();
    console.log(`Found ${notes.length} notes with files`);

    for (const note of notes) {
      try {
        // Update PDF access mode if it exists
        if (note.fileUrl) {
          const urlMatch = note.fileUrl.match(/\/upload\/v\d+\/(.+)$/);
          if (urlMatch) {
            const publicId = urlMatch[1];
            console.log(`Updating PDF access mode for: ${publicId}`);

            await new Promise((resolve, reject) => {
              cloudinary.api.update_resources_access_mode_by_ids(
                "public",
                [publicId],
                { resource_type: "raw" },
                (error, result) => {
                  if (error) {
                    console.error(`Failed to update ${publicId}:`, error.message);
                  } else {
                    console.log(`Successfully updated ${publicId}`);
                  }
                  resolve();
                }
              );
            });
          }
        }

        // Update thumbnail access mode if it exists
        if (note.thumbnailUrl) {
          const thumbMatch = note.thumbnailUrl.match(/\/upload\/v\d+\/(.+)$/);
          if (thumbMatch) {
            const publicId = thumbMatch[1];
            console.log(`Updating thumbnail access mode for: ${publicId}`);

            await new Promise((resolve, reject) => {
              cloudinary.api.update(publicId, {
                resource_type: "image",
                access_mode: "public"
              }, (error, result) => {
                if (error) {
                  console.error(`Failed to update ${publicId}:`, error.message);
                } else {
                  console.log(`Successfully updated ${publicId}`);
                }
                resolve();
              });
            });
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`Error processing note ${note._id}:`, error.message);
      }
    }

    console.log("Finished updating file access modes");
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error("Script error:", error);
    process.exit(1);
  }
}

updateFileAccessModes();