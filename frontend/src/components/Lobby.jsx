import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Ensure styling is applied

const Lobby = () => {
    const [roomCode, setRoomCode] = useState('');
    const navigate = useNavigate();

    const createRoom = () => {
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        navigate(`/room/${newCode}`);
    };

    const joinRoom = (e) => {
        e.preventDefault();
        if (roomCode.trim()) {
            navigate(`/room/${roomCode.toUpperCase()}`);
        }
    };

    return (
        <div className="landing-container">
            {/* Animated Background Blobs */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>

            <div className="content-wrapper">

                {/* Left Side: Hero Text */}
                <div className="hero-text">
                    <div className="equalizer">
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                    </div>

                    <h1 className="hero-title">
                        Listen <br />
                        Together.
                    </h1>
                    <p className="hero-subtitle">
                        Experience music and video in perfect synchronization with friends,
                        no matter where they are. Create a room, share the code, and vibe.
                    </p>
                </div>

                {/* Right Side: Interactive Card */}
                <div className="join-card">
                    <div className="card-header">Start the Party</div>

                    <button onClick={createRoom} className="cta-button btn-gradient">
                        ⚡ Create New Room
                    </button>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <form onSubmit={joinRoom}>
                        <input
                            type="text"
                            className="input-code"
                            placeholder="ENTER CODE"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            maxLength={6}
                        />
                        <button type="submit" className="cta-button btn-outline">
                            Join Existing
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Lobby;