import { send } from '../utils/socket.js'
import { getSocketServer } from '../socket.js'
import { BALL_RADIUS, WORLD_HEIGHT } from './constants.js'
import { killPlayer, revivePlayer } from './world.js'

export const killOutOfBounds = (room, id) => {
    if (room.round.status !== 'PLAYING') return

    const player = room.players.get(id)
    if (!player) return

    if (player.ball.position.y > WORLD_HEIGHT + BALL_RADIUS * 2) {
        killPlayer(room, id)
        checkRound(room)
    }
}

export const checkRound = (room) => {
    const playerCount = Array.from(room.players.values()).filter(p => !p.dead).length
    if (playerCount <= 1) endRound(room)
}

export const endRound = (room) => {
    const winner = Array.from(room.players.values()).find(p => !p.dead)

    room.round.number++
    room.round.status = 'RESULT'
    room.round.winner = winner ? winner.id : null

    if (winner) {
        room.round.wins.set(winner.id, (room.round.wins.get(winner.id) || 0) + 1)
    }

    for (const client of getSocketServer().clients)
        if (client.room === room.id)
            send(client, {
                type: 'round_end',
                winner: winner ? winner.id : null,
                wins: Object.fromEntries(room.round.wins)
            })

    setTimeout(() => startRound(room), 5000)
}

export const startRound = (room) => {
    if (room.players.size >= 2) {
        for (const [id, player] of room.players)
            revivePlayer(room, id)
        room.round.status = 'PLAYING'
    }
    else {
        for (const [id, player] of room.players)
            killPlayer(room, id)
        room.round.status = 'LOBBY'
    }
}