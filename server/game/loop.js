import { update } from './physics.js'
import { players } from './state.js'

export const startLoop = (wss) => {
    setInterval(() => {
        update(players)
        const state = { players: Object.fromEntries(players) }
        for (const client of wss.clients) {
            if (client.readyState === 1) {
                client.send(JSON.stringify(state))
            }
        }
    }, 1000 / 20) // 20 ticks per second
}