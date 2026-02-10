import { getDb } from "@/lib/db";
import { PlaybackBar } from "./PlaybackBar";

export async function PlaybackBarWrapper() {
  const db = getDb();

  
  const songs = await db
    .selectFrom("songs")
    .innerJoin("albums", "albums.id", "songs.album_id")
    .innerJoin("authors", "authors.id", "albums.author_id")
    .select([
      "songs.id",
      "songs.name",
      "authors.name as artist",
      "songs.duration",
    ])
    .limit(10)
    .execute();

 
  const playlists = await db
    .selectFrom("playlists")
    .selectAll()
    .where("user_id", "=", 1)
    .execute();

  
  const likedSongs = await db
    .selectFrom("user_liked_songs")
    .select("song_id")
    .where("user_id", "=", 1)
    .execute();

  const likedSongIds = likedSongs.map(ls => ls.song_id);

  return (
    <PlaybackBar
      initialSongs={songs}
      initialPlaylists={playlists}
      initialLikedSongIds={likedSongIds}
    />
  );
}