import { addPlayer } from '../game/world.js'
import { addPlayerToRoom, verifyOwnerToken } from '../services/rooms.service.js'

export const handleJoin = (ws, data) => {
    ws.id = data.id
    ws.room = data.room

    ws.token = data.token
    if (data.token) {
        const isOwner = verifyOwnerToken(ws.room, data.token)
        if (!isOwner) send(ws, { error: 'incorrect room token' })
        return
    }

    if (addPlayerToRoom(ws.room, ws.id, data.password || null, data.color, data.username)) {
        for (const client of wss.clients)
            if (client.room === ws.room) send(client, { type: 'player_info', id: ws.id, color: ws.color })
        for (const client of wss.clients)
            if (client.id !== ws.id && client.room === ws.room) send(ws, { type: 'player_info', id: client.id, color: client.color })
        send(ws, { type: 'arena', bodies: bodies })
    }
    else {
        send(ws, { error: 'couldn\'t join room' })
    }
}