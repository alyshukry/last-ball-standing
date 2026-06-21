import { getSocketServer } from '../socket.js'
import { send, broadcastToRoom } from '../utils/socket.js'
import { BALL_RADIUS } from './constants.js'
import Matter from 'matter-js'

const { Engine, World, Bodies, Body, Events } = Matter

export const setUpRoom = (room) => {
    Events.on(room.physics.engine, 'collisionStart', (e) => {
        for (const pair of e.pairs) {
            const { bodyA, bodyB, collision } = pair
            const normal = collision.normal

            // If one body is static (ground) and the other is a player ball, allow that player to jump.
            if (bodyA.isStatic && bodyB.player !== undefined) {
                const p = room.players.get(bodyB.player)
                if (p && normal.y > -0.5) p.canJump = true
            }

            if (bodyB.isStatic && bodyA.player !== undefined) {
                const p = room.players.get(bodyA.player)
                if (p && normal.y < 0.5) p.canJump = true
            }
        }
    })

    buildArena(room, 0)
    room.physics.engine.gravity.y = 1.5
}

export const buildArena = (room, index) => {
    broadcastToRoom(room.id, {
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

export const addPlayer = (room, id, x, y, color, eyes, mouth, username) => {
    const ball = Bodies.circle(x, y, BALL_RADIUS, { restitution: 1, frictionAir: 0.0005, friction: 0 })
    ball.player = id
    World.add(room.physics.engine.world, ball)

    room.players.set(id, {
        id,
        color,
        eyes,
        mouth,
        username,
        ball,
        dead: true,
        canJump: false
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

    Body.setVelocity(player.ball, { x: 0, y: 0 })
    Body.setStatic(player.ball, true)
    Body.setPosition(player.ball, { x: -1000, y: -1000 })
}

export const revivePlayer = (room, id, playerIndex) => {
    const player = room.players.get(id)
    const arena = room.arenas[room.round.number % room.arenas.length]
    const start = Math.floor(Math.random() * arena.spawns.length)
    const spawn = arena.spawns[(playerIndex + start) % arena.spawns.length]
    const offset = Math.floor(playerIndex / arena.spawns.length) * 60

    Body.setVelocity(player.ball, { x: 0, y: 0 })
    Body.setPosition(player.ball, { x: spawn.x, y: spawn.y - offset })
    Body.setStatic(player.ball, false)

    player.dead = false
}

export const applyInput = (room, id, x, y) => {
    const player = room.players.get(id)
    const ball = player.ball
    if (!ball) return

    if (x === 0 && y === 0) return

    x = x > 0 ? 1 : x < 0 ? -1 : 0
    y = y > 0 ? 1 : y < 0 ? -1 : 0

    Body.applyForce(ball, ball.position, {
        x: x * 0.00125,
        y: y * 0.001
    })

}

export const applyMove = (room, id, move) => {
    const player = room.players.get(id)
    const ball = player.ball
    if (!ball) return

    if (move === 'jump' && player.canJump && Math.abs(ball.velocity.y) < 25) {
        Body.applyForce(ball, ball.position, {
            x: 0,
            y: -.125
        })
        player.canJump = false
    }
}

export const update = (room) => {
    Engine.update(room.physics.engine, 1000 / 120)
}