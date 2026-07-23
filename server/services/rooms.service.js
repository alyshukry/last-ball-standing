import { randomInt, randomUUID } from 'crypto'
import { buildArena, removePlayer, addPlayer, setUpRoom } from '../game/world.js'
import { checkRound, returnToLobby, startRound } from '../game/round.js'
import Matter from 'matter-js'
import { startLoop } from '../game/loop.js'
import { broadcastToRoom, send } from '../utils/socket.js'
import { getSocketServer } from '../socket.js'
import { AppError } from '../utils/errors.js'

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
        timeouts: {
            inactivity: null,
            lobby: null,
            start: null
        },
        intervals: {
            game: null,
            broadcast: null
        },
        round: {
            status: 'LOBBY',
            number: 0,
            winner: null,
            wins: new Map(),
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
export const deleteRoom = (roomId) => {
    const room = getFullRoom(roomId)
    if (!room) return

    Object.values(room.intervals).forEach(clearInterval)
    Object.values(room.timeouts).forEach(clearTimeout)

    rooms.delete(roomId)
}

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

    if (!room) throw new AppError('Room not found', 'room_not_found', true)
    if (room.password && room.password !== password) throw new AppError('Incorrect room password', 'incorrect_room_password', true)

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

    if (room.players.size >= 1)
        clearTimeout(room.timeouts.inactivity)

    return 'ok'
}

export const removePlayerFromRoom = (roomId, playerId) => {
    if (!roomId || !playerId) throw new AppError('Room ID and or user ID not provided', 'missing_id')

    const room = rooms.get(roomId)
    if (!room.players.get(playerId)) return

    if (!room) throw new AppError('Room not found', 'room_not_found')
    if (!room.players.get(playerId)) throw new AppError('Player does not exist', 'player_not_found')

    removePlayer(room, playerId)

    broadcastToRoom(roomId, {
        type: 'player_left',
        id: playerId
    })

    if (playerId === room.owner) {
        room.owner = room.players.keys().next().value || null
        for (const client of getSocketServer().clients) {
            if (client.room === room.id)
                send(client, {
                    type: 'ownership_update',
                    is_owner: client.id === room.owner
                })
        }
    }

    if (room.players.size === 1 && room.timeouts.lobby) {
        clearTimeout(room.timeouts.lobby)
        room.timeouts.lobby = null

        return
    }

    if (room.players.size === 0)
        room.timeouts.inactivity = setTimeout(() => { try { deleteRoom(roomId) } catch (err) { console.error('Delete room error: ' + err) } }, 5 * 60 * 1000)

    checkRound(room)
}

export const kickPlayerFromRoom = (roomId, playerId, ownerId) => {
    if (!roomId || !playerId || !ownerId) throw new AppError('Room ID and or user ID and or owner ID not provided', 'missing_id')
    const room = rooms.get(roomId)

    if (!room) throw new AppError('Room not found', 'room_not_found')
    if (!room.players.get(playerId)) throw new AppError('Player does not exist', 'player_not_found')
    if (playerId === ownerId) throw new AppError('Cannot kick self', 'invalid_kick')
    if (ownerId !== room.owner) throw new AppError('Wrong room owner ID', 'no_permission')

    for (const client of getSocketServer().clients)
        if (client.id === playerId) {
            send(client, {
                type: 'kicked',
                by: room.players.get(ownerId).username
            })
            removePlayerFromRoom(roomId, client.id)
            client.close(4001, 'kicked')
        }
}

export const verifyOwnerToken = (roomId, playerId, token) => {
    const room = rooms.get(roomId)

    if (!room) throw new AppError('Room not found', 'room_not_found')

    if (room.token === token) {
        room.owner = playerId
        return true
    }
    return false
}

export const startGame = (roomId, ownerId) => {
    const room = rooms.get(roomId)

    if (!room) throw new AppError('Room not found', 'room_not_found')
    if (ownerId !== room.owner) throw new AppError('User is not room owner', 'not_owner')
    if (room.timeouts.start) throw new AppError('Game is already starting', 'game_already_starting')

    const countdown = 5000

    if (room.round.status === 'LOBBY') {
        broadcastToRoom(roomId, {
            type: 'start_game_countdown',
            duration: countdown
        })

        room.timeouts.start = setTimeout(() => {
            try {
                startRound(room, true)
                room.timeouts.start = null
            }
            catch (err) { console.error('Start round error: ' + err) }
        }, countdown)
    }
}

export const returnRoomToLobby = (roomId, ownerId) => {
    const room = rooms.get(roomId)

    if (!room) throw new AppError('Room not found', 'room_not_found')
    if (ownerId !== room.owner) throw new AppError('User is not room owner', 'not_owner')

    returnToLobby(room)
}