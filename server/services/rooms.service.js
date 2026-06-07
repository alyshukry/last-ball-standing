import { randomInt, randomUUID } from 'crypto'

const rooms = new Map()

export const createRoom = ({ name, password, arenas }) => {
    const token = randomUUID() // creator sends to server to verify room ownership on ws connection

    const room = {
        id: randomUUID(),
        name,
        password: password || null,
        owner: null, // wait for token
        token,
        arenas,
        status: 'LOBBY',
        players: new Map(),
        round: { number: 0, winner: null, wins: new Map() },
        lobbyTimeout: null
    }
    rooms.set(room.id, room)
    return { room: serialize(room), token }
}

export const getRooms = () => Array.from(rooms.values()).map(serialize)
export const getRoom = (id) => rooms.get(id)
export const deleteRoom = (id) => rooms.delete(id)

const serialize = (room) => ({
    id: room.id,
    name: room.name,
    hasPassword: !!room.password,
    owner: room.owner,
    playerCount: room.players.size
})

export const addPlayerToRoom = (room, player, password, color, username) => {
    if (!room) return false
    if ((!!password && !!room.password) && room.password === password) {
        addPlayer(
            room,
            player,
            Math.floor(Math.random() * 1000),
            300,
            color,
            username
        )

        if (rooms.get(room).round.status === 'LOBBY' && rooms.get(room).players.size === 2)
            rooms.get(room).lobbyTimeout = setTimeout(() => { startRound() }, 5000)

        if (rooms.get(room).players.size <= 1) startLoop()

        return true
    }
    return false
}

export const verifyOwnerToken = (room, token, player) => {
    if (rooms.get(room).token === token) {
        rooms.get(room).owner = player
        return true
    }
    return false
}