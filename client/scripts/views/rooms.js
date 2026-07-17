import { API_URL } from '../main.js'
import { connectToRoom } from '../socket.js'

const roomsList = document.querySelector('ul#rooms-list')

async function displayRooms() {
    if (!localStorage.getItem('room') && !roomsList.querySelector('form')) {
        const res = await fetch(window.location.protocol + '//' + API_URL + '/rooms')

        if (!res.ok) {
            roomsList.innerHTML = 'Failed to reach server'
            return
        }
        const data = await res.json()

        if (data.length < 1) {
            roomsList.innerHTML = '<p id="no-rooms-found">No rooms found</p>'
            return
        }

        roomsList.innerHTML = ''
        for (let i = 0; i < data.length; i++) {
            const roomElement = document.createElement('li')

            roomElement.className = 'room'
            roomElement.innerHTML = `
                <p class="room-name">${data[i].name}</p><p class="room-player-count">${data[i].playerCount + ' ' + (data[i].playerCount === 1 ? 'players' : 'player')}</p>
            `
            roomElement.onclick = () => {
                if (data[i].hasPassword) {
                    const form = document.createElement('form')
                    form.innerHTML = `
                    <label for="password">Password:</label>
                    <input type="text" id="password" name="password">
                    <input type="submit" value="Join room">
                    `
                    form.addEventListener('submit', (e) => {
                        e.preventDefault()  // stop page reload
                        const password = e.target.password.value || null
                        joinRoom(data[i].id, null, password)
                    })

                    roomElement.appendChild(form)
                    roomElement.onclick = () => { }
                }
                else joinRoom(data[i].id)
            }

            roomsList.appendChild(roomElement)
        }
    }
}
displayRooms()
setInterval(displayRooms, 2500)

export const joinRoom = (id, token = null, password = null) => {
    connectToRoom(
        id,
        token,
        password,
        localStorage.getItem('color') || 0,
        localStorage.getItem('eyes') || 0,
        localStorage.getItem('mouth') || 0,
        localStorage.getItem('username') || 'guest'
    )
}