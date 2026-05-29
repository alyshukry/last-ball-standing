const ws = new WebSocket('ws://localhost:8000')

const keyMap = {
    w: { type: 'input', x: 0, y: -1 },
    a: { type: 'input', x: -1, y: 0 },
    s: { type: 'input', x: 0, y: 1 },
    d: { type: 'input', x: 1, y: 0 },
}

const keysPressed = new Set()

function sendInput() {
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
}

window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase()
    if (keyMap[key]) {
        keysPressed.add(key)
        sendInput()
    }
})

window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase()
    keysPressed.delete(key)
    sendInput()
})

const canvas = document.getElementById('main')
const ctx = canvas.getContext('2d')

let prevState = {}
let currentState = {}
let playersInfo = {}
let lastUpdate = Date.now()

ws.onopen = () => console.log('yo')
ws.onclose = () => console.log('bye')
ws.onmessage = (e) => {
    const parsed = JSON.parse(e.data)

    switch (parsed.type) {
        case 'state': {
            prevState = currentState
            currentState = parsed
            lastUpdate = Date.now()
            t = 0
        }; break
        case 'player_info': {
            playersInfo[parsed.id] = { color: parsed.color }
        }; break
    }

}

function render() {
    t = (Date.now() - lastUpdate) / (1000 / 20) // server tickrate

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const [id, player] of Object.entries(currentState.players || {})) {
        const prev = prevState.players?.[id]
        const x = prev ? prev.x + (player.x - prev.x) * t : player.x
        const y = prev ? prev.y + (player.y - prev.y) * t : player.y

        ctx.beginPath()
        ctx.arc(x, y, 30, 0, Math.PI * 2)
        ctx.fillStyle = playersInfo[id]?.color ?? 'black'
        ctx.fill()
    }

    requestAnimationFrame(render)
}
render()