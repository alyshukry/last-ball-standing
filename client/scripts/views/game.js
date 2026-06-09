import { BALL_RADIUS } from '../../../server/game/constants.js'
import { ws, state } from '../socket.js'

const canvas = document.querySelector('canvas#game')
const ctx = canvas.getContext('2d')

let t = 0

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
    t = Math.min((Date.now() - state.lastUpdate) / (1000 / 30), 1)

    const canvasBg = getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg').trim()
    ctx.fillStyle = canvasBg
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (const body of state.arena) renderBody(body)

    for (const [id, player] of Object.entries(state.currentState.players || {})) {
        const prev = state.prevState.players?.[id]
        const x = prev ? prev.x + (player.x - prev.x) * t : player.x
        const y = prev ? prev.y + (player.y - prev.y) * t : player.y

        ctx.beginPath()
        ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = state.playersInfo[id]?.color ?? 'black'
        ctx.fill()
    }

    requestAnimationFrame(render)
}
render()

const keyMap = { w: true, a: true, s: true, d: true }
const keysPressed = new Set()

setInterval(() => {
    let x = 0, y = 0
    if (keysPressed.has('w')) y -= 1
    if (keysPressed.has('s')) y += 1
    if (keysPressed.has('a')) x -= 1
    if (keysPressed.has('d')) x += 1

    if ((x !== 0 || y !== 0) && ws.readyState === WebSocket.OPEN)
        ws.send(JSON.stringify({ type: 'input', x, y }))
}, 1000 / 30)

window.addEventListener('keydown', (e) => { if (keyMap[e.key.toLowerCase()]) keysPressed.add(e.key.toLowerCase()) })
window.addEventListener('keyup', (e) => keysPressed.delete(e.key.toLowerCase()))