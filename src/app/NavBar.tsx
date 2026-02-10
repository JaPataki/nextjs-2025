"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState } from "react";

export function NavBar() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");

  console.log("NavBar render searchInput:", searchInput);

  const searchLinkQuery = searchInput !== "" ? { q: searchInput } : {};

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          Spotify
        </Link>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search"
          className="input input-bordered w-24 md:w-auto"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
          }}
          onKeyUp={(e) => {
            console.log("key pressed:", e.key);
            if (e.key === 'Enter') {
              
              router.push(`/search?q=${searchInput}`)
            }
          }}
        />
        <Link
          href={{
            pathname: "/search",
            query: searchLinkQuery,
          }}
          className="btn btn-ghost text-xl"
        >
          Search
        </Link>
        <Link href="/playlists" className="btn btn-ghost text-xl">
          Playlists
        </Link>
        <Link href="/liked_songs" className="btn btn-ghost text-xl">
          Liked Songs
        </Link>
        <Link href="/history" className="btn btn-ghost text-xl">
          History
        </Link>
      </div>
    </div>
  );
}
