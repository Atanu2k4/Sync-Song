import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// REVERTED TO STANDARD IMPORT
import ReactPlayer from "react-player";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { WS_URL } from '../config';
import './Room.css';

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);


const Room = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const playerRef = useRef(null);
    const isUserSeeking = useRef(false);

    // --- STATE ---
    const [url, setUrl] = useState('https://www.youtube.com/watch?v=yQdVnvqI37M');
    const [playing, setPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        setIsReady(false);
    }, [url]);
    
    // --- WEBSOCKET CONNECTION ---
    const { sendMessage, lastJsonMessage, readyState } = useWebSocket(`${WS_URL}/${roomId}`, {
        onOpen: () => {
            console.log('✅ Connected to WebSocket');
        },
        shouldReconnect: (closeEvent) => true,
    });

    // --- SYNC LOGIC ---
    useEffect(() => {
        if (lastJsonMessage !== null) {
            const { type, payload } = lastJsonMessage;
            console.log("📩 Received:", type, payload);

            switch (type) {
                case 'SYNC_STATE': // Initial load
                    if (payload.url) setUrl(payload.url);
                    setPlaying(payload.is_playing);
                    // Slight delay to allow player to load before seeking
                    if (payload.timestamp > 0) {
                        setTimeout(() => {
                            if (playerRef.current) playerRef.current.seekTo(payload.timestamp);
                        }, 1000);
                    }
                    break;
                case 'PLAY': setPlaying(true); break;
                case 'PAUSE': setPlaying(false); break;
                case 'CHANGE_URL':
                    if (payload.url) {
                        setUrl(payload.url);
                        setPlaying(true);
                        setSearchResults([]);
                        setSearchQuery('');
                    }
                    break;
                case 'SEEK':
                    if (playerRef.current && Math.abs(playerRef.current.getCurrentTime() - payload.time) > 1) {
                        playerRef.current.seekTo(payload.time);
                    }
                    break;
                default: break;
            }
        }
    }, [lastJsonMessage]);

    // --- ACTIONS ---

    const handlePlay = () => {
        if (!playing) {
            setPlaying(true);
            sendMessage(JSON.stringify({ type: 'PLAY' }));
        }
    };

    const handlePause = () => {
        if (playing) {
            setPlaying(false);
            sendMessage(JSON.stringify({ type: 'PAUSE' }));
        }
    };

    const handleSeek = (seconds) => {
        if (!isUserSeeking.current) return;

        sendMessage(JSON.stringify({
            type: 'SEEK',
            payload: { time: seconds }
        }));

        isUserSeeking.current = false;
    };

    // --- SEARCH & SELECTION LOGIC ---

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchQuery.startsWith('http')) {
            selectVideo(searchQuery);
            return;
        }

        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(`http://localhost:8000/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Search failed", error);
        }
        setIsSearching(false);
    };

    const selectVideo = (videoUrl) => {
        console.log("👆 Loading video:", videoUrl);

        // 1. Update LOCAL state immediately
        setUrl(videoUrl);
        setPlaying(false);
        setSearchResults([]);
        setSearchQuery('');

        // 2. Send message to server
        sendMessage(JSON.stringify({
            type: 'CHANGE_URL',
            payload: { url: videoUrl }
        }));
    };

    // --- RENDER ---

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Connected',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Disconnected',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    if (readyState !== ReadyState.OPEN && !isReady) {
        return <div className="title">Connecting to Room...</div>;
    }

    return (
        <div className="room-container">

            {/* Header */}
            <div className="room-header">
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, marginBottom: '5px' }}>🎵 Room: <span className="badge">{roomId}</span></h2>
                    <span style={{ fontSize: '0.8rem', color: readyState === ReadyState.OPEN ? '#00D9FF' : '#ef4444', fontWeight: '500' }}>
                        ● {connectionStatus}
                    </span>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ padding: '10px 20px', background: 'rgba(255,59,59,0.15)', border: '1px solid rgba(255,59,59,0.3)', color: '#ff6b6b', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease' }}>
                    Leave Room
                </button>
            </div>

            {/* Video Player */}
            <div
                className="player-wrapper"
                onMouseDown={() => (isUserSeeking.current = true)}
            >
                <ReactPlayer
                    key={url} 
                    ref={playerRef}
                    url={url}
                    width="100%"
                    height="100%"
                    playing={playing}
                    controls
                    onReady={() => {
                        console.log("🎬 Player ready");
                        setIsReady(true);
                        setPlaying(true);
                    }}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onProgress={({ playedSeconds }) => {
                        if (isUserSeeking.current) {
                            handleSeek(playedSeconds);
                        }
                    }}
                    config={{
                        youtube: {
                            playerVars: {
                                autoplay: 1,
                                modestbranding: 1,
                                rel: 0
                            }
                        }
                    }}
                />
            </div>

            {/* Search Bar */}
            <div className="search-container">
                <form onSubmit={handleSearch} className="input-group" style={{ marginTop: 0 }}>
                    <div className="search-input-wrapper">
                        <input
                            className="search-input"
                            type="text"
                            placeholder="Search song OR paste URL..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#666', pointerEvents: 'none' }}>
                            <SearchIcon />
                        </div>
                    </div>
                    <button type="submit" className="btn-search" disabled={isSearching}>
                        {isSearching ? '⏳ Searching...' : 'Go'}
                    </button>
                </form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                        <h3 style={{ fontSize: '0.9rem', color: '#00D9FF', marginBottom: '5px', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            ✨ Select to play:
                        </h3>
                        {searchResults.map((video, index) => (
                            <div
                                key={index}
                                onClick={(e) => {
                                    e.preventDefault();
                                    selectVideo(video.url);
                                }}
                                style={{
                                    display: 'flex',
                                    gap: '15px',
                                    padding: '12px',
                                    background: 'rgba(79,70,229,0.08)',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    alignItems: 'center',
                                    textAlign: 'left',
                                    border: '1px solid rgba(0,217,255,0.15)'
                                }}
                                onMouseOver={(e) => { 
                                    e.currentTarget.style.background = 'rgba(79,70,229,0.15)'; 
                                    e.currentTarget.style.borderColor = 'rgba(0,217,255,0.35)';
                                    e.currentTarget.style.transform = 'translateX(5px)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 217, 255, 0.25)';
                                }}
                                onMouseOut={(e) => { 
                                    e.currentTarget.style.background = 'rgba(79,70,229,0.08)'; 
                                    e.currentTarget.style.borderColor = 'rgba(0,217,255,0.15)';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <img
                                    src={video.thumbnail}
                                    alt="thumb"
                                    style={{ width: '100px', borderRadius: '4px', aspectRatio: '16/9', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', transition: 'all 0.3s ease', cursor: 'pointer' }}
                                    onMouseOver={(e) => { e.style.transform = 'scale(1.05)'; e.style.boxShadow = '0 6px 16px rgba(0, 217, 255, 0.3)'; }}
                                    onMouseOut={(e) => { e.style.transform = 'scale(1)'; e.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'; }}
                                />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                                        {video.title}
                                    </h4>
                                    <p style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                        {video.channel} • {video.duration}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <p className="subtitle" style={{ marginTop: '30px', fontSize: '0.95rem', background: 'linear-gradient(135deg, #4F46E5, #00D9FF)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '600' }}>
                {playing ? '▶️ Now Playing' : '⏸️ Paused'} • Synced via WebSocket
            </p>
        </div>
    );
};

export default Room;