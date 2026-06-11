import { addPlayerToRoom, getFullRoom, verifyOwnerToken } from '../services/rooms.service.js'
import { getSocketServer } from '../socket.js'
import { send } from '../utils/socket.js'
import { randomUUID } from 'crypto'

export const handleJoin = (ws, data) => {
    ws.id = randomUUID()
    ws.room = data.room

    ws.token = data.token
    if (data.token) {
        const isOwner = verifyOwnerToken(ws.room, ws.id, data.token)
        if (!isOwner) send(ws, { type:'ownership_error', error: 'Incorrect room token' })
    }

    const playerJoin = addPlayerToRoom(ws.room, ws.id, data.password || null, data.color, data.username)

    switch (playerJoin) {
        case 'ok':
            send(ws, { type: 'joined', id: ws.id, room: ws.room, color: data.color, username: data.username })

            for (const client of getSocketServer().clients)
                if (client.room === ws.room) send(client, { type: 'player_info', id: ws.id, color: data.color, username: data.username })
            for (const client of getSocketServer().clients)
                if (client.id !== ws.id && client.room === ws.room) {
                    const player = getFullRoom(ws.room).players.get(client.id)
                    send(ws, { type: 'player_info', id: client.id, color: player.color, username: player.username })
                }
            const room = getFullRoom(ws.room)
            break
        case 'room_not_found':
            send(ws, { type: 'join_error', error: 'Room not found' })
            break
        case 'incorrect_password':
            send(ws, { type: 'join_error', error: 'Incorrect password' })
            break
    }
}