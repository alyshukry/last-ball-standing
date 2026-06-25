import { getFullRoom, removePlayerFromRoom } from '../services/rooms.service.js'
import { getSocketServer } from '../socket.js'
import { send } from '../utils/socket.js'

export const handleKick = (ws, data) => {
    if (!ws.id || !ws.room) return

    if (ws.id === getFullRoom(ws.room).owner)
        for (const client of getSocketServer().clients)
            if (client.id === data.player && client.id !== ws.id) {
                send(client, {
                    type: 'kicked',
                    by: ws.id
                })
                removePlayerFromRoom(ws.room, client.id)
                client.close(4001, 'kicked')
            }
}