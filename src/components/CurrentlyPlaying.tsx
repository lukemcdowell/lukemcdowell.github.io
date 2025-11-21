import { useState, useEffect } from 'react';

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

    console.log("PUBLIC_API_URL:", import.meta.env.PUBLIC_API_URL);
    console.log("PUBLIC_API_KEY:", import.meta.env.PUBLIC_API_KEY);

    useEffect(() => {
        fetchNowPlaying()

        const interval = setInterval(fetchNowPlaying, 30000);
        return () => clearInterval(interval);
    }, []);

    async function fetchNowPlaying() {
        if (!API_URL || !API_KEY) {
            console.error('Missing API_URL or API_KEY environment variables');
            setError('Missing API configuration');
            setLoading(false);
            return;
        }

        console.info('Fetching currently playing track...');
        try {
            const response = await fetch(API_URL, {
                headers: {
                    'x-api-key': API_KEY
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch');
            }

            const data = await response.json();

            setTrack(data);
            setError(null);

            if (data && data.type !== "track") {
                console.info(`Not showing non-track type: ${data.type}`);
            }
        } catch (err) {
            setError('Could not load track');
            console.error('Error fetching now playing:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2 justify-center">
                <div className="animate-spin h-4 w-4 border-2 border-lime-600 border-t-transparent rounded-full"></div>
                <span>Getting currently playing...</span>
            </div>
        );
    }

    if (error) {
        return null;
    }

    if (track && track.type === "track") {
        return (
            <p className="text-center">
                {(track.isPlaying) ? 'Currently listening to: ' : 'Last listened to: '}
                <a
                    target="_blank"
                    href={track.href}
                    className="inline-block"
                >

                    {track?.song} by {track?.artist}
                </a>
            </p>
        );
    }
}
