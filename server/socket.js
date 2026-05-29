import { WebSocketServer } from 'ws'
import { send, parse } from './utils/socket.js'
import { handleInput } from './handlers/input.js'
import { handleJoin } from './handlers/join.js'
import { randomUUID } from 'crypto'
import { startLoop } from './game/loop.js'
import { players } from './game/state.js'

export const initSocket = (server) => {
    const wss = new WebSocketServer({ server })

    let empty = true
    wss.on('connection', (ws) => {
        ws.id = randomUUID()
        ws.color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
        console.log('user connected with id ' + ws.id)
        players.set(ws.id, { x: 400, y: 300, vx: 0, vy: 0 })

        for (const client of wss.clients) {
            send(client, { type: 'player_info', id: ws.id, color: ws.color })
        }

        for (const client of wss.clients) {
            if (client.id !== ws.id)
                send(ws, { type: 'player_info', id: client.id, color: client.color })
        }

        if (empty) startLoop(wss)
        empty = false

        ws.on('message', (data) => {
            const parsed = parse(data)

            switch (parsed.type) {
                // case 'join': handleJoin(ws, parsed); break
                case 'input': handleInput(ws, parsed); break
            }
        })

        ws.on('close', () => {
            console.log(ws.id + ' disconnected')
            players.delete(ws.id)
        })
    })

    wss.on('close', () => {
        console.log('wss closed')
    })

    return wss
}