"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", e.target.title.value);
    formData.append("subject", e.target.subject.value);
    formData.append("price", e.target.price.value);

    const res = await fetch("/api/notes/upload", {
      method: "POST",
      body: formData,
    });

    await res.json();
    alert("Uploaded");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" placeholder="Title" required />
      <input type="text" name="subject" placeholder="Subject" required />
      <input type="number" name="price" placeholder="Price" required />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        required
      />
      <button type="submit">Upload</button>
    </form>
  );
}
