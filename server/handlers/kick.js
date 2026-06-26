import { getFullRoom, kickPlayerFromRoom, removePlayerFromRoom } from '../services/rooms.service.js'
import { getSocketServer } from '../socket.js'
import { send } from '../utils/socket.js'

export const handleKick = (ws, data) => {
    if (!ws.id || !ws.room) return

    if (ws.id !== data.player)
        kickPlayerFromRoom(ws.room, data.player)
}