import { randomInt, randomUUID } from 'crypto'
import { buildArena, removePlayer, addPlayer, setUpRoom } from '../game/world.js'
import { checkRound, startRound } from '../game/round.js'
import Matter from 'matter-js'
import { startLoop } from '../game/loop.js'
import { broadcastToRoom } from '../utils/socket.js'

const { Engine, Events } = Matter

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
        players: new Map(),
        inactivityTimeout: null,
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

export const addPlayerToRoom = (roomId, playerId, password, color, eyes, mouth, username) => {
    const room = rooms.get(roomId)

    if (!room) return 'room_not_found'
    if (room.password && room.password !== password) return 'incorrect_password'

    addPlayer(
        room,
        playerId,
        Math.floor(Math.random() * 1000),
        300,
        color,
        eyes,
        mouth,
        username
    )

    if (room.round.status === 'LOBBY' && room.players.size === 2)
        room.round.lobbyTimeout = setTimeout(() => {
            startRound(room)
            room.round.lobbyTimeout = null
        }, 5000)

    if (room.players.size >= 1)
        clearTimeout(room.inactivityTimeout)

    return 'ok'
}

export const removePlayerFromRoom = (roomId, playerId) => {
    if (!roomId || !playerId) return
    const room = rooms.get(roomId)
    if (!room) return
    if (!getFullRoom(roomId).players.get(playerId)) return

    removePlayer(room, playerId)

    broadcastToRoom(roomId, {
        type: 'player_left',
        id: playerId
    })

    if (playerId === room.owner) {
        room.owner = room.players[0]
        broadcastToRoom(roomId, {
            type: 'ownership_update',
            owner: room.owner
        })
    }

    if (room.players.size === 1 && room.round.lobbyTimeout) {
        clearTimeout(room.round.lobbyTimeout)
        room.round.lobbyTimeout = null

        return
    }

    if (room.players.size === 0)
        room.inactivityTimeout = setTimeout(() => { deleteRoom(roomId) }, 5 * 60 * 1000)

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