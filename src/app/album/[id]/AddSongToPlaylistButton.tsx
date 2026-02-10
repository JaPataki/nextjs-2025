"use client";

import { addSongToPlaylist } from "@/actions/playlists";
import { useRef } from "react";

export function AddSongToPlaylistButton(props: {
  playlists: { id: number; name: string }[];
  songId: number;
}) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  return (
    <details className="dropdown dropdown-top" name="add-song-to-playlist" ref={detailsRef}>
      <summary className="btn btn-xs m-1">Add</summary>

      <ul className="menu dropdown-content bg-base-100 rounded-box z-50 w-52 p-2 shadow-sm">
        <div className="p-1">Pick your playlist</div>
        {props.playlists.map((playlist) => (
          <li key={playlist.id}>
            <button
              className="btn btn-xs"
              onClick={() => {
                addSongToPlaylist(playlist.id, props.songId);
                detailsRef.current?.toggleAttribute("open");
              }}
            >
              {playlist.name}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
