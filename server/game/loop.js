import { update } from './world.js'
import { send } from '../utils/socket.js'
import { killOutOfBounds } from './round.js'
import { getSocketServer } from '../socket.js'

export const startLoop = (room) => {
    let tick = 0
    const payload = {
        type: 'state',
        players: {}
    }

    room.intervals.game = setInterval(() => {
        try {
            update(room)
            tick++

            for (const [id, player] of room.players) {
                if (!player.dead) {
                    killOutOfBounds(room, id)

                    payload.players[id] = {
                        x: Math.round(player.ball.position.x),
                        y: Math.round(player.ball.position.y)
                    }
                }
            }
        }
        catch (err) { console.error('Game loop error: ' + err) }
    }, 1000 / 60)

    room.intervals.broadcast = setInterval(() => {
        try {
            // cleanup disconnected and dead players
            for (const id in payload.players)
                if (!room.players.has(id) || room.players.get(id).dead) delete payload.players[id]

            for (const client of getSocketServer().clients) {
                if (client.readyState === 1 && client.room === room.id && room.round.status !== 'LOBBY')
                    send(client, payload)
            }
        }
        catch (err) { console.error('Broadcast loop error: ' + err) }
    }, 1000 / 60)
}