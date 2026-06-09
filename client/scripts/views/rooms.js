import { API_URL } from '../main.js'

const roomsList = document.querySelector('ul#rooms-list')

async function displayRooms() {
    if (!localStorage.getItem('room') && !roomsList.querySelector('form')) {
        const res = await fetch('http://' + API_URL + '/rooms')

        if (!res.ok) {
            roomsList.innerHTML = 'Failed to reach server'
            return
        }
        const data = await res.json()

        if (data.length < 1) {
            roomsList.innerHTML = 'No rooms'
            return
        }

        roomsList.innerHTML = ''
        for (let i = 0; i < data.length; i++) {
            const roomElement = document.createElement('li')

            roomElement.className = 'room'
            roomElement.innerHTML = data[i].name
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
                        attemptJoin(data[i].id, password)
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

const attemptJoin = (id, password) => {
    console.log(id, password)
}