import { BALL_RADIUS } from '../server/game/constants.js'

const ws = new WebSocket('ws://192.168.1.44:8000')

const keyMap = {
    w: { type: 'input', x: 0, y: -1 },
    a: { type: 'input', x: -1, y: 0 },
    s: { type: 'input', x: 0, y: 1 },
    d: { type: 'input', x: 1, y: 0 },
}

const keysPressed = new Set()

setInterval(() => {
    let x = 0, y = 0

    if (keysPressed.has('w')) y -= 1
    if (keysPressed.has('s')) y += 1
    if (keysPressed.has('a')) x -= 1
    if (keysPressed.has('d')) x += 1

    if (x !== 0 || y !== 0) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'input', x, y }))
        }
    }
}, 1000 / 30)

window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase()
    if (keyMap[key]) {
        keysPressed.add(key)
    }
})

window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase()
    keysPressed.delete(key)
})

const canvas = document.getElementById('main')
const ctx = canvas.getContext('2d')

let prevState = {}
let currentState = {}
let playersInfo = {}
let lastUpdate = Date.now()
let t = 0
let arena = []

ws.onopen = () => console.log('yo')
ws.onclose = () => console.log('bye')
ws.onmessage = (e) => {
    const parsed = JSON.parse(e.data)

    switch (parsed.type) {
        case 'state': {
            prevState = currentState
            currentState = parsed
            lastUpdate = Date.now()
        }; break
        case 'player_info': {
            playersInfo[parsed.id] = { color: parsed.color }
        }; break
        case 'arena': {
            arena = parsed.bodies
        }; break
    }

}

function renderBody(body) {
    ctx.save()
    ctx.translate(body.x, body.y)
    ctx.rotate(body.options.angle || 0)
    ctx.fillStyle = body.color || 'gray'

    switch (body.shape) {
        case 'rect':
            ctx.fillRect(-body.width / 2, -body.height / 2, body.width, body.height)
            break
        case 'circle':
            ctx.beginPath()
            ctx.arc(0, 0, body.radius, 0, Math.PI * 2)
            ctx.fill()
            break
        case 'polygon':
            ctx.beginPath()
            for (let i = 0; i < body.sides; i++) {
                const angle = (i / body.sides) * Math.PI * 2
                const px = Math.cos(angle) * body.radius
                const py = Math.sin(angle) * body.radius
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
            }
            ctx.closePath()
            ctx.fill()
            break
    }

    ctx.restore()
}

function render() {
    t = Math.min((Date.now() - lastUpdate) / (1000 / 30), 1) // server tickrate

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const body of arena) renderBody(body)

    for (const [id, player] of Object.entries(currentState.players || {})) {
        const prev = prevState.players?.[id]
        const x = prev ? prev.x + (player.x - prev.x) * t : player.x
        const y = prev ? prev.y + (player.y - prev.y) * t : player.y

        ctx.beginPath()
        ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = playersInfo[id]?.color ?? 'black'
        ctx.fill()
    }

    requestAnimationFrame(render)
}
render()