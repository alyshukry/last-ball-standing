import { WORLD_HEIGHT, WORLD_WIDTH } from '../game/constants.js'
import { addPlayerToRoom, getFullRoom, verifyOwnerToken } from '../services/rooms.service.js'
import { getSocketServer } from '../socket.js'
import { AppError } from '../utils/errors.js'
import { send } from '../utils/socket.js'
import { randomUUID } from 'crypto'

export const handleJoin = (ws, data) => {
    ws.id = randomUUID()
    ws.room = data.room

    ws.token = data.token
    if (data.token) {
        const isOwner = verifyOwnerToken(ws.room, ws.id, data.token)
        if (!isOwner) send(ws, { type: 'ownership_error', error: 'Incorrect room token' })
    }

    const playerJoin = addPlayerToRoom(ws.room, ws.id, data.password || null, data.color, data.eyes, data.mouth, data.username)

    if (playerJoin === 'ok') {
        send(ws, { type: 'joined', id: ws.id, room: ws.room, color: data.color, eyes: data.eyes, mouth: data.mouth, username: data.username, world_dimensions: { width: WORLD_WIDTH, height: WORLD_HEIGHT } })
        send(ws, { type: 'ownership_update', is_owner: ws.id === getFullRoom(ws.room).owner })

        for (const client of getSocketServer().clients)
            if (client.room === ws.room) send(client, { type: 'player_info', id: ws.id, color: data.color, eyes: data.eyes, mouth: data.mouth, username: data.username })
        for (const client of getSocketServer().clients)
            if (client.id !== ws.id && client.room === ws.room) {
                const player = getFullRoom(ws.room).players.get(client.id)
                send(ws, { type: 'player_info', id: client.id, color: player.color, eyes: player.eyes, mouth: player.mouth, username: player.username })
            }
    }
}