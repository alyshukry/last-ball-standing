import { on } from './events.js'

export const state = {
    prevState: {},
    currentState: {},
    playersInfo: {},
    lastUpdate: Date.now(),
    arena: [],
    myId: null,
    worldDimensions: { width: 1000, height: 500 }
}

on('state', (data) => {
    state.prevState = state.currentState
    state.currentState = data
    state.lastUpdate = Date.now()
})
on('player_info', (data) => { state.playersInfo[data.id] = { id: data.id, color: data.color, eyes: data.eyes, mouth: data.mouth, username: data.username } })
on('player_left', (data) => { delete state.playersInfo[data.id] })
on('arena', (data) => { state.arena = data.bodies })
on('joined', (data) => {
    state.myId = data.id
    state.worldDimensions = data.world_dimensions
})

on('ownership_update', (data) => { console.log(data + '\n' + data.owner === state.myId ? 'yes' : 'no' + '\n' + data.owner + ' ' + state.myId) })