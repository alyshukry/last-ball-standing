import { WebSocketServer } from 'ws'
import { send, parse } from './utils/socket.js'
import { handleInput } from './handlers/input.js'
import { handleJoin } from './handlers/join.js'
import { randomUUID } from 'crypto'
import { startLoop } from './game/loop.js'
import { bodies } from './game/state.js'
import { addPlayer, buildArena, removePlayer } from './game/engine.js'

export const initSocket = (server) => {
    const wss = new WebSocketServer({ server })
    buildArena()

    let empty = true
    wss.on('connection', (ws) => {
        ws.id = randomUUID()
        ws.color = ['red', 'orange', 'yellow'][Math.floor(Math.random() * 3)]
        addPlayer(
            ws.id,
            Math.floor(Math.random() * 1000),
            300,
            ws.color,
            'guest'
        )

        for (const client of wss.clients)
            send(client, { type: 'player_info', id: ws.id, color: ws.color })
        for (const client of wss.clients)
            if (client.id !== ws.id) send(ws, { type: 'player_info', id: client.id, color: client.color })
        send(ws, { type: 'arena', bodies: bodies })

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
            removePlayer(ws.id)
        })
    })

    wss.on('close', () => {
    })

    return wss
}