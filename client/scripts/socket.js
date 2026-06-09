const params = new URLSearchParams(window.location.search)
const roomId = params.get('roomId')
const token = params.get('token')
const password = params.get('password')

export const ws = new WebSocket('ws://192.168.1.44:8000')

export const state = {
    prevState: {},
    currentState: {},
    playersInfo: {},
    lastUpdate: Date.now(),
    arena: []
}

ws.onopen = () => {
    ws.send(JSON.stringify({
        type: 'join_room',
        room: roomId,
        token: token || null,
        password: password || null,
        color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
        username: 'yoyo'
    }))
}

ws.onclose = () => console.log('bye')
ws.onmessage = (e) => {
    const parsed = JSON.parse(e.data)

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
    }
}