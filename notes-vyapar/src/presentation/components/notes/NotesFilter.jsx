// src/presentation/components/notes/NotesFilter.jsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCallback } from "react";

export default function NotesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const sort = searchParams.get("sort") || "latest";

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search");
    router.push(`/notes?${createQueryString("search", searchValue)}`);
  };

  const handleSortChange = (e) => {
    router.push(`/notes?${createQueryString("sort", e.target.value)}`);
  };

  return (
    <div className="bg-white dark:bg-[#1a2333] p-4 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 justify-between items-center border border-gray-100 dark:border-gray-800">
      <form onSubmit={handleSearch} className="w-full md:w-1/3 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by title or subject..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg leading-5 bg-gray-50 dark:bg-[#0c1324] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
        />
      </form>

      <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex gap-1 bg-gray-100 dark:bg-[#0c1324] p-1 rounded-lg border border-gray-200 dark:border-gray-700 w-full sm:w-auto justify-center">
          <Link 
            href={`/notes?${createQueryString("type", "")}`}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex-1 text-center ${!type ? 'bg-white dark:bg-[#1a2333] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            All
          </Link>
          <Link 
            href={`/notes?${createQueryString("type", "free")}`}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex-1 text-center ${type === 'free' ? 'bg-white dark:bg-[#1a2333] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Free
          </Link>
          <Link 
            href={`/notes?${createQueryString("type", "paid")}`}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex-1 text-center ${type === 'paid' ? 'bg-white dark:bg-[#1a2333] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Paid
          </Link>
        </div>

        <div className="relative inline-block text-left w-full sm:w-48">
          <select 
            value={sort}
            onChange={handleSortChange}
            className="block w-full pl-3 pr-10 py-2.5 sm:py-2 text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white dark:bg-[#0c1324] text-gray-900 dark:text-white appearance-none cursor-pointer"
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
