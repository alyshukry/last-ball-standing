import { getFullRoom, kickPlayerFromRoom, removePlayerFromRoom } from '../services/rooms.service.js'
import { getSocketServer } from '../socket.js'
import { send } from '../utils/socket.js'

export const handleKick = (ws, data) => {
    if (!ws.id || !ws.room) throw new AppError('User ID and or room ID not attached', 'missing_id', true)

    if (ws.id !== data.player)
        kickPlayerFromRoom(ws.room, ws.id, data.player)
}