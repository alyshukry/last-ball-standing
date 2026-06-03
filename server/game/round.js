import { send } from '../utils/socket.js'
import { getSocketServer } from '../socket.js'
import { BALL_RADIUS, WORLD_HEIGHT } from './constants.js'
import { players, round } from './state.js'
import { killPlayer, revivePlayer } from './world.js'

export const killOutOfBounds = (id) => {
    if (round.status !== 'PLAYING') return

    const player = players.get(id)
    if (!player) return

    if (player.ball.position.y > WORLD_HEIGHT + BALL_RADIUS * 2) {
        killPlayer(id)
        checkRound()
    }
}

export const checkRound = () => {
    const playerCount = Array.from(players.values()).filter(p => !p.dead).length
    if (playerCount <= 1) endRound()
}

export const endRound = () => {
    const winner = Array.from(players.values()).find(p => !p.dead)

    round.number++
    round.status = 'RESULT'
    round.winner = winner ? winner.id : null

    if (winner) {
        round.wins.set(winner.id, (round.wins.get(winner.id) || 0) + 1)
    }

    for (const client of getSocketServer().clients)
        send(client, {
            type: 'round_end',
            winner: winner ? winner.id : null,
            wins: round.wins
        })

    setTimeout(() => startRound(), 5000)
}

export const startRound = () => {
    if (players.size >= 2) {
        for (const [id, player] of players)
            revivePlayer(id)
        round.status = 'PLAYING'
    }
    else {
        for (const [id, player] of players)
            killPlayer(id)
        round.status = 'LOBBY'
    }
}