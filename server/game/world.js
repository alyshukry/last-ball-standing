import { getSocketServer } from '../socket.js'
import { send } from '../utils/socket.js'
import { BALL_RADIUS } from './constants.js'
import Matter from 'matter-js'

const { Engine, World, Bodies, Body, Events } = Matter

export const setUpRoom = (room) => {
    Events.on(room.physics.engine, 'collisionStart', (e) => {
        for (const pair of e.pairs) {
            const { bodyA, bodyB, collision } = pair
            const normal = collision.normal

            if (bodyA.isStatic && normal.y > -0.5) room.physics.grounded.add(bodyB.player)
            if (bodyB.isStatic && normal.y < 0.5) room.physics.grounded.add(bodyA.player)
        }
    })
    Events.on(room.physics.engine, 'collisionEnd', (e) => {
        for (const pair of e.pairs) {
            const { bodyA, bodyB } = pair
            if (bodyA.isStatic) room.physics.grounded.delete(bodyB.player)
            if (bodyB.isStatic) room.physics.grounded.delete(bodyA.player)
        }
    })
    buildArena(room, 0)
}

export const buildArena = (room, index) => {
    for (const client of getSocketServer().clients)
        if (client.room === room.id)
            send(client, {
                type: 'arena',
                bodies: room.arenas[room.round.number % room.arenas.length].bodies
            })

    World.remove(room.physics.engine.world, room.physics.engine.world.bodies.filter(b => b.isStatic)) // clear world

    for (const body of room.arenas[index].bodies) {
        switch (body.shape) {
            case 'rect':
                World.add(room.physics.engine.world, Bodies.rectangle(body.x, body.y, body.width, body.height, body.options))
                break
            case 'circle':
                World.add(room.physics.engine.world, Bodies.circle(body.x, body.y, body.radius, body.options))
                break
            case 'polygon':
                World.add(room.physics.engine.world, Bodies.polygon(body.x, body.y, body.sides, body.radius, body.options))
                break
            default:
                console.warn(`unknown body shape: ${body.shape}`);
        }
    }
}

export const addPlayer = (room, id, x, y, color, username) => {
    const ball = Bodies.circle(x, y, BALL_RADIUS, { restitution: 1, frictionAir: 0.0005, friction: 0 })
    ball.player = id
    World.add(room.physics.engine.world, ball)

    room.players.set(id, {
        id,
        color,
        username,
        ball,
        dead: true
    })

    killPlayer(room, id)
}

export const removePlayer = (room, id) => {
    if (room.players.get(id).ball)
        World.remove(room.physics.engine.world, room.players.get(id).ball)

    room.players.delete(id)
}

export const killPlayer = (room, id) => {
    const player = room.players.get(id)

    player.dead = true

    Body.setStatic(player.ball, true)
    Body.setPosition(player.ball, { x: -1000, y: -1000 })
}

export const revivePlayer = (room, id, playerIndex) => {
    const player = room.players.get(id)
    const arena = room.arenas[room.round.number % room.arenas.length]
    const spawn = arena.spawns[playerIndex % arena.spawns.length]
    const offset = Math.floor(playerIndex / arena.spawns.length) * 60

    Body.setVelocity(player.ball, { x: 0, y: 0 })
    Body.setPosition(player.ball, { x: spawn.x, y: spawn.y - offset })
    Body.setStatic(player.ball, false)

    player.dead = false
}

export const applyInput = (room, id, x, y) => {
    const ball = room.players.get(id).ball
    if (!ball) return
    if (x === 0 && y === 0) return

    Body.applyForce(ball, ball.position, {
        x: x * 0.00125,
        y: y < 0 && room.physics.grounded.has(id) && Math.abs(ball.velocity.y) < 2.5 ? -0.05 : y * 0.001
    })
}

export const update = (room) => {
    Engine.update(room.physics.engine, 1000 / 60)
}