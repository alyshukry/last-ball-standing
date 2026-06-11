import { on } from './events.js'

export const state = {
    prevState: {},
    currentState: {},
    playersInfo: {},
    lastUpdate: Date.now(),
    arena: []
}

on('state', (data) => {
    state.prevState = state.currentState
    state.currentState = data
    state.lastUpdate = Date.now()
})

on('player_info', (data) => { state.playersInfo[data.id] = { id: data.id, color: data.color, username: data.username } })

on('arena', (data) => { state.arena = data.bodies })