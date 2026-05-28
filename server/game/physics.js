import { players } from './state.js'

const SPEED = 5

export const applyInput = (id, x, y) => {
    const player = players.get(id)
    if (!player) return
    player.vx = x * SPEED
    player.vy = y * SPEED
}

export const update = (players) => {
    for (const player of players.values()) {
        player.x += player.vx
        player.y += player.vy
    }
}