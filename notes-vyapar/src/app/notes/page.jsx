// src/app/notes/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/presentation/hooks/useAuth";
import NoteCard from "@/presentation/components/notes/NoteCard";
import SkeletonCard from "@/presentation/components/notes/SkeletonCard";
import Link from "next/link";

export default function NotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authFetch, user, isAuthenticated } = useAuth();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const sort = searchParams.get("sort") || "latest";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        type,
        sort,
        category,
        page: page.toString(),
        limit: "12",
      });

      const response = await authFetch(`/api/notes/get-all?${params}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setNotes(data.notes);
        setTotal(data.total);
        setCurrentPage(data.page);
      } else {
        setNotes([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [authFetch, search, type, sort, category, page]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const updateSearchParams = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const queryString = params.toString();
    router.push(`/notes${queryString ? `?${queryString}` : ""}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateSearchParams({ search: formData.get("search"), page: "1" });
  };

  const handleFilterChange = (filterType, value) => {
    updateSearchParams({ [filterType]: value, page: "1" });
  };

  const handlePageChange = (newPage) => {
    updateSearchParams({ page: newPage.toString() });
  };

  const totalPages = Math.ceil(total / 12);
  const categories = [
    "All",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Engineering",
    "Literature",
    "History",
    "Other",
  ];

  return (
    <div className="notes-marketplace">
      <header className="notes-header">
        <div className="notes-header__container">
          <Link href="/" className="notes-brand">
            Notes Vyapar
          </Link>

          <nav className="notes-nav">
            <Link href="/notes" className="notes-nav-link notes-nav-link--active">
              Marketplace
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="notes-nav-link">
                  Dashboard
                </Link>
                <Link href="/upload" className="notes-nav-action">
                  Upload Notes
                </Link>
              </>
            ) : (
              <Link href="/login" className="notes-nav-action">
                Sign In
              </Link>
            )}
          </nav>

          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="notes-mobile-toggle"
            aria-label="Toggle categories"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <main className="notes-page-wrap">
        <aside className={`notes-sidebar ${sidebarOpen ? "notes-sidebar--open" : ""}`}>
          <div className="notes-panel notes-panel--sidebar">
            <div className="notes-panel__title">Categories</div>
            <div className="notes-categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleFilterChange("category", cat === "All" ? "" : cat)}
                  className={`notes-pill ${cat === category || (cat === "All" && !category) ? "notes-pill--active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="notes-main">
          <div className="notes-hero">
            <h1 className="notes-hero__title">Browse Notes</h1>
            <p className="notes-hero__subtitle">Find the study materials you need to succeed.</p>
          </div>

          <section className="notes-panel notes-panel--filters">
            <form onSubmit={handleSearch} className="notes-search-form">
              <label htmlFor="search" className="sr-only">
                Search notes
              </label>
              <div className="notes-search-field">
                <input
                  type="text"
                  id="search"
                  name="search"
                  defaultValue={search}
                  placeholder="Search by title or subject"
                  className="notes-input"
                />
                <span className="notes-search-icon">🔎</span>
              </div>
              <button type="submit" className="notes-button notes-button--primary">
                Search
              </button>
            </form>

            <div className="notes-filter-bar">
              <div className="notes-pill-group">
                {["", "free", "paid"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleFilterChange("type", t)}
                    className={`notes-pill ${type === t ? "notes-pill--active" : ""}`}
                  >
                    {t === "" ? "All" : t === "free" ? "Free" : "Paid"}
                  </button>
                ))}
              </div>

              <div className="notes-sort-wrap">
                <label htmlFor="sort" className="sr-only">
                  Sort notes
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="notes-select"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </section>

          {loading ? (
            <div className="notes-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="notes-empty-state">
              <div className="notes-empty-state__icon">📄</div>
              <h2 className="notes-empty-state__title">No notes found</h2>
              <p className="notes-empty-state__text">Try adjusting your search or filters.</p>
              <Link href="/notes" className="notes-button notes-button--secondary">
                Clear all filters
              </Link>
            </div>
          ) : (
            <>
              <div className="notes-grid">
                {notes.map((note) => (
                  <NoteCard key={note._id} note={note} currentUserId={user?._id} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="notes-pagination">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="notes-button notes-button--page"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        type="button"
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`notes-button notes-button--page ${pageNum === currentPage ? "notes-button--page-active" : ""}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="notes-button notes-button--page"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

