"use server";

import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function likeSong(songId: number) {
  const db = getDb();
  const userId = (await cookies()).get("auth")?.value;
  
  if (!userId) {
    return;
  } 
  
  await db
    .insertInto("user_liked_songs")
    .values({ user_id: parseInt(userId), song_id: songId })
    .onConflict((oc) => oc.columns(["user_id", "song_id"]).doNothing())
    .execute();
  revalidatePath("/");
}

export async function unlikeSong(songId: number) {
  const db = getDb();
  await db
    .deleteFrom("user_liked_songs")
    .where("user_id", "=", 1)
    .where("song_id", "=", songId)
    .execute();
  revalidatePath("/");
}
