import { showView, API_URL, renderHtmlBall, AVATAR_COLORS, AVATAR_EYES, AVATAR_MOUTHS } from '../main.js'
import { joinRoom } from '../views/rooms.js'

let color = parseInt(localStorage.getItem('color')) || 0
let eyes = parseInt(localStorage.getItem('eyes')) || 0
let mouth = parseInt(localStorage.getItem('mouth')) || 0

const updateBall = () => {
    localStorage.setItem('color', color)
    localStorage.setItem('eyes', eyes)
    localStorage.setItem('mouth', mouth)
    renderHtmlBall(document.querySelector('#ball-preview'), color, eyes, mouth, 3)
}
updateBall()

document.querySelector('#color-left').addEventListener('click', () => {
    color = (color - 1 + AVATAR_COLORS) % AVATAR_COLORS
    updateBall()
})
document.querySelector('#color-right').addEventListener('click', () => {
    color = (color + 1) % AVATAR_COLORS
    updateBall()
})
document.querySelector('#eyes-left').addEventListener('click', () => {
    eyes = (eyes - 1 + AVATAR_EYES) % AVATAR_EYES
    updateBall()
})
document.querySelector('#eyes-right').addEventListener('click', () => {
    eyes = (eyes + 1) % AVATAR_EYES
    updateBall()
})
document.querySelector('#mouth-left').addEventListener('click', () => {
    mouth = (mouth - 1 + AVATAR_MOUTHS) % AVATAR_MOUTHS
    updateBall()
})
document.querySelector('#mouth-right').addEventListener('click', () => {
    mouth = (mouth + 1) % AVATAR_MOUTHS
    updateBall()
})

const usernameInput = document.querySelector('#username')

usernameInput.addEventListener('input', () => {
    localStorage.setItem('username', usernameInput.value)
})

usernameInput.value = localStorage.getItem('username') || ''

document.querySelector('button#join-room').addEventListener('click', () => {
    showView('rooms')
})

document.querySelector('button#join-room').addEventListener('click', (e) => {
    showView('rooms')
})

document.querySelector('button#create-room').onclick = (e) => {
    const form = document.createElement('form')
    form.innerHTML = `
        <label for="name">Room Name:</label>
        <input type="text" id="name" name="name">
        <label for="password">Password:</label>
        <input type="text" id="password" name="password">
        <input type="submit" value="Join room">
    `
    document.querySelector('button#create-room').appendChild(form)
    document.querySelector('button#create-room').onclick = () => { }

    form.addEventListener('submit', async (e) => {
        e.preventDefault()  // stop page reload
        const name = e.target.name.value || null
        const password = e.target.password.value || null

        const res = await fetch(window.location.protocol + '//' + API_URL + '/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name, password, arenas: [
                    {
                        "bodies": [
                            { "shape": "rect", "x": 500, "y": 490, "width": 1000, "height": 20, "options": { "isStatic": 1, "restitution": 0.3 }, "color": "rgb(50, 50, 50)" },
                            { "shape": "rect", "x": 200, "y": 370, "width": 220, "height": 18, "options": { "isStatic": 1, "restitution": 0.4 }, "color": "rgb(100, 160, 220)" },
                            { "shape": "rect", "x": 800, "y": 370, "width": 220, "height": 18, "options": { "isStatic": 1, "restitution": 0.4 }, "color": "rgb(100, 160, 220)" },
                            { "shape": "rect", "x": 500, "y": 260, "width": 180, "height": 18, "options": { "isStatic": 1, "restitution": 0.4 }, "color": "rgb(100, 160, 220)" },
                            { "shape": "circle", "x": 500, "y": 440, "radius": 40, "options": { "isStatic": 1, "restitution": 0.9 }, "color": "rgb(220, 80, 80)" }
                        ],
                        "spawns": [
                            { "x": 200, "y": 330 },
                            { "x": 800, "y": 330 },
                            { "x": 380, "y": 220 },
                            { "x": 620, "y": 220 }
                        ]
                    },
                    {
                        "bodies": [
                            { "shape": "rect", "x": 150, "y": 490, "width": 280, "height": 20, "options": { "isStatic": 1, "restitution": 0.3 }, "color": "rgb(50, 50, 50)" },
                            { "shape": "rect", "x": 850, "y": 490, "width": 280, "height": 20, "options": { "isStatic": 1, "restitution": 0.3 }, "color": "rgb(50, 50, 50)" },
                            { "shape": "rect", "x": 500, "y": 420, "width": 160, "height": 18, "options": { "isStatic": 1, "restitution": 0.3 }, "color": "rgb(50, 50, 50)" },
                            { "shape": "circle", "x": 250, "y": 340, "radius": 35, "options": { "isStatic": 1, "restitution": 0.85 }, "color": "rgb(80, 200, 120)" },
                            { "shape": "circle", "x": 750, "y": 340, "radius": 35, "options": { "isStatic": 1, "restitution": 0.85 }, "color": "rgb(80, 200, 120)" },
                            { "shape": "circle", "x": 500, "y": 220, "radius": 28, "options": { "isStatic": 1, "restitution": 0.95 }, "color": "rgb(220, 180, 40)" },
                            { "shape": "rect", "x": 370, "y": 290, "width": 140, "height": 15, "options": { "isStatic": 1, "restitution": 0.4 }, "color": "rgb(180, 100, 200)" },
                            { "shape": "rect", "x": 630, "y": 290, "width": 140, "height": 15, "options": { "isStatic": 1, "restitution": 0.4 }, "color": "rgb(180, 100, 200)" }
                        ],
                        "spawns": [
                            { "x": 150, "y": 450 },
                            { "x": 850, "y": 450 },
                            { "x": 370, "y": 250 },
                            { "x": 630, "y": 250 }
                        ]
                    },
                    {
                        "bodies": [
                            { "shape": "rect", "x": 500, "y": 490, "width": 1000, "height": 20, "options": { "isStatic": 1, "restitution": 0.2 }, "color": "rgb(50, 50, 50)" },
                            { "shape": "rect", "x": 120, "y": 390, "width": 160, "height": 18, "options": { "isStatic": 1, "restitution": 0.3, "angle": 0.4 }, "color": "rgb(200, 120, 60)" },
                            { "shape": "rect", "x": 880, "y": 390, "width": 160, "height": 18, "options": { "isStatic": 1, "restitution": 0.3, "angle": -0.4 }, "color": "rgb(200, 120, 60)" },
                            { "shape": "circle", "x": 320, "y": 350, "radius": 30, "options": { "isStatic": 1, "restitution": 0.8 }, "color": "rgb(60, 160, 220)" },
                            { "shape": "circle", "x": 680, "y": 350, "radius": 30, "options": { "isStatic": 1, "restitution": 0.8 }, "color": "rgb(60, 160, 220)" },
                            { "shape": "rect", "x": 500, "y": 310, "width": 200, "height": 18, "options": { "isStatic": 1, "restitution": 0.4 }, "color": "rgb(200, 60, 80)" },
                            { "shape": "circle", "x": 500, "y": 190, "radius": 50, "options": { "isStatic": 1, "restitution": 0.95 }, "color": "rgb(220, 200, 40)" }
                        ],
                        "spawns": [
                            { "x": 150, "y": 450 },
                            { "x": 850, "y": 450 },
                            { "x": 350, "y": 290 },
                            { "x": 650, "y": 290 }
                        ]
                    }
                ]
            })
        })

        if (!res.ok) {
            console.log(res)
            return
        }
        const data = await res.json()

        joinRoom(data.room.id, data.token, password)
    })
}