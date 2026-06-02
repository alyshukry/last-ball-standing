import { players } from './state.js'
import Matter from 'matter-js'

const { Engine, World, Bodies, Body, Events } = Matter

export const engine = Engine.create()
engine.gravity.y = 1.25

const floor = Bodies.rectangle(500, 500, 1000, 20, { isStatic: true, restitution: 0.99 })
World.add(engine.world, floor)

const grounded = new Set()

Events.on(engine, 'collisionStart', (e) => {
    for (const pair of e.pairs) {
        const { bodyA, bodyB, collision } = pair
        const normal = collision.normal

        if (bodyA.isStatic && normal.y > -0.5) grounded.add(bodyB.playerId)
        if (bodyB.isStatic && normal.y < 0.5) grounded.add(bodyA.playerId)
    }
})

Events.on(engine, 'collisionEnd', (e) => {
    for (const pair of e.pairs) {
        const { bodyA, bodyB } = pair
        if (bodyA.isStatic) grounded.delete(bodyB.playerId)
        if (bodyB.isStatic) grounded.delete(bodyA.playerId)
    }
})

export const bodies = new Map()

export const addPlayer = (id, x, y) => {
    const body = Bodies.circle(x, y, 20, { restitution: 1, frictionAir: 0.0005 })
    body.playerId = id
    bodies.set(id, body)
    World.add(engine.world, body)
}

export const removePlayer = (id) => {
    const body = bodies.get(id)
    if (body) {
        World.remove(engine.world, body)
        bodies.delete(id)
    }
}

export const applyInput = (id, x, y) => {
    const body = bodies.get(id)
    if (!body) return
    if (x === 0 && y === 0) return

    Body.applyForce(body, body.position, {
        x: x * 0.00125,
        y: y < 0 && grounded.has(id) && Math.abs(body.velocity.y) < 2.5 ? -0.05 : y * 0.001
    })
}

export const update = () => {
    Engine.update(engine, 1000 / 60)
}