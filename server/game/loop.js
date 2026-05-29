import { bodies, update } from './physics.js'
import { players } from './state.js'
import { send } from '../utils/socket.js'

let tick = 0
export const startLoop = (wss) => {
    const state = { type: 'state', players: Object.fromEntries(players) }
    
    setInterval(() => {
        update()
        tick++

        for (const [id, body] of bodies) {
            state.players[id] = { x: body.position.x, y: body.position.y }
        }
    }, 1000 / 60) // 60 ticks per second

    setInterval(() => {
        for (const client of wss.clients) {
            if (client.readyState === 1) {
                send(client, state)
            }
        }
    }, 1000 / 20)
}