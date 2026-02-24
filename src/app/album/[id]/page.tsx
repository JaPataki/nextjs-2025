import { getDb } from "@/lib/db";
import Link from "next/link";
import { AddSongToPlaylistButton } from "./AddSongToPlaylistButton";
import { LikeSongButton } from "@/components/LikeSongButton";


function formatDuration(duration: number): string {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  

  return `${minutes}` + ":" + `${seconds}`.padStart(2, "0");
}

export default async function AlbumDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const db = getDb();


  const { id } = await params;

  console.log("Album detail id:", id);

  const albumId = parseInt(id);

  if (isNaN(albumId)) {
    return <div>Invalid Album id</div>;
  }

  const album = await db
    .selectFrom("albums")
    .innerJoin("authors", "authors.id", "albums.author_id")
    .select([
      "albums.name",
      "albums.release_date",
      "authors.name as author_name",
      "authors.id as author_id",
    ])
    .where("albums.id", "=", albumId)
    .executeTakeFirst();

  
  if (album === null || album === undefined) {
    
    return <div>Album not found</div>;
  }

  const songs = await db
    .selectFrom("songs")
    .selectAll()
    .where("album_id", "=", albumId)
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

  const likedSongIds = new Set(likedSongs.map((ls) => ls.song_id));

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div>
          {album.name} by{" "}
          <Link href={`/author/${album.author_id}`}>{album.author_name}</Link>
        </div>
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song, i) => (
                <tr key={song.id}>
                  <td>{i + 1}</td>
                  <td>{song.name}</td>
                  <td>{formatDuration(song.duration)}</td>
                  <td>
                    <LikeSongButton
                      songId={song.id}
                      isLiked={likedSongIds.has(song.id)}
                    />
                    <AddSongToPlaylistButton
                      playlists={playlists}
                      songId={song.id}
                    />
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
