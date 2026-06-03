import { update } from './world.js'
import { players, round } from './state.js'
import { send } from '../utils/socket.js'
import { BALL_RADIUS, WORLD_HEIGHT } from './constants.js'
import { killOutOfBounds, startRound } from './round.js'
import { getSocketServer } from '../socket.js'

let tick = 0

export const startLoop = () => {
    const payload = {
        type: 'state',
        players: {}
    }

    setInterval(() => {
        update()
        tick++

        for (const [id, player] of players) {
            if (!player.dead) {
                killOutOfBounds(id)

                payload.players[id] = {
                    x: Math.round(player.ball.position.x),
                    y: Math.round(player.ball.position.y)
                }
            }
        }
    }, 1000 / 60)

    setInterval(() => {
        // cleanup disconnected and dead players
        for (const id in payload.players)
            if (!players.has(id) || players.get(id).dead) delete payload.players[id]

        for (const client of getSocketServer().clients) {
            if (client.readyState === 1) {
                send(client, payload)
            }
        }
    }, 1000 / 30)
}