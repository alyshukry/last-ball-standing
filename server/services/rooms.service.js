import { randomInt, randomUUID } from 'crypto'
import { buildArena, removePlayer, addPlayer } from '../game/world.js'
import { checkRound, startRound } from '../game/round.js'
import Matter from 'matter-js'
import { startLoop } from '../game/loop.js'

const { Engine, Events } = Matter

const rooms = new Map()

export const createRoom = ({ name, password, arenas }) => {
    const token = randomInt(10).toString() // creator sends to server to verify room ownership on ws connection
    const engine = Engine.create()
    const grounded = new Set()

    const room = {
        id: randomInt(10).toString(),
        name,
        password: password || null,
        owner: null, // wait for token
        token,
        arenas,
        players: new Map(),
        round: { status: 'LOBBY', number: 0, winner: null, wins: new Map() },
        lobbyTimeout: null,
        engine,
        grounded
    }
    rooms.set(room.id, room)

    Events.on(engine, 'collisionStart', (e) => {
        for (const pair of e.pairs) {
            const { bodyA, bodyB, collision } = pair
            const normal = collision.normal

            if (bodyA.isStatic && normal.y > -0.5) grounded.add(bodyB.player)
            if (bodyB.isStatic && normal.y < 0.5) grounded.add(bodyA.player)
        }
    })
    Events.on(engine, 'collisionEnd', (e) => {
        for (const pair of e.pairs) {
            const { bodyA, bodyB } = pair
            if (bodyA.isStatic) grounded.delete(bodyB.player)
            if (bodyB.isStatic) grounded.delete(bodyA.player)
        }
    })
    buildArena(room)

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
        room.lobbyTimeout = setTimeout(() => { startRound(room) }, 5000)

    if (room.players.size <= 1) startLoop(room)

    return true
}

export const removePlayerFromRoom = (roomId, playerId) => {
    const room = rooms.get(roomId)

    removePlayer(room, playerId)

    if (room.players.size >= 1 && room.lobbyTimeout) {
        clearTimeout(room.lobbyTimeout)
        room.lobbyTimeout = null

        return
    }
    checkRound(room)
}

export const verifyOwnerToken = (roomId, playerId, token) => {
    const room = rooms.get(roomId)

    if (room.token === token) {
        room.owner = player
        return true
    }
    return false
}