import { showView, API_URL } from './main.js'

export const state = {
    prevState: {},
    currentState: {},
    playersInfo: {},
    lastUpdate: Date.now(),
    arena: []
}

export let ws

export const connectToRoom = (room, token = null, password = null, color, username) => {
    ws = new WebSocket('ws://' + API_URL)
    setUpWs(ws)

    ws.onopen = () => {
        console.log('hi')
        ws.send(JSON.stringify({
            type: 'join_room',
            room,
            token,
            password,
            color,
            username
        }))
    }
}

const setUpWs = (ws) => {
    ws.onclose = () => console.log('bye')
    ws.onmessage = (e) => {
        const parsed = JSON.parse(e.data)
        console.log(parsed.type)

        switch (parsed.type) {
            case 'state':
                state.prevState = state.currentState
                state.currentState = parsed
                state.lastUpdate = Date.now()
                break
            case 'player_info':
                state.playersInfo[parsed.id] = { color: parsed.color }
                break
            case 'arena':
                state.arena = parsed.bodies
                break
            case 'round_end':
                console.log(parsed.winner + ' wins')
                break
            case 'join_error':
                console.log(parsed.error)
                ws.close()
                break
            case 'joined':
                showView('game')
                break
            case 'round_start':
                break
            case 'back_to_lobby':
                break
        }
    }
}