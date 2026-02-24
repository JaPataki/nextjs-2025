import { DB } from "@/lib/db-types";
import { faker } from "@faker-js/faker";
import type { Kysely } from "kysely";

export async function seed(db: Kysely<DB>): Promise<void> {
  const tables = [
    "user_liked_songs",
    "playlists_songs",
    "playlists",
    "songs",
    "albums",
    "authors",
    "users",
  ];

  for (const t of tables) {
    try {
      // attempt to clear table; ignore failures caused by foreign-key state
      // (some DBs may have slightly different schema / FK ordering)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db as any).deleteFrom(t).execute();
    } catch (err) {
      // swallow and continue
      console.warn(`seed: could not clear table ${t}:`, String(err));
    }
  }

  for (let i = 0; i < 20; i += 1) {
    const numBioParagraphs = faker.number.int({ min: 0, max: 5 });

    const bio =
      numBioParagraphs !== 0 ? faker.lorem.paragraph(numBioParagraphs) : null;

    await db
      .insertInto("authors")
      .values({
        name: faker.music.artist(),
        bio,
      })
      .execute();
  }

  const authors = await db.selectFrom("authors").selectAll().execute();

  for (const author of authors) {
    const numAlbums = faker.number.int({ min: 0, max: 10 });

    for (let i = 0; i < numAlbums; i += 1) {
      await db
        .insertInto("albums")
        .values({
          author_id: author.id,
          name: faker.music.album(),
          release_date: faker.date.past().getTime(),
        })
        .execute();
    }
  }

  const albums = await db.selectFrom("albums").selectAll().execute();

  for (const album of albums) {
    const typeOfAlbum = faker.number.int({ min: 0, max: 9 });

    let numSongs = 1;

    if (typeOfAlbum < 2) {
      numSongs = 1;
    } else if (typeOfAlbum < 5) {
      numSongs = faker.number.int({ min: 4, max: 6 });
    } else {
      numSongs = faker.number.int({ min: 10, max: 20 });
    }

    console.log(album.name, numSongs);

    for (let i = 0; i < numSongs; i += 1) {
      await db
        .insertInto("songs")
        .values({
          album_id: album.id,
          name: faker.music.songName(),
          duration: faker.number.int({ min: 90, max: 240 }),
        })
        .execute();
    }
  }

  await db
    .insertInto("users")
    .values({
      id: 1,
      email: "test@test.com",
      password: "test123",
      name: "Test User",
    })
    .execute();

  for (let i = 0; i < 10; i += 1) {
    await db
      .insertInto("users")
      .values({
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.person.fullName(),
      })
      .execute();
  }

  const users = await db.selectFrom("users").selectAll().execute();

  for (const user of users) {
    const numPlaylists = faker.number.int({
      min: user.id === 1 ? 2 : 0,
      max: 10,
    });

    for (let i = 0; i < numPlaylists; i += 1) {
      await db
        .insertInto("playlists")
        .values({
          name: faker.lorem.words({ min: 1, max: 3 }),
          user_id: user.id,
        })
        .execute();
    }
  }

  const playlists = await db.selectFrom("playlists").selectAll().execute();
  const songs = await db.selectFrom("songs").select("id").execute();
  const songIds = songs.map((song) => song.id);

  for (const playlist of playlists) {
    const numSongs = faker.number.int({ min: 1, max: 20 });

    const randomSongIds = faker.helpers.arrayElements(songIds, {
      min: 0,
      max: Math.min(numSongs, songIds.length),
    });

    for (const songId of randomSongIds) {
      await db
        .insertInto("playlists_songs")
        .values({
          playlist_id: playlist.id,
          song_id: songId,
        })
        .execute();
    }
  }

 
  for (const user of users) {
    const numLikedSongs = faker.number.int({ min: 0, max: 20 });
    const randomSongIds = faker.helpers.arrayElements(songIds, {
      min: 0,
      max: Math.min(numLikedSongs, songIds.length),
    });

    for (const songId of randomSongIds) {
      await db
        .insertInto("user_liked_songs")
        .values({
          user_id: user.id,
          song_id: songId,
        })
        .execute();
    }
  }
}
