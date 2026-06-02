import { balls, update } from './engine.js'
import { players } from './state.js'
import { send } from '../utils/socket.js'

let tick = 0
export const startLoop = (wss) => {
    const state = { type: 'state', players: Object.fromEntries(players) }

    setInterval(() => {
        update()
        tick++

        for (const [id, ball] of balls) {
            state.players[id] = { x: ball.position.x, y: ball.position.y }
        }
    }, 1000 / 60) // 60 ticks per second

    setInterval(() => {
        state.players = state.players
        for (const client of wss.clients) {
            if (client.readyState === 1) {
                send(client, state)
            }
        }
    }, 1000 / 30)
}