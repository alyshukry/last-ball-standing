import { state } from '../state.js'
import { ws } from '../socket.js'
import { on } from '../events.js'

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
            ctx.rotate((body.options.angle || 0) + Math.PI / body.sides)
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

    ctx.save()
    ctx.scale(2, 2)

    for (const body of state.arena) renderBody(body)

    for (const [id, player] of Object.entries(state.currentState.players || {})) {
        const prev = state.prevState.players?.[id]
        const x = prev ? prev.x + (player.x - prev.x) * t : player.x
        const y = prev ? prev.y + (player.y - prev.y) * t : player.y

        // triangle indicator
        if (id === state.myId) {
            ctx.beginPath()
            ctx.moveTo(x, y - 35)
            ctx.lineTo(x - 6, y - 45)
            ctx.lineTo(x + 6, y - 45)
            ctx.closePath()
            ctx.fillStyle = state.playersInfo[id]?.color ?? 'white'
            ctx.fill()
        }

        // ball
        ctx.beginPath()
        ctx.arc(x, y, 25, 0, Math.PI * 2)
        ctx.fillStyle = state.playersInfo[id]?.color ?? 'black'
        ctx.fill()
    }

    ctx.restore()
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

    if ((x !== 0 || y !== 0) && ws?.readyState === WebSocket.OPEN)
        ws.send(JSON.stringify({ type: 'input', x, y }))
}, 1000 / 60)

window.addEventListener('keydown', (e) => { if (keyMap[e.key.toLowerCase()]) keysPressed.add(e.key.toLowerCase()) })
window.addEventListener('keyup', (e) => keysPressed.delete(e.key.toLowerCase()))

const winScreen = document.querySelector('#win-screen')
const winText = document.querySelector('#win-text')

on('round_end', (data) => {
    winText.textContent = state.playersInfo[data.winner].username + ' wins'
    winScreen.style.display = 'flex'
})

on('round_start', () => {
    winScreen.style.display = 'none'
})