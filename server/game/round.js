import { send, broadcastToRoom } from '../utils/socket.js'
import { getSocketServer } from '../socket.js'
import { BALL_RADIUS, WORLD_HEIGHT } from './constants.js'
import { buildArena, killPlayer, revivePlayer } from './world.js'

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

    for (const [id] of room.players) {
        if (!room.round.wins.has(id)) {
            room.round.wins.set(id, 0)
        }
    }

    if (winner) {
        room.round.wins.set(winner.id, (room.round.wins.get(winner.id) || 0) + 1)
    }

    broadcastToRoom(room.id, {
        type: 'round_end',
        winner: winner ? winner.id : null,
        wins: Object.fromEntries(room.round.wins)
    })

    room.timeouts.start = setTimeout(() => startRound(room), 5000)
}

export const startRound = (room) => {
    if (room.players.size >= 2) {
        let playerIndex = 0
        for (const [id, player] of room.players) {
            revivePlayer(room, id, playerIndex)
            playerIndex++
        }
        buildArena(room, room.round.number % room.arenas.length)
        room.round.status = 'PLAYING'

        broadcastToRoom(room.id, {
            type: 'round_start'
        })
    }
    else returnToLobby(room)
}

export const returnToLobby = (room) => {
    for (const [id, player] of room.players)
        killPlayer(room, id)
    room.round.status = 'LOBBY'

    clearTimeout(room.timeouts.start)
    
    broadcastToRoom(room.id, {
        type: 'back_to_lobby'
    })
}