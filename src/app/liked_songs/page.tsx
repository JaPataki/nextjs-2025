import { getDb } from "@/lib/db";
import Link from "next/link";
import { RemoveLikeButton } from "./RemoveLikeButton";
import { cookies } from "next/headers";

function formatDuration(duration: number): string {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return `${minutes}` + ":" + `${seconds}`.padStart(2, "0");
}

export default async function LikedSongsPage() {
  const db = getDb();
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth")?.value;
  
  if (!userId) {
    return (
      null
    );
  }


  

  const likedSongs = await db
    .selectFrom("user_liked_songs")
    .innerJoin("songs", "user_liked_songs.song_id", "songs.id")
    .innerJoin("albums", "songs.album_id", "albums.id")
    .innerJoin("authors", "albums.author_id", "authors.id")
    .select([
      "user_liked_songs.id",
      "songs.id as song_id",
      "songs.name",
      "songs.duration",
      "songs.album_id",
      "albums.name as album_name",
      "albums.author_id",
      "authors.name as author_name",
    ])
    .where("user_liked_songs.user_id", "=", (parseInt(userId)))
    .execute();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <p className="text-2xl font-bold">Liked Songs</p>
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Album</th>
                <th>Author</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {likedSongs.map((song, i) => (
                <tr key={song.id}>
                  <td>{i + 1}</td>
                  <td>{song.name}</td>
                  <td>
                    <Link href={`/album/${song.album_id}`}>
                      {song.album_name}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/author/${song.author_id}`}>
                      {song.author_name}
                    </Link>
                  </td>
                  <td>{formatDuration(song.duration)}</td>
                  <td>
                    <RemoveLikeButton songId={song.song_id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
