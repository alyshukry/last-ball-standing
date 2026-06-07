import { randomInt, randomUUID } from 'crypto'
import { buildArena, removePlayer, addPlayer, setUpRoom } from '../game/world.js'
import { checkRound, startRound } from '../game/round.js'
import Matter from 'matter-js'
import { startLoop } from '../game/loop.js'

const { Engine, Events } = Matter

const rooms = new Map()

export const createRoom = ({ name, password, arenas }) => {
    const token = randomInt(10).toString() // creator sends to server to verify room ownership on ws connection

    const room = {
        id: randomInt(10).toString(),
        name,
        password: password || null,
        owner: null, // wait for token
        token,
        arenas,
        players: new Map(),
        round: {
            status: 'LOBBY',
            number: 0,
            winner: null,
            wins: new Map(),
            lobbyTimeout: null
        },
        physics: {
            engine: Engine.create(),
            grounded: new Set()
        }
    }
    rooms.set(room.id, room)

    setUpRoom(room)
    startLoop(room)

    return { room: serialize(room), token }
}

export const getRooms = () => Array.from(rooms.values()).map(serialize)
export const getRoom = (id) => serialize(rooms.get(id))
export const deleteRoom = (id) => rooms.delete(id)

const serialize = (room) => ({
    id: room.id,
    name: room.name,
    hasPassword: !!room.password,
    owner: room.owner,
    playerCount: room.players.size,
    arenas: room.arenas
})

export const getFullRoom = (id) => rooms.get(id)

export const addPlayerToRoom = (roomId, playerId, password, color, username) => {
    const room = rooms.get(roomId)

    if (!room) return false
    if (room.password && room.password !== password) return false
    addPlayer(
        room,
        playerId,
        Math.floor(Math.random() * 1000),
        300,
        color,
        username
    )

    if (room.round.status === 'LOBBY' && room.players.size === 2)
        room.round.lobbyTimeout = setTimeout(() => { startRound(room) }, 5000)

    return true
}

export const removePlayerFromRoom = (roomId, playerId) => {
    if (!roomId || !playerId) return
    const room = rooms.get(roomId)

    removePlayer(room, playerId)

    if (room.players.size >= 1 && room.round.lobbyTimeout) {
        clearTimeout(room.round.lobbyTimeout)
        room.round.lobbyTimeout = null

        return
    }
    checkRound(room)
}

export const verifyOwnerToken = (roomId, playerId, token) => {
    const room = rooms.get(roomId)

    if (room.token === token) {
        room.owner = playerId
        return true
    }
    return false
}