# In-memory storage (no MongoDB required)
# Dictionary to store room states: { "room_id": { "url": ..., "is_playing": ..., "timestamp": ... } }
room_states = {}

# Helper to retrieve room state
async def get_room_state(room_id: str):
    if room_id in room_states:
        return room_states[room_id]
    # Default state if new room
    new_room = {
        "room_id": room_id,
        "url": "",
        "is_playing": False,
        "started_at": None,   # server timestamp in ms
        "paused_at": None     # server timestamp in ms
    }
    room_states[room_id] = new_room
    return new_room

# Helper to update room state
async def update_room_state(room_id: str, update_data: dict):
    if room_id not in room_states:
        room_states[room_id] = {
            "room_id": room_id,
            "url": "",
            "is_playing": False,
            "started_at": None,   # server timestamp in ms
            "paused_at": None     # server timestamp in ms
        }
    # Update with new data
    room_states[room_id].update(update_data)