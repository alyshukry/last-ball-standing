import { BALL_RADIUS } from './constants.js'
import Matter from 'matter-js'

const { Engine, World, Bodies, Body, Events } = Matter

export const buildArena = (room) => {
    for (const body of room.arenas[0]) {
        switch (body.shape) {
            case 'rect':
                World.add(room.engine.world, Bodies.rectangle(body.x, body.y, body.width, body.height, body.options))
                break
            case 'circle':
                World.add(room.engine.world, Bodies.circle(body.x, body.y, body.radius, body.options))
                break
            case 'polygon':
                World.add(room.engine.world, Bodies.polygon(body.x, body.y, body.sides, body.radius, body.options))
                break
            default:
                console.warn(`unknown body shape: ${body.shape}`);
        }
    }
}

export const addPlayer = (room, id, x, y, color, username) => {
    if (!room.engine) room.engine = Engine.create()

    const ball = Bodies.circle(x, y, BALL_RADIUS, { restitution: 1, frictionAir: 0.0005, friction: 0 })
    ball.player = id
    World.add(room.engine.world, ball)

    room.players.set(id, {
        id,
        color,
        username,
        ball,
        dead: true
    })
}

export const removePlayer = (room, id) => {
    if (room.players.get(id).ball)
        World.remove(room.engine.world, room.players.get(id).ball)

    room.players.delete(id)
}

export const killPlayer = (room, id) => {
    const player = room.players.get(id)

    player.dead = true

    Body.setStatic(player.ball, true)
    Body.setPosition(player.ball, { x: -1000, y: -1000 })
}

export const revivePlayer = (room, id) => {
    const player = room.players.get(id)

    Body.setVelocity(player.ball, { x: 0, y: 0 })
    Body.setPosition(player.ball, { x: Math.floor(Math.random() * 1000), y: 100 })
    Body.setStatic(player.ball, false)

    player.dead = false
}

export const applyInput = (room, id, x, y) => {
    const ball = room.players.get(id).ball
    if (!ball) return
    if (x === 0 && y === 0) return

    Body.applyForce(ball, ball.position, {
        x: x * 0.00125,
        y: y < 0 && room.grounded.has(id) && Math.abs(ball.velocity.y) < 2.5 ? -0.05 : y * 0.001
    })
}

export const update = (room) => {
    Engine.update(room.engine, 1000 / 60)
}