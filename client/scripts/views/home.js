import { showView } from '../main.js'

document.querySelector('button#join-room').addEventListener('click', (e) => {
    showView('rooms')
})