import { useState, useEffect, useCallback } from "react";
import mockResponse from "../mock/mock_response.json";

interface SpotifyTrack {
  isPlaying: boolean;
  type: string;
  song?: string;
  artist?: string;
  href?: string;
}

export default function CurrentlyPlaying() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.PUBLIC_API_URL;
  const API_KEY = import.meta.env.PUBLIC_API_KEY;

  const fetchNowPlaying = useCallback(async () => {
    if (!API_URL || !API_KEY) {
      console.error("Missing API_URL or API_KEY environment variables");
      setTrack(mockResponse);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        headers: { "x-api-key": API_KEY },
      });

      const data = await response.json();
      setTrack(data.type === "track" ? data : null);
      setError(null);
    } catch {
      setError("Could not load track");
    } finally {
      setLoading(false);
    }
  }, [API_URL, API_KEY]);

  useEffect(() => {
    fetchNowPlaying();

    const interval = setInterval(fetchNowPlaying, 30000);
    return () => clearInterval(interval);
  }, [fetchNowPlaying]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 justify-center site-text">
        <div className="animate-spin h-4 w-4 border-2 highlight-text border-t-transparent rounded-full"></div>
        <span>Getting currently playing...</span>
      </div>
    );
  }

  if (error || !track) return null;

  return (
    <>
      <p className="text-center site-text">
        {track.isPlaying ? "Currently listening to: " : "Last listened to: "}
        <a
          target="_blank"
          href={track.href}
          className="inline-block highlight-text"
        >
          {track.song} - {track.artist}
        </a>
      </p>
    </>
  );
}
