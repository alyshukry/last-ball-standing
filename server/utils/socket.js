import { getSocketServer } from '../socket.js'

export const send = (socket, data) => {
    socket.send(JSON.stringify(data))
}

export const parse = (data) => {
    return JSON.parse(data.toString())
}

export const broadcastToRoom = (roomId, data) => {
    for (const client of getSocketServer().clients)
        if (client.room === roomId)
            client.send(JSON.stringify(data))
}