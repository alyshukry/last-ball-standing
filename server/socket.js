import { WebSocketServer } from 'ws'
import { send, parse } from './utils/socket.js'
import { handleInput } from './handlers/input.js'
import { handleJoin } from './handlers/join.js'
import { handleKick } from './handlers/kick.js'
import { handleStartGame } from './handlers/startGame.js'
import { removePlayerFromRoom } from './services/rooms.service.js'
import { handleReturnToLobby } from './handlers/returnToLobby.js'

let wss
export const initSocket = (server) => {
    wss = new WebSocketServer({ server })

    wss.on('connection', (ws) => {

        ws.on('message', (data) => {
            let parsed
            try {
                parsed = parse(data)

                switch (parsed.type) {
                    case 'join_room':
                        handleJoin(ws, parsed)
                        break
                    case 'input':
                        handleInput(ws, parsed)
                        break
                    case 'kick_player':
                        handleKick(ws, parsed)
                        break
                    case 'start_game':
                        handleStartGame(ws, parsed)
                        break
                }
            } catch (err) {
                console.error(`error handling ${parsed?.type}:`, err.message)
                send(ws, { type: 'error', error: err.message })
            }
        })

        ws.on('close', () => {
            removePlayerFromRoom(ws.room, ws.id)

        })
    })

    wss.on('close', () => {
    })
}

export const getSocketServer = () => {
    if (!wss) throw new Error('wss not initialized')
    return wss
}