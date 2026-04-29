"use client";

import { useState, useEffect } from "react";
import styles from "../../../app/(dashboard)/dashboard/notes/notes-dashboard.module.css";

export default function NoteForm({ initialData = null, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    price: "0",
    category: "General",
    tags: "",
    isPremium: false,
    language: "English",
    university: "",
  });
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        subject: initialData.subject || "",
        description: initialData.description || "",
        price: initialData.price?.toString() || "0",
        category: initialData.category || "General",
        tags: initialData.tags?.join(", ") || "",
        isPremium: initialData.isPremium || false,
        language: initialData.language || "English",
        university: initialData.university || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (Number(formData.price) < 0) {
      setError("Price cannot be negative");
      return;
    }

    if (!initialData && !file) {
      setError("PDF file is required");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      
      if (file) data.append("file", file);
      if (thumbnail) data.append("thumbnail", thumbnail);

      const url = initialData ? `/api/notes/${initialData._id}` : "/api/notes";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: initialData ? JSON.stringify(formData) : data,
        headers: initialData ? { "Content-Type": "application/json" } : {}
      });

      const result = await res.json();

      if (res.ok) {
        setFormData({
          title: "", subject: "", description: "", price: "0", category: "General", 
          tags: "", isPremium: false, language: "English", university: ""
        });
        setFile(null);
        setThumbnail(null);
        if (onSuccess) onSuccess(result.note);
      } else {
        setError(result.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.title} style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
        {initialData ? "Edit Note" : "Upload New Note"}
      </h2>

      {error && <div style={{ color: 'red', marginBottom: '1rem', background: '#fee2e2', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}

      <div className={styles.formGroup}>
        <label>Title *</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required className={styles.formInput} />
      </div>

      <div className={styles.formGroup}>
        <label>Subject *</label>
        <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className={styles.formInput} />
      </div>

      <div className={styles.formGroup}>
        <label>Description *</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className={styles.formInput} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className={styles.formGroup}>
          <label>Price (0 for free) *</label>
          <input type="number" name="price" min="0" value={formData.price} onChange={handleChange} required className={styles.formInput} />
        </div>
        <div className={styles.formGroup}>
          <label>Category</label>
          <input type="text" name="category" value={formData.category} onChange={handleChange} className={styles.formInput} />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Tags (comma separated)</label>
        <input type="text" name="tags" value={formData.tags} onChange={handleChange} className={styles.formInput} placeholder="math, algebra, notes" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className={styles.formGroup}>
          <label>Language</label>
          <select name="language" value={formData.language} onChange={handleChange} className={styles.formInput}>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>University / Exam Board</label>
          <input type="text" name="university" value={formData.university} onChange={handleChange} className={styles.formInput} />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>
          <input type="checkbox" name="isPremium" checked={formData.isPremium} onChange={handleChange} style={{ marginRight: '0.5rem' }} />
          Is Premium Material
        </label>
      </div>

      {!initialData && (
        <>
          <div className={styles.formGroup}>
            <label>PDF File *</label>
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} required className={styles.formInput} />
          </div>
          <div className={styles.formGroup}>
            <label>Thumbnail Image (Optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} className={styles.formInput} />
          </div>
        </>
      )}

      <button type="submit" disabled={loading} className={styles.btnPrimary}>
        {loading ? <span className={styles.spinner}></span> : (initialData ? "Update Note" : "Add Note")}
      </button>

      {initialData && (
        <button type="button" onClick={onCancel} className={styles.btnSecondary} disabled={loading}>
          Cancel Edit
        </button>
      )}
    </form>
  );
}
