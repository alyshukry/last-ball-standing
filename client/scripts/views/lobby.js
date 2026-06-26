import { on } from '../events.js'
import { renderHtmlBall, showView } from '../main.js'
import { ws } from '../socket.js'
import { state } from '../state.js'

const playerList = document.querySelector('#players-list')

const renderPlayers = () => {
    playerList.innerHTML = ''
    for (const [id, info] of Object.entries(state.playersInfo)) {
        const li = document.createElement('li')

        const ball = document.createElement('div')
        renderHtmlBall(ball, info.color, info.eyes, info.mouth)

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

on('joined', () => {
    showView('lobby')
    renderPlayers()
})
on('player_info', () => renderPlayers())
on('player_left', () => renderPlayers())
on('back_to_lobby', () => {
    showView('lobby')
    renderPlayers()
})
on('round_start', () => showView('game'))
on('ownership_update', (data) => {
    const isOwner = data.is_owner

    const startGameButton = document.querySelector('button#start-game')
    isOwner ? startGameButton.classList.remove('hidden') : startGameButton.classList.add('hidden')
})

document.querySelector('button#start-game').addEventListener('click', () => {
    ws.send(JSON.stringify({
        type: 'start_game',
        starter: state.myId
    }))
})