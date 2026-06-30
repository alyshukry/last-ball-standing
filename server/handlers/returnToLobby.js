import { returnRoomToLobby } from '../services/rooms.service.js'
import { AppError } from '../utils/errors.js'

export const handleReturnToLobby = (ws) => {
    if (!ws.id || !ws.room) throw new AppError('User ID and or room ID not attached', 'missing_id', true)

    returnRoomToLobby(ws.room, ws.id)
}