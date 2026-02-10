"use client";

import { useState, useEffect, useCallback } from "react";
import { recordPlayback } from "@/actions/playback";
import { LikeSongButton } from "@/components/LikeSongButton";
import { AddSongToPlaylistButton } from "@/app/album/[id]/AddSongToPlaylistButton";

interface Song {
  id: number;
  name: string;
  artist: string;
  duration: number;
}

interface Playlist {
  id: number;
  name: string;
}

interface PlaybackBarProps {
  initialSongs: Song[];
  initialPlaylists: Playlist[];
  initialLikedSongIds: number[];
}

function formatDuration(duration: number): string {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PlaybackBar({ initialSongs, initialPlaylists, initialLikedSongIds }: PlaybackBarProps) {
  const [queue, setQueue] = useState<Song[]>(initialSongs);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [originalQueue] = useState<Song[]>(initialSongs);

  const [playbackStart, setPlaybackStart] = useState<{
    timestamp: number;
    progressAtStart: number;
  } | null>(null);

  
  const [playlists] = useState<Playlist[]>(initialPlaylists);
  const [likedSongs, setLikedSongs] = useState<Set<number>>(new Set(initialLikedSongIds));

  const currentSong = queue[currentIndex];

  function startPlayback() {
    setPlaybackStart({
      timestamp: Date.now(),
      progressAtStart: progress,
    });
    setIsPlaying(true);
    if (currentSong) {
      void recordPlayback("playback_start", currentSong.id, 1);
    }
  }

  function pausePlayback() {
    setIsPlaying(false);
    setPlaybackStart(null);
  }

  function seekTo(newProgress: number) {
    setProgress(newProgress);
    if (isPlaying) {
      setPlaybackStart({
        timestamp: Date.now(),
        progressAtStart: newProgress,
      });
    }
  }

  function togglePlayback() {
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  }

  
  function playPrevious() {
    setProgress(0);
    if (currentSong) {
      void recordPlayback("playback_start", currentSong.id, 1);
    }
    
    setIsPlaying(true);
    setPlaybackStart({
      timestamp: Date.now(),
      progressAtStart: 0,
    });
  }
  

  const playNext = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextSong = queue[nextIndex];
      setCurrentIndex(nextIndex);
      setProgress(0);
      if (isPlaying) {
        setPlaybackStart({
          timestamp: Date.now(),
          progressAtStart: 0,
        });
        if (nextSong) {
          void recordPlayback("playback_start", nextSong.id, 1);
        }
      }
    } else {
      setIsPlaying(false);
      setPlaybackStart(null);
    }
  }, [currentIndex, isPlaying, queue]);


  function handleUserNext() {
    const prevSong = currentSong;
    const hasNext = currentIndex < queue.length - 1;

    if (prevSong) {
      setPlaybackStart({ timestamp: Date.now(), progressAtStart: 0 });
      void recordPlayback("playback_skip", prevSong.id, 1);
    }

    if (hasNext) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setProgress(0);

      if (isPlaying) {
        setPlaybackStart({ timestamp: Date.now(), progressAtStart: 0 });
        const nextSong = queue[nextIndex];
        if (nextSong) {
          void recordPlayback("playback_start", nextSong.id, 1);
        }
      }
    } else {
      setIsPlaying(false);
      setPlaybackStart(null);
    }
  }

  function toggleShuffle() {
    if (isShuffled) {
      
      setQueue(originalQueue);
      setCurrentIndex(0);
      setIsShuffled(false);
    } else {
      
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      setCurrentIndex(0);
      setIsShuffled(true);
    }
    setProgress(0);
    if (isPlaying) {
      setPlaybackStart({
        timestamp: Date.now(),
        progressAtStart: 0,
      });
    }
  }

  useEffect(() => {
    if (!isPlaying || currentSong == null || playbackStart == null) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - playbackStart.timestamp) / 1000;
      const newProgress = playbackStart.progressAtStart + elapsed;

      if (newProgress >= currentSong.duration) {
       
        void recordPlayback("playback_end", currentSong.id, 1);
        playNext();
      } else {
        setProgress(newProgress);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, currentSong, playbackStart, playNext]);

  const duration = currentSong?.duration || 0;
  const remaining = duration - progress;

  return (
    <div className="flex items-center justify-between h-full pl-16 pr-4">
      <div className="flex items-center gap-3 w-64 min-w-64">
        {currentSong ? (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">
              {currentSong.name}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {currentSong.artist}
            </span>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No song playing</div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1 flex-1 max-w-xl">
        <div className="flex items-center gap-2">
          <button className="btn btn-circle btn-sm btn-ghost" onClick={playPrevious}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
            </svg>
          </button>

          <button
            className="btn btn-circle btn-primary"
            onClick={togglePlayback}
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <button className="btn btn-circle btn-sm btn-ghost" onClick={handleUserNext}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
            </svg>
          </button>

          <button 
            className={`btn btn-circle btn-sm btn-ghost ${isShuffled ? 'btn-active' : ''}`} 
            onClick={toggleShuffle}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v3.75c0 .315-.21.585-.495.705l-7.5 3c-.24.09-.51-.015-.66-.21a.75.75 0 0 1 .165-1.05l7.5-3V4.125c0-.207.168-.375.375-.375h1.5c.207 0 .375.168.375.375v9.75c0 .087-.015.172-.045.255L9.42 18.21a.75.75 0 0 1-1.035-.165.75.75 0 0 1 .165-1.05l8.955-7.5c.315-.21.585-.495.705-.825v-3.75c0-1.035.84-1.875 1.875-1.875h1.5c.207 0 .375.168.375.375v1.5c0 .207-.168.375-.375.375h-1.5c-.207 0-.375-.168-.375-.375V4.125c0-.621-.504-1.125-1.125-1.125h-1.5zM7.5 9.75c0-.207.168-.375.375-.375h1.5c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-1.5c-.207 0-.375-.168-.375-.375v-9.75z"/>
            </svg>
          </button>

          {currentSong && (
            <AddSongToPlaylistButton
              playlists={playlists}
              songId={currentSong.id}
            />
          )}
        </div>

        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-gray-500 w-10 text-right">
            {formatDuration(progress)}
          </span>
          <input
            type="range"
            min={0}
            max={duration}
            value={progress}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="range range-xs flex-1 cursor-pointer"
          />
          <span className="text-xs text-gray-500 w-10">
            -{formatDuration(remaining)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 w-64 min-w-64 justify-end">
        {currentSong && (
          <LikeSongButton
            songId={currentSong.id}
            isLiked={likedSongs.has(currentSong.id)}
            onToggle={(songId, newLiked) => {
              setLikedSongs(prev => {
                const newSet = new Set(prev);
                if (newLiked) {
                  newSet.add(songId);
                } else {
                  newSet.delete(songId);
                }
                return newSet;
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
