import { update } from './engine.js'
import { players } from './state.js'
import { send } from '../utils/socket.js'

let tick = 0

export const startLoop = (wss) => {
    const payload = {
        type: 'state',
        players: {}
    }

    setInterval(() => {
        update()
        tick++

        for (const [id, player] of players) {
            payload.players[id] = {
                x: Math.round(player.ball.position.x),
                y: Math.round(player.ball.position.y)
            }
        }
    }, 1000 / 60)

    setInterval(() => {
        // cleanup disconnected players
        for (const id in payload.players)
            if (!players.has(id)) delete payload.players[id]

        for (const client of wss.clients) {
            if (client.readyState === 1) {
                send(client, payload)
            }
        }
    }, 1000 / 30)
}