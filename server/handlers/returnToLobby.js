import { returnRoomToLobby } from '../services/rooms.service.js'

export const handleReturnToLobby = (ws) => {
    if (!ws.id || !ws.room) return

    returnRoomToLobby(ws.room, ws.id)
}