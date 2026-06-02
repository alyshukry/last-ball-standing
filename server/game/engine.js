import { players, bodies } from './state.js'
import Matter from 'matter-js'

const { Engine, World, Bodies, Body, Events } = Matter

export const engine = Engine.create()
engine.gravity.y = 1.25

export const buildArena = () => {
    console.log('Arena built successfully.')
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

export const balls = new Map()

export const addPlayer = (id, x, y) => {
    const ball = Bodies.circle(x, y, 20, { restitution: 1, frictionAir: 0.0005 })
    ball.player = id
    balls.set(id, ball)
    World.add(engine.world, ball)

    players.set(id, { x: x, y: y, vx: 0, vy: 0 })
}

export const removePlayer = (id) => {
    const ball = balls.get(id)
    if (ball) {
        World.remove(engine.world, ball)
        balls.delete(id)
    }

    players.delete(id)
}

export const applyInput = (id, x, y) => {
    const ball = balls.get(id)
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