"use client";

import { likeSong, unlikeSong } from "@/actions/liked_songs";

export function LikeSongButton({
  songId,
  isLiked,
  onToggle,
}: {
  songId: number;
  isLiked: boolean;
  onToggle?: (songId: number, newLiked: boolean) => void;
}) {
  const handleClick = async () => {
    const newLiked = !isLiked;
    if (newLiked) {
      await likeSong(songId);
    } else {
      await unlikeSong(songId);
    }
    onToggle?.(songId, newLiked);
  };

  return (
    <button
      className="btn btn-xs btn-ghost w-8"
      onClick={handleClick}
    >
      {isLiked ? "♥" : "♡"}
    </button>
  );
}
