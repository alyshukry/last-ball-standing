import { BALL_RADIUS } from './constants.js'
import { players, bodies, round } from './state.js'
import Matter from 'matter-js'

const { Engine, World, Bodies, Body, Events } = Matter

export const engine = Engine.create()
engine.gravity.y = 1.25

export const buildArena = () => {
    for (const body of bodies) {
        switch (body.shape) {
            case 'rect':
                World.add(engine.world, Bodies.rectangle(body.x, body.y, body.width, body.height, body.options))
                break
            case 'circle':
                World.add(engine.world, Bodies.circle(body.x, body.y, body.radius, body.options))
                break
            case 'polygon':
                World.add(engine.world, Bodies.polygon(body.x, body.y, body.sides, body.radius, body.options))
                break
            default:
                console.warn(`unknown body shape: ${body.shape}`);
        }
    }
}

const grounded = new Set()

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

export const addPlayer = (id, x, y, color, username) => {
    const ball = Bodies.circle(x, y, BALL_RADIUS, { restitution: 1, frictionAir: 0.0005, friction: 0 })
    ball.player = id
    World.add(engine.world, ball)

    players.set(id, {
        id: id,
        color: color,
        username: username,
        ball: ball,
        dead: true
    })
}

export const removePlayer = (id) => {
    if (players.get(id).ball)
        World.remove(engine.world, players.get(id).ball)

    players.delete(id)
}

export const killPlayer = (id) => {
    const player = players.get(id)

    player.dead = true

    Body.setStatic(player.ball, true)
    Body.setPosition(player.ball, { x: -1000, y: -1000 })
}

export const revivePlayer = (id) => {
    const player = players.get(id)

    Body.setVelocity(player.ball, { x: 0, y: 0 })
    Body.setPosition(player.ball, { x: Math.floor(Math.random() * 1000), y: 100 })
    Body.setStatic(player.ball, false)

    player.dead = false
}

export const applyInput = (id, x, y) => {
    const ball = players.get(id).ball
    if (!ball) return
    if (x === 0 && y === 0) return

    Body.applyForce(ball, ball.position, {
        x: x * 0.00125,
        y: y < 0 && grounded.has(id) && Math.abs(ball.velocity.y) < 2.5 ? -0.05 : y * 0.001
    })
}

export const update = () => {
    Engine.update(engine, 1000 / 60)
}