# 🎵 Sync-Song - Watch YouTube Together

A real-time synchronized YouTube video player where multiple users can watch videos together in the same room. When one person plays, pauses, or changes the video, everyone in the room sees the same action instantly!

## ✨ Features

- 🎥 **Synchronized Playback** - Play/pause syncs across all users in real-time
- 🔗 **Easy Room Sharing** - Share room codes to watch together
- 🔍 **YouTube Search** - Search for videos or paste direct URLs
- 🌐 **WebSocket Connection** - Real-time communication using FastAPI WebSockets
- 🎨 **Modern UI** - Beautiful gradient design with smooth animations
- 📱 **Responsive** - Works on different screen sizes

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **WebSockets** - Real-time bidirectional communication
- **YouTube Search Python** - Search YouTube videos
- **Uvicorn** - ASGI server

### Frontend
- **React** - UI library
- **Vite** - Fast build tool
- **React Router** - Navigation
- **React Use WebSocket** - WebSocket hooks
- **YouTube IFrame API** - Video player integration

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
python -m uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🚀 Usage

1. **Start Both Servers**
   - Backend: `python -m uvicorn main:app --reload` (in backend folder)
   - Frontend: `npm run dev` (in frontend folder)

2. **Create or Join a Room**
   - Open `http://localhost:5173` in your browser
   - Enter a room code and click "Join Room"
   - Share the room code with friends!

3. **Watch Together**
   - Paste a YouTube URL or search for a video
   - Click on a search result to load the video
   - Use the play/pause buttons - they sync to everyone in the room!

## 📁 Project Structure

```
Sync-Song/
├── backend/
│   ├── main.py              # FastAPI app with WebSocket endpoints
│   ├── database.py          # In-memory room state storage
│   ├── connection_manager.py # WebSocket connection management
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Lobby.jsx    # Home page for joining rooms
│   │   │   ├── Room.jsx     # Main room with video player
│   │   │   └── Room.css     # Room styling
│   │   ├── config.js        # API and WebSocket URLs
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # React entry point
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
│
└── README.md                # This file
```

## 🔧 Configuration

### Backend Configuration
The backend runs on port 8000 by default. To change:
```bash
uvicorn main:app --reload --port YOUR_PORT
```

### Frontend Configuration
Update `frontend/src/config.js` if you change backend URLs:
```javascript
export const API_URL = "http://localhost:8000";
export const WS_URL = "ws://localhost:8000/ws";
```

## 🎮 How It Works

1. **Room Creation**: Users join a room by entering a room code
2. **WebSocket Connection**: Each user connects to the room via WebSocket
3. **State Synchronization**: Room state (current video, play/pause status) is stored on the server
4. **Real-time Updates**: When a user performs an action:
   - Action is sent to the backend via WebSocket
   - Backend updates the room state
   - Backend broadcasts the update to all connected users
   - All users' players update simultaneously

## 🐛 Troubleshooting

### Backend Issues
- **uvicorn command not found**: Run `python -m uvicorn main:app --reload` instead
- **Port already in use**: Change the port using `--port` flag
- **Module not found**: Ensure you've installed requirements: `pip install -r requirements.txt`

### Frontend Issues
- **npm command not found**: Install Node.js from https://nodejs.org/
- **Port already in use**: Vite will automatically try the next available port
- **Connection refused**: Make sure the backend server is running

### Video Player Issues
- **Video not loading**: Ensure the URL is a valid YouTube link
- **Sync not working**: Check that both users are in the same room
- **Console errors about ERR_BLOCKED_BY_CLIENT**: These are from ad blockers blocking YouTube analytics - they don't affect playback

## 🌟 Features in Detail

### URL Cleaning
The app automatically:
- Converts `youtu.be` URLs to standard YouTube format
- Removes tracking parameters (`si`, `feature`, etc.)
- Validates URLs before loading

### Search Functionality
- Search YouTube directly from the app
- Results show title, channel, duration, and thumbnail
- Click any result to load and play instantly

### Synchronized Controls
- ▶️ Play - Syncs to all users
- ⏸️ Pause - Syncs to all users
- 🔄 Video Change - Loads for everyone
- 🎯 Seek - Updates timestamps (coming soon)

## 📝 API Endpoints

### REST API
- `GET /` - Health check
- `GET /search?q={query}` - Search YouTube videos

### WebSocket
- `WS /ws/{room_id}` - Connect to a room
  - Receives: `SYNC_STATE`, `PLAY`, `PAUSE`, `CHANGE_URL`, `SEEK`
  - Sends: Same message types for actions

## 🤝 Contributing

Feel free to fork this project and submit pull requests! Some ideas for improvements:
- Add user authentication
- Persistent room history
- Chat functionality
- Playlist support
- Better seek synchronization
- Video quality selection

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- FastAPI for the awesome backend framework
- React team for the frontend library
- YouTube IFrame API for video embedding
- All contributors and testers

---

**Enjoy watching together! 🎉**

For issues or questions, please open an issue on the repository.
