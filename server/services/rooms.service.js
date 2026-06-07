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

export const addPlayerToRoom = (room, player, password, color, username) => {
    if (!room) return false
    if (room.password && room.password !== password) return false
    addPlayer(
        rooms.get(room),
        player,
        Math.floor(Math.random() * 1000),
        300,
        color,
        username
    )

    if (rooms.get(room).round.status === 'LOBBY' && rooms.get(room).players.size === 2)
        rooms.get(room).lobbyTimeout = setTimeout(() => { startRound(rooms.get(room)) }, 5000)

    if (rooms.get(room).players.size <= 1) startLoop(rooms.get(room))

    return true
}

export const removePlayerFromRoom = (room, player) => {
    removePlayer(rooms.get(room), player)

    if (rooms.get(room).players.size >= 1 && rooms.get(room).lobbyTimeout) {
        clearTimeout(rooms.get(room).lobbyTimeout)
        rooms.get(room).lobbyTimeout = null

        return
    }
    checkRound(getFullRoom(room))
}

export const verifyOwnerToken = (room, token, player) => {
    if (rooms.get(room).token === token) {
        rooms.get(room).owner = player
        return true
    }
    return false
}