import { showView, API_URL, renderHtmlBall, AVATAR_COLORS, AVATAR_EYES, AVATAR_MOUTHS } from '../main.js'
import { joinRoom } from '../views/rooms.js'

let color = parseInt(localStorage.getItem('color')) || Math.floor(Math.random() * AVATAR_COLORS)
let eyes = parseInt(localStorage.getItem('eyes')) || Math.floor(Math.random() * AVATAR_EYES)
let mouth = parseInt(localStorage.getItem('mouth')) || Math.floor(Math.random() * AVATAR_MOUTHS)

const updateBall = () => {
    localStorage.setItem('color', color)
    localStorage.setItem('eyes', eyes)
    localStorage.setItem('mouth', mouth)
    renderHtmlBall(document.querySelector('#ball-preview'), color, eyes, mouth, 2)
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