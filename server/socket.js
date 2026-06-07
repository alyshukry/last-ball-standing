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
export const initSocket = (server) => {
    wss = new WebSocketServer({ server })
    buildArena()

    wss.on('connection', (ws) => {

        ws.on('message', (data) => {
            const parsed = parse(data)

            switch (parsed.type) {
                case 'join_room': handleJoin(ws, parsed); break
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