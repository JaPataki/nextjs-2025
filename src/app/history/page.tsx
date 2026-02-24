import { getDb } from "@/lib/db";
import { cookies } from "next/headers";


type EventItem = {
  id: number;
  event_name: string;
  event_date: number;
  song_id: number;
  song_name?: string | null;
};

export default async function HistoryPage() {
  const db = getDb();
  const userId = (await cookies()).get("auth")?.value;
  
  if (!userId) {
    return (
      null
    );
  }

  const events = (await db
    .selectFrom("playback_events")
    .innerJoin("songs", "songs.id", "playback_events.song_id")
    .select([
      "playback_events.id",
      "playback_events.event_name",
      "playback_events.event_date",
      "playback_events.song_id",
      "songs.name as song_name",
    ])
    .where("playback_events.user_id", "=", (parseInt(userId)))
    .orderBy("playback_events.event_date", "desc")
    .execute()) as EventItem[];

  return (
    <div className="p-6">
     
      <h1 className="text-2xl font-semibold mb-4">Playback History</h1>
      <div className="space-y-2">
        {events.map((e) => (
          <div key={String(e.id)} className="p-3 border rounded">
            <div className="text-sm font-medium">{e.event_name}</div>
            <div className="text-xs text-gray-500">
              {new Date(Number(e.event_date)).toLocaleString()} — {e.song_name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
