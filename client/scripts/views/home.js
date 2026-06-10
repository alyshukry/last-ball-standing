import { showView, API_URL } from '../main.js'
import { joinRoom } from '../views/rooms.js'

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

        const res = await fetch('http://' + API_URL + '/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name, password, arenas: [
                    {
                        "bodies": [
                            { "shape": "rect", "x": 500, "y": 480, "width": 1000, "height": 20, "options": { "isStatic": 1, "restitution": 0.4 }, "color": "rgb(60, 60, 60)" },
                            { "shape": "circle", "x": 500, "y": 300, "radius": 60, "options": { "isStatic": 1, "restitution": 0.9 }, "color": "rgb(220, 80, 80)" },
                            { "shape": "rect", "x": 150, "y": 380, "width": 200, "height": 15, "options": { "isStatic": 1, "restitution": 0.5 }, "color": "rgb(180, 180, 60)" },
                            { "shape": "rect", "x": 850, "y": 380, "width": 200, "height": 15, "options": { "isStatic": 1, "restitution": 0.5 }, "color": "rgb(180, 180, 60)" },
                            { "shape": "rect", "x": 300, "y": 220, "width": 150, "height": 15, "options": { "isStatic": 1, "restitution": 0.5, "angle": -0.3 }, "color": "rgb(180, 180, 60)" },
                            { "shape": "rect", "x": 700, "y": 220, "width": 150, "height": 15, "options": { "isStatic": 1, "restitution": 0.5, "angle": 0.3 }, "color": "rgb(180, 180, 60)" }
                        ],
                        "spawns": [
                            { "x": 150, "y": 340 },
                            { "x": 850, "y": 340 },
                            { "x": 300, "y": 180 },
                            { "x": 700, "y": 180 }
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