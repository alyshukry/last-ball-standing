import { addPlayer } from '../game/world.js'
import { addPlayerToRoom, getRoom, verifyOwnerToken } from '../services/rooms.service.js'
import { getSocketServer } from '../socket.js'
import { send } from '../utils/socket.js'
import { randomUUID } from 'crypto'

export const handleJoin = (ws, data) => {
    ws.id = randomUUID()
    ws.room = data.room

    ws.token = data.token
    if (data.token) {
        const isOwner = verifyOwnerToken(ws.room, data.token)
        if (!isOwner) send(ws, { error: 'incorrect room token' })
    }

    if (addPlayerToRoom(ws.room, ws.id, data.password || null, data.color, data.username)) {
        for (const client of getSocketServer().clients)
            if (client.room === ws.room) send(client, { type: 'player_info', id: ws.id, color: data.color, username: data.username })
        for (const client of getSocketServer().clients)
            if (client.id !== ws.id && client.room === ws.room) send(ws, { type: 'player_info', id: client.id, color: data.color, username: data.username  })
        send(ws, { type: 'arena', bodies: getRoom(ws.room).arenas[0] })
    }
    else {
        send(ws, { error: 'couldn\'t join room' })
    }
}