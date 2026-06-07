import { WebSocketServer } from 'ws'
import { send, parse } from './utils/socket.js'
import { handleInput } from './handlers/input.js'
import { handleJoin } from './handlers/join.js'
import { removePlayerFromRoom } from './services/rooms.service.js'

let wss
export const initSocket = (server) => {
    wss = new WebSocketServer({ server })

    wss.on('connection', (ws) => {

        ws.on('message', (data) => {
            const parsed = parse(data)

            switch (parsed.type) {
                case 'join_room': handleJoin(ws, parsed); break
                case 'input': handleInput(ws, parsed); break
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