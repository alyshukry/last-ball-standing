import { emit, on } from './events.js'
import { showView, API_URL } from './main.js'

export let ws

export const connectToRoom = (room, token = null, password = null, color, eyes, mouth, username) => {
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
            eyes,
            mouth,
            username
        }))
    }
}

const setUpWs = (ws) => {
    ws.onclose = (e) => console.log('bye', e ? e : '')
    ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        emit(data.type, data)
    }
}

on('error', (e) => { console.log(e) })