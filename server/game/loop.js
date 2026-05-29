import { update } from './physics.js'
import { players } from './state.js'
import { send } from '../utils/socket.js'

export const startLoop = (wss) => {
    setInterval(() => {
        update(players)
        const state = { type: 'state', players: Object.fromEntries(players) }
        for (const client of wss.clients) {
            if (client.readyState === 1) {
                send(client, state)
            }
        }
    }, 1000 / 20) // 20 ticks per second
}