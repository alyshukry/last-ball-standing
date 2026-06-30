import { kickPlayerFromRoom } from '../services/rooms.service.js'
import { AppError } from '../utils/errors.js'

export const handleKick = (ws, data) => {
    if (!ws.id || !ws.room) throw new AppError('User ID and or room ID not attached', 'missing_id', true)

    if (ws.id !== data.player)
        kickPlayerFromRoom(ws.room, data.player, ws.id)
}