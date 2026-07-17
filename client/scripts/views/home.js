import { showView, API_URL, renderHtmlBall, AVATAR_COLORS, AVATAR_EYES, AVATAR_MOUTHS, ARENAS, SPRITE_SIZE } from '../main.js'
import { joinRoom } from '../views/rooms.js'

let color = parseInt(localStorage.getItem('color')) || Math.floor(Math.random() * AVATAR_COLORS)
let eyes = parseInt(localStorage.getItem('eyes')) || Math.floor(Math.random() * AVATAR_EYES)
let mouth = parseInt(localStorage.getItem('mouth')) || Math.floor(Math.random() * AVATAR_MOUTHS)

const updateBall = () => {
    localStorage.setItem('color', color)
    localStorage.setItem('eyes', eyes)
    localStorage.setItem('mouth', mouth)
    renderHtmlBall(document.querySelector('#ball-preview'), color, eyes, mouth, '10rem')
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

const createRoomButton = document.querySelector('button#create-room')
const joinButtons = document.querySelector('#join-buttons')

const renderCreateRoomButton = () => {
    const button = document.createElement('button')
    button.id = 'create-room'
    button.type = 'button'
    button.textContent = 'Create room'

    button.addEventListener('click', () => {
        button.replaceWith(renderCreateRoomForm())
    })

    return button
}

const renderCreateRoomForm = () => {
    const form = document.createElement('form')
    form.className = 'create-room-form'
    form.innerHTML = `
        <label for="room-name">Room name:</label>
        <input type="text" id="room-name" name="name" placeholder="">
        <label for="room-password">Password:</label>
        <input type="text" id="room-password" name="password" placeholder="Optional">
        <div class="create-room-actions">
            <button type="submit" class="submit">Create</button>
            <button type="button" class="cancel">Cancel</button>
        </div>
    `

    form.querySelector('button.cancel').addEventListener('click', (e) => {
        e.preventDefault()
        form.replaceWith(renderCreateRoomButton())
    })

    form.addEventListener('submit', async (e) => {
        e.preventDefault()  // stop page reload
        const name = e.target.name.value || null
        const password = e.target.password.value || null

        const res = await fetch(window.location.protocol + '//' + API_URL + '/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password, arenas: ARENAS })
        })

        if (!res.ok) {
            console.log(res)
            return
        }
        const data = await res.json()

        joinRoom(data.room.id, data.token, password)
    })

    return form
}

joinButtons.replaceChild(renderCreateRoomButton(), createRoomButton)

const createBannerBalls = (container, count, size = `${SPRITE_SIZE}px`) => {
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

        renderHtmlBall(ball, color, eyes, mouth, size)
    }
}

const bannerBallCount = 9
createBannerBalls(document.querySelector('#banner #balls-container'), bannerBallCount, `${document.querySelector('#banner').getBoundingClientRect().width / (bannerBallCount * 1.5)}px`)