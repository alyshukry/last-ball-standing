import { on } from '../events.js'
import { renderHtmlBall, showView } from '../main.js'
import { ws } from '../socket.js'
import { state } from '../state.js'

let countdownInterval = null
const countdownElement = document.querySelector('#start-game-countdown')

const startGameCountdown = (duration) => {
    duration /= 1000

    if (!countdownElement) return

    clearInterval(countdownInterval)

    let remaining = Math.max(0, Math.floor(duration))
    countdownElement.innerText = `Starting game in ${remaining.toString()} seconds...`

    if (remaining <= 0) return

    countdownInterval = setInterval(() => {
        remaining -= 1
        countdownElement.innerText = `Starting game in ${remaining.toString()} seconds...`

        if (remaining <= 0) {
            clearInterval(countdownInterval)
        }
    }, 1000)
}

const playerList = document.querySelector('#players-list')

const renderPlayers = () => {
    playerList.innerHTML = ''
    for (const [id, info] of Object.entries(state.playersInfo)) {
        const li = document.createElement('li')

        const ball = document.createElement('div')
        renderHtmlBall(ball, info.color, info.eyes, info.mouth, '5rem')

        li.textContent = info.username || 'guest'
        li.dataset.userId = id
        li.appendChild(ball)
        playerList.appendChild(li)

        if (li.dataset.userId !== state.myId)
            li.addEventListener('click', () => {
                ws.send(JSON.stringify({
                    type: 'kick_player',
                    player: id
                }))
            })
    }
}

document.querySelector('button#start-game').addEventListener('click', () => {
    ws.send(JSON.stringify({
        type: 'start_game'
    }))
})

on('joined', () => {
    showView('lobby')
    renderPlayers()
})

on('player_info', () => renderPlayers())

on('player_left', () => renderPlayers())

on('back_to_lobby', () => {
    countdownElement.innerText = 'Waiting for owner to start...'
    showView('lobby')
    renderPlayers()
})
on('round_start', () => showView('game'))

on('ownership_update', (data) => {
    const isOwner = data.is_owner

    const startGameButton = document.querySelector('button#start-game')
    isOwner ? startGameButton.classList.remove('hidden') : startGameButton.classList.add('hidden')
})

on('start_game_countdown', (data) => {
    startGameCountdown(data.duration)
})

on('kicked', (data) => {
    showView('home')
})