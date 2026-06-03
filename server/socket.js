import { WebSocketServer } from 'ws'
import { send, parse } from './utils/socket.js'
import { handleInput } from './handlers/input.js'
import { handleJoin } from './handlers/join.js'
import { randomUUID } from 'crypto'
import { startLoop } from './game/loop.js'
import { bodies, players, round } from './game/state.js'
import { addPlayer, buildArena, removePlayer } from './game/world.js'
import { checkRound, startRound } from './game/round.js'

let wss
let lobbyTimeout = null
export const initSocket = (server) => {
    wss = new WebSocketServer({ server })
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

        if (round.status === 'LOBBY' && players.size === 2)
            lobbyTimeout = setTimeout(() => { startRound() }, 5000)

        if (empty) startLoop()
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

            if (players.size >= 1 && lobbyTimeout) {
                clearTimeout(lobbyTimeout)
                lobbyTimeout = null

                return
            }
            checkRound()
        })
    })

    wss.on('close', () => {
    })
}

export const getSocketServer = () => {
    if (!wss) throw new Error('wss not initialized')
    return wss
}