import { showView, API_URL, renderHtmlBall, AVATAR_COLORS, AVATAR_EYES, AVATAR_MOUTHS } from '../main.js'
import { joinRoom } from '../views/rooms.js'

let color = parseInt(localStorage.getItem('color')) || Math.floor(Math.random() * AVATAR_COLORS)
let eyes = parseInt(localStorage.getItem('eyes')) || Math.floor(Math.random() * AVATAR_EYES)
let mouth = parseInt(localStorage.getItem('mouth')) || Math.floor(Math.random() * AVATAR_MOUTHS)

const updateBall = () => {
    localStorage.setItem('color', color)
    localStorage.setItem('eyes', eyes)
    localStorage.setItem('mouth', mouth)
    renderHtmlBall(document.querySelector('#ball-preview'), color, eyes, mouth, 2.5)
}

updateBall()

document.querySelectorAll('.arrow').forEach((button) => {
    button.addEventListener('click', () => {
        const delta = button.classList.contains('left') ? -1 : 1

        if (button.classList.contains('color'))
            color = (color + delta + AVATAR_COLORS) % AVATAR_COLORS
        if (button.classList.contains('eyes'))
            eyes = (eyes + delta + AVATAR_EYES) % AVATAR_EYES
        if (button.classList.contains('mouth'))
            mouth = (mouth + delta + AVATAR_MOUTHS) % AVATAR_MOUTHS

        updateBall()
    })
})

document.querySelector('button#random').addEventListener('click', () => {
    color = Math.floor(Math.random() * AVATAR_COLORS)
    eyes = Math.floor(Math.random() * AVATAR_EYES)
    mouth = Math.floor(Math.random() * AVATAR_MOUTHS)
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
                            { "shape": "rect", "x": 500, "y": 468, "width": 980, "height": 24, "options": { "isStatic": 1, "restitution": 0.3 } },
                            { "shape": "rect", "x": 500, "y": 300, "width": 480, "height": 24, "options": { "isStatic": 1, "restitution": 0.3 } },
                            { "shape": "circle", "x": 260, "y": 300, "radius": 12, "options": { "isStatic": 1, "restitution": 0.3 } },
                            { "shape": "circle", "x": 740, "y": 300, "radius": 12, "options": { "isStatic": 1, "restitution": 0.3 } },
                            { "shape": "circle", "x": 500, "y": 175, "radius": 32, "options": { "isStatic": 1, "restitution": 0.3 } }
                        ],
                        "spawns": [
                            { "x": 58, "y": 444 },
                            { "x": 942, "y": 444 },
                            { "x": 692, "y": 264 },
                            { "x": 130, "y": 444 },
                            { "x": 872, "y": 444 },
                            { "x": 308, "y": 264 }
                        ]
                    },
                    {
                        "bodies": [
                            { "shape": "rect", "x": 150, "y": 468, "width": 200, "height": 24, "options": { "isStatic": 1, "restitution": 0.3 } },
                            { "shape": "rect", "x": 350, "y": 378, "width": 200, "height": 24, "options": { "isStatic": 1, "restitution": 0.3 } },
                            { "shape": "rect", "x": 650, "y": 288, "width": 200, "height": 24, "options": { "isStatic": 1, "restitution": 0.3 } },
                            { "shape": "rect", "x": 850, "y": 198, "width": 200, "height": 24, "options": { "isStatic": 1, "restitution": 0.3 } },
                            { "shape": "circle", "x": 850, "y": 450, "radius": 40, "options": { "isStatic": 1, "restitution": 0.9 } },
                            { "shape": "circle", "x": 150, "y": 150, "radius": 40, "options": { "isStatic": 1, "restitution": 0.9 } }
                        ],
                        "spawns": [
                            { "x": 80, "y": 430 },
                            { "x": 220, "y": 430 },
                            { "x": 350, "y": 340 },
                            { "x": 650, "y": 250 },
                            { "x": 800, "y": 160 },
                            { "x": 900, "y": 160 }
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

const createBannerBalls = (container, count, scale = 1) => {
    container.replaceChildren()

    const safeCount = Math.max(0, Math.floor(count))
    const colorCount = Math.max(1, AVATAR_COLORS - 4)

    for (let index = 0; index < safeCount; index++) {
        const ball = document.createElement('div')
        ball.className = 'ball'
        container.appendChild(ball)

        const color = safeCount <= 1
            ? 0
            : Math.round(index * (colorCount - 1) / (safeCount - 1))
        const eyes = Math.floor(Math.random() * AVATAR_EYES)
        const mouth = Math.floor(Math.random() * AVATAR_MOUTHS)

        renderHtmlBall(ball, color, eyes, mouth, scale)
    }
}

createBannerBalls(document.querySelector('#banner #balls-container'), 10, 1)