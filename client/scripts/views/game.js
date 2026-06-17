import { state } from '../state.js'
import { ws } from '../socket.js'
import { on } from '../events.js'
import { renderHtmlBall } from '../main.js'

const canvas = document.querySelector('#game-canvas')
const ctx = canvas.getContext('2d')
ctx.imageSmoothingEnabled = false

let t = 0
let atlasFrame = 0

// toggle animation frame every 500ms
setInterval(() => { atlasFrame = atlasFrame === 0 ? 1 : 0 }, 250)

const loadImage = (src) => {
    const img = new Image()
    img.src = src
    return img
}

const atlases = {
    colors: [loadImage('/assets/avatar/colors0.png'), loadImage('/assets/avatar/colors1.png')],
    eyes: [loadImage('/assets/avatar/eyes0.png'), loadImage('/assets/avatar/eyes1.png')],
    mouths: [loadImage('/assets/avatar/mouths0.png'), loadImage('/assets/avatar/mouths1.png')],
}

const drawSprite = (atlas, index, x, y) => {
    const img = atlases[atlas][atlasFrame]
    const col = index % 4
    const row = Math.floor(index / 4)
    ctx.drawImage(img, col * 64, row * 64, 64, 64, x - 24, y - 24, 48, 48)
}

const rectTiles = loadImage('../../assets/arena/rect.png')
const circleSprites = {
    8: loadImage('/assets/arena/circle8.png'),
    12: loadImage('/assets/arena/circle12.png'),
    16: loadImage('/assets/arena/circle16.png'),
    20: loadImage('/assets/arena/circle20.png'),
    24: loadImage('/assets/arena/circle24.png'),
    28: loadImage('/assets/arena/circle28.png'),
    32: loadImage('/assets/arena/circle32.png'),
    40: loadImage('/assets/arena/circle40.png'),
}

function renderBody(body) {
    ctx.save()
    ctx.translate(body.x, body.y)
    ctx.rotate(body.options.angle || 0)

    switch (body.shape) {
        case 'rect': {
            const T = 6 // tile size
            const w = body.width
            const h = body.height

            const drawTile = (sx, sy, dx, dy, dw, dh) => {
                ctx.drawImage(rectTiles, sx, sy, T, T, dx, dy, dw, dh)
            }

            const x = -w / 2
            const y = -h / 2

            // corners
            drawTile(0, 0, x, y, T, T) // top-left
            drawTile(T * 2, 0, x + w - T, y, T, T) // top-right
            drawTile(0, T * 2, x, y + h - T, T, T) // bottom-left
            drawTile(T * 2, T * 2, x + w - T, y + h - T, T, T) // bottom-right

            // edges (stretched)
            drawTile(T, 0, x + T, y, w - T * 2, T) // top
            drawTile(T, T * 2, x + T, y + h - T, w - T * 2, T) // bottom
            drawTile(0, T, x, y + T, T, h - T * 2) // left
            drawTile(T * 2, T, x + w - T, y + T, T, h - T * 2) // right

            // center
            drawTile(T, T, x + T, y + T, w - T * 2, h - T * 2)
            break
        }
        case 'circle':
            const img = circleSprites[body.radius]
            if (img) ctx.drawImage(img, -body.radius, -body.radius)
            break
    }

    ctx.restore()
}

let animationId = null

function render() {
    t = Math.min((Date.now() - state.lastUpdate) / (1000 / 30), 1)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.scale(canvas.width / state.worldDimensions.width, canvas.height / state.worldDimensions.height)

    for (const body of state.arena) renderBody(body)

    for (const [id, player] of Object.entries(state.currentState.players || {})) {
        const prev = state.prevState.players?.[id]
        const x = prev ? prev.x + (player.x - prev.x) * t : player.x
        const y = prev ? prev.y + (player.y - prev.y) * t : player.y
        const info = state.playersInfo[id]
        if (!info) continue

        // triangle indicator for own ball
        if (id === state.myId) {
            ctx.beginPath()
            ctx.moveTo(x, y - 35)
            ctx.lineTo(x - 6, y - 45)
            ctx.lineTo(x + 6, y - 45)
            ctx.closePath()
            ctx.fillStyle = 'white'
            ctx.fill()
        }

        drawSprite('colors', info.color ?? 0, x, y)
        drawSprite('eyes', info.eyes ?? 0, x, y)
        drawSprite('mouths', info.mouth ?? 0, x, y)
    }

    ctx.restore()
    requestAnimationFrame(render)
}

export const startRender = () => { render() }
export const stopRender = () => { cancelAnimationFrame(animationId) }

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
const winText = document.querySelector('#win-screen h1')
const winnerAvatar = document.querySelector('#winner-avatar')
on('round_end', (data) => {
    const winner = state.playersInfo[data.winner]

    renderHtmlBall(winnerAvatar, winner?.color, winner?.eyes, winner?.mouth, 5)

    winText.textContent = state.playersInfo[data.winner]?.username + ' wins'
    winScreen.style.display = 'flex'
})

on('round_start', () => {
    winScreen.style.display = 'none'
    startRender()
})

on('back_to_lobby', () => stopRender())