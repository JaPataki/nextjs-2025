"use server";

import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function recordPlayback(event_name: string, song_id: number, user_id = 1) {
  const db = getDb();
  await db
    .insertInto("playback_events")
    .values({ event_name, event_date: Date.now(), user_id, song_id })
    .execute();
  try {
    revalidatePath("/history");
  } catch {
    
  }
}

export async function getPlaybackEvents() {
  const db = getDb();
  const events = await db
    .selectFrom("playback_events")
    .leftJoin("songs", "songs.id", "playback_events.song_id")
    .select([
      "playback_events.id",
      "playback_events.event_name",
      "playback_events.event_date",
      "playback_events.song_id",
      "songs.name as song_name",
    ])
    .orderBy("playback_events.event_date", "desc")
    .execute();
  return events;
}
