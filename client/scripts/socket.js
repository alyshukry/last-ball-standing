import { emit, on } from './events.js'
import { showView, API_URL } from './main.js'

export let ws

export const connectToRoom = (room, token = null, password = null, color, username) => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
    ws = new WebSocket(wsProtocol + '//' + API_URL)
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
        const data = JSON.parse(e.data)
        emit(data.type, data)
    }
}

on('join_error', () => { ws.close() })